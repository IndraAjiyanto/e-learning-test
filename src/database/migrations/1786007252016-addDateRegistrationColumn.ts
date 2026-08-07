import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateRegistrationColumn1786007252016 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

       await queryRunner.query(`
            CREATE TYPE "payments_current_status_enum" AS ENUM(
                'University Student', 'Fresh Graduate', 'Job Seeker', 
                'Employee', 'Freelancer', 'Entrepreneur', 'Other'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "payments" 
            ADD "current_status" "payments_current_status_enum" NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "payments" 
            ADD "attend_program" boolean NULL
        `);

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

      await queryRunner.query(`
            ALTER TABLE "payments" DROP COLUMN "attend_program"
        `);
        await queryRunner.query(`
            ALTER TABLE "payments" DROP COLUMN "current_status"
        `);
        await queryRunner.query(`
            DROP TYPE "payments_current_status_enum"
        `);
    }

}
