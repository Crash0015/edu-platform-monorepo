import { Module } from '@nestjs/common';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService, AVAILABILITY_REPOSITORY } from '../../application/availability/availability.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { PrismaAvailabilityRepository } from '../../infrastructure/prisma/availability.repository';

@Module({
  imports: [PrismaModule, KafkaModule],
  controllers: [AvailabilityController],
  providers: [
    AvailabilityService,
    {
      provide: AVAILABILITY_REPOSITORY,
      useClass: PrismaAvailabilityRepository,
    },
  ],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
