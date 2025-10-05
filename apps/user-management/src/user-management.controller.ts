import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
// DTO simulado para la creación de usuarios
interface CreateUserDto {
  email: string;
  firstName: string;
}

@Controller('users') // Endpoint: /api/v1/users
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    // La lógica del servicio maneja la emisión del mensaje TCP
    return this.userManagementService.createUser(
      createUserDto);
  }
}

