import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1762145075486 implements MigrationInterface {
    name = 'Update1762145075486'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cicilan" DROP CONSTRAINT "FK_9bc2223d71ca2cd6beb891f816c"`);
        await queryRunner.query(`ALTER TABLE "cicilan" DROP CONSTRAINT "REL_9bc2223d71ca2cd6beb891f816"`);
        await queryRunner.query(`ALTER TABLE "cicilan" ADD CONSTRAINT "FK_9bc2223d71ca2cd6beb891f816c" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cicilan" DROP CONSTRAINT "FK_9bc2223d71ca2cd6beb891f816c"`);
        await queryRunner.query(`ALTER TABLE "cicilan" ADD CONSTRAINT "REL_9bc2223d71ca2cd6beb891f816" UNIQUE ("kelasId")`);
        await queryRunner.query(`ALTER TABLE "cicilan" ADD CONSTRAINT "FK_9bc2223d71ca2cd6beb891f816c" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
