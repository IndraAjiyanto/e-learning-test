import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePortfolioGuideContentToJsonb1789100000000 implements MigrationInterface {
  name = 'ChangePortfolioGuideContentToJsonb1789100000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "portfolio_guides" ALTER COLUMN "content" DROP NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "portfolio_guides" ALTER COLUMN "content" TYPE jsonb USING to_jsonb("content")`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "portfolio_guides" ALTER COLUMN "content" TYPE text USING "content"::text`,
    );
    await q.query(
      `UPDATE "portfolio_guides" SET "content" = '' WHERE "content" IS NULL`,
    );
    await q.query(
      `ALTER TABLE "portfolio_guides" ALTER COLUMN "content" SET NOT NULL`,
    );
  }
}
