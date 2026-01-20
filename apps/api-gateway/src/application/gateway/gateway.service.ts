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
      'http://localhost:3004',
      `/api/v1/courses/${id}`,
      headers,
    );
  }

  async getCourseByCode(code: string, headers: Record<string, string>) {
    return this.getFromService(
      'COURSE_SERVICE_URL',
      'http://localhost:3004',
      `/api/v1/courses/code/${code}`,
      headers,
    );
  }

  async listCourses(params: Record<string, string>, headers: Record<string, string>) {
    return this.getFromService(
      'COURSE_SERVICE_URL',
      'http://localhost:3004',
      '/api/v1/courses',
      headers,
      params,
    );
  }

  async createCourse(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'COURSE_SERVICE_URL',
      'http://localhost:3004',
      '/api/v1/courses',
      payload,
      headers,
    );
  }

  async updateCourse(id: string, payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.patchToService(
      'COURSE_SERVICE_URL',
      'http://localhost:3004',
      `/api/v1/courses/${id}`,
      payload,
      headers,
    );
  }

  async deleteCourse(id: string, headers: Record<string, string>) {
    return this.deleteFromService(
      'COURSE_SERVICE_URL',
      'http://localhost:3004',
      `/api/v1/courses/${id}`,
      headers,
    );
  }

  async getCoursesByTeacher(teacherId: string, headers: Record<string, string>) {
    return this.getFromService(
      'COURSE_SERVICE_URL',
      'http://localhost:3004',
      `/api/v1/courses/teachers/${teacherId}`,
      headers,
    );
  }

  async assignTeacher(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'COURSE_SERVICE_URL',
      'http://localhost:3004',
      '/api/v1/courses/teachers/assign',
      payload,
      headers,
    );
  }

  async getTeachersByCourse(courseId: string, headers: Record<string, string>) {
    return this.getFromService(
      'COURSE_SERVICE_URL',
      'http://localhost:3004',
      `/api/v1/courses/${courseId}/teachers`,
      headers,
    );
  }

  async removeTeacherFromCourse(courseId: string, teacherId: string, headers: Record<string, string>) {
    return this.deleteFromService(
      'COURSE_SERVICE_URL',
      'http://localhost:3004',
      `/api/v1/courses/${courseId}/teachers/${teacherId}`,
      headers,
    );
  }

  async getUser(id: string, headers: Record<string, string>) {
    return this.getFromService(
      'USER_SERVICE_URL',
      'http://localhost:3008',
      `/api/v1/users/${id}`,
      headers,
    );
  }

  async enqueueEmail(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'NOTIFICATION_SERVICE_URL',
      'http://localhost:3005',
      '/api/v1/notifications/email',
      payload,
      headers,
    );
  }

  async queueAutomation(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTOMATION_SERVICE_URL',
      'http://localhost:3006',
      '/api/v1/automation/queue',
      payload,
      headers,
    );
  }

  async publishAutomation(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'AUTOMATION_SERVICE_URL',
      'http://localhost:3006',
      '/api/v1/automation/publish',
      payload,
      headers,
    );
  }

  async listEnrollmentsByStudent(studentId: string, headers: Record<string, string>) {
    return this.getFromService(
      'ENROLLMENT_SERVICE_URL',
      'http://localhost:3007',
      `/api/v1/enrollments/students/${studentId}`,
      headers,
    );
  }

  async listEnrollmentsByCourse(courseId: string, headers: Record<string, string>) {
    return this.getFromService(
      'ENROLLMENT_SERVICE_URL',
      'http://localhost:3007',
      `/api/v1/enrollments/courses/${courseId}`,
      headers,
    );
  }

  async listScheduleAvailability(teacherId: string, params: Record<string, string>, headers: Record<string, string>) {
    return this.getFromService(
      'SCHEDULE_SERVICE_URL',
      'http://localhost:3009',
      `/api/v1/schedule/availability/teacher/${teacherId}`,
      headers,
      params,
    );
  }

  async createScheduleAvailability(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'SCHEDULE_SERVICE_URL',
      'http://localhost:3009',
      '/api/v1/schedule/availability',
      payload,
      headers,
    );
  }

  async deleteScheduleAvailability(id: string, headers: Record<string, string>) {
    return this.deleteFromService(
      'SCHEDULE_SERVICE_URL',
      'http://localhost:3009',
      `/api/v1/schedule/availability/${id}`,
      headers,
    );
  }

  async listAvailableSessions(params: Record<string, string>, headers: Record<string, string>) {
    return this.getFromService(
      'TUTORING_SERVICE_URL',
      'http://localhost:3010',
      '/api/v1/tutoring/sessions/available',
      headers,
      params,
    );
  }

  async reserveSession(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'TUTORING_SERVICE_URL',
      'http://localhost:3010',
      '/api/v1/tutoring/sessions/reserve',
      payload,
      headers,
    );
  }

  async cancelSession(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'TUTORING_SERVICE_URL',
      'http://localhost:3010',
      '/api/v1/tutoring/sessions/cancel',
      payload,
      headers,
    );
  }

  async getSessionById(id: string, headers: Record<string, string>) {
    return this.getFromService(
      'TUTORING_SERVICE_URL',
      'http://localhost:3010',
      `/api/v1/tutoring/sessions/${id}`,
      headers,
    );
  }

  async getSearchEnrollments(studentId: string, headers: Record<string, string>) {
    return this.getFromService(
      'SEARCH_SERVICE_URL',
      'http://localhost:3011',
      `/api/v1/search/enrollments/${studentId}`,
      headers,
    );
  }

  async listMaterials(params: Record<string, string>, headers: Record<string, string>) {
    return this.getFromService(
      'MATERIAL_SERVICE_URL',
      'http://localhost:3012',
      '/api/v1/materials',
      headers,
      params,
    );
  }

  async getMaterial(id: string, headers: Record<string, string>) {
    return this.getFromService(
      'MATERIAL_SERVICE_URL',
      'http://localhost:3012',
      `/api/v1/materials/${id}`,
      headers,
    );
  }

  async createMaterial(payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.postToService(
      'MATERIAL_SERVICE_URL',
      'http://localhost:3012',
      '/api/v1/materials',
      payload,
      headers,
    );
  }

  async updateMaterial(id: string, payload: Record<string, unknown>, headers: Record<string, string>) {
    return this.patchToService(
      'MATERIAL_SERVICE_URL',
      'http://localhost:3012',
      `/api/v1/materials/${id}`,
      payload,
      headers,
    );
  }

  async deleteMaterial(id: string, headers: Record<string, string>) {
    return this.deleteFromService(
      'MATERIAL_SERVICE_URL',
      'http://localhost:3012',
      `/api/v1/materials/${id}`,
      headers,
    );
  }

  async publishMaterial(id: string, headers: Record<string, string>) {
    return this.postToService(
      'MATERIAL_SERVICE_URL',
      'http://localhost:3012',
      `/api/v1/materials/${id}/publish`,
      {},
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
    params: Record<string, string> = {},
  ) {
    const baseUrl = this.getServiceUrl(key, fallback);
    const response = await firstValueFrom(
      this.httpService.get(`${baseUrl}${path}`, { headers, params }),
    );
    return response.data;
  }

  private async patchToService(
    key: string,
    fallback: string,
    path: string,
    payload: Record<string, unknown>,
    headers: Record<string, string>,
  ) {
    const baseUrl = this.getServiceUrl(key, fallback);
    const response = await firstValueFrom(
      this.httpService.patch(`${baseUrl}${path}`, payload, { headers }),
    );
    return response.data;
  }

  private async deleteFromService(
    key: string,
    fallback: string,
    path: string,
    headers: Record<string, string>,
  ) {
    const baseUrl = this.getServiceUrl(key, fallback);
    const response = await firstValueFrom(
      this.httpService.delete(`${baseUrl}${path}`, { headers }),
    );
    return response.data;
  }
}
