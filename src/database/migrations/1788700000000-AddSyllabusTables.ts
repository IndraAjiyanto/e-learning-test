import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * S0 dari docs/syllabus-table-plan.md.
 *
 * Program non-bootcamp (SPL) memakai silabus, bukan sesi. Sampai sekarang
 * silabus menumpang `session` di dalam satu baris `weeks` tersirat - ikut
 * membawa kolom yang tidak berarti untuk belajar mandiri (`date`, `location`,
 * `start_time`, `end_time`) dan memakai `attendance` untuk sesuatu yang bukan
 * kehadiran. Pemilik memutuskan memisahkannya penuh.
 *
 * Migrasi ini MURNI MENAMBAH:
 *   - tujuh tabel baru, belum dibaca kode mana pun
 *   - satu kolom nullable pada `quiz` (rumah baru untuk kuis tingkat program)
 *
 * Tidak ada tabel lama yang diubah bentuknya, tidak ada data yang dipindah -
 * perpindahan data adalah S2. Artinya migrasi ini aman dijalankan kapan saja,
 * dan memangkas pohon tabelnya nanti cukup satu migrasi lagi.
 *
 * Enum sengaja DIPAKAI ULANG, bukan diduplikasi: `material_filetype_enum`,
 * `answer_task_process_enum`, `logbook_process_enum`. Itu kosakata bersama,
 * bukan tabel bersama - dua salinan enum berarti dua tempat yang harus diubah
 * setiap kali ada nilai baru.
 *
 * Dua penjagaan yang sengaja ada di sini dan TIDAK ada di padanan lamanya:
 *   - UNIQUE (courseId, "order") pada syllabus. Urutan menentukan buka-kunci;
 *     urutan ganda membuat "silabus sebelumnya" tidak terdefinisi. `session`
 *     tidak punya ini dan `previousSession` menambalnya dengan mencari nilai
 *     terbesar yang lebih kecil.
 *   - UNIQUE (syllabusId, userId) pada syllabus_progress. `session_progresses`
 *     tidak punya ini, dan kodenya menambal dengan pola upsert manual di lima
 *     tempat berbeda.
 *
 * Nama constraint FK sengaja memakai nama hasil turunan TypeORM (hash), bukan
 * nama yang enak dibaca. Alasannya: dekorator relasi tidak bisa menamai FK,
 * jadi kalau migrasinya memakai nama sendiri, entity dan basis data tidak
 * pernah dianggap sepakat - `schema:log` berisik selamanya dan
 * `migration:generate` berikutnya menghasilkan migrasi sampah yang mencoba
 * membuat ulang semua FK. Diverifikasi dengan `schema:log` bersih.
 *
 * Semua langkah idempoten.
 */
export class AddSyllabusTables1788700000000 implements MigrationInterface {
  name = 'AddSyllabusTables1788700000000';

  private async hasTable(q: QueryRunner, name: string): Promise<boolean> {
    const [row] = await q.query(
      `SELECT to_regclass('public.${name}') IS NOT NULL AS ok`,
    );
    return !!row?.ok;
  }

  private async hasColumn(
    q: QueryRunner,
    table: string,
    column: string,
  ): Promise<boolean> {
    const rows = await q.query(
      `SELECT 1 FROM information_schema.columns
        WHERE table_name = $1 AND column_name = $2`,
      [table, column],
    );
    return rows.length > 0;
  }

