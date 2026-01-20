import { ConfigService } from '@nestjs/config';

export class MaterialConfig {
  private static instance: MaterialConfig | null = null;

  private constructor(private readonly configService: ConfigService) {}

  static getInstance(configService: ConfigService): MaterialConfig {
    if (!MaterialConfig.instance) {
      MaterialConfig.instance = new MaterialConfig(configService);
    }
    return MaterialConfig.instance;
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3012);
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

  get strapiUrl(): string {
    return this.configService.get<string>('STRAPI_URL', 'http://localhost:1337');
  }

  get strapiToken(): string {
    return this.configService.get<string>('STRAPI_API_TOKEN', '');
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
    return this.configService.get<string>('KAFKA_CLIENT_ID', 'material-service');
  }
}
