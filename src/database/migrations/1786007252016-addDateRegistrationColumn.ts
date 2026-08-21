import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDateRegistrationColumn1786007252016 implements MigrationInterface {
  name = 'AddDateRegistrationColumn1786007252016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_type
                    WHERE typname = 'payments_current_status_enum'
                ) THEN
                    CREATE TYPE "payments_current_status_enum" AS ENUM(
                        'University Student', 'Fresh Graduate', 'Job Seeker',
                        'Employee', 'Freelancer', 'Entrepreneur', 'Other'
                    );
                END IF;
            END
            $$;
        `);

    await queryRunner.query(`
            ALTER TABLE "payments"
            ADD COLUMN IF NOT EXISTS "current_status" "payments_current_status_enum" NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "payments"
            ADD COLUMN IF NOT EXISTS "attend_program" boolean NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "course"
            ADD COLUMN IF NOT EXISTS "date_registration" TIMESTAMP NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "course"
            DROP COLUMN IF EXISTS "date_registration"
        `);

    await queryRunner.query(`
            ALTER TABLE "payments"
            DROP COLUMN IF EXISTS "attend_program"
        `);

    await queryRunner.query(`
            ALTER TABLE "payments"
            DROP COLUMN IF EXISTS "current_status"
        `);

    await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_type
                    WHERE typname = 'payments_current_status_enum'
                ) THEN
                    DROP TYPE "payments_current_status_enum";
                END IF;
            END
            $$;
        `);
  }
}
