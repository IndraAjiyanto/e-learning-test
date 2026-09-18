# Rencana: tabel `syllabus` sendiri untuk program non-bootcamp

> **Tanggal:** 2026-09-18
> **Keputusan pemilik:** silabus dibuatkan tabelnya sendiri (opsi A, pemisahan
> penuh), bukan menumpang `session`. Perlu dicocokkan dari sisi admin, super
> admin, dan user.

> **Melanjutkan pekerjaan ini?** Baca `docs/syllabus-HANDOVER.md` LEBIH DULU -
> di sana ada keadaan terkini, rencana rinci S3-S7, jebakan yang sudah memakan
> waktu, dan cara menjalankan pemeriksaannya. Satu hal yang perlu diketahui
> sejak awal: antarmuka student untuk program SPL SENGAJA masih gelap sampai
> S3 selesai.

S0-S2 sudah jadi kode (lihat bagian 7). Bagian selebihnya masih rencana.

---

## 0. Ralat atas rekomendasi sebelumnya

Saya sempat menyarankan tetap satu tabel dengan alasan "silabus dan sesi punya
anak yang sama persis". Setelah keenam tabel anak dibaca satu per satu, **alasan
itu tidak sepenuhnya benar**, dan pemisahan punya dasar yang lebih kuat daripada
yang saya akui:

| Anak `session` | Berlaku untuk silabus? |
|---|---|
| `material` | ya, identik |
| `assignments` | ya, identik |
| `attendance` | **tidak** — SPL belajar mandiri, tidak ada kehadiran |
| `mentor_logbook` | **tidak** — `mentorship: 'none'` pada non-bootcamp |
| `logbook` | opsional, sudah ada sakelarnya |
| `session_progresses` | ya, tetapi isinya beda (lihat 2.3) |

Dua dari enam anak memang tidak punya arti di silabus, ditambah **empat kolom
`session` yang omong kosong untuk SPL**: `date`, `location`, `start_time`,
`end_time`. Jadi menumpang `session` berarti silabus selamanya membawa kolom
dan relasi yang tidak pernah dipakai — dan aturan buka-kuncinya terpaksa
dibengkokkan lewat "absensi" yang sebenarnya tidak terjadi.

Pemisahan bukan sekadar soal nama. Yang tetap saya pegang dari jawaban semula:
**ongkosnya nyata** (bagian 6), dan sebagian duplikasi tidak membeli apa-apa
(bagian 2.2).

---

## 1. Keadaan sekarang

Non-bootcamp memakai opsi A dari `docs/program-type-plan.md`: silabus adalah
`Session` di dalam **satu baris `weeks` tersirat** yang tidak pernah ditampilkan
(`CoursesService.ensureSyllabusContainer`).

Yang menggantung di `session` hari ini — 6 tabel, semuanya `ON DELETE CASCADE`:
`material`, `assignments`, `attendance`, `logbook`, `mentor_logbook`,
`session_progresses`.

Permukaan kode: 44 berkas TS, 91 berkas HBS, 89 rujukan `weeks.course`, ~20 rute
berkunci `:sessionId`.

Data yang perlu dipindah (per 2026-09-18) — **kecil, dan itu alasan bagus untuk
mengerjakannya sekarang**:

| | jumlah |
|---|---|
| program non-bootcamp | 3 |
| session (calon silabus) | 5 |
| attendance | 1 |
| session_progresses | 2 |
| material | 0 |
| assignments | 0 |

---

## 2. Bentuk yang diusulkan

### 2.1 `syllabus` — induknya langsung `course`, tanpa `weeks`

```
syllabus
  id            uuid pk
  courseId      uuid  -> course.id     ON DELETE CASCADE
  order         int   NOT NULL          -- urutan tampil
  title         varchar NOT NULL
  description   text NULL
  is_final      bool NOT NULL default false
  createdAt / updatedAt
  UNIQUE (courseId, order)
```

Perhatikan: **`courseId` langsung**, tidak lewat `weeks`. Wadah tersirat
dihapus — itulah setengah dari alasan memisahkan. Tidak ada `date`,
`location`, `start_time`, `end_time`.

`UNIQUE (courseId, order)` sengaja ada: urutan menentukan buka-kunci, dan
urutan ganda membuat "silabus sebelumnya" tidak terdefinisi. Tabel `session`
tidak punya penjagaan ini dan `previousSession` terpaksa mencari nilai terbesar
yang lebih kecil untuk menutupinya.

### 2.2 Materi dan tugas — DIPUTUSKAN: pisah penuh (2026-09-18)

