import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (
      response.headersSent ||
      (response as unknown as { __redirected?: boolean }).__redirected
    ) {
      return;
    }

    const isAjax =
      request.xhr ||
      (request.headers.accept &&
        request.headers.accept.includes('application/json')) ||
      request.path?.includes('upload-image') ||
      request.path?.includes('fetch-image');

    if (isAjax) {
      return response.status(403).json({
        success: 0,
        message: 'Sesi login telah berakhir. Silakan login kembali.',
      });
    }

    response.redirect('/login');
  }
}
