import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Menyamakan skema `e-learning-server` (penamaan Bahasa Indonesia, 76 tabel)
 * dengan `e-learning-migration` (penamaan Bahasa Inggris, 71 tabel).
 *
 * Disusun dari introspeksi langsung information_schema + pg_catalog pada
 * kedua database, dan sudah diuji pada clone `e-learning-server-test`:
 * 71/71 tabel, 521/521 kolom, dan 66/66 foreign key cocok dengan target.
 *
 * URUTAN PENTING
 * Tabel `session` lama (session store: sid/sess/expire) menjadi
 * `web_sessions`, sedangkan `pertemuan` justru menjadi `session`.
 * Karena itu rename `session` harus dijalankan lebih dulu di up(), dan
 * paling akhir di down(). Jangan mengubah urutannya.
 *
 * KEPUTUSAN DATA
 * - installment.month : baris 6/12 bulan diratakan ke 3 termin dengan
 *   total yang sama persis. Tidak bisa dibalik oleh down().
 * - category.type     : 'Program' menjadi 'Paid Program'.
 * - partner           : 4 kategori awal di-seed; nama-namanya bebas
 *   diubah super_admin lewat aplikasi setelah migrasi.
 *
 * TIDAK BISA DIPULIHKAN OLEH down()
 * 11 tabel lama (blog, coment, reply, like, likes, kategori_blog, topic,
 * staging_proses, translation, pertanyaan_program, type_program_category)
 * dihapus di up(). down() hanya membangun ulang strukturnya, bukan isinya.
 * Backup dulu sebelum menjalankan up():
 *   pg_dump -h localhost -U postgres -d e-learning-server -Fc -f backup.dump
 */
export class RefactorDatabaseServer1788100000000 implements MigrationInterface {
  name = 'RefactorDatabaseServer1788100000000';

  public async up(q: QueryRunner): Promise<void> {
    // ======================================================================
    //  BAGIAN -1  Penjaga idempoten
    //
    //  Migrasi ini mengubah skema penamaan Indonesia (`e-learning-server`)
    //  menjadi penamaan Inggris. Database yang SUDAH berbentuk final -
    //  `e-learning-new` di lokal, atau server yang sudah pernah dimigrasi -
    //  tidak punya tabel `pertemuan`, sehingga `ALTER TABLE "pertemuan"
    //  RENAME TO "session"` di BAGIAN 1 akan langsung gagal dan memblokir
    //  seluruh antrean migrasi berikutnya.
    //
    //  Penjaga ini membuat migrasi menjadi no-op di database semacam itu,
    //  sehingga `migration:run` bisa dijalankan di environment mana pun
    //  tanpa perlu menyisipkan baris ke tabel `migrations` secara manual.
    // ======================================================================
    const [probe] = await q.query(
      `SELECT to_regclass('public.pertemuan') IS NOT NULL AS needs_refactor`,
    );
    if (!probe.needs_refactor) {
      // Skema sudah berbentuk target: tidak ada yang perlu diubah.
      return;
    }

    // Penanda bahwa up() BENAR-BENAR mengerjakan refactor di database ini.
    // Dibutuhkan oleh down(): sesudah up() berjalan, tabel `pertemuan` sudah
    // di-rename menjadi `session`, sehingga ketiadaan `pertemuan` TIDAK bisa
    // lagi membedakan "up() sudah jalan" dari "up() tadi no-op".
    await q.query(
      `CREATE TABLE IF NOT EXISTS "_refactor_server_applied" ("applied_at" timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(`INSERT INTO "_refactor_server_applied" DEFAULT VALUES`);

    // ======================================================================
    //  BAGIAN 0  Prasyarat
    // ======================================================================
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ======================================================================
    //  BAGIAN 1  Rename tabel (41)
    //  session -> web_sessions WAJIB duluan: pertemuan akan memakai nama
    //  `session`, jadi kalau terbalik terjadi tabrakan nama.
    // ======================================================================
    await q.query(`ALTER TABLE "session" RENAME TO "web_sessions"`);
    await q.query(`ALTER TABLE "pertemuan" RENAME TO "session"`);
    await q.query(`ALTER TABLE "absen" RENAME TO "attendance"`);
    await q.query(`ALTER TABLE "alur_kelas" RENAME TO "course_flow"`);
    await q.query(`ALTER TABLE "benefit_kelas" RENAME TO "program_benefits"`);
    await q.query(`ALTER TABLE "biodata_mentor" RENAME TO "mentor_biodata"`);
    await q.query(`ALTER TABLE "cicilan" RENAME TO "installment"`);
    await q.query(`ALTER TABLE "gambar_benefit" RENAME TO "image_benefit"`);
    await q.query(`ALTER TABLE "jawaban" RENAME TO "answers"`);
    await q.query(`ALTER TABLE "jawaban_tugas" RENAME TO "answer_task"`);
    await q.query(`ALTER TABLE "jawaban_user" RENAME TO "user_answers"`);
    await q.query(`ALTER TABLE "jenis_kelas" RENAME TO "course_type"`);
    await q.query(`ALTER TABLE "kategori" RENAME TO "category"`);
    await q.query(
      `ALTER TABLE "kategori_jenis_kelas_jenis_kelas" RENAME TO "category_course_types"`,
    );
    await q.query(`ALTER TABLE "kelas" RENAME TO "course"`);
    await q.query(
      `ALTER TABLE "kelas_teknologi" RENAME TO "course_technologies"`,
    );
    await q.query(`ALTER TABLE "kerja_sama" RENAME TO "partner"`);
    await q.query(`ALTER TABLE "komentar" RENAME TO "comments"`);
    await q.query(`ALTER TABLE "logbook_mentor" RENAME TO "mentor_logbook"`);
    await q.query(`ALTER TABLE "materi" RENAME TO "material"`);
    await q.query(`ALTER TABLE "mentor" RENAME TO "mentors"`);
    await q.query(
      `ALTER TABLE "mentor_teknologi" RENAME TO "mentor_technologies"`,
    );
    await q.query(`ALTER TABLE "minggu" RENAME TO "weeks"`);
    await q.query(`ALTER TABLE "misi" RENAME TO "mission"`);
    await q.query(`ALTER TABLE "nilai" RENAME TO "scores"`);
    await q.query(`ALTER TABLE "paragraf" RENAME TO "paragraph"`);
    await q.query(`ALTER TABLE "pembayaran" RENAME TO "payments"`);
    await q.query(`ALTER TABLE "pendaftaran" RENAME TO "registrations"`);
    await q.query(`ALTER TABLE "pertanyaan" RENAME TO "questions"`);
    await q.query(
      `ALTER TABLE "pertanyaan_kelas" RENAME TO "course_questions"`,
    );
    await q.query(`ALTER TABLE "pertanyaan_umum" RENAME TO "faqs"`);
    await q.query(`ALTER TABLE "portfolio" RENAME TO "portofolios"`);
    await q.query(`ALTER TABLE "progres_minggu" RENAME TO "week_progresses"`);
    await q.query(
      `ALTER TABLE "progres_pertemuan" RENAME TO "session_progresses"`,
    );
    await q.query(`ALTER TABLE "progres_quiz" RENAME TO "quiz_progresses"`);
    await q.query(`ALTER TABLE "sertifikat" RENAME TO "certificates"`);
    await q.query(`ALTER TABLE "teknologi" RENAME TO "technologies"`);
    await q.query(`ALTER TABLE "tentang" RENAME TO "about"`);
    await q.query(`ALTER TABLE "tugas" RENAME TO "assignments"`);
    await q.query(`ALTER TABLE "user_kelas" RENAME TO "user_courses"`);
    await q.query(`ALTER TABLE "visi" RENAME TO "visions"`);

    // ======================================================================
    //  BAGIAN 2  Rename kolom (180) - memakai nama tabel BARU
    // ======================================================================

    // absen -> attendance
    await q.query(
      `ALTER TABLE "attendance" RENAME COLUMN "waktu_absen" TO "attendanceTime"`,
    );
    await q.query(
      `ALTER TABLE "attendance" RENAME COLUMN "keterangan" TO "notes"`,
    );
    await q.query(
      `ALTER TABLE "attendance" RENAME COLUMN "pertemuanId" TO "sessionId"`,
    );

    // alumni -> alumni
    await q.query(`ALTER TABLE "alumni" RENAME COLUMN "kelasId" TO "courseId"`);
    await q.query(`ALTER TABLE "alumni" RENAME COLUMN "nama" TO "name"`);
    await q.query(`ALTER TABLE "alumni" RENAME COLUMN "pesan" TO "message"`);
    await q.query(`ALTER TABLE "alumni" RENAME COLUMN "alumni" TO "program"`);
    await q.query(
      `ALTER TABLE "alumni" RENAME COLUMN "posisi_sekarang" TO "currentPosition"`,
    );

    // alur_kelas -> course_flow
    await q.query(
      `ALTER TABLE "course_flow" RENAME COLUMN "alur_ke" TO "sequence"`,
    );
    await q.query(
      `ALTER TABLE "course_flow" RENAME COLUMN "kelasId" TO "courseId"`,
    );
    await q.query(`ALTER TABLE "course_flow" RENAME COLUMN "judul" TO "title"`);
    await q.query(`ALTER TABLE "course_flow" RENAME COLUMN "isi" TO "content"`);

    // award -> award
    await q.query(
      `ALTER TABLE "award" RENAME COLUMN "award_ke" TO "awardOrder"`,
    );
    await q.query(`ALTER TABLE "award" RENAME COLUMN "isi" TO "details"`);

    // background -> background
    await q.query(
      `ALTER TABLE "background" RENAME COLUMN "background_ke" TO "backgroundOrder"`,
    );
    await q.query(`ALTER TABLE "background" RENAME COLUMN "isi" TO "details"`);

    // benefit -> benefit
    await q.query(`ALTER TABLE "benefit" RENAME COLUMN "judul" TO "title"`);
    await q.query(
      `ALTER TABLE "benefit" RENAME COLUMN "text" TO "description"`,
    );

    // benefit_category -> benefit_category
    await q.query(
      `ALTER TABLE "benefit_category" RENAME COLUMN "kategoriId" TO "categoryId"`,
    );

    // benefit_kelas -> program_benefits
    await q.query(
      `ALTER TABLE "program_benefits" RENAME COLUMN "kelasId" TO "courseId"`,
    );
    await q.query(
      `ALTER TABLE "program_benefits" RENAME COLUMN "isi" TO "description"`,
    );

    // biodata -> biodata
    await q.query(
      `ALTER TABLE "biodata" RENAME COLUMN "nama_lengkap" TO "fullName"`,
    );
    await q.query(
      `ALTER TABLE "biodata" RENAME COLUMN "jenis_kelamin" TO "gender"`,
    );
    await q.query(`ALTER TABLE "biodata" RENAME COLUMN "kota" TO "city"`);
    await q.query(
      `ALTER TABLE "biodata" RENAME COLUMN "pendidikan" TO "education"`,
    );
    await q.query(
      `ALTER TABLE "biodata" RENAME COLUMN "program_studi" TO "studyProgram"`,
    );

    // cicilan -> installment
    await q.query(
      `ALTER TABLE "installment" RENAME COLUMN "dp" TO "downPayment"`,
    );
    await q.query(`ALTER TABLE "installment" RENAME COLUMN "harga" TO "price"`);
    await q.query(`ALTER TABLE "installment" RENAME COLUMN "bulan" TO "month"`);
    await q.query(
      `ALTER TABLE "installment" RENAME COLUMN "kelasId" TO "courseId"`,
    );

    // commitment -> commitment
    await q.query(
      `ALTER TABLE "commitment" RENAME COLUMN "commitment_ke" TO "commitmentOrder"`,
    );
    await q.query(`ALTER TABLE "commitment" RENAME COLUMN "judul" TO "title"`);
    await q.query(
      `ALTER TABLE "commitment" RENAME COLUMN "deskripsi" TO "description"`,
    );

    // experience -> experience
    await q.query(
      `ALTER TABLE "experience" RENAME COLUMN "experience_ke" TO "experienceOrder"`,
    );
    await q.query(`ALTER TABLE "experience" RENAME COLUMN "isi" TO "details"`);

    // flow_category -> flow_category
    await q.query(
      `ALTER TABLE "flow_category" RENAME COLUMN "kategoriId" TO "categoryId"`,
    );

    // gambar_benefit -> image_benefit
    await q.query(
      `ALTER TABLE "image_benefit" RENAME COLUMN "gambar" TO "image"`,
    );

    // header -> header
    await q.query(`ALTER TABLE "header" RENAME COLUMN "judul" TO "title"`);
    await q.query(`ALTER TABLE "header" RENAME COLUMN "gambar" TO "image"`);

    // info -> info
    await q.query(`ALTER TABLE "info" RENAME COLUMN "judul" TO "title"`);

    // jawaban -> answers
    await q.query(`ALTER TABLE "answers" RENAME COLUMN "jawaban" TO "answer"`);
    await q.query(
      `ALTER TABLE "answers" RENAME COLUMN "jawaban_benar" TO "isCorrect"`,
    );
    await q.query(
      `ALTER TABLE "answers" RENAME COLUMN "pertanyaanId" TO "questionId"`,
    );

    // jawaban_tugas -> answer_task
    await q.query(
      `ALTER TABLE "answer_task" RENAME COLUMN "proses" TO "process"`,
    );
    await q.query(
      `ALTER TABLE "answer_task" RENAME COLUMN "tugasId" TO "taskId"`,
    );

    // jawaban_user -> user_answers
    await q.query(
      `ALTER TABLE "user_answers" RENAME COLUMN "pertanyaanId" TO "questionId"`,
    );
    await q.query(
      `ALTER TABLE "user_answers" RENAME COLUMN "jawabanId" TO "answerId"`,
    );

    // jenis_kelas -> course_type
    await q.query(
      `ALTER TABLE "course_type" RENAME COLUMN "deskripsi" TO "description"`,
    );
    await q.query(
      `ALTER TABLE "course_type" RENAME COLUMN "nama_jenis_kelas" TO "nameClassesType"`,
    );

    // kategori -> category
    await q.query(
      `ALTER TABLE "category" RENAME COLUMN "nama_kategori" TO "name"`,
    );
    await q.query(
      `ALTER TABLE "category" RENAME COLUMN "deskripsi" TO "description"`,
    );
    await q.query(`ALTER TABLE "category" RENAME COLUMN "info_id" TO "infoId"`);
    await q.query(`ALTER TABLE "category" RENAME COLUMN "info_en" TO "infoEn"`);
    await q.query(`ALTER TABLE "category" RENAME COLUMN "info_ja" TO "infoJa"`);

    // kategori_jenis_kelas_jenis_kelas -> category_course_types
    await q.query(
      `ALTER TABLE "category_course_types" RENAME COLUMN "kategoriId" TO "categoryId"`,
    );
    await q.query(
      `ALTER TABLE "category_course_types" RENAME COLUMN "jenisKelasId" TO "courseTypeId"`,
    );

    // kelas -> course
    await q.query(`ALTER TABLE "course" RENAME COLUMN "nama_kelas" TO "name"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "grup" TO "group"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "gambar" TO "image"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "harga" TO "price"`);
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "link_lokasi" TO "locationLink"`,
    );
    await q.query(`ALTER TABLE "course" RENAME COLUMN "metode" TO "method"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "proses" TO "process"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "kuota" TO "quota"`);
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "check_paid" TO "checkPaid"`,
    );
    await q.query(`ALTER TABLE "course" RENAME COLUMN "bulan" TO "month"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "hari" TO "day"`);
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "tanggal_mulai" TO "startDate"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "tanggal_selesai" TO "startEnd"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "kategoriId" TO "categoryId"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "jenis_kelasId" TO "courseTypeId"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "kriteria_id" TO "criteriaId"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "kriteria_en" TO "criteriaEn"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "kriteria_ja" TO "criteriaJa"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "materi_id" TO "materialsId"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "materi_en" TO "materialsEn"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "materi_ja" TO "materialsJa"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "target_pembelajaran_id" TO "learningTargetsId"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "target_pembelajaran_en" TO "learningTargetsEn"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "target_pembelajaran_ja" TO "learningTargetsJa"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "deskripsi" TO "description"`,
    );
    await q.query(`ALTER TABLE "course" RENAME COLUMN "lokasi" TO "locations"`);

