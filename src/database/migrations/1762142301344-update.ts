import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1762142301344 implements MigrationInterface {
    name = 'Update1762142301344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."cicilan_bulan_enum" AS ENUM('3', '6', '12')`);
        await queryRunner.query(`CREATE TABLE "cicilan" ("id" SERIAL NOT NULL, "harga" jsonb NOT NULL, "bulan" "public"."cicilan_bulan_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "kelasId" integer, CONSTRAINT "REL_9bc2223d71ca2cd6beb891f816" UNIQUE ("kelasId"), CONSTRAINT "PK_3af47c41193bb3c6a3f9d2b3277" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "benefit" ADD "special" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cicilan" ADD CONSTRAINT "FK_9bc2223d71ca2cd6beb891f816c" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cicilan" DROP CONSTRAINT "FK_9bc2223d71ca2cd6beb891f816c"`);
        await queryRunner.query(`ALTER TABLE "benefit" DROP COLUMN "special"`);
        await queryRunner.query(`DROP TABLE "cicilan"`);
        await queryRunner.query(`DROP TYPE "public"."cicilan_bulan_enum"`);
    }

}
