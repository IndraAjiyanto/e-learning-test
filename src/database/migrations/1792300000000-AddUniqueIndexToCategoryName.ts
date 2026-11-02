import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Menambahkan partial unique index pada kolom `name` di tabel `category`
 * dengan normalisasi huruf kecil (LOWER) dan pembersihan multiple whitespace (REGEXP_REPLACE + TRIM).
 *
 * Menerapkan Skenario A: exact word sequence match, case-insensitive, dan whitespace-normalized.
 * Idempoten menggunakan IF NOT EXISTS.
 */
export class AddUniqueIndexToCategoryName1792300000000 implements MigrationInterface {
  name = 'AddUniqueIndexToCategoryName1792300000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_category_name_unique_lower"
       ON "category" (LOWER(REGEXP_REPLACE(TRIM("name"), '\\s+', ' ', 'g')))
       WHERE "name" IS NOT NULL`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "IDX_category_name_unique_lower"`);
  }
}