    // kelas_teknologi -> course_technologies
    await q.query(
      `ALTER TABLE "course_technologies" RENAME COLUMN "kelasId" TO "courseId"`,
    );
    await q.query(
      `ALTER TABLE "course_technologies" RENAME COLUMN "teknologiId" TO "technologyId"`,
    );

    // kerja_sama -> partner
    await q.query(`ALTER TABLE "partner" RENAME COLUMN "gambar" TO "image"`);

    // komentar -> comments
    await q.query(
      `ALTER TABLE "comments" RENAME COLUMN "komentar" TO "comment"`,
    );
    await q.query(
      `ALTER TABLE "comments" RENAME COLUMN "jawaban_tugasId" TO "assignment_answerId"`,
    );

    // logbook -> logbook
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "kegiatan" TO "activity"`,
    );
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "rincian_kegiatan" TO "activity_details"`,
    );
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "dokumentasi" TO "documentation"`,
    );
    await q.query(`ALTER TABLE "logbook" RENAME COLUMN "proses" TO "process"`);
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "kendala" TO "obstacles"`,
    );
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "dokumentasi_lain" TO "other_documentation"`,
    );
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "pertemuanId" TO "sessionId"`,
    );

    // logbook_mentor -> mentor_logbook
    await q.query(
      `ALTER TABLE "mentor_logbook" RENAME COLUMN "kegiatan" TO "activity"`,
    );
    await q.query(
      `ALTER TABLE "mentor_logbook" RENAME COLUMN "rincian_kegiatan" TO "activityDetail"`,
    );
    await q.query(
      `ALTER TABLE "mentor_logbook" RENAME COLUMN "dokumentasi" TO "documentation"`,
    );
    await q.query(
      `ALTER TABLE "mentor_logbook" RENAME COLUMN "kendala" TO "obstacle"`,
    );
    await q.query(
      `ALTER TABLE "mentor_logbook" RENAME COLUMN "pertemuanId" TO "sessionId"`,
    );

    // materi -> material
    await q.query(`ALTER TABLE "material" RENAME COLUMN "judul" TO "title"`);
    await q.query(
      `ALTER TABLE "material" RENAME COLUMN "jenis_file" TO "fileType"`,
    );
    await q.query(
      `ALTER TABLE "material" RENAME COLUMN "pertemuanId" TO "sessionId"`,
    );

    // mentor -> mentors
    await q.query(`ALTER TABLE "mentors" RENAME COLUMN "nama" TO "name"`);
    await q.query(
      `ALTER TABLE "mentors" RENAME COLUMN "kelasId" TO "courseId"`,
    );
    await q.query(`ALTER TABLE "mentors" RENAME COLUMN "posisi" TO "position"`);
    await q.query(
      `ALTER TABLE "mentors" RENAME COLUMN "deskripsi" TO "description"`,
    );

    // mentor_teknologi -> mentor_technologies
    await q.query(
      `ALTER TABLE "mentor_technologies" RENAME COLUMN "teknologiId" TO "technologiesId"`,
    );

    // mentoring -> mentoring
    await q.query(
      `ALTER TABLE "mentoring" RENAME COLUMN "kelasId" TO "courseId"`,
    );

    // minggu -> weeks
    await q.query(
      `ALTER TABLE "weeks" RENAME COLUMN "minggu_ke" TO "week_number"`,
    );
    await q.query(
      `ALTER TABLE "weeks" RENAME COLUMN "keterangan" TO "description"`,
    );
    await q.query(`ALTER TABLE "weeks" RENAME COLUMN "akhir" TO "is_final"`);
    await q.query(`ALTER TABLE "weeks" RENAME COLUMN "kelasId" TO "courseId"`);

    // misi -> mission
    await q.query(
      `ALTER TABLE "mission" RENAME COLUMN "misi_ke" TO "missionOrder"`,
    );
    await q.query(`ALTER TABLE "mission" RENAME COLUMN "isi" TO "items"`);

    // nilai -> scores
    await q.query(`ALTER TABLE "scores" RENAME COLUMN "nilai" TO "score"`);

    // paragraf -> paragraph
    await q.query(
      `ALTER TABLE "paragraph" RENAME COLUMN "p_ke" TO "paragraphOrder"`,
    );
    await q.query(
      `ALTER TABLE "paragraph" RENAME COLUMN "paragraf" TO "paragraphs"`,
    );

    // pembayaran -> payments
    await q.query(`ALTER TABLE "payments" RENAME COLUMN "proses" TO "process"`);
    await q.query(
      `ALTER TABLE "payments" RENAME COLUMN "kelasId" TO "courseId"`,
    );
    await q.query(
      `ALTER TABLE "payments" RENAME COLUMN "cicilanId" TO "installmentId"`,
    );

    // pendaftaran -> registrations
    await q.query(
      `ALTER TABLE "registrations" RENAME COLUMN "proses" TO "process"`,
    );
    await q.query(
      `ALTER TABLE "registrations" RENAME COLUMN "kelasId" TO "courseId"`,
    );

    // pertanyaan -> questions
    await q.query(
      `ALTER TABLE "questions" RENAME COLUMN "pertanyaan_soal" TO "questionText"`,
    );
    await q.query(`ALTER TABLE "questions" RENAME COLUMN "gambar" TO "image"`);

    // pertanyaan_kelas -> course_questions
    await q.query(
      `ALTER TABLE "course_questions" RENAME COLUMN "kelasId" TO "courseId"`,
    );
    await q.query(
      `ALTER TABLE "course_questions" RENAME COLUMN "pertanyaan" TO "question"`,
    );
    await q.query(
      `ALTER TABLE "course_questions" RENAME COLUMN "jawaban" TO "answer"`,
    );

    // pertanyaan_umum -> faqs
    await q.query(
      `ALTER TABLE "faqs" RENAME COLUMN "kategoriId" TO "categoryId"`,
    );
    await q.query(
      `ALTER TABLE "faqs" RENAME COLUMN "pertanyaan" TO "question"`,
    );
    await q.query(`ALTER TABLE "faqs" RENAME COLUMN "jawaban" TO "answer"`);

    // pertemuan -> session
    await q.query(`ALTER TABLE "session" RENAME COLUMN "topik" TO "topic"`);
    await q.query(
      `ALTER TABLE "session" RENAME COLUMN "pertemuan_ke" TO "sessionOrder"`,
    );
    await q.query(`ALTER TABLE "session" RENAME COLUMN "tanggal" TO "date"`);
    await q.query(`ALTER TABLE "session" RENAME COLUMN "lokasi" TO "location"`);
    await q.query(
      `ALTER TABLE "session" RENAME COLUMN "waktu_awal" TO "start_time"`,
    );
    await q.query(
      `ALTER TABLE "session" RENAME COLUMN "waktu_akhir" TO "end_time"`,
    );
    await q.query(`ALTER TABLE "session" RENAME COLUMN "akhir" TO "is_final"`);
    await q.query(
      `ALTER TABLE "session" RENAME COLUMN "mingguId" TO "weeksId"`,
    );

    // portfolio -> portofolios
    await q.query(
      `ALTER TABLE "portofolios" RENAME COLUMN "gambar" TO "image"`,
    );
    await q.query(`ALTER TABLE "portofolios" RENAME COLUMN "judul" TO "title"`);
    await q.query(
      `ALTER TABLE "portofolios" RENAME COLUMN "deskripsi" TO "description"`,
    );
    await q.query(
      `ALTER TABLE "portofolios" RENAME COLUMN "kelasId" TO "courseId"`,
    );
    await q.query(
      `ALTER TABLE "portofolios" RENAME COLUMN "content_html" TO "contentHtml"`,
    );

    // progres_minggu -> week_progresses
    await q.query(
      `ALTER TABLE "week_progresses" RENAME COLUMN "proses" TO "process"`,
    );
    await q.query(
      `ALTER TABLE "week_progresses" RENAME COLUMN "mingguId" TO "weekId"`,
    );

    // progres_pertemuan -> session_progresses
    await q.query(
      `ALTER TABLE "session_progresses" RENAME COLUMN "absen" TO "isAttended"`,
    );
    await q.query(
      `ALTER TABLE "session_progresses" RENAME COLUMN "pertemuanId" TO "sessionId"`,
    );

    // progres_quiz -> quiz_progresses
    await q.query(
      `ALTER TABLE "quiz_progresses" RENAME COLUMN "proses" TO "process"`,
    );

    // quiz -> quiz
    await q.query(
      `ALTER TABLE "quiz" RENAME COLUMN "nama_quiz" TO "quiz_name"`,
    );
    await q.query(
      `ALTER TABLE "quiz" RENAME COLUMN "nilai_minimal" TO "minimum_score"`,
    );
    await q.query(`ALTER TABLE "quiz" RENAME COLUMN "mingguId" TO "weeksId"`);
    await q.query(`ALTER TABLE "quiz" RENAME COLUMN "durasi" TO "duration"`);

    // sertifikat -> certificates
    await q.query(
      `ALTER TABLE "certificates" RENAME COLUMN "sertif" TO "certificate_file"`,
    );
    await q.query(
      `ALTER TABLE "certificates" RENAME COLUMN "kelasId" TO "courseId"`,
    );

    // social -> social
    await q.query(
      `ALTER TABLE "social" RENAME COLUMN "instragram" TO "instagram"`,
    );
    await q.query(`ALTER TABLE "social" RENAME COLUMN "alamat" TO "address"`);
    await q.query(`ALTER TABLE "social" RENAME COLUMN "nomor" TO "number"`);
    await q.query(
      `ALTER TABLE "social" RENAME COLUMN "link_alamat" TO "linkAddress"`,
    );
    await q.query(
      `ALTER TABLE "social" RENAME COLUMN "video_youtube" TO "videoYoutube"`,
    );
    await q.query(
      `ALTER TABLE "social" RENAME COLUMN "link_form" TO "linkForm"`,
    );

    // superiority -> superiority
    await q.query(
      `ALTER TABLE "superiority" RENAME COLUMN "kategoriId" TO "categoryId"`,
    );

    // team -> team
    await q.query(`ALTER TABLE "team" RENAME COLUMN "nama" TO "name"`);
    await q.query(`ALTER TABLE "team" RENAME COLUMN "team_ke" TO "teamOrder"`);
    await q.query(
      `ALTER TABLE "team" RENAME COLUMN "deskripsi" TO "description"`,
    );
    await q.query(`ALTER TABLE "team" RENAME COLUMN "posisi" TO "position"`);

    // team_leads -> team_leads
    await q.query(`ALTER TABLE "team_leads" RENAME COLUMN "nama" TO "name"`);
    await q.query(
      `ALTER TABLE "team_leads" RENAME COLUMN "deskripsi" TO "description"`,
    );
    await q.query(
      `ALTER TABLE "team_leads" RENAME COLUMN "posisi" TO "position"`,
    );

    // teknologi -> technologies
    await q.query(`ALTER TABLE "technologies" RENAME COLUMN "nama" TO "name"`);
    await q.query(
      `ALTER TABLE "technologies" RENAME COLUMN "img_url" TO "imgUrl"`,
    );

    // tentang -> about
    await q.query(`ALTER TABLE "about" RENAME COLUMN "gambar" TO "image"`);
    await q.query(`ALTER TABLE "about" RENAME COLUMN "judul" TO "title"`);

    // tugas -> assignments
    await q.query(`ALTER TABLE "assignments" RENAME COLUMN "judul" TO "title"`);
    await q.query(
      `ALTER TABLE "assignments" RENAME COLUMN "pertemuanId" TO "sessionId"`,
    );

    // user -> user
    await q.query(
      `ALTER TABLE "user" RENAME COLUMN "verifikasiToken" TO "verificationToken"`,
    );
    await q.query(
      `ALTER TABLE "user" RENAME COLUMN "verifikasiTokenExpires" TO "verificationTokenExpires"`,
    );

    // user_kelas -> user_courses
    await q.query(
      `ALTER TABLE "user_courses" RENAME COLUMN "progres" TO "progress"`,
    );
    await q.query(
      `ALTER TABLE "user_courses" RENAME COLUMN "kelasId" TO "courseId"`,
    );

    // value -> value
    await q.query(
      `ALTER TABLE "value" RENAME COLUMN "value_ke" TO "valueOrder"`,
    );

    // visi -> visions
    await q.query(`ALTER TABLE "visions" RENAME COLUMN "visi" TO "visions"`);

    // ======================================================================
    //  BAGIAN 3  Tipe enum
    // ======================================================================
    // 3a. benefit_no_enum: '1','2','3' -> '1'..'5'
    await q.query(`ALTER TYPE benefit_no_enum ADD VALUE IF NOT EXISTS '4'`);
    await q.query(`ALTER TYPE benefit_no_enum ADD VALUE IF NOT EXISTS '5'`);

    // 3b. Buat tipe enum target. Enum lama sengaja TIDAK di-drop,
    //     karena pada e-learning-migration tipe lama itu memang masih ada.
    await q.query(
      `CREATE TYPE answer_task_process_enum AS ENUM ('approved', 'process', 'rejected')`,
    );
    await q.query(
      `CREATE TYPE category_type_enum AS ENUM ('Special Program', 'Paid Program', 'Free Program')`,
    );
    await q.query(
      `CREATE TYPE course_method_enum AS ENUM ('online', 'offline')`,
    );
    await q.query(
      `CREATE TYPE course_process_enum AS ENUM ('approved', 'process', 'rejected')`,
    );
    await q.query(
      `CREATE TYPE gallery_no_enum AS ENUM ('1', '2', '3', '4', '5', '6')`,
    );
    await q.query(
      `CREATE TYPE image_benefit_no_enum AS ENUM ('1', '2', '3', '4')`,
    );
    await q.query(`CREATE TYPE installment_month_enum AS ENUM ('3')`);
    await q.query(
      `CREATE TYPE logbook_process_enum AS ENUM ('approved', 'process', 'rejected')`,
    );
    await q.query(
      `CREATE TYPE material_filetype_enum AS ENUM ('video', 'pdf', 'ppt')`,
    );
    await q.query(
      `CREATE TYPE payments_current_status_enum AS ENUM ('University Student', 'Fresh Graduate', 'Job Seeker', 'Employee', 'Freelancer', 'Entrepreneur', 'Other')`,
    );
    await q.query(
      `CREATE TYPE payments_process_enum AS ENUM ('approved', 'process', 'rejected')`,
    );
    await q.query(
      `CREATE TYPE payments_referal_source_enum AS ENUM ('Instagram', 'TikTok', 'LinkedIn', 'Friends', 'University', 'WhatsApp Group', 'Webinar/Event', 'Website', 'Other')`,
    );
    await q.query(
      `CREATE TYPE payments_referalsource_enum AS ENUM ('Instagram', 'TikTok', 'LinkedIn', 'Friends', 'University', 'WhatsApp Group', 'Webinar/Event', 'Website', 'Other')`,
    );
    await q.query(
      `CREATE TYPE registrations_current_status_enum AS ENUM ('University Student', 'Fresh Graduate', 'Job Seeker', 'Employee', 'Freelancer', 'Entrepreneur', 'Other')`,
    );
    await q.query(
      `CREATE TYPE registrations_process_enum AS ENUM ('approved', 'process', 'rejected')`,
    );
    await q.query(
      `CREATE TYPE registrations_referal_source_enum AS ENUM ('Instagram', 'TikTok', 'LinkedIn', 'Friends', 'University', 'WhatsApp Group', 'Webinar/Event', 'Website', 'Other')`,
    );
    await q.query(`CREATE TYPE voucher_type_enum AS ENUM ('free', 'discount')`);

    // 3c. Konversi label: 'acc' -> 'approved', 'proces' -> 'process'.

    // answer_task.process: jawaban_tugas_proses_enum -> answer_task_process_enum
    await q.query(
      `ALTER TABLE "answer_task" ALTER COLUMN "process" DROP DEFAULT`,
    );
    await q.query(
      `ALTER TABLE "answer_task" ALTER COLUMN "process" TYPE answer_task_process_enum USING (CASE "process"::text WHEN 'acc' THEN 'approved' WHEN 'proces' THEN 'process' WHEN 'rejected' THEN 'rejected' END)::answer_task_process_enum`,
    );
    await q.query(
      `ALTER TABLE "answer_task" ALTER COLUMN "process" SET DEFAULT 'rejected'::answer_task_process_enum`,
    );

    // course.process: kelas_proses_enum -> course_process_enum
    await q.query(`ALTER TABLE "course" ALTER COLUMN "process" DROP DEFAULT`);
    await q.query(
      `ALTER TABLE "course" ALTER COLUMN "process" TYPE course_process_enum USING (CASE "process"::text WHEN 'acc' THEN 'approved' WHEN 'proces' THEN 'process' WHEN 'rejected' THEN 'rejected' END)::course_process_enum`,
    );
    await q.query(
      `ALTER TABLE "course" ALTER COLUMN "process" SET DEFAULT 'rejected'::course_process_enum`,
    );

    // logbook.process: logbook_proses_enum -> logbook_process_enum
    await q.query(`ALTER TABLE "logbook" ALTER COLUMN "process" DROP DEFAULT`);
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "process" TYPE logbook_process_enum USING (CASE "process"::text WHEN 'acc' THEN 'approved' WHEN 'proces' THEN 'process' WHEN 'rejected' THEN 'rejected' END)::logbook_process_enum`,
    );
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "process" SET DEFAULT 'rejected'::logbook_process_enum`,
    );

    // payments.process: pembayaran_proses_enum -> payments_process_enum
    await q.query(`ALTER TABLE "payments" ALTER COLUMN "process" DROP DEFAULT`);
    await q.query(
      `ALTER TABLE "payments" ALTER COLUMN "process" TYPE payments_process_enum USING (CASE "process"::text WHEN 'acc' THEN 'approved' WHEN 'proces' THEN 'process' WHEN 'rejected' THEN 'rejected' END)::payments_process_enum`,
    );
    await q.query(
      `ALTER TABLE "payments" ALTER COLUMN "process" SET DEFAULT 'rejected'::payments_process_enum`,
    );

    // registrations.process: pendaftaran_proses_enum -> registrations_process_enum
    await q.query(
      `ALTER TABLE "registrations" ALTER COLUMN "process" DROP DEFAULT`,
    );
    await q.query(
      `ALTER TABLE "registrations" ALTER COLUMN "process" TYPE registrations_process_enum USING (CASE "process"::text WHEN 'acc' THEN 'approved' WHEN 'proces' THEN 'process' WHEN 'rejected' THEN 'rejected' END)::registrations_process_enum`,
    );
    await q.query(
      `ALTER TABLE "registrations" ALTER COLUMN "process" SET DEFAULT 'rejected'::registrations_process_enum`,
    );

    // Konversi enum yang label-nya identik.

    // attendance.status: absen_status_enum -> attendance_status_enum
    await q.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await q.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" TYPE attendance_status_enum USING "status"::text::attendance_status_enum`,
    );
    await q.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" SET DEFAULT 'no_information'::attendance_status_enum`,
    );

    // course.method: kelas_metode_enum -> course_method_enum
    await q.query(
      `ALTER TABLE "course" ALTER COLUMN "method" TYPE course_method_enum USING "method"::text::course_method_enum`,
    );

    // image_benefit.no: gambar_benefit_no_enum -> image_benefit_no_enum
    await q.query(
      `ALTER TABLE "image_benefit" ALTER COLUMN "no" TYPE image_benefit_no_enum USING "no"::text::image_benefit_no_enum`,
    );

    // material.fileType: materi_jenis_file_enum -> material_filetype_enum
    await q.query(
      `ALTER TABLE "material" ALTER COLUMN "fileType" TYPE material_filetype_enum USING "fileType"::text::material_filetype_enum`,
    );

    // category.type: 'Program' -> 'Paid Program' (dikonfirmasi).
    await q.query(
      `ALTER TABLE "category" ALTER COLUMN "type" TYPE category_type_enum USING (CASE "type"::text WHEN 'Special Program' THEN 'Special Program' WHEN 'Program' THEN 'Paid Program' END)::category_type_enum`,
    );

    // installment.month: hanya '3' yang valid pada skema target.
    // Baris 6/12 bulan diratakan ke 3 termin dengan TOTAL YANG SAMA.
    // Sisa pembagian ditaruh di termin-termin awal supaya jumlahnya presisi.
    await q.query(`UPDATE "installment" AS i
         SET "price" = jsonb_build_array(
               s.base + CASE WHEN s.rem >= 1 THEN 1 ELSE 0 END,
               s.base + CASE WHEN s.rem >= 2 THEN 1 ELSE 0 END,
               s.base)
         FROM (SELECT c.id,
                      FLOOR(SUM(v::numeric) / 3)::bigint      AS base,
                      (SUM(v::numeric)::bigint % 3)           AS rem
               FROM "installment" c,
                    LATERAL jsonb_array_elements_text(c."price") AS v
               WHERE c."month"::text IN ('6','12')
               GROUP BY c.id) AS s
         WHERE i.id = s.id`);
    await q.query(
      `UPDATE "installment" SET "month" = '3' WHERE "month"::text IN ('6','12')`,
    );
    await q.query(
      `ALTER TABLE "installment" ALTER COLUMN "month" TYPE installment_month_enum USING "month"::text::installment_month_enum`,
    );

    // ======================================================================
    //  BAGIAN 4  Kolom baru (20)
    // ======================================================================

    // category
    await q.query(
      `ALTER TABLE "category" ADD COLUMN "hero_section_image" varchar`,
    );

    // course
    await q.query(
      `ALTER TABLE "course" ADD COLUMN "date_registration" timestamp`,
    );
    await q.query(`ALTER TABLE "course" ADD COLUMN "time_start" time`);
    await q.query(`ALTER TABLE "course" ADD COLUMN "time_end" time`);

    // payments
    await q.query(
      `ALTER TABLE "payments" ADD COLUMN "referalSource" payments_referalsource_enum`,
    );
    await q.query(
      `ALTER TABLE "payments" ADD COLUMN "current_status" payments_current_status_enum`,
    );
    await q.query(`ALTER TABLE "payments" ADD COLUMN "attend_program" boolean`);
    await q.query(`ALTER TABLE "payments" ADD COLUMN "user_email" varchar`);
    await q.query(`ALTER TABLE "payments" ADD COLUMN "user_name" varchar`);
    await q.query(`ALTER TABLE "payments" ADD COLUMN "course_name" varchar`);
    await q.query(`ALTER TABLE "payments" ADD COLUMN "voucher_code" varchar`);
    await q.query(
      `ALTER TABLE "payments" ADD COLUMN "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await q.query(`ALTER TABLE "payments" ADD COLUMN "user_fullname" varchar`);
    await q.query(`ALTER TABLE "payments" ADD COLUMN "user_no" varchar`);

    // registrations
    await q.query(
      `ALTER TABLE "registrations" ADD COLUMN "user_fullname" varchar`,
    );
    await q.query(
      `ALTER TABLE "registrations" ADD COLUMN "user_email" varchar`,
    );
    await q.query(`ALTER TABLE "registrations" ADD COLUMN "user_no" varchar`);
    await q.query(
      `ALTER TABLE "registrations" ADD COLUMN "attend_program" boolean`,
    );
    await q.query(
      `ALTER TABLE "registrations" ADD COLUMN "current_status" registrations_current_status_enum`,
    );
    await q.query(
      `ALTER TABLE "registrations" ADD COLUMN "referal_source" registrations_referal_source_enum`,
    );

    // ======================================================================
    //  BAGIAN 5  Tabel baru (6) + relasi partner
    // ======================================================================
    await q.query(`CREATE TABLE "category_partner" (
         "id" SERIAL PRIMARY KEY,
         "category" varchar NOT NULL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now())`);
    await q.query(`CREATE TABLE "gallery" (
         "id" SERIAL PRIMARY KEY,
         "filePath" varchar NOT NULL,
         "title" varchar NOT NULL,
         "description" varchar NULL,
         "categoryId" integer NULL,
         "no" gallery_no_enum NOT NULL,
         CONSTRAINT "FK_gallery_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id"))`);
    await q.query(`CREATE TABLE "participants" (
         "id" SERIAL PRIMARY KEY,
         "title" jsonb NULL,
         "description" jsonb NULL,
         "icon" varchar NOT NULL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "courseId" integer NULL,
         CONSTRAINT "FK_participants_course" FOREIGN KEY ("courseId") REFERENCES "course"("id"))`);
    await q.query(`CREATE TABLE "invoice" (
         "id" SERIAL PRIMARY KEY,
         "xendit_invoice_id" varchar NULL,
         "xendit_invoice_url" varchar NULL,
         "subtotal" numeric NULL,
         "discount_amount" numeric NULL DEFAULT 0,
         "final_total" numeric NULL,
         "payment_method" varchar NULL,
         "paid_at" timestamp NULL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "paymentId" integer NULL,
         CONSTRAINT "UQ_invoice_payment" UNIQUE ("paymentId"),
         CONSTRAINT "FK_invoice_payment" FOREIGN KEY ("paymentId") REFERENCES "payments"("id"))`);
    await q.query(`CREATE TABLE "voucher" (
         "id" SERIAL PRIMARY KEY,
         "code_voucher" varchar NOT NULL,
         "type" voucher_type_enum NOT NULL,
         "active" boolean NOT NULL DEFAULT true,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "url_code" uuid NOT NULL DEFAULT uuid_generate_v4(),
         "allowed_user_ids" json NULL,
         CONSTRAINT "UQ_voucher_code" UNIQUE ("code_voucher"),
         CONSTRAINT "UQ_voucher_url_code" UNIQUE ("url_code"))`);
    await q.query(`CREATE TABLE "voucher_programs" (
         "voucherId" integer NOT NULL,
         "courseId" integer NOT NULL,
         CONSTRAINT "PK_voucher_programs" PRIMARY KEY ("courseId", "voucherId"),
         CONSTRAINT "FK_voucher_programs_voucher" FOREIGN KEY ("voucherId") REFERENCES "voucher"("id"),
         CONSTRAINT "FK_voucher_programs_course" FOREIGN KEY ("courseId") REFERENCES "course"("id"))`);

    // Kategori partner. Nama-nama ini hanya seed awal - super_admin
    // bebas menambah/mengubahnya lewat aplikasi setelah migrasi.
    await q.query(`INSERT INTO "category_partner" ("category") VALUES
         ('Government Institutions'), ('Company'), ('Institutions'), ('BUMN')`);
    await q.query(
      `ALTER TABLE "partner" ADD COLUMN "categoryPartnerId" integer NULL`,
    );
    await q.query(
      `ALTER TABLE "partner" ADD CONSTRAINT "FK_partner_category_partner" FOREIGN KEY ("categoryPartnerId") REFERENCES "category_partner"("id")`,
    );
    // Partner lama belum punya kategori -> diarahkan ke 'Company' agar
    // constraint NOT NULL bisa dipasang. Admin bisa ubah kemudian.
    await q.query(`UPDATE "partner" SET "categoryPartnerId" =
         (SELECT "id" FROM "category_partner" WHERE "category" = 'Company')
         WHERE "categoryPartnerId" IS NULL`);
    await q.query(
      `ALTER TABLE "partner" ALTER COLUMN "categoryPartnerId" SET NOT NULL`,
    );

    // ======================================================================
    //  BAGIAN 6  Nullability (23)
    // ======================================================================

    // award
    await q.query(
      `ALTER TABLE "award" ALTER COLUMN "awardOrder" DROP NOT NULL`,
    );

    // background
    await q.query(
      `ALTER TABLE "background" ALTER COLUMN "backgroundOrder" DROP NOT NULL`,
    );

    // biodata
    await q.query(
      `ALTER TABLE "biodata" ALTER COLUMN "fullName" DROP NOT NULL`,
    );
    await q.query(`ALTER TABLE "biodata" ALTER COLUMN "gender" DROP NOT NULL`);
    await q.query(`ALTER TABLE "biodata" ALTER COLUMN "city" DROP NOT NULL`);
    await q.query(
      `ALTER TABLE "biodata" ALTER COLUMN "education" DROP NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "biodata" ALTER COLUMN "studyProgram" DROP NOT NULL`,
    );

    // category
    await q.query(`ALTER TABLE "category" ALTER COLUMN "name" DROP NOT NULL`);

    // commitment
    await q.query(
      `ALTER TABLE "commitment" ALTER COLUMN "commitmentOrder" DROP NOT NULL`,
    );

    // experience
    await q.query(
      `ALTER TABLE "experience" ALTER COLUMN "experienceOrder" DROP NOT NULL`,
    );

    // logbook
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "activity" DROP NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "activity_details" DROP NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "documentation" DROP NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "obstacles" DROP NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "other_documentation" DROP NOT NULL`,
    );

    // session
    await q.query(`ALTER TABLE "session" ALTER COLUMN "topic" DROP NOT NULL`);
    await q.query(
      `ALTER TABLE "session" ALTER COLUMN "sessionOrder" DROP NOT NULL`,
    );
    await q.query(`ALTER TABLE "session" ALTER COLUMN "date" DROP NOT NULL`);
    await q.query(
      `ALTER TABLE "session" ALTER COLUMN "location" DROP NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "session" ALTER COLUMN "start_time" DROP NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "session" ALTER COLUMN "end_time" DROP NOT NULL`,
    );

    // team
    await q.query(`ALTER TABLE "team" ALTER COLUMN "name" DROP NOT NULL`);
    await q.query(`ALTER TABLE "team" ALTER COLUMN "teamOrder" DROP NOT NULL`);

    // ======================================================================
    //  BAGIAN 7  Rename sequence (37)
    // ======================================================================
    await q.query(
      `ALTER SEQUENCE "absen_id_seq" RENAME TO "attendance_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "alur_kelas_id_seq" RENAME TO "course_flow_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "benefit_kelas_id_seq" RENAME TO "program_benefits_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "biodata_mentor_id_seq" RENAME TO "mentor_biodata_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "cicilan_id_seq" RENAME TO "installment_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "gambar_benefit_id_seq" RENAME TO "image_benefit_id_seq"`,
    );
    await q.query(`ALTER SEQUENCE "jawaban_id_seq" RENAME TO "answers_id_seq"`);
    await q.query(
      `ALTER SEQUENCE "jawaban_tugas_id_seq" RENAME TO "answer_task_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "jawaban_user_id_seq" RENAME TO "user_answers_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "jenis_kelas_id_seq" RENAME TO "course_type_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "kategori_id_seq" RENAME TO "category_id_seq"`,
    );
    await q.query(`ALTER SEQUENCE "kelas_id_seq" RENAME TO "course_id_seq"`);
    await q.query(
      `ALTER SEQUENCE "kerja_sama_id_seq" RENAME TO "partner_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "komentar_id_seq" RENAME TO "comments_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "logbook_mentor_id_seq" RENAME TO "mentor_logbook_id_seq"`,
    );
    await q.query(`ALTER SEQUENCE "materi_id_seq" RENAME TO "material_id_seq"`);
    await q.query(`ALTER SEQUENCE "mentor_id_seq" RENAME TO "mentors_id_seq"`);
    await q.query(`ALTER SEQUENCE "minggu_id_seq" RENAME TO "weeks_id_seq"`);
    await q.query(`ALTER SEQUENCE "misi_id_seq" RENAME TO "mission_id_seq"`);
    await q.query(`ALTER SEQUENCE "nilai_id_seq" RENAME TO "scores_id_seq"`);
    await q.query(
      `ALTER SEQUENCE "paragraf_id_seq" RENAME TO "paragraph_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "pembayaran_id_seq" RENAME TO "payments_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "pendaftaran_id_seq" RENAME TO "registrations_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "pertanyaan_id_seq" RENAME TO "questions_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "pertanyaan_kelas_id_seq" RENAME TO "course_questions_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "pertanyaan_umum_id_seq" RENAME TO "faqs_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "pertemuan_id_seq" RENAME TO "session_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "portfolio_id_seq" RENAME TO "portofolios_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "progres_minggu_id_seq" RENAME TO "week_progresses_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "progres_pertemuan_id_seq" RENAME TO "session_progresses_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "progres_quiz_id_seq" RENAME TO "quiz_progresses_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "sertifikat_id_seq" RENAME TO "certificates_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "teknologi_id_seq" RENAME TO "technologies_id_seq"`,
    );
    await q.query(`ALTER SEQUENCE "tentang_id_seq" RENAME TO "about_id_seq"`);
    await q.query(
      `ALTER SEQUENCE "tugas_id_seq" RENAME TO "assignments_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "user_kelas_id_seq" RENAME TO "user_courses_id_seq"`,
    );
    await q.query(`ALTER SEQUENCE "visi_id_seq" RENAME TO "visions_id_seq"`);

    // ======================================================================
    //  BAGIAN 8  Hapus tabel usang (11)
    //  DESTRUKTIF. down() hanya mengembalikan STRUKTUR, bukan isinya.
    //  Backup dulu kalau datanya masih dibutuhkan.
    // ======================================================================
    await q.query(`DROP TABLE IF EXISTS "reply" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "coment" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "like" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "likes" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "blog" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "kategori_blog" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "topic" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "staging_proses" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "translation" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "pertanyaan_program" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "type_program_category" CASCADE`);
  }

  public async down(q: QueryRunner): Promise<void> {
    // ======================================================================
    //  BAGIAN -1'  Penjaga idempoten (pasangan dari penjaga di up())
    //
    //  Membalik refactor hanya masuk akal kalau up() memang mengerjakannya
    //  di database ini. Penandanya adalah tabel `_refactor_server_applied`
    //  yang ditulis up(); keberadaan tabel `pertemuan` TIDAK bisa dipakai,
    //  karena setelah up() sukses tabel itu sudah di-rename menjadi
    //  `session` - sama seperti pada database yang up()-nya no-op.
    // ======================================================================
    const [probe] = await q.query(
      `SELECT to_regclass('public._refactor_server_applied') IS NOT NULL AS was_applied`,
    );
    if (!probe.was_applied) {
      // up() tadi no-op di database ini: tidak ada yang perlu dibalik.
      return;
    }
    await q.query(`DROP TABLE "_refactor_server_applied"`);

    // ======================================================================
    //  BAGIAN 8'  Bangun ulang 11 tabel yang di-drop
    //  CATATAN: hanya STRUKTUR. Isi tabel tidak bisa dikembalikan dari sini -
    //  pulihkan dari backup kalau datanya dibutuhkan.
    // ======================================================================
    await q.query(`CREATE TABLE "kategori_blog" (
         "id" SERIAL,
         "icon" varchar NOT NULL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "deskripsi" jsonb,
         "nama" jsonb,
         CONSTRAINT "PK_kategori_blog" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "topic" (
         "id" SERIAL,
         "icon" varchar NOT NULL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "deskripsi" jsonb,
         "nama" jsonb,
         CONSTRAINT "PK_topic" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "translation" (
         "id" SERIAL,
         "key" varchar NOT NULL,
         "locale" varchar NOT NULL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         CONSTRAINT "PK_translation" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "type_program_category" (
         "id" SERIAL,
         CONSTRAINT "PK_type_program_category" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "blog" (
         "id" SERIAL,
         "judul" varchar NOT NULL,
         "gambar" jsonb NOT NULL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "kategoriBlogId" integer,
         "author" varchar NOT NULL,
         "topicId" integer,
         "tags" jsonb NOT NULL,
         "keyword" varchar NOT NULL,
         "views" integer NOT NULL DEFAULT 0,
         "description" varchar NOT NULL,
         "isi" jsonb NOT NULL,
         "isi_editorjs" jsonb NOT NULL,
         CONSTRAINT "PK_blog" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "pertanyaan_program" (
         "id" SERIAL,
         "pertanyaan" varchar NOT NULL,
         "jawaban" varchar NOT NULL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "kategoriId" integer,
         CONSTRAINT "PK_pertanyaan_program" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "staging_proses" (
         "id" SERIAL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "userId" integer,
         "progres" staging_proses_progres_enum,
         "kelasId" integer,
         CONSTRAINT "PK_staging_proses" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "like" (
         "id" SERIAL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "blogId" integer,
         "userId" integer,
         CONSTRAINT "PK_like" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "likes" (
         "id" SERIAL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "blogId" integer,
         "userId" integer,
         CONSTRAINT "PK_likes" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "coment" (
         "id" SERIAL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "blogId" integer,
         "userId" integer,
         "content" text NOT NULL,
         "repliesId" integer,
         CONSTRAINT "PK_coment" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "reply" (
         "id" SERIAL,
         "createdAt" timestamp NOT NULL DEFAULT now(),
         "updatedAt" timestamp NOT NULL DEFAULT now(),
         "content" text NOT NULL,
         "comentId" integer,
         "userId" integer,
         CONSTRAINT "PK_reply" PRIMARY KEY ("id"))`);

    // Foreign key tabel-tabel di atas (dipasang setelah semua tabel ada).
    await q.query(
      `ALTER TABLE "blog" ADD CONSTRAINT "FK_c15649552f3e4b16e3f90ec8c98" FOREIGN KEY ("kategoriBlogId") REFERENCES "kategori_blog"("id")`,
    );
    await q.query(
      `ALTER TABLE "blog" ADD CONSTRAINT "FK_fc3ee4094f3299a66c9debb6da3" FOREIGN KEY ("topicId") REFERENCES "topic"("id")`,
    );
    await q.query(
      `ALTER TABLE "pertanyaan_program" ADD CONSTRAINT "FK_e4a2cf43057dba90f2ea7902d9c" FOREIGN KEY ("kategoriId") REFERENCES "category"("id")`,
    );
    await q.query(
      `ALTER TABLE "staging_proses" ADD CONSTRAINT "FK_63af3fda55dc6b5bfbe9f09bf93" FOREIGN KEY ("userId") REFERENCES "user"("id")`,
    );
    await q.query(
      `ALTER TABLE "staging_proses" ADD CONSTRAINT "FK_cf341b4184da7ccf4541cd2d391" FOREIGN KEY ("kelasId") REFERENCES "course"("id")`,
    );
    await q.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_1b343f6df7583577dffcd777120" FOREIGN KEY ("blogId") REFERENCES "blog"("id")`,
    );
    await q.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user"("id")`,
    );
    await q.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "FK_f9a631b0c487820ee8d5df0cce2" FOREIGN KEY ("blogId") REFERENCES "blog"("id")`,
    );
    await q.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "FK_cfd8e81fac09d7339a32e57d904" FOREIGN KEY ("userId") REFERENCES "user"("id")`,
    );
    await q.query(
      `ALTER TABLE "coment" ADD CONSTRAINT "FK_a50104329392a79249001fe751b" FOREIGN KEY ("userId") REFERENCES "user"("id")`,
    );
    await q.query(
      `ALTER TABLE "coment" ADD CONSTRAINT "FK_c5110a185d87475cde8fc4f7bfb" FOREIGN KEY ("repliesId") REFERENCES "coment"("id")`,
    );
    await q.query(
      `ALTER TABLE "coment" ADD CONSTRAINT "FK_ea613941c9af975e0ec86969c7e" FOREIGN KEY ("blogId") REFERENCES "blog"("id")`,
    );
    await q.query(
      `ALTER TABLE "reply" ADD CONSTRAINT "FK_e9886d6d04a19413a2f0aac5d7b" FOREIGN KEY ("userId") REFERENCES "user"("id")`,
    );
    await q.query(
      `ALTER TABLE "reply" ADD CONSTRAINT "FK_6dadb31893f8decf8e66335ddad" FOREIGN KEY ("comentId") REFERENCES "coment"("id")`,
    );

    // ======================================================================
    //  BAGIAN 7'  Kembalikan nama sequence
    // ======================================================================
    await q.query(
      `ALTER SEQUENCE "attendance_id_seq" RENAME TO "absen_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "course_flow_id_seq" RENAME TO "alur_kelas_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "program_benefits_id_seq" RENAME TO "benefit_kelas_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "mentor_biodata_id_seq" RENAME TO "biodata_mentor_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "installment_id_seq" RENAME TO "cicilan_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "image_benefit_id_seq" RENAME TO "gambar_benefit_id_seq"`,
    );
    await q.query(`ALTER SEQUENCE "answers_id_seq" RENAME TO "jawaban_id_seq"`);
    await q.query(
      `ALTER SEQUENCE "answer_task_id_seq" RENAME TO "jawaban_tugas_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "user_answers_id_seq" RENAME TO "jawaban_user_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "course_type_id_seq" RENAME TO "jenis_kelas_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "category_id_seq" RENAME TO "kategori_id_seq"`,
    );
    await q.query(`ALTER SEQUENCE "course_id_seq" RENAME TO "kelas_id_seq"`);
    await q.query(
      `ALTER SEQUENCE "partner_id_seq" RENAME TO "kerja_sama_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "comments_id_seq" RENAME TO "komentar_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "mentor_logbook_id_seq" RENAME TO "logbook_mentor_id_seq"`,
    );
    await q.query(`ALTER SEQUENCE "material_id_seq" RENAME TO "materi_id_seq"`);
    await q.query(`ALTER SEQUENCE "mentors_id_seq" RENAME TO "mentor_id_seq"`);
    await q.query(`ALTER SEQUENCE "weeks_id_seq" RENAME TO "minggu_id_seq"`);
    await q.query(`ALTER SEQUENCE "mission_id_seq" RENAME TO "misi_id_seq"`);
    await q.query(`ALTER SEQUENCE "scores_id_seq" RENAME TO "nilai_id_seq"`);
    await q.query(
      `ALTER SEQUENCE "paragraph_id_seq" RENAME TO "paragraf_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "payments_id_seq" RENAME TO "pembayaran_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "registrations_id_seq" RENAME TO "pendaftaran_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "questions_id_seq" RENAME TO "pertanyaan_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "course_questions_id_seq" RENAME TO "pertanyaan_kelas_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "faqs_id_seq" RENAME TO "pertanyaan_umum_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "session_id_seq" RENAME TO "pertemuan_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "portofolios_id_seq" RENAME TO "portfolio_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "week_progresses_id_seq" RENAME TO "progres_minggu_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "session_progresses_id_seq" RENAME TO "progres_pertemuan_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "quiz_progresses_id_seq" RENAME TO "progres_quiz_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "certificates_id_seq" RENAME TO "sertifikat_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "technologies_id_seq" RENAME TO "teknologi_id_seq"`,
    );
    await q.query(`ALTER SEQUENCE "about_id_seq" RENAME TO "tentang_id_seq"`);
    await q.query(
      `ALTER SEQUENCE "assignments_id_seq" RENAME TO "tugas_id_seq"`,
    );
    await q.query(
      `ALTER SEQUENCE "user_courses_id_seq" RENAME TO "user_kelas_id_seq"`,
    );
    await q.query(`ALTER SEQUENCE "visions_id_seq" RENAME TO "visi_id_seq"`);

    // ======================================================================
    //  BAGIAN 6'  Kembalikan nullability
    //  PERHATIAN: SET NOT NULL akan GAGAL kalau setelah up() sempat masuk
    //  baris ber-NULL pada kolom-kolom ini. Bersihkan dulu bila perlu.
    // ======================================================================

    // award
    await q.query(`ALTER TABLE "award" ALTER COLUMN "awardOrder" SET NOT NULL`);

    // background
    await q.query(
      `ALTER TABLE "background" ALTER COLUMN "backgroundOrder" SET NOT NULL`,
    );

    // biodata
    await q.query(`ALTER TABLE "biodata" ALTER COLUMN "fullName" SET NOT NULL`);
    await q.query(`ALTER TABLE "biodata" ALTER COLUMN "gender" SET NOT NULL`);
    await q.query(`ALTER TABLE "biodata" ALTER COLUMN "city" SET NOT NULL`);
    await q.query(
      `ALTER TABLE "biodata" ALTER COLUMN "education" SET NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "biodata" ALTER COLUMN "studyProgram" SET NOT NULL`,
    );

    // category
    await q.query(`ALTER TABLE "category" ALTER COLUMN "name" SET NOT NULL`);

    // commitment
    await q.query(
      `ALTER TABLE "commitment" ALTER COLUMN "commitmentOrder" SET NOT NULL`,
    );

    // experience
    await q.query(
      `ALTER TABLE "experience" ALTER COLUMN "experienceOrder" SET NOT NULL`,
    );

    // logbook
    await q.query(`ALTER TABLE "logbook" ALTER COLUMN "activity" SET NOT NULL`);
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "activity_details" SET NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "documentation" SET NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "obstacles" SET NOT NULL`,
    );
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "other_documentation" SET NOT NULL`,
    );

    // session
    await q.query(`ALTER TABLE "session" ALTER COLUMN "topic" SET NOT NULL`);
    await q.query(
      `ALTER TABLE "session" ALTER COLUMN "sessionOrder" SET NOT NULL`,
    );
    await q.query(`ALTER TABLE "session" ALTER COLUMN "date" SET NOT NULL`);
    await q.query(`ALTER TABLE "session" ALTER COLUMN "location" SET NOT NULL`);
    await q.query(
      `ALTER TABLE "session" ALTER COLUMN "start_time" SET NOT NULL`,
    );
    await q.query(`ALTER TABLE "session" ALTER COLUMN "end_time" SET NOT NULL`);

    // team
    await q.query(`ALTER TABLE "team" ALTER COLUMN "name" SET NOT NULL`);
    await q.query(`ALTER TABLE "team" ALTER COLUMN "teamOrder" SET NOT NULL`);

    // ======================================================================
    //  BAGIAN 5'  Hapus tabel baru + relasi partner
    // ======================================================================
    await q.query(
      `ALTER TABLE "partner" DROP CONSTRAINT IF EXISTS "FK_partner_category_partner"`,
    );
    await q.query(
      `ALTER TABLE "partner" DROP COLUMN IF EXISTS "categoryPartnerId"`,
    );
    await q.query(`DROP TABLE IF EXISTS "voucher_programs" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "voucher" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "invoice" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "participants" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "gallery" CASCADE`);
    await q.query(`DROP TABLE IF EXISTS "category_partner" CASCADE`);

    // ======================================================================
    //  BAGIAN 4'  Hapus kolom baru
    // ======================================================================

    // registrations
    await q.query(
      `ALTER TABLE "registrations" DROP COLUMN IF EXISTS "user_fullname"`,
    );
    await q.query(
      `ALTER TABLE "registrations" DROP COLUMN IF EXISTS "user_email"`,
    );
    await q.query(
      `ALTER TABLE "registrations" DROP COLUMN IF EXISTS "user_no"`,
    );
    await q.query(
      `ALTER TABLE "registrations" DROP COLUMN IF EXISTS "attend_program"`,
    );
    await q.query(
      `ALTER TABLE "registrations" DROP COLUMN IF EXISTS "current_status"`,
    );
    await q.query(
      `ALTER TABLE "registrations" DROP COLUMN IF EXISTS "referal_source"`,
    );

    // payments
    await q.query(
      `ALTER TABLE "payments" DROP COLUMN IF EXISTS "referalSource"`,
    );
    await q.query(
      `ALTER TABLE "payments" DROP COLUMN IF EXISTS "current_status"`,
    );
    await q.query(
      `ALTER TABLE "payments" DROP COLUMN IF EXISTS "attend_program"`,
    );
    await q.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "user_email"`);
    await q.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "user_name"`);
    await q.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "course_name"`);
    await q.query(
      `ALTER TABLE "payments" DROP COLUMN IF EXISTS "voucher_code"`,
    );
    await q.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "uuid"`);
    await q.query(
      `ALTER TABLE "payments" DROP COLUMN IF EXISTS "user_fullname"`,
    );
    await q.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "user_no"`);

    // course
    await q.query(
      `ALTER TABLE "course" DROP COLUMN IF EXISTS "date_registration"`,
    );
    await q.query(`ALTER TABLE "course" DROP COLUMN IF EXISTS "time_start"`);
    await q.query(`ALTER TABLE "course" DROP COLUMN IF EXISTS "time_end"`);

    // category
    await q.query(
      `ALTER TABLE "category" DROP COLUMN IF EXISTS "hero_section_image"`,
    );

    // ======================================================================
    //  BAGIAN 3'  Kembalikan tipe enum
    //  CATATAN: perataan installment.price ke 3 termin TIDAK bisa dibalik -
    //  nilai 6/12 termin yang asli sudah tidak tersimpan.
    // ======================================================================

    // installment.month kembali ke enum lama (nilainya tetap '3').
    await q.query(
      `ALTER TABLE "installment" ALTER COLUMN "month" TYPE cicilan_bulan_enum USING "month"::text::cicilan_bulan_enum`,
    );

    // category.type kembali: 'Paid Program'/'Free Program' -> 'Program'.
    await q.query(
      `ALTER TABLE "category" ALTER COLUMN "type" TYPE kategori_type_enum USING (CASE "type"::text WHEN 'Special Program' THEN 'Special Program' ELSE 'Program' END)::kategori_type_enum`,
    );

    // Enum berlabel identik.
    await q.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await q.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" TYPE absen_status_enum USING "status"::text::absen_status_enum`,
    );
    await q.query(
      `ALTER TABLE "attendance" ALTER COLUMN "status" SET DEFAULT 'no_information'::absen_status_enum`,
    );
    await q.query(
      `ALTER TABLE "course" ALTER COLUMN "method" TYPE kelas_metode_enum USING "method"::text::kelas_metode_enum`,
    );
    await q.query(
      `ALTER TABLE "image_benefit" ALTER COLUMN "no" TYPE gambar_benefit_no_enum USING "no"::text::gambar_benefit_no_enum`,
    );
    await q.query(
      `ALTER TABLE "material" ALTER COLUMN "fileType" TYPE materi_jenis_file_enum USING "fileType"::text::materi_jenis_file_enum`,
    );

    // Label proses: 'approved' -> 'acc', 'process' -> 'proces'.

    await q.query(
      `ALTER TABLE "answer_task" ALTER COLUMN "process" DROP DEFAULT`,
    );
    await q.query(
      `ALTER TABLE "answer_task" ALTER COLUMN "process" TYPE jawaban_tugas_proses_enum USING (CASE "process"::text WHEN 'approved' THEN 'acc' WHEN 'process' THEN 'proces' WHEN 'rejected' THEN 'rejected' END)::jawaban_tugas_proses_enum`,
    );
    await q.query(
      `ALTER TABLE "answer_task" ALTER COLUMN "process" SET DEFAULT 'rejected'::jawaban_tugas_proses_enum`,
    );

    await q.query(`ALTER TABLE "course" ALTER COLUMN "process" DROP DEFAULT`);
    await q.query(
      `ALTER TABLE "course" ALTER COLUMN "process" TYPE kelas_proses_enum USING (CASE "process"::text WHEN 'approved' THEN 'acc' WHEN 'process' THEN 'proces' WHEN 'rejected' THEN 'rejected' END)::kelas_proses_enum`,
    );
    await q.query(
      `ALTER TABLE "course" ALTER COLUMN "process" SET DEFAULT 'rejected'::kelas_proses_enum`,
    );

    await q.query(`ALTER TABLE "logbook" ALTER COLUMN "process" DROP DEFAULT`);
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "process" TYPE logbook_proses_enum USING (CASE "process"::text WHEN 'approved' THEN 'acc' WHEN 'process' THEN 'proces' WHEN 'rejected' THEN 'rejected' END)::logbook_proses_enum`,
    );
    await q.query(
      `ALTER TABLE "logbook" ALTER COLUMN "process" SET DEFAULT 'rejected'::logbook_proses_enum`,
    );

    await q.query(`ALTER TABLE "payments" ALTER COLUMN "process" DROP DEFAULT`);
    await q.query(
      `ALTER TABLE "payments" ALTER COLUMN "process" TYPE pembayaran_proses_enum USING (CASE "process"::text WHEN 'approved' THEN 'acc' WHEN 'process' THEN 'proces' WHEN 'rejected' THEN 'rejected' END)::pembayaran_proses_enum`,
    );
    await q.query(
      `ALTER TABLE "payments" ALTER COLUMN "process" SET DEFAULT 'rejected'::pembayaran_proses_enum`,
    );

    await q.query(
      `ALTER TABLE "registrations" ALTER COLUMN "process" DROP DEFAULT`,
    );
    await q.query(
      `ALTER TABLE "registrations" ALTER COLUMN "process" TYPE pendaftaran_proses_enum USING (CASE "process"::text WHEN 'approved' THEN 'acc' WHEN 'process' THEN 'proces' WHEN 'rejected' THEN 'rejected' END)::pendaftaran_proses_enum`,
    );
    await q.query(
      `ALTER TABLE "registrations" ALTER COLUMN "process" SET DEFAULT 'rejected'::pendaftaran_proses_enum`,
    );

    // Hapus tipe enum yang dibuat oleh up().
    await q.query(`DROP TYPE IF EXISTS answer_task_process_enum`);
    await q.query(`DROP TYPE IF EXISTS category_type_enum`);
    await q.query(`DROP TYPE IF EXISTS course_method_enum`);
    await q.query(`DROP TYPE IF EXISTS course_process_enum`);
    await q.query(`DROP TYPE IF EXISTS gallery_no_enum`);
    await q.query(`DROP TYPE IF EXISTS image_benefit_no_enum`);
    await q.query(`DROP TYPE IF EXISTS installment_month_enum`);
    await q.query(`DROP TYPE IF EXISTS logbook_process_enum`);
    await q.query(`DROP TYPE IF EXISTS material_filetype_enum`);
    await q.query(`DROP TYPE IF EXISTS payments_current_status_enum`);
    await q.query(`DROP TYPE IF EXISTS payments_process_enum`);
    await q.query(`DROP TYPE IF EXISTS payments_referal_source_enum`);
    await q.query(`DROP TYPE IF EXISTS payments_referalsource_enum`);
    await q.query(`DROP TYPE IF EXISTS registrations_current_status_enum`);
    await q.query(`DROP TYPE IF EXISTS registrations_process_enum`);
    await q.query(`DROP TYPE IF EXISTS registrations_referal_source_enum`);
    await q.query(`DROP TYPE IF EXISTS voucher_type_enum`);

    // Label '4' dan '5' pada benefit_no_enum tidak dihapus: PostgreSQL
    // tidak menyediakan DROP VALUE untuk enum. Menghapusnya berarti
    // membuat ulang tipe beserta seluruh kolom yang memakainya.

    // ======================================================================
    //  BAGIAN 2'  Kembalikan nama kolom (180)
    // ======================================================================

    // attendance -> absen
    await q.query(
      `ALTER TABLE "attendance" RENAME COLUMN "attendanceTime" TO "waktu_absen"`,
    );
    await q.query(
      `ALTER TABLE "attendance" RENAME COLUMN "notes" TO "keterangan"`,
    );
    await q.query(
      `ALTER TABLE "attendance" RENAME COLUMN "sessionId" TO "pertemuanId"`,
    );

    // alumni -> alumni
    await q.query(`ALTER TABLE "alumni" RENAME COLUMN "courseId" TO "kelasId"`);
    await q.query(`ALTER TABLE "alumni" RENAME COLUMN "name" TO "nama"`);
    await q.query(`ALTER TABLE "alumni" RENAME COLUMN "message" TO "pesan"`);
    await q.query(`ALTER TABLE "alumni" RENAME COLUMN "program" TO "alumni"`);
    await q.query(
      `ALTER TABLE "alumni" RENAME COLUMN "currentPosition" TO "posisi_sekarang"`,
    );

    // course_flow -> alur_kelas
    await q.query(
      `ALTER TABLE "course_flow" RENAME COLUMN "sequence" TO "alur_ke"`,
    );
    await q.query(
      `ALTER TABLE "course_flow" RENAME COLUMN "courseId" TO "kelasId"`,
    );
    await q.query(`ALTER TABLE "course_flow" RENAME COLUMN "title" TO "judul"`);
    await q.query(`ALTER TABLE "course_flow" RENAME COLUMN "content" TO "isi"`);

    // award -> award
    await q.query(
      `ALTER TABLE "award" RENAME COLUMN "awardOrder" TO "award_ke"`,
    );
    await q.query(`ALTER TABLE "award" RENAME COLUMN "details" TO "isi"`);

    // background -> background
    await q.query(
      `ALTER TABLE "background" RENAME COLUMN "backgroundOrder" TO "background_ke"`,
    );
    await q.query(`ALTER TABLE "background" RENAME COLUMN "details" TO "isi"`);

    // benefit -> benefit
    await q.query(`ALTER TABLE "benefit" RENAME COLUMN "title" TO "judul"`);
    await q.query(
      `ALTER TABLE "benefit" RENAME COLUMN "description" TO "text"`,
    );

    // benefit_category -> benefit_category
    await q.query(
      `ALTER TABLE "benefit_category" RENAME COLUMN "categoryId" TO "kategoriId"`,
    );

    // program_benefits -> benefit_kelas
    await q.query(
      `ALTER TABLE "program_benefits" RENAME COLUMN "courseId" TO "kelasId"`,
    );
    await q.query(
      `ALTER TABLE "program_benefits" RENAME COLUMN "description" TO "isi"`,
    );

    // biodata -> biodata
    await q.query(
      `ALTER TABLE "biodata" RENAME COLUMN "fullName" TO "nama_lengkap"`,
    );
    await q.query(
      `ALTER TABLE "biodata" RENAME COLUMN "gender" TO "jenis_kelamin"`,
    );
    await q.query(`ALTER TABLE "biodata" RENAME COLUMN "city" TO "kota"`);
    await q.query(
      `ALTER TABLE "biodata" RENAME COLUMN "education" TO "pendidikan"`,
    );
    await q.query(
      `ALTER TABLE "biodata" RENAME COLUMN "studyProgram" TO "program_studi"`,
    );

    // installment -> cicilan
    await q.query(
      `ALTER TABLE "installment" RENAME COLUMN "downPayment" TO "dp"`,
    );
    await q.query(`ALTER TABLE "installment" RENAME COLUMN "price" TO "harga"`);
    await q.query(`ALTER TABLE "installment" RENAME COLUMN "month" TO "bulan"`);
    await q.query(
      `ALTER TABLE "installment" RENAME COLUMN "courseId" TO "kelasId"`,
    );

    // commitment -> commitment
    await q.query(
      `ALTER TABLE "commitment" RENAME COLUMN "commitmentOrder" TO "commitment_ke"`,
    );
    await q.query(`ALTER TABLE "commitment" RENAME COLUMN "title" TO "judul"`);
    await q.query(
      `ALTER TABLE "commitment" RENAME COLUMN "description" TO "deskripsi"`,
    );

    // experience -> experience
    await q.query(
      `ALTER TABLE "experience" RENAME COLUMN "experienceOrder" TO "experience_ke"`,
    );
    await q.query(`ALTER TABLE "experience" RENAME COLUMN "details" TO "isi"`);

    // flow_category -> flow_category
    await q.query(
      `ALTER TABLE "flow_category" RENAME COLUMN "categoryId" TO "kategoriId"`,
    );

    // image_benefit -> gambar_benefit
    await q.query(
      `ALTER TABLE "image_benefit" RENAME COLUMN "image" TO "gambar"`,
    );

    // header -> header
    await q.query(`ALTER TABLE "header" RENAME COLUMN "title" TO "judul"`);
    await q.query(`ALTER TABLE "header" RENAME COLUMN "image" TO "gambar"`);

    // info -> info
    await q.query(`ALTER TABLE "info" RENAME COLUMN "title" TO "judul"`);

    // answers -> jawaban
    await q.query(`ALTER TABLE "answers" RENAME COLUMN "answer" TO "jawaban"`);
    await q.query(
      `ALTER TABLE "answers" RENAME COLUMN "isCorrect" TO "jawaban_benar"`,
    );
    await q.query(
      `ALTER TABLE "answers" RENAME COLUMN "questionId" TO "pertanyaanId"`,
    );

    // answer_task -> jawaban_tugas
    await q.query(
      `ALTER TABLE "answer_task" RENAME COLUMN "process" TO "proses"`,
    );
    await q.query(
      `ALTER TABLE "answer_task" RENAME COLUMN "taskId" TO "tugasId"`,
    );

    // user_answers -> jawaban_user
    await q.query(
      `ALTER TABLE "user_answers" RENAME COLUMN "questionId" TO "pertanyaanId"`,
    );
    await q.query(
      `ALTER TABLE "user_answers" RENAME COLUMN "answerId" TO "jawabanId"`,
    );

    // course_type -> jenis_kelas
    await q.query(
      `ALTER TABLE "course_type" RENAME COLUMN "description" TO "deskripsi"`,
    );
    await q.query(
      `ALTER TABLE "course_type" RENAME COLUMN "nameClassesType" TO "nama_jenis_kelas"`,
    );

    // category -> kategori
    await q.query(
      `ALTER TABLE "category" RENAME COLUMN "name" TO "nama_kategori"`,
    );
    await q.query(
      `ALTER TABLE "category" RENAME COLUMN "description" TO "deskripsi"`,
    );
    await q.query(`ALTER TABLE "category" RENAME COLUMN "infoId" TO "info_id"`);
    await q.query(`ALTER TABLE "category" RENAME COLUMN "infoEn" TO "info_en"`);
    await q.query(`ALTER TABLE "category" RENAME COLUMN "infoJa" TO "info_ja"`);

    // category_course_types -> kategori_jenis_kelas_jenis_kelas
    await q.query(
      `ALTER TABLE "category_course_types" RENAME COLUMN "categoryId" TO "kategoriId"`,
    );
    await q.query(
      `ALTER TABLE "category_course_types" RENAME COLUMN "courseTypeId" TO "jenisKelasId"`,
    );

    // course -> kelas
    await q.query(`ALTER TABLE "course" RENAME COLUMN "name" TO "nama_kelas"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "group" TO "grup"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "image" TO "gambar"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "price" TO "harga"`);
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "locationLink" TO "link_lokasi"`,
    );
    await q.query(`ALTER TABLE "course" RENAME COLUMN "method" TO "metode"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "process" TO "proses"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "quota" TO "kuota"`);
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "checkPaid" TO "check_paid"`,
    );
    await q.query(`ALTER TABLE "course" RENAME COLUMN "month" TO "bulan"`);
    await q.query(`ALTER TABLE "course" RENAME COLUMN "day" TO "hari"`);
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "startDate" TO "tanggal_mulai"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "startEnd" TO "tanggal_selesai"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "categoryId" TO "kategoriId"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "courseTypeId" TO "jenis_kelasId"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "criteriaId" TO "kriteria_id"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "criteriaEn" TO "kriteria_en"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "criteriaJa" TO "kriteria_ja"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "materialsId" TO "materi_id"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "materialsEn" TO "materi_en"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "materialsJa" TO "materi_ja"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "learningTargetsId" TO "target_pembelajaran_id"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "learningTargetsEn" TO "target_pembelajaran_en"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "learningTargetsJa" TO "target_pembelajaran_ja"`,
    );
    await q.query(
      `ALTER TABLE "course" RENAME COLUMN "description" TO "deskripsi"`,
    );
    await q.query(`ALTER TABLE "course" RENAME COLUMN "locations" TO "lokasi"`);

    // course_technologies -> kelas_teknologi
    await q.query(
      `ALTER TABLE "course_technologies" RENAME COLUMN "courseId" TO "kelasId"`,
    );
    await q.query(
      `ALTER TABLE "course_technologies" RENAME COLUMN "technologyId" TO "teknologiId"`,
    );

    // partner -> kerja_sama
    await q.query(`ALTER TABLE "partner" RENAME COLUMN "image" TO "gambar"`);

    // comments -> komentar
    await q.query(
      `ALTER TABLE "comments" RENAME COLUMN "comment" TO "komentar"`,
    );
    await q.query(
      `ALTER TABLE "comments" RENAME COLUMN "assignment_answerId" TO "jawaban_tugasId"`,
    );

    // logbook -> logbook
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "activity" TO "kegiatan"`,
    );
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "activity_details" TO "rincian_kegiatan"`,
    );
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "documentation" TO "dokumentasi"`,
    );
    await q.query(`ALTER TABLE "logbook" RENAME COLUMN "process" TO "proses"`);
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "obstacles" TO "kendala"`,
    );
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "other_documentation" TO "dokumentasi_lain"`,
    );
    await q.query(
      `ALTER TABLE "logbook" RENAME COLUMN "sessionId" TO "pertemuanId"`,
    );

    // mentor_logbook -> logbook_mentor
    await q.query(
      `ALTER TABLE "mentor_logbook" RENAME COLUMN "activity" TO "kegiatan"`,
    );
    await q.query(
      `ALTER TABLE "mentor_logbook" RENAME COLUMN "activityDetail" TO "rincian_kegiatan"`,
    );
    await q.query(
      `ALTER TABLE "mentor_logbook" RENAME COLUMN "documentation" TO "dokumentasi"`,
    );
    await q.query(
      `ALTER TABLE "mentor_logbook" RENAME COLUMN "obstacle" TO "kendala"`,
    );
    await q.query(
      `ALTER TABLE "mentor_logbook" RENAME COLUMN "sessionId" TO "pertemuanId"`,
    );

    // material -> materi
    await q.query(`ALTER TABLE "material" RENAME COLUMN "title" TO "judul"`);
    await q.query(
      `ALTER TABLE "material" RENAME COLUMN "fileType" TO "jenis_file"`,
    );
    await q.query(
      `ALTER TABLE "material" RENAME COLUMN "sessionId" TO "pertemuanId"`,
    );

    // mentors -> mentor
    await q.query(`ALTER TABLE "mentors" RENAME COLUMN "name" TO "nama"`);
    await q.query(
      `ALTER TABLE "mentors" RENAME COLUMN "courseId" TO "kelasId"`,
    );
    await q.query(`ALTER TABLE "mentors" RENAME COLUMN "position" TO "posisi"`);
    await q.query(
      `ALTER TABLE "mentors" RENAME COLUMN "description" TO "deskripsi"`,
    );

    // mentor_technologies -> mentor_teknologi
    await q.query(
      `ALTER TABLE "mentor_technologies" RENAME COLUMN "technologiesId" TO "teknologiId"`,
    );

    // mentoring -> mentoring
    await q.query(
      `ALTER TABLE "mentoring" RENAME COLUMN "courseId" TO "kelasId"`,
    );

    // weeks -> minggu
    await q.query(
      `ALTER TABLE "weeks" RENAME COLUMN "week_number" TO "minggu_ke"`,
    );
    await q.query(
      `ALTER TABLE "weeks" RENAME COLUMN "description" TO "keterangan"`,
    );
    await q.query(`ALTER TABLE "weeks" RENAME COLUMN "is_final" TO "akhir"`);
    await q.query(`ALTER TABLE "weeks" RENAME COLUMN "courseId" TO "kelasId"`);

    // mission -> misi
    await q.query(
      `ALTER TABLE "mission" RENAME COLUMN "missionOrder" TO "misi_ke"`,
    );
    await q.query(`ALTER TABLE "mission" RENAME COLUMN "items" TO "isi"`);

    // scores -> nilai
    await q.query(`ALTER TABLE "scores" RENAME COLUMN "score" TO "nilai"`);

    // paragraph -> paragraf
    await q.query(
      `ALTER TABLE "paragraph" RENAME COLUMN "paragraphOrder" TO "p_ke"`,
    );
    await q.query(
      `ALTER TABLE "paragraph" RENAME COLUMN "paragraphs" TO "paragraf"`,
    );

    // payments -> pembayaran
    await q.query(`ALTER TABLE "payments" RENAME COLUMN "process" TO "proses"`);
    await q.query(
      `ALTER TABLE "payments" RENAME COLUMN "courseId" TO "kelasId"`,
    );
    await q.query(
      `ALTER TABLE "payments" RENAME COLUMN "installmentId" TO "cicilanId"`,
    );

    // registrations -> pendaftaran
    await q.query(
      `ALTER TABLE "registrations" RENAME COLUMN "process" TO "proses"`,
    );
    await q.query(
      `ALTER TABLE "registrations" RENAME COLUMN "courseId" TO "kelasId"`,
    );

    // questions -> pertanyaan
    await q.query(
      `ALTER TABLE "questions" RENAME COLUMN "questionText" TO "pertanyaan_soal"`,
    );
    await q.query(`ALTER TABLE "questions" RENAME COLUMN "image" TO "gambar"`);

    // course_questions -> pertanyaan_kelas
    await q.query(
      `ALTER TABLE "course_questions" RENAME COLUMN "courseId" TO "kelasId"`,
    );
    await q.query(
      `ALTER TABLE "course_questions" RENAME COLUMN "question" TO "pertanyaan"`,
    );
    await q.query(
      `ALTER TABLE "course_questions" RENAME COLUMN "answer" TO "jawaban"`,
    );

    // faqs -> pertanyaan_umum
    await q.query(
      `ALTER TABLE "faqs" RENAME COLUMN "categoryId" TO "kategoriId"`,
    );
    await q.query(
      `ALTER TABLE "faqs" RENAME COLUMN "question" TO "pertanyaan"`,
    );
    await q.query(`ALTER TABLE "faqs" RENAME COLUMN "answer" TO "jawaban"`);

    // session -> pertemuan
    await q.query(`ALTER TABLE "session" RENAME COLUMN "topic" TO "topik"`);
    await q.query(
      `ALTER TABLE "session" RENAME COLUMN "sessionOrder" TO "pertemuan_ke"`,
    );
    await q.query(`ALTER TABLE "session" RENAME COLUMN "date" TO "tanggal"`);
    await q.query(`ALTER TABLE "session" RENAME COLUMN "location" TO "lokasi"`);
    await q.query(
      `ALTER TABLE "session" RENAME COLUMN "start_time" TO "waktu_awal"`,
    );
    await q.query(
      `ALTER TABLE "session" RENAME COLUMN "end_time" TO "waktu_akhir"`,
    );
    await q.query(`ALTER TABLE "session" RENAME COLUMN "is_final" TO "akhir"`);
    await q.query(
      `ALTER TABLE "session" RENAME COLUMN "weeksId" TO "mingguId"`,
    );

    // portofolios -> portfolio
    await q.query(
      `ALTER TABLE "portofolios" RENAME COLUMN "image" TO "gambar"`,
    );
    await q.query(`ALTER TABLE "portofolios" RENAME COLUMN "title" TO "judul"`);
    await q.query(
      `ALTER TABLE "portofolios" RENAME COLUMN "description" TO "deskripsi"`,
    );
    await q.query(
      `ALTER TABLE "portofolios" RENAME COLUMN "courseId" TO "kelasId"`,
    );
    await q.query(
      `ALTER TABLE "portofolios" RENAME COLUMN "contentHtml" TO "content_html"`,
    );

    // week_progresses -> progres_minggu
    await q.query(
      `ALTER TABLE "week_progresses" RENAME COLUMN "process" TO "proses"`,
    );
    await q.query(
      `ALTER TABLE "week_progresses" RENAME COLUMN "weekId" TO "mingguId"`,
    );

    // session_progresses -> progres_pertemuan
    await q.query(
      `ALTER TABLE "session_progresses" RENAME COLUMN "isAttended" TO "absen"`,
    );
    await q.query(
      `ALTER TABLE "session_progresses" RENAME COLUMN "sessionId" TO "pertemuanId"`,
    );

    // quiz_progresses -> progres_quiz
    await q.query(
      `ALTER TABLE "quiz_progresses" RENAME COLUMN "process" TO "proses"`,
    );

    // quiz -> quiz
    await q.query(
      `ALTER TABLE "quiz" RENAME COLUMN "quiz_name" TO "nama_quiz"`,
    );
    await q.query(
      `ALTER TABLE "quiz" RENAME COLUMN "minimum_score" TO "nilai_minimal"`,
    );
    await q.query(`ALTER TABLE "quiz" RENAME COLUMN "weeksId" TO "mingguId"`);
    await q.query(`ALTER TABLE "quiz" RENAME COLUMN "duration" TO "durasi"`);

    // certificates -> sertifikat
    await q.query(
      `ALTER TABLE "certificates" RENAME COLUMN "certificate_file" TO "sertif"`,
    );
    await q.query(
      `ALTER TABLE "certificates" RENAME COLUMN "courseId" TO "kelasId"`,
    );

    // social -> social
    await q.query(
      `ALTER TABLE "social" RENAME COLUMN "instagram" TO "instragram"`,
    );
    await q.query(`ALTER TABLE "social" RENAME COLUMN "address" TO "alamat"`);
    await q.query(`ALTER TABLE "social" RENAME COLUMN "number" TO "nomor"`);
    await q.query(
      `ALTER TABLE "social" RENAME COLUMN "linkAddress" TO "link_alamat"`,
    );
    await q.query(
      `ALTER TABLE "social" RENAME COLUMN "videoYoutube" TO "video_youtube"`,
    );
    await q.query(
      `ALTER TABLE "social" RENAME COLUMN "linkForm" TO "link_form"`,
    );

    // superiority -> superiority
    await q.query(
      `ALTER TABLE "superiority" RENAME COLUMN "categoryId" TO "kategoriId"`,
    );

    // team -> team
    await q.query(`ALTER TABLE "team" RENAME COLUMN "name" TO "nama"`);
    await q.query(`ALTER TABLE "team" RENAME COLUMN "teamOrder" TO "team_ke"`);
    await q.query(
      `ALTER TABLE "team" RENAME COLUMN "description" TO "deskripsi"`,
    );
    await q.query(`ALTER TABLE "team" RENAME COLUMN "position" TO "posisi"`);

    // team_leads -> team_leads
    await q.query(`ALTER TABLE "team_leads" RENAME COLUMN "name" TO "nama"`);
    await q.query(
      `ALTER TABLE "team_leads" RENAME COLUMN "description" TO "deskripsi"`,
    );
    await q.query(
      `ALTER TABLE "team_leads" RENAME COLUMN "position" TO "posisi"`,
    );

    // technologies -> teknologi
    await q.query(`ALTER TABLE "technologies" RENAME COLUMN "name" TO "nama"`);
    await q.query(
      `ALTER TABLE "technologies" RENAME COLUMN "imgUrl" TO "img_url"`,
    );

    // about -> tentang
    await q.query(`ALTER TABLE "about" RENAME COLUMN "image" TO "gambar"`);
    await q.query(`ALTER TABLE "about" RENAME COLUMN "title" TO "judul"`);

    // assignments -> tugas
    await q.query(`ALTER TABLE "assignments" RENAME COLUMN "title" TO "judul"`);
    await q.query(
      `ALTER TABLE "assignments" RENAME COLUMN "sessionId" TO "pertemuanId"`,
    );

    // user -> user
    await q.query(
      `ALTER TABLE "user" RENAME COLUMN "verificationToken" TO "verifikasiToken"`,
    );
    await q.query(
      `ALTER TABLE "user" RENAME COLUMN "verificationTokenExpires" TO "verifikasiTokenExpires"`,
    );

    // user_courses -> user_kelas
    await q.query(
      `ALTER TABLE "user_courses" RENAME COLUMN "progress" TO "progres"`,
    );
    await q.query(
      `ALTER TABLE "user_courses" RENAME COLUMN "courseId" TO "kelasId"`,
    );

    // value -> value
    await q.query(
      `ALTER TABLE "value" RENAME COLUMN "valueOrder" TO "value_ke"`,
    );

    // visions -> visi
    await q.query(`ALTER TABLE "visions" RENAME COLUMN "visions" TO "visi"`);

    // ======================================================================
    //  BAGIAN 1'  Kembalikan nama tabel (41)
    //  Urutan dibalik: session -> pertemuan DULU, baru web_sessions -> session.
    // ======================================================================
    await q.query(`ALTER TABLE "attendance" RENAME TO "absen"`);
    await q.query(`ALTER TABLE "course_flow" RENAME TO "alur_kelas"`);
    await q.query(`ALTER TABLE "program_benefits" RENAME TO "benefit_kelas"`);
    await q.query(`ALTER TABLE "mentor_biodata" RENAME TO "biodata_mentor"`);
    await q.query(`ALTER TABLE "installment" RENAME TO "cicilan"`);
    await q.query(`ALTER TABLE "image_benefit" RENAME TO "gambar_benefit"`);
    await q.query(`ALTER TABLE "answers" RENAME TO "jawaban"`);
    await q.query(`ALTER TABLE "answer_task" RENAME TO "jawaban_tugas"`);
    await q.query(`ALTER TABLE "user_answers" RENAME TO "jawaban_user"`);
    await q.query(`ALTER TABLE "course_type" RENAME TO "jenis_kelas"`);
    await q.query(`ALTER TABLE "category" RENAME TO "kategori"`);
    await q.query(
      `ALTER TABLE "category_course_types" RENAME TO "kategori_jenis_kelas_jenis_kelas"`,
    );
    await q.query(`ALTER TABLE "course" RENAME TO "kelas"`);
    await q.query(
      `ALTER TABLE "course_technologies" RENAME TO "kelas_teknologi"`,
    );
    await q.query(`ALTER TABLE "partner" RENAME TO "kerja_sama"`);
    await q.query(`ALTER TABLE "comments" RENAME TO "komentar"`);
    await q.query(`ALTER TABLE "mentor_logbook" RENAME TO "logbook_mentor"`);
    await q.query(`ALTER TABLE "material" RENAME TO "materi"`);
    await q.query(`ALTER TABLE "mentors" RENAME TO "mentor"`);
    await q.query(
      `ALTER TABLE "mentor_technologies" RENAME TO "mentor_teknologi"`,
    );
    await q.query(`ALTER TABLE "weeks" RENAME TO "minggu"`);
    await q.query(`ALTER TABLE "mission" RENAME TO "misi"`);
    await q.query(`ALTER TABLE "scores" RENAME TO "nilai"`);
    await q.query(`ALTER TABLE "paragraph" RENAME TO "paragraf"`);
    await q.query(`ALTER TABLE "payments" RENAME TO "pembayaran"`);
    await q.query(`ALTER TABLE "registrations" RENAME TO "pendaftaran"`);
    await q.query(`ALTER TABLE "questions" RENAME TO "pertanyaan"`);
    await q.query(
      `ALTER TABLE "course_questions" RENAME TO "pertanyaan_kelas"`,
    );
    await q.query(`ALTER TABLE "faqs" RENAME TO "pertanyaan_umum"`);
    await q.query(`ALTER TABLE "portofolios" RENAME TO "portfolio"`);
    await q.query(`ALTER TABLE "week_progresses" RENAME TO "progres_minggu"`);
    await q.query(
      `ALTER TABLE "session_progresses" RENAME TO "progres_pertemuan"`,
    );
    await q.query(`ALTER TABLE "quiz_progresses" RENAME TO "progres_quiz"`);
    await q.query(`ALTER TABLE "certificates" RENAME TO "sertifikat"`);
    await q.query(`ALTER TABLE "technologies" RENAME TO "teknologi"`);
    await q.query(`ALTER TABLE "about" RENAME TO "tentang"`);
    await q.query(`ALTER TABLE "assignments" RENAME TO "tugas"`);
    await q.query(`ALTER TABLE "user_courses" RENAME TO "user_kelas"`);
    await q.query(`ALTER TABLE "visions" RENAME TO "visi"`);

    await q.query(`ALTER TABLE "session" RENAME TO "pertemuan"`);
    await q.query(`ALTER TABLE "web_sessions" RENAME TO "session"`);
  }
}
