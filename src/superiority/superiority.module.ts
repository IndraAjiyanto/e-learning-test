import { Module } from '@nestjs/common';
import { SuperiorityService } from './superiority.service';
import { SuperiorityController } from './superiority.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Superiority } from 'src/entities/superiority.entity';
import { Kategori } from 'src/entities/kategori.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Superiority, Kategori])],
  controllers: [SuperiorityController],
  providers: [SuperiorityService],
})
export class SuperiorityModule {}
