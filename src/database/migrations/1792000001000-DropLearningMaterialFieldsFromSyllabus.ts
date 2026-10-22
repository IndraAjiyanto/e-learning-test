import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Menghapus kolom materi lama (Video, PDF, PPTX) dari tabel `syllabus`.
 * Materi kini dikelola lewat entitas `material` (relasi syllabus), bukan
 * kolom langsung di tabel syllabus. Idempoten agar aman dijalankan berkali-kali.
 */
export class DropLearningMaterialFieldsFromSyllabus1792000001000 implements MigrationInterface {
  name = 'DropLearningMaterialFieldsFromSyllabus1792000001000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE "syllabus"
        DROP COLUMN IF EXISTS "videoUrl",
        DROP COLUMN IF EXISTS "videoDuration",
        DROP COLUMN IF EXISTS "pdfFile",
        DROP COLUMN IF EXISTS "pdfOriginalName",
        DROP COLUMN IF EXISTS "pdfFileSize",
        DROP COLUMN IF EXISTS "pptFile",
        DROP COLUMN IF EXISTS "pptOriginalName",
        DROP COLUMN IF EXISTS "pptFileSize",
        DROP COLUMN IF EXISTS "pptDriveFileId";
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE "syllabus"
        ADD COLUMN IF NOT EXISTS "videoUrl" character varying NULL,
        ADD COLUMN IF NOT EXISTS "videoDuration" character varying NULL,
        ADD COLUMN IF NOT EXISTS "pdfFile" character varying NULL,
        ADD COLUMN IF NOT EXISTS "pdfOriginalName" character varying NULL,
        ADD COLUMN IF NOT EXISTS "pdfFileSize" bigint NULL,
        ADD COLUMN IF NOT EXISTS "pptFile" character varying NULL,
        ADD COLUMN IF NOT EXISTS "pptOriginalName" character varying NULL,
        ADD COLUMN IF NOT EXISTS "pptFileSize" bigint NULL,
        ADD COLUMN IF NOT EXISTS "pptDriveFileId" character varying NULL;
    `);
  }
}
