import { MigrationInterface, QueryRunner } from "typeorm";

export class ArchitectureV21786956574389 implements MigrationInterface {
    name = 'ArchitectureV21786956574389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "promo_usage_logs" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "user_email" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "user_name" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "course_name" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "voucher_code" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "subtotal" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "discount_amount" numeric(12,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "final_total" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "UQ_2c540326a039a91fa7e942caed7" UNIQUE ("uuid")`);
        await queryRunner.query(`CREATE TYPE "public"."payments_payment_status_enum" AS ENUM('draft', 'pending_payment', 'paid', 'expired', 'failed')`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "payment_status" "public"."payments_payment_status_enum" DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "xendit_invoice_id" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "xendit_invoice_url" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "payment_method" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "paid_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD "url_code" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD CONSTRAINT "UQ_ca236f1dbd4aaf11b317ea67f62" UNIQUE ("url_code")`);
        await queryRunner.query(`ALTER TABLE "voucher" ADD "allowed_user_ids" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voucher" DROP COLUMN "allowed_user_ids"`);
        await queryRunner.query(`ALTER TABLE "voucher" DROP CONSTRAINT "UQ_ca236f1dbd4aaf11b317ea67f62"`);
        await queryRunner.query(`ALTER TABLE "voucher" DROP COLUMN "url_code"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "paid_at"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "xendit_invoice_url"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "xendit_invoice_id"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_status"`);
        await queryRunner.query(`DROP TYPE "public"."payments_payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "UQ_2c540326a039a91fa7e942caed7"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "final_total"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "discount_amount"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "subtotal"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "voucher_code"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "course_name"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "user_name"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "user_email"`);
    }

}
