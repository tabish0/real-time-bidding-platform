import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List all users (for bid attribution)' })
  @ApiOkResponse({ description: 'All 100 seeded users', type: User, isArray: true })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }
}
