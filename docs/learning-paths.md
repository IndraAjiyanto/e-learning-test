# Dua jalur belajar: Bootcamp dan Silabus

> **Untuk siapa:** siapa pun yang akan menyentuh kemajuan belajar, buka-kunci,
> kuis, tugas, logbook, atau sertifikat.
> **Ditulis:** 2026-09-18, dari kode dan basis data yang berjalan — bukan dari
> ingatan. Setiap angka dan aturan di bawah ini ditelusuri ke berkasnya.
> **Berkaitan:** `docs/syllabus-HANDOVER.md` (riwayat pengerjaan),
> `docs/syllabus-table-plan.md` (kenapa tabelnya dipisah).

---

## 1. Ringkasan sebaris

Aplikasi ini punya **dua jalur belajar yang benar-benar terpisah**, dan program
memilih salah satunya lewat `course.program_type`:

| | Bootcamp / Japan Pathway | Non-Bootcamp (SPL) |
|---|---|---|
| Susunan | program → **minggu** → **sesi** | program → **silabus** (datar) |
| Yang membuka berikutnya | **kehadiran** + logbook disetujui | **student menandai selesai** |
| Absensi | ada, wajib | **tidak ada sama sekali** |
| Kuis menempel pada | minggu | silabus |
| Gerbang kuis | semua sesi minggu itu tuntas | tidak ada — silabus terbuka = kuis terbuka |
| Irama | didampingi (`guided`) | mandiri (`self_paced`) |

Keduanya **tidak berbagi satu baris kode aturan pun**. Itu disengaja; lihat
bagian 5.

---

## 2. Satu-satunya tempat tipe program diterjemahkan

`src/courses/program-type.ts`

Aturannya keras: **kode di luar berkas itu tidak pernah membandingkan
`course.programType` dengan nilai tertentu.** Kalau ia bercabang langsung di
empat puluh tempat, maka saat Japan Pathway mulai berbeda dari bootcamp,
keempat puluh tempat itu harus dicari ulang satu per satu.

```ts
capabilitiesForCourse(course) → {
  structure:    'weeks' | 'syllabus',
  unlockUnit:   'week'  | 'session',
  quizScope:    'week'  | 'syllabus',
  unitLabel:    'week'  | 'syllabus',
  pacing:       'guided' | 'self_paced',
  mentorship:   'mentor' | 'sensei' | 'none',
  logbookConfigurable: boolean,
  logbookEnabled:      boolean,   // hasil akhir, sudah memperhitungkan sakelar
}
```

Tiga tipe hari ini:

| `program_type` | Kapabilitas |
|---|---|
| `bootcamp` | minggu/sesi, logbook selalu menyala, mentor |
| `lpk` (Japan Pathway) | sama dengan bootcamp, kecuali `mentorship: 'sensei'` |
| `non_bootcamp` | silabus, logbook bisa dimatikan, tanpa pendamping |

`logbookEnabled` punya perlakuan khusus: kolom `course.logbook_enabled` ada di
semua program, tetapi **hanya berarti pada program yang memang boleh
mematikannya**. Pada bootcamp dan LPK logbook selalu menyala apa pun isi
kolomnya — supaya data lama yang tak sengaja bernilai `false` tidak diam-diam
mematikan logbook sebuah bootcamp.

---

## 3. Jalur Bootcamp

### 3.1 Susunannya

```
course
 └── weeks            (week_number, is_final)
      ├── session     (session_order, is_final)  → materials, assignments, attendances
      └── quiz        (satu atau lebih per minggu)
```

### 3.2 Buka-kunci sesi

Sumber kebenarannya **satu berkas**: `src/common/public/js/sessionUnlock.ts`.

```
sesi N terbuka  ⟺  sesi N-1 canOpenNextSession()
canOpenNextSession(s) = isAttended(s) && logbookApproved(s)
```

Dua hal yang gampang salah dikira:

**`isAttended` menuntut DUA sinyal sepakat.**

```ts
isAttended(s) = s.sessionProgress[0].isAttended === true
             && s.attendances.length > 0
```

Bendera progres saja tidak cukup; barisnya di tabel `attendances` harus ada
juga. Ini keputusan produk, bukan kehati-hatian berlebihan.

**Sesi pertama selalu terbuka.** `isSessionUnlocked()` mengembalikan `true`
kalau tidak ada sesi sebelumnya. "Sesi sebelumnya" dicari berdasarkan
`sessionOrder` terbesar yang masih lebih kecil — **bukan berdasarkan indeks
array**, supaya lubang nomor atau urutan array yang acak tidak salah menunjuk.

