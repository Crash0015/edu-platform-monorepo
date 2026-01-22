import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const createService = () => {
    const configService = new ConfigService({
      AUTH_SERVICE_URL: 'http://auth-service:3001',
      AUTH_SERVICE_INTERNAL_KEY: 'test-key',
    });
    return new UsersService(configService);
  };

  it('returns a user profile when it exists', async () => {
    const service = createService();
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '11111111-1111-1111-1111-111111111111',
        status: 'ACTIVE',
        email: 'student@uce.edu.ec',
        userType: 'STUDENT',
      }),
    });

    const originalFetch = global.fetch;
    global.fetch = fetchMock as unknown as typeof fetch;

    const user = await service.getUser('11111111-1111-1111-1111-111111111111');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://auth-service:3001/api/v1/internal/users/11111111-1111-1111-1111-111111111111',
      { headers: { 'x-internal-key': 'test-key' } },
    );
    expect(user).toEqual({
      id: '11111111-1111-1111-1111-111111111111',
      status: 'ACTIVE',
      email: 'student@uce.edu.ec',
      userType: 'STUDENT',
      fullName: null,
      identificationNumber: null,
    });

    global.fetch = originalFetch;
  });

  it('returns null when user is missing', async () => {
    const service = createService();
    const fetchMock = jest.fn().mockResolvedValue({ ok: false });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as unknown as typeof fetch;

    const user = await service.getUser('missing');

    expect(user).toBeNull();
    global.fetch = originalFetch;
  });
});
