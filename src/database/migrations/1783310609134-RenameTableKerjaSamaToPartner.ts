import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTableKerjaSamaToPartner1783310609134 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`ALTER TABLE "kerja_sama" RENAME TO "partner";`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`ALTER TABLE "partner" RENAME TO "kerja_sama";`);
    }

}
