import { Module } from '@nestjs/common';
import { JawabanUsersService } from './jawaban_users.service';
import { JawabanUsersController } from './jawaban_users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { Jawaban } from 'src/entities/jawaban.entity';
import { User } from 'src/entities/user.entity';
import { JawabanUser } from 'src/entities/jawaban_user.entity';
import { PertanyaansModule } from 'src/pertanyaans/pertanyaans.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pertanyaan, Jawaban, User, JawabanUser])],
  controllers: [JawabanUsersController],
  providers: [JawabanUsersService],
  exports: [JawabanUsersService]
})
export class JawabanUsersModule {}
