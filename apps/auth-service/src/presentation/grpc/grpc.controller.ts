import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from '../../application/auth/auth.service';

interface VerifyTokenRequest {
  access_token: string;
}

interface VerifyTokenResponse {
  valid: boolean;
  user_id?: string;
  email?: string;
  roles?: string[];
  error?: string;
}

@ApiTags('auth-grpc')
@Controller()
export class GrpcAuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'VerifyToken')
  async verifyToken(data: VerifyTokenRequest & { accessToken?: string }): Promise<VerifyTokenResponse> {
    const token = data?.access_token ?? data?.accessToken;
    if (!token) {
      return { valid: false, error: 'access_token is required' };
    }

    try {
      const payload = await this.authService.verifyAccessToken(token);
      return {
        valid: true,
        user_id: payload.userId,
        email: payload.email,
        roles: payload.roles,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'invalid token';
      return { valid: false, error: message };
    }
  }
}
