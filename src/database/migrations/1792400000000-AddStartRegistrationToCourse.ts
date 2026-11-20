import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStartRegistrationToCourse1792400000000 implements MigrationInterface {
  name = 'AddStartRegistrationToCourse1792400000000';

  public async up(q: QueryRunner): Promise<void> {
    const columns = (await q.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'course' AND column_name = 'start_registration'`,
    )) as { column_name: string }[];
    if (columns.length === 0) {
      await q.query(
        `ALTER TABLE "course" ADD COLUMN "start_registration" timestamp`,
      );
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "course" DROP COLUMN IF EXISTS "start_registration"`,
    );
  }
}
