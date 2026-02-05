import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class MulterErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const errMsg = (error?.message || '').toString().toLowerCase();
        if (
          error.message &&
          (errMsg.includes('format file tidak valid') ||
            errMsg.includes('file') ||
            errMsg.includes('upload') ||
            error.storageErrors)
        ) {
          (request as any).flash('error', error.message);

          const referer = request.get('Referer') || '/users/profile';
          response.redirect(referer);
          return of(null);
        }

        return throwError(() => error);
      }),
    );
  }
}
