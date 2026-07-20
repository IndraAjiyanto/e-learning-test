import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MIGRASI AMAN: Rename tabel, kolom, dan tipe enum dari bahasa Indonesia
 * ke bahasa Inggris TANPA menghapus data.
 *
 * Menggantikan 2 migration lama yang rusak:
 *   - 1752752288000-MigrateAboutToEnglish.ts   (salah nama tabel: "about" belum ada, masih "tentang")
 *   - 1752752300000-MigrateAllEntitiesToEnglish.ts (timestamp salah tahun, bug no-op rename, tidak lengkap)
 *
 * Kondisi awal database = Initial + RemoveBlog + addGallery
 *   + removeCommentandLikesTables + AddImgUrlToTeknologi.
 *
 * Disesuaikan 1:1 dengan entity di src/entities/. Tabel/kolom yang oleh
 * entity SENGAJA dipertahankan memakai nama lama (mis. @Entity('sertifikat'),
 * @JoinColumn({ name: 'kelasId' })) TIDAK di-rename di sini.
 *
 * CATATAN DATA: nilai enum "kategori"."type" berubah:
 *   lama: ('Special Program', 'Program')
 *   baru: ('Special Program', 'Paid Program', 'Free Program')
 *   Baris dengan nilai 'Program' dipetakan ke 'Paid Program'.
 */
