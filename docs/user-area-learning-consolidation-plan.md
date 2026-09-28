# Memindahkan area belajar dari halaman landing ke backoffice

> **Tanggal:** 2026-09-17
> **Permintaan pemilik:** bawa seluruh menu My Learning yang ada di halaman
> landing ke dalam backoffice, dan ganti versi backoffice yang sekarang dengan
> komponen lama tersebut.

## 1. Ada dua implementasi area belajar

| | Versi landing | Versi backoffice |
|---|---|---|
| Dirender oleh | `GET /program/:id` -> `kelas/detail.hbs` | panel Start Learning di shell |
| Ukuran | 214 baris + 12 partial `program_detail/*` (916 baris) | 616 baris + 3 partial materi |
| Chrome | navbar publik + footer | app bar + sidebar backoffice |
| Data | `course`, `minggu` (sudah dihitung status buka-kuncinya), `user_kelas`, `portfolio` | hanya `course` |

Versi landing memakai `CoursesService.findWeeks(courseId, userId)` yang
mengembalikan minggu beserta status terkunci per minggu dan per sesi. Versi
backoffice menghitung ulang sendiri di sisi klien.

## 2. Apa yang hanya ada di versi landing

Di dalam setiap sesi:

- **Tugas** — `assigment_section.hbs`, menuju `/answer-assigment/:sessionId/:assignmentId`
- **Logbook per sesi** — buat, ubah, dan lihat, menuju `/logbooks/...`
- **Materi** — tiga jenis, menuju `/learning-material/{pdf,ppt,video}/:sessionId`
- **Absensi** — `attendance_noYet.hbs` dan `attendance_status.hbs`, menuju `/attendance/form/:sessionId`

Di tingkat minggu dan program:

- **Kuis per minggu** — `week/quiz.hbs`, menuju `/quiz/form/:quizId`
- **Portfolio program** — `portfolio.hbs`, buat dan lihat
- **Keadaan terkunci** — `locked_week.hbs` dan `locked_session.hbs` dengan
  alasan penguncian yang eksplisit, persis seperti pita kuning pada frame desain

## 3. Masalah utamanya bukan komponennya, tapi tujuan tautannya

Setiap aksi di versi landing berpindah ke halaman berdiri sendiri, dan semua
halaman itu dirender tanpa `bareShell` sehingga memakai navbar publik dan
footer. Jadi memindahkan komponennya saja tidak cukup; tujuan tautannya ikut
harus tinggal di backoffice.

## 4. Rencana, tiga tahap

### Tahap 1 — Alihkan student yang sudah terdaftar

Di `courses.controller.ts` sudah ada baris redirect yang **ditulis lalu
dikomentari**, tepat ke Start Learning backoffice. Cukup diaktifkan: student
yang sudah terdaftar dan membuka `/program/:id` langsung dibawa ke shell.
Pengunjung yang belum terdaftar tetap melihat halaman pemasarannya.

Nilai: satu baris, langsung menghentikan student mendarat di layout landing.

### Tahap 2 — Chrome backoffice untuk halaman belajar berdiri sendiri

Sidebar diekstrak menjadi `partials/user/shell_nav/index.hbs` yang merender
lima item desain sebagai tautan biasa, seperti app bar yang sudah diekstrak
lebih dulu. Halaman berdiri sendiri (logbook, portfolio, tugas, materi,
absensi, kuis) dirender dengan `bareShell` lalu memakai app bar dan sidebar itu.

Nilai: tidak ada lagi halaman belajar yang memakai chrome landing, tanpa perlu
menulis ulang isinya.

### Tahap 3 — Ganti isi Start Learning dengan komponen lama

Controller fragment menyuplai data yang sama dengan halaman landing
(`minggu`, `user_kelas`, `portfolio`), lalu panel Start Learning merender
komposisi `program_detail/*` di dalam bingkai desain yang sudah ada: breadcrumb,
judul, dua kolom dengan kartu program di kanan.

Nilai: tugas, kuis per minggu, portfolio, dan keadaan terkunci yang eksplisit
kembali ada di area belajar, memakai status buka-kunci dari server alih-alih
perhitungan ulang di klien.

## 5. Yang tidak berubah

Rute, controller, entity, dan logika buka-kunci sesi. Tahap 3 justru memakai
`findWeeks()` yang sudah ada, bukan menulis logika baru.

## 6. Urutan dan pengujian

Dikerjakan berurutan 1, 2, 3. Setiap tahap diuji dengan `npm run test:ui`, dan
setiap tahap menambah asersi: tidak ada halaman area student yang memuat penanda
chrome landing.
