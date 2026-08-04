import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInstallmentsDto } from './dto/create-installments.dto';
import { UpdateInstallmentsDto } from './dto/update-installments.dto';
import { Installment } from '../entities/installment.entity';
import { Course } from '../entities/course.entity';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectRepository(Installment)
    private installmentsRepository: Repository<Installment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createCicilanDto: CreateInstallmentsDto) {
    const course = await this.courseRepository.findOne({
      where: { id: createCicilanDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(`Program not found`);
    }

    const installments = this.installmentsRepository.create({
      ...createCicilanDto,
      course,
    });

    return await this.installmentsRepository.save(installments);
  }

  async findAll() {
    return await this.installmentsRepository.find({
      relations: ['course'],
      order: { month: 'ASC' },
    });
  }

  async findOne(id: number) {
    const installments = await this.installmentsRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!installments) {
      throw new NotFoundException(`Installment not found`);
    }

    return installments;
  }

  async findByKelas(courseId: number) {
    return await this.installmentsRepository.find({
      where: { course: { id: courseId } },
      relations: ['course'],
      order: { month: 'ASC' },
    });
  }

    async findNo(courseId: number) {
        const installment = await this.findByKelas(courseId);
      const usedNumbers = installment.map((i) => Number(i.month));
      
      const availableNumbers = [3].filter(
        (n) => !usedNumbers.includes(n)
      );
      return availableNumbers;
  }

  async update(id: number, updateCicilanDto: UpdateInstallmentsDto) {
    const installments = await this.findOne(id);

    if (updateCicilanDto.courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: updateCicilanDto.courseId },
      });

      if (!course) {
        throw new NotFoundException(`Program not found`);
      }

      installments.course = course;
    }

    if (updateCicilanDto.price) {
      installments.price = updateCicilanDto.price;
    }

    if (updateCicilanDto.month) {
      installments.month = updateCicilanDto.month;
    }

    if (updateCicilanDto.downPayment) {
      installments.downPayment = updateCicilanDto.downPayment;
    }

    return await this.installmentsRepository.save(installments);
  }

  async remove(id: number) {
    const installments = await this.findOne(id);
    return await this.installmentsRepository.remove(installments);
  }
}
