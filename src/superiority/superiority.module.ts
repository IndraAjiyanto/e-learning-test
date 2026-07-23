import { Module } from '@nestjs/common';
import { SuperiorityService } from './superiority.service';
import { SuperiorityController } from './superiority.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Superiority } from 'src/entities/superiority.entity';
import { Category } from 'src/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Superiority, Category])],
  controllers: [SuperiorityController],
  providers: [SuperiorityService],
})
export class SuperiorityModule {}
