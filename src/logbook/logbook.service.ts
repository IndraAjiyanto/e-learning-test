import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Logbook } from 'src/entities/logbook.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import cloudinary from 'src/common/config/multer.config';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { paginateQuery } from 'src/common/utils/pagination.helper';
import { PaginationParams } from 'src/common/decorators/pagination.decorator';
import * as ExcelJS from 'exceljs';

@Injectable()
export class LogbookService {
  @InjectRepository(Logbook)
  private readonly logBookRepository: Repository<Logbook>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Pertemuan)
  private readonly pertemuanRepository: Repository<Pertemuan>;
  @InjectRepository(Kelas)
  private readonly kelasRepository: Repository<Kelas>;
  @InjectRepository(LogbookMentor)
  private readonly logBookMentorRepository: Repository<LogbookMentor>;
  @InjectRepository(ProgresPertemuan)
  private readonly progresPertemuanRepository: Repository<ProgresPertemuan>;

  async create(createLogbookDto: CreateLogbookDto) {
    const user = await this.userRepository.findOne({
      where: { id: createLogbookDto.userId },
    });
    const pertemuan = await this.pertemuanRepository.findOne({
      where: { id: createLogbookDto.pertemuanId },
    });
    if (!user) {
      throw new Error('User tidak ada');
    }
    if (!pertemuan) {
      throw new Error('pertemuan tidak ada');
    }
    const logbook = await this.logBookRepository.create({
      ...createLogbookDto,
      user: user,
      pertemuan: pertemuan,
    });
    return await this.logBookRepository.save(logbook);
  }

  async findByUser(userId: number) {
    return await this.logBookRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findKelasByUser(userId: number) {
    return await this.kelasRepository.find({
      where: { user_kelas: { user: { id: userId } } },
      relations: ['user_kelas', 'user_kelas.user', 'minggu'],
    });
  }

  async findAllKelas() {
    return await this.kelasRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findAll() {
    return await this.logBookRepository.find({
      relations: [
        'user',
        'pertemuan',
        'pertemuan.minggu',
        'pertemuan.minggu.kelas',
      ],
    });
  }

  async paginateLogbook(params: PaginationParams, userId?: number) {
    const { kelas, dateFrom, dateTo, search, page, limit } = params;

    console.log('🔍 Service paginateLogbook called:', { params, userId });

    const queryBuilder = this.logBookRepository
      .createQueryBuilder('logbook')
      .leftJoinAndSelect('logbook.user', 'user')
      .leftJoinAndSelect('user.biodata', 'biodata')
      .leftJoinAndSelect('logbook.pertemuan', 'pertemuan')
      .leftJoinAndSelect('pertemuan.minggu', 'minggu')
      .leftJoinAndSelect('minggu.kelas', 'kelas');

    // Filter by user if userId provided (for user role)
    if (userId) {
      queryBuilder.andWhere('logbook.userId = :userId', { userId });
      console.log('👤 Filtering by userId:', userId);
    }

    // Filter by kelas
    if (kelas) {
      queryBuilder.andWhere('kelas.id = :kelas', { kelas });
      console.log('🎓 Filtering by kelas:', kelas);
    }

    // Filter by date range
    if (dateFrom) {
      queryBuilder.andWhere('logbook.createdAt >= :dateFrom', {
        dateFrom: new Date(dateFrom as string),
      });
      console.log('📅 Filtering dateFrom:', dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('logbook.createdAt <= :dateTo', {
        dateTo: endDate,
      });
      console.log('📅 Filtering dateTo:', dateTo);
    }

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(logbook.kegiatan LIKE :search OR logbook.rincian_kegiatan LIKE :search OR logbook.kendala LIKE :search)',
        { search: `%${search}%` },
      );
      console.log('🔎 Search term:', search);
    }

    queryBuilder.orderBy('logbook.createdAt', 'DESC');

    // Log the SQL query
    const sql = queryBuilder.getSql();
    console.log('📝 SQL Query:', sql);

    const result = await paginateQuery(queryBuilder, page, limit);
    console.log('✅ Query result:', {
      total: result.total,
      itemsLength: result.items.length,
      page: result.page,
      totalPages: result.totalPages,
    });

    return result;
  }

  async findAllFiltered(filters: any, userId?: number) {
    const queryBuilder = this.logBookRepository
      .createQueryBuilder('logbook')
      .leftJoinAndSelect('logbook.user', 'user')
      .leftJoinAndSelect('user.biodata', 'biodata')
      .leftJoinAndSelect('logbook.pertemuan', 'pertemuan')
      .leftJoinAndSelect('pertemuan.minggu', 'minggu')
      .leftJoinAndSelect('minggu.kelas', 'kelas');

    if (userId) {
      queryBuilder.andWhere('logbook.userId = :userId', { userId });
    }

    if (filters.kelas) {
      queryBuilder.andWhere('kelas.id = :kelas', { kelas: filters.kelas });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('logbook.createdAt >= :dateFrom', {
        dateFrom: new Date(filters.dateFrom),
      });
    }

    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('logbook.createdAt <= :dateTo', {
        dateTo: endDate,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(logbook.kegiatan LIKE :search OR logbook.rincian_kegiatan LIKE :search OR logbook.kendala LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('logbook.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async generateExcel(logbooks: Logbook[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Logbook');

    // Define columns
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama', key: 'nama', width: 20 },
      { header: 'Kegiatan', key: 'kegiatan', width: 30 },
      { header: 'Rincian Kegiatan', key: 'rincian_kegiatan', width: 40 },
      { header: 'Kendala', key: 'kendala', width: 30 },
      { header: 'Kelas', key: 'kelas', width: 25 },
      { header: 'Pertemuan', key: 'pertemuan', width: 15 },
      { header: 'Status', key: 'proses', width: 12 },
      { header: 'Tanggal', key: 'createdAt', width: 20 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF374151' }, // gray-700
    };
    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    // Add data
    logbooks.forEach((log, index) => {
      worksheet.addRow({
        no: index + 1,
        nama: log.user?.biodata?.nama_lengkap || log.user?.username || '-',
        kegiatan: log.kegiatan || '-',
        rincian_kegiatan: log.rincian_kegiatan || '-',
        kendala: log.kendala || '-',
        kelas: log.pertemuan?.minggu?.kelas?.nama_kelas || '-',
        pertemuan: `Pertemuan ${log.pertemuan?.pertemuan_ke || '-'}`,
        proses: log.proses || '-',
        createdAt: log.createdAt
          ? new Date(log.createdAt).toLocaleString('id-ID')
          : '-',
      });
    });

    // Style all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'top', wrapText: true };
        }
      });
    });

    return await workbook.xlsx.writeBuffer();
  }

  async findLogBookMentor() {
    return await this.logBookMentorRepository.find({
      relations: [
        'user',
        'pertemuan',
        'pertemuan.minggu',
        'pertemuan.minggu.kelas',
      ],
    });
  }

  async findPertemuan(pertemuanId: number) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: { id: pertemuanId },
      relations: ['minggu', 'minggu.kelas'],
    });
    if (!pertemuan) {
      throw new NotFoundException('Session not found');
    }
    return pertemuan;
  }

  async getPublicIdFromUrl(url: string) {
    // Pisahkan berdasarkan "/upload/"
    const parts = url.split('/upload/');
    if (parts.length < 2) {
      return null;
    }

    // Ambil bagian setelah upload/
    let path = parts[1];

    // Hapus "v1234567890/" (versi auto Cloudinary)
    path = path.replace(/^v[0-9]+\/?/, '');

    // Buang extension (.jpg, .png, .pdf, dll)
    path = path.replace(/\.[^.]+$/, '');

    console.log('Public ID:', path); // Debug: lihat public ID yang dihasilkan

    await this.deleteFileIfExists(path);
  }

  async deleteFileIfExists(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'not found') {
        console.log('File not found in Cloudinary.');
      } else {
        console.log('File deleted from Cloudinary:', result);
      }
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw error;
    }
  }

  async findOne(logbookId: number) {
    const logbook = await this.logBookRepository.findOne({
      where: { id: logbookId },
      relations: [
        'pertemuan',
        'pertemuan.minggu',
        'pertemuan.minggu.kelas',
        'user',
      ],
    });
    if (!logbook) {
      throw new NotFoundException('log book not found');
    }
    return logbook;
  }

  async update(logbookId: number, updateLogbookDto: UpdateLogbookDto) {
    const logbook = await this.findOne(logbookId);
    if (!logbook) {
      throw new NotFoundException('logbook not found');
    }
    Object.assign(logbook, updateLogbookDto);

    if (updateLogbookDto.proses === 'acc') {
      // Cek apakah progres_pertemuan sudah ada
      const existingProgres = await this.progresPertemuanRepository.findOne({
        where: {
          user: { id: logbook.user.id },
          pertemuan: { id: logbook.pertemuan.id },
        },
      });

      if (existingProgres) {
        // Update jika sudah ada
        await this.progresPertemuanRepository.update(existingProgres.id, {
          logbook: true,
        });
      } else {
        // Buat baru jika belum ada
        await this.progresPertemuanRepository.save({
          user: { id: logbook.user.id },
          pertemuan: { id: logbook.pertemuan.id },
          logbook: true,
        });
      }
    } else if (updateLogbookDto.proses === 'rejected') {
      // Cek apakah progres_pertemuan sudah ada
      const existingProgres = await this.progresPertemuanRepository.findOne({
        where: {
          user: { id: logbook.user.id },
          pertemuan: { id: logbook.pertemuan.id },
        },
      });

      if (existingProgres) {
        // Update jika sudah ada
        await this.progresPertemuanRepository.update(existingProgres.id, {
          logbook: false,
        });
      } else {
        // Buat baru jika belum ada
        await this.progresPertemuanRepository.save({
          user: { id: logbook.user.id },
          pertemuan: { id: logbook.pertemuan.id },
          logbook: false,
        });
      }
    }

    return await this.logBookRepository.save(logbook);
  }

  remove(id: number) {
    return `This action removes a #${id} logbook`;
  }
}
