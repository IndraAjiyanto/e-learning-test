import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInstallmentsDto } from './dto/create-installments.dto';
import { UpdateInstallmentsDto } from './dto/update-installments.dto';
import { Installment } from '../entities/installment.entity';
import { Course } from '../entities/course.entity';
import { dateHelpers } from '../common/helpers/date.helpers';

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
    const installments = await this.installmentsRepository.find({
      relations: ['course'],
      order: { month: 'ASC' },
    });

    return installments.map((i) => ({
      ...i,
      dueDates: dateHelpers.toDateOnlyArray(i.dueDates),
    }));
  }

  async findOne(id: string) {
    const installments = await this.installmentsRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!installments) {
      throw new NotFoundException(`Installment not found`);
    }

    return {
      ...installments,
      dueDates: dateHelpers.toDateOnlyArray(installments.dueDates),
    };
  }

  async findByKelas(courseId: string) {
    return await this.installmentsRepository.find({
      where: { course: { id: courseId } },
      relations: ['course'],
      order: { month: 'ASC' },
    });
  }

  async findNo(courseId: string) {
    const installment = await this.findByKelas(courseId);
    const usedNumbers = installment.map((i) => Number(i.month));

    const availableNumbers = [3].filter((n) => !usedNumbers.includes(n));
    return availableNumbers;
  }

  async update(id: string, updateCicilanDto: UpdateInstallmentsDto) {
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

    if (updateCicilanDto.dueDates) {
      installments.dueDates = updateCicilanDto.dueDates;
    }

    return await this.installmentsRepository.save(installments);
  }

  async remove(id: string) {
    const installments = await this.findOne(id);
    return await this.installmentsRepository.remove(installments);
  }
}
