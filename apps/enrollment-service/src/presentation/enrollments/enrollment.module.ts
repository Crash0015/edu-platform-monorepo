import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from '../../application/enrollments/enrollment.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { ENROLLMENT_REPOSITORY } from '../../application/enrollments/enrollment.service';
import { PrismaEnrollmentRepository } from '../../infrastructure/prisma/enrollment.repository';
@Module({
  imports: [PrismaModule, KafkaModule],
  controllers: [EnrollmentController],
  providers: [
    EnrollmentService,
    {
      provide: ENROLLMENT_REPOSITORY,
      useClass: PrismaEnrollmentRepository,
    },
  ],
})
export class EnrollmentModule {}

