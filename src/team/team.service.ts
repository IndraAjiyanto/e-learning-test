import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from 'src/entities/team.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';

// Tidak ada ValidationPipe global, jadi DTO tidak memvalidasi instagram.
const INSTAGRAM_PATTERN =
  /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?(\?.*)?$/;

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  private assertValidInstagram(instagram?: string) {
    const value = instagram?.trim();
    if (value && !INSTAGRAM_PATTERN.test(value)) {
      throw new BadRequestException('Please enter a valid Instagram URL.');
    }
  }

  async create(createTeamDto: CreateTeamDto) {
    this.assertValidInstagram(createTeamDto.instagram);
    const team = this.teamRepository.create(createTeamDto);
    return await this.teamRepository.save(team);
  }

  async getNextOrder() {
    const team_old = await this.teamRepository.find({
      order: { teamOrder: 'DESC' },
      take: 1,
    });
    if (!team_old || team_old.length === 0) {
      return 0;
    }
    const team_new = team_old[0].teamOrder + 1;
    return team_new;
  }
  async findAll() {
    return await this.teamRepository.find({ order: { teamOrder: 'ASC' } });
  }

  async findOne(teamId: string) {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('team not found');
    }
    return team;
  }

  async update(teamId: string, updateTeamDto: UpdateTeamDto) {
    this.assertValidInstagram(updateTeamDto.instagram);
    const team = await this.findOne(teamId);
    if (!team) {
      throw new NotFoundException('team not found');
    }
    Object.assign(team, updateTeamDto);
    return await this.teamRepository.save(team);
  }

  async remove(teamId: string) {
    const team = await this.findOne(teamId);
    if (!team) {
      throw new NotFoundException('team not found');
    }
    await this.teamRepository.remove(team);
    const allTeam = await this.teamRepository.find();
    for (const member of allTeam) {
      if (member.teamOrder > team.teamOrder) {
        member.teamOrder -= 1;
        await this.teamRepository.save(member);
      }
    }
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
