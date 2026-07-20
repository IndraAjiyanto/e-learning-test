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
    private cicilanRepository: Repository<Installment>,
    @InjectRepository(Course)
    private kelasRepository: Repository<Course>,
  ) {}

  async create(createCicilanDto: CreateInstallmentsDto) {
    const course = await this.kelasRepository.findOne({
      where: { id: createCicilanDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(`Program not found`);
    }

    const installments = this.cicilanRepository.create({
      ...createCicilanDto,
      course,
    });

    return await this.cicilanRepository.save(installments);
  }

  async findAll() {
    return await this.cicilanRepository.find({
      relations: ['course'],
      order: { month: 'ASC' },
    });
  }

  async findOne(id: number) {
    const installments = await this.cicilanRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!installments) {
      throw new NotFoundException(`Installment not found`);
    }

    return installments;
  }

  async findByKelas(courseId: number) {
    return await this.cicilanRepository.find({
      where: { course: { id: courseId } },
      relations: ['course'],
      order: { month: 'ASC' },
    });
  }

    async findNo(courseId: number) {
        const installment = await this.findByKelas(courseId);
      const usedNumbers = installment.map((i) => Number(i.month));
      
      const availableNumbers = [3, 6, 12].filter(
        (n) => !usedNumbers.includes(n)
      );
      return availableNumbers;
  }

  async update(id: number, updateCicilanDto: UpdateInstallmentsDto) {
    const installments = await this.findOne(id);

    if (updateCicilanDto.courseId) {
      const course = await this.kelasRepository.findOne({
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

    if (updateCicilanDto.down_payment) {
      installments.down_payment = updateCicilanDto.down_payment;
    }

    return await this.cicilanRepository.save(installments);
  }

  async remove(id: number) {
    const installments = await this.findOne(id);
    return await this.cicilanRepository.remove(installments);
  }
}
