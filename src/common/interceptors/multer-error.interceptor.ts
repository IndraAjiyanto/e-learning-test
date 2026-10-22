import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

interface MulterErrorLike {
  message?: string;
  storageErrors?: unknown;
}

@Injectable()
export class MulterErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: MulterErrorLike) => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const errMsg = String(error?.message || '').toLowerCase();
        if (
          error?.message &&
          (errMsg.includes('format file tidak valid') ||
            errMsg.includes('file') ||
            errMsg.includes('upload') ||
            error.storageErrors)
        ) {
          (
            request as unknown as { flash: (type: string, msg: string) => void }
          ).flash('error', error.message);

          const referer = request.get('Referer') || '/users/profile';
          response.redirect(referer);
          return of(null);
        }

        return throwError(() => error);
      }),
    );
  }
}
