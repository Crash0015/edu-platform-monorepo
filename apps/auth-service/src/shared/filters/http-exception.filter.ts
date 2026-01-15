import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CORRELATION_ID_HEADER } from '../constants/headers.constants';
import { RequestWithCorrelation } from '../types/request-context';

const formatErrorName = (status: number) => {
  const name = HttpStatus[status] ?? 'INTERNAL_SERVER_ERROR';
  return name
    .toString()
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithCorrelation>();
    const correlationId = request.correlationId ?? request.headers[CORRELATION_ID_HEADER];

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else if (typeof payload === 'object' && payload !== null) {
        const payloadMessage = (payload as { message?: string | string[] }).message;
        const payloadDetails = (payload as { details?: unknown }).details;
        if (Array.isArray(payloadMessage)) {
          message = 'Validation failed';
          details = payloadMessage;
        } else if (payloadMessage) {
          message = payloadMessage;
        }
        if (payloadDetails) {
          details = payloadDetails;
        }
      }
    }

    response.status(status).json({
      error: formatErrorName(status),
      message,
      details,
      correlationId,
    });
  }
}
