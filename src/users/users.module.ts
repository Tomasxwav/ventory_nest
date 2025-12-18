import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SessionsController } from './sessions.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, SessionsModule],
  controllers: [UsersController, SessionsController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
