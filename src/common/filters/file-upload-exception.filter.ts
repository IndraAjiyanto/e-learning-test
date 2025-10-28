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

    // Check if error is related to file upload
    const isFileError =
      message.includes('Format file') ||
      message.includes('Ukuran file') ||
      message.includes('file') ||
      message.includes('upload') ||
      message.includes('Hanya') ||
      message.includes('diperbolehkan') ||
      message.includes('dimension') ||
      message.includes('image') ||
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
