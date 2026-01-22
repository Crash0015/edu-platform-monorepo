import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchController } from './search.controller';
import { ProjectionService, PROJECTION_REPOSITORY } from '../../application/search/projection.service';
import { MongoModule } from '../../infrastructure/mongo/mongo.module';
import { MongoProjectionRepository } from '../../infrastructure/mongo/projection.repository';

@Module({
  imports: [MongoModule, ConfigModule],
  controllers: [SearchController],
  providers: [
    ProjectionService,
    {
      provide: PROJECTION_REPOSITORY,
      useClass: MongoProjectionRepository,
    },
  ],
  exports: [ProjectionService],
})
export class SearchModule {}
