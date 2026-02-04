import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { UsersModule } from 'src/users/users.module';
import { KelassModule } from 'src/kelass/kelass.module';
import { EmailService } from 'src/common/email/email.service';

@Module({
  imports: [UsersModule, KelassModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer, EmailService],
})
export class AuthModule {}
