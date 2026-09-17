# Rencana: tiga tipe program (bootcamp, non-bootcamp, LPK)

> **Tanggal:** 2026-09-17
> **Permintaan pemilik:** pisahkan program menjadi tiga tipe — bootcamp,
> non-bootcamp (faster class dan starter class), dan LPK. LPK untuk sekarang
> sama persis dengan bootcamp. Implementasi yang ada sekarang adalah bootcamp.
> Bedanya: bootcamp memakai minggu dan tiap minggu berisi beberapa sesi;
> non-bootcamp memakai silabus, dan satu silabus setara satu sesi di bootcamp.
> Logbook pada non-bootcamp bersifat opsional, bisa dinyalakan atau dimatikan
> per program. Tipe program yang ada sekarang diubah perannya menjadi tag, dan
> tipe program yang baru memakai enum supaya perilaku program bisa disesuaikan
> per tipe di kemudian hari.

Dokumen ini rencana, belum ada kode yang diubah.

---

## 1. Temuan yang mengubah bentuk rencana

Sebelum menyusun langkah, tiga hal perlu diluruskan karena mengubah keputusan
desainnya.

### 1.1 Kata "tipe" hari ini dipakai di tiga tempat berbeda

| Yang ada sekarang | Isinya di database | Perilakunya |
|---|---|---|
| `category.name` | `Course`, `Short Clas`, `WIP` | dipakai untuk memilih template landing |
| `category.type` (enum) | `Paid Program`, `Free Program`, `Special Program` | **bercabang di kode** |
| `course_type.nameClassesType` | `Web Development` (satu baris saja) | **tidak bercabang sama sekali** |

`Category.type` sudah berupa enum dan sudah punya perilaku: `categories.controller.ts:146`
memilih salah satu dari tiga template berdasarkan nilainya.

`CourseType` justru tidak punya perilaku apa pun. Seluruh pemakaiannya hanya
join, filter dropdown, dan menampilkan label. Isinya pun satu baris bernama
"Web Development" — sebuah topik, bukan bentuk program.

**Artinya dugaan pemilik benar:** `CourseType` memang sudah berperilaku seperti
tag, tinggal diresmikan.

### 1.2 "Bootcamp" hari ini adalah nama kategori, bukan tipe program

Kata Bootcamp muncul sebagai `category.name` di seed (`content.seed.ts:111`) dan
dipakai langsung di beberapa tempat, misalnya `partials/footer.hbs:52` yang
menaut ke `/category/program/Bootcamp` dan `partials/special_program/program.hbs:4`
yang membandingkan `category.name` dengan `"Bootcamp"`.

Jadi enum `programType` yang baru **beririsan makna dengan `category`**, bukan
dengan `course_type`. Ini perlu keputusan pemilik; lihat pertanyaan terbuka
nomor 1 di bagian 9.

### 1.3 Menghapus satu tipe program hari ini ikut menghapus programnya

`course.courseTypeId` memakai `ON DELETE CASCADE` (FK `FK_b80ca1ff2ccdcc60c0a7662941c`).
Selama ini relatif aman karena tipe program jarang dihapus. Begitu ia menjadi
tag yang bebas dibuat dan dihapus admin, aturan ini berubah menjadi jebakan
kehilangan data: menghapus tag "Web Development" akan menghapus enam program.

**Ini harus ikut diperbaiki dalam pekerjaan ini**, bukan nanti.

---

## 2. Struktur belajar yang ada sekarang

```
Course
└── Weeks (week_number, is_final)
    ├── Quiz ── Question, Score, QuizProgress
    ├── WeekProgress (per user: process = minggu terbuka, quiz = lulus kuis)
    └── Session (sessionOrder, is_final)
        ├── Material   ├── Assignment ── AnswerTask
        ├── Attendance ├── Logbook     ├── MentorLogbook
        └── SessionProgress (per user: isAttended, logbook)
```

Dua lapis penguncian:

- **Minggu** — bukan dihitung, melainkan disimpan. Minggu terbuka bila ada baris
  `week_progresses` dengan `process = true` (`logic.helpers.ts:13`). Minggu 1
  dibuat saat pendaftaran (`courses.service.ts:254`), minggu berikutnya dibuat
  saat student lulus kuis minggu sebelumnya (`user_answers.service.ts:212`).
