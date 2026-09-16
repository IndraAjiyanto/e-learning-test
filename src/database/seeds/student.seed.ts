import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';

import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Session } from 'src/entities/session.entity';
import { Material } from 'src/entities/materials.entity';
import { Assignment } from 'src/entities/assignment.entity';
import { AnswerTask } from 'src/entities/answer_task.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { Question } from 'src/entities/question.entity';
import { Answer } from 'src/entities/answer.entity';
import { Score } from 'src/entities/score.entity';
import { Attendance } from 'src/entities/attendance.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { QuizProgress } from 'src/entities/quiz_progress.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { Registration } from 'src/entities/registration.entity';
import { Payment } from 'src/entities/payment.entity';
import { Installment } from 'src/entities/installment.entity';

/**
 * Seed data belajar untuk SATU student, supaya setiap tab di area student
 * menampilkan isi sungguhan, bukan empty state.
 *
 * Latar belakang: sesi redesign 2026-09-16 membuat baris-baris ini lewat INSERT
 * `psql` mentah lalu membuangnya (lihat docs/user-area-handover-2026-09-16.md §2
 * "Data seeding"). Akibatnya setiap klon baru kembali kosong dan tidak ada yang
 * bisa mereview tab mana pun. File ini menjadikannya bisa diulang.
 *
 * Pakai:
 *   npm run seed           # wajib lebih dulu: user + 1 course contoh
 *   npm run seed:student   # file ini
 *
 * Target student bisa diganti:
 *   STUDENT_EMAIL=indra@gmail.com npm run seed:student
 *
 * Idempoten per blok: setiap bagian memeriksa datanya sendiri dan melewati bila
 * sudah ada, jadi aman dijalankan berulang, termasuk di atas database hasil
 * restore dump yang sebagian tabelnya sudah terisi.
 */

const STUDENT_EMAIL = process.env.STUDENT_EMAIL || 'indra@gmail.com';

