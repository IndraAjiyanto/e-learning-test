import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from '../entities/mission.entity';
import { MissionService } from './missions.service';
import { MissionController } from './mission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mission])],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [MissionService],
})
export class MissionsModule {}
