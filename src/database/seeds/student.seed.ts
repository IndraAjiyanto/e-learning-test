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
import { Invoice } from 'src/entities/invoice.entity';
import { ProcessStatus } from 'src/entities/types/process-status';
import { Category } from 'src/entities/category.entity';

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
 *
 * Banyaknya baris sengaja cukup untuk menguji layar seperti yang digambar frame
 * desain: daftar berhalaman, filter yang benar-benar menyaring, dan badge status
 * dalam semua variannya. Atur lewat env bila perlu lebih kecil:
 *   SEED_WEEKS=5 SEED_PAYMENTS=12 npm run seed:student
 */

const STUDENT_EMAIL = process.env.STUDENT_EMAIL || 'indra@gmail.com';
const WEEK_COUNT = Number(process.env.SEED_WEEKS || 5);
const PAYMENT_COUNT = Number(process.env.SEED_PAYMENTS || 12);

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

  // --- Program tambahan -------------------------------------------------------
  // Satu program saja membuat My Learning, Continue Learning, dan filter
  // "Program / Course" di Payment History tidak bisa diuji dengan sungguhan.
  // Dua program berikut ditambahkan bila belum ada, lalu student didaftarkan:
  // satu masih berjalan, satu ditandai selesai supaya kartu statistik Dashboard
  // menunjukkan angka yang berbeda-beda.
  const categoryRepo = ds.getRepository(Category);
  const extraPlans = [
    { name: 'UI/UX Design Fundamentals', description: 'Dasar riset, wireframe, dan prototipe.', progress: true },
    { name: 'Digital Marketing Essentials', description: 'Strategi konten, SEO dasar, dan analitik.', progress: false },
  ];

  let addedCourses = 0;
  for (const plan of extraPlans) {
    let extra = await courseRepo.findOne({ where: { name: plan.name } });
    if (!extra) {
      const category = await categoryRepo.findOne({ where: {}, order: { name: 'ASC' } });
      extra = await courseRepo.save(
        courseRepo.create({
          name: plan.name,
          description: { id: plan.description, en: plan.description, ja: plan.description } as any,
          image: 'logo.png',
          quota: 20,
          price: 1500000,
          promo: 0,
          group: 'https://chat.whatsapp.com/example',
          locations: { id: 'Online', en: 'Online', ja: 'Online' } as any,
          locationLink: 'https://meet.google.com/example',
          method: 'online',
          process: 'approved',
          launch: true,
          checkPaid: true,
          day: 2,
          startDate: daysAgo(60),
          startEnd: daysAhead(30),
          ...(category ? { category } : {}),
        }),
      );
      addedCourses += 1;
    }

    const enrolled = await userCourseRepo.findOne({
      where: { user: { id: student.id }, course: { id: extra.id } },
    });
    if (!enrolled) {
      await userCourseRepo.save(
        userCourseRepo.create({ user: student, course: extra, progress: plan.progress }),
      );
    }
  }
  const enrolledCount = await userCourseRepo.count({ where: { user: { id: student.id } } });
  log(`program: ${addedCourses} dibuat, student terdaftar di ${enrolledCount} program`);


  // --- Struktur belajar: 2 minggu, 3 sesi, 3 materi ---------------------------
  const weekRepo = ds.getRepository(Weeks);
  const sessionRepo = ds.getRepository(Session);
  const materialRepo = ds.getRepository(Material);

  let weeks = await weekRepo.find({
    where: { course: { id: course.id } },
    order: { weekNumber: 'ASC' },
  });

  if (weeks.length === 0) {
    const topics = [
      'Fondasi: lingkungan kerja, version control, dasar HTML & CSS.',
      'Membangun antarmuka: komponen, state, dan konsumsi API.',
      'Data dan penyimpanan: model, relasi, dan query.',
      'Autentikasi, otorisasi, dan keamanan dasar.',
      'Pengujian, build, dan rilis ke produksi.',
      'Proyek akhir: menggabungkan seluruh materi.',
    ];
    weeks = await weekRepo.save(
      Array.from({ length: WEEK_COUNT }, (_, i) =>
        weekRepo.create({
          weekNumber: i + 1,
          description: topics[i % topics.length],
          isFinal: i === WEEK_COUNT - 1,
          course,
        }),
      ),
    );
    log(`membuat ${weeks.length} minggu`);
  } else {
    log(`minggu sudah ada (${weeks.length}), dilewati`);
  }

  let sessions = await sessionRepo.find({
    where: weeks.map((w) => ({ weeks: { id: w.id } })),
    order: { sessionOrder: 'ASC' },
  });

  if (sessions.length === 0) {
    const rows: Session[] = [];
    weeks.forEach((week, wi) => {
      for (let si = 0; si < 2; si += 1) {
        const order = wi * 2 + si + 1;
        const offset = (weeks.length * 2 - order) * 3;
        rows.push(
          sessionRepo.create({
            topic: `Sesi ${order}: ${week.description.split(':')[0]} bagian ${si + 1}`,
            sessionOrder: order,
            date: offset > 0 ? daysAgo(offset) : daysAhead(-offset + 3),
            location: si % 2 === 0 ? 'Zoom' : 'Kelas Purwokerto',
            startTime: '19:00',
            endTime: '21:00',
            isFinal: si === 1,
            weeks: week,
          }),
        );
      }
    });
    sessions = await sessionRepo.save(rows);
    log(`membuat ${sessions.length} sesi`);
  } else {
    log(`sesi sudah ada (${sessions.length}), dilewati`);
  }

  const materialCount = await materialRepo.count({
    where: sessions.map((s) => ({ session: { id: s.id } })),
  });
  if (materialCount === 0) {
    const PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const rows: Material[] = [];
    sessions.slice(0, Math.min(6, sessions.length)).forEach((session, i) => {
      // Sengaja lebih dari satu berkas sejenis: halaman sesi menyebut materi
      // satu per satu, dan kasus "satu sesi punya beberapa PDF" harus benar-benar
      // muncul di data contoh, bukan hanya dibayangkan.
      rows.push(
        materialRepo.create({
          title: `Panduan tertulis — ${session.topic}`,
          file: PDF,
          fileType: 'pdf',
          session,
        }),
        materialRepo.create({
          title: `Lembar latihan — ${session.topic}`,
          file: PDF,
          fileType: 'pdf',
          session,
        }),
        materialRepo.create({
          title: `Ringkasan — ${session.topic}`,
          file: PDF,
          fileType: 'pdf',
          session,
        }),
      );
      if (i % 2 === 0) {
        rows.push(
          materialRepo.create({
            title: `Rekaman sesi — ${session.topic}`,
            file: 'https://www.youtube.com/embed/UB1O30fR-EE',
            fileType: 'video',
            session,
          }),
        );
      } else {
        rows.push(
          materialRepo.create({
            title: `Slide — ${session.topic}`,
            file: PDF,
            fileType: 'ppt',
            session,
          }),
        );
      }
    });
    await materialRepo.save(rows);
    log(`membuat ${rows.length} materi (pdf / video / ppt)`);
  } else {
    log(`materi sudah ada (${materialCount}), dilewati`);
  }

  // --- Absensi ----------------------------------------------------------------
  const attendanceRepo = ds.getRepository(Attendance);
  const attendanceCount = await attendanceRepo.count({
    where: { user: { id: student.id } },
  });
  if (attendanceCount === 0) {
    const past = sessions.filter((x) => new Date(x.date) < new Date());
    const statuses: Array<'present' | 'permission' | 'sick' | 'absent'> = [
      'present', 'present', 'permission', 'present', 'sick', 'present', 'absent',
    ];
    await attendanceRepo.save(
      past.map((session, i) =>
        attendanceRepo.create({
          status: statuses[i % statuses.length],
          attendanceTime: session.date,
          notes:
            statuses[i % statuses.length] === 'present'
              ? 'Hadir tepat waktu.'
              : 'Berhalangan hadir, sudah izin ke mentor.',
          user: student,
          session,
        }),
      ),
    );
    log(`membuat ${past.length} baris absensi`);
  } else {
    log(`absensi sudah ada (${attendanceCount}), dilewati`);
  }

  // --- Logbook ----------------------------------------------------------------
  const logbookRepo = ds.getRepository(Logbook);
  const logbookCount = await logbookRepo.count({
    where: { user: { id: student.id } },
  });
  if (logbookCount === 0) {
    const past = sessions.filter((x) => new Date(x.date) < new Date());
    const flow: ProcessStatus[] = ['approved', 'approved', 'process', 'rejected'];
    await logbookRepo.save(
      past.map((session, i) =>
        logbookRepo.create({
          activity: `Latihan mandiri — ${session.topic}`,
          activityDetails:
            'Mengulang materi sesi, mengerjakan latihan, dan mencatat bagian yang masih ' +
            'perlu didalami. Hasilnya disimpan di repositori pribadi.',
          obstacles:
            i % 3 === 0
              ? 'Tidak ada kendala berarti.'
              : 'Sempat tersendat di bagian konfigurasi, selesai setelah membaca dokumentasi.',
          process: flow[i % flow.length],
          documentation: null,
          otherDocumentation: '',
          user: student,
          session,
        }),
      ),
    );
    log(`membuat ${past.length} entri logbook (approved / process / rejected)`);
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
    const PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    assignments = await assignmentRepo.save(
      sessions.slice(0, Math.min(8, sessions.length)).map((session, i) =>
        assignmentRepo.create({
          title: `Tugas ${i + 1}: ${session.topic.replace(/^Sesi \d+: /, '')}`,
          file: PDF,
          session,
        }),
      ),
    );
    log(`membuat ${assignments.length} tugas`);
  } else {
    log(`tugas sudah ada (${assignments.length}), dilewati`);
  }

  const answerTaskCount = await answerTaskRepo.count({
    where: { user: { id: student.id } },
  });
  if (answerTaskCount === 0) {
    const PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const flow: ProcessStatus[] = ['approved', 'process', 'approved', 'rejected'];
    const submitted = assignments.slice(0, Math.max(1, assignments.length - 2));
    await answerTaskRepo.save(
      submitted.map((task, i) =>
        answerTaskRepo.create({
          file: PDF,
          process: flow[i % flow.length],
          user: student,
          task,
        }),
      ),
    );
    log(`membuat ${submitted.length} pengumpulan tugas, sisanya sengaja belum dikumpulkan`);
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
    const bank: Array<[string, string[], number]> = [
      ['Tag mana yang dipakai untuk judul terpenting sebuah halaman?', ['<h1>', '<head>', '<title>', '<header>'], 0],
      ['Properti CSS mana yang mengatur jarak DI DALAM sebuah elemen?', ['margin', 'padding', 'border', 'gap'], 1],
      ['Apa fungsi utama version control seperti Git?', ['Mempercepat website', 'Mengompres gambar', 'Melacak perubahan kode', 'Menyusun basis data'], 2],
      ['Manakah yang BUKAN metode HTTP?', ['GET', 'POST', 'SEND', 'DELETE'], 2],
      ['Apa keluaran dari typeof [] di JavaScript?', ['array', 'object', 'list', 'undefined'], 1],
      ['Status HTTP mana yang berarti "tidak ditemukan"?', ['200', '301', '404', '500'], 2],
    ];

    const created: Quiz[] = [];
    for (const [i, week] of weeks.entries()) {
      const q = await quizRepo.save(
        quizRepo.create({
          quizName: `Kuis minggu ${week.weekNumber}`,
          minScore: 70,
          duration: 15,
          weeks: week,
        }),
      );
      created.push(q);
      for (let n = 0; n < 3; n += 1) {
        const [questionText, options, correctIndex] = bank[(i * 3 + n) % bank.length];
        const question = await questionRepo.save(questionRepo.create({ questionText, quiz: q }));
        await answerRepo.save(
          options.map((answer, oi) =>
            answerRepo.create({ answer, isCorrect: oi === correctIndex, question }),
          ),
        );
      }
    }
    quiz = created[0];
    log(`membuat ${created.length} kuis, masing-masing 3 soal dan 4 pilihan`);
  } else {
    log('kuis sudah ada, dilewati');
  }

  const scoreCount = await scoreRepo.count({
    where: { user: { id: student.id }, quiz: { id: quiz.id } },
  });
  if (scoreCount === 0) {
    const quizzes = await quizRepo.find({ where: weeks.map((w) => ({ weeks: { id: w.id } })) });
    const marks = [80, 92, 68];
    const scored = quizzes.slice(0, Math.min(marks.length, quizzes.length));
    await scoreRepo.save(
      scored.map((q, i) => scoreRepo.create({ score: marks[i], user: student, quiz: q })),
    );
    log(`membuat ${scored.length} nilai kuis (${marks.slice(0, scored.length).join(', ')})`);
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
    const doneWeeks = Math.max(1, Math.ceil(weeks.length / 2));
    await weekProgressRepo.save(
      weeks.map((week, i) =>
        weekProgressRepo.create({
          user: student,
          week,
          quiz: i < doneWeeks,
          process: i < doneWeeks,
        }),
      ),
    );
    const past = sessions.filter((x) => new Date(x.date) < new Date());
    await sessionProgressRepo.save(
      past.map((session) =>
        sessionProgressRepo.create({ user: student, session, logbook: true, isAttended: true }),
      ),
    );
    const quizzes = await quizRepo.find({ where: weeks.map((w) => ({ weeks: { id: w.id } })) });
    await quizProgressRepo.save(
      quizzes.slice(0, doneWeeks).map((q) =>
        quizProgressRepo.create({ user: student, quiz: q, process: true }),
      ),
    );
    log(`membuat progres: ${doneWeeks} dari ${weeks.length} minggu selesai, ${past.length} sesi terhadiri`);
  } else {
    log(`progres sudah ada (${weekProgressCount}), dilewati`);
  }

  // --- Portfolio --------------------------------------------------------------
  const portfolioRepo = ds.getRepository(Portofolios);
  const portfolioCount = await portfolioRepo.count({
    where: { user: { id: student.id } },
  });
  if (portfolioCount === 0) {
    const items = [
      ['Halaman profil responsif', 'Halaman profil satu kolom, responsif sampai lebar ponsel.',
       'Dibuat dengan HTML semantik dan CSS flexbox, tanpa framework.'],
      ['Dasbor cuaca sederhana', 'Menampilkan prakiraan tujuh hari dari sebuah API publik.',
       'Konsumsi API dengan fetch, state ditangani tanpa pustaka tambahan.'],
      ['Aplikasi catatan offline', 'Catatan tersimpan di perangkat dan tetap terbaca tanpa internet.',
       'Menyimpan data di IndexedDB dan memakai service worker untuk mode luring.'],
    ];
    await portfolioRepo.save(
      items.map(([title, description, content]) =>
        portfolioRepo.create({
          title,
          description,
          content,
          contentHtml: `<p>${content}</p>`,
          image: ['/public/image/dashboard/login_bg.png'],
          link: 'https://example.com/portfolio',
          views: 0,
          likes: 0,
          user: student,
          course,
        }),
      ),
    );
    log(`membuat ${items.length} item portfolio`);
  } else {
    log(`portfolio sudah ada (${portfolioCount}), dilewati`);
  }

  // --- Pendaftaran dan pembayaran --------------------------------------------
  const registrationRepo = ds.getRepository(Registration);
  const paymentRepo = ds.getRepository(Payment);
  const installmentRepo = ds.getRepository(Installment);
  const invoiceRepo = ds.getRepository(Invoice);
  const courseRepo2 = ds.getRepository(Course);

  const PROOF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  const identity = {
    user_fullname: student.username,
    user_email: student.email,
    user_no: '+62 812 0000 0001',
    current_status: 'University Student' as const,
    attend_program: true,
  };

  const registrationCount = await registrationRepo.count({
    where: { user: { id: student.id } },
  });
  if (registrationCount === 0) {
    const flow: ProcessStatus[] = ['approved', 'process', 'rejected'];
    const sources = ['Instagram', 'TikTok', 'Friends'];
    await registrationRepo.save(
      flow.map((process, i) =>
        registrationRepo.create({
          ...identity,
          file: PROOF,
          process,
          referal_source: sources[i],
          user: student,
          course,
        }),
      ),
    );
    log(`membuat ${flow.length} pendaftaran (approved / process / rejected)`);
  } else {
    log(`pendaftaran sudah ada (${registrationCount}), dilewati`);
  }

  const paymentCount = await paymentRepo.count({
    where: { user: { id: student.id } },
  });
  if (paymentCount === 0) {
    // Course lain dipakai supaya filter "Program / Course" di tab Payment History
    // punya lebih dari satu pilihan dan benar-benar bisa diuji.
    const others = await courseRepo2.find({ take: 3, order: { name: 'ASC' } });
    const pool = [course, ...others.filter((c) => c.id !== course.id)];

    // Varian metode pembayaran mengikuti frame desain. Nilainya disimpan di
    // invoice.payment_method, sama seperti yang diisi webhook Xendit.
    const plan: Array<[ProcessStatus, string | null, number]> = [
      ['approved', 'Bank Transfer', 1_500_000],
      ['approved', 'Virtual Account', 2_000_000],
      ['process', 'Virtual Account', 1_250_000],
      ['approved', 'E-Wallet', 750_000],
      ['rejected', 'Bank Transfer', 1_500_000],
      ['approved', 'Credit Card', 3_000_000],
      ['process', 'E-Wallet', 900_000],
      ['approved', null, 1_100_000],
      ['approved', 'Bank Transfer', 2_400_000],
      ['rejected', 'Credit Card', 1_800_000],
      ['approved', 'Virtual Account', 1_650_000],
      ['process', 'Bank Transfer', 2_100_000],
    ].slice(0, PAYMENT_COUNT) as Array<[ProcessStatus, string | null, number]>;

    for (const [i, [process, method, amount]] of plan.entries()) {
      const payment = await paymentRepo.save(
        paymentRepo.create({
          ...identity,
          no: `INV-SEED-${Date.now()}-${i}`,
          file: i % 3 === 0 ? PROOF : (null as unknown as string),
          process,
          user: student,
          course: pool[i % pool.length],
        }),
      );

      // Invoice hanya dibuat bila metodenya diketahui; satu baris sengaja tanpa
      // invoice supaya tampilan "Full Payment" (nilai cadangan) ikut teruji.
      if (method) {
        await invoiceRepo.save(
          invoiceRepo.create({
            payment,
            subtotal: amount,
            discount_amount: 0,
            final_total: amount,
            payment_method: method,
            paid_at: process === 'approved' ? daysAgo(plan.length - i) : (null as unknown as Date),
          }),
        );
      }
    }
    // createdAt diisi otomatis oleh @CreateDateColumn, jadi semua baris akan
    // bertanggal hari ini dan filter rentang tanggal tidak bisa diuji. Tanggalnya
    // disebar mundur lewat UPDATE setelah insert; ini pembentukan data seed,
    // bukan perilaku aplikasi.
    const seeded = await paymentRepo.find({
      where: { user: { id: student.id } },
      order: { no: 'ASC' },
    });
    for (const [i, row] of seeded.entries()) {
      const when = daysAgo(14 * (seeded.length - i));
      await paymentRepo.query('UPDATE payments SET "createdAt" = $1 WHERE id = $2', [when, row.id]);
      await invoiceRepo.query(
        'UPDATE invoice SET paid_at = $1 WHERE "paymentId" = $2 AND paid_at IS NOT NULL',
        [when, row.id],
      );
    }

    log(`membuat ${plan.length} pembayaran lunas dengan metode, status, dan tanggal beragam`);

    // Satu rencana cicilan beserta pembayaran DP-nya.
    let installment = await installmentRepo.findOne({
      where: { course: { id: course.id } },
    });
    if (!installment) {
      installment = await installmentRepo.save(
        installmentRepo.create({
          downPayment: 500000,
          price: [1000000, 1000000, 1000000],
          month: 3,
          dueDates: [isoDate(daysAhead(7)), isoDate(daysAhead(37)), isoDate(daysAhead(67))],
          course,
        }),
      );
    }

    // Sebagian database hasil restore masih punya constraint UNIQUE pada
    // payments.installmentId, padahal entity memodelkannya many-to-one. Di sana
    // satu rencana hanya boleh dirujuk satu pembayaran, jadi jangan memaksa.
    const installmentTaken = await paymentRepo.count({
      where: { installment: { id: installment.id } },
    });
    if (installmentTaken === 0) {
      await paymentRepo.save(
        paymentRepo.create({
          ...identity,
          no: `INV-SEED-CICILAN-${Date.now()}`,
          file: PROOF,
          process: 'process',
          dpPaidAt: daysAgo(20),
          user: student,
          course,
          installment,
        }),
      );
      log('membuat 1 pembayaran cicilan + 1 rencana cicilan 3 termin');
    } else {
      log('rencana cicilan sudah dipakai pembayaran lain, baris cicilan dilewati');
    }
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
