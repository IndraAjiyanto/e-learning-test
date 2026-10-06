import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProofToInstallmentPayment1790300000000 implements MigrationInterface {
  name = 'AddProofToInstallmentPayment1790300000000';

  public async up(q: QueryRunner): Promise<void> {
    const cols = (await q.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'installment_payments' AND column_name = 'file'`,
    )) as unknown[];
    if (cols.length === 0) {
      await q.query(
        `ALTER TABLE "installment_payments" ADD COLUMN "file" character varying`,
      );
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "installment_payments" DROP COLUMN IF EXISTS "file"`,
    );
  }
}

