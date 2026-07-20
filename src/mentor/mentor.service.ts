import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Mentors } from 'src/entities/mentor.entity';
import { In, Repository } from 'typeorm';
import { Technology } from 'src/entities/technology.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MentorService {
  constructor(
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(Technology)
    private readonly teknologiRepository: Repository<Technology>,
    @InjectRepository(Course)
    private readonly kelasRepository: Repository<Course>,
  ) {}

  async create(createMentorDto: CreateMentorDto) {
    const course = await this.kelasRepository.findOne({
      where: { id: createMentorDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    let teknologi: Technology[] = [];
    if (
      createMentorDto.technologyId &&
      createMentorDto.technologyId.length > 0
    ) {
      teknologi = await this.teknologiRepository.findBy({
        id: In(createMentorDto.technologyId),
      });
    }
    const mentor = await this.mentorRepository.create({
      ...createMentorDto,
      course: course,
      teknologi: teknologi,
    });
    return await this.mentorRepository.save(mentor);
  }

  async findTeknologi() {
    return await this.teknologiRepository.find();
  }

  async findOne(mentorId: number) {
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
      relations: ['course', 'teknologi'],
    });
    if (!mentor) {
      throw new NotFoundException('mentor not found');
    }
    return mentor;
  }

  async update(mentorId: number, updateMentorDto: UpdateMentorDto) {
    const mentor = await this.findOne(mentorId);
    if (!mentor) {
      throw new NotFoundException('Program not found');
    }
    if (updateMentorDto.technologyId !== undefined) {
      if (updateMentorDto.technologyId.length > 0) {
        mentor.teknologi = await this.teknologiRepository.findBy({
          id: In(updateMentorDto.technologyId),
        });
      } else {
        mentor.teknologi = [];
      }
    }

    const { technologyId: _technologyId, ...otherProperties } = updateMentorDto;
    Object.assign(mentor, otherProperties);

    return await this.mentorRepository.save(mentor);
  }

  async remove(mentorId: number) {
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
