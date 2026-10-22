import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPortfolioGuideToCourse1788800000000 implements MigrationInterface {
  name = 'AddPortfolioGuideToCourse1788800000000';

  public async up(q: QueryRunner): Promise<void> {
    const columns = (await q.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'course' AND column_name IN ('portfolioGuideTitle', 'portfolioGuideContent')`,
    )) as { column_name: string }[];
    const existing = new Set(columns.map((column) => column.column_name));
    if (!existing.has('portfolioGuideTitle')) {
      await q.query(
        `ALTER TABLE "course" ADD "portfolioGuideTitle" character varying`,
      );
    }
    if (!existing.has('portfolioGuideContent')) {
      await q.query(`ALTER TABLE "course" ADD "portfolioGuideContent" text`);
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "course" DROP COLUMN IF EXISTS "portfolioGuideContent"`,
    );
    await q.query(
      `ALTER TABLE "course" DROP COLUMN IF EXISTS "portfolioGuideTitle"`,
    );
  }
}