- **Sesi** — dihitung di sisi klien oleh `src/common/public/js/sessionUnlock.ts`.
  Sesi terbuka bila sesi dengan `sessionOrder` tepat sebelumnya sudah
  `isAttended` **dan** logbooknya disetujui (`sessionUnlock.ts:76`).

Yang penting untuk rencana ini: **lapisan sesi sudah tidak bergantung pada
minggu.** `sessionUnlock.ts` dan seluruh partial di
`program_detail/right_content/week/session/*` hanya butuh daftar sesi terurut
beserta `sessionProgress`, `logbooks`, dan `attendances`. Tidak satu pun
membaca nomor minggu.

Sebaliknya, ketergantungan pada minggu terkumpul di lima titik saja:

1. `findWeeks` dan `findMyCourse` (`courses.service.ts:550`, `:467`)
2. endpoint JSON `GET /program/session/:weeksId` dan `/program/quiz/:weeksId`
3. `WeekProgress` sebagai gerbang penguncian
4. `Quiz` yang induknya `Weeks`, bukan `Session` atau `Course`
5. perulangan `{{#each minggu}}` di template

Selebihnya — 30-an berkas yang menyebut `session.weeks.course` — hanya
menelusuri relasi untuk menemukan course-nya, dan akan tetap bekerja selama
setiap sesi masih punya induk minggu.

---

## 3. Keputusan model data

### 3.1 Enum `programType` baru di `course`

```ts
export type ProgramType = 'bootcamp' | 'non_bootcamp' | 'lpk';
```

Kolom `program_type` pada tabel `course`, NOT NULL, default `'bootcamp'`.
Seluruh delapan program yang ada ikut terisi `'bootcamp'` — sesuai kenyataan,
karena implementasi sekarang memang bootcamp.

### 3.2 `CourseType` menjadi Tag

Yang **tidak** diubah: nama tabel `course_type`, nama kolom, dan relasi
`ManyToOne` dari course. Mengubahnya berarti menyentuh sekitar 60 titik baca
(lihat daftar di bagian 4 laporan pemetaan) tanpa manfaat langsung.

Yang diubah:

- Label di seluruh antarmuka: "Program Type" menjadi "Tag".
- FK `courseTypeId` dari `ON DELETE CASCADE` menjadi `ON DELETE SET NULL`.
  Kolomnya sendiri sudah nullable, dan dua program memang sudah bernilai `NULL`
  hari ini, jadi aplikasinya sudah tahan nilai kosong — yang perlu diganti hanya
  aturan hapusnya. Diperiksa langsung ke basis data: `confdeltype` pada
  `FK_b80ca1ff2ccdcc60c0a7662941c` bernilai `c`, yaitu CASCADE.
- Rute `/type-program` tetap, dengan catatan di kode bahwa namanya warisan.

**Satu tag per program untuk sekarang.** Mengubahnya menjadi banyak tag berarti
tabel jembatan baru dan menyentuh setiap filter. Itu pekerjaan tersendiri;
dicatat sebagai lanjutan opsional di bagian 8, bukan bagian dari rencana ini.

### 3.3 Silabus bukan entitas baru

Pemilik menyebut "satu silabus setara satu sesi di bootcamp". Karena itu silabus
**tidak** perlu tabel sendiri — ia adalah `Session`.

Dua cara memberi sesi sebuah induk pada program non-bootcamp:

| | Opsi A — satu section tersirat | Opsi B — induk nullable |
|---|---|---|
| Bentuk | program non-bootcamp punya tepat satu baris `weeks`, silabusnya adalah sesi-sesi di dalamnya | `session.weeksId` nullable, ditambah `session.courseId` nullable |
| Perubahan skema | tidak ada | dua kolom + constraint "tepat satu induk terisi" |
| `findWeeks`, endpoint `:weeksId` | tetap jalan | harus ditulis ulang, bercabang |
| Induk Quiz | tetap punya rumah, menjadi kuis tingkat program | tidak punya rumah, harus dipindah |
| `WeekProgress` | menjadi penanda progres tingkat program | perlu tabel progres baru |
| 30-an berkas yang menelusuri `session.weeks.course` | tetap jalan | harus bercabang semua |
| Yang perlu disentuh | template + penulisan di admin | skema, seluruh query, seluruh template |
| Kejujuran model | ada satu baris `weeks` yang tak pernah tampil | model apa adanya |

