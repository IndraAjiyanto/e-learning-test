import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T0 dari docs/program-type-plan.md.
 *
 * Tiga perubahan pada tabel `course`:
 *
 * 1. `program_type` (enum, default 'bootcamp') - bentuk belajar program.
 *    Backfill terjadi sendiri lewat default: seluruh program yang ada memang
 *    bootcamp, karena itulah satu-satunya bentuk yang pernah diimplementasikan.
 *
 * 2. `logbook_enabled` (boolean, default true) - sakelar logbook per program.
 *
 * 3. FK `courseTypeId` diganti dari ON DELETE CASCADE menjadi ON DELETE SET
 *    NULL. Ini BUKAN kerapian: begitu CourseType resmi menjadi Tag yang bebas
 *    dibuat dan dihapus admin, aturan CASCADE berarti menghapus satu tag ikut
 *    menghapus setiap program yang memakainya. Diperiksa langsung ke basis
 *    data sebelum diubah: confdeltype pada FK_b80ca1ff2ccdcc60c0a7662941c
 *    bernilai 'c' (CASCADE).
 *
 * Semua langkah idempoten supaya aman dijalankan berkali-kali dan di
 * environment yang kolomnya terlanjur ada dari synchronize di masa lalu.
 */
export class AddProgramTypeAndLogbookFlag1788600000000
  implements MigrationInterface
{
  name = 'AddProgramTypeAndLogbookFlag1788600000000';

  public async up(q: QueryRunner): Promise<void> {
    const [table] = await q.query(
      `SELECT to_regclass('public.course') IS NOT NULL AS has_table`,
    );
    if (!table?.has_table) return;

    const [enumType] = await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'course_program_type_enum'`,
    );
    if (!enumType) {
      await q.query(
        `CREATE TYPE "course_program_type_enum" AS ENUM('bootcamp', 'non_bootcamp', 'lpk')`,
      );
    }

    const [programType] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'course' AND column_name = 'program_type'`,
    );
    if (!programType) {
      await q.query(
        `ALTER TABLE "course" ADD "program_type" "course_program_type_enum" NOT NULL DEFAULT 'bootcamp'`,
      );
    }

    const [logbookEnabled] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'course' AND column_name = 'logbook_enabled'`,
    );
    if (!logbookEnabled) {
      await q.query(
        `ALTER TABLE "course" ADD "logbook_enabled" boolean NOT NULL DEFAULT true`,
      );
    }

    // FK tag: cari berdasarkan kolomnya, bukan namanya - nama constraint
    // dihasilkan TypeORM dan bisa berbeda antar environment.
    const rows = await q.query(
      `SELECT con.conname, con.confdeltype
         FROM pg_constraint con
         JOIN pg_class cl ON cl.oid = con.conrelid
         JOIN unnest(con.conkey) k(attnum) ON true
         JOIN pg_attribute a ON a.attrelid = cl.oid AND a.attnum = k.attnum
        WHERE cl.relname = 'course'
          AND con.contype = 'f'
          AND a.attname = 'courseTypeId'`,
    );
    for (const row of rows) {
      if (row.confdeltype === 'n') continue; // sudah SET NULL
      await q.query(`ALTER TABLE "course" DROP CONSTRAINT "${row.conname}"`);
      await q.query(
        `ALTER TABLE "course" ADD CONSTRAINT "${row.conname}"
           FOREIGN KEY ("courseTypeId") REFERENCES "course_type"("id")
           ON DELETE SET NULL ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    const [table] = await q.query(
      `SELECT to_regclass('public.course') IS NOT NULL AS has_table`,
    );
    if (!table?.has_table) return;

    const rows = await q.query(
      `SELECT con.conname, con.confdeltype
         FROM pg_constraint con
         JOIN pg_class cl ON cl.oid = con.conrelid
         JOIN unnest(con.conkey) k(attnum) ON true
         JOIN pg_attribute a ON a.attrelid = cl.oid AND a.attnum = k.attnum
        WHERE cl.relname = 'course'
          AND con.contype = 'f'
          AND a.attname = 'courseTypeId'`,
    );
    for (const row of rows) {
      if (row.confdeltype === 'c') continue;
      await q.query(`ALTER TABLE "course" DROP CONSTRAINT "${row.conname}"`);
      await q.query(
        `ALTER TABLE "course" ADD CONSTRAINT "${row.conname}"
           FOREIGN KEY ("courseTypeId") REFERENCES "course_type"("id")
           ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }

    const [logbookEnabled] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'course' AND column_name = 'logbook_enabled'`,
    );
    if (logbookEnabled) {
      await q.query(`ALTER TABLE "course" DROP COLUMN "logbook_enabled"`);
    }

    const [programType] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'course' AND column_name = 'program_type'`,
    );
    if (programType) {
      await q.query(`ALTER TABLE "course" DROP COLUMN "program_type"`);
    }

    const [enumType] = await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'course_program_type_enum'`,
    );
    if (enumType) {
      await q.query(`DROP TYPE "course_program_type_enum"`);
    }
  }
}
