import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { User } from 'src/entities/user.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { SyllabusProgress } from 'src/entities/syllabus_progress.entity';
import { SyllabusMaterial } from 'src/entities/syllabus_material.entity';
import { SyllabusAssignment } from 'src/entities/syllabus_assignment.entity';
import { SyllabusAnswerTask } from 'src/entities/syllabus_answer_task.entity';
import { SyllabusComment } from 'src/entities/syllabus_comment.entity';
import { ProcessStatus } from 'src/entities/types/process-status';
import { Quiz } from 'src/entities/quiz.entity';
import { SyllabusLogbook } from 'src/entities/syllabus_logbook.entity';
import { FileType } from 'src/entities/materials.entity';
import { capabilitiesForCourse } from 'src/courses/program-type';

/** Keadaan satu silabus bagi seorang student. */
export type SyllabusState = 'LOCKED' | 'OPEN' | 'COMPLETED';

export interface SyllabusView {
  id: string;
  order: number;
  title: string;
  description: string | null;
  isFinal: boolean;
  state: SyllabusState;
  completedAt: Date | null;
  materialCount: number;
  assignmentCount: number;
  /** Hanya berarti pada program yang logbooknya menyala. */
  logbookOk: boolean;
}

/**
 * Aturan belajar untuk program non-bootcamp (SPL).
 *
 * Sengaja TIDAK memakai `sessionUnlock` milik bootcamp. Aturannya memang
 * berbeda, dan menumpangkannya berarti mengulang tambalan yang justru
 * dihapus oleh pemisahan ini:
 *
 *  - bootcamp : sesi berikutnya terbuka bila sesi sebelumnya DIHADIRI dan
 *               logbooknya disetujui - dan baris progres sesi berikutnya
 *               hanya pernah dibuat saat logbook disetujui, sehingga program
 *               tanpa logbook harus ditambal di AttendanceService;
 *  - silabus  : silabus berikutnya terbuka bila silabus sebelumnya
 *               DISELESAIKAN. Titik. Logbook hanya ikut menentukan bila
 *               program itu memang memakai logbook.
 *
 * Tidak ada absensi di sini. Student yang belajar mandiri tidak hadir, ia
 * menyelesaikan. Lihat docs/syllabus-table-plan.md.
 */
@Injectable()
export class SyllabusService {
  constructor(
    @InjectRepository(Syllabus)
    private readonly syllabusRepository: Repository<Syllabus>,
    @InjectRepository(SyllabusProgress)
    private readonly progressRepository: Repository<SyllabusProgress>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(SyllabusMaterial)
    private readonly materialRepository: Repository<SyllabusMaterial>,
    @InjectRepository(SyllabusAssignment)
    private readonly assignmentRepository: Repository<SyllabusAssignment>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
    @InjectRepository(SyllabusAnswerTask)
    private readonly answerRepository: Repository<SyllabusAnswerTask>,
    @InjectRepository(SyllabusComment)
    private readonly commentRepository: Repository<SyllabusComment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(SyllabusLogbook)
    private readonly logbookRepository: Repository<SyllabusLogbook>,
  ) {}

  // ----------------------------------------------------------------- baca

  /** Silabus sebuah program, terurut. Tanpa konteks student. */
  async findByCourse(courseId: string): Promise<Syllabus[]> {
    return this.syllabusRepository.find({
      where: { course: { id: courseId } },
      order: { order: 'ASC' },
    });
  }

  /** Program pemilik silabus, untuk kepala halaman admin. */
  async courseFor(courseId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Program not found');
    return course;
  }

  /** Daftar silabus beserta jumlah isinya - untuk layar admin. */
  async findByCourseWithCounts(courseId: string) {
    const items = await this.syllabusRepository.find({
      where: { course: { id: courseId } },
      order: { order: 'ASC' },
      relations: ['materials', 'assignments'],
    });
    return items.map((s) => ({
      id: s.id,
      order: s.order,
      title: s.title,
      description: s.description,
      isFinal: s.isFinal,
      materialCount: s.materials?.length ?? 0,
      assignmentCount: s.assignments?.length ?? 0,
    }));
  }

