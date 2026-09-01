import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Logbook } from 'src/entities/logbook.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { ProgresQuiz } from 'src/entities/progres_quiz.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

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
  @InjectRepository(Quiz)
  private readonly quizRepository: Repository<Quiz>;
  @InjectRepository(ProgresQuiz)
  private readonly progresQuizRepository: Repository<ProgresQuiz>;

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

  async findByUser(userId: string) {
    return await this.logBookRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findLogBook(userId: string, kelasId: string) {
    return await this.logBookRepository.find({
      where: {
        user: { id: userId },
        pertemuan: { minggu: { kelas: { id: kelasId } } },
      },
      relations: [
        'user',
        'pertemuan',
        'pertemuan.minggu',
        'pertemuan.minggu.kelas',
      ],
    });
  }

  async findKelasByUser(userId: string) {
    return await this.kelasRepository.find({
      where: { user_kelas: { user: { id: userId } } },
      relations: ['user_kelas', 'user_kelas.user', 'minggu'],
    });
  }

  async findAllKelas() {
    return await this.kelasRepository.find({
      order: { createdAt: 'DESC' },
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

  async findUsers(pertemuanId: string) {
    return await this.userRepository.find({
      where: {
        user_kelas: {
          kelas: { minggu: { pertemuan: { id: pertemuanId } } },
        },
      },
      relations: ['user_kelas', 'user_kelas.user', 'user_kelas.kelas'],
    });
  }

  async findPertemuan(pertemuanId: string) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: { id: pertemuanId },
      relations: ['minggu', 'minggu.kelas'],
    });
    if (!pertemuan) {
      throw new NotFoundException('Session not found');
    }
    return pertemuan;
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }

  async findOne(logbookId: string) {
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

  async update(logbookId: string, updateLogbookDto: UpdateLogbookDto) {
    const logbook = await this.findOne(logbookId);
    if (!logbook) {
      throw new NotFoundException('logbook not found');
    }
    Object.assign(logbook, updateLogbookDto);

    if (updateLogbookDto.proses === 'acc') {
      const existingProgres = await this.progresPertemuanRepository.findOne({
        where: {
          user: { id: logbook.user.id },
          pertemuan: { id: logbook.pertemuan.id },
        },
        relations: ['pertemuan', 'pertemuan.minggu'],
      });

      if (existingProgres) {
        await this.progresPertemuanRepository.update(existingProgres.id, {
          logbook: true,
        });
      } else {
        await this.progresPertemuanRepository.save({
          user: { id: logbook.user.id },
          pertemuan: { id: logbook.pertemuan.id },
          logbook: true,
          absen: true,
        });
      }

      const pertemuan = await this.pertemuanRepository.findOne({
        where: { id: logbook.pertemuan.id },
        relations: ['minggu', 'minggu.kelas'],
      });
      if (pertemuan) {
        if (pertemuan.akhir) {
          const quiz = await this.quizRepository.findOne({
            where: {
              minggu: { id: pertemuan.minggu.id },
            },
          });
          if (quiz) {
            const existingProgresQuiz =
              await this.progresQuizRepository.findOne({
                where: { quiz: { id: quiz.id }, user: { id: logbook.user.id } },
              });
            if (existingProgresQuiz) {
              await this.progresQuizRepository.save({
                id: existingProgresQuiz.id,
                quiz: { id: quiz.id },
                user: { id: logbook.user.id },
                proses: true,
              });
            } else {
              await this.progresQuizRepository.save({
                quiz: { id: quiz.id },
                user: { id: logbook.user.id },
                proses: true,
              });
            }
          }
        } else {
          const pertemuan_selanjutnya = await this.pertemuanRepository.findOne({
            where: {
              pertemuan_ke: pertemuan.pertemuan_ke + 1,
              minggu: { id: pertemuan.minggu.id },
            },
          });

          if (pertemuan_selanjutnya) {
            const existingProgresPertemuan =
              await this.progresPertemuanRepository.findOne({
                where: {
                  user: { id: logbook.user.id },
                  pertemuan: { id: pertemuan_selanjutnya.id },
                },
              });
            if (existingProgresPertemuan) {
              await this.progresPertemuanRepository.save({
                id: existingProgresPertemuan.id,
                pertemuan: { id: pertemuan_selanjutnya.id },
                user: { id: logbook.user.id },
                absen: true,
                logbook: false,
              });
            } else {
              await this.progresPertemuanRepository.save({
                pertemuan: { id: pertemuan_selanjutnya.id },
                user: { id: logbook.user.id },
                absen: true,
                logbook: false,
              });
            }
          }
        }
      }
    } else if (updateLogbookDto.proses === 'rejected') {
      const existingProgres = await this.progresPertemuanRepository.findOne({
        where: {
          user: { id: logbook.user.id },
          pertemuan: { id: logbook.pertemuan.id },
        },
      });

      if (existingProgres) {
        await this.progresPertemuanRepository.update(existingProgres.id, {
          logbook: false,
        });
      } else {
        await this.progresPertemuanRepository.save({
          user: { id: logbook.user.id },
          pertemuan: { id: logbook.pertemuan.id },
          logbook: false,
        });
      }
    }

    return await this.logBookRepository.save(logbook);
  }

  async remove(logbookId: string) {
    const logbook = await this.findOne(logbookId);
    if (!logbook) {
      throw new NotFoundException('logbook not found');
    }
    await this.logBookRepository.remove(logbook);
  }
}
