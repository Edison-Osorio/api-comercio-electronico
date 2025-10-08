import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
// DTO simulado para la creación de usuarios
interface CreateUserDto {
  email: string;
  firstName: string;
}

@Controller('users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userManagementService.createUser(createUserDto);
  }
}
