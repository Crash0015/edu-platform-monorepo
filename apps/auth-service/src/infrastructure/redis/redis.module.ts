import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RateLimiterService } from './rate-limiter.service';

@Module({
  imports: [ConfigModule],
  providers: [RedisService, RateLimiterService],
  exports: [RedisService, RateLimiterService],
})
export class RedisModule {}
