import { MigrationInterface, QueryRunner } from 'typeorm';

export class MovePortfolioGuideToTable1788900000000 implements MigrationInterface {
  name = 'MovePortfolioGuideToTable1788900000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS "portfolio_guides" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "courseId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_portfolio_guides" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_portfolio_guides_course" UNIQUE ("courseId"),
        CONSTRAINT "FK_portfolio_guides_course"
          FOREIGN KEY ("courseId") REFERENCES "course"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await q.query(`
      INSERT INTO "portfolio_guides" ("content", "courseId")
      SELECT "portfolioGuideContent",
             "id"
      FROM "course"
      WHERE "portfolioGuideContent" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "portfolio_guides" guide
          WHERE guide."courseId" = "course"."id"
        )
    `);

    await q.query(
      `ALTER TABLE "course" DROP COLUMN IF EXISTS "portfolioGuideContent"`,
    );
    await q.query(
      `ALTER TABLE "course" DROP COLUMN IF EXISTS "portfolioGuideTitle"`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "course" ADD COLUMN IF NOT EXISTS "portfolioGuideContent" text`,
    );
    await q.query(`
      UPDATE "course" course
        SET "portfolioGuideContent" = guide."content"
      FROM "portfolio_guides" guide
      WHERE guide."courseId" = course."id"
    `);
    await q.query(`DROP TABLE IF EXISTS "portfolio_guides"`);
  }
}
