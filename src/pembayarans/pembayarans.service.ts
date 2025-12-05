import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePembayaranDto } from './dto/create-pembayaran.dto';
import { UpdatePembayaranDto } from './dto/update-pembayaran.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pembayaran } from 'src/entities/pembayaran.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { v2 as cloudinary } from 'cloudinary';
import { UserKelas } from 'src/entities/user_kelas.entity';
import { Pendaftaran } from 'src/entities/pendaftaran.entity';
import { Cicilan } from 'src/entities/cicilan.entity';

@Injectable()
export class PembayaransService {
  constructor(
    @InjectRepository(Pembayaran)
    private readonly pembayaranRepository: Repository<Pembayaran>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pendaftaran)
    private readonly pendaftaranRepository: Repository<Pendaftaran>,
    @InjectRepository(Cicilan)
    private readonly cicilanRepository: Repository<Cicilan>,
    @InjectRepository(UserKelas)
    private readonly userKelasRepository: Repository<UserKelas>,
  ) {}

  async create(createPembayaranDto: CreatePembayaranDto) {
    const user = await this.userRepository.findOne({
      where: { id: createPembayaranDto.userId },
    });
    if (!user) {
      return;
    }

    const kelas = await this.kelasRepository.findOne({
      where: { id: createPembayaranDto.kelasId },
    });
    if (!kelas) {
      return;
    }

    if (createPembayaranDto.cicilanId) {
      const cicilan = await this.cicilanRepository.findOne({
        where: { id: createPembayaranDto.cicilanId },
      });
      if (!cicilan) {
        return;
      }
      const check = await this.checkPembayaran(
        createPembayaranDto.userId,
        createPembayaranDto.kelasId,
      );
      if (check == false) {
        return false;
      } else {
        const pembayaran = await this.pembayaranRepository.create({
          ...createPembayaranDto,
          user: user,
          kelas: kelas,
          cicilan: cicilan,
        });
        return await this.pembayaranRepository.save(pembayaran);
      }
    }

    const check = await this.checkPembayaran(
      createPembayaranDto.userId,
      createPembayaranDto.kelasId,
    );
    if (check == false) {
      return false;
    } else {
      const pembayaran = await this.pembayaranRepository.create({
        ...createPembayaranDto,
        user: user,
        kelas: kelas,
      });
      return await this.pembayaranRepository.save(pembayaran);
    }
  }

  async addUserToKelas(userId: number, kelasId: number): Promise<UserKelas> {
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

  async removeUserKelas(userId: number, kelasId: number): Promise<UserKelas> {
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

  async checkPembayaran(userId: number, kelasId: number) {
    const pembayaran = await this.pembayaranRepository.find({
      where: {
        user: { id: userId },
        kelas: { id: kelasId },
        proses: Not('rejected'),
      },
    });
    if (pembayaran.length) {
      return false;
    } else {
      return true;
    }
  }

  async findKelas(kelasId: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
      relations: ['minggu', 'kategori'],
    });
    if (!kelas) {
      return;
    } else {
      return kelas;
    }
  }

  async findPembayaran(userId: number) {
    const pembayaran = await this.pembayaranRepository.find({
      where: {
        user: { id: userId },
        cicilan: IsNull(),
      },
      relations: ['kelas', 'kelas.kategori', 'cicilan'],
    });

    if (!pembayaran) {
      return;
    } else {
      return pembayaran;
    }
  }

  async findCicilan(userId: number) {
    return await this.pembayaranRepository.find({
      where: {
        user: { id: userId },
        cicilan: Not(IsNull()),
      },
      relations: ['kelas', 'kelas.kategori', 'cicilan'],
    });
  }

  async findPendaftaran(userId: number) {
    return await this.pendaftaranRepository.find({
      where: { user: { id: userId } },
      relations: ['kelas', 'kelas.kategori'],
    });
  }

  async findAll() {
    return await this.pembayaranRepository.find({
      where: { cicilan: IsNull() },
      relations: ['user', 'kelas', 'kelas.kategori'],
    });
  }

  async findAllCicilan() {
    return await this.pembayaranRepository.find({
      where: { cicilan: Not(IsNull()) },
      relations: ['user', 'kelas', 'kelas.kategori', 'cicilan'],
    });
  }

  async findAllPendaftaran() {
    return await this.pendaftaranRepository.find({
      relations: ['user', 'kelas', 'kelas.kategori'],
    });
  }

  async findOne(pembayaranId: number) {
    const pembayaran = await this.pembayaranRepository.findOne({
      where: { id: pembayaranId },
      relations: ['user', 'kelas'],
    });
    if (!pembayaran) {
      throw new NotFoundException('Payment not found');
    } else {
      return pembayaran;
    }
  }

  async update(pembayaranId: number, updatePembayaranDto: UpdatePembayaranDto) {
    const pembayaran = await this.findOne(pembayaranId);
    if (!pembayaran) {
      return;
    }
    Object.assign(pembayaran, updatePembayaranDto);
    return await this.pembayaranRepository.save(pembayaran);
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


    await this.deleteFileIfExists(path);
  }

  async deleteFileIfExists(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'not found') {
      } else {
      }
    } catch (error) {
      throw error;
    }
  }
}
