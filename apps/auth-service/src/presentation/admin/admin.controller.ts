import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminService } from '../../application/admin/admin.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import {
  AdminMessageResponseDto,
  AdminUserCreatedResponseDto,
  AdminUserListResponseDto,
  AdminUserQueryDto,
  AdminUserResponseDto,
  AdminUsersReportDto,
  CreateAdminUserDto,
  UpdateUserStatusDto,
  UpdateUserTypeDto,
} from './dto/admin.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List users (Admin only)' })
  @ApiOkResponse({ type: AdminUserListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Admin role required' })
  async listUsers(@Query() query: AdminUserQueryDto): Promise<AdminUserListResponseDto> {
    return this.adminService.listUsers(query);
  }

   @Post('users')
   @ApiOperation({ summary: 'Create user (Admin only)' })
   @ApiOkResponse({ type: AdminUserCreatedResponseDto })
   @ApiUnauthorizedResponse({ description: 'Admin role required' })
   async createUser(@Body() body: CreateAdminUserDto): Promise<AdminUserCreatedResponseDto> {
     const result = await this.adminService.createUser(body);
     return {
       user: result.user,
       temporaryPassword: result.temporaryPassword,
     };
   }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user profile (Admin only)' })
  @ApiOkResponse({ type: AdminUserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUser(@Param('id') id: string): Promise<AdminUserResponseDto> {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiOkResponse({ type: AdminUserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateUserStatusDto,
  ): Promise<AdminUserResponseDto> {
    return this.adminService.updateUserStatus(id, body.status);
  }

  @Patch('users/:id/type')
  @ApiOperation({ summary: 'Update user type (Admin only)' })
  @ApiOkResponse({ type: AdminUserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async updateUserType(
    @Param('id') id: string,
    @Body() body: UpdateUserTypeDto,
  ): Promise<AdminUserResponseDto> {
    return this.adminService.updateUserType(id, body.userType);
  }

  @Post('users/:id/mfa/reset')
  @ApiOperation({ summary: 'Disable MFA for a user (Admin only)' })
  @ApiOkResponse({ type: AdminMessageResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async resetMfa(@Param('id') id: string): Promise<AdminMessageResponseDto> {
    const message = await this.adminService.resetUserMfa(id);
    return { message };
  }

  @Get('reports/users')
  @ApiOperation({ summary: 'User summary report (Admin only)' })
  @ApiOkResponse({ type: AdminUsersReportDto })
  async getUsersReport(): Promise<AdminUsersReportDto> {
    return this.adminService.getUsersReport();
  }
}