  async findOne(syllabusId: string): Promise<Syllabus> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
      relations: ['course', 'materials', 'assignments'],
    });
    if (!syllabus) throw new NotFoundException('Syllabus not found');
    return syllabus;
  }

  /**
   * Daftar silabus BESERTA keadaannya untuk seorang student.
   *
   * Satu query untuk silabus, satu untuk progres - bukan satu query per
   * silabus. Keadaan dihitung berurutan: sebuah silabus terbuka hanya kalau
   * pendahulunya sudah tuntas.
   */
  async findForStudent(
    courseId: string,
    userId: string,
  ): Promise<SyllabusView[]> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    const logbookRequired = capabilitiesForCourse(course).logbookEnabled;

    const items = await this.syllabusRepository.find({
      where: { course: { id: courseId } },
      order: { order: 'ASC' },
      relations: ['materials', 'assignments'],
    });
    if (items.length === 0) return [];

    const progresses = await this.progressRepository.find({
      where: { user: { id: userId }, syllabus: { course: { id: courseId } } },
      relations: ['syllabus'],
    });
    const byId = new Map(progresses.map((p) => [p.syllabus.id, p]));

    const views: SyllabusView[] = [];
    let previousDone = true; // silabus pertama selalu terbuka
    for (const item of items) {
      const progress = byId.get(item.id) ?? null;
      const done = this.isDone(progress, logbookRequired);
      views.push({
        id: item.id,
        order: item.order,
        title: item.title,
        description: item.description,
        isFinal: item.isFinal,
        state: done ? 'COMPLETED' : previousDone ? 'OPEN' : 'LOCKED',
        completedAt: progress?.completedAt ?? null,
        materialCount: item.materials?.length ?? 0,
        assignmentCount: item.assignments?.length ?? 0,
        logbookOk: progress?.logbookOk ?? false,
      });
      previousDone = done;
    }
    return views;
  }

  /**
   * Tuntas = sudah diselesaikan, DAN kalau program memakai logbook,
   * logbooknya sudah disetujui. Pada program tanpa logbook, `logbookOk`
   * tidak pernah diisi siapa pun - karena itu ia hanya diperiksa saat
   * memang relevan.
   */
  private isDone(
    progress: SyllabusProgress | null,
    logbookRequired: boolean,
  ): boolean {
    if (!progress?.completedAt) return false;
    return logbookRequired ? progress.logbookOk : true;
  }

  /** Ringkasan untuk kepala tab. */
  async statsFor(
    courseId: string,
    userId: string,
  ): Promise<{ total: number; completed: number; percent: number }> {
    const views = await this.findForStudent(courseId, userId);
    const completed = views.filter((v) => v.state === 'COMPLETED').length;
    return {
      total: views.length,
      completed,
      percent: views.length
        ? Math.round((completed / views.length) * 100)
        : 0,
    };
  }

  // ---------------------------------------------------------------- tulis

  /**
   * Student menandai satu silabus selesai.
   *
   * Menolak bila silabusnya masih terkunci - penjagaan ada di server, bukan
   * hanya di tombol. Idempoten: menandai dua kali tidak menggeser
   * `completedAt` yang sudah tercatat.
   */
  async markComplete(syllabusId: string, userId: string): Promise<void> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
      relations: ['course'],
    });
    if (!syllabus) throw new NotFoundException('Syllabus not found');

    const views = await this.findForStudent(syllabus.course.id, userId);
    const view = views.find((v) => v.id === syllabusId);
    if (!view || view.state === 'LOCKED') {
      throw new NotFoundException('Syllabus is not open yet');
    }
    if (view.state === 'COMPLETED') return;

    const existing = await this.progressRepository.findOne({
      where: { syllabus: { id: syllabusId }, user: { id: userId } },
    });
    if (existing) {
      if (existing.completedAt) return;
      existing.completedAt = new Date();
      await this.progressRepository.save(existing);
      await this.refreshCourseCompletion(syllabus.course.id, userId);
      return;
    }
    // UNIQUE (syllabusId, userId) menjaga baris ganda di tingkat basis data,
    // jadi tidak ada pola upsert manual seperti pada session_progresses.
    await this.progressRepository.save(
      this.progressRepository.create({
        syllabus: { id: syllabusId } as Syllabus,
        user: { id: userId } as any,
        completedAt: new Date(),
      }),
    );
    await this.refreshCourseCompletion(syllabus.course.id, userId);
  }

  /** Dipanggil saat admin menyetujui / menolak logbook sebuah silabus. */
  async setLogbookApproved(
    syllabusId: string,
    userId: string,
    approved: boolean,
  ): Promise<void> {
    const existing = await this.progressRepository.findOne({
      where: { syllabus: { id: syllabusId }, user: { id: userId } },
    });
    if (existing) {
      existing.logbookOk = approved;
      await this.progressRepository.save(existing);
      return;
    }
    await this.progressRepository.save(
      this.progressRepository.create({
        syllabus: { id: syllabusId } as Syllabus,
        user: { id: userId } as any,
        logbookOk: approved,
      }),
    );
  }

  // --------------------------------------------------- isi silabus (admin)

  /**
   * Menambah materi. `fileType` dibatasi tiga nilai yang sama dengan jalur
   * bootcamp - enumnya memang dipakai bersama, bukan disalin.
   */
  async addMaterial(
    syllabusId: string,
    data: { title: string; file: string; fileType: FileType },
  ): Promise<SyllabusMaterial> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
    });
    if (!syllabus) throw new NotFoundException('Syllabus not found');
    if (!data.title?.trim()) throw new Error('Title is required.');
    if (!data.file?.trim()) throw new Error('File or link is required.');
    return this.materialRepository.save(
      this.materialRepository.create({
        syllabus,
        title: data.title.trim(),
        file: data.file.trim(),
        fileType: data.fileType,
      }),
    );
  }

  async removeMaterial(materialId: string): Promise<string> {
    const item = await this.materialRepository.findOne({
      where: { id: materialId },
      relations: ['syllabus'],
    });
    if (!item) throw new NotFoundException('Material not found');
    const syllabusId = item.syllabus.id;
    await this.materialRepository.remove(item);
    return syllabusId;
  }

  async addAssignment(
    syllabusId: string,
    data: { title: string; file: string },
  ): Promise<SyllabusAssignment> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
    });
    if (!syllabus) throw new NotFoundException('Syllabus not found');
    if (!data.title?.trim()) throw new Error('Title is required.');
    if (!data.file?.trim()) throw new Error('File or link is required.');
    return this.assignmentRepository.save(
      this.assignmentRepository.create({
        syllabus,
        title: data.title.trim(),
        file: data.file.trim(),
      }),
    );
  }

  /**
   * Menghapus tugas ikut menghapus jawaban student dan komentarnya lewat
   * CASCADE di basis data. Itu disengaja - tugas yang hilang tidak boleh
   * meninggalkan jawaban yatim.
   */
  async removeAssignment(assignmentId: string): Promise<string> {
    const item = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['syllabus'],
    });
    if (!item) throw new NotFoundException('Assignment not found');
    const syllabusId = item.syllabus.id;
    await this.assignmentRepository.remove(item);
    return syllabusId;
  }

  /**
   * Siapa sudah menyelesaikan silabus apa - pengganti layar absensi.
   *
   * Daftar orangnya diambil dari PENDAFTARAN (`user_courses`), bukan dari
   * baris progres. Bedanya menentukan: baris progres baru ada setelah student
   * menyelesaikan sesuatu, jadi kalau daftarnya dari sana, student yang belum
   * mengerjakan apa pun tidak muncul sama sekali - padahal justru merekalah
   * yang dicari admin di layar ini.
   */
  async completionFor(courseId: string) {
    const items = await this.syllabusRepository.find({
      where: { course: { id: courseId } },
      order: { order: 'ASC' },
    });

    const enrolled = await this.userCourseRepository.find({
      where: { course: { id: courseId } },
      relations: ['user'],
    });

    const progresses = await this.progressRepository.find({
      where: { syllabus: { course: { id: courseId } } },
      relations: ['syllabus', 'user'],
    });

    const done = new Set(
      progresses
        .filter((p) => p.completedAt && p.user)
        .map((p) => `${p.user.id}:${p.syllabus.id}`),
    );

    const students = new Map<
      string,
      { id: string; name: string; email: string }
    >();
    for (const e of enrolled) {
      if (!e.user) continue;
      students.set(e.user.id, {
        id: e.user.id,
        name: e.user.username ?? '',
        email: e.user.email ?? '',
      });
    }
    // Jaring pengaman: student yang punya progres tetapi pendaftarannya sudah
    // dicabut tetap ditampilkan, supaya pekerjaannya tidak hilang diam-diam.
    for (const p of progresses) {
      if (!p.user || students.has(p.user.id)) continue;
      students.set(p.user.id, {
        id: p.user.id,
        name: p.user.username ?? '',
        email: p.user.email ?? '',
      });
    }

    const rows = [...students.values()]
      .map((st) => ({
        ...st,
        cells: items.map((i) => ({
          id: i.id,
          done: done.has(`${st.id}:${i.id}`),
        })),
        completed: items.filter((i) => done.has(`${st.id}:${i.id}`)).length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      syllabi: items.map((i) => ({ id: i.id, order: i.order, title: i.title })),
      rows,
      total: items.length,
    };
  }


  // ------------------------------------------------- pengumpulan tugas

  /**
   * Student mengumpulkan (atau memperbarui) jawaban satu tugas.
   *
   * SATU jawaban per student per tugas - dijaga `UQ (task, user)` di basis
   * data, dan di sini diperlakukan sebagai upsert. Padanan bootcamp-nya
   * (`AnswerTask`) tidak punya penjagaan itu dan alur "Edit Submission"-nya
   * mengandalkan jawaban pertama yang kebetulan ditemukan; di sini tidak ada
   * "kebetulan" karena barisnya memang cuma bisa satu.
   *
   * Jawaban yang SUDAH DISETUJUI tidak bisa diubah lagi. Kalau boleh, student
   * bisa menukar isinya setelah lolos penilaian dan mentor tidak akan pernah
   * tahu - persetujuannya jadi tidak berarti apa-apa.
   */
  async submitAnswer(
    assignmentId: string,
    userId: string,
    file: string,
  ): Promise<SyllabusAnswerTask> {
    if (!file?.trim()) throw new Error('A link is required.');

    const task = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });
    if (!task) throw new NotFoundException('Assignment not found');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.answerRepository.findOne({
      where: { task: { id: assignmentId }, user: { id: userId } },
    });

    if (existing) {
      if (existing.process === 'approved') {
        throw new Error('This answer was approved and can no longer be changed.');
      }
      existing.file = file.trim();
      existing.process = 'process';
      return this.answerRepository.save(existing);
    }

    return this.answerRepository.save(
      this.answerRepository.create({
        task,
        user,
        file: file.trim(),
        process: 'process',
      }),
    );
  }

  /**
   * Jawaban seorang student untuk seluruh tugas pada satu silabus, dipetakan
   * per tugas supaya template tidak perlu mencari-cari.
   */
  async answersForStudent(
    syllabusId: string,
    userId: string,
  ): Promise<Map<string, SyllabusAnswerTask>> {
    const answers = await this.answerRepository.find({
      where: {
        user: { id: userId },
        task: { syllabus: { id: syllabusId } },
      },
      relations: ['task', 'comments'],
      order: { createdAt: 'ASC' },
    });
    return new Map(answers.map((a) => [a.task.id, a]));
  }

  /** Semua jawaban atas satu tugas - untuk layar penilaian mentor. */
  async answersForAssignment(assignmentId: string) {
    const task = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['syllabus', 'syllabus.course'],
    });
    if (!task) throw new NotFoundException('Assignment not found');

    const answers = await this.answerRepository.find({
      where: { task: { id: assignmentId } },
      relations: ['user', 'comments'],
      order: { createdAt: 'ASC' },
    });
    return { task, answers };
  }

  /**
   * Mentor menilai satu jawaban.
   *
   * Komentar disimpan sebagai baris tersendiri, bukan menimpa yang lama:
   * riwayat penilaian adalah percakapan, dan student perlu bisa membaca lagi
   * apa yang diminta pada putaran sebelumnya.
   */
  async reviewAnswer(
    answerId: string,
    process: ProcessStatus,
    comment?: string,
  ): Promise<SyllabusAnswerTask> {
    if (!['approved', 'process', 'rejected'].includes(process)) {
      throw new Error('Unknown review status.');
    }
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
    });
    if (!answer) throw new NotFoundException('Answer not found');

    answer.process = process;
    const saved = await this.answerRepository.save(answer);

    if (comment?.trim()) {
      await this.commentRepository.save(
        this.commentRepository.create({
          answer: saved,
          comment: comment.trim(),
        }),
      );
    }
    return saved;
  }


  // ------------------------------------------------------------- kuis

  /**
   * SATU kuis per silabus - keputusan pemilik 2026-09-18.
   *
   * Dikelola di sini, bukan lewat QuizService.create(), dan itu disengaja:
   * method itu sekaligus membuka QuizProgress berdasarkan kehadiran dan
   * logbook sesi terakhir (`sessionUnlock`). Jalur silabus memang tidak punya
   * kehadiran, jadi memanggilnya berarti menyeret kembali aturan yang justru
   * dibuang oleh pemisahan ini.
   *
   * Kuis silabus tidak punya gerbang buka-kunci tersendiri: silabusnya sudah
   * terbuka, berarti kuisnya terbuka.
   */
  async quizFor(syllabusId: string): Promise<Quiz | null> {
    return this.quizRepository.findOne({
      where: { syllabus: { id: syllabusId } },
      relations: ['questions'],
    });
  }

  /** Kuis untuk seluruh silabus sebuah program, dipetakan per silabus. */
  async quizzesForCourse(courseId: string): Promise<Map<string, Quiz>> {
    const quizzes = await this.quizRepository.find({
      where: { syllabus: { course: { id: courseId } } },
      relations: ['syllabus', 'questions'],
    });
    return new Map(
      quizzes.filter((q) => q.syllabus).map((q) => [q.syllabus!.id, q]),
    );
  }

  async createQuiz(
    syllabusId: string,
    data: { quizName: string; minScore: number; duration: number },
  ): Promise<Quiz> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
    });
    if (!syllabus) throw new NotFoundException('Syllabus not found');

    if (!data.quizName?.trim()) throw new Error('Quiz name is required.');
    if (!Number.isInteger(data.duration) || data.duration < 1) {
      throw new Error('Duration must be at least 1 minute.');
    }
    if (!Number.isInteger(data.minScore) || data.minScore < 0) {
      throw new Error('Minimum score cannot be negative.');
    }

    // Satu per silabus dijaga di sini, bukan oleh UNIQUE di basis data: kolom
    // `syllabusId` dipakai bersama kuis bootcamp yang selalu NULL, dan UNIQUE
    // di sana akan bertabrakan dengan mereka.
    const existing = await this.quizRepository.findOne({
      where: { syllabus: { id: syllabusId } },
    });
    if (existing) {
      throw new Error('This syllabus already has a quiz.');
    }

    return this.quizRepository.save(
      this.quizRepository.create({
        syllabus,
        quizName: data.quizName.trim(),
        minScore: data.minScore,
        duration: data.duration,
      }),
    );
  }

  /**
   * Menghapus kuis silabus. Pertanyaan, jawaban, nilai, dan progresnya ikut
   * terhapus lewat CASCADE - kuis yang hilang tidak boleh meninggalkan nilai
   * yang tidak bisa ditelusuri lagi asalnya.
   */
  async removeQuiz(quizId: string): Promise<string | null> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['syllabus'],
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (!quiz.syllabus) {
      throw new Error('That quiz belongs to a week, not a syllabus.');
    }
    const syllabusId = quiz.syllabus.id;
    await this.quizRepository.remove(quiz);
    return syllabusId;
  }



  // ------------------------------------------------ ketamatan program

  /**
   * Menghitung ulang apakah sebuah program SPL sudah tamat bagi seorang
   * student, lalu menyimpannya di `user_courses.progress`.
   *
   * Aturannya (keputusan pemilik 2026-09-18): **semua silabus selesai, baru
   * tamat.** "Selesai" memakai definisi yang sama persis dengan buka-kunci
   * (`isDone`) - `completedAt`, ditambah `logbookOk` kalau program memakai
   * logbook. Memakai definisi yang lebih longgar di sini berarti program bisa
   * dinyatakan tamat sementara silabus terakhirnya masih terkunci bagi
   * studentnya sendiri.
   *
   * `user_courses.progress` adalah kolom yang sama yang dipakai jalur bootcamp
   * (diisi saat lulus kuis minggu final) dan yang dibaca `activeCourseCompleted`
   * untuk membuka sertifikat. Jadi tidak ada jalur sertifikat kedua - keduanya
   * bertemu di satu kolom.
   *
   * DIHITUNG ULANG, bukan sekadar dinyalakan. Mentor bisa menarik persetujuan
   * logbook, dan kalau itu terjadi programnya kembali belum tamat. Kolom yang
   * hanya bisa naik akan membuat sertifikat terbit untuk program yang syaratnya
   * sudah tidak terpenuhi lagi.
   */
  async refreshCourseCompletion(
    courseId: string,
    userId: string,
  ): Promise<boolean> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    // Jalur bootcamp punya penentu ketamatannya sendiri (lulus kuis minggu
    // final). Jangan disentuh dari sini.
    if (!course || capabilitiesForCourse(course).structure !== 'syllabus') {
      return false;
    }

    const views = await this.findForStudent(courseId, userId);

    // Program tanpa silabus TIDAK tamat. Tanpa penjagaan ini, `every()` pada
    // daftar kosong menjawab true dan program yang belum diisi apa pun langsung
    // menerbitkan sertifikat.
    const done = views.length > 0 && views.every((v) => v.state === 'COMPLETED');

    const enrolment = await this.userCourseRepository.findOne({
      where: { course: { id: courseId }, user: { id: userId } },
    });
    if (!enrolment) return done;

    if (enrolment.progress !== done) {
      enrolment.progress = done;
      await this.userCourseRepository.save(enrolment);
    }
    return done;
  }

  // ---------------------------------------------------------- logbook

  /**
   * Logbook student pada satu silabus. SATU per student per silabus.
   *
   * Ini bukan hiasan. Kalau program menyalakan logbook, `isDone()` menuntut
   * `logbookOk` - artinya student bisa menandai silabus selesai tetapi silabus
   * berikutnya TETAP TERKUNCI sampai mentor menyetujui logbooknya. Sebelum
   * layar ini ada, tidak ada satu pun cara menulis maupun menyetujui logbook,
   * jadi program SPL dengan logbook menyala adalah jalan buntu: ditemukan
   * hidup di "TEST NON BOOTCAMP", silabus 1 selesai dan silabus 2 terkunci
   * selamanya.
   */
  async logbookFor(
    syllabusId: string,
    userId: string,
  ): Promise<SyllabusLogbook | null> {
    return this.logbookRepository.findOne({
      where: { syllabus: { id: syllabusId }, user: { id: userId } },
    });
  }

  async saveLogbook(
    syllabusId: string,
    userId: string,
    data: {
      activity: string;
      activityDetails?: string;
      obstacles?: string;
      documentation?: string;
      otherDocumentation?: string;
    },
  ): Promise<SyllabusLogbook> {
    if (!data.activity?.trim()) throw new Error('Activity is required.');

    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
    });
    if (!syllabus) throw new NotFoundException('Syllabus not found');
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.logbookFor(syllabusId, userId);

    // Logbook yang SUDAH DISETUJUI tidak bisa diubah lagi - alasannya sama
    // dengan jawaban tugas: kalau isinya masih bisa ditukar setelah lolos,
    // persetujuan mentornya tidak berarti apa-apa. Dan karena logbook inilah
    // yang membuka silabus berikutnya, taruhannya lebih besar.
    if (existing?.process === 'approved') {
      throw new Error('This logbook was approved and can no longer be changed.');
    }

    const row = existing ?? this.logbookRepository.create({ syllabus, user });
    row.activity = data.activity.trim();
    row.activityDetails = data.activityDetails?.trim() ?? '';
    row.obstacles = data.obstacles?.trim() ?? '';
    row.documentation = data.documentation?.trim() ?? '';
    row.otherDocumentation = data.otherDocumentation?.trim() ?? '';
    row.process = 'process';
    return this.logbookRepository.save(row);
  }

  /** Semua logbook pada satu program - untuk layar mentor. */
  async logbooksForCourse(courseId: string) {
    return this.logbookRepository.find({
      where: { syllabus: { course: { id: courseId } } },
      relations: ['syllabus', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mentor menilai logbook. Menyetujui SEKALIGUS menandai `logbookOk` pada
   * progres, karena itulah yang sebenarnya membuka silabus berikutnya -
   * memisahkan keduanya cuma membuka peluang keduanya tidak sinkron.
   */
  async reviewLogbook(
    logbookId: string,
    process: ProcessStatus,
  ): Promise<SyllabusLogbook> {
    if (!['approved', 'process', 'rejected'].includes(process)) {
      throw new Error('Unknown review status.');
    }
    const logbook = await this.logbookRepository.findOne({
      where: { id: logbookId },
      relations: ['syllabus', 'user'],
    });
    if (!logbook) throw new NotFoundException('Logbook not found');

    logbook.process = process;
    const saved = await this.logbookRepository.save(logbook);
    await this.setLogbookApproved(
      logbook.syllabus.id,
      logbook.user.id,
      process === 'approved',
    );

    // Pada program berlogbook, persetujuan inilah langkah TERAKHIR yang membuat
    // sebuah silabus terhitung selesai - jadi di sinilah program bisa menjadi
    // tamat. Dan sebaliknya: menarik persetujuan membatalkannya kembali.
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: logbook.syllabus.id },
      relations: ['course'],
    });
    if (syllabus) {
      await this.refreshCourseCompletion(syllabus.course.id, logbook.user.id);
    }
    return saved;
  }

  // ---------------------------------------------------------------- admin

  /**
   * Menambahkan satu silabus di urutan terakhir.
   *
   * Urutannya dihitung dari yang sudah ada, bukan diterima dari pemanggil -
   * `UNIQUE (courseId, order)` akan menolak duplikat, dan menghitungnya di
   * sini membuat penolakan itu tidak pernah terjadi karena kelalaian.
   */
  async create(
    courseId: string,
    data: { title: string; description?: string | null; isFinal?: boolean },
  ): Promise<Syllabus> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Program not found');

    const last = await this.syllabusRepository.findOne({
      where: { course: { id: courseId } },
      order: { order: 'DESC' },
    });
    return this.syllabusRepository.save(
      this.syllabusRepository.create({
        course,
        order: (last?.order ?? 0) + 1,
        title: data.title,
        description: data.description ?? null,
        isFinal: data.isFinal ?? false,
      }),
    );
  }

  async update(
    syllabusId: string,
    data: { title?: string; description?: string | null; isFinal?: boolean },
  ): Promise<Syllabus> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
    });
    if (!syllabus) throw new NotFoundException('Syllabus not found');
    if (data.title !== undefined) syllabus.title = data.title;
    if (data.description !== undefined) syllabus.description = data.description;
    if (data.isFinal !== undefined) syllabus.isFinal = data.isFinal;
    return this.syllabusRepository.save(syllabus);
  }

  /**
   * Menghapus satu silabus, lalu merapatkan urutan yang tersisa.
   *
   * Tanpa perapatan, menghapus silabus ke-2 dari 3 menyisakan urutan 1 dan 3,
   * dan silabus berikutnya yang ditambahkan akan bernomor 4 - terlihat seperti
   * ada yang hilang. Anaknya ikut terhapus lewat CASCADE di basis data.
   */
  async remove(syllabusId: string): Promise<void> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
      relations: ['course'],
    });
    if (!syllabus) throw new NotFoundException('Syllabus not found');
    const courseId = syllabus.course.id;
    await this.syllabusRepository.remove(syllabus);

    const rest = await this.syllabusRepository.find({
      where: { course: { id: courseId } },
      order: { order: 'ASC' },
    });
    // Dinaikkan dulu ke rentang yang pasti kosong, baru diturunkan - kalau
    // langsung ditulis 1..n, UNIQUE (courseId, order) menolak di tengah jalan
    // karena nomor tujuan masih dipakai baris lain.
    const OFFSET = 100000;
    for (const [i, item] of rest.entries()) {
      item.order = OFFSET + i + 1;
    }
    await this.syllabusRepository.save(rest);
    for (const [i, item] of rest.entries()) {
      item.order = i + 1;
    }
    await this.syllabusRepository.save(rest);
  }

  /** Memindahkan satu silabus ke posisi lain, urutan lain ikut menyesuaikan. */
  async reorder(syllabusId: string, targetOrder: number): Promise<void> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
      relations: ['course'],
    });
    if (!syllabus) throw new NotFoundException('Syllabus not found');

    const all = await this.syllabusRepository.find({
      where: { course: { id: syllabus.course.id } },
      order: { order: 'ASC' },
    });
    const without = all.filter((s) => s.id !== syllabusId);
    const at = Math.max(0, Math.min(targetOrder - 1, without.length));
    without.splice(at, 0, syllabus);

    const OFFSET = 100000;
    for (const [i, item] of without.entries()) item.order = OFFSET + i + 1;
    await this.syllabusRepository.save(without);
    for (const [i, item] of without.entries()) item.order = i + 1;
    await this.syllabusRepository.save(without);
  }
}
