import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from 'src/entities/team.entity';
import { Repository } from 'typeorm';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    const team = this.teamRepository.create(createTeamDto);
    return await this.teamRepository.save(team);
  }

  async noPertemuan() {
    const team_old = await this.teamRepository.findOne({
      order: { team_ke: 'DESC' },
    });
    if (!team_old) {
      return 0;
    }
    const team_new = team_old.team_ke + 1;
    return team_new;
  }
  async findAll() {
    return await this.teamRepository.find();
  }

  async findOne(teamId: number) {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('team not found');
    }
    return team;
  }

  async update(teamId: number, updateTeamDto: UpdateTeamDto) {
    const team = await this.findOne(teamId);
    if (!team) {
      throw new NotFoundException('team not found');
    }
    Object.assign(team, updateTeamDto);
    return await this.teamRepository.save(team);
  }

  async remove(teamId: number) {
    const team = await this.findOne(teamId);
    if (!team) {
      throw new NotFoundException('team not found');
    }
    await this.teamRepository.remove(team);
    const allTeam = await this.teamRepository.find();
    for (const member of allTeam) {
      if (member.team_ke > team.team_ke) {
        member.team_ke -= 1;
        await this.teamRepository.save(member);
      }
    }
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
