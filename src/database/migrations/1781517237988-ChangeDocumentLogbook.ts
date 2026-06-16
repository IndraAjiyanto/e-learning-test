import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDocumentLogbook1781517237988 implements MigrationInterface {
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "logbook"
      ALTER COLUMN "dokumentasi" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "logbook"
      ALTER COLUMN "dokumentasi" SET NOT NULL
    `);
  }

}
