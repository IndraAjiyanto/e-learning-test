import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnsToRegistrations1787200000000 implements MigrationInterface {
  name = 'AddColumnsToRegistrations1787200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums if they do not exist
    await queryRunner.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'registrations_current_status_enum'
            ) THEN
                CREATE TYPE "registrations_current_status_enum" AS ENUM(
                    'University Student', 'Fresh Graduate', 'Job Seeker',
                    'Employee', 'Freelancer', 'Entrepreneur', 'Other'
                );
            END IF;
        END
        $$;
    `);

    await queryRunner.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'registrations_referal_source_enum'
            ) THEN
                CREATE TYPE "registrations_referal_source_enum" AS ENUM(
                    'Instagram', 'TikTok', 'LinkedIn', 'Friends', 'University', 
                    'WhatsApp Group', 'Webinar/Event', 'Website', 'Other'
                );
            END IF;
        END
        $$;
    `);

    // 2. Add Columns safely
    if (!(await queryRunner.hasColumn('registrations', 'user_fullname'))) {
      await queryRunner.addColumn(
        'registrations',
        new TableColumn({
          name: 'user_fullname',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('registrations', 'user_email'))) {
      await queryRunner.addColumn(
        'registrations',
        new TableColumn({
          name: 'user_email',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('registrations', 'user_no'))) {
      await queryRunner.addColumn(
        'registrations',
        new TableColumn({
          name: 'user_no',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('registrations', 'attend_program'))) {
      await queryRunner.addColumn(
        'registrations',
        new TableColumn({
          name: 'attend_program',
          type: 'boolean',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('registrations', 'current_status'))) {
      await queryRunner.query(`
        ALTER TABLE "registrations"
        ADD COLUMN "current_status" "registrations_current_status_enum" NULL
      `);
    }

    if (!(await queryRunner.hasColumn('registrations', 'referal_source'))) {
      await queryRunner.query(`
        ALTER TABLE "registrations"
        ADD COLUMN "referal_source" "registrations_referal_source_enum" NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('registrations', 'referal_source')) {
      await queryRunner.dropColumn('registrations', 'referal_source');
    }
    if (await queryRunner.hasColumn('registrations', 'current_status')) {
      await queryRunner.dropColumn('registrations', 'current_status');
    }
    if (await queryRunner.hasColumn('registrations', 'attend_program')) {
      await queryRunner.dropColumn('registrations', 'attend_program');
    }
    if (await queryRunner.hasColumn('registrations', 'user_no')) {
      await queryRunner.dropColumn('registrations', 'user_no');
    }
    if (await queryRunner.hasColumn('registrations', 'user_email')) {
      await queryRunner.dropColumn('registrations', 'user_email');
    }
    if (await queryRunner.hasColumn('registrations', 'user_fullname')) {
      await queryRunner.dropColumn('registrations', 'user_fullname');
    }

    // Drop ENUMs
    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'registrations_current_status_enum'
            ) THEN
                DROP TYPE "registrations_current_status_enum";
            END IF;
        END
        $$;
    `);

    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'registrations_referal_source_enum'
            ) THEN
                DROP TYPE "registrations_referal_source_enum";
            END IF;
        END
        $$;
    `);
  }
}
