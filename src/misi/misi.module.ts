import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Misi } from '../entities/misi.entity';
import { MisiService } from './misi.service';
import { MisiController } from './misi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Misi])],
  controllers: [MisiController],
  providers: [MisiService],
  exports: [MisiService]
})
export class MisiModule {}
