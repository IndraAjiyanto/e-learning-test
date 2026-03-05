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
import { UserKelas } from 'src/entities/user_kelas.entity';
import { Pendaftaran } from 'src/entities/pendaftaran.entity';
import { Cicilan } from 'src/entities/cicilan.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { Minggu } from 'src/entities/minggu.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

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
    @InjectRepository(ProgresMinggu)
    private readonly progresMingguRepository: Repository<ProgresMinggu>,
    @InjectRepository(ProgresPertemuan)
    private readonly progresPertemuanRepository: Repository<ProgresPertemuan>,
    @InjectRepository(Minggu)
    private readonly mingguRepository: Repository<Minggu>,
    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,
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

  async addUserToKelas(userId: number, kelasId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
      relations: ['minggu', 'minggu.pertemuan'],
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

    await this.userKelasRepository.save(user_kelas);

    if (kelas.minggu.length > 0) {
      const minggu = await this.mingguRepository.findOne({
        where: { kelas: { id: kelasId }, minggu_ke: 1 },
        relations: ['pertemuan'],
      });
      const minggu_akhir = await this.mingguRepository.findOne({
        where: { kelas: { id: kelasId }, akhir: true },
      });
      if (minggu) {
        const existingProgresMinggu =
          await this.progresMingguRepository.findOne({
            where: {
              minggu: { id: minggu.id },
              user: { id: userId },
            },
          });
        if (existingProgresMinggu) {
          await this.progresMingguRepository.save({
            id: existingProgresMinggu.id,
            minggu: minggu,
            user: user,
            proses: true,
            quiz: false,
          });
        } else {
          await this.progresMingguRepository.save({
            minggu: minggu,
            user: user,
            proses: true,
            quiz: false,
          });
        }

        const pertemuan = await this.pertemuanRepository.findOne({
          where: { minggu: { id: minggu.id }, pertemuan_ke: 1 },
          relations: [],
        });
        if (pertemuan) {
          const existingProgresPertemuan =
            await this.progresPertemuanRepository.findOne({
              where: { pertemuan: { id: pertemuan.id }, user: { id: userId } },
            });
          if (existingProgresPertemuan) {
            await this.progresPertemuanRepository.save({
              id: existingProgresPertemuan.id,
              pertemuan: pertemuan,
              user: user,
              absen: true,
              logbook: false,
            });
          } else {
            await this.progresPertemuanRepository.save({
              pertemuan: pertemuan,
              user: user,
              absen: true,
              logbook: false,
            });
          }
        }
      } else if (minggu_akhir) {
        const progresMingguAkhir = await this.progresMingguRepository.findOne({
          where: {
            minggu: { id: minggu_akhir.id },
            user: { id: userId },
            proses: true,
            quiz: true,
          },
        });
        if (progresMingguAkhir) {
          await this.userKelasRepository.update(user_kelas.id, {
            progres: true,
          });
        }
      }
    }
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

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