### 3.3 Sakelar logbook — jebakan yang pernah ada

`logbookApproved()` melihat `session_progresses.logbook`, dan di luar seeder
kolom itu **hanya pernah ditulis oleh `LogbookService` saat admin menyetujui
sebuah logbook** (`logbook.service.ts:230`). `QuizService.create` menyebut
`logbook: true` juga, tetapi itu **syarat pencarian**, bukan penulisan.
Artinya pada program yang logbooknya dimatikan, tidak ada satu pun jalan yang
mengisi kolom itu, dan sesi kedua dan seterusnya terkunci selamanya.

Karena itu syaratnya dilonggarkan lebih dulu lewat `isLogbookRequired()`, baru
antarmuka logbooknya disembunyikan. Sumbernya atribut
`data-logbook-required` pada `<html>`, diisi server dari kapabilitas.

Dibaca **setiap kali dipanggil**, bukan disimpan sekali: student bisa berpindah
program tanpa memuat ulang halaman, dan program berikutnya bisa punya sakelar
yang berbeda.

### 3.4 Kuis minggu

```
kuis minggu terbuka  ⟺  SEMUA sesi minggu itu canOpenNextSession()
```

Lulus kalau `skor >= quiz.minScore`. Yang terjadi setelah lulus
(`src/user_answers/user_answers.service.ts`):

- kalau **`week.is_final = true`** → `user_courses.progress = true`
  → **program dianggap tamat, sertifikat terbuka**;
- kalau bukan → minggu berikutnya dibuka: `week_progresses.process = true`, dan
  **sesi pertama minggu berikutnya langsung ditandai `isAttended = true`**.

Baris terakhir itu layak diingat: melewati kuis membuat student dianggap
"hadir" di sesi pertama minggu berikutnya tanpa mengisi absensi.

### 3.5 Minggu terlihat kalau

`weekUnlocked` (helper Handlebars) = `weekProgresses[0].process === true`.
Minggu pertama mendapatkannya saat dibuat (`WeeksService.create`, cabang
`weekNumber === 1`), untuk semua student yang sudah terdaftar.

---

## 4. Jalur Silabus (non-bootcamp)

### 4.1 Susunannya

```
course
 └── syllabus              (order, is_final)   UNIQUE (courseId, order)
      ├── syllabus_material
      ├── syllabus_assignment  → syllabus_answer_task → syllabus_comment
      ├── syllabus_logbook
      ├── syllabus_progress    (completedAt, logbookOk)
      └── quiz                 (satu per silabus)
```

**Tidak ada tanggal, jam, maupun lokasi** di tabel `syllabus`. Itu bukan
penyederhanaan tampilan: belajar mandiri tidak terjadi pada jam tertentu di
tempat tertentu.

**Nomor urut tidak pernah diminta ke admin.** Service yang menghitungnya saat
menambah, merapatkannya saat menghapus, menyusun ulang saat dipindah; UNIQUE di
basis data yang menjaganya.

### 4.2 Buka-kunci silabus

Sumber kebenarannya `SyllabusService` — **bukan** `sessionUnlock.ts`.

```
silabus N terbuka  ⟺  silabus N-1 selesai
selesai(p) = p.completedAt != null
          && (logbook menyala ? p.logbookOk : true)
```

Tidak ada absensi di mana pun dalam rumus itu. Student yang belajar mandiri
tidak *hadir*, ia *menyelesaikan* — dan ia sendiri yang menandainya, lewat satu
tombol "Mark complete".

### 4.3 Logbook — dan kenapa ia bisa jadi jalan buntu

Kalau program menyalakan logbook, `logbookOk` menjadi gerbang. `logbookOk` hanya
diisi saat **mentor menyetujui** logbook di
`/program/syllabus/logbook/:courseId`.

Sebelum layar itu ada (commit `652bc147`), tidak ada satu pun cara menulis
maupun menyetujui logbook silabus — sehingga student bisa menekan "Mark
complete" dan silabus berikutnya **terkunci selamanya**. Itu bukan kemungkinan
teoretis: ditemukan hidup di program "TEST NON BOOTCAMP".

Menyetujui dan menandai `logbookOk` adalah **satu tindakan**, sengaja tidak
dipisah, supaya keduanya tidak bisa jadi tidak sinkron. Menarik persetujuan
mengunci kembali silabus berikutnya.

