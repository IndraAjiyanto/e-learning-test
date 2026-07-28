import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTechnologyJoinTables1785000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename join tables
    await queryRunner.query(`ALTER TABLE "kelas_teknologi" RENAME TO "kelas_technologies"`);
    await queryRunner.query(`ALTER TABLE "mentor_teknologi" RENAME TO "mentor_technologies"`);

    // Rename columns
    await queryRunner.query(`ALTER TABLE "kelas_technologies" RENAME COLUMN "teknologiId" TO "technologiesId"`);
    await queryRunner.query(`ALTER TABLE "mentor_technologies" RENAME COLUMN "teknologiId" TO "technologiesId"`);
    
    // Note: The foreign key names and constraints stay the same, which is fine for Postgres.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "mentor_technologies" RENAME COLUMN "technologiesId" TO "teknologiId"`);
    await queryRunner.query(`ALTER TABLE "kelas_technologies" RENAME COLUMN "technologiesId" TO "teknologiId"`);
    
    await queryRunner.query(`ALTER TABLE "mentor_technologies" RENAME TO "mentor_teknologi"`);
    await queryRunner.query(`ALTER TABLE "kelas_technologies" RENAME TO "kelas_teknologi"`);
  }
}
