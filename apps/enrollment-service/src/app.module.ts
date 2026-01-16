import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnrollmentModule } from './presentation/enrollments/enrollment.module';
import { HealthModule } from './presentation/health/health.module';
import { CorrelationIdMiddleware } from './shared/middleware/correlation-id.middleware';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { KafkaModule } from './infrastructure/kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    KafkaModule,
    EnrollmentModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
