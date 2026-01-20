import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TutoringConfig } from '../../shared/config/tutoring-config';
import { ScheduleClient, ScheduleAvailability } from '../../application/sessions/ports/schedule.client';

@Injectable()
export class HttpScheduleClient implements ScheduleClient {
  constructor(private readonly httpService: HttpService, private readonly config: TutoringConfig) {}

  async listAvailability(
    teacherId: string,
    params?: {
      startTimeFrom?: string;
      startTimeTo?: string;
      status?: 'AVAILABLE' | 'BLOCKED';
    },
  ): Promise<ScheduleAvailability[]> {
    const baseUrl = this.config.scheduleServiceUrl;
    const url = `${baseUrl}/api/v1/schedule/availability/teacher/${teacherId}`;

    const response = await firstValueFrom(
      this.httpService.get(url, {
        params: {
          startTimeFrom: params?.startTimeFrom,
          startTimeTo: params?.startTimeTo,
          status: params?.status,
        },
      }),
    );

    return response.data as ScheduleAvailability[];
  }
}
