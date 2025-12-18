import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
  ) {}

  async create(sessionData: {
    userId: number;
    accessToken: string;
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    browser?: string;
    location?: string;
    expiresAt: Date;
  }): Promise<Session> {
    const session = this.sessionsRepository.create({
      ...sessionData,
      lastActivityAt: new Date(),
    });
    return this.sessionsRepository.save(session);
  }

  async findByAccessToken(accessToken: string): Promise<Session | null> {
    return this.sessionsRepository.findOne({
      where: { accessToken },
      relations: ['user'],
    });
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.sessionsRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });
  }

  async updateLastActivity(sessionId: number): Promise<void> {
    await this.sessionsRepository.update(sessionId, {
      lastActivityAt: new Date(),
    });
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.sessionsRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();
  }

  async deleteUserSessions(userId: number): Promise<void> {
    await this.sessionsRepository.delete({ userId });
  }

  async revokeSession(accessToken: string): Promise<boolean> {
    const session = await this.sessionsRepository.findOne({
      where: { accessToken },
    });

    if (session) {
      await this.sessionsRepository.remove(session);
      return true;
    }

    return false;
  }

  async updateTokens(
    sessionId: number,
    tokenData: {
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
    },
  ): Promise<void> {
    await this.sessionsRepository.update(sessionId, {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: tokenData.expiresAt,
      lastActivityAt: new Date(),
    });
  }
}