// Tanggal relatif terhadap hari ini supaya data tidak pernah terlihat basi.
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysAhead = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  const log = (msg: string) => console.log(`student.seed: ${msg}`);

  const userRepo = ds.getRepository(User);
  const courseRepo = ds.getRepository(Course);
  const userCourseRepo = ds.getRepository(UserCourse);

  const student = await userRepo.findOne({ where: { email: STUDENT_EMAIL } });
  if (!student) {
    log(
      `user "${STUDENT_EMAIL}" tidak ada. Jalankan "npm run seed" dulu, ` +
        'atau set STUDENT_EMAIL ke user yang memang ada.',
    );
    await app.close();
    return;
  }
  if (student.role !== 'user') {
    log(`peringatan: "${STUDENT_EMAIL}" ber-role "${student.role}", bukan "user".`);
  }

  // Course target: yang sudah diikuti student, kalau tidak ada ambil course
  // pertama yang tersedia lalu daftarkan student ke situ.
  let userCourse = await userCourseRepo.findOne({
    where: { user: { id: student.id } },
    relations: ['course'],
  });
  let course = userCourse?.course ?? null;

  if (!course) {
    course = await courseRepo.findOne({ where: {}, order: { name: 'ASC' } });
    if (!course) {
      log('tidak ada course sama sekali. Jalankan "npm run seed" dulu.');
      await app.close();
      return;
    }
    userCourse = await userCourseRepo.save(
      userCourseRepo.create({ user: student, course, progress: false }),
    );
    log(`mendaftarkan ${STUDENT_EMAIL} ke course "${course.name}"`);
  }
  log(`student ${STUDENT_EMAIL}, course "${course.name}"`);

  // --- Struktur belajar: 2 minggu, 3 sesi, 3 materi ---------------------------
  const weekRepo = ds.getRepository(Weeks);
  const sessionRepo = ds.getRepository(Session);
  const materialRepo = ds.getRepository(Material);

  let weeks = await weekRepo.find({
    where: { course: { id: course.id } },
    order: { weekNumber: 'ASC' },
  });

  if (weeks.length === 0) {
    weeks = await weekRepo.save([
      weekRepo.create({
        weekNumber: 1,
        description: 'Fondasi: lingkungan kerja, version control, dasar HTML & CSS.',
        isFinal: false,
        course,
      }),
      weekRepo.create({
        weekNumber: 2,
        description: 'Membangun antarmuka: komponen, state, dan konsumsi API.',
        isFinal: true,
        course,
      }),
    ]);
    log(`membuat ${weeks.length} minggu`);
  } else {
    log(`minggu sudah ada (${weeks.length}), dilewati`);
  }

  let sessions = await sessionRepo.find({
    where: weeks.map((w) => ({ weeks: { id: w.id } })),
    order: { sessionOrder: 'ASC' },
  });

  if (sessions.length === 0) {
    sessions = await sessionRepo.save([
      sessionRepo.create({
        topic: 'Menyiapkan lingkungan kerja',
        sessionOrder: 1,
        date: daysAgo(14),
        location: 'Zoom',
        startTime: '19:00',
        endTime: '21:00',
        isFinal: false,
        weeks: weeks[0],
      }),
      sessionRepo.create({
        topic: 'HTML semantik dan dasar CSS',
        sessionOrder: 2,
        date: daysAgo(7),
        location: 'Zoom',
        startTime: '19:00',
        endTime: '21:00',
        isFinal: true,
        weeks: weeks[0],
      }),
      sessionRepo.create({
        topic: 'Komponen dan state',
        sessionOrder: 3,
        date: daysAhead(3),
        location: 'Zoom',
        startTime: '19:00',
        endTime: '21:00',
        isFinal: false,
        weeks: weeks[1],
      }),
    ]);
    log(`membuat ${sessions.length} sesi`);
  } else {
    log(`sesi sudah ada (${sessions.length}), dilewati`);
  }

  const materialCount = await materialRepo.count({
    where: sessions.map((s) => ({ session: { id: s.id } })),
  });
  if (materialCount === 0) {
    await materialRepo.save([
      materialRepo.create({
        title: 'Panduan menyiapkan lingkungan kerja',
        file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        session: sessions[0],
      }),
      materialRepo.create({
        title: 'Rekaman sesi: HTML semantik',
        file: 'https://www.youtube.com/embed/UB1O30fR-EE',
        fileType: 'video',
        session: sessions[1],
      }),
      materialRepo.create({
        title: 'Slide: dasar CSS layout',
        file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'ppt',
        session: sessions[1],
      }),
    ]);
    log('membuat 3 materi (pdf / video / ppt)');
  } else {
    log(`materi sudah ada (${materialCount}), dilewati`);
  }

  // --- Absensi ----------------------------------------------------------------
  const attendanceRepo = ds.getRepository(Attendance);
  const attendanceCount = await attendanceRepo.count({
    where: { user: { id: student.id } },
  });
  if (attendanceCount === 0) {
    await attendanceRepo.save([
      attendanceRepo.create({
        status: 'present',
        attendanceTime: daysAgo(14),
        notes: 'Hadir tepat waktu.',
        user: student,
        session: sessions[0],
      }),
      attendanceRepo.create({
        status: 'permission',
        attendanceTime: daysAgo(7),
        notes: 'Izin, ada jadwal kuliah yang bentrok.',
        user: student,
        session: sessions[1],
      }),
    ]);
    log('membuat 2 baris absensi');
  } else {
    log(`absensi sudah ada (${attendanceCount}), dilewati`);
  }

  // --- Logbook ----------------------------------------------------------------
  const logbookRepo = ds.getRepository(Logbook);
  const logbookCount = await logbookRepo.count({
    where: { user: { id: student.id } },
  });
  if (logbookCount === 0) {
    await logbookRepo.save([
      logbookRepo.create({
        activity: 'Menyiapkan lingkungan kerja',
        activityDetails:
          'Memasang Node.js, pnpm, dan VS Code. Menjalankan proyek contoh sampai tampil di browser.',
        obstacles: 'Sempat salah versi Node, diperbaiki dengan nvm.',
        process: 'approved',
        documentation: null,
        otherDocumentation: '',
        user: student,
        session: sessions[0],
      }),
      logbookRepo.create({
        activity: 'Latihan HTML semantik',
        activityDetails:
          'Menulis ulang satu halaman landing memakai tag semantik dan memeriksa strukturnya.',
        obstacles: 'Masih ragu memilih antara section dan article.',
        process: 'process',
        documentation: null,
        otherDocumentation: '',
        user: student,
        session: sessions[1],
      }),
    ]);
    log('membuat 2 entri logbook (1 approved, 1 process)');
  } else {
    log(`logbook sudah ada (${logbookCount}), dilewati`);
  }

  // --- Tugas dan pengumpulan --------------------------------------------------
  const assignmentRepo = ds.getRepository(Assignment);
  const answerTaskRepo = ds.getRepository(AnswerTask);

  let assignments = await assignmentRepo.find({
    where: sessions.map((s) => ({ session: { id: s.id } })),
  });
  if (assignments.length === 0) {
    assignments = await assignmentRepo.save([
      assignmentRepo.create({
        title: 'Tugas 1: halaman profil statis',
        file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        session: sessions[0],
      }),
      assignmentRepo.create({
        title: 'Tugas 2: ulang layout dengan flexbox',
        file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        session: sessions[1],
      }),
    ]);
    log(`membuat ${assignments.length} tugas`);
  } else {
    log(`tugas sudah ada (${assignments.length}), dilewati`);
  }

  const answerTaskCount = await answerTaskRepo.count({
    where: { user: { id: student.id } },
  });
  if (answerTaskCount === 0) {
    await answerTaskRepo.save([
      answerTaskRepo.create({
        file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        process: 'approved',
        user: student,
        task: assignments[0],
      }),
      answerTaskRepo.create({
        file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        process: 'process',
        user: student,
        task: assignments[1],
      }),
    ]);
    log('membuat 2 pengumpulan tugas (1 approved, 1 process)');
  } else {
    log(`pengumpulan tugas sudah ada (${answerTaskCount}), dilewati`);
  }

  // --- Kuis: 3 soal, 4 pilihan, 1 nilai --------------------------------------
  const quizRepo = ds.getRepository(Quiz);
  const questionRepo = ds.getRepository(Question);
  const answerRepo = ds.getRepository(Answer);
  const scoreRepo = ds.getRepository(Score);

  let quiz = await quizRepo.findOne({
    where: weeks.map((w) => ({ weeks: { id: w.id } })),
  });
  if (!quiz) {
    quiz = await quizRepo.save(
      quizRepo.create({
        quizName: 'Kuis minggu 1: dasar web',
        minScore: 70,
        duration: 15,
        weeks: weeks[0],
      }),
    );

    const soal: Array<[string, string[], number]> = [
      [
        'Tag mana yang dipakai untuk judul terpenting sebuah halaman?',
        ['<h1>', '<head>', '<title>', '<header>'],
        0,
      ],
      [
        'Properti CSS mana yang mengatur jarak DI DALAM sebuah elemen?',
        ['margin', 'padding', 'border', 'gap'],
        1,
      ],
      [
        'Apa fungsi utama version control seperti Git?',
        [
          'Mempercepat website',
          'Mengompres gambar',
          'Melacak perubahan kode',
          'Menyusun basis data',
        ],
        2,
      ],
    ];

    for (const [questionText, options, correctIndex] of soal) {
      const question = await questionRepo.save(
        questionRepo.create({ questionText, quiz }),
      );
      await answerRepo.save(
        options.map((answer, i) =>
          answerRepo.create({ answer, isCorrect: i === correctIndex, question }),
        ),
      );
    }
    log('membuat 1 kuis + 3 soal + 12 pilihan jawaban');
  } else {
    log('kuis sudah ada, dilewati');
  }

  const scoreCount = await scoreRepo.count({
    where: { user: { id: student.id }, quiz: { id: quiz.id } },
  });
  if (scoreCount === 0) {
    await scoreRepo.save(scoreRepo.create({ score: 80, user: student, quiz }));
    log('membuat 1 nilai kuis (80)');
  } else {
    log(`nilai kuis sudah ada (${scoreCount}), dilewati`);
  }

  // --- Progres: minggu 1 selesai sehingga minggu 2 terbuka --------------------
  const weekProgressRepo = ds.getRepository(WeekProgress);
  const sessionProgressRepo = ds.getRepository(SessionProgress);
  const quizProgressRepo = ds.getRepository(QuizProgress);

  const weekProgressCount = await weekProgressRepo.count({
    where: { user: { id: student.id } },
  });
  if (weekProgressCount === 0) {
    await weekProgressRepo.save([
      weekProgressRepo.create({
        user: student,
        week: weeks[0],
        quiz: true,
        process: true,
      }),
      weekProgressRepo.create({
        user: student,
        week: weeks[1],
        quiz: false,
        process: false,
      }),
    ]);
    await sessionProgressRepo.save([
      sessionProgressRepo.create({
        user: student,
        session: sessions[0],
        logbook: true,
        isAttended: true,
      }),
      sessionProgressRepo.create({
        user: student,
        session: sessions[1],
        logbook: true,
        isAttended: true,
      }),
    ]);
    await quizProgressRepo.save(
      quizProgressRepo.create({ user: student, quiz, process: true }),
    );
    log('membuat progres minggu/sesi/kuis (minggu 1 selesai, minggu 2 terbuka)');
  } else {
    log(`progres sudah ada (${weekProgressCount}), dilewati`);
  }

  // --- Portfolio --------------------------------------------------------------
  const portfolioRepo = ds.getRepository(Portofolios);
  const portfolioCount = await portfolioRepo.count({
    where: { user: { id: student.id } },
  });
  if (portfolioCount === 0) {
    await portfolioRepo.save(
      portfolioRepo.create({
        title: 'Halaman profil responsif',
        description:
          'Halaman profil satu kolom yang dibuat di minggu pertama, responsif sampai lebar ponsel.',
        content: 'Dibuat dengan HTML semantik dan CSS flexbox, tanpa framework.',
        contentHtml:
          '<p>Dibuat dengan HTML semantik dan CSS flexbox, tanpa framework.</p>',
        image: ['/public/image/dashboard/login_bg.png'],
        link: 'https://example.com/portfolio-profil',
        views: 0,
        likes: 0,
        user: student,
        course,
      }),
    );
    log('membuat 1 item portfolio');
  } else {
    log(`portfolio sudah ada (${portfolioCount}), dilewati`);
  }

  // --- Pendaftaran dan pembayaran --------------------------------------------
  const registrationRepo = ds.getRepository(Registration);
  const paymentRepo = ds.getRepository(Payment);
  const installmentRepo = ds.getRepository(Installment);

  const registrationCount = await registrationRepo.count({
    where: { user: { id: student.id } },
  });
  if (registrationCount === 0) {
    await registrationRepo.save(
      registrationRepo.create({
        file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        process: 'approved',
        user_fullname: student.username,
        user_email: student.email,
        user_no: '+62 812 0000 0001',
        current_status: 'University Student',
        attend_program: true,
        referal_source: 'Instagram',
        user: student,
        course,
      }),
    );
    log('membuat 1 pendaftaran (approved)');
  } else {
    log(`pendaftaran sudah ada (${registrationCount}), dilewati`);
  }

  const paymentCount = await paymentRepo.count({
    where: { user: { id: student.id } },
  });
  if (paymentCount === 0) {
    // Pembayaran lunas.
    await paymentRepo.save(
      paymentRepo.create({
        no: `INV-SEED-${Date.now()}`,
        file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        process: 'approved',
        current_status: 'University Student',
        user_fullname: student.username,
        user_email: student.email,
        user_no: '+62 812 0000 0001',
        attend_program: true,
        user: student,
        course,
      }),
    );

    // Rencana cicilan 3 termin dengan tenggat nyata, plus satu pembayaran DP.
    let installment = await installmentRepo.findOne({
      where: { course: { id: course.id } },
    });
    if (!installment) {
      installment = await installmentRepo.save(
        installmentRepo.create({
          downPayment: 500000,
          price: [1000000, 1000000, 1000000],
          month: 3,
          dueDates: [
            isoDate(daysAhead(7)),
            isoDate(daysAhead(37)),
            isoDate(daysAhead(67)),
          ],
          course,
        }),
      );
    }
    await paymentRepo.save(
      paymentRepo.create({
        no: `INV-SEED-CICILAN-${Date.now()}`,
        file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        process: 'process',
        current_status: 'University Student',
        user_fullname: student.username,
        user_email: student.email,
        user_no: '+62 812 0000 0001',
        attend_program: true,
        dpPaidAt: daysAgo(20),
        user: student,
        course,
        installment,
      }),
    );
    log('membuat 2 pembayaran (1 lunas approved, 1 cicilan process) + 1 rencana cicilan');
  } else {
    log(`pembayaran sudah ada (${paymentCount}), dilewati`);
  }

  log('selesai.');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('student.seed gagal:', err?.message ?? err);
  process.exit(1);
});
