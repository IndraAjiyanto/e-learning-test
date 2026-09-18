# Rencana: tiga tipe program (bootcamp, non-bootcamp, Japan Pathway/LPK)

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

> **Tambahan pemilik, 2026-09-18:** daftar programnya disebutkan lengkap.
> Non Bootcamp berisi **Starter Class** (course gratis, SPL) dan **Faster
> Class** (course berbayar, SPL). Bootcamp / Special Program berisi **Bootcamp**
> (berbayar, intensive mentor) dan **Japan Pathway** (berbayar, intensive
> sensei). Bagian 1.4 menjelaskan ke mana keempat nama itu pergi di dalam model
> data, dan pertanyaan terbuka 1 dan 2 di bagian 9 sudah terjawab olehnya.

> **Status, 2026-09-18:** T0-T6 dan T8 sudah dikerjakan. Yang belum: T7 (kuis
> tingkat program untuk non-bootcamp - tidak diperlukan dengan opsi A), layar
> admin untuk menulis silabus (wadahnya sudah dibuat otomatis, tetapi tab admin
> masih berlabel "Week"), penjagaan rute logbook di luar formCreate dan POST,
> dan penggantian nama kategori menjadi Starter/Faster/Bootcamp/Japan Pathway.
> Rincian di bagian 11.

Dokumen ini rencana. Bagian 11 mencatat apa yang sudah jadi kode.

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

### 1.4 Empat nama program yang disebut pemilik — dan ke mana perginya

Pemilik menyebut empat program dalam dua rombongan:

| Rombongan | Program | Harga | Cara belajar |
|---|---|---|---|
| Non Bootcamp | Starter Class | gratis | SPL (belajar mandiri) |
| Non Bootcamp | Faster Class | berbayar | SPL (belajar mandiri) |
| Bootcamp / Special Program | Bootcamp | berbayar | pendampingan mentor intensif |
| Bootcamp / Special Program | Japan Pathway | berbayar | pendampingan sensei intensif |

Yang perlu dilihat: **daftar ini tidak menambah sumbu baru, ia mengisi dua sumbu
yang sudah ada.**

`Category.type` sudah berupa enum bernilai `Free Program`, `Paid Program`, dan
`Special Program` (`entities/category.entity.ts:18`) — persis ketiga kotak yang
dipakai pemilik untuk mengelompokkan keempat program itu. Isi tabelnya hari ini
memang sudah terbagi begitu, hanya namanya yang belum:

| Nama kategori sekarang | `category.type` | Jumlah program | Nama yang dimaksud pemilik |
|---|---|---|---|
| `Short Clas` (salah eja) | Free Program | 2 | **Starter Class** |
| `Course` | Paid Program | 4 | **Faster Class** |
| `WIP` | Special Program | 2 | **Bootcamp** dan **Japan Pathway** |

Jadi keempat nama itu adalah **nama kategori**, bukan nilai enum baru. Itu juga
konsisten dengan kode yang sudah ada: `partials/footer.hbs:52` menaut ke
`/category/program/Bootcamp` dan `partials/special_program/program.hbs:4`
membandingkan `category.name` dengan `"Bootcamp"` — keduanya sudah memperlakukan
nama kategori sebagai nama program.

Pembagian tugas antara ketiga sumbu jadi seperti ini:

| Sumbu | Kolom | Menjawab pertanyaan |
|---|---|---|
| Nama & pemasaran | `category.name` | program ini namanya apa, halaman landingnya seperti apa |
| Harga & pengelompokan | `category.type` | gratis, berbayar, atau special |
| Struktur belajar | `course.program_type` (baru) | minggu atau silabus, siapa yang mengunci apa |
| Topik | `course_type` → Tag | program ini soal apa (Web Development, dan seterusnya) |

`programType` untuk keempatnya:

| Program | `programType` | Alasan |
|---|---|---|
| Starter Class | `non_bootcamp` | SPL, silabus datar |
| Faster Class | `non_bootcamp` | SPL, silabus datar — bedanya dengan Starter hanya harga, dan harga bukan urusan struktur belajar |
| Bootcamp | `bootcamp` | minggu, kuis per minggu, mentor |
| Japan Pathway | `lpk` | hari ini sama persis dengan bootcamp; yang membedakan nanti pendampingan sensei |

**Japan Pathway diasumsikan sebagai program yang sebelumnya pemilik sebut
"LPK".** Keduanya sama-sama berada di rombongan special, sama-sama berbayar, dan
sama-sama disebut "untuk sekarang sama dengan bootcamp". Kalau ternyata LPK dan
Japan Pathway dua program yang berbeda, nilai enumnya perlu ditambah satu lagi —
lihat pertanyaan terbuka nomor 7.

