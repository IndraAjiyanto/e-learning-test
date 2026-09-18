import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Kuis non-bootcamp menempel pada SILABUS, bukan pada program.
 *
 * Migrasi 1788700000000 (S0) menambahkan `quiz.courseId` dengan asumsi satu
 * kuis per program - asumsi yang saya pasang sendiri karena pertanyaannya
 * belum terjawab. Pemilik menjawab 2026-09-18: **satu kuis per silabus**.
 * Migrasi ini mengoreksinya.
 *
 * Diperiksa lebih dulu sebelum ditulis: pada basis data lokal TIDAK ADA satu
 * pun kuis non-bootcamp (`quiz.courseId` terisi = 0 baris), jadi ini murni
 * perubahan skema tanpa perpindahan data.
 *
 * `quiz.courseId` DIBUANG, bukan dibiarkan menganggur. Kolom mati yang tidak
 * pernah dipakai adalah jebakan untuk orang berikutnya - ia akan menduga kuis
 * bisa menempel di program, lalu menulis kode yang mengisinya.
 *
 * PENJAGA: kalau ternyata ada kuis yang sudah terlanjur menempel ke program,
 * migrasi ini BERHENTI, bukan menebak silabus mana yang seharusnya. Memindah
 * kuis-program menjadi kuis-silabus butuh keputusan manusia.
 *
 * Kuis bootcamp (`quiz.weeksId`) tidak disentuh sama sekali.
 *
 * Nama constraint FK memakai nama turunan TypeORM, bukan nama karangan -
 * alasannya sama dengan migrasi 1788700000000: dekorator relasi tidak bisa
 * menamai FK, jadi kalau migrasinya memakai nama sendiri, entity dan basis
 * data tidak pernah dianggap sepakat dan `schema:log` berisik selamanya.
 */
export class QuizPerSyllabus1788900000000 implements MigrationInterface {
  name = 'QuizPerSyllabus1788900000000';

  private async hasColumn(q: QueryRunner, column: string): Promise<boolean> {
    const rows = await q.query(
      `SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quiz' AND column_name = $1`,
      [column],
    );
    return rows.length > 0;
  }

  public async up(q: QueryRunner): Promise<void> {
    const [ready] = await q.query(
      `SELECT to_regclass('public.quiz') IS NOT NULL
          AND to_regclass('public.syllabus') IS NOT NULL AS ok`,
    );
    if (!ready?.ok) return;

    if (!(await this.hasColumn(q, 'syllabusId'))) {
      await q.query(`ALTER TABLE "quiz" ADD "syllabusId" uuid`);
      await q.query(
        `ALTER TABLE "quiz" ADD CONSTRAINT "FK_f017d4f2fc1a89238267b27e701"
           FOREIGN KEY ("syllabusId") REFERENCES "syllabus"("id")
           ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
      await q.query(
        `CREATE INDEX "IDX_quiz_syllabus" ON "quiz" ("syllabusId")`,
      );
    }

    if (await this.hasColumn(q, 'courseId')) {
      const [stuck] = await q.query(
        `SELECT count(*)::int AS n FROM "quiz" WHERE "courseId" IS NOT NULL`,
      );
      if (stuck.n > 0) {
        throw new Error(
          `QuizPerSyllabus: ada ${stuck.n} kuis yang menempel ke program ` +
            '(`quiz.courseId` terisi). Kuis sekarang menempel ke silabus, dan ' +
            'memilih silabus mana bukan keputusan yang boleh ditebak migrasi. ' +
            'Pindahkan dulu secara manual ke `quiz.syllabusId`, lalu jalankan ' +
            'kembali.',
        );
      }
      await q.query(`DROP INDEX IF EXISTS "IDX_quiz_course"`);
      await q.query(
        `ALTER TABLE "quiz" DROP CONSTRAINT IF EXISTS "FK_f74ae73a766eea8e0dfb09816ba"`,
      );
      await q.query(`ALTER TABLE "quiz" DROP COLUMN "courseId"`);
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    const [ready] = await q.query(
      `SELECT to_regclass('public.quiz') IS NOT NULL AS ok`,
    );
    if (!ready?.ok) return;

    if (!(await this.hasColumn(q, 'courseId'))) {
      await q.query(`ALTER TABLE "quiz" ADD "courseId" uuid`);
      await q.query(
        `ALTER TABLE "quiz" ADD CONSTRAINT "FK_f74ae73a766eea8e0dfb09816ba"
           FOREIGN KEY ("courseId") REFERENCES "course"("id")
           ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
      await q.query(`CREATE INDEX "IDX_quiz_course" ON "quiz" ("courseId")`);
    }

    if (await this.hasColumn(q, 'syllabusId')) {
      // Kuis silabus dikembalikan menjadi kuis program lewat induknya. Ini
      // KEHILANGAN keterangan silabus mana - dua kuis dari dua silabus pada
      // program yang sama akan tampak sebagai dua kuis program.
      await q.query(`
        UPDATE "quiz" q
           SET "courseId" = y."courseId"
          FROM "syllabus" y
         WHERE q."syllabusId" = y.id`);
      await q.query(`DROP INDEX IF EXISTS "IDX_quiz_syllabus"`);
      await q.query(
        `ALTER TABLE "quiz" DROP CONSTRAINT IF EXISTS "FK_f017d4f2fc1a89238267b27e701"`,
      );
      await q.query(`ALTER TABLE "quiz" DROP COLUMN "syllabusId"`);
    }
  }
}
