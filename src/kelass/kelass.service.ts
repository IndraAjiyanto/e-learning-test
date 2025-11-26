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
import { Absen } from 'src/entities/absen.entity';
import { JawabanTugas } from 'src/entities/jawaban_tugas.entity';
import { Pembayaran } from 'src/entities/pembayaran.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';
import { Mentor } from 'src/entities/mentor.entity';
import { ProgresQuiz } from 'src/entities/progres_quiz.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Teknologi } from 'src/entities/teknologi.entity';
import { Mentoring } from 'src/entities/mentoring.entity';
import { Pendaftaran } from 'src/entities/pendaftaran.entity';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';

@Injectable()
export class KelassService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,
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
    console.log(
      'updateMentoring called with userId:',
      userId,
      'kelasId:',
      kelasId,
    );

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

  async addUserToKelas(userId: number, kelasId: number): Promise<UserKelas> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['user_kelas', 'user_kelas.kelas'],
    });

    if (!user) {
      throw new NotFoundException('User tidak ada');
    }

    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
      relations: ['user_kelas', 'user_kelas.user'],
    });
    if (!kelas) {
      throw new NotFoundException('Kelas tidak ada');
    }

    const sudahGabung = await this.userKelasRepository.findOne({
      where: { user: { id: userId }, kelas: { id: kelasId } },
    });
    if (sudahGabung) {
      throw new BadRequestException('User sudah tergabung dalam kelas');
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
        throw new BadRequestException('Saat ini kelas sedang penuh');
      }

      const user_kelas = await this.userKelasRepository.create({
        progres: false,
        user: user,
        kelas: kelas,
      });

      return await this.userKelasRepository.save(user_kelas);
    } else {
      const daftar = await this.pendaftaranRepository.find({
        where: { kelas: { id: kelasId }, proses: 'proces' },
      });

      const gabung = await this.userRepository.find({
        where: { user_kelas: { kelas: { id: kelasId } } },
      });
      const jumlah_user = daftar.length + gabung.length;

      if (jumlah_user >= kelas.kuota) {
        throw new BadRequestException('Saat ini kelas sedang penuh');
      }

      const user_kelas = await this.userKelasRepository.create({
        progres: false,
        user: user,
        kelas: kelas,
      });

      return await this.userKelasRepository.save(user_kelas);
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
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.kelasRepository.find({
      where: {
        user_kelas: { user: { id: userId } },
      },
      relations: ['user_kelas', 'user_kelas.user', 'kategori', 'jenis_kelas'],
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
      relations: [
        'user_kelas',
        'user_kelas.user',
        'kategori',
        'jenis_kelas',
        'mentoring',
        'mentoring.user',
      ],
    });
  }

  async findPertemuanAndPertanyaan(mingguId: number, userId: number) {
    const minggu = await this.findOne(mingguId);
    if (!minggu) {
      throw new NotFoundException(`Week not found`);
    }

    return await this.pertemuanRepository.find({
      where: { minggu: { id: mingguId } },
      relations: [
        'minggu',
        'absen.user',
        'pertanyaan',
        'tugas',
        'pertanyaan.jawaban',
        'pertanyaan.jawaban_user',
        'pertanyaan.jawaban_user.user',
      ],
    });
  }

  async findMinggu(kelasId: number, userId: number) {
    const kelas = await this.findOne(kelasId);
    if (!kelas) {
      throw new NotFoundException(`Program not found`);
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
        'kelas.sertifikat',
        'sertifikat',
        'sertifikat.userId = :userId',
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
      .leftJoinAndSelect('quiz.nilai', 'nilai')
      .leftJoinAndSelect('pertanyaan.jawaban', 'jawaban')
      .leftJoinAndSelect(
        'pertanyaan.jawaban_user',
        'jawaban_user',
        'jawaban_user.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('jawaban_user.user', 'jawaban_user_user')

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

  async createProgresPertemuan(userId: number, mingguList: Minggu[]) {
    const progresToSave: ProgresPertemuan[] = [];

    // OPTIMIZATION: Batch fetch semua data sekaligus
    const allPertemuan = mingguList.flatMap((m) => m.pertemuan || []);
    const pertemuanIds = allPertemuan
      .map((p) => p.id)
      .filter((id) => id !== undefined);

    if (pertemuanIds.length === 0) {
      return [];
    }

    // Fetch all existing progres at once
    const existingProgresList = await this.progresPertemuanRepository.find({
      where: { pertemuan: { id: In(pertemuanIds) }, user: { id: userId } },
      relations: ['pertemuan'],
    });
    const existingProgresMap = new Map(
      existingProgresList.map((p) => [p.pertemuan.id, p]),
    );

    // Fetch all logbook at once
    const logbookList = await this.logbookRepository.find({
      where: {
        user: { id: userId },
        pertemuan: { id: In(pertemuanIds) },
        proses: 'acc',
      },
      relations: ['pertemuan'],
    });
    const logbookMap = new Map(logbookList.map((a) => [a.pertemuan.id, a]));

    // Fetch all progres quiz at once
    const quizIds = mingguList
      .filter((m) => m.quiz && m.quiz.length > 0)
      .map((m) => m.quiz[0].id);
    const progresQuizList =
      quizIds.length > 0
        ? await this.progresQuizRepository.find({
            where: { user: { id: userId }, quiz: { id: In(quizIds) } },
            relations: ['quiz'],
          })
        : [];
    const progresQuizMap = new Map(
      progresQuizList.map((pq) => [pq.quiz.id, pq]),
    );

    for (const m of mingguList) {
      for (const p of m.pertemuan) {
        const existingProgres = existingProgresMap.get(p.id);

        if (existingProgres) {
          // Sudah ada progres untuk pertemuan ini
          // Cek apakah user sudah logbook di pertemuan ini
          const logbook = logbookMap.get(p.id);

          if (logbook) {
            // Sudah logbook, cek unlock quiz jika pertemuan terakhir
            if (
              logbook.pertemuan.akhir === true &&
              m.quiz &&
              m.quiz.length > 0
            ) {
              const existingProgresQuiz = progresQuizMap.get(m.quiz[0].id);
              if (!existingProgresQuiz) {
                await this.createProgresQuiz(userId, m.quiz[0].id);
              }
            }

            // Cari pertemuan selanjutnya
            const pertemuanSelanjutnya = m.pertemuan.find(
              (pt) => pt.pertemuan_ke === p.pertemuan_ke + 1,
            );

            if (pertemuanSelanjutnya) {
              // Cek apakah sudah ada progres untuk pertemuan selanjutnya
              const existingNextProgres = existingProgresMap.get(
                pertemuanSelanjutnya.id,
              );

              // Jika belum ada progres untuk pertemuan selanjutnya, tambahkan ke queue
              if (!existingNextProgres) {
                const newProgres = this.progresPertemuanRepository.create({
                  user: { id: userId },
                  pertemuan: { id: pertemuanSelanjutnya.id },
                  absen: true,
                });
                progresToSave.push(newProgres);

                // Update map agar tidak duplikat saat iterasi berikutnya
                existingProgresMap.set(pertemuanSelanjutnya.id, newProgres);
              }
            }
          }
        } else {
          // Belum ada progres untuk pertemuan ini
          if (p.pertemuan_ke === 1) {
            // Pertemuan pertama - langsung bisa akses
            const newProgres = this.progresPertemuanRepository.create({
              user: { id: userId },
              pertemuan: { id: p.id },
              absen: true,
            });
            progresToSave.push(newProgres);

            // Update map agar tidak duplikat
            existingProgresMap.set(p.id, newProgres);
          }
          // Pertemuan selain pertama tidak perlu di-generate, akan di-unlock oleh pertemuan sebelumnya
        }
      }
    }

    // Save semua progres baru sekaligus
    if (progresToSave.length > 0) {
      return await this.progresPertemuanRepository.save(progresToSave);
    }

    return [];
  }

  async createProgresMinggu(userId: number, mingguList: Minggu[]) {
    const progresToSave: ProgresMinggu[] = [];

    // OPTIMIZATION: Batch fetch semua data sekaligus
    const mingguIds = mingguList.map((m) => m.id);
    const quizIds = mingguList
      .filter((m) => m.quiz && m.quiz.length > 0)
      .map((m) => m.quiz[0].id);

    // Fetch all existing progres at once
    const existingProgresList = await this.progresMingguRepository.find({
      where: { minggu: { id: In(mingguIds) }, user: { id: userId } },
      relations: ['minggu'],
    });
    const existingProgresMap = new Map(
      existingProgresList.map((p) => [p.minggu.id, p]),
    );

    // Fetch all nilai at once
    const nilaiList =
      quizIds.length > 0
        ? await this.nilaiRepository.find({
            where: { user: { id: userId }, quiz: { id: In(quizIds) } },
            relations: ['quiz'],
          })
        : [];
    const nilaiMap = new Map<number, typeof nilaiList>();
    nilaiList.forEach((n) => {
      if (!nilaiMap.has(n.quiz.id)) nilaiMap.set(n.quiz.id, []);
      nilaiMap.get(n.quiz.id)!.push(n);
    });

    // Fetch all quiz at once
    const quizList =
      quizIds.length > 0
        ? await this.quizRepository.find({
            where: { id: In(quizIds) },
            relations: ['minggu'],
          })
        : [];
    const quizMap = new Map(quizList.map((q) => [q.minggu.id, q]));

    for (const m of mingguList) {
      const existingProgres = existingProgresMap.get(m.id);

      if (existingProgres) {
        // Pastikan minggu ini punya quiz
        if (!m.quiz || m.quiz.length === 0) {
          continue;
        }

        const nilai = nilaiMap.get(m.quiz[0].id) || [];
        const quiz = quizMap.get(m.id);

        if (!quiz || !nilai.length) {
          continue;
        }

        // Cek apakah ada nilai yang lulus
        const hasPassingScore = nilai.some(
          (n) => n.nilai >= quiz.nilai_minimal,
        );

        // Update status kelulusan kelas jika minggu terakhir
        if (m.akhir === true) {
          await this.userKelasRepository.update(
            { user: { id: userId }, kelas: { id: m.kelas.id } },
            { progres: hasPassingScore },
          );
        }

        // Cari minggu selanjutnya
        const mingguSelanjutnya = mingguList.find(
          (mg) =>
            mg.kelas.id === m.kelas.id && mg.minggu_ke === m.minggu_ke + 1,
        );

        if (mingguSelanjutnya) {
          // Cek apakah sudah ada progres untuk minggu selanjutnya
          const existingNextProgres = existingProgresMap.get(
            mingguSelanjutnya.id,
          );

          // Jika belum ada progres untuk minggu selanjutnya, tambahkan ke queue
          if (!existingNextProgres) {
            const newProgres = this.progresMingguRepository.create({
              user: { id: userId },
              minggu: { id: mingguSelanjutnya.id },
              quiz: hasPassingScore, // true jika lulus, false jika tidak
            });
            progresToSave.push(newProgres);

            // Update map agar tidak duplikat saat iterasi berikutnya
            existingProgresMap.set(mingguSelanjutnya.id, newProgres);
          }
        }
      } else {
        // Belum ada progres untuk minggu ini
        if (m.minggu_ke === 1) {
          // Minggu pertama - langsung bisa akses quiz
          const newProgres = this.progresMingguRepository.create({
            user: { id: userId },
            minggu: { id: m.id },
            quiz: true,
          });
          progresToSave.push(newProgres);

          // Update map agar tidak duplikat
          existingProgresMap.set(m.id, newProgres);
        }
        // Minggu selain pertama tidak perlu di-generate, akan di-unlock oleh minggu sebelumnya
      }
    }

    // Save semua progres baru sekaligus
    if (progresToSave.length > 0) {
      return await this.progresMingguRepository.save(progresToSave);
    }

    return [];
  }

  async createProgresQuiz(userId: number, quizId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    const progres_quiz = await this.progresQuizRepository.create({
      user: user,
      quiz: quiz,
      proses: true,
    });
    return await this.progresQuizRepository.save(progres_quiz);
  }

  async findMingguClass(kelasId: number) {
    const kelas = await this.findOne(kelasId);
    if (!kelas) {
      throw new NotFoundException(`User not found`);
    }
    return await this.mingguRepository.find({
      where: {
        kelas: { id: kelasId },
      },
      order: { minggu_ke: 'ASC' },
      relations: [
        'quiz',
        'pertemuan',
        'pertemuan.absen',
        'pertemuan.tugas',
        'quiz.pertanyaan',
        'quiz.nilai',
        'quiz.pertanyaan.jawaban',
        'quiz.pertanyaan.jawaban_user',
        'quiz.pertanyaan.jawaban_user.user',
      ],
    });
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
        'user',
        'pertemuan',
        'pertemuan.minggu',
        'pertemuan.minggu.kelas',
        'pertemuan.minggu.kelas.mentor',
        'pertemuan.minggu.kelas.mentoring',
        'pertemuan.minggu.kelas.jenis_kelas',
        'pertemuan.minggu.kelas.kategori',
      ],
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
      relations: [
        'user_kelas',
        'user_kelas.user',
        'kategori',
        'mentoring',
        'mentoring.user',
      ],
    });
  }

  async allClassExcept(kelasId: number) {
    return await this.kelasRepository.find({
      where: { id: Not(kelasId) },
      relations: [
        'user_kelas',
        'user_kelas.user',
        'kategori',
        'jenis_kelas',
        'teknologi',
        'mentoring',
      ],
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

  async findOne(kelasId: number) {
    const kelas = await this.kelasRepository
      .createQueryBuilder('kelas')
      .leftJoinAndSelect('kelas.user_kelas', 'user_kelas')
      .leftJoinAndSelect('user_kelas.user', 'user')
      .leftJoinAndSelect('kelas.kategori', 'kategori')
      .leftJoinAndSelect('kelas.alumni', 'alumni')
      .leftJoinAndSelect('alumni.kelas', 'alumni_kelas')
      .leftJoinAndSelect('kelas.pembayaran', 'pembayaran')
      .leftJoinAndSelect('pembayaran.user', 'pembayaran_user')
      .leftJoinAndSelect('kelas.alur_kelas', 'alur_kelas')
      .leftJoinAndSelect('kelas.benefit_kelas', 'benefit_kelas')
      .leftJoinAndSelect('kelas.jenis_kelas', 'jenis_kelas')
      .leftJoinAndSelect('kelas.pendaftaran', 'pendaftaran')
      .leftJoinAndSelect('pendaftaran.user', 'pendaftaran_user')
      .leftJoinAndSelect('kelas.mentor', 'mentor')
      .leftJoinAndSelect('mentor.teknologi', 'mentor_teknologi')
      .leftJoinAndSelect('kelas.pertanyaan_kelas', 'pertanyaan_kelas')
      .leftJoinAndSelect('kelas.teknologi', 'teknologi')
      .leftJoinAndSelect('kelas.mentoring', 'mentoring')
      .leftJoinAndSelect('mentoring.user', 'mentoring_user')
      .leftJoinAndSelect('kelas.cicilan', 'cicilan')
      .leftJoinAndSelect('cicilan.pembayaran', 'cicilan_pembayaran')
      .leftJoinAndSelect('cicilan_pembayaran.user', 'cicilan_user')
      .leftJoinAndSelect('kelas.minggu', 'minggu')
      .where('kelas.id = :kelasId', { kelasId })
      .orderBy('alur_kelas.alur_ke', 'ASC')
      .addOrderBy('minggu.minggu_ke', 'ASC')
      .getOne();

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
