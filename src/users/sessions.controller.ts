import { Controller, Post, Body, Ip, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';

@Controller('users')
export class SessionsController {
  constructor(private readonly authService: AuthService) {}

  @Post('sessions')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Req() request: Request,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const userAgent = request.headers['user-agent'];
    return this.authService.login(loginDto, ip, userAgent);
  }
}
