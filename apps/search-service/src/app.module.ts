import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchModule } from './presentation/search/search.module';
import { HealthModule } from './presentation/health/health.module';
import { CorrelationIdMiddleware } from './shared/middleware/correlation-id.middleware';
import { MongoModule } from './infrastructure/mongo/mongo.module';
import { KafkaModule } from './infrastructure/kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongoModule,
    KafkaModule,
    SearchModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
