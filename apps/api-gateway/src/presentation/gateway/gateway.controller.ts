import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
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

  @Get('courses/:id')
  @ApiOperation({ summary: 'Proxy course capacity summary' })
  async getCourse(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.getCourse(id, headers);
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
}
