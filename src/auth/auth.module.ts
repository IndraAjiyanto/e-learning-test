import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { UsersModule } from 'src/users/users.module';
import { EmailService } from 'src/common/email/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule, CoursesModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer, EmailService],
})
export class AuthModule {}
