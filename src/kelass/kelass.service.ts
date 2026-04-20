import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { In, IsNull, Not, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { Minggu } from 'src/entities/minggu.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { Pembayaran } from 'src/entities/pembayaran.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';
import { Mentor } from 'src/entities/mentor.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Teknologi } from 'src/entities/teknologi.entity';
import { Mentoring } from 'src/entities/mentoring.entity';
import { Pendaftaran } from 'src/entities/pendaftaran.entity';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';
import { PertanyaanKelas } from 'src/entities/pertanyaan_kelas.entity';
import { BenefitKelas } from 'src/entities/benefit_kelas.entity';
import { AlurKelas } from 'src/entities/alur_kelas.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Cicilan } from 'src/entities/cicilan.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Portfolio } from 'src/entities/portfolio.entity';

@Injectable()
export class KelassService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Kategori)
    private readonly kategoriRepository: Repository<Kategori>,
    @InjectRepository(JenisKelas)
    private readonly jenisKelasRepository: Repository<JenisKelas>,
    @InjectRepository(Minggu)
    private readonly mingguRepository: Repository<Minggu>,
    @InjectRepository(ProgresMinggu)
    private readonly progresMingguRepository: Repository<ProgresMinggu>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(ProgresPertemuan)
    private readonly progresPertemuanRepository: Repository<ProgresPertemuan>,
    @InjectRepository(Pembayaran)
    private readonly pembayaranRepository: Repository<Pembayaran>,
    @InjectRepository(UserKelas)
    private readonly userKelasRepository: Repository<UserKelas>,
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
    @InjectRepository(Logbook)
    private readonly logbookRepository: Repository<Logbook>,
    @InjectRepository(LogbookMentor)
    private readonly logbookMentorRepository: Repository<LogbookMentor>,
    @InjectRepository(Teknologi)
    private readonly teknologiRepository: Repository<Teknologi>,
    @InjectRepository(Mentoring)
    private readonly mentoringRepository: Repository<Mentoring>,
    @InjectRepository(Pendaftaran)
    private readonly pendaftaranRepository: Repository<Pendaftaran>,
    @InjectRepository(PertanyaanKelas)
    private readonly pertanyaanKelasRepository: Repository<PertanyaanKelas>,
    @InjectRepository(BenefitKelas)
    private readonly benefitKelasRepository: Repository<BenefitKelas>,
    @InjectRepository(AlurKelas)
    private readonly alurKelasRepository: Repository<AlurKelas>,
    @InjectRepository(Alumni)
    private readonly alumniRepository: Repository<Alumni>,
    @InjectRepository(Cicilan)
    private readonly cicilanRepository: Repository<Cicilan>,
    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
  ) {}

  async findOneKategori(kategoriId: number) {
    const kategori = await this.kategoriRepository.findOne({
      where: { id: kategoriId },
    });
    if (!kategori) {
      throw new NotFoundException('category not Found');
    }
    return kategori;
  }

      async findNo(kelasId: number) {
        const installment = await this.findCicilanKelas(kelasId);
      const usedNumbers = installment.map((i) => Number(i.bulan));
      
      const availableNumbers = [3, 6, 12].filter(
        (n) => !usedNumbers.includes(n)
      );
      return availableNumbers;
  }

  async create(createKelassDto: CreateKelassDto) {
    const kategori = await this.kategoriRepository.findOne({
      where: { id: createKelassDto.kategoriId },
    });
    if (!kategori) {
      throw new NotFoundException('category not Found');
    }
    const jenis_kelas = await this.jenisKelasRepository.findOne({
      where: { id: createKelassDto.jenis_kelasId },
    });
    if (!jenis_kelas) {
      throw new NotFoundException('type program not Found');
    }

    let teknologi: Teknologi[] = [];
    if (
      createKelassDto.teknologiIds &&
      createKelassDto.teknologiIds.length > 0
    ) {
      teknologi = await this.teknologiRepository.findBy({
        id: In(createKelassDto.teknologiIds),
      });
    }

    const kelas = await this.kelasRepository.create({
      ...createKelassDto,
      kategori: kategori,
      jenis_kelas: jenis_kelas,
      teknologi: teknologi,
    });
    return await this.kelasRepository.save(kelas);
  }

  async createMentoring(userId: number, kelasId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: 'admin' },
    });
    if (!user) {
      throw new NotFoundException('User not Found');
    }

    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
    });
    if (!kelas) {
      throw new NotFoundException('Program not Found');
    }

    const mentoring = await this.mentoringRepository.create({
      kelas: kelas,
      user: user,
    });
    return await this.mentoringRepository.save(mentoring);
  }

  async updateMentoring(userId: number, kelasId: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
    });

    if (!kelas) {
      throw new NotFoundException('Program not Found');
    }

    const newMentorUser = await this.userRepository.findOne({
      where: { id: userId, role: 'admin' },
    });

    if (!newMentorUser) {
      throw new NotFoundException(`Mentor not Found`);
    }

    const existingMentoring = await this.mentoringRepository.findOne({
      where: { kelas: { id: kelasId } },
      relations: ['kelas', 'user'],
    });

    if (existingMentoring) {
      existingMentoring.user = newMentorUser;
      return await this.mentoringRepository.save(existingMentoring);
    } else {
      const newMentoring = this.mentoringRepository.create({
        user: newMentorUser,
        kelas: kelas,
      });
      return await this.mentoringRepository.save(newMentoring);
    }
  }

  async addUserToKelas(userId: number, kelasId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
      relations: ['minggu', 'minggu.pertemuan'],
    });
    if (!kelas) {
      throw new NotFoundException('Program Not Found');
    }

    const sudahGabung = await this.userKelasRepository.findOne({
      where: { user: { id: userId }, kelas: { id: kelasId } },
    });
    if (sudahGabung) {
      throw new BadRequestException('User already joined the program');
    }

    if (kelas.check_paid === true) {
      const daftar = await this.pembayaranRepository.find({
        where: { kelas: { id: kelasId }, proses: 'proces' },
      });

      const gabung = await this.userRepository.find({
        where: { user_kelas: { kelas: { id: kelasId } } },
      });
      const jumlah_user = daftar.length + gabung.length;

      if (jumlah_user >= kelas.kuota) {
        throw new BadRequestException('The program is currently full');
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
              where: { minggu: { id: minggu.id }, user: { id: userId } },
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
                where: {
                  pertemuan: { id: pertemuan.id },
                  user: { id: userId },
                },
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
          const progresMingguAkhir = await this.progresMingguRepository.findOne(
            {
              where: {
                minggu: { id: minggu_akhir.id },
                user: { id: userId },
                proses: true,
                quiz: true,
              },
            },
          );
          if (progresMingguAkhir) {
            await this.userKelasRepository.update(user_kelas.id, {
              progres: true,
            });
          }
        }
      }
    } else {
      const daftar = await this.pendaftaranRepository.find({
        where: { kelas: { id: kelasId }, proses: 'proces' },
      });

      const gabung = await this.userRepository.find({
        where: { user_kelas: { kelas: { id: kelasId } } },
      });
      const jumlah_user = daftar.length + gabung.length;

      if (jumlah_user >= kelas.kuota) {
        throw new BadRequestException('The program is currently full');
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
              where: { minggu: { id: minggu.id }, user: { id: userId } },
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
                where: {
                  pertemuan: { id: pertemuan.id },
                  user: { id: userId },
                },
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
          const progresMingguAkhir = await this.progresMingguRepository.findOne(
            {
              where: {
                minggu: { id: minggu_akhir.id },
                user: { id: userId },
                proses: true,
                quiz: true,
              },
            },
          );
          if (progresMingguAkhir) {
            await this.userKelasRepository.update(user_kelas.id, {
              progres: true,
            });
          }
        }
      }
    }
  }

  async sumStudent(kelasId: number) {
    const kelas = await this.findOne(kelasId);
    if (kelas.check_paid === true) {
      const daftar = await this.pembayaranRepository.find({
        where: { kelas: { id: kelasId }, proses: 'proces' },
      });
      const gabung = await this.userKelasRepository.find({
        where: { kelas: { id: kelasId } },
      });
      const jumlah_user = daftar.length + gabung.length;
      return jumlah_user;
    } else {
      const daftar = await this.pendaftaranRepository.find({
        where: { kelas: { id: kelasId }, proses: 'proces' },
      });
      const gabung = await this.userKelasRepository.find({
        where: { kelas: { id: kelasId } },
      });
      const jumlah_user = daftar.length + gabung.length;
      return jumlah_user;
    }
  }

  async findMyCourse(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return await this.kelasRepository.find({
      where: {
        user_kelas: { user: { id: userId } },
      },
      relations: ['kategori', 'jenis_kelas'],
    });
  }

  async findMentoring() {
    return await this.userRepository.find({ where: { role: 'admin' } });
  }

  async findMentor(kelasId) {
    return await this.mentorRepository.find({
      where: { kelas: { id: kelasId } },
      relations: ['teknologi'],
    });
  }

  async findKelasByMentoring(userId: number) {
    return await this.kelasRepository.find({
      where: { mentoring: { user: { id: userId } } },
      relations: ['user_kelas', 'kategori', 'jenis_kelas'],
    });
  }

  async findQuiz(mingguId: number, userId: number) {
    return await this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect(
        'quiz.progres_quiz',
        'progres_quiz',
        'progres_quiz.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('quiz.pertanyaan', 'pertanyaan')
      .leftJoinAndSelect('quiz.nilai', 'nilai', 'nilai.userId = :userId', {
        userId,
      })
      .where('quiz.mingguId = :mingguId', { mingguId: mingguId })
      .orderBy('quiz.id', 'ASC')
      .getMany();
  }

  async findPertemuan(mingguId: number, userId: number) {
    return await this.pertemuanRepository
      .createQueryBuilder('pertemuan')
      .leftJoinAndSelect(
        'pertemuan.progres_pertemuan',
        'progres_pertemuan',
        'progres_pertemuan.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect(
        'pertemuan.logbook',
        'logbook',
        'logbook.userId = :userId',
      )
      .leftJoinAndSelect('pertemuan.attendance', 'attendance', 'attendance.userId = :userId', {
        userId,
      })
      .leftJoinAndSelect('pertemuan.tugas', 'tugas')
      .leftJoinAndSelect(
        'tugas.jawaban_tugas',
        'jawaban_tugas',
        'jawaban_tugas.userId = :userId',
        { userId },
      )
      .where('pertemuan.mingguId = :mingguId', { mingguId: mingguId })
      .orderBy('pertemuan.pertemuan_ke', 'ASC')
      .getMany();
  }

  async findMinggu(kelasId: number, userId: number) {
    const kelas = await this.findOne(kelasId);
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }

    return await this.mingguRepository
      .createQueryBuilder('minggu')
      .leftJoinAndSelect(
        'minggu.progres_minggu',
        'progres_minggu',
        'progres_minggu.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('minggu.kelas', 'kelas')
      .leftJoinAndSelect(
        'kelas.user_kelas',
        'user_kelas',
        'user_kelas.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect(
        'kelas.portfolio',
        'portfolio',
        'portfolio.userId = :userId',
        { userId },
      )
      .where('minggu.kelasId = :kelasId', { kelasId })
      .orderBy('minggu.minggu_ke', 'ASC')
      .getMany();
  }

  async findMingguTerakhir(kelasId: number) {
    const minggu = await this.mingguRepository.find({
      where: { kelas: { id: kelasId }, akhir: true },
    });
    if (minggu.length) {
      return true;
    } else {
      return false;
    }
  }

  async findLogbookMentor(kelasId: number) {
    return await this.logbookMentorRepository.find({
      where: { pertemuan: { minggu: { kelas: { id: kelasId } } } },
      relations: [
        'pertemuan',
        'pertemuan.minggu',
        'pertemuan.minggu.kelas',
        'pertemuan.minggu.kelas.mentor',
        'pertemuan.minggu.kelas.jenis_kelas',
        'pertemuan.minggu.kelas.kategori',
      ],
      select: {
        id: true,
        kegiatan: true,
        rincian_kegiatan: true,
        dokumentasi: true,
        kendala: true,
        createdAt: true,
        pertemuan: {
          pertemuan_ke: true,
          minggu: {
            minggu_ke: true,
            kelas: {
              nama_kelas: true,
              mentor: {
                nama: true,
              },
              kategori: {
                nama_kategori: true,
              },
              jenis_kelas: {
                nama_jenis_kelas: true,
              },
            },
          },
        },
      },
    });
  }

  async findLogBookUser(kelasId: number) {
    return await this.logbookRepository.find({
      where: { pertemuan: { minggu: { kelas: { id: kelasId } } } },
      relations: [
        'user',
        'pertemuan',
        'pertemuan.minggu',
        'pertemuan.minggu.kelas',
        'pertemuan.minggu.kelas.mentor',
        'pertemuan.minggu.kelas.jenis_kelas',
        'pertemuan.minggu.kelas.kategori',
      ],
      select: {
        id: true,
        kegiatan: true,
        rincian_kegiatan: true,
        dokumentasi: true,
        proses: true,
        kendala: true,
        dokumentasi_lain: true,
        createdAt: true,
        user: {
          username: true,
          email: true,
        },
        pertemuan: {
          pertemuan_ke: true,
          minggu: {
            minggu_ke: true,
            kelas: {
              nama_kelas: true,
              mentor: {
                nama: true,
              },
              kategori: {
                nama_kategori: true,
              },
              jenis_kelas: {
                nama_jenis_kelas: true,
              },
            },
          },
        },
      },
    });
  }

  async findUser() {
    return await this.userRepository.find({ where: { role: 'user' } });
  }

  async findKategoriMyProgram(userId: number){
    return await this.kategoriRepository.find({where: { kelas: { user_kelas: { user: { id: userId } } } } });
  }


  async findJenisKelasMyProgram(userId: number){
    return await this.jenisKelasRepository.find({where: { kelas: { user_kelas: { user: { id: userId } } } } });
  }

  async findKategori() {
    return await this.kategoriRepository.find();
  }
  async findJenisKelas() {
    return await this.jenisKelasRepository.find();
  }

  async findAll() {
    return await this.kelasRepository.find({ relations: ['kategori'] });
  }

  async findAllLaunch() {
    return await this.kelasRepository.find({
      where: { launch: true },
      relations: ['kategori'],
    });
  }

  async findMurid(id: number) {
    return await this.userRepository.find({
      where: { user_kelas: { kelas: { id: id } } },
    });
  }

  async allKelas() {
    return await this.kelasRepository.find({
      relations: ['user_kelas', 'kategori', 'mentoring', 'mentoring.user'],
    });
  }

  async allClassExcept(kelasId: number) {
    return await this.kelasRepository.find({
      where: { id: Not(kelasId), launch: true },
      relations: ['user_kelas', 'kategori', 'jenis_kelas'],
    });
  }

  async checkUserInKelas(kelasId: number, userId: number) {
    return await this.userKelasRepository.findOne({
      where: { kelas: { id: kelasId }, user: { id: userId } },
    });
  }

  async findTeknologi() {
    return await this.teknologiRepository.find();
  }

  async findTeknologiKelas(kelasId: number) {
    return await this.teknologiRepository.find({
      where: { kelas: { id: kelasId } },
    });
  }

  async findPertanyaanKelas(kelasId: number) {
    return await this.pertanyaanKelasRepository.find({
      where: { kelas: { id: kelasId } },
      order: { id: 'ASC' },
    });
  }

  async findBenefitKelas(kelasId: number) {
    return await this.benefitKelasRepository.find({
      where: { kelas: { id: kelasId } },
    });
  }

  async findAlurKelas(kelasId: number) {
    return await this.alurKelasRepository.find({
      where: { kelas: { id: kelasId } },
      order: { alur_ke: 'ASC' },
    });
  }

  async findOneKelas(kelasId: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
      relations: ['kategori', 'jenis_kelas', 'teknologi', 'user_kelas'],
    });
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }
    return kelas;
  }

  async findOneKelasUser(kelasId: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId, launch: true },
      relations: ['kategori', 'jenis_kelas', 'user_kelas', 'user_kelas.user'],
    });
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }
    return kelas;
  }

  async findOneUserKelas(userId: number, kelasId: number) {
    return await this.userKelasRepository.findOne({
      where: { kelas: { id: kelasId }, user: { id: userId } },
    });
  }

  async findOnePortfolio(userId: number, kelasId: number) {
    return await this.portfolioRepository.findOne({
      where: { user: { id: userId }, kelas: { id: kelasId } },
    });
  }

  async findOneKelasUserLaunch(kelasId: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
      relations: ['kategori', 'jenis_kelas', 'user_kelas', 'user_kelas.user'],
    });
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }
    return kelas;
  }

  async findOneKelasAdmin(kelasId: number) {
    return await this.kelasRepository.findOne({
      where: { id: kelasId },
      relations: [
        'kategori',
        'jenis_kelas',
        'teknologi',
        'mentoring',
        'mentoring.user',
        'user_kelas',
      ],
    });
  }

  async findMingguKelas(kelasId: number) {
    return await this.mingguRepository.find({
      where: { kelas: { id: kelasId } },
      order: { minggu_ke: 'ASC' },
      relations: ['pertemuan'],
    });
  }

  async findMentorKelas(kelasId: number) {
    return await this.mentorRepository.find({
      where: { kelas: { id: kelasId } },
      relations: ['teknologi'],
    });
  }

  async findUserKelas(kelasId: number) {
    return await this.userKelasRepository.find({
      where: { kelas: { id: kelasId } },
      relations: ['user'],
    });
  }

  async findPembayaranKelas(kelasId: number) {
    return await this.pembayaranRepository.find({
      where: { kelas: { id: kelasId } },
      relations: ['user', 'kelas'],
    });
  }

  async findPendaftaranKelas(kelasId: number) {
    return await this.pendaftaranRepository.find({
      where: { kelas: { id: kelasId } },
      relations: ['user', 'kelas'],
    });
  }

  async findPaymentInstallmentKelas(kelasId: number) {
    return await this.pembayaranRepository.find({
      where: { kelas: { id: kelasId }, cicilan: Not(IsNull()) },
      relations: ['user', 'kelas'],
    });
  }

  async findCicilanKelas(kelasId: number) {
    return await this.cicilanRepository.find({
      where: { kelas: { id: kelasId } },
      order: { bulan: 'ASC' },
    });
  }

  async findAlumniKelas(kelasId: number) {
    return await this.alumniRepository.find({
      where: { kelas: { id: kelasId } },
    });
  }

  async findMentoringKelas(kelasId: number) {
    return await this.userRepository.findOne({
      where: { mentoring: { kelas: { id: kelasId } } },
    });
  }

  async findOne(kelasId: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
      relations: [
        'kategori',
        'jenis_kelas',
        'teknologi',
        'mentoring',
        'mentoring.user',
        'user_kelas',
      ],
    });
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }
    return kelas;
  }

  async updateLaunch(kelasId: number, updateKelassDto: UpdateKelassDto) {
    const kelas = await this.findOne(kelasId);
    if (!kelas) {
      throw new NotFoundException();
    }
    if (kelas.launch === true) {
      updateKelassDto.launch = false;
    } else if (kelas.launch === false) {
      updateKelassDto.launch = true;
    }
    Object.assign(kelas, updateKelassDto);
    return await this.kelasRepository.save(kelas);
  }

  async update(id: number, updateKelassDto: UpdateKelassDto) {
    const kelas = await this.findOne(id);
    if (!kelas) {
      throw new NotFoundException(`Program not found`);
    }

    if (updateKelassDto.kategoriId) {
      const kategori = await this.kategoriRepository.findOne({
        where: { id: updateKelassDto.kategoriId },
      });

      if (!kategori) {
        throw new NotFoundException(`Category not found`);
      }

      kelas.kategori = kategori;
    }

    if (updateKelassDto.jenis_kelasId) {
      const jenis_kelas = await this.jenisKelasRepository.findOne({
        where: { id: updateKelassDto.jenis_kelasId },
      });

      if (!jenis_kelas) {
        throw new NotFoundException(`Program type not found`);
      }

      kelas.jenis_kelas = jenis_kelas;
    }

    if (updateKelassDto.teknologiIds !== undefined) {
      if (updateKelassDto.teknologiIds.length > 0) {
        kelas.teknologi = await this.teknologiRepository.findBy({
          id: In(updateKelassDto.teknologiIds),
        });
      } else {
        kelas.teknologi = [];
      }
    }

    const { jenis_kelasId, kategoriId, teknologiIds, ...otherProperties } =
      updateKelassDto;
    Object.assign(kelas, otherProperties);

    return await this.kelasRepository.save(kelas);
  }

  async remove(id: number) {
    const kelas = await this.findOne(id);
    if (!kelas) {
      throw new NotFoundException('Program not found');
    }
    return await this.kelasRepository.remove(kelas);
  }

  async removeUserKelas(userId: number, kelasId: number) {
    const user_kelas = await this.userKelasRepository.findOne({
      where: { user: { id: userId }, kelas: { id: kelasId } },
    });
    if (!user_kelas) {
      throw new NotFoundException('User not found');
    }
    return await this.userKelasRepository.remove(user_kelas);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {
    }
  }
}