**Rekomendasi: Opsi A.** Satu-satunya kelemahannya baris `weeks` yang tidak
pernah ditampilkan; imbalannya perubahan terbatas pada lapisan tampilan dan
penulisan, bukan pada seluruh query. Dengan data sekarang yang hanya 8 program,
9 minggu, dan 12 sesi, Opsi B pun murah dieksekusi — tetapi ongkosnya ada di
jumlah tempat yang harus bercabang, bukan di jumlah baris.

Supaya baris itu tidak terasa sebagai kebohongan, `Weeks` diberi arti yang lebih
umum di dokumentasinya: ia adalah **wadah urutan**. Bootcamp menampilkannya
sebagai "Week N"; non-bootcamp punya tepat satu dan tidak menampilkannya.

Kalau nanti non-bootcamp butuh kuis per silabus, barulah Opsi B dikerjakan —
dan saat itu pemindahan induk Quiz memang sudah tak terhindarkan.

### 3.4 Logbook opsional

Kolom `logbook_enabled` boolean pada `course`, default `true`.

---

## 4. Peta kapabilitas — inti dari "bisa disesuaikan nanti"

Ini bagian terpenting rencana. Pemilik ingin perilaku program bisa disesuaikan
per tipe di kemudian hari, dan LPK untuk sekarang sama dengan bootcamp. Kalau
kode bercabang langsung pada `programType === 'bootcamp'` di 40 tempat, maka
saat LPK mulai berbeda, keempat puluh tempat itu harus dicari ulang satu per
satu.

Karena itu: **kode tidak pernah membandingkan enum secara langsung.** Enum
diterjemahkan sekali menjadi kapabilitas, di satu berkas.

Usulan `src/courses/program-type.ts`:

```ts
export type ProgramType = 'bootcamp' | 'non_bootcamp' | 'lpk';

export interface ProgramCapabilities {
  /** 'weeks' menampilkan header minggu; 'syllabus' menampilkan sesi datar. */
  structure: 'weeks' | 'syllabus';
  /** Satuan yang dibuka berurutan. */
  unlockUnit: 'week' | 'session';
  /** Apakah admin boleh mematikan logbook pada program ini. */
  logbookConfigurable: boolean;
  /** Di mana kuis dipasang. */
  quizScope: 'week' | 'program';
  /** Istilah yang dipakai di antarmuka. */
  unitLabel: 'Week' | 'Silabus';
}

export function capabilitiesFor(type: ProgramType): ProgramCapabilities {
  switch (type) {
    case 'non_bootcamp':
      return { structure: 'syllabus', unlockUnit: 'session',
               logbookConfigurable: true, quizScope: 'program',
               unitLabel: 'Silabus' };
    case 'lpk':
    case 'bootcamp':
    default:
      return { structure: 'weeks', unlockUnit: 'week',
               logbookConfigurable: false, quizScope: 'week',
               unitLabel: 'Week' };
  }
}
```

LPK sengaja ditulis sebagai `case` tersendiri yang jatuh ke perilaku bootcamp,
bukan digabung. Saat LPK mulai berbeda, yang diubah hanya satu baris di berkas
ini.

Kapabilitas ini dikirim ke template sebagai satu objek `caps`, sehingga
Handlebars cukup menulis `{{#if (eq caps.structure 'weeks')}}` dan tidak pernah
menyebut nama tipe program.

---

## 5. Logbook opsional — dan satu jebakan yang harus ditangani lebih dulu

Menyembunyikan tombol logbook itu bagian yang mudah. Yang berbahaya ada di
logika penguncian.

Sesi berikutnya baru terbuka bila sesi sebelumnya `isAttended` **dan** logbooknya
disetujui (`sessionUnlock.ts:76`). Kolom `session_progresses.logbook` hanya
pernah diisi oleh `LogbookService.update` saat admin menyetujui sebuah logbook
(`logbook.service.ts:194`).

**Kalau logbook dimatikan, tidak ada yang pernah mengisi kolom itu, sehingga
sesi kedua dan seterusnya terkunci selamanya.** Program non-bootcamp yang
mematikan logbook akan mati total di sesi pertama.

Karena itu urutannya: perbaiki syarat penguncian dulu, baru sembunyikan
antarmukanya. `logbookApproved()` harus mengembalikan `true` begitu logbook
dimatikan untuk program tersebut, dan status "COMPLETED" pada sesi tidak lagi
menuntut logbook.

