import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Rename 27 kolom dari Indonesian/snake_case ke English/camelCase
 * sesuai dengan property name di entity files.
 *
 * Konsep: ALTER TABLE RENAME COLUMN (data tidak hilang, hanya nama berubah)
 * Idempotent: aman dijalankan ulang (IF EXISTS)
 */
export class RefactorIndonesianPropertiesToEnglish1786000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Category A: Indonesian words ---
    await queryRunner.query(`ALTER TABLE IF EXISTS "comments" RENAME COLUMN "komentar" TO "comment"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "logbook" RENAME COLUMN "dokumentasi" TO "documentation"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "partner" RENAME COLUMN "gambar" TO "image"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "instragram" TO "instagram"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "alamat" TO "address"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "nomor" TO "number"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "link_alamat" TO "linkAddress"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "video_youtube" TO "videoYoutube"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "link_form" TO "linkForm"`);

    // --- Category B: snake_case -> camelCase ---
    await queryRunner.query(`ALTER TABLE IF EXISTS "attendance" RENAME COLUMN "attendance_time" TO "attendanceTime"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "award" RENAME COLUMN "award_order" TO "awardOrder"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "background" RENAME COLUMN "background_order" TO "backgroundOrder"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "biodata" RENAME COLUMN "full_name" TO "fullName"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "biodata" RENAME COLUMN "study_program" TO "studyProgram"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "category" RENAME COLUMN "info_id" TO "infoId"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "category" RENAME COLUMN "info_en" TO "infoEn"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "category" RENAME COLUMN "info_ja" TO "infoJa"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "commitment" RENAME COLUMN "commitment_order" TO "commitmentOrder"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "course" RENAME COLUMN "learningTargets_id" TO "learningTargetsId"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "course" RENAME COLUMN "learningTargets_en" TO "learningTargetsEn"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "course" RENAME COLUMN "learningTargets_ja" TO "learningTargetsJa"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "course" RENAME COLUMN "check_paid" TO "checkPaid"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "course_type" RENAME COLUMN "name_clasess_type" TO "nameClassesType"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "experience" RENAME COLUMN "experience_order" TO "experienceOrder"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "gallery" RENAME COLUMN "file_path" TO "filePath"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "installment" RENAME COLUMN "down_payment" TO "downPayment"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "mentor_logbook" RENAME COLUMN "activity_detail" TO "activityDetail"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "mission" RENAME COLUMN "mission_order" TO "missionOrder"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "portofolios" RENAME COLUMN "content_html" TO "contentHtml"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "technologies" RENAME COLUMN "img_url" TO "imgUrl"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse: rename back to Indonesian/snake_case
    await queryRunner.query(`ALTER TABLE IF EXISTS "comments" RENAME COLUMN "comment" TO "komentar"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "logbook" RENAME COLUMN "documentation" TO "dokumentasi"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "partner" RENAME COLUMN "image" TO "gambar"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "instagram" TO "instragram"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "address" TO "alamat"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "number" TO "nomor"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "linkAddress" TO "link_alamat"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "videoYoutube" TO "video_youtube"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "social" RENAME COLUMN "linkForm" TO "link_form"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "attendance" RENAME COLUMN "attendanceTime" TO "attendance_time"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "award" RENAME COLUMN "awardOrder" TO "award_order"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "background" RENAME COLUMN "backgroundOrder" TO "background_order"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "biodata" RENAME COLUMN "fullName" TO "full_name"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "biodata" RENAME COLUMN "studyProgram" TO "study_program"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "category" RENAME COLUMN "infoId" TO "info_id"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "category" RENAME COLUMN "infoEn" TO "info_en"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "category" RENAME COLUMN "infoJa" TO "info_ja"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "commitment" RENAME COLUMN "commitmentOrder" TO "commitment_order"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "course" RENAME COLUMN "learningTargetsId" TO "learningTargets_id"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "course" RENAME COLUMN "learningTargetsEn" TO "learningTargets_en"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "course" RENAME COLUMN "learningTargetsJa" TO "learningTargets_ja"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "course" RENAME COLUMN "checkPaid" TO "check_paid"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "course_type" RENAME COLUMN "nameClassesType" TO "name_clasess_type"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "experience" RENAME COLUMN "experienceOrder" TO "experience_order"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "gallery" RENAME COLUMN "filePath" TO "file_path"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "installment" RENAME COLUMN "downPayment" TO "down_payment"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "mentor_logbook" RENAME COLUMN "activityDetail" TO "activity_detail"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "mission" RENAME COLUMN "missionOrder" TO "mission_order"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "portofolios" RENAME COLUMN "contentHtml" TO "content_html"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "technologies" RENAME COLUMN "imgUrl" TO "img_url"`);
  }
}