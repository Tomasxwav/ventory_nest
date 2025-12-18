import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  create(@Body() createCategoryDto: CreateUserDto): Promise<any> {
    return this.usersService.create(createCategoryDto);
  }
/* 
  @Get()
  findAll(): Promise<Category[]> {
    return this.authService.findAll();
  } */
}
