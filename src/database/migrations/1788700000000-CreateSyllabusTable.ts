import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Membuat tabel `syllabus` dan `syllabus_progresses` untuk fitur silabus
 * program non-bootcamp.
 *
 * - `syllabus`: judul, deskripsi, konten JSONB (rich content blocks), FK ke course.
 * - `syllabus_progresses`: tracking progress user per syllabus (pola week_progresses).
 * - Menambahkan kolom nullable `syllabusId` di tabel `quiz` agar quiz bisa
 *   dihubungkan ke syllabus.
 *
 * Semua langkah idempoten supaya aman dijalankan berkali-kali.
 */
export class CreateSyllabusTable1788700000000 implements MigrationInterface {
  name = 'CreateSyllabusTable1788700000000';

  public async up(q: QueryRunner): Promise<void> {
    // ── 1. Tabel syllabus ──────────────────────────────────────────────
    const [syllabusTable] = await q.query(
      `SELECT to_regclass('public.syllabus') IS NOT NULL AS has_table`,
    );
    if (!syllabusTable?.has_table) {
      await q.query(`
        CREATE TABLE "syllabus" (
          "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
          "title"       character varying NOT NULL,
          "syllabusNumber" integer NOT NULL,
          "description" character varying NOT NULL,
          "content"     jsonb,
          "isFinal"     boolean NOT NULL DEFAULT false,
          "courseId"     uuid,
          "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_syllabus" PRIMARY KEY ("id")
        )
      `);

      // FK: syllabus → course
      await q.query(`
        ALTER TABLE "syllabus"
          ADD CONSTRAINT "FK_syllabus_course"
          FOREIGN KEY ("courseId") REFERENCES "course"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    // ── 2. Tabel syllabus_progresses ───────────────────────────────────
    const [progressTable] = await q.query(
      `SELECT to_regclass('public.syllabus_progresses') IS NOT NULL AS has_table`,
    );
    if (!progressTable?.has_table) {
      await q.query(`
        CREATE TABLE "syllabus_progresses" (
          "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
          "quiz"        boolean NOT NULL DEFAULT false,
          "process"     boolean NOT NULL DEFAULT false,
          "userId"      uuid,
          "syllabusId"  uuid,
          "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_syllabus_progresses" PRIMARY KEY ("id")
        )
      `);

      // FK: syllabus_progresses → user
      await q.query(`
        ALTER TABLE "syllabus_progresses"
          ADD CONSTRAINT "FK_syllabus_progresses_user"
          FOREIGN KEY ("userId") REFERENCES "user"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      `);

      // FK: syllabus_progresses → syllabus
      await q.query(`
        ALTER TABLE "syllabus_progresses"
          ADD CONSTRAINT "FK_syllabus_progresses_syllabus"
          FOREIGN KEY ("syllabusId") REFERENCES "syllabus"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    // ── 3. Kolom syllabusId di quiz ────────────────────────────────────
    const [quizTable] = await q.query(
      `SELECT to_regclass('public.quiz') IS NOT NULL AS has_table`,
    );
    if (quizTable?.has_table) {
      const [syllabusCol] = await q.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = 'quiz' AND column_name = 'syllabusId'`,
      );
      if (!syllabusCol) {
        await q.query(
          `ALTER TABLE "quiz" ADD "syllabusId" uuid`,
        );
        await q.query(`
          ALTER TABLE "quiz"
            ADD CONSTRAINT "FK_quiz_syllabus"
            FOREIGN KEY ("syllabusId") REFERENCES "syllabus"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
      }
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    // ── 3. Hapus kolom syllabusId dari quiz ─────────────────────────────
    const [quizTable] = await q.query(
      `SELECT to_regclass('public.quiz') IS NOT NULL AS has_table`,
    );
    if (quizTable?.has_table) {
      const [syllabusCol] = await q.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = 'quiz' AND column_name = 'syllabusId'`,
      );
      if (syllabusCol) {
        // Cari FK berdasarkan kolom, bukan nama constraint
        const rows = await q.query(
          `SELECT con.conname
             FROM pg_constraint con
             JOIN pg_class cl ON cl.oid = con.conrelid
             JOIN unnest(con.conkey) k(attnum) ON true
             JOIN pg_attribute a ON a.attrelid = cl.oid AND a.attnum = k.attnum
            WHERE cl.relname = 'quiz'
              AND con.contype = 'f'
              AND a.attname = 'syllabusId'`,
        );
        for (const row of rows) {
          await q.query(`ALTER TABLE "quiz" DROP CONSTRAINT "${row.conname}"`);
        }
        await q.query(`ALTER TABLE "quiz" DROP COLUMN "syllabusId"`);
      }
    }

    // ── 2. Drop syllabus_progresses ─────────────────────────────────────
    const [progressTable] = await q.query(
      `SELECT to_regclass('public.syllabus_progresses') IS NOT NULL AS has_table`,
    );
    if (progressTable?.has_table) {
      await q.query(`DROP TABLE "syllabus_progresses"`);
    }

    // ── 1. Drop syllabus ────────────────────────────────────────────────
    const [syllabusTable] = await q.query(
      `SELECT to_regclass('public.syllabus') IS NOT NULL AS has_table`,
    );
    if (syllabusTable?.has_table) {
      await q.query(`DROP TABLE "syllabus"`);
    }
  }
}

