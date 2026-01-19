import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getAuthHealth() {
    const baseUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://localhost:3001');
    const response = await firstValueFrom(this.httpService.get(`${baseUrl}/health`));
    return response.data;
  }

  async assignEnrollment(payload: Record<string, unknown>, headers: Record<string, string>) {
    const baseUrl = this.configService.get<string>('ENROLLMENT_SERVICE_URL', 'http://localhost:3007');
    const response = await firstValueFrom(
      this.httpService.post(`${baseUrl}/api/v1/enrollments/assign`, payload, {
        headers,
      }),
    );
    return response.data;
  }
}

