import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameMentorLogbook1785000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME TO "mentor_logbook"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "mentor_logbook" RENAME TO "logbook_mentor"`);
  }
}
