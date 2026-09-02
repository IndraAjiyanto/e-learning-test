import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParticipantsDto } from './dto/create-participants.dto';
import { UpdateParticipantsDto } from './dto/update-participants.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Participants } from 'src/entities/participants.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participants)
    private readonly participantsRepository: Repository<Participants>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createParticipantsDto: CreateParticipantsDto) {
    const course = await this.courseRepository.findOne({
      where: { id: createParticipantsDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    const participants = await this.participantsRepository.create({
      ...createParticipantsDto,
      course: course,
    });
    return await this.participantsRepository.save(participants);
  }

  async findAll() {
    const participants = await this.participantsRepository.find({
      relations: ['course'],
      order: { createdAt: 'ASC' },
    });
    return participants;
  }

  async findAllCourses() {
    const course = await this.courseRepository.find({
      order: { createdAt: 'ASC' },
    });
    return course;
  }

  async findCourse(courseId: string) {
    return await this.courseRepository.findOne({ where: { id: courseId } });
  }

  async findOne(participantId: string) {
    const participants = await this.participantsRepository.findOne({
      where: { id: participantId },
      relations: ['course'],
    });
    if (!participants) {
      throw new NotFoundException('Participant not found');
    }
    return participants;
  }

  async update(
    participantId: string,
    updateParticipantsDto: UpdateParticipantsDto,
  ) {
    const participants = await this.findOne(participantId);
    if (!participants) {
      throw new NotFoundException('Participant not found');
    }

    Object.assign(participants, updateParticipantsDto);
    return await this.participantsRepository.save(participants);
  }

  async remove(participantId: string) {
    const participants = await this.findOne(participantId);
    if (!participants) {
      throw new NotFoundException('Participant not found');
    }
    return await this.participantsRepository.remove(participants);
  }
}
