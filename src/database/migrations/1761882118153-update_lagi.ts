import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLagi1761882118153 implements MigrationInterface {
    name = 'UpdateLagi1761882118153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "absen" DROP COLUMN "lokasi"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "absen" ADD "lokasi" character varying NOT NULL`);
    }

}
