import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImgUrlToTeknologi1782982222007 implements MigrationInterface {
    name = 'AddImgUrlToTeknologi1782982222007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teknologi" ADD "img_url" character varying`);
        await queryRunner.query(`ALTER TABLE "teknologi" ALTER COLUMN "svg" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teknologi" ALTER COLUMN "svg" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "teknologi" DROP COLUMN "img_url"`);
    }

}
