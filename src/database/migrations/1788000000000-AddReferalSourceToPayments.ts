import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReferalSourceToPayments1788000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const typeExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'payments_referal_source_enum'
    `);
    if (typeExists.length === 0) {
      await queryRunner.query(`
        CREATE TYPE "payments_referal_source_enum" AS ENUM (
          'Instagram', 'TikTok', 'LinkedIn', 'Friends', 'University',
          'WhatsApp Group', 'Webinar/Event', 'Website', 'Other'
        )
      `);
    }

    const columnExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'payments' AND column_name = 'referalSource'
    `);
    if (columnExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "payments"
        ADD "referalSource" "payments_referal_source_enum"
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments" DROP COLUMN IF EXISTS "referalSource"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "payments_referal_source_enum"
    `);
  }
}
