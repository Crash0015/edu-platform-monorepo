import { ConfigService } from '@nestjs/config';

export class ScheduleConfig {
  private static instance: ScheduleConfig | null = null;

  private constructor(private readonly configService: ConfigService) {}

  static getInstance(configService: ConfigService): ScheduleConfig {
    if (!ScheduleConfig.instance) {
      ScheduleConfig.instance = new ScheduleConfig(configService);
    }
    return ScheduleConfig.instance;
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3008);
  }

  get corsOrigins(): string[] {
    return this.configService
      .get<string>('CORS_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get swaggerEnabled(): boolean {
    return this.configService.get<string>('SWAGGER_ENABLED', 'true') !== 'false';
  }

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL', '');
  }

  get kafkaBrokers(): string[] {
    return this.configService
      .get<string>('KAFKA_BROKERS', '')
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);
  }

  get kafkaEnabled(): boolean {
    return this.configService.get<string>('KAFKA_ENABLED', 'true') !== 'false';
  }

  get kafkaClientId(): string {
    return this.configService.get<string>('KAFKA_CLIENT_ID', 'schedule-service');
  }
}
