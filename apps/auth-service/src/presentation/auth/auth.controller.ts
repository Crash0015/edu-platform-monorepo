import { Body, Controller, Get, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../../application/auth/auth.service';
import { RateLimit } from '../../shared/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../shared/guards/rate-limit.guard';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RequestWithCorrelation } from '../../shared/types/request-context';
import { RATE_LIMITS } from '../../shared/constants/rate-limits.constants';
import {
  ForgotPasswordRequestDto,
  LoginMfaRequestDto,
  LoginRequestDto,
  LoginResponseDto,
  LogoutRequestDto,
  MessageResponseDto,
  MeResponseDto,
  MfaDisableRequestDto,
  MfaSetupResponseDto,
  MfaVerifyRequestDto,
  RefreshRequestDto,
  RefreshResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  ResetPasswordRequestDto,
} from './dto/auth.dto';


@ApiTags('auth')
@Controller('auth')
@UseGuards(RateLimitGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @RateLimit(RATE_LIMITS.LOGIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      example: {
        error: 'BadRequest',
        message: 'Validation failed',
        details: ['email must end with @uce.edu.ec'],
        correlationId: 'uuid',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      example: {
        error: 'Unauthorized',
        message: 'Invalid credentials',
        correlationId: 'uuid',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded',
    schema: {
      example: {
        error: 'TooManyRequests',
        message: 'Rate limit exceeded',
        correlationId: 'uuid',
      },
    },
  })
  async login(@Body() body: LoginRequestDto, @Req() request: RequestWithCorrelation): Promise<LoginResponseDto> {
    const context = this.createContext(request);
    const result = await this.authService.login(body, context);
    if (result.mfaRequired) {
      return result;
    }
    return { ...result, mfaRequired: false };
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiOkResponse({ type: RegisterResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async register(
    @Body() body: RegisterRequestDto,
    @Req() request: RequestWithCorrelation,
  ): Promise<RegisterResponseDto> {
    const context = this.createContext(request);
    return this.authService.register(body, context);
  }

  @Post('login/mfa')
  @HttpCode(200)
  @ApiOperation({ summary: 'Complete login with MFA code' })
  @ApiOkResponse({ type: RefreshResponseDto })

  @ApiUnauthorizedResponse({ description: 'Invalid MFA challenge' })
  async loginMfa(
    @Body() body: LoginMfaRequestDto,
    @Req() request: RequestWithCorrelation,
  ): Promise<RefreshResponseDto> {
    const context = this.createContext(request);
    return this.authService.loginWithMfa(body, context);
  }

  @Post('refresh')
  @RateLimit(RATE_LIMITS.REFRESH)
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  @ApiOkResponse({ type: RefreshResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  async refresh(
    @Body() body: RefreshRequestDto,
    @Req() request: RequestWithCorrelation,
  ): Promise<RefreshResponseDto> {
    const context = this.createContext(request);
    return this.authService.refresh(body, context);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiOkResponse({ type: MessageResponseDto })
  async logout(@Body() body: LogoutRequestDto): Promise<MessageResponseDto> {
    return this.authService.logout(body);
  }

  @Post('password/forgot')
  @RateLimit(RATE_LIMITS.FORGOT_PASSWORD)
  @HttpCode(200)
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  async forgotPassword(
    @Body() body: ForgotPasswordRequestDto,
    @Req() request: RequestWithCorrelation,
  ): Promise<MessageResponseDto> {
    const context = this.createContext(request);
    return this.authService.forgotPassword(body, context);
  }

  @Post('password/reset')
  @RateLimit(RATE_LIMITS.RESET_PASSWORD)
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password using reset token' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  async resetPassword(
    @Body() body: ResetPasswordRequestDto,
    @Req() request: RequestWithCorrelation,
  ): Promise<MessageResponseDto> {
    const context = this.createContext(request);
    return this.authService.resetPassword(body, context);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async me(@Req() request: RequestWithCorrelation): Promise<MeResponseDto> {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.authService.getProfile(userId);
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate MFA secret' })
  @ApiOkResponse({ type: MfaSetupResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async setupMfa(@Req() request: RequestWithCorrelation): Promise<MfaSetupResponseDto> {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.authService.setupMfa(userId);
  }

  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable MFA after verifying code' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid MFA code' })
  async verifyMfa(@Body() body: MfaVerifyRequestDto, @Req() request: RequestWithCorrelation) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.authService.verifyMfa(userId, body.code);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid MFA code' })
  async disableMfa(@Body() body: MfaDisableRequestDto, @Req() request: RequestWithCorrelation) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.authService.disableMfa(userId, body.password, body.code);
  }

  private createContext(request: RequestWithCorrelation) {
    return {
      correlationId: request.correlationId ?? 'unknown',
      ip: request.ip ?? null,
      userAgent: (request.headers['user-agent'] as string) ?? null,
    };
  }
}
