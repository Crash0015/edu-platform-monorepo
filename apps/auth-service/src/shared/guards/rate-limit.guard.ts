import { CanActivate, ExecutionContext, Injectable, TooManyRequestsException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';
import { CORRELATION_ID_HEADER } from '../constants/headers.constants';
import { RateLimiterService } from '../../infrastructure/redis/rate-limiter.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ip =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ??
      request.ip ??
      request.connection?.remoteAddress ??
      'unknown';

    const routeKey = `${options.key}:${ip}`;
    const allowed = await this.rateLimiter.check(routeKey, options.limit, options.windowSeconds);

    if (!allowed) {
      const correlationId = request.correlationId ?? request.headers[CORRELATION_ID_HEADER];
      throw new TooManyRequestsException({
        message: 'Rate limit exceeded',
        correlationId,
      });
    }

    return true;
  }
}
