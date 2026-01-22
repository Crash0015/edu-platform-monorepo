import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CourseService, COURSE_REPOSITORY } from '../../application/courses/course.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { PrismaCourseRepository } from '../../infrastructure/prisma/course.repository';
import { CoursesResolver } from '../graphql/courses.resolver';

@Module({
  imports: [PrismaModule, KafkaModule],
  controllers: [CoursesController],
  providers: [
    CourseService,
    {
      provide: COURSE_REPOSITORY,
      useClass: PrismaCourseRepository,
    },
    CoursesResolver,
  ],
  exports: [CourseService],
})
export class CoursesModule {}
