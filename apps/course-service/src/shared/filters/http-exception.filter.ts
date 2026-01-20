import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : { message: 'Internal server error' };

    const correlationId = request.headers['x-correlation-id'] || 'unknown';

    const errorResponse = {
      error: exception instanceof HttpException ? exception.name : 'InternalServerError',
      message: typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || 'An error occurred',
      details: typeof exceptionResponse === 'object' && 'message' in exceptionResponse && Array.isArray((exceptionResponse as any).message) ? (exceptionResponse as any).message : undefined,
      correlationId,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
