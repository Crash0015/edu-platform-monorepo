import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AvailabilityModule } from './presentation/availability/availability.module';
import { HealthModule } from './presentation/health/health.module';
import { CorrelationIdMiddleware } from './shared/middleware/correlation-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3008),
        CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
        DATABASE_URL: Joi.string().required(),
        KAFKA_ENABLED: Joi.string().valid('true', 'false').default('true'),
        KAFKA_BROKERS: Joi.string().allow('').default(''),
        KAFKA_CLIENT_ID: Joi.string().default('schedule-service'),
        SWAGGER_ENABLED: Joi.string().valid('true', 'false').default('true'),
      }),
    }),
    AvailabilityModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
