import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { In, Not, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { Minggu } from 'src/entities/minggu.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Nilai } from 'src/entities/nilai.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { Pembayaran } from 'src/entities/pembayaran.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';
import { Mentor } from 'src/entities/mentor.entity';
import { ProgresQuiz } from 'src/entities/progres_quiz.entity';
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
    @InjectRepository(Nilai)
    private readonly nilaiRepository: Repository<Nilai>,
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
    @InjectRepository(ProgresQuiz)
    private readonly progresQuizRepository: Repository<ProgresQuiz>,
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
  ) {}

  async create(createKelassDto: CreateKelassDto) {
    const kategori = await this.kategoriRepository.findOne({
      where: { id: createKelassDto.kategoriId },
    });
    if (!kategori) {
      throw new NotFoundException('kategori ini tidak ada');
    }
    const jenis_kelas = await this.jenisKelasRepository.findOne({
      where: { id: createKelassDto.jenis_kelasId },
    });
    if (!jenis_kelas) {
      throw new NotFoundException('jenis_kelas ini tidak ada');
    }

    // Get teknologi entities if teknologiIds provided
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
      throw new NotFoundException('User tidak ada');
    }

    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
    });
    if (!kelas) {
      throw new NotFoundException('Kelas tidak ada');
    }

    const mentoring = await this.mentoringRepository.create({
      kelas: kelas,
      user: user,
    });
    return await this.mentoringRepository.save(mentoring);
  }

  async updateMentoring(userId: number, kelasId: number) {
    // Cari kelas terlebih dahulu
    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
    });

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    // Cari user admin yang akan jadi mentoring
    const newMentorUser = await this.userRepository.findOne({
      where: { id: userId, role: 'admin' },
    });

    if (!newMentorUser) {
      throw new NotFoundException(
        `User admin dengan id ${userId} tidak ditemukan`,
      );
    }

    // Cari mentoring yang sudah ada untuk kelas ini
    const existingMentoring = await this.mentoringRepository.findOne({
      where: { kelas: { id: kelasId } },
      relations: ['kelas', 'user'],
    });

    if (existingMentoring) {
      // Update mentoring yang sudah ada
      existingMentoring.user = newMentorUser;
      return await this.mentoringRepository.save(existingMentoring);
    } else {
      // Create new mentoring jika belum ada
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

      const user_kelas = await this.userKelasRepository.save({
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
          await this.progresMingguRepository.save({
            minggu: minggu,
            user: user,
            proses: true,
            quiz: false,
          });
          const pertemuan = await this.pertemuanRepository.findOne({
            where: { minggu: { id: minggu.id }, pertemuan_ke: 1 },
            relations: [],
          });
          if (pertemuan) {
            await this.progresPertemuanRepository.save({
              pertemuan: pertemuan,
              user: user,
              absen: true,
              logbook: false,
            });
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
          await this.progresMingguRepository.save({
            minggu: minggu,
            user: user,
            proses: true,
            quiz: false,
          });
          const pertemuan = await this.pertemuanRepository.findOne({
            where: { minggu: { id: minggu.id }, pertemuan_ke: 1 },
            relations: [],
          });
          if (pertemuan) {
            await this.progresPertemuanRepository.save({
              pertemuan: pertemuan,
              user: user,
              absen: true,
              logbook: false,
            });
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


  async findQuiz(mingguId: number) {
    return await this.quizRepository.find({
      where: { minggu: { id: mingguId } }, relations: ['pertanyaan', 'progres_quiz', 'nilai'],
      order: { id: 'ASC' }, 
    });
  }


  async findPertemuan(mingguId: number) {
    return await this.pertemuanRepository.find({
      where: { minggu: { id: mingguId } },
      order: { pertemuan_ke: 'ASC' },  relations: ['progres_pertemuan', 'logbook', 'absen', 'tugas', 'tugas.jawaban_tugas'],
    });
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
      .leftJoinAndSelect('minggu.quiz', 'quiz')
      .leftJoinAndSelect(
        'quiz.progres_quiz',
        'progres_quiz',
        'progres_quiz.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('quiz.pertanyaan', 'pertanyaan')

      .leftJoinAndSelect('minggu.pertemuan', 'pertemuan')
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
        { userId },
      )
      .leftJoinAndSelect('pertemuan.absen', 'absen', 'absen.userId = :userId', {
        userId,
      })
      .leftJoinAndSelect('pertemuan.tugas', 'tugas')
      .leftJoinAndSelect(
        'tugas.jawaban_tugas',
        'jawaban_tugas',
        'jawaban_tugas.userId = :userId AND jawaban_tugas.proses = :proses',
        { userId, proses: 'acc' },
      )
      .where('minggu.kelasId = :kelasId', { kelasId })
      .orderBy('minggu.minggu_ke', 'ASC')
      .addOrderBy('pertemuan.pertemuan_ke', 'ASC')
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

  async findOneKelasAdmin(kelasId: number) {
    return await this.kelasRepository.findOne({
      where: { id: kelasId },
      relations: [
        'kategori',
        'jenis_kelas',
        'teknologi',
        'mentoring',
        'mentoring.user',
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

  async findCicilanKelas(kelasId: number) {
    return await this.cicilanRepository.find({
      where: { kelas: { id: kelasId } },
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

    // Handle teknologi relation
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
}
