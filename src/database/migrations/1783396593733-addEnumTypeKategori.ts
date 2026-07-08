import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEnumTypeKategori1783396593733 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TYPE "public"."kategori_type_enum"
      RENAME TO "kategori_type_enum_old"
    `);

        await queryRunner.query(`
      CREATE TYPE "public"."kategori_type_enum"
      AS ENUM (
        'Special Program',
        'Paid Program',
        'Free Program'
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "kategori"
      ALTER COLUMN "type"
      TYPE "public"."kategori_type_enum"
      USING (
        CASE
          WHEN "type"::text = 'Program'
          THEN 'Paid Program'
          ELSE "type"::text
        END
      )::"public"."kategori_type_enum"
    `);

        await queryRunner.query(`
      DROP TYPE "public"."kategori_type_enum_old"
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TYPE "public"."kategori_type_enum"
      RENAME TO "kategori_type_enum_old"
    `);

        await queryRunner.query(`
      CREATE TYPE "public"."kategori_type_enum"
      AS ENUM (
        'Special Program',
        'Program'
      )
    `);

        await queryRunner.query(`
      ALTER TABLE "kategori"
      ALTER COLUMN "type"
      TYPE "public"."kategori_type_enum"
      USING (
        CASE
          WHEN "type"::text IN ('Paid Program', 'Free Program')
          THEN 'Program'
          ELSE "type"::text
        END
      )::"public"."kategori_type_enum"
    `);

        await queryRunner.query(`
      DROP TYPE "public"."kategori_type_enum_old"
    `);
    }

}
