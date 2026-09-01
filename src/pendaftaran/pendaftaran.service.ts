import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';
import { UpdatePendaftaranDto } from './dto/update-pendaftaran.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pendaftaran } from 'src/entities/pendaftaran.entity';
import { Not, Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PendaftaranService {
  constructor(
    @InjectRepository(Pendaftaran)
    private readonly pendaftaranRepository: Repository<Pendaftaran>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserKelas)
    private readonly userKelasRepository: Repository<UserKelas>,
  ) {}

  async create(createPendaftaranDto: CreatePendaftaranDto) {
    const user = await this.userRepository.findOne({
      where: { id: createPendaftaranDto.userId },
    });
    if (!user) {
      return;
    }

    const kelas = await this.kelasRepository.findOne({
      where: { id: createPendaftaranDto.kelasId },
    });
    if (!kelas) {
      return;
    }

    const check = await this.checkPendaftaran(
      createPendaftaranDto.userId,
      createPendaftaranDto.kelasId,
    );
    if (check == false) {
      return false;
    } else {
      const pendaftaran = await this.pendaftaranRepository.create({
        ...createPendaftaranDto,
        user: user,
        kelas: kelas,
      });
      return await this.pendaftaranRepository.save(pendaftaran);
    }
  }

  async checkPendaftaran(userId: string, kelasId: string) {
    const pendaftaran = await this.pendaftaranRepository.find({
      where: {
        user: { id: userId },
        kelas: { id: kelasId },
        proses: Not('rejected'),
      },
    });
    if (pendaftaran.length) {
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
    } catch (error) {}
  }

  async findAll() {
    return await this.pendaftaranRepository.find();
  }

  async findPendaftaran(userId: string) {
    return await this.pendaftaranRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findOne(id: string) {
    const pendaftaran = await this.pendaftaranRepository.findOne({
      where: { id },
      relations: ['user', 'kelas'],
    });
    if (!pendaftaran) {
      throw new NotFoundException('registration not found');
    }
    return pendaftaran;
  }

  async addUserToKelas(userId: string, kelasId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['user_kelas', 'user_kelas.kelas'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
      relations: ['user_kelas', 'user_kelas.user'],
    });
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }

    const sudahGabung = await this.userKelasRepository.findOne({
      where: { user: { id: userId }, kelas: { id: kelasId } },
    });
    if (sudahGabung) {
      throw new BadRequestException('User already joined the program');
    }

    const user_kelas = await this.userKelasRepository.create({
      progres: false,
      user: user,
      kelas: kelas,
    });

    return await this.userKelasRepository.save(user_kelas);
  }

  async removeUserKelas(userId: string, kelasId: string): Promise<UserKelas> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
    });
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }

    const userKelas = await this.userKelasRepository.findOne({
      where: { user: { id: userId }, kelas: { id: kelasId } },
    });
    if (!userKelas) {
      throw new BadRequestException('User is not enrolled in this program');
    }

    return await this.userKelasRepository.remove(userKelas);
  }

  async update(
    pendaftaranId: string,
    updatePendaftaranDto: UpdatePendaftaranDto,
  ) {
    const pendaftaran = await this.findOne(pendaftaranId);
    if (!pendaftaran) {
      return;
    }
    Object.assign(pendaftaran, updatePendaftaranDto);
    return await this.pendaftaranRepository.save(pendaftaran);
  }
}
