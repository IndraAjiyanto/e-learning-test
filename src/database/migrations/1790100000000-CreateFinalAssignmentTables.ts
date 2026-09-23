import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Membuat tabel `final_assignment` dan `user_assignment` untuk fitur Final Assignment.
 *
 * - `final_assignment`: berelasi 1:1 dengan course (courseId unik).
 * - `user_assignment`: berelasi 1:N dengan final_assignment dan N:1 dengan user.
 * - Kolom updatedAt dan createdAt disertakan di kedua tabel.
 */
export class CreateFinalAssignmentTables1790100000000
  implements MigrationInterface
{
  name = 'CreateFinalAssignmentTables1790100000000';

  public async up(q: QueryRunner): Promise<void> {
    // ── 1. Enum user_assignment_status_enum ─────────────────────────────
    const [statusType] = await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'user_assignment_status_enum'`,
    );
    if (!statusType) {
      await q.query(`
        CREATE TYPE "user_assignment_status_enum" AS ENUM ('approved', 'process', 'rejected')
      `);
    }

    // ── 2. Tabel final_assignment ───────────────────────────────────────
    const [finalAssignmentTable] = await q.query(
      `SELECT to_regclass('public.final_assignment') IS NOT NULL AS has_table`,
    );
    if (!finalAssignmentTable?.has_table) {
      await q.query(`
        CREATE TABLE "final_assignment" (
          "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
          "courseId"    uuid NOT NULL,
          "title"       character varying NOT NULL,
          "description" text NOT NULL,
          "content"     jsonb,
          "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_final_assignment_courseId" UNIQUE ("courseId"),
          CONSTRAINT "PK_final_assignment" PRIMARY KEY ("id")
        )
      `);

      await q.query(`
        ALTER TABLE "final_assignment"
          ADD CONSTRAINT "FK_final_assignment_course"
          FOREIGN KEY ("courseId") REFERENCES "course"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    // ── 3. Tabel user_assignment ────────────────────────────────────────
    const [userAssignmentTable] = await q.query(
      `SELECT to_regclass('public.user_assignment') IS NOT NULL AS has_table`,
    );
    if (!userAssignmentTable?.has_table) {
      await q.query(`
        CREATE TABLE "user_assignment" (
          "id"                  uuid NOT NULL DEFAULT uuid_generate_v4(),
          "finalAssignmentId"   uuid NOT NULL,
          "userId"              uuid NOT NULL,
          "status"              "user_assignment_status_enum" NOT NULL DEFAULT 'process',
          "filePath"            character varying NOT NULL,
          "comment"             text,
          "commentHistory"      jsonb DEFAULT '[]'::jsonb,
          "createdAt"           TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt"           TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_user_assignment" PRIMARY KEY ("id")
        )
      `);

      await q.query(`
        ALTER TABLE "user_assignment"
          ADD CONSTRAINT "FK_user_assignment_final_assignment"
          FOREIGN KEY ("finalAssignmentId") REFERENCES "final_assignment"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      `);

      await q.query(`
        ALTER TABLE "user_assignment"
          ADD CONSTRAINT "FK_user_assignment_user"
          FOREIGN KEY ("userId") REFERENCES "user"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    const [userAssignmentTable] = await q.query(
      `SELECT to_regclass('public.user_assignment') IS NOT NULL AS has_table`,
    );
    if (userAssignmentTable?.has_table) {
      await q.query(`DROP TABLE "user_assignment"`);
    }

    const [finalAssignmentTable] = await q.query(
      `SELECT to_regclass('public.final_assignment') IS NOT NULL AS has_table`,
    );
    if (finalAssignmentTable?.has_table) {
      await q.query(`DROP TABLE "final_assignment"`);
    }

    const [statusType] = await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'user_assignment_status_enum'`,
    );
    if (statusType) {
      await q.query(`DROP TYPE "user_assignment_status_enum"`);
    }
  }
}

