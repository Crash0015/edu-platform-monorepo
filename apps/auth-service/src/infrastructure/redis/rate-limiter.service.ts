import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

const RATE_LIMIT_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if tonumber(current) == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
if tonumber(current) > tonumber(ARGV[2]) then
  return 0
end
return 1
`;

@Injectable()
export class RateLimiterService {
  constructor(private readonly redisService: RedisService) {}

  async check(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const namespacedKey = `rl:${key}`;
    const result = await this.redisService
      .getClient()
      .eval(RATE_LIMIT_SCRIPT, 1, namespacedKey, windowSeconds, limit);
    return result === 1;
  }
}
