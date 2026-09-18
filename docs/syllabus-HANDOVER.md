# Serah terima: tabel `syllabus` untuk program non-bootcamp

> **Untuk siapa:** orang berikutnya yang melanjutkan pekerjaan ini.
> **Tanggal:** 2026-09-18
> **Cabang:** `ragil-dev`
> **Rencana lengkap:** `docs/syllabus-table-plan.md` (baca itu dulu, satu kali)

---

## 1. BACA INI DULU — keadaan per 2026-09-18

**Program non-bootcamp SELESAI.** Ketujuh tabel silabus yang dibuat di S0 kini
benar-benar terpakai — dibaca DAN ditulis lewat antarmuka, bukan cuma ada di
skema.

| Tabel | Dipakai untuk |
|---|---|
| `syllabus` | CRUD admin, daftar dan detail student |
| `syllabus_material` | materi: PDF diunggah, PPT/video berupa tautan |
| `syllabus_assignment` | tugas yang dipasang admin |
| `syllabus_answer_task` | jawaban student, satu per student per tugas |
| `syllabus_comment` | komentar mentor atas jawaban |
| `syllabus_logbook` | logbook student, disetujui mentor |
| `syllabus_progress` | tandai selesai, `logbookOk`, layar penyelesaian |

Kuis per silabus juga sudah tersambung (`quiz.syllabusId`), bukan lagi cuma
kolom di basis data.

`design-check` **258/259** — satu kegagalan adalah celah lama `week pagination`
yang butuh PRD tersendiri, bukan bagian dari pekerjaan ini. Ditambah empat
pemeriksa sisi silabus: **23 + 20 + 26 + 19 + 6**.

**Tidak ada entity maupun migrasi baru sejak S0.** Semua tabelnya memang sudah
dirancang dari awal; yang kurang selama ini cuma kode yang memakainya.

---

## 2. Keadaan sekarang

| Tahap | Keadaan | Commit |
|---|---|---|
| S0 tabel | selesai | `d32edd7f` |
| S1 entity + service | selesai | `bad11d0f` |
| S2 perpindahan data | selesai | `6e57aeca` |
| S3 sisi student | selesai | `34fc2bcc` |
| S4 sisi admin | selesai | `3bea0076` + commit ini |
| S5 hitungan | selesai | `4dbcc175` |
| S6 buang jalur lama | selesai | `4dbcc175` |
| S7 pemeriksaan | selesai | `3bea0076` |

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

## 3. S3 — sisi student (SUDAH SELESAI, catatan ini disimpan sebagai jejak)

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

## 4b. Temuan saat mengerjakan S4 — baca sebelum melanjutkan

Empat hal yang ditemukan sambil jalan. Dua sudah diperbaiki, dua masih terbuka.

### Sudah diperbaiki

**Kepala kuis admin selalu menulis "Week " tanpa angka.**
`src/views/admin/quiz/detail.hbs` membaca `{{quiz.weeks.week_number}}` — itu
nama KOLOM di basis data, sedangkan properti entity-nya `weekNumber`. Handlebars
diam saja untuk properti yang tidak ada, jadi selama ini kepala halaman berbunyi
"Full Stack Developer · Week " dengan angka kosong, dan tidak ada yang
menyadarinya. Sekarang `weekNumber`, dan ada cabang untuk kuis silabus yang
memang tidak punya `quiz.weeks`.

**Minggu masih bisa dibuat pada program silabus lewat rute langsung.**
`3bea0076` menyembunyikan tab "Week" untuk program SPL, tetapi tab yang
disembunyikan bukan penjagaan — `POST /week/:courseId` tetap melayani siapa pun
yang memanggilnya, dan minggu yang terlanjur dibuat membuat satu program punya
dua struktur sekaligus. Penjaganya sekarang ada di `weeks.service.create()`,
memakai `capabilitiesForCourse()` supaya tetap satu sumber kebenaran.
Dibuktikan dengan kontrol: payload yang sama membuat minggu pada program
bootcamp, dan ditolak pada program silabus.

### Masih terbuka

**Tujuh baris drift `schema:log` yang bukan dari pekerjaan ini.**
Semuanya pada `payments`, `installment`, dan `gallery` — tabel yang tidak
disentuh rangkaian silabus, berasal dari cabang `test-back-office` yang sudah
digabung. Nol drift pada tabel silabus/kuis/course. Jangan kira ini akibat
pekerjaan silabus.

**Empat berkas seed menunjuk gambar yang tidak ada di disk.**
Avatar admin dan dua gambar kategori. Muncul sebagai 404 diam-diam di setiap
halaman lewat shell bersama. Bukan perkara silabus; perbaikannya soal data seed.