### 4.4 Tugas

Satu student, satu jawaban per tugas — dijaga `UNIQUE (task, user)`. Jawabannya
berupa **tautan** (Google Drive, GitHub), mengikuti kebiasaan jalur bootcamp.

Tiga keadaan: `process` (dalam tinjauan) → `rejected` (perlu revisi) →
`approved`. Student memperbarui jawaban yang sama sampai lolos; **jawaban yang
sudah disetujui tidak bisa diubah lagi**, dijaga di server, bukan cuma dengan
menyembunyikan tombol.

Komentar mentor **ditambahkan**, tidak menimpa — riwayat penilaian adalah
percakapan, dan student perlu bisa membaca lagi apa yang diminta pada putaran
sebelumnya.

### 4.5 Kuis silabus

Satu kuis per silabus (keputusan pemilik 2026-09-18). **Tidak ada gerbang
tersendiri**: silabusnya sudah terbuka, berarti kuisnya terbuka.

Dikelola lewat `SyllabusService`, **bukan** `QuizService.create()` — method itu
sekaligus membuka `QuizProgress` berdasarkan kehadiran dan logbook sesi
terakhir, dan jalur silabus memang tidak punya kehadiran.

"Satu per silabus" dijaga di service, **bukan** dengan UNIQUE di basis data:
kolom `quiz.syllabusId` dipakai bersama kuis bootcamp yang selalu `NULL`, dan
UNIQUE di sana akan bertabrakan dengan mereka.

---

## 5. Apa yang dibagi, apa yang dipisah

**Dibagi:** `user`, `user_courses`, `course`, dan seluruh rangkaian kuis
(`quiz`, `question`, `answer`, `score`, `user_answer`).

`quiz` punya **dua induk yang mungkin dan hanya satu yang terisi**:

```
quiz.weeksId     → kuis bootcamp
quiz.syllabusId  → kuis silabus
```

Karena itu `QuizService.findOne()` memuat keduanya; yang kosong tinggal `null`.
Setiap kali menyentuh kuis, **periksa kedua cabangnya**. Saat kuis silabus
disambungkan, ditemukan **empat** tempat yang mengandaikan `quiz.weeks` selalu
ada:

| Tempat | Akibatnya untuk kuis silabus |
|---|---|
| `QuizService.findOne()` | relasi silabusnya tidak ikut dimuat |
| `QuizController.startQuiz` | program aktifnya tidak ketemu |
| `views/user/quiz/quiz.hbs` | tautan "kembali" menunjuk `/program/` kosong |
| `views/admin/quiz/detail.hbs` | tombol Delete membuat URL beruas kosong |
| `UserAnswersService.createScore` | **student yang LULUS kehilangan nilainya** |

Yang terakhir paling mahal dan paling sunyi. `createScore()` memanggil
`quiz.weeks.id` di cabang "lulus", lalu menyimpan skor **setelah** blok itu.
Untuk kuis silabus `quiz.weeks` adalah `null`, jadi student yang menjawab benar
kena `TypeError` dan baris skornya tidak pernah ditulis — sementara student yang
menjawab salah aman, karena cabang itu tidak dilewati. Controllernya menelan
galat dan tetap membalas 302, jadi dari luar tampak berhasil.

Dibuktikan dua arah pada aplikasi yang berjalan: tanpa penjagaan **0 baris**
skor, dengan penjagaan skor **100** tersimpan.

**Dipisah penuh:** aturan belajar, tabel kemajuan, dan layar admin. Tidak ada
`if (bootcamp) … else …` di dalam aturannya; yang ada dua kumpulan tabel dan
dua service.

Alasannya tercatat di `docs/syllabus-table-plan.md`, tetapi intinya: percobaan
menumpangkan silabus pada tabel sesi berarti menyeret `isAttended`,
`session_progresses.logbook`, dan `sessionUnlock` ke jalur yang tidak punya
kehadiran sama sekali — lalu menambalnya satu per satu.

---

## 6. Perbandingan berdampingan

