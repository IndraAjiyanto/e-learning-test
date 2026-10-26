import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoucherPricingSnapshots1790500000000 implements MigrationInterface {
  name = 'AddVoucherPricingSnapshots1790500000000';

  public async up(q: QueryRunner): Promise<void> {
    const addColumnIfMissing = async (
      tableName: string,
      columnName: string,
      typeDef: string,
    ) => {
      const [column] = (await q.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = '${tableName}' AND column_name = '${columnName}'`,
      )) as unknown[];
      if (!column) {
        await q.query(
          `ALTER TABLE "${tableName}" ADD "${columnName}" ${typeDef}`,
        );
      }
    };

    await addColumnIfMissing('payments', 'pricing_snapshot', 'jsonb');
    await addColumnIfMissing('invoice', 'voucher_code', 'character varying');
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE "invoice" DROP COLUMN IF EXISTS "voucher_code"');
    await q.query(
      'ALTER TABLE "payments" DROP COLUMN IF EXISTS "pricing_snapshot"',
    );
  }
}
