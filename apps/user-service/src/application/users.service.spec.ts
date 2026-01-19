import { UsersService } from './users.service';

describe('UsersService', () => {
  it('returns a user profile when it exists', () => {
    const service = new UsersService();
    const user = service.getUser('11111111-1111-1111-1111-111111111111');

    expect(user).toEqual({
      id: '11111111-1111-1111-1111-111111111111',
      status: 'ACTIVE',
      email: 'student@uce.edu.ec',
      userType: 'STUDENT',
    });
  });

  it('returns null when user is missing', () => {
    const service = new UsersService();
    const user = service.getUser('missing');

    expect(user).toBeNull();
  });
});
