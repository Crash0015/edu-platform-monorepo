import { Module } from '@nestjs/common';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from '../../application/materials/materials.service';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { StrapiModule } from '../../infrastructure/strapi/strapi.module';

@Module({
  imports: [KafkaModule, StrapiModule],
  controllers: [MaterialsController],
  providers: [MaterialsService],
})
export class MaterialsModule {}
