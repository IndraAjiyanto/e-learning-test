import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEnumOnBenefit1783391823688 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.query(`
      ALTER TYPE "public"."benefit_no_enum"
      RENAME TO "benefit_no_enum_old"
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."benefit_no_enum"
      AS ENUM ('1', '2', '3', '4', '5')
    `);

    await queryRunner.query(`
      ALTER TABLE "benefit"
      ALTER COLUMN "no"
      TYPE "public"."benefit_no_enum"
      USING "no"::text::"public"."benefit_no_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."benefit_no_enum_old"
    `);
  
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
          await queryRunner.query(`
      DELETE FROM "benefit"
      WHERE "no" IN ('4', '5')
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."benefit_no_enum"
      RENAME TO "benefit_no_enum_old"
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."benefit_no_enum"
      AS ENUM ('1', '2', '3')
    `);

    await queryRunner.query(`
      ALTER TABLE "benefit"
      ALTER COLUMN "no"
      TYPE "public"."benefit_no_enum"
      USING "no"::text::"public"."benefit_no_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."benefit_no_enum_old"
    `);
  }
    

}
