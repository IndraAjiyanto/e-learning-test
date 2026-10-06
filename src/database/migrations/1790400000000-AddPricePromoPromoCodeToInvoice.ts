import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPricePromoPromoCodeToInvoice1790400000000 implements MigrationInterface {
  name = 'AddPricePromoPromoCodeToInvoice1790400000000';

  public async up(q: QueryRunner): Promise<void> {
    const [table] = (await q.query(
      `SELECT to_regclass(table) IS NOT NULL AS has_table`,
    )) as { has_table: boolean }[];
    if (!table?.has_table) return;

    const addColumnIfNotExists = async (
      columnName: string,
      typeDef: string,
    ) => {
      const [col] = (await q.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = 'invoice' AND column_name = '${columnName}'`,
      )) as unknown[];
      if (!col) {
        await q.query(`ALTER TABLE "invoice" ADD "${columnName}" ${typeDef}`);
      }
    };

    await addColumnIfNotExists('price', 'numeric(12,2)');
    await addColumnIfNotExists('promo', 'numeric(12,2)');
    await addColumnIfNotExists('promo_code', 'numeric(12,2) DEFAULT 0');
  }

  public async down(q: QueryRunner): Promise<void> {
    const [table] = (await q.query(
      `SELECT to_regclass(table) IS NOT NULL AS has_table`,
    )) as { has_table: boolean }[];
    if (!table?.has_table) return;

    const dropColumnIfExists = async (columnName: string) => {
      const [col] = (await q.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = 'invoice' AND column_name = '${columnName}'`,
      )) as unknown[];
      if (col) {
        await q.query(`ALTER TABLE "invoice" DROP COLUMN "${columnName}"`);
      }
    };

    await dropColumnIfExists('promo_code');
    await dropColumnIfExists('promo');
    await dropColumnIfExists('price');
  }
}

