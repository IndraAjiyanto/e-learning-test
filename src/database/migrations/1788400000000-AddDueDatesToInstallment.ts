import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Menambahkan kolom `dueDates` pada tabel `installment`.
 *
 * Kolom ini bertipe `date[]` dan menyimpan tanggal tenggat (actual date)
 * untuk SETIAP cicilan secara terpisah. Nilainya ditentukan oleh super admin
 * saat membuat/mengedit data installment (jumlah elemen = jumlah bulan cicilan).
 */
export class AddDueDatesToInstallment1788400000000
  implements MigrationInterface
{
  name = 'AddDueDatesToInstallment1788400000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "installment" ADD "dueDates" date[] NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "installment" DROP COLUMN "dueDates"`);
  }
}