import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException, Error)
export class FileUploadExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let message = 'Terjadi kesalahan saat upload file';

    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const msgLower = (message || '').toString().toLowerCase();

    const isFileError =
      msgLower.includes('format file') ||
      msgLower.includes('ukuran file') ||
      msgLower.includes('file') ||
      msgLower.includes('upload') ||
      msgLower.includes('hanya') ||
      msgLower.includes('diperbolehkan') ||
      msgLower.includes('dimension') ||
      msgLower.includes('image') ||
      (exception as any).storageErrors;

    if (isFileError) {
      (request as any).flash('error', message);

      const referer = request.get('Referer') || '/';

      return response.redirect(referer);
    }

    throw exception;
  }
}
