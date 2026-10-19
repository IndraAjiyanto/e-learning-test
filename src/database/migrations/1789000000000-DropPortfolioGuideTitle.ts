import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPortfolioGuideTitle1789000000000 implements MigrationInterface {
  name = 'DropPortfolioGuideTitle1789000000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "portfolio_guides" DROP COLUMN IF EXISTS "title"`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "portfolio_guides" ADD COLUMN IF NOT EXISTS "title" character varying(120) NOT NULL DEFAULT 'Portfolio Guide'`,
    );
  }
}
