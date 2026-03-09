import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJawabanUserDto } from './dto/create-jawaban_user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JawabanUser } from 'src/entities/jawaban_user.entity';
import { In, Repository } from 'typeorm';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { Jawaban } from 'src/entities/jawaban.entity';
import { User } from 'src/entities/user.entity';
import { Nilai } from 'src/entities/nilai.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';
import { Minggu } from 'src/entities/minggu.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';

@Injectable()
export class JawabanUsersService {
  @InjectRepository(JawabanUser)
  private readonly jawabanUserRepository: Repository<JawabanUser>;
  @InjectRepository(Pertanyaan)
  private readonly pertanyaanRepository: Repository<Pertanyaan>;
  @InjectRepository(Jawaban)
  private readonly jawabanRepository: Repository<Jawaban>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Nilai)
  private readonly nilaiRepository: Repository<Nilai>;
  @InjectRepository(Quiz)
  private readonly quizRepository: Repository<Quiz>;
  @InjectRepository(ProgresMinggu)
  private readonly progresMingguRepository: Repository<ProgresMinggu>;
  @InjectRepository(Minggu)
  private readonly mingguRepository: Repository<Minggu>;
  @InjectRepository(UserKelas)
  private readonly userKelasRepository: Repository<UserKelas>;
  @InjectRepository(ProgresPertemuan)
  private readonly progresPertemuanRepository: Repository<ProgresPertemuan>;
  @InjectRepository(Pertemuan)
  private readonly pertemuanRepository: Repository<Pertemuan>;

  async create(createJawabanUserDto: CreateJawabanUserDto) {
    const jawabanToInsert: JawabanUser[] = [];

    for (const j of createJawabanUserDto.jawabanUser) {
      const pertanyaan = await this.pertanyaanRepository.findOne({
        where: { id: j.pertanyaanId },
      });

      const user = await this.userRepository.findOne({
        where: { id: j.userId },
      });

      if (!pertanyaan)
        throw new NotFoundException(
          `Pertanyaan id ${j.pertanyaanId} tidak ditemukan`,
        );

      if (!user)
        throw new NotFoundException(`User id ${j.userId} tidak ditemukan`);

      const jawaban = j.jawabanId
        ? await this.jawabanRepository.findOne({ where: { id: j.jawabanId } })
        : null;

      const jawabanUser = this.jawabanUserRepository.create({
        pertanyaan,
        jawaban,
        user,
      });

      jawabanToInsert.push(jawabanUser);
    }

    return await this.jawabanUserRepository.save(jawabanToInsert);
  }

  async nilaiCreate(createJawabanUserDto: CreateJawabanUserDto) {
    const jawabanUser = createJawabanUserDto.jawabanUser;

    const jawabanIds = jawabanUser.map((j) => j.jawabanId);

    const jawabanBenar = await this.jawabanRepository.findBy({
      id: In(jawabanIds),
    });

    let benar = 0;
    jawabanBenar.forEach((j) => {
      if (j.jawaban_benar) {
        benar++;
      }
    });

    const totalSoal = jawabanUser.length;
    const nilai = Math.round((benar / totalSoal) * 100);

    const userId = jawabanUser[0].userId;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const quizId = await this.pertanyaanRepository
      .findOne({
        where: { id: jawabanUser[0].pertanyaanId },
        relations: ['quiz'],
      })
      .then((p) => p?.quiz.id);

    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['minggu'],
    });
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }

    if (nilai >= quiz.nilai_minimal) {
      await this.progresMinggu(quiz.minggu.id, userId);
      await this.updateProgresMinggu(quiz.minggu.id, userId);
    }

    await this.nilaiRepository.save({
      user: user,
      quiz: quiz,
      nilai,
    });
  }

  async updateProgresMinggu(mingguId: number, userId: number) {
    const progres_minggu = await this.progresMingguRepository.findOne({
      where: { minggu: { id: mingguId }, user: { id: userId } },
    });
    if (!progres_minggu) {
      throw new NotFoundException('progres_minggu not found');
    }

    progres_minggu.quiz = true;
    await this.progresMingguRepository.save(progres_minggu);

    return progres_minggu;
  }

  async progresMinggu(mingguId: number, userId: number) {
    const minggu_sebelum = await this.mingguRepository.findOne({
      where: { id: mingguId },
      relations: ['kelas'],
    });
    if (!minggu_sebelum) {
      throw new NotFoundException('minggu_sebelum not found');
    } else if (minggu_sebelum.akhir === true) {
      const existingUserKelas = await this.userKelasRepository.findOne({
        where: { kelas: { id: minggu_sebelum.kelas.id }, user: { id: userId } },
      });
      if (existingUserKelas) {
        await this.userKelasRepository.save({
          id: existingUserKelas.id,
          kelas: { id: minggu_sebelum.kelas.id },
          user: { id: userId },
          progres: true,
          quiz: true,
        });
      } else {
        await this.userKelasRepository.save({
          kelas: { id: minggu_sebelum.kelas.id },
          user: { id: userId },
          progres: true,
          quiz: true,
        });
      }
    } else {
      const minggu = await this.mingguRepository.findOne({
        where: {
          minggu_ke: minggu_sebelum.minggu_ke + 1,
          kelas: { id: minggu_sebelum.kelas.id },
        },
        relations: ['pertemuan'],
      });
      if (minggu) {
        if (minggu.pertemuan.length > 0) {
          const pertemuan_satu = await this.pertemuanRepository.findOne({
            where: { minggu: { id: minggu.id }, pertemuan_ke: 1 },
          });
          if (pertemuan_satu) {
            const existingProgresPertemuan =
              await this.progresPertemuanRepository.findOne({
                where: {
                  pertemuan: { id: pertemuan_satu.id },
                  user: { id: userId },
                },
              });
            if (existingProgresPertemuan) {
              await this.progresPertemuanRepository.save({
                id: existingProgresPertemuan.id,
                user: { id: userId },
                pertemuan: pertemuan_satu,
                logbook: false,
                absen: true,
              });
            } else {
              await this.progresPertemuanRepository.save({
                user: { id: userId },
                pertemuan: pertemuan_satu,
                logbook: false,
                absen: true,
              });
            }
          }
        }
        const existingProgres = await this.progresMingguRepository.findOne({
          where: { minggu: { id: minggu.id }, user: { id: userId } },
        });
        if (existingProgres) {
          await this.progresMingguRepository.update(existingProgres.id, {
            proses: true,
          });
        } else {
          await this.progresMingguRepository.save({
            minggu: minggu,
            user: { id: userId },
            proses: true,
            quiz: false,
          });
        }
      }
    }
  }

  async findByUserAndPertanyaan(userId: number, pertanyaanId: number) {
    return await this.jawabanUserRepository.find({
      where: { user: { id: userId }, pertanyaan: { id: pertanyaanId } },
      relations: ['jawaban'],
    });
  }

  async findJawabanByUser(userId: number) {
    return await this.jawabanUserRepository.find({
      where: { user: { id: userId } },
      relations: ['jawaban'],
    });
  }

  async AmountNilai(mingguId: number, userId: number) {
    const jawaban = await this.jawabanUserRepository.find({
      where: { pertanyaan: { quiz: { id: mingguId } }, user: { id: userId } },
      relations: ['jawaban'],
    });

    const jumlahSoal = jawaban.length;
    const nilaiPerSoal = 100 / jumlahSoal;

    const totalNilai = jawaban.reduce((sum, j) => {
      if (j.jawaban !== null && j.jawaban.jawaban_benar) {
        return sum + nilaiPerSoal;
      }
      return sum;
    }, 0);

    return totalNilai;
  }
}
