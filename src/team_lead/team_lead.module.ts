import { Module } from '@nestjs/common';
import { TeamLeadService } from './team_lead.service';
import { TeamLeadController } from './team_lead.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamLead } from 'src/entities/team_lead.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([TeamLead]), CommonModule],
  controllers: [TeamLeadController],
  providers: [TeamLeadService],
})
export class TeamLeadModule {}
