import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateRegistrationColumn1786007252016 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        try {
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
        } catch (e) {
            console.log('Skipping payments_current_status_enum creation because it might already exist', e.message);
        }

        try {
            await queryRunner.query(`
                ALTER TABLE "payments" 
                ADD "attend_program" boolean NULL
            `);
        } catch (e) {
            console.log('Skipping attend_program creation', e.message);
        }

        try {
             await queryRunner.query(`
          ALTER TABLE "course"
          ADD COLUMN "date_registration" TIMESTAMP NULL;
        `);
        } catch (e) {
            console.log('Skipping date_registration creation', e.message);
        }
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