Starter Class dan Faster Class **tidak** mendapat nilai enum sendiri. Satu-satunya
beda di antara keduanya adalah harga, dan harga sudah dijawab `category.type`.
Memberi keduanya nilai enum berarti `capabilitiesFor` mengembalikan dua hasil
yang identik — cabang yang tidak pernah bercabang.

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
  /**
   * 'self_paced' = SPL, student jalan sendiri tanpa jadwal pendampingan.
   * 'guided'     = ada pendampingan intensif dan jadwalnya mengikat.
   */
  pacing: 'self_paced' | 'guided';
  /**
   * Siapa yang mendampingi. Inilah satu-satunya tempat Bootcamp dan Japan
   * Pathway berbeda hari ini, dan sengaja sudah punya namanya sendiri supaya
   * saat perbedaannya benar-benar dipakai tidak perlu mencari-cari lagi.
   */
  mentorship: 'none' | 'mentor' | 'sensei';
}

export function capabilitiesFor(type: ProgramType): ProgramCapabilities {
  switch (type) {
    // Starter Class dan Faster Class sama-sama masuk sini; bedanya cuma harga,
    // dan harga dijawab category.type, bukan berkas ini.
    case 'non_bootcamp':
      return { structure: 'syllabus', unlockUnit: 'session',
               logbookConfigurable: true, quizScope: 'program',
               unitLabel: 'Silabus',
               pacing: 'self_paced', mentorship: 'none' };
    // Japan Pathway.
    case 'lpk':
      return { structure: 'weeks', unlockUnit: 'week',
               logbookConfigurable: false, quizScope: 'week',
               unitLabel: 'Week',
               pacing: 'guided', mentorship: 'sensei' };
    case 'bootcamp':
    default:
      return { structure: 'weeks', unlockUnit: 'week',
               logbookConfigurable: false, quizScope: 'week',
               unitLabel: 'Week',
               pacing: 'guided', mentorship: 'mentor' };
  }
}
```

Japan Pathway (`lpk`) sengaja ditulis sebagai `case` tersendiri, bukan digabung
ke bootcamp lewat fall-through. Isinya hari ini memang sama kecuali
`mentorship`; saat perbedaannya bertambah, yang diubah hanya blok ini.

`pacing` dan `mentorship` belum dipakai bercabang di mana pun pada T1-T6. Nilainya
tetap ditulis sejak awal karena keduanya berasal dari keterangan pemilik
("SPL", "intensive mentor", "intensive sensei") — lebih murah dicatat sekarang
daripada digali ulang nanti.

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
| **T8** | Seed dan data contoh mengikuti daftar nyata di bagian 1.4: kategori `Starter Class` (Free), `Faster Class` (Paid), `Bootcamp` dan `Japan Pathway` (Special) — menggantikan `Short Clas`, `Course`, dan `WIP`. Satu program SPL dengan silabus, satu dengan logbook dimatikan. Tambahan pemeriksaan di `test/ui/design-check.mjs`. | sedang — mengubah nama kategori ikut mengubah tautan `/category/program/:name` di `footer.hbs:52` dan pembandingan di `special_program/program.hbs:4` |

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

Rekomendasi disertakan supaya bisa dijawab cepat, atau dibiarkan kalau
rekomendasinya sudah sesuai. Dua yang pertama sudah terjawab oleh daftar program
yang pemilik kirim 2026-09-18; jawabannya ditinggalkan di sini supaya jejak
keputusannya tetap terbaca.

1. ~~**Hubungan `programType` dengan `category`.**~~ **Terjawab 2026-09-18.**
   Empat nama yang disebut pemilik — Starter Class, Faster Class, Bootcamp,
   Japan Pathway — adalah **nama kategori**, dan pengelompokannya persis
   `category.type` yang sudah ada. Jadi `category` mengurus nama, harga, dan
   halaman landing; `programType` mengurus struktur belajar. Keduanya berdiri
   sendiri. Lihat bagian 1.4.

2. ~~**Di mana "faster class" dan "starter class" hidup?**~~ **Terjawab
   2026-09-18.** Keduanya kategori di bawah `category.type = 'Free Program'` dan
   `'Paid Program'`, bukan tag dan bukan nilai enum. `programType` keduanya
   `non_bootcamp`. (Rekomendasi sebelumnya menyebut "tag"; itu meleset — tag
   dipakai untuk topik seperti Web Development, bukan untuk bentuk program.)

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

7. **Japan Pathway dan LPK: satu program atau dua?** Rencana ini
   memperlakukannya sebagai satu — `programType = 'lpk'`, ditampilkan dengan
   nama Japan Pathway. Keduanya sama-sama special, berbayar, dan "untuk sekarang
   sama dengan bootcamp", jadi menggabungkannya tidak menghilangkan apa pun.
   *Rekomendasi:* satu, dan nilai enumnya dinamai `lpk` saja karena itu istilah
   yang lebih luas. Kalau ternyata dua program yang berbeda, tambahkan nilai
   `japan_pathway` di T1 — ongkosnya satu `case` di `capabilitiesFor`.

8. **Absensi pada program SPL.** Starter Class dan Faster Class berjalan mandiri
   tanpa pendampingan. Absensi di sana mau diartikan sebagai apa — penanda
   "sudah saya baca", atau dimatikan seperti logbook?
   *Rekomendasi:* jadikan penanda "sudah selesai", dengan label yang berbeda.
   Mekanismenya sudah ada dan penguncian berurutan butuh penandanya; yang
   berubah cukup kata-katanya. Kalau dimatikan, jebakan penguncian di bagian 5
   berlaku persis sama.

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

Yang membuat daftar empat program dari pemilik melegakan: keempatnya jatuh ke
sumbu yang sudah ada. Starter Class dan Faster Class adalah kategori Free dan
Paid dengan `programType = 'non_bootcamp'` yang sama; Bootcamp dan Japan Pathway
adalah kategori Special dengan struktur minggu yang sama, beda pendampingnya
saja. Tidak ada nilai enum yang perlu ditambah, dan tidak ada sumbu keempat yang
perlu dikarang. Yang perlu dirapikan justru nama kategori yang sekarang masih
`Short Clas`, `Course`, dan `WIP`.


---

## 11. Yang sudah dikerjakan (2026-09-18)

| Tahap | Keadaan | Bukti |
|---|---|---|
| **T0** | selesai | migrasi `1788600000000-AddProgramTypeAndLogbookFlag`; 8 program terisi `bootcamp`/`true`; FK tag `confdeltype` berubah `c` -> `n` |
| **T1** | selesai | `src/courses/program-type.ts`; `caps` dikirim ke shell, empat fragment, dan halaman sesi; `window.programCaps` untuk sisi klien |
| **T2** | selesai | `sessionUnlock.logbookApproved` menghormati `data-logbook-required`; **plus** `AttendanceService.openNextSessionWhenLogbookIsOff` (lihat catatan di bawah) |
| **T3** | sebagian | tab, panel, kartu logbook halaman sesi, langkah `steps`, dan dua rute tulis sudah dijaga. Belum: empat rute logbook student lainnya, layar admin, hitungan dashboard, ekspor |
| **T4** | selesai | pilihan Learning Structure, sakelar Logbook (hanya non-bootcamp), label Tag; DTO + mapper + entity |
| **T5** | selesai | `start_learning/index.hbs` bercabang pada `caps.structure`; silabus datar tanpa kepala minggu dan tanpa kartu kemajuan minggu |
| **T6** | sebagian | `CoursesService.ensureSyllabusContainer` membuat wadah tersirat saat program dibuat/diubah. Layar admin belum berganti istilah "Week" -> "Silabus" |
| **T7** | tidak dikerjakan | dengan opsi A kuis tetap punya rumah; `quizScope: 'program'` sudah tercatat di kapabilitas tetapi belum mengubah tampilan |
| **T8** | selesai | program contoh `Dasar Pemrograman Web (SPL)` (Starter Class, logbook mati, 3 silabus) + layar `non-bootcamp-program` di `test/ui/design-check.mjs` (17 pemeriksaan) |

### 11.1 Jebakan penguncian ternyata punya SISI KEDUA

Bagian 5 menyebut satu sisi: syarat buka-kunci menuntut logbook, dan pada
program tanpa logbook `session_progresses.logbook` tidak pernah terisi.

Sisi kedua baru terlihat saat dijalankan: baris `session_progresses` milik sesi
**berikutnya** juga hanya pernah dibuat oleh `LogbookService.update` saat admin
menyetujui sebuah logbook (`logbook.service.ts:283`). Jadi walaupun syaratnya
sudah dilonggarkan, daftar sesi tetap menggambar sesi berikutnya sebagai
terkunci - karena barisnya memang tidak ada.

Perbaikannya di `AttendanceService.openNextSessionWhenLogbookIsOff`: pada
program yang logbooknya mati, absensi yang mengambil alih tugas membuka sesi
berikutnya. Pada bootcamp urutannya tidak berubah sama sekali.

### 11.2 Catatan migrasi

`down()` menghapus kolom `program_type` dan `logbook_enabled`. Itu berarti
membatalkan migrasi ini **menghilangkan** tipe program yang sudah disetel:
program non-bootcamp kembali menjadi bootcamp saat migrasinya dijalankan lagi.
Sudah diuji turun-naik; perilakunya memang begitu, bukan kejutan - tetapi jangan
membatalkannya di production tanpa mencatat dulu isi kedua kolom itu.
