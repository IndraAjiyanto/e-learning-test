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
      const exceptionResponse: unknown = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const resMsg = (exceptionResponse as { message?: unknown }).message;
        message = Array.isArray(resMsg)
          ? resMsg.map(String).join(', ')
          : typeof resMsg === 'string'
            ? resMsg
            : message;
      }
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
      Boolean(
        (exception as unknown as { storageErrors?: unknown })?.storageErrors,
      );

    if (isFileError) {
      const isAjax =
        request.xhr ||
        (request.headers.accept &&
          request.headers.accept.includes('application/json')) ||
        request.path?.includes('upload-image') ||
        request.path?.includes('fetch-image');

      if (isAjax) {
        return response.status(400).json({ success: 0, message: message });
      }

      (
        request as Request & { flash?: (key: string, val: string) => void }
      ).flash?.('error', message);
      const referer = request.get('Referer') || '/';
      return response.redirect(referer);
    }

    throw exception;
  }
}
