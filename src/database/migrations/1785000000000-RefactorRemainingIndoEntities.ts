import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorRemainingIndoEntities1785000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Rename Tables
    await queryRunner.query(`ALTER TABLE "teknologi" RENAME TO "technologies"`);
    await queryRunner.query(`ALTER TABLE "sertifikat" RENAME TO "certificates"`);
    await queryRunner.query(`ALTER TABLE "pertanyaan_kelas" RENAME TO "course_questions"`);
    await queryRunner.query(`ALTER TABLE "user_kelas" RENAME TO "user_courses"`);

    // 2. Rename Columns in 'technologies'
    await queryRunner.query(`ALTER TABLE "technologies" RENAME COLUMN "nama" TO "name"`);

    // 3. Rename Columns in 'certificates'
    await queryRunner.query(`ALTER TABLE "certificates" RENAME COLUMN "sertif" TO "certificate_file"`);
    await queryRunner.query(`ALTER TABLE "certificates" RENAME COLUMN "kelasId" TO "courseId"`);

    // 4. Rename Columns in 'course_questions'
    await queryRunner.query(`ALTER TABLE "course_questions" RENAME COLUMN "pertanyaan" TO "question"`);
    await queryRunner.query(`ALTER TABLE "course_questions" RENAME COLUMN "jawaban" TO "answer"`);
    await queryRunner.query(`ALTER TABLE "course_questions" RENAME COLUMN "kelasId" TO "courseId"`);

    // 5. Rename Columns in 'user_courses'
    await queryRunner.query(`ALTER TABLE "user_courses" RENAME COLUMN "progres" TO "progress"`);

    // 6. Rename Columns in 'team'
    await queryRunner.query(`ALTER TABLE "team" RENAME COLUMN "nama" TO "name"`);
    await queryRunner.query(`ALTER TABLE "team" RENAME COLUMN "posisi" TO "position"`);
    await queryRunner.query(`ALTER TABLE "team" RENAME COLUMN "deskripsi" TO "description"`);

    // 7. Rename Columns in 'team_leads'
    await queryRunner.query(`ALTER TABLE "team_leads" RENAME COLUMN "nama" TO "name"`);
    await queryRunner.query(`ALTER TABLE "team_leads" RENAME COLUMN "posisi" TO "position"`);
    await queryRunner.query(`ALTER TABLE "team_leads" RENAME COLUMN "deskripsi" TO "description"`);

    // 8. Rename Columns in 'mentors'
    await queryRunner.query(`ALTER TABLE "mentors" RENAME COLUMN "nama" TO "name"`);
    await queryRunner.query(`ALTER TABLE "mentors" RENAME COLUMN "posisi" TO "position"`);
    await queryRunner.query(`ALTER TABLE "mentors" RENAME COLUMN "deskripsi" TO "description"`);
    await queryRunner.query(`ALTER TABLE "mentors" RENAME COLUMN "kelasId" TO "courseId"`);

    // 9. Rename Columns in 'logbook'
    await queryRunner.query(`ALTER TABLE "logbook" RENAME COLUMN "kegiatan" TO "activity"`);
    await queryRunner.query(`ALTER TABLE "logbook" RENAME COLUMN "rincian_kegiatan" TO "activity_details"`);
    await queryRunner.query(`ALTER TABLE "logbook" RENAME COLUMN "kendala" TO "obstacles"`);
    await queryRunner.query(`ALTER TABLE "logbook" RENAME COLUMN "dokumentasi_lain" TO "other_documentation"`);

    // 10. Rename Columns in 'session'
    await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "topik" TO "topic"`);
    await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "tanggal" TO "date"`);
    await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "lokasi" TO "location"`);
    await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "waktu_awal" TO "start_time"`);
    await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "waktu_akhir" TO "end_time"`);
    await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "akhir" TO "is_final"`);

    // 11. Rename Columns in 'quiz'
    await queryRunner.query(`ALTER TABLE "quiz" RENAME COLUMN "nama_quiz" TO "quiz_name"`);
    await queryRunner.query(`ALTER TABLE "quiz" RENAME COLUMN "nilai_minimal" TO "minimum_score"`);
    await queryRunner.query(`ALTER TABLE "quiz" RENAME COLUMN "durasi" TO "duration"`);

    // 12. Rename Columns in 'portofolios'
    await queryRunner.query(`ALTER TABLE "portofolios" RENAME COLUMN "gambar" TO "image"`);
    await queryRunner.query(`ALTER TABLE "portofolios" RENAME COLUMN "judul" TO "title"`);
    await queryRunner.query(`ALTER TABLE "portofolios" RENAME COLUMN "deskripsi" TO "description"`);
    await queryRunner.query(`ALTER TABLE "portofolios" RENAME COLUMN "kelasId" TO "courseId"`);

    // 13. Rename Columns in 'weeks'
    await queryRunner.query(`ALTER TABLE "weeks" RENAME COLUMN "minggu_ke" TO "week_number"`);
    await queryRunner.query(`ALTER TABLE "weeks" RENAME COLUMN "keterangan" TO "description"`);
    await queryRunner.query(`ALTER TABLE "weeks" RENAME COLUMN "akhir" TO "is_final"`);
    await queryRunner.query(`ALTER TABLE "weeks" RENAME COLUMN "kelasId" TO "courseId"`);

    // 14. Rename Columns in 'collaborations'
    await queryRunner.query(`ALTER TABLE "collaborations" RENAME COLUMN "gambar" TO "image"`);

    // 15. Miscellaneous Foreign Keys
    await queryRunner.query(`ALTER TABLE "answers" RENAME COLUMN "pertanyaanId" TO "questionId"`);
    await queryRunner.query(`ALTER TABLE "benefit_category" RENAME COLUMN "kategoriId" TO "categoryId"`);
    await queryRunner.query(`ALTER TABLE "comments" RENAME COLUMN "jawaban_tugasId" TO "assignment_answerId"`);
    await queryRunner.query(`ALTER TABLE "flow_category" RENAME COLUMN "kategoriId" TO "categoryId"`);
    await queryRunner.query(`ALTER TABLE "gallery" RENAME COLUMN "kategori_id" TO "categoryId"`);
    await queryRunner.query(`ALTER TABLE "mentoring" RENAME COLUMN "kelasId" TO "courseId"`);
    await queryRunner.query(`ALTER TABLE "superiority" RENAME COLUMN "kategoriId" TO "categoryId"`);
    await queryRunner.query(`ALTER TABLE "user_answers" RENAME COLUMN "pertanyaanId" TO "questionId"`);
    await queryRunner.query(`ALTER TABLE "user_answers" RENAME COLUMN "jawabanId" TO "answerId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse logic if needed
  }
}
