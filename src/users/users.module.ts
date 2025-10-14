import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { Portfolio } from 'src/entities/portfolio.entity';
import { UploadService } from 'src/common/upload/upload.service';
import { ValidateImageInterceptor } from 'src/common/interceptors/validate-image.interceptor';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Kelas, Portfolio]), CommonModule],
  controllers: [UsersController],
  providers: [UsersService,],
  exports: [UsersService],
})
export class UsersModule {}
