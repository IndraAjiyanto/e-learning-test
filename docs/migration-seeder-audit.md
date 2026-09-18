# Audit migrasi dan seeder — 2026-09-18

## Temuan utama: basis data ini TIDAK BISA dibangun dari nol

Diuji dengan membuat basis data kosong lalu menjalankan seluruh migrasi:

```
RefactorDatabaseServer1788100000000  -> "berhasil", tetapi 18 CREATE TABLE-nya
                                        dilewati penjaganya; hasilnya 0 tabel
ConvertIdsToUuid1788300000000        -> BERHENTI: "tidak menemukan satu pun
                                        tabel dengan primary key integer"
```

Sebabnya: basis data mencatat **29 migrasi**, tetapi hanya **18 berkasnya** yang
masih ada (7 aktif + 11 di `_archive`). Sebelas migrasi yang MEMBUAT skema
dasarnya sudah tidak punya berkas sama sekali.

Karena TypeORM menjalankan seluruh migrasi dalam **satu transaksi**, kegagalan di
tengah membatalkan yang sudah berhasil — jadi tidak ada jalan tengah: rangkaian
itu sukses seluruhnya, atau tidak menghasilkan apa-apa.

### Perbaikan

1. **`1787999999999-BaselineSchema`** (baru) — skema dasar hasil
   `migration:generate` dari entity. Berpenjaga: kalau tabel `course` sudah ada
   ia tidak melakukan apa pun, jadi aman pada basis data lama maupun kosong.
   `down()` sengaja kosong; membalikkan skema dasar berarti menghapus seluruh
   basis data.
2. **`ConvertIdsToUuid`** — "tidak menemukan apa-apa" dulu selalu dianggap
   kegagalan. Sekarang dibedakan: kalau tabel `course` ada berarti skemanya
   memang sudah uuid (sukses, tidak ada pekerjaan); kalau tidak ada, barulah
   dibatalkan.
3. **`AddDueDatesToInstallment`** — satu-satunya migrasi tanpa penjaga
   idempoten. Baseline sudah membuat kolomnya, jadi tanpa penjaga rangkaiannya
   berhenti di sini.

### Hasil sesudah perbaikan

```
nol -> 8 migrasi -> 3 seeder, sekali jalan, tanpa error
drift entity vs skema dari-nol : 0
```

Basis data **kerja** justru lebih kotor: 7 baris drift (`payments`, `gallery`)
dan 6 tabel yatim. Basis data yang dibangun dari nol bersih.

## Tabel yatim di basis data kerja

Ada di basis data kerja, tidak ada di skema dari-nol, dan tidak punya entity:

| tabel | baris | disebut kode |
|---|---|---|
| `collaborations` | 0 | 2 |
| `flow_category` | 2 | 1 |
| `image_benefit` | 2 | 1 |
| `our_experience` | 2 | 0 |
| `story` | 0 | 6 |
| `superiority` | 1 | 1 |

Peninggalan migrasi yang berkasnya hilang. **Tidak disentuh** — menghapus tabel
bukan pekerjaan audit, dan sebagian masih disebut kode (perlu diperiksa apakah
rujukannya hidup atau ikut mati).

`web_sessions` sempat masuk daftar ini tetapi BUKAN yatim: itu penyimpan sesi
`connect-pg-simple`, memang tidak punya entity, dan sudah dikecualikan di
`ConvertIdsToUuid`.

## Seeder

Ketiganya jalan bersih pada basis data dari-nol. Satu kekurangan diperbaiki:

**Seluruh hasil seed adalah bootcamp** — `syllabus` selalu 0. Developer yang
baru menyemai basis data tidak punya satu pun program SPL untuk dilihat atau
diuji. `user.seed.ts` sekarang juga membuat `Dasar Pemrograman Web (SPL)`
(non_bootcamp, logbook dimatikan) beserta 3 silabus, dan mendaftarkan student
contoh ke dalamnya.

Hasil seed sekarang: 4 program — 3 bootcamp + 1 non-bootcamp.

## Cara membangun ulang dari nol

```bash
docker exec elt-postgres psql -U postgres -c "CREATE DATABASE nama_db;"
DB_NAME=nama_db npx typeorm-ts-node-commonjs migration:run -d ./src/data-source.ts
DB_NAME=nama_db npm run seed && DB_NAME=nama_db npm run seed:content && DB_NAME=nama_db npm run seed:student
```

Diverifikasi berjalan bersih pada 2026-09-18.
