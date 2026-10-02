import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAlumniRating1790400000000 implements MigrationInterface {
  name = 'AddAlumniRating1790400000000';

  public async up(q: QueryRunner): Promise<void> {
    const [table] = await q.query(
      `SELECT to_regclass('public.alumni') IS NOT NULL AS has_table`,
    );
    if (!table?.has_table) return;

    const [enumType] = await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'alumni_rating_enum'`,
    );
    if (!enumType) {
      await q.query(
        `CREATE TYPE "alumni_rating_enum" AS ENUM('1','2','3','4','5')`,
      );
    }

    const [ratingCol] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'alumni' AND column_name = 'rating'`,
    );
    if (!ratingCol) {
      // DEFAULT '5' sekaligus menjadi backfill untuk alumni yang sudah ada,
      // sehingga tidak ada baris lama yang tampil tanpa bintang.
      await q.query(
        `ALTER TABLE "alumni" ADD "rating" "alumni_rating_enum" NOT NULL DEFAULT '5'`,
      );
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    const [table] = await q.query(
      `SELECT to_regclass('public.alumni') IS NOT NULL AS has_table`,
    );
    if (!table?.has_table) return;

    const [ratingCol] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'alumni' AND column_name = 'rating'`,
    );
    if (ratingCol) {
      await q.query(`ALTER TABLE "alumni" DROP COLUMN "rating"`);
    }

    const [enumType] = await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'alumni_rating_enum'`,
    );
    if (enumType) {
      await q.query(`DROP TYPE "alumni_rating_enum"`);
    }
  }
}
