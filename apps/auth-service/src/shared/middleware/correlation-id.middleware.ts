import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CORRELATION_ID_HEADER } from '../constants/headers.constants';
import { RequestWithCorrelation } from '../types/request-context';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(request: RequestWithCorrelation, response: Response, next: () => void) {
    const headerValue = request.headers[CORRELATION_ID_HEADER];
    const correlationId =
      (typeof headerValue === 'string' && headerValue.trim()) || uuidv4();

    request.correlationId = correlationId;
    response.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  }
}
