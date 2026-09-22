import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserActivityTable1790000000000 implements MigrationInterface {
  name = 'CreateUserActivityTable1790000000000';

  public async up(q: QueryRunner): Promise<void> {
    // Idempoten: skip jika tabel sudah ada
    const [probe] = await q.query(
      `SELECT to_regclass('public.user_activity') IS NOT NULL AS exists`,
    );
    if (probe.exists) return;

    await q.query(`
      CREATE TABLE "user_activity" (
        "id"              uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "userId"          uuid              NOT NULL,
        "sessionId"       character varying,
        "loginAt"         TIMESTAMP         NOT NULL,
        "lastSeenAt"      TIMESTAMP         NOT NULL,
        "currentCourseId" uuid,
        "activityLabel"   character varying,
        "createdAt"       TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"       TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_activity_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_user_activity" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_activity_user"
          FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "user_activity"`);
  }
}
