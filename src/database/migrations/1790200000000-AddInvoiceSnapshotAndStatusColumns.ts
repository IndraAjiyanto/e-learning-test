import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceSnapshotAndStatusColumns1790200000000 implements MigrationInterface {
  name = 'AddInvoiceSnapshotAndStatusColumns1790200000000';

  public async up(q: QueryRunner): Promise<void> {
    const [table] = (await q.query(
      `SELECT to_regclass('public.invoice') IS NOT NULL AS has_table`,
    )) as { has_table: boolean }[];
    if (!table?.has_table) return;

    // 1. Enum type status invoice
    const [enumType] = (await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'invoice_status_enum'`,
    )) as unknown[];
    if (!enumType) {
      await q.query(
        `CREATE TYPE "invoice_status_enum" AS ENUM('pending', 'paid', 'expired', 'refunded')`,
      );
    }

    // 2. Helper untuk tambah kolom idempotent
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

    await addColumnIfNotExists('invoice_number', 'character varying');
    await addColumnIfNotExists(
      'status',
      `"invoice_status_enum" DEFAULT 'pending'`,
    );
    await addColumnIfNotExists('xendit_payment_channel', 'character varying');
    await addColumnIfNotExists('user_fullname', 'character varying');
    await addColumnIfNotExists('user_email', 'character varying');
    await addColumnIfNotExists('user_phone', 'character varying');
    await addColumnIfNotExists('course_name', 'character varying');
    await addColumnIfNotExists('category_name', 'character varying');
    await addColumnIfNotExists('proof_url', 'character varying');
    await addColumnIfNotExists('expired_at', 'timestamp without time zone');
    await addColumnIfNotExists('refund_at', 'timestamp without time zone');
    await addColumnIfNotExists('refund_amount', 'numeric(12,2)');
    await addColumnIfNotExists('userId', 'uuid');
    await addColumnIfNotExists('courseId', 'uuid');

    // 3. Unique index untuk invoice_number
    const [indexCheck] = (await q.query(
      `SELECT 1 FROM pg_indexes WHERE tablename = 'invoice' AND indexname = 'UQ_invoice_invoice_number'`,
    )) as unknown[];
    if (!indexCheck) {
      await q.query(
        `CREATE UNIQUE INDEX "UQ_invoice_invoice_number" ON "invoice" ("invoice_number") WHERE "invoice_number" IS NOT NULL`,
      );
    }

    // 4. FK relations to user and course
    const [userTable] = (await q.query(
      `SELECT to_regclass('public.user') IS NOT NULL AS has_table`,
    )) as { has_table: boolean }[];
    if (userTable?.has_table) {
      const [userFk] = (await q.query(
        `SELECT 1 FROM information_schema.table_constraints
         WHERE table_name = 'invoice' AND constraint_name = 'FK_invoice_user'`,
      )) as unknown[];
      if (!userFk) {
        await q.query(
          `ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_user"
           FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
      }
    }

    const [courseTable] = (await q.query(
      `SELECT to_regclass('public.course') IS NOT NULL AS has_table`,
    )) as { has_table: boolean }[];
    if (courseTable?.has_table) {
      const [courseFk] = (await q.query(
        `SELECT 1 FROM information_schema.table_constraints
         WHERE table_name = 'invoice' AND constraint_name = 'FK_invoice_course'`,
      )) as unknown[];
      if (!courseFk) {
        await q.query(
          `ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_course"
           FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
      }
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    const [table] = (await q.query(
      `SELECT to_regclass('public.invoice') IS NOT NULL AS has_table`,
    )) as { has_table: boolean }[];
    if (!table?.has_table) return;

    await q.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT IF EXISTS "FK_invoice_course"`,
    );
    await q.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT IF EXISTS "FK_invoice_user"`,
    );
    await q.query(`DROP INDEX IF EXISTS "UQ_invoice_invoice_number"`);

    const dropColumnIfExists = async (columnName: string) => {
      const [col] = (await q.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = 'invoice' AND column_name = '${columnName}'`,
      )) as unknown[];
      if (col) {
        await q.query(`ALTER TABLE "invoice" DROP COLUMN "${columnName}"`);
      }
    };

    await dropColumnIfExists('courseId');
    await dropColumnIfExists('userId');
    await dropColumnIfExists('refund_amount');
    await dropColumnIfExists('refund_at');
    await dropColumnIfExists('expired_at');
    await dropColumnIfExists('proof_url');
    await dropColumnIfExists('category_name');
    await dropColumnIfExists('course_name');
    await dropColumnIfExists('user_phone');
    await dropColumnIfExists('user_email');
    await dropColumnIfExists('user_fullname');
    await dropColumnIfExists('xendit_payment_channel');
    await dropColumnIfExists('status');
    await dropColumnIfExists('invoice_number');

    const [enumType] = (await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'invoice_status_enum'`,
    )) as unknown[];
    if (enumType) {
      await q.query(`DROP TYPE "invoice_status_enum"`);
    }
  }
}

