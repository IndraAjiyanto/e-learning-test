import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTableAndColumn1785382749167 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

     await queryRunner.query(`CREATE TYPE installment_month_enum_new AS ENUM ('3');`);

  
    await queryRunner.query(`
        UPDATE installment
        SET month = '3'
        WHERE month IN ('6', '12');
    `);

    await queryRunner.query(`
        ALTER TABLE installment
        ALTER COLUMN month
        TYPE installment_month_enum_new
        USING month::text::installment_month_enum_new;
    `);

    await queryRunner.query(`
        DROP TYPE installment_month_enum;
    `);

    await queryRunner.query(`
        ALTER TYPE installment_month_enum_new
        RENAME TO installment_month_enum;
    `);

    await queryRunner.query(`ALTER TABLE "category_course_types_course_type" RENAME TO "category_course_types"`);

    
    await queryRunner.query(`DROP TABLE IF EXISTS "absen" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "alur_kelas" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "benefit_kelas" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "biodata_mentor" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "blog" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "collaborations" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "likes" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "like" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "kategori_blog" CASCADE;`); 
    await queryRunner.query(`DROP TABLE IF EXISTS "topic" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coment" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reply" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cicilan" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gambar_benefit" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jawaban" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jawaban_tugas" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jawaban_user" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jenis_kelas" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "kategori" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "kategori_blog" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "kategori_jenis_kelas_jenis_kelas" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "kelas" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "kelas_teknologi" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "kerja_sama" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "komentar" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "logbook_mentor" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "materi" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "mentor" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "minggu" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "misi" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "nilai" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "paragraf" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pembayaran" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pendaftaran" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "mentor_teknologi" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pertanyaan" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pertanyaan_kelas" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pertanyaan_program" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pertanyaan_umum" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pertemuan" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "portfolio" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "progres_minggu" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "progres_pertemuan" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "progres_quiz" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sertifikat" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "teknologi" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tentang" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "translation" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tugas" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "type_program_category" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_kelas" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "visi" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staging_proses" CASCADE;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    // WARNING: Irreversible migration.
    // Dropped tables cannot be restored automatically.
    // To revert, restore database from backup.
    }

}
