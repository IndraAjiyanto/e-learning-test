import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1761881924398 implements MigrationInterface {
    name = 'Update1761881924398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "absen" ADD "lokasi" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "absen" DROP COLUMN "lokasi"`);
    }

}
