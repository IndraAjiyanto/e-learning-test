import { MigrationInterface, QueryRunner } from 'typeorm';

export class PisahkanInvoiceDariPayment1787041510551 implements MigrationInterface {
  name = 'PisahkanInvoiceDariPayment1787041510551';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "invoice" ("id" SERIAL NOT NULL, "xendit_invoice_id" character varying, "xendit_invoice_url" character varying, "subtotal" numeric(12,2), "discount_amount" numeric(12,2) DEFAULT '0', "final_total" numeric(12,2), "payment_method" character varying, "paid_at" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "paymentId" integer, CONSTRAINT "REL_03ccf846238db85401525e07cd" UNIQUE ("paymentId"), CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`,
    );

    // --- QUERY PENYELAMAT DATA ---
    await queryRunner.query(`
            INSERT INTO "invoice" ("paymentId", "xendit_invoice_id", "xendit_invoice_url", "subtotal", "discount_amount", "final_total", "payment_method", "paid_at")
            SELECT "id", "xendit_invoice_id", "xendit_invoice_url", "subtotal", "discount_amount", "final_total", "payment_method", "paid_at"
            FROM "payments" WHERE "xendit_invoice_url" IS NOT NULL
        `);
    // -----------------------------

    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "subtotal"`);
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "discount_amount"`,
    );
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "final_total"`);
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "payment_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."payments_payment_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "paid_at"`);
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "xendit_invoice_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "xendit_invoice_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "payment_method"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" ALTER COLUMN "no" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_03ccf846238db85401525e07cd2" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_03ccf846238db85401525e07cd2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" ALTER COLUMN "no" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "payment_method" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "xendit_invoice_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "xendit_invoice_id" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "payments" ADD "paid_at" TIMESTAMP`);
    await queryRunner.query(
      `CREATE TYPE "public"."payments_payment_status_enum" AS ENUM('draft', 'pending_payment', 'paid', 'expired', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "payment_status" "public"."payments_payment_status_enum" DEFAULT 'draft'`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "final_total" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "discount_amount" numeric(12,2) DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "subtotal" numeric(12,2)`,
    );
    await queryRunner.query(`DROP TABLE "invoice"`);
  }
}
