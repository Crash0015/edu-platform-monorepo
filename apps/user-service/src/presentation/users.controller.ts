import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../application/users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile summary' })
  @ApiOkResponse({ schema: { example: { id: 'uuid', status: 'ACTIVE', userType: 'STUDENT' } } })
  @ApiNotFoundResponse({ description: 'User not found' })
  getUser(@Param('id') id: string) {
    const user = this.usersService.getUser(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
