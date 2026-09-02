-- ============================================================================
--  PRE-STAMP RIWAYAT MIGRATION
--  Target: database  e-learning-server
-- ============================================================================
--  KENAPA FILE INI ADA
--  -------------------
--  `e-learning-server` baru mencatat 1 migration (Update1763965392821),
--  sedangkan `e-learning-migration` sudah mencatat 30.
--
--  Kalau `migration:run` dijalankan apa adanya, TypeORM akan menganggap
--  10 file migration di repo sebagai pending dan menjalankannya lebih dulu.
--  Itu BERBAHAYA, karena:
--
--    * Semua migration itu ditulis untuk nama tabel BAHASA INGGRIS
--      (course, payments, gallery, voucher). Di e-learning-server tabelnya
--      masih bernama kelas/pembayaran/kerja_sama, jadi akan gagal.
--
--    * RenameTableAndColumn1785382749167 -- meski namanya "Rename" --
--      isinya DROP TABLE ... CASCADE untuk ~50 tabel Indonesia TANPA
--      memindahkan datanya lebih dulu, lalu TRUNCATE tabel migrations.
--      down()-nya kosong. Menjalankannya = kehilangan data.
--
--  Migration SamakanSkemaDenganMigration1788100000000 sudah membawa
--  e-learning-server ke struktur yang identik 100% dengan
--  e-learning-migration (terverifikasi: 521/521 kolom, 66/66 foreign key),
--  jadi ke-10 migration lama itu memang tidak perlu dijalankan di sana.
--
--  CARA PAKAI
--  ----------
--   1. Backup dulu:
--        pg_dump -h localhost -U postgres -d e-learning-server -Fc \
--                -f e-learning-server-backup.dump
--
--   2. Jalankan file ini TERHADAP e-learning-server (bukan DB aktif):
--        psql -h localhost -U postgres -d e-learning-server \
--             -v ON_ERROR_STOP=1 -f prestamp-migrations.sql
--
--   3. Arahkan DB_NAME di .env ke e-learning-server, lalu:
--        npm run migration:run
--      TypeORM akan melihat hanya SATU migration pending, yaitu
--      SamakanSkemaDenganMigration1788100000000.
--
--   4. Kembalikan DB_NAME di .env seperti semula.
--
--  CATATAN
--  -------
--  Baris di bawah hanya MENANDAI migration sebagai sudah dijalankan.
--  Tidak ada satu pun struktur tabel yang diubah oleh file ini.
-- ============================================================================

BEGIN;

-- Cek kondisi awal (harus menampilkan 1 baris: Update1763965392821).
SELECT id, timestamp, name FROM migrations ORDER BY id;

-- Salin riwayat dari e-learning-migration.
-- ON CONFLICT tidak dipakai karena tabel migrations tidak punya unique
-- constraint pada name; duplikat dicegah lewat NOT EXISTS.
INSERT INTO migrations ("timestamp", "name")
SELECT v.ts, v.nm
FROM (VALUES
  (1763965392821, 'Update1763965392821'),
  (1782982222007, 'AddImgUrlToTeknologi1782982222007'),
  (1782476191801, 'Initial1782476191801'),
  (1782824964547, 'RemoveBlog1782824964547'),
  (1782873463849, 'AddGallery1782873463849'),
  (1782972227267, 'RemoveCommentandLikesTables1782972227267'),
  (1783310609134, 'RenameTableKerjaSamaToPartner1783310609134'),
  (1783313092793, 'AddColumncategoryPartnerAndAddNewTableCategoryPartner1783313092793'),
  (1783391823688, 'AddEnumOnBenefit1783391823688'),
  (1783396593733, 'AddEnumTypeKategori1783396593733'),
  (1784519100000, 'RenameIndonesianToEnglish1784519100000'),
  (1784615760037, 'SyncSchema1784615760037'),
  (1784634503734, 'RenameJoinTables1784634503734'),
  (1785000000000, 'RefactorRemainingIndoEntities1785000000000'),
  (1785000000001, 'RenameTechnologyJoinTables1785000000001'),
  (1785000000002, 'RenameMentorLogbook1785000000002'),
  (1786000000000, 'RefactorIndonesianPropertiesToEnglish1786000000000'),
  (1787000000000, 'RenameProcessEnumValues1787000000000'),
  (1788000000000, 'AddReferalSourceToPayments1788000000000'),
  (1785382749167, 'RenameTableAndColumn1785382749167'),
  (1786007252016, 'AddDateRegistrationColumn1786007252016'),
  (1786073840000, 'VoucherProgramManyToMany1786073840000'),
  (1786407684595, 'AddColumnTimeStartToCourse1786407684595'),
  (1786595254826, 'AddNoToGallery1786595254826'),
  (1786956574389, 'ArchitectureV21786956574389'),
  (1787041510551, 'PisahkanInvoiceDariPayment1787041510551'),
  (1787184200000, 'AddPaymentUserIdentityColumns1787184200000'),
  (1787200000000, 'AddColumnsToRegistrations1787200000000'),
  (1787900000000, 'AddHeroSectionImageToCategory1787900000000'),
  (1787797726336, 'AddParticipantsTable1787797726336')
) AS v(ts, nm)
WHERE NOT EXISTS (
    SELECT 1 FROM migrations m WHERE m.name = v.nm
);

-- Verifikasi: harus 30 baris, dan
-- SamakanSkemaDenganMigration1788100000000 TIDAK boleh ada di sini.
SELECT COUNT(*) AS total_tercatat FROM migrations;

SELECT name FROM migrations
WHERE name = 'SamakanSkemaDenganMigration1788100000000';
-- ^ harus 0 baris. Kalau ada isinya, migration barunya akan ikut di-skip.

COMMIT;

-- ============================================================================
--  MEMBATALKAN (kalau perlu)
-- ============================================================================
--  DELETE FROM migrations WHERE name <> 'Update1763965392821';
-- ============================================================================
