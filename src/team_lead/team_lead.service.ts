import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeamLeadDto } from './dto/create-team_lead.dto';
import { UpdateTeamLeadDto } from './dto/update-team_lead.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamLead } from 'src/entities/team_lead.entity';
import { Repository } from 'typeorm';
import cloudinary from 'src/common/config/multer.config';

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

  async getPublicIdFromUrl(url: string) {
    // Pisahkan berdasarkan "/upload/"
    const parts = url.split('/upload/');
    if (parts.length < 2) {
      return null;
    }

    // Ambil bagian setelah upload/
    let path = parts[1];

    // Hapus "v1234567890/" (versi auto Cloudinary)
    path = path.replace(/^v[0-9]+\/?/, '');

    // Buang extension (.jpg, .png, .pdf, dll)
    path = path.replace(/\.[^.]+$/, '');

    console.log('Public ID:', path); // Debug: lihat public ID yang dihasilkan

    await this.deleteFileIfExists(path);
  }

  async deleteFileIfExists(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'not found') {
        console.log('File not found in Cloudinary.');
      } else {
        console.log('File deleted from Cloudinary:', result);
      }
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw error;
    }
  }
}
