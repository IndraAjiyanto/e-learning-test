import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Menambahkan kolom `currentCourseId` dan `activityLabel` pada tabel
 * `user_activity`.
 *
 * Kolom-kolom ini dipakai fitur "Sedang Belajar" pada dashboard super admin:
 * saat user (role 'user') membuka endpoint dalam scope proses pembelajaran,
 * `currentCourseId` diisi course yang sedang dipelajari dan `activityLabel`
 * berisi label aktivitas (Materi/Quiz/Tugas/Absensi/Logbook/Belajar).
 *
 * Dua kolom ini nullable dan idempoten: penjaga di up() membuatnya aman
 * dijalankan berkali-kali dan di environment mana pun, termasuk yang kolomnya
 * terlanjur ada dari sinkronisasi skema otomatis di masa lalu.
 */
export class AddLearningScopeToUserActivity1788500000000 implements MigrationInterface {
  name = 'AddLearningScopeToUserActivity1788500000000';

  public async up(q: QueryRunner): Promise<void> {
    const [col] = await q.query(
      `SELECT to_regclass('public.user_activity') IS NOT NULL AS has_table`,
    );
    if (!col.has_table) {
      return;
    }

    const [currentCourseId] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'user_activity' AND column_name = 'currentCourseId'`,
    );
    if (!currentCourseId) {
      await q.query(`ALTER TABLE "user_activity" ADD "currentCourseId" uuid`);
    }

    const [activityLabel] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'user_activity' AND column_name = 'activityLabel'`,
    );
    if (!activityLabel) {
      await q.query(`ALTER TABLE "user_activity" ADD "activityLabel" varchar`);
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    const [col] = await q.query(
      `SELECT to_regclass('public.user_activity') IS NOT NULL AS has_table`,
    );
    if (!col.has_table) {
      return;
    }
    const [currentCourseId] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'user_activity' AND column_name = 'currentCourseId'`,
    );
    if (currentCourseId) {
      await q.query(
        `ALTER TABLE "user_activity" DROP COLUMN "currentCourseId"`,
      );
    }

    const [activityLabel] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'user_activity' AND column_name = 'activityLabel'`,
    );
    if (activityLabel) {
      await q.query(`ALTER TABLE "user_activity" DROP COLUMN "activityLabel"`);
    }
  }
}
