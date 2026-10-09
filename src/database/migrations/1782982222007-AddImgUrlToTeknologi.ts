import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImgUrlToTeknologi1782982222007 implements MigrationInterface {
    name = 'AddImgUrlToTeknologi1782982222007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Column img_url already exists and svg is already nullable in this database
        // This migration is a no-op to register the state
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No-op
    }

}
