import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Membuat kolom `course.locationLink` dan `course.locations` benar-benar
 * nullable di database. Entity sudah memakai `nullable: true`, tetapi
 * environment memakai `SYNCHRONIZE=false` di produksi sehingga nullability
 * bergantung pada migration ini.
 *
 * Idempoten: setiap ALTER hanya dijalankan bila kolomnya ada dan saat ini
 * masih `NOT NULL`.
 */
export class MakeCourseLocationOptional1792000000000 implements MigrationInterface {
  name = 'MakeCourseLocationOptional1792000000000';

  private async isNotNull(q: QueryRunner, column: string): Promise<boolean> {
    const rows = (await q.query(
      `SELECT is_nullable FROM information_schema.columns
       WHERE table_name = 'course' AND column_name = $1`,
      [column],
    )) as { is_nullable: string }[];
    return rows.length > 0 && rows[0].is_nullable === 'NO';
  }

  public async up(q: QueryRunner): Promise<void> {
    if (await this.isNotNull(q, 'locationLink')) {
      await q.query(
        `ALTER TABLE "course" ALTER COLUMN "locationLink" DROP NOT NULL`,
      );
    }

    if (await this.isNotNull(q, 'locations')) {
      await q.query(
        `ALTER TABLE "course" ALTER COLUMN "locations" DROP NOT NULL`,
      );
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    if (!(await this.isNotNull(q, 'locationLink'))) {
      await q.query(
        `UPDATE "course" SET "locationLink" = '' WHERE "locationLink" IS NULL`,
      );
      await q.query(
        `ALTER TABLE "course" ALTER COLUMN "locationLink" SET NOT NULL`,
      );
    }

    if (!(await this.isNotNull(q, 'locations'))) {
      await q.query(
        `UPDATE "course" SET "locations" = '{"id":"","en":"","ja":""}'::jsonb WHERE "locations" IS NULL`,
      );
      await q.query(
        `ALTER TABLE "course" ALTER COLUMN "locations" SET NOT NULL`,
      );
    }
  }
}
