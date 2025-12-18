import {
  Controller,
  Post,
  Delete,
  Body,
  Ip,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { SessionsService } from '../sessions/sessions.service';
import { LoginDto } from '../auth/dto/login.dto';
import { RefreshTokenDto } from '../auth/dto/refresh-token.dto';

@Controller('users')
export class SessionsController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Post('sessions')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Req() request: Request,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const userAgent = request.headers['user-agent'];
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Post('refresh_token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.refreshToken(
      refreshTokenDto.access_token,
      refreshTokenDto.refresh_token,
    );
  }

  @Delete('sessions')
  @HttpCode(HttpStatus.OK)
  async destroy(
    @Headers('authorization') authorization: string,
  ): Promise<{ message: string }> {
    if (!authorization) {
      throw new UnauthorizedException('No se proporcionó token de autorización');
    }

    const accessToken = authorization.split(' ').pop();

    if (!accessToken) {
      throw new UnauthorizedException('Token de autorización inválido');
    }

    await this.sessionsService.revokeSession(accessToken);

    return { message: 'Sesión cerrada exitosamente' };
  }
}
