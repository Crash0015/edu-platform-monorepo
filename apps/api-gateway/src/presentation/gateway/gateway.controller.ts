import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
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
}

