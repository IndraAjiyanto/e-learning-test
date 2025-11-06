import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1762396346688 implements MigrationInterface {
    name = 'Update1762396346688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kelas" DROP COLUMN "form"`);
        await queryRunner.query(`ALTER TABLE "kelas" ADD "form" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kelas" DROP COLUMN "form"`);
        await queryRunner.query(`ALTER TABLE "kelas" ADD "form" integer`);
    }

}