Titik yang harus memeriksa flag, dari laporan pemetaan logbook:

- **Antarmuka student** — `logbook_section.hbs` (empat cabangnya),
  tautan "My Logbook" di `program_info.hbs:54`, tombol tab di
  `start_learning/index.hbs:283`, panel tab di `user_profile/index.hbs:371`
  beserta daftar section yang diizinkan di `:37`.
- **Rute yang harus menolak** — enam rute student dan tiga rute admin di
  `logbook.controller.ts`, ditambah seluruh `logbooks-mentor` bila logbook
  mentor ikut dimatikan.
- **Penguncian** — `sessionUnlock.ts:68` dan `:129`, ditambah catatan gerbang
  absensi di `start_learning/attendance/index.hbs:202`.
- **Layar admin** — tab di `admin/session/detail.hbs:47`,
  `admin/course/detail.hbs:29`, `super_admin/course/detail.hbs:161`, tombol
  tambah di `logbook-toolbar.hbs:22`, tombol setujui/tolak di
  `logbook-table.hbs:122`.
- **Hitungan** — baris ringkasan di dashboard student
  (`dashboard/index.hbs:173`) memakai `findAllLogbooks` yang per-user, bukan
  per-program; perlu disaring per program.
- **Ekspor** — tombol Export Excel student dan admin.

Catatan: `LogbookService.findCapstoneProjects` (`logbook.service.ts:165`) sudah
rusak sejak lama, masih men-join nama tabel lama `pertemuan`/`minggu`/`kelas`.
Sebaiknya dihapus, bukan diberi flag.

---

## 6. Yang berubah di antarmuka

### 6.1 Student, program non-bootcamp

Panel Start Learning menampilkan daftar silabus datar, tanpa header minggu dan
tanpa kartu minggu terkunci. Setiap silabus tampil seperti baris sesi bootcamp
hari ini: materi, tugas, absensi, dan logbook bila dinyalakan.

Yang bisa dipakai ulang apa adanya: seluruh partial di
`program_detail/right_content/week/session/*` beserta `sessionUnlock.ts`.
Keduanya sudah tidak menyebut minggu.

Yang perlu bercabang: `start_learning/index.hbs` (perulangan `{{#each minggu}}`
di `:44`), `start_learning/attendance/index.hbs:143`,
`start_learning/quiz/index.hbs`, dan `sidebar_user_profile/assignment/index.hbs:12`.

### 6.2 Admin

- Form program mendapat pilihan **Program Type** (tiga nilai enum) dan sakelar
  **Logbook** yang hanya aktif bila `logbookConfigurable`.
- Kolom tipe yang lama berganti label menjadi **Tag**.
- Untuk program non-bootcamp, tab "Week" berganti menjadi "Silabus", dan tombol
  tambah langsung membuat sesi di dalam section tersirat — admin tidak pernah
  melihat atau membuat minggu.

---

## 7. Tahapan kerja

Disusun supaya setiap tahap bisa dikirim dan diuji sendiri, dan supaya tidak ada
tahap yang meninggalkan program dalam keadaan terkunci.

| Tahap | Isi | Risiko |
|---|---|---|
| **T0** | Migrasi: kolom `program_type` (default `'bootcamp'`), kolom `logbook_enabled` (default `true`), dan FK `courseTypeId` diganti menjadi `ON DELETE SET NULL`. Backfill terjadi sendiri lewat default. Berkas berikutnya memakai penomoran `1788600000000-...`, mengikuti pola yang ada. | rendah |
| **T1** | `program-type.ts` beserta `capabilitiesFor`, dan pengiriman objek `caps` ke seluruh view program. Belum ada perilaku yang berubah. | rendah |
| **T2** | Perbaiki syarat penguncian: `logbookApproved` menghormati `logbook_enabled`. Dikerjakan **sebelum** antarmuka logbook disembunyikan. | sedang |
| **T3** | Flag logbook di seluruh titik pada bagian 5. | sedang |
| **T4** | Admin: pilihan Program Type, sakelar Logbook, label Tag. | rendah |
| **T5** | Student: cabang `structure` pada empat template, tampilan silabus datar. | sedang |
| **T6** | Admin: penulisan silabus untuk non-bootcamp (section tersirat dibuat otomatis saat program dibuat). | sedang |
| **T7** | Kuis tingkat program untuk non-bootcamp, bila memang diperlukan (lihat pertanyaan 3). | tergantung jawaban |
| **T8** | Seed dan data contoh: satu program non-bootcamp dengan silabus, satu dengan logbook dimatikan. Tambahan pemeriksaan di `test/ui/design-check.mjs`. | rendah |

