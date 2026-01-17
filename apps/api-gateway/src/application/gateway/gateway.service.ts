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
}
