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
    private readonly technologiesRepository: Repository<Technology>,
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
    let technologies: Technology[] = [];
    if (
      createMentorDto.technologyId &&
      createMentorDto.technologyId.length > 0
    ) {
      technologies = await this.technologiesRepository.findBy({
        id: In(createMentorDto.technologyId),
      });
    }
    const mentor = await this.mentorRepository.create({
      ...createMentorDto,
      course: course,
      technologies: technologies,
    });
    return await this.mentorRepository.save(mentor);
  }

  async findTechnologies() {
    return await this.technologiesRepository.find();
  }

  async findOne(mentorId: number) {
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
      relations: ['course', 'technologies'],
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
        mentor.technologies = await this.technologiesRepository.findBy({
          id: In(updateMentorDto.technologyId),
        });
      } else {
        mentor.technologies = [];
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