> **Keputusan pemilik:** pisah penuh. Kolom kiri pada tabel di bawah yang
> dipakai. Catatan saya di bawahnya dibiarkan apa adanya sebagai jejak
> pertimbangan, bukan sebagai bantahan.
>
> **Konsekuensi yang baru terlihat saat dikerjakan:** pemisahan penuh merembet
> dua tingkat lebih dalam. `answer_task` menggantung di `assignments`, dan
> `comments` menggantung di `answer_task`. Jadi pohonnya tujuh tabel:
>
> ```
> syllabus
>  |- syllabus_material
>  |- syllabus_assignment
>  |    \- syllabus_answer_task
>  |         \- syllabus_comment
>  |- syllabus_logbook
>  \- syllabus_progress
> ```
>
> Enum TIDAK diduplikasi: `material_filetype_enum`, `answer_task_process_enum`,
> dan `logbook_process_enum` dipakai ulang. Itu kosakata bersama, bukan tabel
> bersama.

#### Jejak pertimbangan sebelum keputusan di atas

`material` dan `assignments` **tidak punya beda semantik sama sekali** antara
sesi dan silabus: berkas PDF tetap berkas PDF. Menduplikasinya berarti dua jalur
unggah, dua CRUD admin, dua penampil materi, dua alur jawab tugas — tanpa satu
pun perbedaan perilaku.

Dua pilihan, dan ini perlu jawaban pemilik (pertanyaan 1 di bagian 8):

| | A-penuh | A-ramping |
|---|---|---|
| Bentuk | `syllabus_material`, `syllabus_assignment` terpisah | `material`/`assignments` dapat kolom `syllabusId` nullable di samping `sessionId` |
| Jalur kode | dua, selamanya | satu, dengan satu cabang di titik induk |
| Jaminan FK | penuh di kedua sisi | penuh, ditambah CHECK "tepat satu induk terisi" |
| Ongkos | ~6 berkas service/controller + view baru | ~3 berkas disentuh |

Saya condong ke **A-ramping untuk materi dan tugas saja**, dengan pemisahan
penuh untuk sisanya. Itu memisahkan yang memang berbeda dan berbagi yang memang
sama. Tetapi kalau pemilik ingin pemisahan benar-benar penuh, rencana ini tetap
jalan — tinggal pilih kolom kiri.

### 2.3 `syllabus_progress` — menggantikan absensi, bukan menirunya

```
syllabus_progress
  id            uuid pk
  syllabusId    uuid -> syllabus.id  ON DELETE CASCADE
  userId        uuid -> user.id      ON DELETE CASCADE
  completedAt   timestamp NULL        -- diisi saat student menandai selesai
  logbookOk     bool NOT NULL default false
  createdAt / updatedAt
  UNIQUE (syllabusId, userId)
```

Inilah bagian yang paling diuntungkan pemisahan. Hari ini SPL memakai
`attendance` + `session_progresses.isAttended` untuk sesuatu yang bukan
kehadiran — student tidak "hadir" di kelas mandiri, ia **menyelesaikan** materi.
`completedAt` menyebut keadaan itu apa adanya, dan sekaligus menghapus
`AttendanceService.openNextSessionWhenLogbookIsOff` — tambalan yang ada semata
karena baris progres sesi berikutnya hanya pernah dibuat saat logbook disetujui.

`UNIQUE (syllabusId, userId)` mencegah baris progres ganda; `session_progresses`
tidak punya penjagaan ini dan kodenya menambalnya dengan pola upsert manual di
lima tempat.

### 2.4 Logbook — ikut pisah penuh

`syllabus_logbook` berdiri sendiri, mengikuti keputusan 2.2. Kolomnya sama
dengan `logbook` (`activity`, `activity_details`, `documentation`, `process`,
`obstacles`, `other_documentation`) dengan induk `syllabusId` menggantikan
`sessionId`, dan memakai ulang `logbook_process_enum`.

Catatan: logbook sudah punya sakelar per program dan pada SPL biasanya mati,
jadi tabel ini kemungkinan besar kosong untuk sementara. Itu konsekuensi yang
diterima dari pemisahan penuh, bukan kelalaian.

### 2.5 Kuis — DIPUTUSKAN: satu per silabus (2026-09-18)

> **Keputusan pemilik:** satu kuis per SILABUS, bukan per program.

Dengan wadah `weeks` dihapus, kuis non-bootcamp kehilangan rumahnya
(`quiz.weeksId`). Rumah barunya `quiz.syllabusId` — migrasi `1788900000000`.

