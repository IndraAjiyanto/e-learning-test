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
import cloudinary from 'src/common/config/multer.config';

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

  async checkPendaftaran(userId: number, kelasId: number) {
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

  async findAll() {
    return await this.pendaftaranRepository.find();
  }

  async findPendaftaran(userId: number) {
    return await this.pendaftaranRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findOne(id: number) {
    return await this.pendaftaranRepository.findOne({
      where: { id },
      relations: ['user', 'kelas'],
    });
  }

  async addUserToKelas(userId: number, kelasId: number) {
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

  async update(
    pendaftaranId: number,
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
