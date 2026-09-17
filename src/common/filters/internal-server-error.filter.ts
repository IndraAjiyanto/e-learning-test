import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class InternalServerErrorExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status !== 500) {
        return response.status(status).json(exception.getResponse());
      }
    }

    console.error('Unhandled exception:', exception);

    response.status(500).render('500', {
      url: request.originalUrl,
      title: '500 Internal Server Error. Sorry something went wrong.',
    });
  }
}
