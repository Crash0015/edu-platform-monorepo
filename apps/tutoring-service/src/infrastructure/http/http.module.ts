import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpScheduleClient } from './schedule.client';
import { SCHEDULE_CLIENT } from '../../application/sessions/tutoring.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TutoringConfig } from '../../shared/config/tutoring-config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    {
      provide: TutoringConfig,
      useFactory: (configService: ConfigService) => TutoringConfig.getInstance(configService),
      inject: [ConfigService],
    },
    {
      provide: SCHEDULE_CLIENT,
      useClass: HttpScheduleClient,
    },
  ],
  exports: [SCHEDULE_CLIENT, TutoringConfig],
})
export class HttpClientModule {}
