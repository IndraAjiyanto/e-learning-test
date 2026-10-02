# Arsip migration

File di folder ini **sengaja tidak dijalankan** TypeORM.

`src/data-source.ts` memuat migration dengan pola satu level:

```
migrations: ['dist/database/migrations/*.js']
```

Pola itu tidak memakai `**`, jadi subfolder `_archive/` tidak ikut terbaca.
Memindahkan file ke sini = menonaktifkannya, tanpa menghapus riwayatnya.
Untuk mengaktifkan lagi, cukup pindahkan kembali ke folder induk.

## Kenapa diarsipkan

**1. Semuanya menargetkan skema yang tabelnya sudah berbahasa Inggris**
(`course`, `payments`, `gallery`, `voucher`). Dijalankan pada database yang
tabelnya masih berbahasa Indonesia, semuanya gagal.

**2. `1785382749167-RenameTableAndColumn.ts` berbahaya.**
Meski namanya "Rename", isinya `DROP TABLE ... CASCADE` untuk ~50 tabel
Indonesia tanpa memindahkan datanya lebih dulu, lalu
`TRUNCATE TABLE migrations`. Method `down()`-nya kosong.
File inilah yang menyebabkan error `relation "installments" does not exist`.

**3. Rantai migration-nya sudah tidak utuh.**
Riwayat di database berisi 30 entri, sedangkan repo hanya menyisakan 11 file.
Migration yang justru melakukan pekerjaan rename sudah terhapus dari repo:

- `RenameIndonesianToEnglish1784519100000`
- `RefactorRemainingIndoEntities1785000000000`
- `RefactorIndonesianPropertiesToEnglish1786000000000`
- `RenameProcessEnumValues1787000000000`

Artinya repo ini memang sudah tidak bisa membangun skema dari nol.

## Penggantinya

Celah di atas ditutup oleh `1788100000000-RefactorDatabaseServer.ts`, yang
membawa skema lama langsung ke kondisi target dalam satu langkah, lengkap
dengan `down()` yang simetris.

## Apakah aman?

Ya. Semua migration di folder ini sudah tercatat di tabel `migrations` pada
database yang aktif, jadi menonaktifkan file-nya tidak mengubah apa pun di
sana — TypeORM hanya menjalankan migration yang **belum** tercatat.
