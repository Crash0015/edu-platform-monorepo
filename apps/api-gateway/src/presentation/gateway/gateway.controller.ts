import { Controller, Get } from '@nestjs/common';
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
}
