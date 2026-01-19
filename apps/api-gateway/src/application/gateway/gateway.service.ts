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
    return this.getFromService('AUTH_SERVICE_URL', 'http://localhost:3001', '/health');
  }

  async login(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/login',
      payload,
      headers,
    );
  }

  async register(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/register',
      payload,
      headers,
    );
  }

  async loginMfa(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/login/mfa',
      payload,
      headers,
    );
  }

  async refresh(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/refresh',
      payload,
      headers,
    );
  }

  async logout(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/logout',
      payload,
      headers,
    );
  }

  async forgotPassword(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/password/forgot',
      payload,
      headers,
    );
  }

  async resetPassword(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/password/reset',
      payload,
      headers,
    );
  }

  async me(headers: Record<string, string>) {
    return this.getFromService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/me',
      headers,
    );
  }

  async setupMfa(headers: Record<string, string>) {
    return this.postToService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/mfa/setup',
      {},
      headers,
    );
  }

  async verifyMfa(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/mfa/verify',
      payload,
      headers,
    );
  }

  async disableMfa(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
      '/api/v1/auth/mfa/disable',
      payload,
      headers,
    );
  }

  async assignEnrollment(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'ENROLLMENT_SERVICE_URL',
      'http://localhost:3007',
      '/api/v1/enrollments/assign',
      payload,
      headers,
    );
  }

  async getCourse(id: string, headers: Record<string, string>) {
    return this.getFromService(
      'COURSE_SERVICE_URL',
      'http://localhost:3003',
      `/api/v1/courses/${id}`,
      headers,
    );
  }

  async getUser(id: string, headers: Record<string, string>) {
    return this.getFromService(
      'USER_SERVICE_URL',
      'http://localhost:3002',
      `/api/v1/users/${id}`,
      headers,
    );
  }

  async enqueueEmail(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'NOTIFICATION_SERVICE_URL',
      'http://localhost:3006',
      '/api/v1/notifications/email',
      payload,
      headers,
    );
  }

  async queueAutomation(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTOMATION_SERVICE_URL',
      'http://localhost:3008',
      '/api/v1/automation/queue',
      payload,
      headers,
    );
  }

  async publishAutomation(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTOMATION_SERVICE_URL',
      'http://localhost:3008',
      '/api/v1/automation/publish',
      payload,
      headers,
    );
  }

  private getServiceUrl(key: string, fallback: string) {
    return this.configService.get<string>(key, fallback);
  }

  private async postToService(
    key: string,
    fallback: string,
    path: string,
    payload: Record<string, unknown>,
    headers: Record<string, string>,
  ) {
    const baseUrl = this.getServiceUrl(key, fallback);
    const response = await firstValueFrom(
      this.httpService.post(`${baseUrl}${path}`, payload, { headers }),
    );
    return response.data;
  }

  private async getFromService(
    key: string,
    fallback: string,
    path: string,
    headers: Record<string, string> = {},
  ) {
    const baseUrl = this.getServiceUrl(key, fallback);
    const response = await firstValueFrom(
      this.httpService.get(`${baseUrl}${path}`, { headers }),
    );
    return response.data;
  }
}