  public async up(q: QueryRunner): Promise<void> {
    if (!(await this.hasTable(q, 'course'))) return;

    // --- induk: menempel LANGSUNG ke course, tanpa lapisan weeks -----------
    if (!(await this.hasTable(q, 'syllabus'))) {
      await q.query(`
        CREATE TABLE "syllabus" (
          "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
          "courseId"    uuid NOT NULL,
          "order"       integer NOT NULL,
          "title"       character varying NOT NULL,
          "description" text,
          "is_final"    boolean NOT NULL DEFAULT false,
          "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_syllabus" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_syllabus_course_order" UNIQUE ("courseId", "order"),
          CONSTRAINT "FK_7e3341205b518cbd98380b20b16" FOREIGN KEY ("courseId")
            REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )`);
      await q.query(
        `CREATE INDEX "IDX_syllabus_course" ON "syllabus" ("courseId", "order")`,
      );
    }

    // --- materi ------------------------------------------------------------
    if (!(await this.hasTable(q, 'syllabus_material'))) {
      await q.query(`
        CREATE TABLE "syllabus_material" (
          "id"         uuid NOT NULL DEFAULT uuid_generate_v4(),
          "syllabusId" uuid NOT NULL,
          "title"      character varying NOT NULL,
          "file"       character varying NOT NULL,
          "fileType"   "material_filetype_enum" NOT NULL,
          "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_syllabus_material" PRIMARY KEY ("id"),
          CONSTRAINT "FK_ba6bac3a5bd4aa1ae63c4d19109" FOREIGN KEY ("syllabusId")
            REFERENCES "syllabus"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )`);
      await q.query(
        `CREATE INDEX "IDX_syllabus_material_syllabus" ON "syllabus_material" ("syllabusId")`,
      );
    }

    // --- tugas -------------------------------------------------------------
    if (!(await this.hasTable(q, 'syllabus_assignment'))) {
      await q.query(`
        CREATE TABLE "syllabus_assignment" (
          "id"         uuid NOT NULL DEFAULT uuid_generate_v4(),
          "syllabusId" uuid NOT NULL,
          "title"      character varying NOT NULL,
          "file"       character varying NOT NULL,
          "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_syllabus_assignment" PRIMARY KEY ("id"),
          CONSTRAINT "FK_0d1b23153a81d54aab77c093941" FOREIGN KEY ("syllabusId")
            REFERENCES "syllabus"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )`);
      await q.query(
        `CREATE INDEX "IDX_syllabus_assignment_syllabus" ON "syllabus_assignment" ("syllabusId")`,
      );
    }

    // --- jawaban tugas -----------------------------------------------------
    // UNIQUE (taskId, userId): satu student satu jawaban per tugas. Padanan
    // lamanya tidak punya ini, dan alur "Edit Submission" mengandalkan jawaban
    // pertama yang ditemukan.
    if (!(await this.hasTable(q, 'syllabus_answer_task'))) {
      await q.query(`
        CREATE TABLE "syllabus_answer_task" (
          "id"        uuid NOT NULL DEFAULT uuid_generate_v4(),
          "taskId"    uuid NOT NULL,
          "userId"    uuid NOT NULL,
          "file"      character varying NOT NULL,
          "process"   "answer_task_process_enum" NOT NULL DEFAULT 'rejected',
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_syllabus_answer_task" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_syllabus_answer_task_task_user" UNIQUE ("taskId", "userId"),
          CONSTRAINT "FK_65783e2d1f137231808b2e896d0" FOREIGN KEY ("taskId")
            REFERENCES "syllabus_assignment"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "FK_1705b1952e2df3975a695479c0b" FOREIGN KEY ("userId")
            REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )`);
      await q.query(
        `CREATE INDEX "IDX_syllabus_answer_task_user" ON "syllabus_answer_task" ("userId")`,
      );
    }

    // --- komentar atas jawaban ---------------------------------------------
    if (!(await this.hasTable(q, 'syllabus_comment'))) {
      await q.query(`
        CREATE TABLE "syllabus_comment" (
          "id"        uuid NOT NULL DEFAULT uuid_generate_v4(),
          "answerId"  uuid NOT NULL,
          "comment"   character varying NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_syllabus_comment" PRIMARY KEY ("id"),
          CONSTRAINT "FK_44efd0cdf2c5324c55ea9a1b843" FOREIGN KEY ("answerId")
            REFERENCES "syllabus_answer_task"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )`);
      await q.query(
        `CREATE INDEX "IDX_syllabus_comment_answer" ON "syllabus_comment" ("answerId")`,
      );
    }

    // --- logbook -----------------------------------------------------------
    if (!(await this.hasTable(q, 'syllabus_logbook'))) {
      await q.query(`
        CREATE TABLE "syllabus_logbook" (
          "id"                  uuid NOT NULL DEFAULT uuid_generate_v4(),
          "syllabusId"          uuid NOT NULL,
          "userId"              uuid NOT NULL,
          "activity"            character varying,
          "activity_details"    character varying,
          "documentation"       character varying,
          "obstacles"           character varying,
          "other_documentation" character varying,
          "process"             "logbook_process_enum" NOT NULL DEFAULT 'rejected',
          "createdAt"           TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt"           TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_syllabus_logbook" PRIMARY KEY ("id"),
          CONSTRAINT "FK_c05c16d2718c1f64313096a0b78" FOREIGN KEY ("syllabusId")
            REFERENCES "syllabus"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "FK_ca7a58fcbe310bf69d5b19c4e3b" FOREIGN KEY ("userId")
            REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )`);
      await q.query(
        `CREATE INDEX "IDX_syllabus_logbook_user" ON "syllabus_logbook" ("userId", "syllabusId")`,
      );
    }

    // --- progres: MENGGANTIKAN absensi, bukan menirunya ---------------------
    // `completedAt` menyebut keadaannya apa adanya - student belajar mandiri
    // tidak "hadir", ia menyelesaikan. Ini juga yang membuat tambalan
    // AttendanceService.openNextSessionWhenLogbookIsOff tidak lagi diperlukan
    // di jalur silabus.
    if (!(await this.hasTable(q, 'syllabus_progress'))) {
      await q.query(`
        CREATE TABLE "syllabus_progress" (
          "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
          "syllabusId"  uuid NOT NULL,
          "userId"      uuid NOT NULL,
          "completedAt" TIMESTAMP,
          "logbookOk"   boolean NOT NULL DEFAULT false,
          "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_syllabus_progress" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_syllabus_progress_syllabus_user" UNIQUE ("syllabusId", "userId"),
          CONSTRAINT "FK_e486ec5c9425f8fad0473d5e748" FOREIGN KEY ("syllabusId")
            REFERENCES "syllabus"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "FK_a2ed86a25c3755309cca1527171" FOREIGN KEY ("userId")
            REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )`);
      await q.query(
        `CREATE INDEX "IDX_syllabus_progress_user" ON "syllabus_progress" ("userId")`,
      );
    }

    // --- kuis tingkat program ----------------------------------------------
    // Tanpa lapisan `weeks`, kuis non-bootcamp kehilangan rumahnya
    // (quiz.weeksId). Kolom ini rumah barunya. Nullable: kuis bootcamp tetap
    // menempel di minggu dan tidak disentuh sama sekali.
    if (
      (await this.hasTable(q, 'quiz')) &&
      !(await this.hasColumn(q, 'quiz', 'courseId'))
    ) {
      await q.query(`ALTER TABLE "quiz" ADD "courseId" uuid`);
      await q.query(
        `ALTER TABLE "quiz" ADD CONSTRAINT "FK_f74ae73a766eea8e0dfb09816ba"
           FOREIGN KEY ("courseId") REFERENCES "course"("id")
           ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
      await q.query(
        `CREATE INDEX "IDX_quiz_course" ON "quiz" ("courseId")`,
      );
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    if (
      (await this.hasTable(q, 'quiz')) &&
      (await this.hasColumn(q, 'quiz', 'courseId'))
    ) {
      await q.query(`DROP INDEX IF EXISTS "IDX_quiz_course"`);
      await q.query(
        `ALTER TABLE "quiz" DROP CONSTRAINT IF EXISTS "FK_f74ae73a766eea8e0dfb09816ba"`,
      );
      await q.query(`ALTER TABLE "quiz" DROP COLUMN "courseId"`);
    }

    // Urutan terbalik dari up(): anak dulu, induk belakangan.
    for (const t of [
      'syllabus_comment',
      'syllabus_answer_task',
      'syllabus_progress',
      'syllabus_logbook',
      'syllabus_assignment',
      'syllabus_material',
      'syllabus',
    ]) {
      await q.query(`DROP TABLE IF EXISTS "${t}"`);
    }
  }
}
