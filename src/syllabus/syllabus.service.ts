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
