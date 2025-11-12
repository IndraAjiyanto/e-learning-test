import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDpToCicilan1762839319999 implements MigrationInterface {
  name = 'AddDpToCicilan1762839319999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cicilan" ADD COLUMN "dp" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cicilan" DROP COLUMN "dp"`);
  }
}
