# Serah terima: tabel `syllabus` untuk program non-bootcamp

> **Untuk siapa:** orang berikutnya yang melanjutkan pekerjaan ini.
> **Tanggal:** 2026-09-18
> **Cabang:** `ragil-dev`
> **Rencana lengkap:** `docs/syllabus-table-plan.md` (baca itu dulu, satu kali)

---

## 1. BACA INI DULU — ada yang sengaja ditinggalkan rusak

**Antarmuka student untuk program non-bootcamp (SPL) sekarang GELAP.**

Datanya sudah pindah ke tabel `syllabus` (S2 selesai), tetapi tampilannya masih
membaca `weeks -> session` yang kini kosong untuk program SPL. Student yang
membuka program SPL melihat **"No weeks yet"**.

Ini **disengaja dan diketahui**, bukan bug yang terlewat. `design-check`
menangkapnya sebagai satu kegagalan:

```
DIFF non-bootcamp-program (16/17)
  ✗ syllabus sessions are listed — No weeks yet ...
```

Kegagalan itu **dibiarkan merah** sampai S3 menutupnya. Jangan dilonggarkan,
jangan di-skip — itu satu-satunya penanda otomatis bahwa pekerjaan ini belum
selesai.

**Program bootcamp tidak terpengaruh sama sekali** dan harus tetap begitu.

Dua keputusan rancangan yang paling mahal sudah dijawab pemilik (absensi SPL
dihapus, kuis per silabus) dan keduanya sudah selesai dikerjakan — jadi S3 bisa
dimulai tanpa menunggu siapa pun. Lihat bagian 5.

---

## 2. Keadaan sekarang

| Tahap | Keadaan | Commit |
|---|---|---|
| S0 tabel | selesai | `d32edd7f` |
| S1 entity + service | selesai | `bad11d0f` |
| S2 perpindahan data | selesai | `6e57aeca` |
| **S3 sisi student** | **belum — mulai dari sini, tidak ada yang menghalangi** | — |
| S4 sisi admin | belum | — |
| S5 hitungan & dasbor | belum | — |
| S6 buang jalur lama | belum | — |
| S7 pemeriksaan | belum | — |

Di luar rangkaian itu, satu pekerjaan tambahan sudah selesai:
`d6b734e1` — basis data kini bisa dibangun dari nol, dan seeder punya program
SPL. Lihat `docs/migration-seeder-audit.md`.

### Yang sudah ada dan tinggal dipakai

```
src/entities/syllabus*.entity.ts     7 entity
src/syllabus/syllabus.service.ts     aturan belajar (CRUD, buka-kunci, progres)
src/syllabus/syllabus.module.ts      sudah terdaftar di app.module
src/courses/program-type.ts          capabilitiesForCourse() -> caps
```

`SyllabusService` sudah menyediakan semua yang dibutuhkan S3 dan S4:

| Method | Untuk |
|---|---|
| `findForStudent(courseId, userId)` | daftar silabus + keadaannya (`LOCKED`/`OPEN`/`COMPLETED`) |
| `statsFor(courseId, userId)` | ringkasan kepala tab |
| `markComplete(syllabusId, userId)` | tombol "Mark complete" |
| `setLogbookApproved(...)` | dipanggil saat admin menyetujui logbook |
| `create / update / remove / reorder` | CRUD admin, urutan dijaga otomatis |
| `findOne(syllabusId)` | halaman detail (sudah memuat materials + assignments) |

Semuanya sudah diuji terhadap basis data sungguhan — 11 perkara, lihat commit
`bad11d0f`.

---

## 3. Rencana implementasi S3 — sisi student

**Tujuan:** kegagalan `design-check` di atas jadi hijau, tanpa menyentuh
bootcamp.

### S3.1 Fragment "Sessions" membaca silabus

`src/courses/courses.controller.ts:533` `myCourseFragment()` sekarang memuat
`minggu` lewat `findWeeks`. Tambahkan cabang:

