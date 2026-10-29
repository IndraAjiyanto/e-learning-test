import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRegistrationsDto } from './dto/create-registrations.dto';
import { UpdateRegistrationsDto } from './dto/update-registrations.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Registration } from 'src/entities/registration.entity';
import { Not, Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Payment } from 'src/entities/payment.entity';
import { InvoiceService } from 'src/invoice/invoice.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly invoiceService: InvoiceService,
  ) {}

  async create(createRegistrationDto: CreateRegistrationsDto) {
    const user = await this.userRepository.findOne({
      where: { id: createRegistrationDto.userId },
      relations: ['biodata'],
    });
    if (!user) {
      return;
    }

    const course = await this.courseRepository.findOne({
      where: { id: createRegistrationDto.courseId },
      relations: ['category'],
    });
    if (!course) {
      return;
    }

    const check = await this.checkRegistration(
      createRegistrationDto.userId,
      createRegistrationDto.courseId,
    );
    if (check == false) {
      return false;
    }

    // 1. Generate nomor faktur resmi format WSA-KA.xxx/KW/{Bulan}/{Tahun}
    const invoiceNumber = await this.invoiceService.generateInvoiceNumber();

    // 2. Buat record Payment untuk menghubungkan registrasi dengan sistem pembayaran
    const payment = this.paymentRepository.create({
      no: invoiceNumber,
      user: user,
      course: course,
      file: createRegistrationDto.file || undefined,
      process: createRegistrationDto.process || 'approved',
      user_fullname:
        createRegistrationDto.user_fullname ||
        (user.biodata as { fullName?: string })?.fullName ||
        user.username,
      user_email: createRegistrationDto.user_email || user.email,
      user_no:
        createRegistrationDto.user_no ||
        (user.biodata as { no?: string })?.no ||
        undefined,
      current_status:
        (createRegistrationDto.current_status as any) || undefined,
      referalSource: createRegistrationDto.referal_source || undefined,
      attend_program: Boolean(createRegistrationDto.attend_program),
    });
    const savedPayment = await this.paymentRepository.save(payment);

    // 3. Generate Invoice resmi melalui InvoiceService
    const invoice = await this.invoiceService.createInvoiceForRegistration(
      savedPayment,
      course,
      user,
      createRegistrationDto,
    );
    const finalInvoiceNumber = invoice.invoice_number || invoiceNumber;

    // 4. Simpan record Registration dengan nomor invoice dan relasi payment
    const registration = this.registrationRepository.create({
      ...createRegistrationDto,
      no: finalInvoiceNumber,
      payment: savedPayment,
      user: user,
      course: course,
    });
    const savedRegistration =
      await this.registrationRepository.save(registration);

    return savedRegistration;
  }

  async checkRegistration(userId: string, courseId: string) {
    const registration = await this.registrationRepository.find({
      where: {
        user: { id: userId },
        course: { id: courseId },
        process: Not('rejected'),
      },
    });
    if (registration.length) {
      return false;
    } else {
      return true;
    }
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch {
      // ignore
    }
  }

  async findAll() {
    return await this.registrationRepository.find({
      relations: ['user', 'course', 'payment', 'payment.invoice'],
    });
  }

  async findRegistration(userId: string) {
    return await this.registrationRepository.find({
      where: { user: { id: userId } },
      relations: ['course', 'course.category', 'payment', 'payment.invoice'],
    });
  }

  async findOne(id: string) {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ['user', 'course', 'payment', 'payment.invoice'],
    });
    if (!registration) {
      throw new NotFoundException('registration not found');
    }
    return registration;
  }

  async addUserToCourse(userId: string, courseId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userCourses', 'userCourses.course'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['userCourses', 'userCourses.user'],
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const alreadyJoined = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (alreadyJoined) {
      throw new BadRequestException('User already joined the program');
    }

    const userCourses = this.userCourseRepository.create({
      progress: false,
      user: user,
      course: course,
    });

    return await this.userCourseRepository.save(userCourses);
  }

  async removeCourseUser(
    userId: string,
    courseId: string,
  ): Promise<UserCourse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Program not found');
    }

    const userCourse = await this.userCourseRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!userCourse) {
      throw new BadRequestException('User is not enrolled in this program');
    }

    return await this.userCourseRepository.remove(userCourse);
  }

  async update(
    registrationId: string,
    updateRegistrationDto: UpdateRegistrationsDto,
  ) {
    const registration = await this.findOne(registrationId);
    if (!registration) {
      return;
    }
    Object.assign(registration, updateRegistrationDto);
    const saved = await this.registrationRepository.save(registration);

    // Sinkronisasi status payment dan invoice terkait jika ada
    if (registration.payment && updateRegistrationDto.process) {
      registration.payment.process = updateRegistrationDto.process;
      if (registration.payment.invoice) {
        if (updateRegistrationDto.process === 'approved') {
          registration.payment.invoice.status = 'paid';
          registration.payment.invoice.paid_at = new Date();
        } else if (updateRegistrationDto.process === 'rejected') {
          registration.payment.invoice.status = 'expired';
        }
        await this.invoiceService.saveInvoice(registration.payment.invoice);
      }
      await this.paymentRepository.save(registration.payment);
    }

    return saved;
  }
}
