import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeamLeadDto } from './dto/create-team_lead.dto';
import { UpdateTeamLeadDto } from './dto/update-team_lead.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamLead } from 'src/entities/team_lead.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TeamLeadService {
  constructor(
    @InjectRepository(TeamLead)
    private readonly teamLeadRepository: Repository<TeamLead>,
  ) {}

  async create(createTeamLeadDto: CreateTeamLeadDto) {
    const teamLead = this.teamLeadRepository.create(createTeamLeadDto);
    return await this.teamLeadRepository.save(teamLead);
  }

  async findAll() {
    return await this.teamLeadRepository.find();
  }

  async findOne(id: number) {
    const teamLead = await this.teamLeadRepository.findOne({ where: { id } });
    if (!teamLead) {
      throw new NotFoundException('Team Lead not found');
    }
    return teamLead;
  }

  async update(id: number, updateTeamLeadDto: UpdateTeamLeadDto) {
    const teamLead = await this.findOne(id);
    if (!teamLead) {
      throw new NotFoundException('Team Lead not found');
    }
    Object.assign(teamLead, updateTeamLeadDto);
    return await this.teamLeadRepository.save(teamLead);
  }

  async remove(id: number) {
    const teamLead = await this.findOne(id);
    if (!teamLead) {
      throw new NotFoundException('Team Lead not found');
    }
    await this.teamLeadRepository.remove(teamLead);
  }

  async deleteFile(url: string) {
  if (!url) return;

  try {
    const filePath = path.join(process.cwd(), 'public', url);
    
    await fs.unlink(filePath);
  } catch (error) {
    throw new Error('Failed to delete file: ' + error.message);
  }
}
}
