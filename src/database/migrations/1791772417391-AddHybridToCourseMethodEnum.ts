import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHybridToCourseMethodEnum1791772417391 implements MigrationInterface {
  name = 'AddHybridToCourseMethodEnum1791772417391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambahkan nilai 'hybrid' ke postgres enum 'course_method_enum'
    await queryRunner.query(
      `ALTER TYPE "course_method_enum" ADD VALUE IF NOT EXISTS 'hybrid'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL enum tidak mendukung penghapusan nilai secara langsung tanpa recreate enum type
    await queryRunner.query(
      `CREATE TYPE "course_method_enum_old" AS ENUM('online', 'offline')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ALTER COLUMN "method" TYPE "course_method_enum_old" USING ("method"::text::"course_method_enum_old")`,
    );
    await queryRunner.query(`DROP TYPE "course_method_enum"`);
    await queryRunner.query(
      `ALTER TYPE "course_method_enum_old" RENAME TO "course_method_enum"`,
    );
  }
}

