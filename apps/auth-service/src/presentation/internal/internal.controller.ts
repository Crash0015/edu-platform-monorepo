import { Body, Controller, Delete, Get, Headers, Param, Post, Query, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../../application/admin/admin.service';
import {
  AdminMessageResponseDto,
  AdminUserCreatedResponseDto,
  AdminUserListResponseDto,
  AdminUserResponseDto,
  CreateAdminUserDto,
} from '../admin/dto/admin.dto';

@ApiTags('internal')
@Controller('internal')
export class InternalController {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {}

  @Get('users/:id')
  @ApiOperation({ summary: 'Internal user summary' })
  @ApiOkResponse({ type: AdminUserResponseDto })
  async getUser(@Param('id') id: string, @Headers('x-internal-key') key?: string): Promise<AdminUserResponseDto> {
    this.ensureInternalKey(key);
    return this.adminService.getUserById(id) as Promise<AdminUserResponseDto>;
  }

  @Post('users')
  @ApiOperation({ summary: 'Internal create user' })
  @ApiOkResponse({ type: AdminUserCreatedResponseDto })
  async createUser(
    @Body() body: CreateAdminUserDto,
    @Headers('x-internal-key') key?: string,
  ): Promise<AdminUserCreatedResponseDto> {
    this.ensureInternalKey(key);
    const result = await this.adminService.createUser(body);
    return {
      user: result.user,
      temporaryPassword: result.temporaryPassword,
      resetLink: result.resetLink,
    };
  }

  @Get('users/email/:email')
  @ApiOperation({ summary: 'Internal user by email' })
  @ApiOkResponse({ type: AdminUserResponseDto })
  async getUserByEmail(
    @Param('email') email: string,
    @Headers('x-internal-key') key?: string,
  ): Promise<AdminUserResponseDto> {
    this.ensureInternalKey(key);
    return this.adminService.getUserByEmail(email);
  }

  @Get('users')
  @ApiOperation({ summary: 'Internal users list' })
  @ApiOkResponse({ type: AdminUserListResponseDto })
  async listUsers(
    @Query() query: { search?: string; offset?: string; limit?: string; userType?: string },
    @Headers('x-internal-key') key?: string,
  ): Promise<AdminUserListResponseDto> {
    this.ensureInternalKey(key);
    const result = await this.adminService.listUsers({
      search: query.search,
      userType: query.userType as any,
      offset: query.offset ? Number(query.offset) : 0,
      limit: query.limit ? Number(query.limit) : 200,
    });
    return { items: result.items, total: result.total };
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Internal delete user' })
  @ApiOkResponse({ type: AdminMessageResponseDto })
  async deleteUser(@Param('id') id: string, @Headers('x-internal-key') key?: string): Promise<AdminMessageResponseDto> {
    this.ensureInternalKey(key);
    const message = await this.adminService.deleteUser(id, { requireStudent: true });
    return { message };
  }

  private ensureInternalKey(key?: string) {
    const internalKey = this.configService.get<string>('INTERNAL_API_KEY', '').trim();
    if (!internalKey) {
      throw new UnauthorizedException('Internal API key is not configured');
    }
    if (!key || key !== internalKey) {
      throw new UnauthorizedException('Invalid internal key');
    }
  }
}
