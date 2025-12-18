import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { SessionsService } from '../sessions/sessions.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private sessionsService: SessionsService,
  ) {}

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Access token expira en 15 minutos
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // Refresh token expira en 7 días
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const browser = this.extractBrowser(userAgent);
    const deviceInfo = this.extractDeviceInfo(userAgent);

    await this.sessionsService.create({
      userId: user.id,
      accessToken,
      refreshToken,
      ipAddress,
      userAgent,
      deviceInfo,
      browser,
      expiresAt,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private extractBrowser(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;

    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';

    return 'Unknown';
  }

  private extractDeviceInfo(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;

    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';

    return 'Desktop';
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(
    accessToken: string,
    refreshToken: string,
  ): Promise<{ data : { access_token: string; refresh_token: string } }> {
    const session = await this.sessionsService.findByAccessToken(accessToken);

    if (!session) {
      throw new UnauthorizedException('Sesión no encontrada o inválida');
    }

    if (session.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token no coincide');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sesión expirada');
    }

    try {
      this.jwtService.verify(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.usersRepository.findOne({
      where: { id: session.userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await this.sessionsService.updateTokens(session.id, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
    });

    return {  data: { access_token: newAccessToken, refresh_token: newRefreshToken } };
  }
}
