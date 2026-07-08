import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCommentandLikesTables1782972227267 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`DROP TABLE IF EXISTS "coment" CASCADE`);

    await queryRunner.query(`DROP TABLE IF EXISTS "likes" CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
