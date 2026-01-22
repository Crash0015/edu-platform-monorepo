import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayService } from '../../application/gateway/gateway.service';

@ApiTags('gateway')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('auth/health')
  @ApiOperation({ summary: 'Proxy auth-service health endpoint' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  async authHealth() {
    return this.gatewayService.getAuthHealth();
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Proxy auth login' })
  async login(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.login(body, headers);
  }

  @Post('auth/register')
  @ApiOperation({ summary: 'Proxy auth register' })
  async register(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.register(body, headers);
  }

  @Post('auth/login/mfa')
  @ApiOperation({ summary: 'Proxy auth MFA login' })
  async loginMfa(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.loginMfa(body, headers);
  }

  @Post('auth/refresh')
  @ApiOperation({ summary: 'Proxy auth refresh' })
  async refresh(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.refresh(body, headers);
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Proxy auth logout' })
  async logout(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.logout(body, headers);
  }

  @Post('auth/password/forgot')
  @ApiOperation({ summary: 'Proxy auth forgot password' })
  async forgotPassword(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.forgotPassword(body, headers);
  }

  @Post('auth/password/reset')
  @ApiOperation({ summary: 'Proxy auth reset password' })
  async resetPassword(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.resetPassword(body, headers);
  }

  @Get('auth/me')
  @ApiOperation({ summary: 'Proxy auth me' })
  async me(@Headers() headers: Record<string, string>) {
    return this.gatewayService.me(headers);
  }

  @Post('auth/mfa/setup')
  @ApiOperation({ summary: 'Proxy auth MFA setup' })
  async setupMfa(@Headers() headers: Record<string, string>) {
    return this.gatewayService.setupMfa(headers);
  }

  @Post('auth/mfa/verify')
  @ApiOperation({ summary: 'Proxy auth MFA verify' })
  async verifyMfa(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.verifyMfa(body, headers);
  }

  @Post('auth/mfa/disable')
  @ApiOperation({ summary: 'Proxy auth MFA disable' })
  async disableMfa(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.disableMfa(body, headers);
  }

  @Post('enrollments/assign')
  @ApiOperation({ summary: 'Proxy enrollment assignment (teacher only)' })
  @ApiOkResponse({
    schema: {
      example: { id: 'uuid', studentId: 'uuid', courseId: 'uuid', status: 'ACTIVE' },
    },
  })
  async assignEnrollment(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-roles') userRoles: string,
  ) {
    return this.gatewayService.assignEnrollment(body, {
      ...headers,
      'x-user-id': userId ?? headers['x-user-id'] ?? '',
      'x-user-roles': userRoles ?? headers['x-user-roles'] ?? '',
    });
  }

  @Post('enrollments/assign-with-profile')
  @ApiOperation({ summary: 'Proxy enrollment with student profile creation (teacher only)' })
  async assignEnrollmentWithProfile(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-roles') userRoles: string,
  ) {
    return this.gatewayService.enrollStudentWithProfile(body, {
      ...headers,
      'x-user-id': userId ?? headers['x-user-id'] ?? '',
      'x-user-roles': userRoles ?? headers['x-user-roles'] ?? '',
    });
  }

  @Get('enrollments/students/:studentId')
  @ApiOperation({ summary: 'Proxy enrollments by student' })
  async getEnrollmentsByStudent(
    @Param('studentId') studentId: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.listEnrollmentsByStudent(studentId, headers);
  }

  @Get('enrollments/courses/:courseId')
  @ApiOperation({ summary: 'Proxy enrollments by course' })
  async getEnrollmentsByCourse(
    @Param('courseId') courseId: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.listEnrollmentsByCourse(courseId, headers);
  }

  @Delete('enrollments/:id')
  @ApiOperation({ summary: 'Proxy drop enrollment' })
  async dropEnrollment(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.dropEnrollment(id, headers);
  }

  @Delete('students/:id')
  @ApiOperation({ summary: 'Delete student user (Teacher/Admin only)' })
  async deleteStudent(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    const roles = this.extractRoles(headers);
    if (!roles.includes('TEACHER') && !roles.includes('ADMIN')) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }
    return this.gatewayService.deleteStudentUser(id);
  }

  @Get('students')
  @ApiOperation({ summary: 'List student users (Teacher/Admin only)' })
  async listStudents(
    @Query() query: Record<string, string>,
    @Headers() headers: Record<string, string>,
  ) {
    const roles = this.extractRoles(headers);
    if (!roles.includes('TEACHER') && !roles.includes('ADMIN')) {
      throw new UnauthorizedException('Teacher or Admin role required');
    }
    return this.gatewayService.listStudents(query);
  }

  private extractRoles(headers: Record<string, string>) {
    const rolesHeader = headers['x-user-roles'] || headers['X-User-Roles'] || '';
    const roles = rolesHeader
      ? rolesHeader.split(',').map((role) => role.trim())
      : this.decodeRolesFromToken(headers['authorization'] || headers['Authorization']);
    return roles;
  }

  private decodeRolesFromToken(authHeader?: string): string[] {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return [];
    }
    const token = authHeader.split(' ')[1];
    const parts = token.split('.');
    if (parts.length < 2) {
      return [];
    }
    try {
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as { roles?: string[] };
      return Array.isArray(payload.roles) ? payload.roles : [];
    } catch {
      return [];
    }
  }

  @Post('courses')
  @ApiOperation({ summary: 'Proxy course creation' })
  async createCourse(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.createCourse(body, headers);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Proxy course list' })
  async listCourses(@Query() query: Record<string, string>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.listCourses(query, headers);
  }

  @Get('courses/code/:code')
  @ApiOperation({ summary: 'Proxy course by code' })
  async getCourseByCode(@Param('code') code: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.getCourseByCode(code, headers);
  }

  @Get('courses/teachers/:teacherId')
  @ApiOperation({ summary: 'Proxy courses by teacher' })
  async getCoursesByTeacher(@Param('teacherId') teacherId: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.getCoursesByTeacher(teacherId, headers);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Proxy course capacity summary' })
  async getCourse(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.getCourse(id, headers);
  }

  @Patch('courses/:id')
  @ApiOperation({ summary: 'Proxy course update' })
  async updateCourse(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.updateCourse(id, body, headers);
  }

  @Delete('courses/:id')
  @ApiOperation({ summary: 'Proxy course deletion' })
  async deleteCourse(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.deleteCourse(id, headers);
  }

  @Post('courses/:id/seats/increment')
  @ApiOperation({ summary: 'Proxy course seat increment' })
  async incrementCourseSeats(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.incrementCourseSeats(id, headers);
  }

  @Post('courses/:id/seats/decrement')
  @ApiOperation({ summary: 'Proxy course seat decrement' })
  async decrementCourseSeats(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.decrementCourseSeats(id, headers);
  }

  @Post('courses/teachers/assign')
  @ApiOperation({ summary: 'Proxy assign teacher to course' })
  async assignTeacher(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.assignTeacher(body, headers);
  }

  @Get('courses/:id/teachers')
  @ApiOperation({ summary: 'Proxy teachers by course' })
  async getTeachersByCourse(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.getTeachersByCourse(id, headers);
  }

  @Delete('courses/:courseId/teachers/:teacherId')
  @ApiOperation({ summary: 'Proxy remove teacher from course' })
  async removeTeacherFromCourse(
    @Param('courseId') courseId: string,
    @Param('teacherId') teacherId: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.removeTeacherFromCourse(courseId, teacherId, headers);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Proxy user profile summary' })
  async getUser(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.getUser(id, headers);
  }

  @Post('notifications/email')
  @ApiOperation({ summary: 'Proxy enqueue email notification' })
  async enqueueEmail(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.enqueueEmail(body, headers);
  }

  @Post('notifications/internal')
  @ApiOperation({ summary: 'Proxy create in-app notification' })
  async createNotification(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.createInAppNotification(body, headers);
  }

  @Get('notifications/users/:userId')
  @ApiOperation({ summary: 'Proxy list user notifications' })
  async listNotifications(
    @Param('userId') userId: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.listNotifications(userId, headers);
  }

  @Post('notifications/users/:userId/read')
  @ApiOperation({ summary: 'Proxy mark user notifications as read' })
  async markNotificationsRead(
    @Param('userId') userId: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.markNotificationsRead(userId, headers);
  }

  @Post('automation/queue')
  @ApiOperation({ summary: 'Proxy automation queue' })
  async queueAutomation(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.queueAutomation(body, headers);
  }

  @Post('automation/publish')
  @ApiOperation({ summary: 'Proxy automation publish' })
  async publishAutomation(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.publishAutomation(body, headers);
  }

  @Get('schedule/availability/teacher/:teacherId')
  @ApiOperation({ summary: 'Proxy schedule availability by teacher' })
  async listScheduleAvailability(
    @Param('teacherId') teacherId: string,
    @Query() query: Record<string, string>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.listScheduleAvailability(teacherId, query, headers);
  }

  @Post('schedule/availability')
  @ApiOperation({ summary: 'Proxy schedule availability creation' })
  async createScheduleAvailability(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.createScheduleAvailability(body, headers);
  }

  @Delete('schedule/availability/:id')
  @ApiOperation({ summary: 'Proxy schedule availability deletion' })
  async deleteScheduleAvailability(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.deleteScheduleAvailability(id, headers);
  }

  @Post('schedule/availability/:id/status')
  @ApiOperation({ summary: 'Proxy schedule availability status update' })
  async updateScheduleAvailabilityStatus(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.updateScheduleAvailabilityStatus(id, body, headers);
  }

  @Put('schedule/availability/:id')
  @ApiOperation({ summary: 'Proxy schedule availability update' })
  async updateScheduleAvailability(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.updateScheduleAvailability(id, body, headers);
  }

  @Get('tutoring/sessions/available')
  @ApiOperation({ summary: 'Proxy available tutoring sessions' })
  async listAvailableSessions(
    @Query() query: Record<string, string>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.listAvailableSessions(query, headers);
  }

  @Post('tutoring/sessions/reserve')
  @ApiOperation({ summary: 'Proxy tutoring session reservation' })
  async reserveSession(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.reserveSession(body, headers);
  }

  @Post('tutoring/sessions/cancel')
  @ApiOperation({ summary: 'Proxy tutoring session cancel' })
  async cancelSession(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.cancelSession(body, headers);
  }

  @Get('tutoring/sessions/:id')
  @ApiOperation({ summary: 'Proxy tutoring session details' })
  async getTutoringSession(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.getSessionById(id, headers);
  }

  @Get('tutoring/sessions/teacher/:teacherId')
  @ApiOperation({ summary: 'Proxy tutoring sessions by teacher' })
  async listTeacherBookings(@Param('teacherId') teacherId: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.listTeacherBookings(teacherId, headers);
  }

  @Get('search/enrollments/:studentId')
  @ApiOperation({ summary: 'Proxy search enrollments projection' })
  async getSearchEnrollments(
    @Param('studentId') studentId: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.getSearchEnrollments(studentId, headers);
  }

  @Get('materials')
  @ApiOperation({ summary: 'Proxy materials list' })
  async listMaterials(
    @Query() query: Record<string, string>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.listMaterials(query, headers);
  }

  @Get('materials/:id')
  @ApiOperation({ summary: 'Proxy material details' })
  async getMaterial(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.getMaterial(id, headers);
  }

  @Post('materials')
  @ApiOperation({ summary: 'Proxy material creation' })
  async createMaterial(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.createMaterial(body, headers);
  }

  @Post('materials/uploads')
  @ApiOperation({ summary: 'Proxy material asset upload' })
  async uploadMaterial(@Req() req: { body: Buffer }, @Headers() headers: Record<string, string>) {
    return this.gatewayService.uploadMaterialAsset(req.body, headers);
  }

  @Patch('materials/:id')
  @ApiOperation({ summary: 'Proxy material update' })
  async updateMaterial(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.updateMaterial(id, body, headers);
  }

  @Delete('materials/:id')
  @ApiOperation({ summary: 'Proxy material deletion' })
  async deleteMaterial(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.deleteMaterial(id, headers);
  }

  @Post('materials/:id/publish')
  @ApiOperation({ summary: 'Proxy material publish' })
  async publishMaterial(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.publishMaterial(id, headers);
  }

  @Get('admin/users')
  @ApiOperation({ summary: 'Admin users list' })
  async listAdminUsers(@Query() query: Record<string, string>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.listAdminUsers(query, headers);
  }

   @Post('admin/users')
   @ApiOperation({ summary: 'Admin create user' })
   async createAdminUser(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
     return this.gatewayService.createAdminUser(body, headers);
   }

  @Get('admin/users/:id')
  @ApiOperation({ summary: 'Admin user detail' })
  async getAdminUser(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.getAdminUser(id, headers);
  }

  @Patch('admin/users/:id/status')
  @ApiOperation({ summary: 'Admin update user status' })
  async updateAdminUserStatus(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.updateAdminUserStatus(id, body, headers);
  }

  @Patch('admin/users/:id/type')
  @ApiOperation({ summary: 'Admin update user type' })
  async updateAdminUserType(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.updateAdminUserType(id, body, headers);
  }

  @Patch('admin/users/:id')
  @ApiOperation({ summary: 'Admin update user profile' })
  async updateAdminUserProfile(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.updateAdminUserProfile(id, body, headers);
  }

  @Post('admin/users/:id/mfa/reset')
  @ApiOperation({ summary: 'Admin reset user MFA' })
  async resetAdminUserMfa(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.resetAdminUserMfa(id, headers);
  }

  @Delete('admin/users/:id')
  @ApiOperation({ summary: 'Admin delete user' })
  async deleteAdminUser(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.deleteAdminUser(id, headers);
  }

  @Get('admin/reports/users')
  @ApiOperation({ summary: 'Admin users report' })
  async getAdminUsersReport(@Headers() headers: Record<string, string>) {
    return this.gatewayService.getAdminUsersReport(headers);
  }

  @Get('admin/enrollments')
  @ApiOperation({ summary: 'Admin enrollments list' })
  async listAdminEnrollments(@Headers() headers: Record<string, string>) {
    return this.gatewayService.listAdminEnrollments(headers);
  }

  @Delete('admin/enrollments/:id')
  @ApiOperation({ summary: 'Admin drop enrollment' })
  async dropAdminEnrollment(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.dropEnrollment(id, headers);
  }

  @Get('admin/courses')
  @ApiOperation({ summary: 'Admin courses list' })
  async listAdminCourses(@Query() query: Record<string, string>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.listCourses(query, headers);
  }

  @Post('admin/courses')
  @ApiOperation({ summary: 'Admin course creation' })
  async createAdminCourse(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.createCourse(body, headers);
  }

  @Get('admin/courses/:id')
  @ApiOperation({ summary: 'Admin course detail' })
  async getAdminCourse(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.getCourse(id, headers);
  }

  @Patch('admin/courses/:id')
  @ApiOperation({ summary: 'Admin course update' })
  async updateAdminCourse(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.updateCourse(id, body, headers);
  }

  @Delete('admin/courses/:id')
  @ApiOperation({ summary: 'Admin course delete' })
  async deleteAdminCourse(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.deleteCourse(id, headers);
  }

  @Get('admin/materials')
  @ApiOperation({ summary: 'Admin materials list' })
  async listAdminMaterials(@Query() query: Record<string, string>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.listMaterials(query, headers);
  }

  @Post('admin/materials')
  @ApiOperation({ summary: 'Admin material creation' })
  async createAdminMaterial(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.createMaterial(body, headers);
  }

  @Patch('admin/materials/:id')
  @ApiOperation({ summary: 'Admin material update' })
  async updateAdminMaterial(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.gatewayService.updateMaterial(id, body, headers);
  }

  @Delete('admin/materials/:id')
  @ApiOperation({ summary: 'Admin material delete' })
  async deleteAdminMaterial(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.deleteMaterial(id, headers);
  }

  @Post('admin/materials/:id/publish')
  @ApiOperation({ summary: 'Admin material publish' })
  async publishAdminMaterial(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.publishMaterial(id, headers);
  }

  @Post('admin/enrollments/assign')
  @ApiOperation({ summary: 'Admin assign enrollment' })
  async assignAdminEnrollment(@Body() body: Record<string, unknown>, @Headers() headers: Record<string, string>) {
    return this.gatewayService.assignEnrollment(body, headers);
  }

  @Get('admin/schedule/availability')
  @ApiOperation({ summary: 'Admin availability list' })
  async listAdminAvailability(@Query() query: Record<string, string>, @Headers() headers: Record<string, string>) {
    const roles = this.extractRoles(headers);
    if (!roles.includes('ADMIN')) {
      throw new UnauthorizedException('Admin role required');
    }
    return this.gatewayService.listAdminAvailability(query, headers);
  }

  @Post('admin/schedule/availability')
  @ApiOperation({ summary: 'Admin availability create' })
  async createAdminAvailability(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    const roles = this.extractRoles(headers);
    if (!roles.includes('ADMIN')) {
      throw new UnauthorizedException('Admin role required');
    }
    return this.gatewayService.createScheduleAvailability(body, headers);
  }

  @Post('admin/schedule/availability/:id/status')
  @ApiOperation({ summary: 'Admin availability status update' })
  async updateAdminAvailabilityStatus(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    const roles = this.extractRoles(headers);
    if (!roles.includes('ADMIN')) {
      throw new UnauthorizedException('Admin role required');
    }
    return this.gatewayService.updateScheduleAvailabilityStatus(id, body, headers);
  }

  @Delete('admin/schedule/availability/:id')
  @ApiOperation({ summary: 'Admin availability delete' })
  async deleteAdminAvailability(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    const roles = this.extractRoles(headers);
    if (!roles.includes('ADMIN')) {
      throw new UnauthorizedException('Admin role required');
    }
    return this.gatewayService.deleteScheduleAvailability(id, headers);
  }

  @Get('admin/tutoring/sessions')
  @ApiOperation({ summary: 'Admin tutoring sessions list' })
  async listAdminTutoringSessions(@Headers() headers: Record<string, string>) {
    return this.gatewayService.listAdminTutoringSessions(headers);
  }

  @Get('admin/tutoring/bookings')
  @ApiOperation({ summary: 'Admin tutoring bookings list' })
  async listAdminTutoringBookings(@Headers() headers: Record<string, string>) {
    return this.gatewayService.listAdminTutoringBookings(headers);
  }

  @Get('admin/reports/summary')
  @ApiOperation({ summary: 'Admin platform summary report' })
  async getAdminSummary(@Headers() headers: Record<string, string>) {
    return this.gatewayService.getAdminSummary(headers);
  }
}
