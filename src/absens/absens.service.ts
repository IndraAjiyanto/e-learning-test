import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { UpdateAbsenDto } from './dto/update-absen.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Absen } from 'src/entities/absen.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';

@Injectable()
export class AbsensService {
  constructor(
    @InjectRepository(Absen)
    private readonly absenRepository: Repository<Absen>,

    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ProgresPertemuan)
    private readonly progresPertemuanRepository: Repository<ProgresPertemuan>,

    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {}

  async create(CreateAbsenDto: CreateAbsenDto) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: { id: CreateAbsenDto.pertemuanId },
      relations: ['minggu'],
    });
    const user = await this.userRepository.findOne({
      where: { id: CreateAbsenDto.userId },
    });
    if (!pertemuan) {
      throw new NotFoundException('pertemuan ini tidak ada');
    }
    if (!user) {
      throw new NotFoundException('user ini tidak ada');
    }
    const absen = await this.absenRepository.create({
      ...CreateAbsenDto,
      pertemuan: pertemuan,
      user: user,
    });

    return await this.absenRepository.save(absen);
  }

  async findAll() {
    return await this.absenRepository.find({
      relations: ['pertemuan', 'user', 'pertemuan.kelas'],
    });
  }

  async findPertemuan(pertemuanId: number) {
    return await this.pertemuanRepository.findOne({
      where: { id: pertemuanId },
      relations: ['minggu', 'minggu.kelas'],
    });
  }

  async findUsers(pertemuanId: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { minggu: { pertemuan: { id: pertemuanId } } },
    });
    if (!kelas) {
      return '';
    }
    return await this.userRepository.find({
      where: { role: 'user', user_kelas: { kelas: { id: kelas.id } } },
    });
  }

  async findKelas() {
    return await this.kelasRepository.find({ relations: ['pertemuan'] });
  }

  async findOne(id: number) {
    const absen = await this.absenRepository.findOne({
      where: { id },
      relations: ['pertemuan', 'user'],
    });
    if (!absen) {
      throw new NotFoundException(`absen tidak ditemukan`);
    }

    if (!absen.pertemuan) {
      throw new NotFoundException('pertemuan tidak ditemukan');
    }

    if (!absen.user) {
      throw new NotFoundException('user tidak ditemukan');
    }
    return absen;
  }

  async update(id: number, updateAbsenDto: UpdateAbsenDto) {
    const absen = await this.findOne(id);
    if (!absen) {
      throw new NotFoundException('absen tidak ditemukan');
    }
    Object.assign(absen, updateAbsenDto);
    return await this.absenRepository.save(absen);
  }

  async remove(id: number, pertemuanId: number) {
    const absen = await this.findOne(id);
    if (!absen) {
      throw new NotFoundException('absen tidak ditemukan');
    }
    const progres_pertemuan = await this.progresPertemuanRepository.findOne({
      where: { user: { id: absen.user.id }, pertemuan: { id: pertemuanId } },
    });

    if (progres_pertemuan) {
      await this.progresPertemuanRepository.remove(progres_pertemuan);
    }
    return await this.absenRepository.remove(absen);
  }
}
