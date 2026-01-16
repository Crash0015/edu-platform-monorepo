import { GatewayService } from './gateway.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('GatewayService', () => {
  it('proxies auth health', async () => {
    const httpService = {
      get: jest.fn().mockReturnValue(of({ data: { status: 'ok' } })),
    } as unknown as HttpService;
    const configService = {
      get: jest.fn().mockReturnValue('http://localhost:3001'),
    };

    const service = new GatewayService(configService as any, httpService);
    const result = await service.getAuthHealth();

    expect(result).toEqual({ status: 'ok' });
    expect(httpService.get).toHaveBeenCalled();
  });
});