### Sudah diperbaiki setelah itu — dan ini yang paling penting dibaca

**Program SPL berlogbook adalah jalan buntu, dan itu sudah hidup di data.**
`SyllabusService.isDone()` menuntut `logbookOk` kalau program menyalakan
logbook, sementara tidak ada satu pun cara menulis maupun menyetujui logbook
silabus. Akibatnya student bisa menekan "Mark complete" dan silabus berikutnya
terkunci selamanya. Ditemukan hidup di "TEST NON BOOTCAMP" (silabus 1
`completedAt` terisi, `logbookOk` false, silabus 2 dialihkan kembali) dan sudah
ditutup oleh layar logbook.

**Kuis per silabus baru ada di skema.** Sudah tersambung; lihat commit kuis.

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

**Hasil yang diharapkan sekarang: 258/259.** Satu kegagalan: celah
`week pagination` (lama, butuh PRD).
Kalau tiba-tiba turun ke ~170, itu tanda env var-nya hilang, bukan regresi.

### Menjalankan pemeriksaan sisi SILABUS

`design-check.mjs` masuk sebagai student dari awal sampai akhir, jadi jalur
silabus — yang butuh admin dan student bergantian — diperiksa berkas terpisah.
Keempatnya berdiri sendiri dan boleh dijalankan satu-satu:

```bash
SPL=af9279ec-3c6d-4737-a751-b186ca08c08e
LOGBOOK_ON=cd6d81fa-cebf-4f07-80d3-c8b929d4a5c7   # program yang logbooknya MENYALA

COURSE=$SPL ENROLLED=1 node test/ui/syllabus-admin-check.mjs        # 23
COURSE=$SPL              node test/ui/syllabus-submission-check.mjs # 20
COURSE=$SPL BOOTCAMP_QUIZ=1bb22d86-b0cf-5c8b-b7ac-9c7e4dde1642 \
                         node test/ui/syllabus-quiz-check.mjs       # 26
COURSE=$LOGBOOK_ON       node test/ui/syllabus-logbook-check.mjs    # 19

STUDENT_ID=<id student> DONE_COURSE=$SPL PARTIAL_COURSE=<SPL belum selesai> \
  LOGBOOK_COURSE=$LOGBOOK_ON BOOTCAMP_COURSE=<bootcamp> \
  node test/ui/syllabus-completion-check.mjs                         # 6
```

`syllabus-logbook-check` HARUS memakai program yang logbooknya menyala — itulah
yang diuji. Pada program yang logbooknya mati, formulirnya memang tidak muncul
dan pemeriksanya akan gagal dengan benar.

Keempatnya membersihkan keadaannya sendiri dan boleh dijalankan berulang kali.
`syllabus-logbook-check` menutup dengan menarik kembali persetujuan mentor -
sekaligus membuktikan aturannya: persetujuan yang dicabut mengunci lagi silabus
berikutnya. Tanpa langkah itu ia cuma bisa dijalankan sekali, dan jalan kedua
gagal karena keadaan sisa, bukan karena aplikasinya salah. Pemeriksa ini benar-benar menambah materi dan tugas lewat
formulir (termasuk satu unggahan PDF sungguhan), membacanya kembali dari daftar,
lalu menghapusnya lagi — basis data kembali seperti semula. Tanpa `COURSE` ia
**berhenti dengan status gagal**, bukan lulus diam-diam; pelajaran dari jebakan
`test:ui` di atas.

`ENROLLED` boleh dikosongkan; kalau diisi, jumlah baris pada layar penyelesaian
dibandingkan dengan jumlah pendaftar.

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
COURSE=... node test/ui/syllabus-admin-check.mjs                   # kalau menyentuh jalur silabus
COURSE=... node test/ui/syllabus-submission-check.mjs              #   (lihat bagian 6 untuk keempatnya)
COURSE=... node test/ui/syllabus-quiz-check.mjs
COURSE=... node test/ui/syllabus-logbook-check.mjs
npx typeorm-ts-node-commonjs schema:log -d ./src/data-source.ts   # kalau menyentuh entity
```

`check-user-area.sh` akan **menyalak** untuk berkas admin/super_admin yang
berubah. Itu memang aturannya, bukan kegagalan — sebutkan di deskripsi PR dan
minta review pemilik halaman super admin.

Diagram basis data ikut diperbarui kalau ada tabel baru:

```bash
# query ekstraksinya ada di docs/database-diagram.md
python3 docs/database-diagram.gen.py
```

Generatornya **berhenti dengan pesan** kalau ada tabel yang belum punya
kelompok — itu memang gunanya, jangan diakali.
