import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateRegistrationColumn1786007252016 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
      ALTER TABLE "course"
      ADD COLUMN "date_registration" TIMESTAMP NULL;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "course"
      DROP COLUMN "date_registration";
    `);        
    }

}
