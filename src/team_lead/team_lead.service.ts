import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeamLeadDto } from './dto/create-team_lead.dto';
import { UpdateTeamLeadDto } from './dto/update-team_lead.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamLead } from 'src/entities/team_lead.entity';
import { Repository } from 'typeorm';
import cloudinary from 'src/common/config/multer.config';
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
    // Convert URL ke full path
    // /uploads/alumni/123.jpg → /project-root/public/uploads/alumni/123.jpg
    const filePath = path.join(process.cwd(), 'public', url);
    
    // Hapus file
    await fs.unlink(filePath);
    console.log('File deleted:', filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File not found, skipping delete:', url);
    } else {
      console.error('Error deleting file:', error);
      // Tidak throw error agar proses lain tetap jalan
    }
  }
}
}
