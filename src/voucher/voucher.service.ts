import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Voucher } from 'src/entities/voucher.entity';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';

import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

function parseBool(val: any): boolean {
  if (Array.isArray(val)) val = val[val.length - 1];
  if (typeof val === 'string') return val === 'true';
  return !!val;
}

function parseFloat(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function parseIds(val: any): number[] {
  if (val === undefined || val === null) return [];
  if (!Array.isArray(val)) val = [val];
  return val.map(Number).filter((n: number) => !isNaN(n));
}

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,

    // Dipakai untuk mencari Course berdasarkan array courseIds
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Buat voucher baru + assign daftar program
  async create(dto: CreateVoucherDto): Promise<Voucher> {
    const voucher = this.voucherRepository.create({
      code_voucher: dto.code_voucher,
      type: dto.type,
      percent: dto.type === 'discount' ? parseFloat(dto.percent) : null,
      active: parseBool(dto.active),
      allowed_user_ids: parseIds(dto.allowed_user_ids),
    });

    // Jika ada courseIds, cari Course-nya lalu assign ke relasi
    const ids = parseIds(dto.courseIds);
    if (ids.length > 0) {
      voucher.courses = await this.courseRepository.findBy({
        id: In(ids),
      });
    } else {
      voucher.courses = [];
    }

    return this.voucherRepository.save(voucher);
  }

  // Ambil semua voucher + jumlah program (courses) per voucher
  async findAll(): Promise<Voucher[]> {
    return this.voucherRepository.find({
      relations: ['courses'],
      order: { createdAt: 'DESC' },
    });
  }

  // Ambil daftar seluruh user untuk dropdown
  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'username', 'email'],
      order: { username: 'ASC' },
    });
  }

  // Ambil satu voucher + daftar program lengkap (untuk halaman edit)
  async findOne(id: number): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({
      where: { id },
      relations: ['courses'],
    });
    if (!voucher) throw new NotFoundException('Voucher tidak ditemukan');
    return voucher;
  }

  // Update voucher + sinkronisasi daftar program
  async update(id: number, dto: UpdateVoucherDto): Promise<Voucher> {
    const voucher = await this.findOne(id);

    // Update field scalar
    if (dto.code_voucher !== undefined) voucher.code_voucher = dto.code_voucher;
    if (dto.type !== undefined) voucher.type = dto.type;
    if (dto.active !== undefined) voucher.active = parseBool(dto.active);
    if (dto.allowed_user_ids !== undefined)
      voucher.allowed_user_ids = parseIds(dto.allowed_user_ids);

    // percent hanya disimpan jika type = 'discount'
    if (dto.type === 'discount') {
      voucher.percent = parseFloat(dto.percent) ?? voucher.percent;
    } else if (dto.type === 'free') {
      voucher.percent = null;
    }

    // Sinkronisasi relasi many-to-many:
    // Timpa seluruh daftar courses dengan yang baru dari form
    if (dto.courseIds !== undefined) {
      const ids = parseIds(dto.courseIds);
      voucher.courses =
        ids.length > 0
          ? await this.courseRepository.findBy({ id: In(ids) })
          : [];
    }

    return this.voucherRepository.save(voucher);
  }

  // Hapus voucher (relasi di voucher_programs ikut terhapus via CASCADE)
  async remove(id: number): Promise<void> {
    const voucher = await this.findOne(id);
    await this.voucherRepository.remove(voucher);
  }

  // Ambil semua program untuk ditampilkan di search-select form
  async findAllCourses(): Promise<Course[]> {
    return this.courseRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  // Validasi voucher untuk frontend
  async validateVoucher(
    code: string,
    courseId: number,
    subtotal: number,
    userId?: number,
  ): Promise<{ discountAmount: number; finalTotal: number; voucher: Voucher }> {
    const voucher = await this.voucherRepository.findOne({
      where: { code_voucher: ILike(code), active: true },
      relations: ['courses'],
    });

    if (!voucher) {
      throw new Error('Voucher tidak ditemukan atau tidak aktif.');
    }

    // Jika courses ada isinya, pastikan courseId pembeli ada di daftar tersebut
    if (voucher.courses && voucher.courses.length > 0) {
      const isCourseValid = voucher.courses.some((c) => c.id == courseId);
      if (!isCourseValid) {
        throw new Error('Voucher tidak berlaku untuk program ini.');
      }
    }

    if (userId) {
      // 1. Pengecekan Targeted Voucher (Hanya user tertentu yang boleh pakai)
      if (voucher.allowed_user_ids && voucher.allowed_user_ids.length > 0) {
        if (!voucher.allowed_user_ids.includes(userId)) {
          throw new Error(
            'Anda tidak memiliki hak akses untuk menggunakan kode voucher ini.',
          );
        }
      }

      // 2. Pengecekan Kuota 1x Pakai per User (Menggunakan query langsung ke tabel Payment)
      // Karena kita menghapus PromoUsageLog, pengecekan ini idealnya dilakukan di PaymentService,
      // atau dengan menginjeksi DataSource/PaymentRepository ke sini.
    }

    let discountAmount = 0;
    if (voucher.type === 'free') {
      discountAmount = subtotal;
    } else if (voucher.type === 'discount' && voucher.percent) {
      discountAmount = subtotal * (voucher.percent / 100);
    }

    if (discountAmount <= 0) {
      throw new Error(
        'Voucher ini tidak memberikan potongan harga. Silakan periksa konfigurasi persentase diskon di menu admin.',
      );
    }

    // Ensure discount does not exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);

    return {
      discountAmount,
      finalTotal,
      voucher,
    };
  }
}