| Pertanyaan | Bootcamp | Silabus |
|---|---|---|
| Apa yang membuka unit berikutnya? | kehadiran + logbook disetujui | student menandai selesai (+ logbook kalau menyala) |
| Siapa yang menyatakan selesai? | admin (lewat absensi) + mentor | **student sendiri** |
| Tabel kemajuan | `session_progresses`, `week_progresses` | `syllabus_progress` |
| Kuis menempel pada | `quiz.weeksId` | `quiz.syllabusId` |
| Gerbang kuis | semua sesi minggu tuntas | tidak ada |
| Jawaban tugas | `answer_task` (tanpa UNIQUE) | `syllabus_answer_task` (**UNIQUE (task,user)**) |
| Logbook | `logbooks` (per sesi) | `syllabus_logbook` (per silabus) |
| Absensi | `attendances` | **tidak ada** |
| Aturan buka-kunci | `sessionUnlock.ts` (dipakai di browser) | `SyllabusService` (dihitung di server) |
| Sertifikat | lulus kuis minggu final | semua silabus selesai |

Satu beda yang gampang terlewat: aturan bootcamp dihitung **di browser**
(`sessionUnlock.ts`), aturan silabus dihitung **di server**
(`SyllabusService.findForStudent`). Karena itu silabus terkunci tidak pernah
sampai ke halamannya — controllernya mengalihkan.

---

## 7. Lubang yang diketahui — BACA sebelum menambah fitur

### 7.1 ~~Program SPL tidak pernah menjadi "tamat"~~ — SUDAH DITUTUP

Dulu: sertifikat membaca `user_courses.progress`; bootcamp mengisinya saat lulus
kuis minggu final, dan jalur silabus tidak punya satu pun kode yang mengisinya.
Student bisa menyelesaikan seluruh silabus dan programnya tetap dianggap belum
tamat.

Sekarang (keputusan pemilik 2026-09-18: **semua silabus selesai, baru tamat**):
`SyllabusService.refreshCourseCompletion()` menghitungnya ulang setiap kali
student menandai silabus selesai atau mentor menilai logbook, lalu menyimpannya
di **kolom yang sama**, `user_courses.progress`. Jadi tidak ada jalur sertifikat
kedua — kedua jalur bertemu di satu kolom.

Tiga hal yang sengaja begitu:

- **"Selesai" memakai definisi `isDone()` yang sama dengan buka-kunci**
  (`completedAt`, ditambah `logbookOk` kalau logbook menyala). Definisi yang
  lebih longgar akan membuat program dinyatakan tamat sementara silabus
  terakhirnya masih terkunci bagi studentnya sendiri.
- **Program tanpa silabus tidak pernah tamat.** Tanpa penjagaan itu, `every()`
  pada daftar kosong menjawab `true` dan program yang belum diisi apa pun
  langsung menerbitkan sertifikat.
- **Dihitung ulang, bukan sekadar dinyalakan.** Mentor bisa menarik persetujuan
  logbook; kalau itu terjadi programnya kembali belum tamat. Kolom yang hanya
  bisa naik akan menerbitkan sertifikat untuk program yang syaratnya sudah tidak
  terpenuhi lagi.

Data lama ditambal migrasi `1789000000000-BackfillSyllabusCourseCompletion`.

### 7.2 Tujuh baris drift `schema:log` yang bukan dari jalur mana pun

Pada `payments`, `installment`, dan `gallery` — bawaan cabang `test-back-office`
yang sudah digabung. **Nol drift** pada tabel silabus/kuis/course.

---

## 8. Kalau Anda akan menyentuh salah satu jalur

1. **Jangan bandingkan `programType` langsung.** Baca kapabilitas dari
   `capabilitiesForCourse()`.
2. **Kuis punya dua induk.** Periksa `quiz.weeks` *dan* `quiz.syllabus`.
3. **Jalankan pemeriksa kedua jalur**, bukan cuma yang Anda sentuh — keduanya
   berbagi tabel kuis dan tabel user:

   ```bash
   IDS=... EXTRA_IDS=... npm run test:ui                  # 258/259
   COURSE=$SPL ENROLLED=1 node test/ui/syllabus-admin-check.mjs
   COURSE=$SPL              node test/ui/syllabus-submission-check.mjs
   COURSE=$SPL BOOTCAMP_QUIZ=... node test/ui/syllabus-quiz-check.mjs
   COURSE=$LOGBOOK_ON       node test/ui/syllabus-logbook-check.mjs
   ```

   Nilai variabelnya ada di `docs/syllabus-HANDOVER.md` bagian 6.
4. **`schema:log` menangkap yang `tsc` tidak bisa** — ketidakcocokan entity
   dengan tabel. Jalankan kalau menyentuh entity.
