import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallmentPayment } from 'src/entities/installment-payment.entity';

@Injectable()
export class InstallmentPaymentService {
  constructor(
    @InjectRepository(InstallmentPayment)
    private readonly installmentPaymentRepository: Repository<InstallmentPayment>,
  ) {}

  async create(data: Partial<InstallmentPayment>) {
    const row = this.installmentPaymentRepository.create(data);
    return this.installmentPaymentRepository.save(row);
  }

  async save(row: InstallmentPayment) {
    return this.installmentPaymentRepository.save(row);
  }

  async findByNo(no: string) {
    return this.installmentPaymentRepository.findOne({
      where: { no },
      relations: ['payment', 'payment.course'],
    });
  }

  async findByPaymentId(paymentId: string) {
    return this.installmentPaymentRepository.find({
      where: { payment: { id: paymentId } },
      relations: ['payment'],
      order: { month: 'ASC' },
    });
  }

  async findOneByPaymentAndMonth(paymentId: string, month: number) {
    return this.installmentPaymentRepository.findOne({
      where: { payment: { id: paymentId }, month },
      relations: ['payment'],
    });
  }

  async findByPaymentIds(paymentIds: string[]) {
    if (!paymentIds || paymentIds.length === 0) return [];
    return this.installmentPaymentRepository
      .createQueryBuilder('ip')
      .leftJoinAndSelect('ip.payment', 'p')
      .where('p.id IN (:...ids)', { ids: paymentIds })
      .orderBy('ip.month', 'ASC')
      .getMany();
  }

  async findUnpaidByPaymentId(paymentId: string) {
    return this.installmentPaymentRepository.find({
      where: { payment: { id: paymentId }, status: 'process' },
    });
  }
}
