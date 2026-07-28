import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { UploadService } from 'src/common/upload/upload.service';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { CommonModule } from 'src/common/common.module';
import { EmailService } from 'src/common/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Course, Portofolios]), CommonModule],
  controllers: [UsersController],
  providers: [UsersService, EmailService],
  exports: [UsersService],
})
export class UsersModule {}
