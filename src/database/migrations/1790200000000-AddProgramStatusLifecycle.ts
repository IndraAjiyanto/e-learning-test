import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProgramStatusLifecycle1790200000000 implements MigrationInterface {
  name = 'AddProgramStatusLifecycle1790200000000';

  public async up(q: QueryRunner): Promise<void> {
    const [table] = (await q.query(
      `SELECT to_regclass(table) IS NOT NULL AS has_table`,
    )) as { has_table: boolean }[];
    if (!table?.has_table) return;

    const [enumType] = (await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'course_status_enum'`,
    )) as unknown[];
    if (!enumType) {
      await q.query(
        `CREATE TYPE "course_status_enum" AS ENUM('unlaunch', 'launch', 'learning', 'done')`,
      );
    }

    const [statusCol] = (await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'course' AND column_name = 'status'`,
    )) as unknown[];
    if (!statusCol) {
      await q.query(
        `ALTER TABLE "course" ADD "status" "course_status_enum" NOT NULL DEFAULT 'unlaunch'`,
      );

      // Backfill data awal dari nilai launch yang sudah ada
      await q.query(
        `UPDATE "course" SET "status" = 'launch' WHERE "launch" = true`,
      );
      await q.query(
        `UPDATE "course" SET "status" = 'unlaunch' WHERE "launch" = false`,
      );
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    const [table] = (await q.query(
      `SELECT to_regclass(table) IS NOT NULL AS has_table`,
    )) as { has_table: boolean }[];
    if (!table?.has_table) return;

    const [statusCol] = (await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'course' AND column_name = 'status'`,
    )) as unknown[];
    if (statusCol) {
      await q.query(`ALTER TABLE "course" DROP COLUMN "status"`);
    }

    const [enumType] = (await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'course_status_enum'`,
    )) as unknown[];
    if (enumType) {
      await q.query(`DROP TYPE "course_status_enum"`);
    }
  }
}