```ts
const caps = capabilitiesForCourse(activeCourse);
if (caps.structure === 'syllabus') {
  const silabus = await this.syllabusService.findForStudent(activeCourse.id, id);
  return res.render('partials/user/sidebar_user_profile/my_learning/start_learning/syllabus', {
    course: activeCourse, silabus, caps, user: req.user, layout: false,
  });
}
// ... jalur bootcamp yang sudah ada, tidak disentuh
```

`CoursesModule` perlu meng-`imports: [SyllabusModule]` (SyllabusModule sudah
meng-export servicenya).

### S3.2 Template baru, bukan menambah cabang di template lama

Buat `partials/user/sidebar_user_profile/my_learning/start_learning/syllabus.hbs`.

**Jangan** menambah cabang `{{#if caps.structure}}` lagi di
`start_learning/index.hbs` — berkas itu sudah 600+ baris dengan Alpine yang
memuat sesi lewat fetch per minggu. Silabus tidak butuh fetch sama sekali
(datanya sudah lengkap dari server), jadi templatenya jauh lebih sederhana dan
berdiri sendiri lebih baik.

Bentuknya: daftar datar, satu baris per silabus, memakai `state` dari
`findForStudent`:

- `COMPLETED` — centang hijau, tautan "Open syllabus"
- `OPEN` — nomor, tombol utama, tautan "Open syllabus"
- `LOCKED` — ikon gembok, keterangan "Complete the previous syllabus..."

Pola barisnya sudah ada dan tinggal ditiru dari `attendance/index.hbs`
(kartu minggu + baris sesi) — bentuk visualnya sudah disetujui pemilik.

**Tiga cabang `caps.structure` yang sudah ada di `start_learning/index.hbs`
(baris 40, 147, 214, 219) harus DIHAPUS di S6**, karena berkas itu kembali
menjadi murni bootcamp. Jangan dihapus sekarang — biarkan sampai S3 terbukti
jalan.

### S3.3 Halaman detail silabus

Rute baru, bersanding dengan `session/detail/:sessionId`
(`courses.controller.ts:1146` — pakai itu sebagai contoh):

```
GET /program/syllabus/detail/:syllabusId
```

Isinya: materi, tugas, logbook (kalau `caps.logbookEnabled`), dan tombol
**"Mark complete"** yang memanggil `markComplete`.

**Penting:** `markComplete` sudah menolak silabus terkunci **di server**.
Jangan mengandalkan tombolnya disembunyikan saja.

### S3.4 Tab Attendance untuk SPL

Tab "Attendance" tidak punya arti pada SPL. Dua pilihan, dan ini **pertanyaan
terbuka nomor 4** (bagian 5 di bawah):

- ganti namanya jadi "Progress" dan isinya daftar penyelesaian silabus; atau
- sembunyikan tabnya seperti "My Logbook" disembunyikan saat sakelarnya mati
  (polanya ada di `user_profile/index.hbs`, cari `caps.logbookEnabled`).

Saya sarankan yang pertama — student tetap perlu melihat kemajuannya.

### S3.5 Definition of done S3

- [ ] `design-check` `non-bootcamp-program` kembali **17/17**
- [ ] bootcamp tetap: `start-learning` 36/37, `course-navigation` 16/16
- [ ] tidak ada 5xx dan tidak ada page error pada penelusuran lima layar
- [ ] tidak ada luapan mendatar di 390px

---

## 4. Rencana implementasi S4–S7

### S4 — sisi admin (paling berat: 61 label)

1. **Tab "Week" pada detail program** — `src/views/admin/course/detail.hbs:27`
   mendaftarkan tab `{name:'week',label:'Week',url:'/program/week/{{course.id}}'}`.
   Untuk program SPL, tab itu jadi "Syllabus" dan menunjuk rute CRUD silabus.
2. **CRUD silabus** — rute baru, contoh strukturnya ada di
   `src/weeks/weeks.controller.ts` (`@Post(':courseId')`, `@Get('formAdd/:id')`,
   `@Patch('update/:weeksId')`, `@Delete(':id/:courseId')`).
   Formnya **tanpa tanggal, jam, lokasi** — tabelnya memang tidak punya kolomnya.
3. **CRUD materi dan tugas silabus** — `syllabus_material` dan
   `syllabus_assignment` sudah ada tabelnya; belum ada service/controller.
