import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
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

        // Check if error is from Multer file validation
        if (
          error.message &&
          (error.message.includes('Format file tidak valid') ||
            error.message.includes('file') ||
            error.message.includes('upload') ||
            error.storageErrors)
        ) {
          // Set flash message
          (request as any).flash('error', error.message);

          // Redirect back
          const referer = request.get('Referer') || '/users/profile';
          response.redirect(referer);
          return throwError(() => new BadRequestException(error.message));
        }

        // If not file upload error, pass through
        return throwError(() => error);
      }),
    );
  }
}
