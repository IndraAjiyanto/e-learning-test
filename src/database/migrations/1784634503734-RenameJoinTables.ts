import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameJoinTables1784634503734 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Safe manual renames to prevent data loss
        await queryRunner.query(`ALTER TABLE "kelas_technologies" RENAME TO "course_technologies"`);
        await queryRunner.query(`ALTER TABLE "course_technologies" RENAME COLUMN "kelasId" TO "courseId"`);
        await queryRunner.query(`ALTER TABLE "course_technologies" RENAME COLUMN "technologiesId" TO "technologyId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_technologies" RENAME COLUMN "technologyId" TO "technologiesId"`);
        await queryRunner.query(`ALTER TABLE "course_technologies" RENAME COLUMN "courseId" TO "kelasId"`);
        await queryRunner.query(`ALTER TABLE "course_technologies" RENAME TO "kelas_technologies"`);
    }

}
