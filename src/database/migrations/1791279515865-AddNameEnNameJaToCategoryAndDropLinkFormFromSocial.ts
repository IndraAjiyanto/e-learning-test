import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Menambahkan kolom multibahasa `name_en` & `name_ja` pada tabel `category`,
 * dan menghapus kolom `linkForm` dari tabel `social`.
 *
 * Kedua perubahan ini sebelumnya hanya ada di entity (mengandalkan
 * `SYNCHRONIZE=true`), sehingga migration dibuat idempoten: kolom yang sudah
 * ada/hilang karena synchronize tidak akan membuat migration gagal.
 */
export class AddNameEnNameJaToCategoryAndDropLinkFormFromSocial1791279515865 implements MigrationInterface {
  name = 'AddNameEnNameJaToCategoryAndDropLinkFormFromSocial1791279515865';

  public async up(q: QueryRunner): Promise<void> {
    for (const column of ['name_en', 'name_ja']) {
      const [existing] = await q.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = 'category' AND column_name = $1`,
        [column],
      );
      if (!existing) {
        await q.query(
          `ALTER TABLE "category" ADD "${column}" character varying NULL`,
        );
      }
    }

    const [linkForm] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'social' AND column_name = 'linkForm'`,
    );
    if (linkForm) {
      await q.query(`ALTER TABLE "social" DROP COLUMN "linkForm"`);
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    const [linkForm] = await q.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'social' AND column_name = 'linkForm'`,
    );
    if (!linkForm) {
      await q.query(
        `ALTER TABLE "social" ADD "linkForm" character varying NULL`,
      );
    }

    for (const column of ['name_en', 'name_ja']) {
      const [existing] = await q.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = 'category' AND column_name = $1`,
        [column],
      );
      if (existing) {
        await q.query(`ALTER TABLE "category" DROP COLUMN "${column}"`);
      }
    }
  }
}
