import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1762142834866 implements MigrationInterface {
    name = 'Update1762142834866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gambar_benefit" ADD "no" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gambar_benefit" DROP COLUMN "no"`);
    }

}
