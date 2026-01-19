import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './presentation/health.controller';
import { CoursesController } from './presentation/courses.controller';
import { CoursesService } from './application/courses.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [HealthController, CoursesController],
  providers: [CoursesService],
})
export class AppModule {}
