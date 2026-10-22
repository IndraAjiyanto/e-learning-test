import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Menambahkan kolom `no` (nomor urut) pada tabel `category`, dipakai untuk
 * mengurutkan kategori di navbar user.
 *
 * Idempoten karena `.env` memakai `SYNCHRONIZE=true` (kolom bisa sudah dibuat
 * synchronize sebelum migration ini jalan). Backfill mengisi baris lama urut
 * `createdAt` ASC (1..N) supaya urutan yang ada sekarang tidak berubah, dan
 * hanya menyentuh baris yang `no`-nya masih NULL.
 */
export class AddNoToCategory1791900000000 implements MigrationInterface {
  name = 'AddNoToCategory1791900000000';

  public async up(q: QueryRunner): Promise<void> {
    const hasColumn = (await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'category' AND column_name = 'no'`,
    )) as unknown[];

    if (!hasColumn.length) {
      await q.query(`ALTER TABLE "category" ADD "no" integer NULL`);
    }

    await q.query(
      `UPDATE "category" c
       SET "no" = t.rn
       FROM (
         SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
         FROM "category"
         WHERE "no" IS NULL
       ) t
       WHERE c.id = t.id`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    const hasColumn = (await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'category' AND column_name = 'no'`,
    )) as unknown[];

    if (hasColumn.length) {
      await q.query(`ALTER TABLE "category" DROP COLUMN "no"`);
    }
  }
}