Gerbang yang sudah ada tetap dipakai di setiap tahap: `npx tsc --noEmit`,
`npm run build`, `./scripts/check-user-area.sh`, dan `npm run test:ui`.

---

## 8. Lanjutan opsional, di luar rencana ini

- Tag banyak per program (tabel jembatan, ubah setiap filter).
- Opsi B pada bagian 3.3, bila kuis per silabus benar-benar dibutuhkan.
- Membereskan data kategori: nilai `Short Clas` salah eja dan `WIP` tampaknya
  bukan kategori sungguhan.
- Menghapus `findCapstoneProjects` yang sudah rusak.
- Form ubah program masih mengirim nama medan warisan `jenis_kelasId`
  (`type_input.hbs:50`), ditoleransi oleh mapper. Layak dirapikan saat menyentuh
  form itu di T4.

---

## 9. Pertanyaan terbuka untuk pemilik

Enam hal berikut tidak bisa disimpulkan dari kode. Rekomendasi disertakan supaya
bisa dijawab cepat, atau dibiarkan kalau rekomendasinya sudah sesuai.

1. **Hubungan `programType` dengan `category`.** Hari ini "Bootcamp" adalah nama
   kategori, dan `category.type` sudah menentukan template landing.
   *Rekomendasi:* biarkan `category` mengurus sisi pemasaran (template landing,
   halaman kategori), dan `programType` mengurus sisi belajar (struktur, kunci,
   logbook). Keduanya tidak saling menggantikan. Kalau pemilik ingin keduanya
   digabung, itu pekerjaan tersendiri yang menyentuh seluruh halaman landing.

2. **Di mana "faster class" dan "starter class" hidup?** Keduanya disebut sebagai
   isi dari non-bootcamp.
   *Rekomendasi:* keduanya menjadi **tag**, sementara `programType` cukup
   `non_bootcamp`. Dengan begitu menambah varian baru tidak menuntut migrasi
   enum. Kalau keduanya perlu berperilaku berbeda, barulah ia pantas jadi nilai
   enum tersendiri.

3. **Apakah non-bootcamp punya kuis?** Kalau ya, per silabus atau per program?
   *Rekomendasi:* per program untuk sekarang (`quizScope: 'program'`), karena
   dengan Opsi A kuis tetap punya rumah tanpa perubahan skema. Kuis per silabus
   menuntut Opsi B.

4. **Aturan buka-kunci non-bootcamp.** Berurutan seperti bootcamp, atau semua
   silabus langsung terbuka?
   *Rekomendasi:* berurutan, memakai `sessionUnlock.ts` yang sudah ada, supaya
   perilakunya konsisten dan tidak ada kode baru.

5. **Apakah sakelar logbook juga berlaku untuk bootcamp dan LPK?** Permintaan
   menyebut logbook opsional pada non-bootcamp.
   *Rekomendasi:* kolomnya ada di semua program, tetapi hanya bisa diubah admin
   pada non-bootcamp (`logbookConfigurable`). Bootcamp dan LPK terkunci menyala.

6. **Absensi pada non-bootcamp.** Apakah tetap wajib untuk membuka silabus
   berikutnya?
   *Rekomendasi:* tetap wajib. Kalau absensi juga ingin opsional, ia butuh
   sakelarnya sendiri dan perlakuan yang sama seperti logbook di bagian 5 —
   termasuk jebakan penguncian yang sama.

---

## 10. Ringkasan sekali baca

Yang membuat pekerjaan ini lebih kecil dari dugaan awal: lapisan sesi sudah
tidak bergantung pada minggu, sehingga silabus cukup diwujudkan sebagai sesi di
dalam satu section tersirat. Tidak ada tabel baru, dan tidak ada query yang
perlu ditulis ulang.

Yang membuatnya berisiko: mematikan logbook akan mengunci seluruh program kalau
syarat penguncian tidak diperbaiki lebih dulu, dan menjadikan tipe program
sebagai tag akan mengubah penghapusan tag menjadi penghapusan program selama FK
`CASCADE` belum diganti.