export class RenameIndonesianToEnglish1784519100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ================= 0. DROP TABEL KOSONG (HASIL AUTO-SYNC) =================
    // Jika synchronize: true pernah menyala, tabel-tabel Inggris ini akan terbuat otomatis.
    // Kita harus menghapusnya (yang kosong) sebelum me-rename tabel asli (yang ada isinya).
    await queryRunner.query(`DROP TABLE IF EXISTS "visions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "mission" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "about" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "paragraph" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "collaborations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "image_benefit" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "category" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_type" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_flow" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "program_benefits" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "faqs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "mentors" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "installment" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "registrations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "weeks" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "session" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "material" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "assignments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "answer_task" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "questions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "answers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_answers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "scores" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quiz_progresses" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "week_progresses" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "session_progresses" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "mentor_biodata" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "portofolios" CASCADE`);

    // ================= 1. RENAME TABEL =================
    await queryRunner.query(`ALTER TABLE "visi" RENAME TO "visions"`);
    await queryRunner.query(`ALTER TABLE "misi" RENAME TO "mission"`);
    await queryRunner.query(`ALTER TABLE "tentang" RENAME TO "about"`);
    await queryRunner.query(`ALTER TABLE "paragraf" RENAME TO "paragraph"`);
    await queryRunner.query(`ALTER TABLE "kerja_sama" RENAME TO "collaborations"`);
    await queryRunner.query(`ALTER TABLE "gambar_benefit" RENAME TO "image_benefit"`);
    await queryRunner.query(`ALTER TABLE "kategori" RENAME TO "category"`);
    await queryRunner.query(`ALTER TABLE "jenis_kelas" RENAME TO "course_type"`);
    await queryRunner.query(`ALTER TABLE "kelas" RENAME TO "course"`);
    await queryRunner.query(`ALTER TABLE "alur_kelas" RENAME TO "course_flow"`);
    await queryRunner.query(`ALTER TABLE "benefit_kelas" RENAME TO "program_benefits"`);
    await queryRunner.query(`ALTER TABLE "pertanyaan_umum" RENAME TO "faqs"`);
    await queryRunner.query(`ALTER TABLE "mentor" RENAME TO "mentors"`);
    await queryRunner.query(`ALTER TABLE "cicilan" RENAME TO "installment"`);
    await queryRunner.query(`ALTER TABLE "pembayaran" RENAME TO "payments"`);
    await queryRunner.query(`ALTER TABLE "pendaftaran" RENAME TO "registrations"`);
    await queryRunner.query(`ALTER TABLE "minggu" RENAME TO "weeks"`);
    await queryRunner.query(`ALTER TABLE "pertemuan" RENAME TO "session"`);
    await queryRunner.query(`ALTER TABLE "absen" RENAME TO "attendance"`);
    await queryRunner.query(`ALTER TABLE "materi" RENAME TO "material"`);
    await queryRunner.query(`ALTER TABLE "tugas" RENAME TO "assignments"`);
    await queryRunner.query(`ALTER TABLE "jawaban_tugas" RENAME TO "answer_task"`);
    await queryRunner.query(`ALTER TABLE "komentar" RENAME TO "comments"`);
    await queryRunner.query(`ALTER TABLE "pertanyaan" RENAME TO "questions"`);
    await queryRunner.query(`ALTER TABLE "jawaban" RENAME TO "answers"`);
    await queryRunner.query(`ALTER TABLE "jawaban_user" RENAME TO "user_answers"`);
    await queryRunner.query(`ALTER TABLE "nilai" RENAME TO "scores"`);
    await queryRunner.query(`ALTER TABLE "progres_quiz" RENAME TO "quiz_progresses"`);
    await queryRunner.query(`ALTER TABLE "progres_minggu" RENAME TO "week_progresses"`);
    await queryRunner.query(`ALTER TABLE "progres_pertemuan" RENAME TO "session_progresses"`);
    await queryRunner.query(`ALTER TABLE "biodata_mentor" RENAME TO "mentor_biodata"`);
    await queryRunner.query(`ALTER TABLE "portfolio" RENAME TO "portofolios"`);

    // Join table ManyToMany Category<->CourseType (default @JoinTable baru)
    await queryRunner.query(
      `ALTER TABLE "kategori_jenis_kelas_jenis_kelas" RENAME TO "category_course_types_course_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_course_types_course_type" RENAME COLUMN "kategoriId" TO "categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_course_types_course_type" RENAME COLUMN "jenisKelasId" TO "courseTypeId"`,
    );

    // ================= 2. RENAME KOLOM =================
    // visions (ex "visi")
    await queryRunner.query(`ALTER TABLE "visions" RENAME COLUMN "visi" TO "visions"`);

    // mission (ex "misi")
    await queryRunner.query(`ALTER TABLE "mission" RENAME COLUMN "misi_ke" TO "mission_order"`);
    await queryRunner.query(`ALTER TABLE "mission" RENAME COLUMN "isi" TO "items"`);

    // about (ex "tentang")
    await queryRunner.query(`ALTER TABLE "about" RENAME COLUMN "judul" TO "title"`);
    await queryRunner.query(`ALTER TABLE "about" RENAME COLUMN "gambar" TO "image"`);

    // paragraph (ex "paragraf") — kolom "paragraf" dipertahankan entity
    await queryRunner.query(`ALTER TABLE "paragraph" RENAME COLUMN "p_ke" TO "paragraphOrder"`);

    // image_benefit (ex "gambar_benefit")
    await queryRunner.query(`ALTER TABLE "image_benefit" RENAME COLUMN "gambar" TO "image"`);

    // value
    await queryRunner.query(`ALTER TABLE "value" RENAME COLUMN "value_ke" TO "valueOrder"`);

    // team
    await queryRunner.query(`ALTER TABLE "team" RENAME COLUMN "team_ke" TO "teamOrder"`);

    // info
    await queryRunner.query(`ALTER TABLE "info" RENAME COLUMN "judul" TO "title"`);

    // header
    await queryRunner.query(`ALTER TABLE "header" RENAME COLUMN "judul" TO "title"`);
    await queryRunner.query(`ALTER TABLE "header" RENAME COLUMN "gambar" TO "image"`);

    // benefit
    await queryRunner.query(`ALTER TABLE "benefit" RENAME COLUMN "judul" TO "title"`);
    await queryRunner.query(`ALTER TABLE "benefit" RENAME COLUMN "text" TO "description"`);

    // experience
    await queryRunner.query(`ALTER TABLE "experience" RENAME COLUMN "isi" TO "details"`);
    await queryRunner.query(`ALTER TABLE "experience" RENAME COLUMN "experience_ke" TO "experience_order"`);

    // commitment
    await queryRunner.query(`ALTER TABLE "commitment" RENAME COLUMN "judul" TO "title"`);
    await queryRunner.query(`ALTER TABLE "commitment" RENAME COLUMN "deskripsi" TO "description"`);
    await queryRunner.query(`ALTER TABLE "commitment" RENAME COLUMN "commitment_ke" TO "commitment_order"`);

    // background
    await queryRunner.query(`ALTER TABLE "background" RENAME COLUMN "isi" TO "details"`);
    await queryRunner.query(`ALTER TABLE "background" RENAME COLUMN "background_ke" TO "background_order"`);

    // award
    await queryRunner.query(`ALTER TABLE "award" RENAME COLUMN "isi" TO "details"`);
    await queryRunner.query(`ALTER TABLE "award" RENAME COLUMN "award_ke" TO "award_order"`);

    // category (ex "kategori")
    await queryRunner.query(`ALTER TABLE "category" RENAME COLUMN "nama_kategori" TO "name"`);
    await queryRunner.query(`ALTER TABLE "category" RENAME COLUMN "deskripsi" TO "description"`);

    // course_type (ex "jenis_kelas") — "name_clasess_type" mengikuti nama properti di entity
    await queryRunner.query(`ALTER TABLE "course_type" RENAME COLUMN "nama_jenis_kelas" TO "name_clasess_type"`);
    await queryRunner.query(`ALTER TABLE "course_type" RENAME COLUMN "deskripsi" TO "description"`);

    // course (ex "kelas")
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "nama_kelas" TO "name"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "deskripsi" TO "description"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "grup" TO "group"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "gambar" TO "image"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "harga" TO "price"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "link_lokasi" TO "locationLink"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "lokasi" TO "locations"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "metode" TO "method"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "kriteria_id" TO "criteriaId"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "kriteria_en" TO "criteriaEn"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "kriteria_ja" TO "criteriaJa"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "proses" TO "process"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "materi_id" TO "materialsId"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "materi_en" TO "materialsEn"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "materi_ja" TO "materialsJa"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "target_pembelajaran_id" TO "learningTargets_id"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "target_pembelajaran_en" TO "learningTargets_en"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "target_pembelajaran_ja" TO "learningTargets_ja"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "kuota" TO "quota"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "bulan" TO "month"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "hari" TO "day"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "tanggal_mulai" TO "startDate"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "tanggal_selesai" TO "startEnd"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "kategoriId" TO "categoryId"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "jenis_kelasId" TO "courseTypeId"`);

    // course_flow (ex "alur_kelas")
    await queryRunner.query(`ALTER TABLE "course_flow" RENAME COLUMN "alur_ke" TO "sequence"`);
    await queryRunner.query(`ALTER TABLE "course_flow" RENAME COLUMN "judul" TO "title"`);
    await queryRunner.query(`ALTER TABLE "course_flow" RENAME COLUMN "isi" TO "content"`);
    await queryRunner.query(`ALTER TABLE "course_flow" RENAME COLUMN "kelasId" TO "courseId"`);

    // program_benefits (ex "benefit_kelas")
    await queryRunner.query(`ALTER TABLE "program_benefits" RENAME COLUMN "isi" TO "description"`);
    await queryRunner.query(`ALTER TABLE "program_benefits" RENAME COLUMN "kelasId" TO "courseId"`);

    // faqs (ex "pertanyaan_umum")
    await queryRunner.query(`ALTER TABLE "faqs" RENAME COLUMN "pertanyaan" TO "question"`);
    await queryRunner.query(`ALTER TABLE "faqs" RENAME COLUMN "jawaban" TO "answer"`);
    await queryRunner.query(`ALTER TABLE "faqs" RENAME COLUMN "kategoriId" TO "categoryId"`);

    // alumni
    await queryRunner.query(`ALTER TABLE "alumni" RENAME COLUMN "nama" TO "name"`);
    await queryRunner.query(`ALTER TABLE "alumni" RENAME COLUMN "pesan" TO "message"`);
    await queryRunner.query(`ALTER TABLE "alumni" RENAME COLUMN "alumni" TO "program"`);
    await queryRunner.query(`ALTER TABLE "alumni" RENAME COLUMN "posisi_sekarang" TO "currentPosition"`);
    await queryRunner.query(`ALTER TABLE "alumni" RENAME COLUMN "kelasId" TO "courseId"`);

    // installment (ex "cicilan")
    await queryRunner.query(`ALTER TABLE "installment" RENAME COLUMN "dp" TO "down_payment"`);
    await queryRunner.query(`ALTER TABLE "installment" RENAME COLUMN "harga" TO "price"`);
    await queryRunner.query(`ALTER TABLE "installment" RENAME COLUMN "bulan" TO "month"`);
    await queryRunner.query(`ALTER TABLE "installment" RENAME COLUMN "kelasId" TO "courseId"`);

    // payments (ex "pembayaran")
    await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "proses" TO "process"`);
    await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "kelasId" TO "courseId"`);
    await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "cicilanId" TO "installmentId"`);

    // registrations (ex "pendaftaran")
    await queryRunner.query(`ALTER TABLE "registrations" RENAME COLUMN "proses" TO "process"`);
    await queryRunner.query(`ALTER TABLE "registrations" RENAME COLUMN "kelasId" TO "courseId"`);

    // user_kelas — nama tabel dipertahankan entity, tapi FK berubah
    await queryRunner.query(`ALTER TABLE "user_kelas" RENAME COLUMN "kelasId" TO "courseId"`);

    // session (ex "pertemuan") — kolom lain dipertahankan entity via @Column({name})
    await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "pertemuan_ke" TO "sessionOrder"`);
    await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "mingguId" TO "weeksId"`);

    // attendance (ex "absen")
    await queryRunner.query(`ALTER TABLE "attendance" RENAME COLUMN "waktu_absen" TO "attendance_time"`);
    await queryRunner.query(`ALTER TABLE "attendance" RENAME COLUMN "keterangan" TO "notes"`);
    await queryRunner.query(`ALTER TABLE "attendance" RENAME COLUMN "pertemuanId" TO "sessionId"`);

    // material (ex "materi")
    await queryRunner.query(`ALTER TABLE "material" RENAME COLUMN "judul" TO "title"`);
    await queryRunner.query(`ALTER TABLE "material" RENAME COLUMN "jenis_file" TO "fileType"`);
    await queryRunner.query(`ALTER TABLE "material" RENAME COLUMN "pertemuanId" TO "sessionId"`);

    // assignments (ex "tugas")
    await queryRunner.query(`ALTER TABLE "assignments" RENAME COLUMN "judul" TO "title"`);
    await queryRunner.query(`ALTER TABLE "assignments" RENAME COLUMN "pertemuanId" TO "sessionId"`);

    // answer_task (ex "jawaban_tugas")
    await queryRunner.query(`ALTER TABLE "answer_task" RENAME COLUMN "proses" TO "process"`);
    await queryRunner.query(`ALTER TABLE "answer_task" RENAME COLUMN "tugasId" TO "taskId"`);

    // questions (ex "pertanyaan")
    await queryRunner.query(`ALTER TABLE "questions" RENAME COLUMN "pertanyaan_soal" TO "questionText"`);
    await queryRunner.query(`ALTER TABLE "questions" RENAME COLUMN "gambar" TO "image"`);

    // answers (ex "jawaban")
    await queryRunner.query(`ALTER TABLE "answers" RENAME COLUMN "jawaban" TO "answer"`);
    await queryRunner.query(`ALTER TABLE "answers" RENAME COLUMN "jawaban_benar" TO "isCorrect"`);

    // scores (ex "nilai")
    await queryRunner.query(`ALTER TABLE "scores" RENAME COLUMN "nilai" TO "score"`);

    // quiz
    await queryRunner.query(`ALTER TABLE "quiz" RENAME COLUMN "mingguId" TO "weeksId"`);

    // quiz_progresses (ex "progres_quiz")
    await queryRunner.query(`ALTER TABLE "quiz_progresses" RENAME COLUMN "proses" TO "process"`);

    // week_progresses (ex "progres_minggu")
    await queryRunner.query(`ALTER TABLE "week_progresses" RENAME COLUMN "proses" TO "process"`);
    await queryRunner.query(`ALTER TABLE "week_progresses" RENAME COLUMN "mingguId" TO "weekId"`);

    // session_progresses (ex "progres_pertemuan")
    await queryRunner.query(`ALTER TABLE "session_progresses" RENAME COLUMN "absen" TO "isAttended"`);
    await queryRunner.query(`ALTER TABLE "session_progresses" RENAME COLUMN "pertemuanId" TO "sessionId"`);

    // logbook — kolom lain dipertahankan entity via @Column({name})
    await queryRunner.query(`ALTER TABLE "logbook" RENAME COLUMN "proses" TO "process"`);
    await queryRunner.query(`ALTER TABLE "logbook" RENAME COLUMN "pertemuanId" TO "sessionId"`);

    // logbook_mentor
    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME COLUMN "kegiatan" TO "activity"`);
    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME COLUMN "rincian_kegiatan" TO "activity_detail"`);
    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME COLUMN "dokumentasi" TO "documentation"`);
    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME COLUMN "kendala" TO "obstacle"`);
    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME COLUMN "pertemuanId" TO "sessionId"`);

    // biodata
    await queryRunner.query(`ALTER TABLE "biodata" RENAME COLUMN "nama_lengkap" TO "full_name"`);
    await queryRunner.query(`ALTER TABLE "biodata" RENAME COLUMN "jenis_kelamin" TO "gender"`);
    await queryRunner.query(`ALTER TABLE "biodata" RENAME COLUMN "kota" TO "city"`);
    await queryRunner.query(`ALTER TABLE "biodata" RENAME COLUMN "pendidikan" TO "education"`);
    await queryRunner.query(`ALTER TABLE "biodata" RENAME COLUMN "program_studi" TO "study_program"`);

    // user
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "verifikasiToken" TO "verificationToken"`);
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "verifikasiTokenExpires" TO "verificationTokenExpires"`);

    // ================= 3. RENAME TIPE ENUM =================
    // Nama tipe enum mengikuti pola TypeORM: {tabel}_{kolom}_enum
    await queryRunner.query(`ALTER TYPE "public"."materi_jenis_file_enum" RENAME TO "material_filetype_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."jawaban_tugas_proses_enum" RENAME TO "answer_task_process_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."cicilan_bulan_enum" RENAME TO "installment_month_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."pembayaran_proses_enum" RENAME TO "payments_process_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."pendaftaran_proses_enum" RENAME TO "registrations_process_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."kelas_metode_enum" RENAME TO "course_method_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."kelas_proses_enum" RENAME TO "course_process_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."logbook_proses_enum" RENAME TO "logbook_process_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."absen_status_enum" RENAME TO "attendance_status_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."gambar_benefit_no_enum" RENAME TO "image_benefit_no_enum"`);

    // ================= 4. UBAH NILAI ENUM category.type =================
    // ('Special Program','Program') -> ('Special Program','Paid Program','Free Program')
    // Data 'Program' dipetakan ke 'Paid Program'.
    await queryRunner.query(`ALTER TYPE "public"."kategori_type_enum" RENAME TO "kategori_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."category_type_enum" AS ENUM('Special Program', 'Paid Program', 'Free Program')`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "type" TYPE "public"."category_type_enum"
       USING (CASE WHEN "type"::text = 'Program' THEN 'Paid Program' ELSE "type"::text END)::"public"."category_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."kategori_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ================= 4. KEMBALIKAN NILAI ENUM category.type =================
    await queryRunner.query(`ALTER TYPE "public"."category_type_enum" RENAME TO "category_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."kategori_type_enum" AS ENUM('Special Program', 'Program')`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "type" TYPE "public"."kategori_type_enum"
       USING (CASE WHEN "type"::text IN ('Paid Program', 'Free Program') THEN 'Program' ELSE "type"::text END)::"public"."kategori_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."category_type_enum_old"`);

    // ================= 3. KEMBALIKAN TIPE ENUM =================
    await queryRunner.query(`ALTER TYPE "public"."image_benefit_no_enum" RENAME TO "gambar_benefit_no_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."attendance_status_enum" RENAME TO "absen_status_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."logbook_process_enum" RENAME TO "logbook_proses_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."course_process_enum" RENAME TO "kelas_proses_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."course_method_enum" RENAME TO "kelas_metode_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."registrations_process_enum" RENAME TO "pendaftaran_proses_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."payments_process_enum" RENAME TO "pembayaran_proses_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."installment_month_enum" RENAME TO "cicilan_bulan_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."answer_task_process_enum" RENAME TO "jawaban_tugas_proses_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."material_filetype_enum" RENAME TO "materi_jenis_file_enum"`);

    // ================= 2. KEMBALIKAN KOLOM =================
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "verificationTokenExpires" TO "verifikasiTokenExpires"`);
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "verificationToken" TO "verifikasiToken"`);

    await queryRunner.query(`ALTER TABLE "biodata" RENAME COLUMN "study_program" TO "program_studi"`);
    await queryRunner.query(`ALTER TABLE "biodata" RENAME COLUMN "education" TO "pendidikan"`);
    await queryRunner.query(`ALTER TABLE "biodata" RENAME COLUMN "city" TO "kota"`);
    await queryRunner.query(`ALTER TABLE "biodata" RENAME COLUMN "gender" TO "jenis_kelamin"`);
    await queryRunner.query(`ALTER TABLE "biodata" RENAME COLUMN "full_name" TO "nama_lengkap"`);

    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME COLUMN "sessionId" TO "pertemuanId"`);
    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME COLUMN "obstacle" TO "kendala"`);
    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME COLUMN "documentation" TO "dokumentasi"`);
    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME COLUMN "activity_detail" TO "rincian_kegiatan"`);
    await queryRunner.query(`ALTER TABLE "logbook_mentor" RENAME COLUMN "activity" TO "kegiatan"`);

    await queryRunner.query(`ALTER TABLE "logbook" RENAME COLUMN "sessionId" TO "pertemuanId"`);
    await queryRunner.query(`ALTER TABLE "logbook" RENAME COLUMN "process" TO "proses"`);

    await queryRunner.query(`ALTER TABLE "session_progresses" RENAME COLUMN "sessionId" TO "pertemuanId"`);
    await queryRunner.query(`ALTER TABLE "session_progresses" RENAME COLUMN "isAttended" TO "absen"`);

    await queryRunner.query(`ALTER TABLE "week_progresses" RENAME COLUMN "weekId" TO "mingguId"`);
    await queryRunner.query(`ALTER TABLE "week_progresses" RENAME COLUMN "process" TO "proses"`);

    await queryRunner.query(`ALTER TABLE "quiz_progresses" RENAME COLUMN "process" TO "proses"`);

    await queryRunner.query(`ALTER TABLE "quiz" RENAME COLUMN "weeksId" TO "mingguId"`);

    await queryRunner.query(`ALTER TABLE "scores" RENAME COLUMN "score" TO "nilai"`);

    await queryRunner.query(`ALTER TABLE "answers" RENAME COLUMN "isCorrect" TO "jawaban_benar"`);
    await queryRunner.query(`ALTER TABLE "answers" RENAME COLUMN "answer" TO "jawaban"`);

    await queryRunner.query(`ALTER TABLE "questions" RENAME COLUMN "image" TO "gambar"`);
    await queryRunner.query(`ALTER TABLE "questions" RENAME COLUMN "questionText" TO "pertanyaan_soal"`);

    await queryRunner.query(`ALTER TABLE "answer_task" RENAME COLUMN "taskId" TO "tugasId"`);
    await queryRunner.query(`ALTER TABLE "answer_task" RENAME COLUMN "process" TO "proses"`);

    await queryRunner.query(`ALTER TABLE "assignments" RENAME COLUMN "sessionId" TO "pertemuanId"`);
    await queryRunner.query(`ALTER TABLE "assignments" RENAME COLUMN "title" TO "judul"`);

    await queryRunner.query(`ALTER TABLE "material" RENAME COLUMN "sessionId" TO "pertemuanId"`);
    await queryRunner.query(`ALTER TABLE "material" RENAME COLUMN "fileType" TO "jenis_file"`);
    await queryRunner.query(`ALTER TABLE "material" RENAME COLUMN "title" TO "judul"`);

    await queryRunner.query(`ALTER TABLE "attendance" RENAME COLUMN "sessionId" TO "pertemuanId"`);
    await queryRunner.query(`ALTER TABLE "attendance" RENAME COLUMN "notes" TO "keterangan"`);
    await queryRunner.query(`ALTER TABLE "attendance" RENAME COLUMN "attendance_time" TO "waktu_absen"`);

    await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "weeksId" TO "mingguId"`);
    await queryRunner.query(`ALTER TABLE "session" RENAME COLUMN "sessionOrder" TO "pertemuan_ke"`);

    await queryRunner.query(`ALTER TABLE "user_kelas" RENAME COLUMN "courseId" TO "kelasId"`);

    await queryRunner.query(`ALTER TABLE "registrations" RENAME COLUMN "courseId" TO "kelasId"`);
    await queryRunner.query(`ALTER TABLE "registrations" RENAME COLUMN "process" TO "proses"`);

    await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "installmentId" TO "cicilanId"`);
    await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "courseId" TO "kelasId"`);
    await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "process" TO "proses"`);

    await queryRunner.query(`ALTER TABLE "installment" RENAME COLUMN "courseId" TO "kelasId"`);
    await queryRunner.query(`ALTER TABLE "installment" RENAME COLUMN "month" TO "bulan"`);
    await queryRunner.query(`ALTER TABLE "installment" RENAME COLUMN "price" TO "harga"`);
    await queryRunner.query(`ALTER TABLE "installment" RENAME COLUMN "down_payment" TO "dp"`);

    await queryRunner.query(`ALTER TABLE "alumni" RENAME COLUMN "courseId" TO "kelasId"`);
    await queryRunner.query(`ALTER TABLE "alumni" RENAME COLUMN "currentPosition" TO "posisi_sekarang"`);
    await queryRunner.query(`ALTER TABLE "alumni" RENAME COLUMN "program" TO "alumni"`);
    await queryRunner.query(`ALTER TABLE "alumni" RENAME COLUMN "message" TO "pesan"`);
    await queryRunner.query(`ALTER TABLE "alumni" RENAME COLUMN "name" TO "nama"`);

    await queryRunner.query(`ALTER TABLE "faqs" RENAME COLUMN "categoryId" TO "kategoriId"`);
    await queryRunner.query(`ALTER TABLE "faqs" RENAME COLUMN "answer" TO "jawaban"`);
    await queryRunner.query(`ALTER TABLE "faqs" RENAME COLUMN "question" TO "pertanyaan"`);

    await queryRunner.query(`ALTER TABLE "program_benefits" RENAME COLUMN "courseId" TO "kelasId"`);
    await queryRunner.query(`ALTER TABLE "program_benefits" RENAME COLUMN "description" TO "isi"`);

    await queryRunner.query(`ALTER TABLE "course_flow" RENAME COLUMN "courseId" TO "kelasId"`);
    await queryRunner.query(`ALTER TABLE "course_flow" RENAME COLUMN "content" TO "isi"`);
    await queryRunner.query(`ALTER TABLE "course_flow" RENAME COLUMN "title" TO "judul"`);
    await queryRunner.query(`ALTER TABLE "course_flow" RENAME COLUMN "sequence" TO "alur_ke"`);

    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "courseTypeId" TO "jenis_kelasId"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "categoryId" TO "kategoriId"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "startEnd" TO "tanggal_selesai"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "startDate" TO "tanggal_mulai"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "day" TO "hari"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "month" TO "bulan"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "quota" TO "kuota"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "learningTargets_ja" TO "target_pembelajaran_ja"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "learningTargets_en" TO "target_pembelajaran_en"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "learningTargets_id" TO "target_pembelajaran_id"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "materialsJa" TO "materi_ja"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "materialsEn" TO "materi_en"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "materialsId" TO "materi_id"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "process" TO "proses"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "criteriaJa" TO "kriteria_ja"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "criteriaEn" TO "kriteria_en"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "criteriaId" TO "kriteria_id"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "method" TO "metode"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "locations" TO "lokasi"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "locationLink" TO "link_lokasi"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "price" TO "harga"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "image" TO "gambar"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "group" TO "grup"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "description" TO "deskripsi"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME COLUMN "name" TO "nama_kelas"`);

    await queryRunner.query(`ALTER TABLE "course_type" RENAME COLUMN "description" TO "deskripsi"`);
    await queryRunner.query(`ALTER TABLE "course_type" RENAME COLUMN "name_clasess_type" TO "nama_jenis_kelas"`);

    await queryRunner.query(`ALTER TABLE "category" RENAME COLUMN "description" TO "deskripsi"`);
    await queryRunner.query(`ALTER TABLE "category" RENAME COLUMN "name" TO "nama_kategori"`);

    await queryRunner.query(`ALTER TABLE "award" RENAME COLUMN "award_order" TO "award_ke"`);
    await queryRunner.query(`ALTER TABLE "award" RENAME COLUMN "details" TO "isi"`);

    await queryRunner.query(`ALTER TABLE "background" RENAME COLUMN "background_order" TO "background_ke"`);
    await queryRunner.query(`ALTER TABLE "background" RENAME COLUMN "details" TO "isi"`);

    await queryRunner.query(`ALTER TABLE "commitment" RENAME COLUMN "commitment_order" TO "commitment_ke"`);
    await queryRunner.query(`ALTER TABLE "commitment" RENAME COLUMN "description" TO "deskripsi"`);
    await queryRunner.query(`ALTER TABLE "commitment" RENAME COLUMN "title" TO "judul"`);

    await queryRunner.query(`ALTER TABLE "experience" RENAME COLUMN "experience_order" TO "experience_ke"`);
    await queryRunner.query(`ALTER TABLE "experience" RENAME COLUMN "details" TO "isi"`);

    await queryRunner.query(`ALTER TABLE "benefit" RENAME COLUMN "description" TO "text"`);
    await queryRunner.query(`ALTER TABLE "benefit" RENAME COLUMN "title" TO "judul"`);

    await queryRunner.query(`ALTER TABLE "header" RENAME COLUMN "image" TO "gambar"`);
    await queryRunner.query(`ALTER TABLE "header" RENAME COLUMN "title" TO "judul"`);

    await queryRunner.query(`ALTER TABLE "info" RENAME COLUMN "title" TO "judul"`);

    await queryRunner.query(`ALTER TABLE "team" RENAME COLUMN "teamOrder" TO "team_ke"`);

    await queryRunner.query(`ALTER TABLE "value" RENAME COLUMN "valueOrder" TO "value_ke"`);

    await queryRunner.query(`ALTER TABLE "image_benefit" RENAME COLUMN "image" TO "gambar"`);

    await queryRunner.query(`ALTER TABLE "paragraph" RENAME COLUMN "paragraphOrder" TO "p_ke"`);

    await queryRunner.query(`ALTER TABLE "about" RENAME COLUMN "image" TO "gambar"`);
    await queryRunner.query(`ALTER TABLE "about" RENAME COLUMN "title" TO "judul"`);

    await queryRunner.query(`ALTER TABLE "mission" RENAME COLUMN "items" TO "isi"`);
    await queryRunner.query(`ALTER TABLE "mission" RENAME COLUMN "mission_order" TO "misi_ke"`);

    await queryRunner.query(`ALTER TABLE "visions" RENAME COLUMN "visions" TO "visi"`);

    // ================= 1. KEMBALIKAN NAMA TABEL =================
    await queryRunner.query(
      `ALTER TABLE "category_course_types_course_type" RENAME COLUMN "courseTypeId" TO "jenisKelasId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_course_types_course_type" RENAME COLUMN "categoryId" TO "kategoriId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_course_types_course_type" RENAME TO "kategori_jenis_kelas_jenis_kelas"`,
    );

    await queryRunner.query(`ALTER TABLE "portofolios" RENAME TO "portfolio"`);
    await queryRunner.query(`ALTER TABLE "mentor_biodata" RENAME TO "biodata_mentor"`);
    await queryRunner.query(`ALTER TABLE "session_progresses" RENAME TO "progres_pertemuan"`);
    await queryRunner.query(`ALTER TABLE "week_progresses" RENAME TO "progres_minggu"`);
    await queryRunner.query(`ALTER TABLE "quiz_progresses" RENAME TO "progres_quiz"`);
    await queryRunner.query(`ALTER TABLE "scores" RENAME TO "nilai"`);
    await queryRunner.query(`ALTER TABLE "user_answers" RENAME TO "jawaban_user"`);
    await queryRunner.query(`ALTER TABLE "answers" RENAME TO "jawaban"`);
    await queryRunner.query(`ALTER TABLE "questions" RENAME TO "pertanyaan"`);
    await queryRunner.query(`ALTER TABLE "comments" RENAME TO "komentar"`);
    await queryRunner.query(`ALTER TABLE "answer_task" RENAME TO "jawaban_tugas"`);
    await queryRunner.query(`ALTER TABLE "assignments" RENAME TO "tugas"`);
    await queryRunner.query(`ALTER TABLE "material" RENAME TO "materi"`);
    await queryRunner.query(`ALTER TABLE "attendance" RENAME TO "absen"`);
    await queryRunner.query(`ALTER TABLE "session" RENAME TO "pertemuan"`);
    await queryRunner.query(`ALTER TABLE "weeks" RENAME TO "minggu"`);
    await queryRunner.query(`ALTER TABLE "registrations" RENAME TO "pendaftaran"`);
    await queryRunner.query(`ALTER TABLE "payments" RENAME TO "pembayaran"`);
    await queryRunner.query(`ALTER TABLE "installment" RENAME TO "cicilan"`);
    await queryRunner.query(`ALTER TABLE "mentors" RENAME TO "mentor"`);
    await queryRunner.query(`ALTER TABLE "faqs" RENAME TO "pertanyaan_umum"`);
    await queryRunner.query(`ALTER TABLE "program_benefits" RENAME TO "benefit_kelas"`);
    await queryRunner.query(`ALTER TABLE "course_flow" RENAME TO "alur_kelas"`);
    await queryRunner.query(`ALTER TABLE "course" RENAME TO "kelas"`);
    await queryRunner.query(`ALTER TABLE "course_type" RENAME TO "jenis_kelas"`);
    await queryRunner.query(`ALTER TABLE "category" RENAME TO "kategori"`);
    await queryRunner.query(`ALTER TABLE "image_benefit" RENAME TO "gambar_benefit"`);
    await queryRunner.query(`ALTER TABLE "collaborations" RENAME TO "kerja_sama"`);
    await queryRunner.query(`ALTER TABLE "paragraph" RENAME TO "paragraf"`);
    await queryRunner.query(`ALTER TABLE "about" RENAME TO "tentang"`);
    await queryRunner.query(`ALTER TABLE "mission" RENAME TO "misi"`);
    await queryRunner.query(`ALTER TABLE "visions" RENAME TO "visi"`);
  }
}
