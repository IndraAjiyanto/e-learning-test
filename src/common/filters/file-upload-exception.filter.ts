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

    // Get error message
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

    // Normalize to lowercase for case-insensitive checks
    const msgLower = (message || '').toString().toLowerCase();

    // Check if error is related to file upload (case-insensitive)
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
      // Set flash message
      (request as any).flash('error', message);

      // Get referer or default route
      const referer = request.get('Referer') || '/';

      // Redirect back
      return response.redirect(referer);
    }

    // If not file upload error, throw to global exception handler
    throw exception;
  }
}