4. **Layar absensi tidak muncul untuk program SPL**; diganti daftar "siapa sudah
   menyelesaikan silabus apa" dari `syllabus_progress`.
5. **61 label** yang menyebut session/week mengikuti `caps.unitLabel`.

> Peringatan: `./scripts/check-user-area.sh` akan menyalak karena berkas
> admin/super_admin berubah. Itu memang aturannya — sebutkan di deskripsi PR
> dan minta review pemilik halaman admin.

### S5 — hitungan dan dasbor

`CoursesService.findLearningStats` (`courses.service.ts:668`) dan
`findWeekSummaries` (`:847`) **keduanya menghitung lewat `session`**. Program
SPL sekarang tidak punya session, jadi keduanya mengembalikan nol.

Perlu cabang berdasarkan `caps.structure`, atau UNION dua jalur. Ini juga yang
membuat dasbor super admin ikut benar — super admin sendiri **nol label** yang
perlu diubah.

### S6 — buang jalur lama

Setelah S3–S5 terbukti jalan:

- `CoursesService.ensureSyllabusContainer` — wadah tersirat tidak diperlukan lagi
- `AttendanceService.openNextSessionWhenLogbookIsOff` — tambalan yang memang
  hanya ada karena silabus dulu menumpang sesi. **Sudah dipastikan pemilik
  (2026-09-18): absensi SPL dihapus, jadi ini boleh dibuang.**
- tiga cabang `caps.structure` di `start_learning/index.hbs`
- pertimbangkan: `capabilitiesForCourse().logbookEnabled` masih dipakai kedua
  jalur, **jangan** ikut dibuang

### S7 — pemeriksaan

- Tulis ulang layar `non-bootcamp-program` di `test/ui/design-check.mjs` untuk
  silabus (sekarang masih memeriksa "Silabus" sebagai teks sesi)
- **Tambah pemeriksaan bahwa bootcamp TIDAK berubah** — itu jaring pengaman
  utama seluruh pekerjaan ini

---

## 5. Pertanyaan yang masih menunggu jawaban pemilik

**Tidak ada lagi pertanyaan yang menghalangi.** Dua pertanyaan yang mahal
diubah belakangan sudah dijawab pemilik pada 2026-09-18, dan keduanya sudah
selesai dikerjakan. Sisanya murni soal label dan bisa diputuskan sambil jalan.

| # | Pertanyaan | Menghalangi | Keadaan |
|---|---|---|---|
| ~~2~~ | ~~Absensi pada SPL dihapus?~~ | — | **TERJAWAB: ya, pakai `completedAt`.** Sudah terpasang sejak S0; tidak ada tabel absensi silabus, absensi SPL dibuang di S2. Konsekuensinya `AttendanceService.openNextSessionWhenLogbookIsOff` pasti boleh dibuang di S6. |
| ~~3~~ | ~~Kuis: satu per program atau per silabus?~~ | — | **TERJAWAB: per SILABUS.** Sudah dikerjakan, `quiz.syllabusId` (migrasi `1788900000000`). `quiz.courseId` dibuang. |
| 4 | Tab "Attendance" untuk SPL jadi apa? | S3 | usul: "Progress" |
| 5 | Label: "Silabus" atau "Syllabus"? | S3, S4 | usul: "Syllabus", i18n untuk id/ja |

Nomor 4 dan 5 tinggal soal kata yang dilihat student. Usul di kolom kanan sudah
dipasang sebagai asumsi dan aman dilanjutkan; menggantinya nanti murah.

Nomor 3 dikerjakan pada hari yang sama saat belum ada satu pun kuis
non-bootcamp, jadi koreksinya **nol baris data**. Itu contoh konkret kenapa
pertanyaan seperti ini lebih murah dijawab lebih awal.

---

## 6. Cara menjalankan — BACA, ada jebakan

### Menyalakan aplikasinya

```bash
colima start                     # kalau Docker mati
docker start elt-postgres        # Postgres di port 5499
npm run build && npm run start:prod   # :3069
```

