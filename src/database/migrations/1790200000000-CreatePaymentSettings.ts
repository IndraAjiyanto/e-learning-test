import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentSettings1790200000000 implements MigrationInterface {
  name = 'CreatePaymentSettings1790200000000';

  public async up(q: QueryRunner): Promise<void> {
    // Idempoten: skip jika tabel sudah ada
    const [probe] = await q.query(
      `SELECT to_regclass('public.payment_settings') IS NOT NULL AS exists`,
    );
    if (probe.exists) return;

    await q.query(`
      CREATE TABLE "payment_settings" (
        "id"              uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "manual_enabled"  boolean   NOT NULL DEFAULT true,
        "gateway_enabled" boolean   NOT NULL DEFAULT true,
        "createdAt"       TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_settings" PRIMARY KEY ("id")
      )
    `);

    // Seed default: keduanya ON agar tidak ada yang berubah perilakunya saat migrasi dijalankan
    await q.query(`
      INSERT INTO "payment_settings" ("manual_enabled", "gateway_enabled")
      VALUES (true, true)
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "payment_settings"`);
  }
}