S0 sempat menambahkan `quiz.courseId` dengan asumsi satu kuis per program,
karena pertanyaannya belum terjawab saat itu. Kolom itu sekarang **dibuang**,
bukan dibiarkan menganggur: kolom mati yang tidak pernah dipakai adalah jebakan
untuk orang berikutnya. Nol baris terdampak — tidak ada satu pun kuis
non-bootcamp saat koreksi ini dikerjakan.

`capabilitiesFor().quizScope` ikut berubah dari `'program'` menjadi
`'syllabus'`.

---

## 3. Yang berubah di tiga sisi

### 3.1 User

Sudah paling dekat. Yang tersisa:

- `start_learning/index.hbs` — cabang `caps.structure === 'syllabus'` sekarang
  membaca `minggu[0].session`; berubah jadi membaca `silabus` langsung.
- Halaman detail: rute baru `GET /program/syllabus/detail/:syllabusId`
  bersanding dengan `session/detail/:sessionId` yang tetap untuk bootcamp.
- Tombol "Mark attendance" pada tab Attendance berganti jadi "Mark complete",
  dan tab itu sendiri sebaiknya berganti nama untuk SPL — lihat pertanyaan 4.
- 16 label "session/week" mengikuti `caps.unitLabel`.

### 3.2 Admin

Beban terbesar: **61 label** menyebut session/week, ditambah CRUD-nya.

- Tab "Week" pada detail program → "Silabus" untuk program SPL, dan daftarnya
  datar (tanpa lapisan minggu).
- Form tambah/ubah silabus: tanpa tanggal, jam, lokasi. Ini bukan sekadar
  menyembunyikan medan — tabelnya memang tidak punya kolomnya.
- CRUD materi dan tugas mengikuti keputusan 2.2.
- Layar absensi tidak muncul untuk program SPL; diganti daftar "siapa sudah
  menyelesaikan silabus apa".

### 3.3 Super admin

**Nol label** yang menyebut session/week — super admin hanya melihat program,
bukan isinya. Yang perlu dipastikan hanya: hitungan pada dasbor dan laporan
tidak diam-diam melewatkan silabus karena hanya menghitung `session`.
`CoursesService.findLearningStats` dan `findWeekSummaries` keduanya
menghitung lewat `session` → keduanya harus sadar silabus.

---

## 4. Perpindahan data

Kecil, dan seluruhnya bisa dilakukan di dalam satu migrasi:

1. Untuk tiap course `non_bootcamp`: buat baris `syllabus` dari tiap `session`
   di bawah wadah tersiratnya, `order` diambil dari `sessionOrder`.
2. `material`/`assignments` ikut pindah induknya (atau dapat `syllabusId`,
   tergantung 2.2).
3. `session_progresses` → `syllabus_progress`: `isAttended = true` menjadi
   `completedAt = updatedAt` (perkiraan terbaik yang kita punya; tidak ada
   stempel waktu penyelesaian yang sebenarnya).
4. `attendance` milik program SPL **dibuang** setelah nomor 3 — datanya sudah
   terwakili `completedAt`. 1 baris hari ini.
5. Wadah `weeks` tersirat milik program SPL dihapus, beserta `week_progresses`-nya.

`down()` harus bisa mengembalikan semuanya; karena jumlahnya kecil, ini murah.
**Tetapi** perlu dicatat: `completedAt` hasil migrasi adalah perkiraan, dan
`down()` tidak bisa mengembalikan baris `attendance` yang dibuang dengan
stempel waktu aslinya.

---

## 5. Tahapan kerja

Disusun supaya tiap tahap bisa dikirim sendiri dan bootcamp tidak pernah
tersentuh.

