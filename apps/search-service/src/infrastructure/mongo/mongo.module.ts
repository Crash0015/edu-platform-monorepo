import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoService } from './mongo.service';

@Module({
  imports: [ConfigModule],
  providers: [MongoService],
  exports: [MongoService],
})
export class MongoModule {}
