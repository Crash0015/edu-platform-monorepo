import { Request } from 'express';

export interface RequestContext {
  correlationId: string;
  ip: string | null;
  userAgent: string | null;
}

export type RequestWithCorrelation = Request & {
  correlationId?: string;
  user?: {
    sub: string;
    email: string;
    roles?: string[];
  };
};
