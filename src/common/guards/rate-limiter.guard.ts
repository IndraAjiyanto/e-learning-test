import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';
import { flashToastError } from '../utils/toast.util';

interface ClientRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private static readonly records = new Map<string, ClientRecord>();
  private static cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private readonly reflector: Reflector) {
    if (!RateLimiterGuard.cleanupTimer) {
      RateLimiterGuard.cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of RateLimiterGuard.records.entries()) {
          if (now > record.resetAt) {
            RateLimiterGuard.records.delete(key);
          }
        }
      }, 5 * 60 * 1000);
      RateLimiterGuard.cleanupTimer.unref();
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown_ip';

    const bodyEmail =
      typeof req.body?.email === 'string'
        ? req.body.email.toLowerCase().trim()
        : '';
    const clientKey = `${req.baseUrl || ''}${req.path}:${ip}${bodyEmail ? `:${bodyEmail}` : ''}`;

    const now = Date.now();
    const record = RateLimiterGuard.records.get(clientKey);

    if (!record || now > record.resetAt) {
      RateLimiterGuard.records.set(clientKey, {
        count: 1,
        resetAt: now + options.ttlSeconds * 1000,
      });
      return true;
    }

    record.count++;

    if (record.count > options.limit) {
      const remainingSeconds = Math.ceil((record.resetAt - now) / 1000);
      const errorMessage =
        options.message ||
        `Terlalu banyak permintaan. Silakan tunggu ${remainingSeconds} detik sebelum mencoba kembali.`;

      const isJson =
        req.xhr ||
        req.headers.accept?.includes('application/json') ||
        req.headers['content-type']?.includes('application/json');

      if (isJson) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: errorMessage,
            retryAfter: remainingSeconds,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      flashToastError(req, 'Terlalu Banyak Percobaan', errorMessage);
      const referer = req.headers.referer || req.originalUrl || '/login';
      res.redirect(referer);
      return false;
    }

    return true;
  }
}
