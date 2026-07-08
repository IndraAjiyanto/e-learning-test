import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveBlog1782824964547 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {   
    await queryRunner.query(`DROP TABLE IF EXISTS "blog" CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
      CREATE TABLE "blog" (
        "id" SERIAL PRIMARY KEY,
        "judul" varchar NOT NULL,
        "isi" jsonb NOT NULL,
        "isi_editorjs" jsonb NOT NULL,
        "author" varchar NOT NULL,
        "tags" jsonb NOT NULL,
        "keyword" varchar NOT NULL,
        "description" varchar NOT NULL,
        "gambar" jsonb NOT NULL,
        "views" int DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);
    }

}
