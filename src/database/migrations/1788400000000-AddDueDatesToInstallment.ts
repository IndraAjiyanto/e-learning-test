import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Menambahkan kolom `dueDates` pada tabel `installment`.
 *
 * Kolom ini bertipe `date[]` dan menyimpan tanggal tenggat (actual date)
 * untuk SETIAP cicilan secara terpisah. Nilainya ditentukan oleh super admin
 * saat membuat/mengedit data installment (jumlah elemen = jumlah bulan cicilan).
 */
export class AddDueDatesToInstallment1788400000000 implements MigrationInterface {
  name = 'AddDueDatesToInstallment1788400000000';

  private async hasColumn(q: QueryRunner): Promise<boolean> {
    const rows = await q.query(
      `SELECT 1 FROM information_schema.columns
        WHERE table_name = 'installment' AND column_name = 'dueDates'`,
    );
    return rows.length > 0;
  }

  public async up(q: QueryRunner): Promise<void> {
    // Penjaga idempoten. Pada basis data BARU, BaselineSchema sudah membuat
    // kolom ini (baseline dihasilkan dari entity, jadi isinya skema final) -
    // tanpa penjaga ini rangkaian migrasi dari nol berhenti di sini.
    if (await this.hasColumn(q)) return;
    await q.query(
      `ALTER TABLE "installment" ADD "dueDates" date[] NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    if (!(await this.hasColumn(q))) return;
    await q.query(`ALTER TABLE "installment" DROP COLUMN "dueDates"`);
  }
}
