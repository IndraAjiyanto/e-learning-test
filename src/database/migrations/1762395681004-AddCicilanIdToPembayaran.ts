import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCicilanIdToPembayaran1762395681004 implements MigrationInterface {
    name = 'AddCicilanIdToPembayaran1762395681004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pembayaran" ADD "no" character varying`);
        await queryRunner.query(`ALTER TABLE "pembayaran" ADD "cicilanId" integer`);
        await queryRunner.query(`ALTER TABLE "pembayaran" ADD CONSTRAINT "UQ_ba748cc92803680791eaab0f31d" UNIQUE ("cicilanId")`);
        await queryRunner.query(`ALTER TABLE "pembayaran" ADD CONSTRAINT "FK_ba748cc92803680791eaab0f31d" FOREIGN KEY ("cicilanId") REFERENCES "cicilan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pembayaran" DROP CONSTRAINT "FK_ba748cc92803680791eaab0f31d"`);
        await queryRunner.query(`ALTER TABLE "pembayaran" DROP CONSTRAINT "UQ_ba748cc92803680791eaab0f31d"`);
        await queryRunner.query(`ALTER TABLE "pembayaran" DROP COLUMN "cicilanId"`);
        await queryRunner.query(`ALTER TABLE "pembayaran" DROP COLUMN "no"`);
    }

}