| Tahap | Isi | Risiko |
|---|---|---|
| ~~**S0**~~ | **Selesai.** Migrasi `1788700000000`: tujuh tabel + `quiz.courseId`. Diuji turun-naik, ketiga UNIQUE diuji menolak duplikat, CASCADE diuji menyapu anak. | rendah |
| ~~**S1**~~ | **Selesai.** Tujuh entity + `SyllabusService` + `SyllabusModule`. Diuji 11 perkara terhadap basis data sungguhan (urutan otomatis, rantai buka-kunci, penolakan silabus terkunci di server, idempoten, gerbang logbook, perapatan urutan setelah hapus, reorder, CASCADE). `schema:log` bersih dari drift buatan sendiri. | rendah |
| ~~**S2**~~ | **Selesai.** Migrasi `1788800000000`. 5 sesi -> 5 silabus, 2 progres, 1 absensi dibuang. Bootcamp tidak tersentuh (12 sesi, 6 absensi, tetap). Diuji turun-naik dua kali. **PERINGATAN: antarmuka student SPL gelap sampai S3** - datanya sudah pindah, tampilannya belum. | **sedang** |
| ~~**S3**~~ | **Selesai.** Fragment bercabang ke template silabus sendiri, halaman detail `/program/syllabus/detail/:id`, tombol Mark complete, tab Attendance disembunyikan untuk silabus. design-check `non-bootcamp-program` 23/23. | sedang |
| **S4** | **SEBAGIAN.** Selesai: CRUD silabus (`/program/syllabus/manage/:courseId`), tautan dari detail program, tab Week disembunyikan untuk SPL. **Belum:** CRUD materi & tugas silabus, layar penyelesaian pengganti absensi, sapuan 61 label. | **besar** |
| ~~**S5**~~ | **Selesai.** `findLearningStats` bercabang ke `findSyllabusStats` dengan bentuk kembalian yang sama persis. SPL 0/0 menjadi 3/3. | sedang |
| ~~**S6**~~ | **Selesai.** Ketiganya dibuang; `start_learning/index.hbs` kembali murni bootcamp. | rendah |
| ~~**S7**~~ | **Selesai.** Layar `non-bootcamp-program` 30 pemeriksaan, termasuk jaring pengaman bahwa bootcamp tidak berubah. | rendah |

Gerbang yang sudah ada dipakai di tiap tahap: `npx tsc --noEmit`,
`npm run build`, `./scripts/check-user-area.sh`, `npm run test:ui`.

---

## 6. Ongkos yang harus diterima dengan mata terbuka

1. **Dua jalur kode, selamanya.** Tiap fitur belajar baru harus dikerjakan dua
   kali, atau sengaja diputuskan hanya berlaku di salah satunya. Ini ongkos
   yang tidak hilang setelah pekerjaan ini selesai.
2. **`user.id` dan `course.id` jadi satu-satunya jembatan.** Query yang ingin
   "semua aktivitas belajar seorang student" harus UNION dua cabang.
   `findLearningStats` termasuk.
3. **Bootcamp tidak boleh ikut berubah.** 245/246 pemeriksaan yang ada sekarang
   adalah jaring pengamannya, dan S7 menambah pemeriksaan bahwa bootcamp tetap
   utuh.
4. **Sebagian duplikasi tidak membeli apa-apa** — lihat 2.2. Kalau A-penuh yang
   dipilih, ongkos ini disadari, bukan kecelakaan.

---

## 7. Yang tidak berubah

- Seluruh jalur bootcamp: `weeks`, `session`, `attendance`, `mentor_logbook`.
- `program-type.ts` tetap satu-satunya penerjemah tipe program menjadi
  kapabilitas; `structure: 'syllabus'` sekarang benar-benar berarti tabel lain,
  bukan sekadar tampilan lain.
- Sakelar `logbook_enabled` dan aturannya.

---

## 8. Yang perlu jawaban pemilik

1. ~~**Materi dan tugas: tabel sendiri, atau kolom `syllabusId`?**~~
   **Terjawab 2026-09-18: pisah penuh.** Lihat 2.2, termasuk rembetannya ke
   `answer_task` dan `comments`.
2. ~~**Absensi pada SPL benar-benar dihapus?**~~
   **Terjawab 2026-09-18: ya, dihapus, pakai `completedAt`.** Ini menegaskan
   rancangan yang sudah terpasang sejak S0 - tidak ada tabel absensi silabus,
   penyelesaian dicatat `syllabus_progress.completedAt`, dan absensi milik
   program SPL sudah dibuang di S2.

   Konsekuensi yang kini pasti: `AttendanceService.openNextSessionWhenLogbookIsOff`
   memang boleh dibuang di S6. Tambalan itu hanya pernah ada karena silabus
   dulu menumpang sesi dan membutuhkan absensi untuk membuka sesi berikutnya.
3. ~~**Kuis non-bootcamp: satu per program, atau satu per silabus?**~~
   **Terjawab 2026-09-18: satu per SILABUS.** Sudah dikerjakan - migrasi
   `1788900000000`, `quiz.syllabusId` menggantikan `quiz.courseId`. Lihat 2.5.
4. **Tab "Attendance" untuk SPL sebaiknya bernama apa?** Isinya jadi daftar
   penyelesaian silabus. *Usul: "Progress"*.
5. **Istilah di antarmuka: "Silabus" atau "Syllabus"?** Kode dan nama tabel
   memakai Inggris (`syllabus`); yang ditanya di sini label yang dilihat
   student. Sisa antarmuka student berbahasa Inggris, jadi *usul: "Syllabus"*,
   dengan terjemahan id/ja lewat i18n seperti label lain.
