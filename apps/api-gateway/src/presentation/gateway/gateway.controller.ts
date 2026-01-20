import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
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
    @Headers('x-user-id') userId: string,
    @Headers('x-user-roles') userRoles: string,
  ) {
    const headers = {
      'x-user-id': userId ?? '',
      'x-user-roles': userRoles ?? '',
    };
    return this.gatewayService.assignEnrollment(body, headers);
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
}
