import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { CORRELATION_ID_HEADER } from '../constants/headers.constants';

type RequestWithCorrelation = {
  headers: Record<string, string | string[] | undefined>;
  correlationId?: string;
};

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(request: RequestWithCorrelation, response: Response, next: () => void) {
    const headerValue = request.headers[CORRELATION_ID_HEADER];
    const correlationId =
      (typeof headerValue === 'string' && headerValue.trim()) || randomUUID();

    request.correlationId = correlationId;
    response.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}