Login student contoh: `indra@gmail.com` / `12345678`

### Menjalankan pemeriksaan UI — JEBAKAN

`npm run test:ui` **diam-diam lulus dengan hasil palsu** kalau env var-nya tidak
diberikan. Ia akan membuka `/program/myProgram/undefined`, seluruh layar program
gagal, dan **tetap keluar dengan exit code 0**.

Selalu pakai:

```bash
IDS='{"uid":"<user id>","cid":"<course bootcamp>"}' \
EXTRA_IDS='{"sid":"<session>","qid":"<quiz>","splCid":"<course SPL>"}' \
npm run test:ui
```

Nilai untuk basis data lokal saat dokumen ini ditulis:

```
uid    72934b99-8bea-5d29-819a-f15e53b770b7
cid    07a12c71-b763-5044-8b5d-a2a3f82fb74b   (Full Stack Developer, bootcamp)
sid    29e0ff9f-9675-505d-a618-8dd5b83f0d32
qid    1bb22d86-b0cf-5c8b-b7ac-9c7e4dde1642
splCid af9279ec-3c6d-4737-a751-b186ca08c08e   (Dasar Pemrograman Web, SPL)
```

Kalau basis datanya disemai ulang, ambil lagi dengan query di
`docs/migration-seeder-audit.md`.

**Hasil yang diharapkan sekarang: 244/246.** Dua kegagalan, keduanya sudah
diketahui: celah `week pagination` (lama, butuh PRD) dan silabus (S3).
Kalau tiba-tiba turun ke ~170, itu tanda env var-nya hilang, bukan regresi.

### Membangun basis data dari nol

```bash
docker exec elt-postgres psql -U postgres -c "CREATE DATABASE nama_db;"
DB_NAME=nama_db npx typeorm-ts-node-commonjs migration:run -d ./src/data-source.ts
DB_NAME=nama_db npm run seed && DB_NAME=nama_db npm run seed:content && DB_NAME=nama_db npm run seed:student
```

Hasilnya 4 program: 3 bootcamp + 1 SPL beserta 3 silabus.

---

## 7. Jebakan lain yang sudah memakan waktu

1. **Menambah kunci i18n butuh `npm run build`, bukan restart.** Terjemahan
   dimuat dari `dist/i18n`.
2. **Helper `t` mengembalikan KUNCI-nya sendiri kalau tidak ketemu**, jadi
   `{{default (t 'x') 'fallback'}}` tidak pernah memicu fallback-nya.
3. **Akhiran baris campur.** `user_profile/index.hbs` punya 5 CR liar di
   berkas yang selebihnya LF. Skrip yang menormalkan seluruh berkas akan
   menghasilkan diff 710 baris. Sunting sebagai **byte**, jangan normalkan.
4. **Tanda kutip ganda di dalam `x-data="..."`** mematikan SELURUH Alpine di
   halaman itu, termasuk lewat komentar.
5. **`.where()` TypeORM MENGGANTI kondisi sebelumnya**, bukan menambah.
6. **`schema:log` adalah pemeriksaan yang `tsc` tidak bisa lakukan.** Entity
   bisa lolos typecheck tetapi tidak cocok dengan tabelnya — itu terjadi di S1
   dan memakan 32 baris drift. Jalankan setelah menyentuh entity.
7. **Perapatan urutan silabus** harus menaikkan nomor ke rentang kosong dulu
   baru menurunkan; menulis langsung 1..n ditolak `UNIQUE (courseId, order)`
   di tengah jalan.

---

## 8. Gerbang sebelum commit

```bash
npx tsc --noEmit
npm run build
./scripts/check-user-area.sh
IDS=... EXTRA_IDS=... npm run test:ui
npx typeorm-ts-node-commonjs schema:log -d ./src/data-source.ts   # kalau menyentuh entity
```

Diagram basis data ikut diperbarui kalau ada tabel baru:

```bash
# query ekstraksinya ada di docs/database-diagram.md
python3 docs/database-diagram.gen.py
```

Generatornya **berhenti dengan pesan** kalau ada tabel yang belum punya
kelompok — itu memang gunanya, jangan diakali.
