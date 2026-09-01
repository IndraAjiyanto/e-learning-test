import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Mentor } from 'src/entities/mentor.entity';
import { In, Repository } from 'typeorm';
import { Teknologi } from 'src/entities/teknologi.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MentorService {
  constructor(
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
    @InjectRepository(Teknologi)
    private readonly teknologiRepository: Repository<Teknologi>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {}

  async create(createMentorDto: CreateMentorDto) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: createMentorDto.kelasId },
    });
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }
    let teknologi: Teknologi[] = [];
    if (
      Array.isArray(createMentorDto.teknologiIds) &&
      createMentorDto.teknologiIds.length > 0
    ) {
      teknologi = await this.teknologiRepository.findBy({
        id: In(createMentorDto.teknologiIds),
      });
    }
    const { teknologiIds, ...otherProperties } = createMentorDto;
    const mentor = await this.mentorRepository.create({
      ...otherProperties,
      kelas: kelas,
      teknologi: teknologi,
    });
    return await this.mentorRepository.save(mentor);
  }

  async findTeknologi() {
    return await this.teknologiRepository.find();
  }

  async findOne(mentorId: string) {
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
      relations: ['kelas', 'teknologi'],
    });
    if (!mentor) {
      throw new NotFoundException('mentor not found');
    }
    return mentor;
  }

  async update(mentorId: string, updateMentorDto: UpdateMentorDto) {
    const mentor = await this.findOne(mentorId);
    if (!mentor) {
      throw new NotFoundException('Program not found');
    }
    if (updateMentorDto.teknologiIds !== undefined) {
      if (updateMentorDto.teknologiIds.length > 0) {
        mentor.teknologi = await this.teknologiRepository.findBy({
          id: In(updateMentorDto.teknologiIds),
        });
      } else {
        mentor.teknologi = [];
      }
    }

    const { teknologiIds, ...otherProperties } = updateMentorDto;
    Object.assign(mentor, otherProperties);

    return await this.mentorRepository.save(mentor);
  }

  async remove(mentorId: string) {
    const mentor = await this.findOne(mentorId);
    if (!mentor) {
      throw new NotFoundException('Program not found');
    }
    return await this.mentorRepository.remove(mentor);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
