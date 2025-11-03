import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1762153341062 implements MigrationInterface {
    name = 'Update1762153341062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "benefit" RENAME COLUMN "special" TO "no"`);
        await queryRunner.query(`ALTER TABLE "gambar_benefit" DROP COLUMN "no"`);
        await queryRunner.query(`CREATE TYPE "public"."gambar_benefit_no_enum" AS ENUM('1', '2', '3', '4')`);
        await queryRunner.query(`ALTER TABLE "gambar_benefit" ADD "no" "public"."gambar_benefit_no_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "benefit" DROP COLUMN "no"`);
        await queryRunner.query(`CREATE TYPE "public"."benefit_no_enum" AS ENUM('1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "benefit" ADD "no" "public"."benefit_no_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "benefit" DROP COLUMN "no"`);
        await queryRunner.query(`DROP TYPE "public"."benefit_no_enum"`);
        await queryRunner.query(`ALTER TABLE "benefit" ADD "no" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "gambar_benefit" DROP COLUMN "no"`);
        await queryRunner.query(`DROP TYPE "public"."gambar_benefit_no_enum"`);
        await queryRunner.query(`ALTER TABLE "gambar_benefit" ADD "no" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "benefit" RENAME COLUMN "no" TO "special"`);
    }

}
