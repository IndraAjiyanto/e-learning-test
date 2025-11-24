import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1763965392821 implements MigrationInterface {
    name = 'Update1763965392821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pertanyaan_umum" ("id" SERIAL NOT NULL, "pertanyaan" character varying NOT NULL, "jawaban" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "kategoriId" integer, CONSTRAINT "PK_5a8d3b8bb81ea68e6dc76c5b30d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."kategori_type_enum" AS ENUM('Special Program', 'Program')`);
        await queryRunner.query(`ALTER TABLE "kategori" ADD "type" "public"."kategori_type_enum"`);
        await queryRunner.query(`ALTER TABLE "pertanyaan_umum" ADD CONSTRAINT "FK_10c7e15fda651a1ed577cd6f88c" FOREIGN KEY ("kategoriId") REFERENCES "kategori"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pertanyaan_umum" DROP CONSTRAINT "FK_10c7e15fda651a1ed577cd6f88c"`);
        await queryRunner.query(`ALTER TABLE "kategori" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."kategori_type_enum"`);
        await queryRunner.query(`DROP TABLE "pertanyaan_umum"`);
    }

}
