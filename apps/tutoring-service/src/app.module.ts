import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { SessionsModule } from './presentation/sessions/sessions.module';
import { HealthModule } from './presentation/health/health.module';
import { CorrelationIdMiddleware } from './shared/middleware/correlation-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3010),
        CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
        DATABASE_URL: Joi.string().required(),
        KAFKA_ENABLED: Joi.string().valid('true', 'false').default('true'),
        KAFKA_BROKERS: Joi.string().allow('').default(''),
        KAFKA_CLIENT_ID: Joi.string().default('tutoring-service'),
        SWAGGER_ENABLED: Joi.string().valid('true', 'false').default('true'),
        SCHEDULE_SERVICE_URL: Joi.string().default('http://schedule-service:3009'),
      }),
    }),
    SessionsModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
