import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgramBenefitDto } from './dto/create-benefit_kela.dto';
import { UpdateProgramBenefitDto } from './dto/update-benefit_kela.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgramBenefits } from 'src/entities/course_benefit.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';

@Injectable()
export class ProgramBenefitService {
  constructor(
    @InjectRepository(ProgramBenefits)
    private readonly programBenefitRepository: Repository<ProgramBenefits>,
    @InjectRepository(Course)
    private readonly kelasRepository: Repository<Course>,
  ) {}

  async create(createProgramBenefitDto: CreateProgramBenefitDto) {
    const course = await this.kelasRepository.findOne({
      where: { id: createProgramBenefitDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }
    const benefit_kelas = await this.programBenefitRepository.create({
      ...createProgramBenefitDto,
      course: course,
    });
    return await this.programBenefitRepository.save(benefit_kelas);
  }

  async findAll() {
    const benefit_kelas = await this.programBenefitRepository.find({
      relations: ['course'],
      order: { id: 'ASC' },
    });
    return benefit_kelas;
  }

  async findAllKelas() {
    const course = await this.kelasRepository.find({
      order: { id: 'ASC' },
    });
    return course;
  }

  async findKelas(courseId: number) {
    return await this.kelasRepository.findOne({ where: { id: courseId } });
  }

  async findOne(programBenefitId: number) {
    const benefit_kelas = await this.programBenefitRepository.findOne({
      where: { id: programBenefitId },
      relations: ['course'],
    });
    if (!benefit_kelas) {
      throw new NotFoundException('Benefit Program not found');
    }
    return benefit_kelas;
  }

  async update(
    programBenefitId: number,
    updateProgramBenefitDto: UpdateProgramBenefitDto,
  ) {
    const benefit_kelas = await this.findOne(programBenefitId);
    if (!benefit_kelas) {
      throw new NotFoundException('Benefit Program not found');
    }

    Object.assign(benefit_kelas, updateProgramBenefitDto);
    return await this.programBenefitRepository.save(benefit_kelas);
  }

  async remove(programBenefitId: number) {
    const benefit_kelas = await this.findOne(programBenefitId);
    if (!benefit_kelas) {
      throw new NotFoundException('Benefit Program not found');
    }
    return await this.programBenefitRepository.remove(benefit_kelas);
  }
}
