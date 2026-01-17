import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { ProjectionService, PROJECTION_REPOSITORY } from '../../application/search/projection.service';
import { MongoModule } from '../../infrastructure/mongo/mongo.module';
import { MongoProjectionRepository } from '../../infrastructure/mongo/projection.repository';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';

@Module({
  imports: [MongoModule, KafkaModule],
  controllers: [SearchController],
  providers: [
    ProjectionService,
    {
      provide: PROJECTION_REPOSITORY,
      useClass: MongoProjectionRepository,
    },
  ],
})
export class SearchModule {}
