# DOKUMENTASI FITUR: REAL-TIME DASHBOARD SUPER ADMIN
**Platform:** E-Learning Kesatria Academy  
**Modul:** Overview & Tracking Dashboard (`/information`)  
**Penulis:** Technical Engineering Team  
**Tanggal:** 22 September 2026  

---

## 1. Ringkasan Eksekutif (Executive Summary)

Fitur **Real-time Dashboard Super Admin** dikembangkan untuk memberikan visibilitas langsung (live visibility) tanpa perlu me-refresh halaman (*zero-refresh*) kepada Super Admin dalam memantau:
1. Jumlah pengguna yang aktif dan login hari ini.
2. Peserta kursus (*students*) yang saat ini sedang berada di dalam ruang belajar (*learning scope*), seperti membuka materi, sesi, tugas, atau kuis.
3. Status kelengkapan aktivitas peserta secara rinci: apakah sudah **Absen**, sudah mengumpulkan **Tugas**, dan sudah menyelesaikan **Kuis** dengan indikator visual warna (🟢 Hijau = Selesai, 🔴 Merah = Belum).
4. Grafik keaktifan mingguan (*Participant Activity*) serta metrik agregat harian (*Completion rate* dan total modul yang selesai).

Implementasi menggunakan arsitektur **Server-Sent Events (SSE)** yang hemat sumber daya (*lightweight*), didukung oleh middleware pencatatan berbasis *in-memory event emitter* dan TypeORM.

---

## 2. Masalah yang Diselesaikan & Solusi Arsitektural

| No | Masalah Awal | Penyebab Utama | Solusi & Perbaikan |
|----|--------------|----------------|---------------------|
| 1 | Database error / tabel hilang | Tabel `user_activity` belum terbuat di PostgreSQL | Dibuat dan dijalankan migrasi TypeORM `1790000000000-CreateUserActivityTable.ts` untuk persistensi sesi login dan tracking aktif. |
| 2 | Status "Sedang Belajar" sering hilang atau tidak terdeteksi | Aset statis (`.css`, `.js`, gambar, favicon, i18n) memicu middleware dan me-reset status belajar | Menambahkan filter *bypass* pada middleware untuk seluruh aset statis, serta membatasi reset status hanya saat student membuka rute keluar eksplisit (seperti `/dashboard`, `/users/profile`, `/logout`). |
| 3 | Prefix rute terpangkas pada Express sub-router | Express `req.path` hanya membaca `/session/detail/...` tanpa prefix `/program` | Memperbarui resolusi URL menggunakan `req.originalUrl.split('?')[0]` agar pola regex `/program/session/detail/:sessionId` cocok secara presisi. |
| 4 | Absensi, Tugas, dan Kuis tidak terbaca statusnya | Belum ada agregasi status progres saat peserta sedang membuka sesi | Menambahkan parallel batch query di backend untuk memeriksa tabel `attendance`, `assignments`/`answer_task`, dan `quiz`/`scores`. |
| 5 | Ringkasan Hari Ini & Grafik Mingguan diam (tidak berubah) | Elemen HTML berstatus nilai statis dan belum memiliki ID DOM untuk menerima payload SSE | Menambahkan ID DOM, sinkronisasi payload JSON dari controller, dan menghubungkan fungsi listener SSE `updateMetrics()` serta `updateChart()`. |
| 6 | Layout dashboard tumpang tindih dengan sidebar | Penggunaan kontainer kaku `max-w-[1408px] mx-auto` yang menggeser layout ke kiri di bawah sidebar | Mengubah wrapper menjadi fluid responsif `w-full p-6 lg:p-8 min-h-screen` dan membuang tinggi statis yang tidak proporsional (`836px` dan `650px`). |

---

## 3. Rincian Teknis Implementasi

```
                                  ARUS DATA REAL-TIME
                                  
 [ Student Browser ]               [ Backend NestJS ]                 [ Super Admin Browser ]
         |                                  |                                     |
         |-- 1. Mengakses materi/sesi ---->|                                     |
         |   (HTTP Request)                 |                                     |
         |                                  |-- 2. Middleware mendeteksi scope    |
         |                                  |      pembelajaran & user ID         |
         |                                  |                                     |
         |                                  |-- 3. Update 'user_activity' &       |
         |                                  |      Emit event 'learning.updated'  |
         |                                  |                                     |
         |                                  |================ 4. SSE Stream =====>|
         |                                  |    (Emit JSON: summary, chart,      |
         |                                  |     activeUsers, learners)          |
         |                                  |                                     |-- 5. DOM ter-update otomatis
         |                                  |                                            (Tanpa refresh halaman)
```

### A. Backend & Database
1. **Entity & Migration `user_activity`**:
   - Kolom: `userId` (PK, relasi ke `User`), `sessionId`, `currentCourseId`, `activityLabel`, `loginAt`, `lastSeenAt`.
   - Menggunakan indeks terbalik dan foreign key cascade untuk pembersihan otomatis saat user dihapus.
2. **Learning Scope Resolver (`src/user_activity/learning-scope.ts`)**:
   - Memetakan endpoint pembelajaran:
     - `/program/session/detail/:sessionId` ➔ Label: `Sesi Pembelajaran`
     - `/session/:sessionId` ➔ Label: `Sesi Pembelajaran`
     - `/program/:courseId` ➔ Label: `Katalog Program`
     - `/answer-assigment/create/:sessionId/:courseId` ➔ Label: `Tugas`
     - `/quiz/:sessionId/run` ➔ Label: `Kuis`
     - `/attendance/:sessionId/:userId/:courseId` ➔ Label: `Absensi`
3. **Middleware Global (`src/user_activity/user-activity.middleware.ts`)**:
   - Memfilter request agar tidak membebani database:
     - Mengabaikan file statis, aset frontend, request socket, dan polling internal.
     - Hanya memperbarui status user dengan role `user` (*student*).
4. **Agregasi Status Pembelajaran & Indikator Lengkap (`UserActivityService.getCurrentlyLearning`)**:
   - Melakukan parallel query batch untuk seluruh peserta aktif:
     - **Absensi**: Verifikasi apakah `userId` sudah tercatat di tabel `attendance` untuk sesi kursus terkait.
     - **Tugas**: Menghitung rasio tugas yang dikumpulkan vs total tugas yang ada di kursus.
     - **Kuis**: Memeriksa kelulusan kuis berdasarkan tabel `scores` dan `quiz`.
5. **Real-time Pipeline (RxJS & SSE)**:
   - Menggunakan `EventEmitter` internal dengan *event debounce* 400ms untuk mencegah banjir event (*spamming*).
   - Menambahkan *heartbeat* otomatis setiap 20 detik untuk menjamin sinkronisasi background jika koneksi sempat *idle*.
   - Menyediakan 2 endpoint SSE terproteksi peran `super_admin`:
     - `GET /information/api/overview/stream` (seluruh komponen dashboard).
     - `GET /information/api/learning/stream` (khusus data peserta yang sedang belajar).

---

### B. Frontend & Tampilan Dashboard (`src/views/super_admin/information/index.hbs`)
1. **Card Sedang Belajar**:
   - Header terpadu dengan pill badge live: `X user sedang belajar` lengkap dengan animasi *green pulse*.
   - Avatar inisial dengan palet warna kontras dinamis per user.
   - Waktu aktivitas terakhir di badge kanan atas kartu (contoh: `2 menit lalu`).
   - 3 Indikator status pembelajaran dengan penanda warna:
     - 🟢 **Sudah Absen** / 🔴 **Belum Absen**
     - 🟢 **Tugas Selesai** / 🔴 **Tugas (X/Y)** / 🟢 **Tidak Ada Tugas**
     - 🟢 **Quiz Selesai** / 🔴 **Quiz (X/Y)** / 🟢 **Tidak Ada Quiz**
2. **Participant Activity (Grafik Mingguan)**:
   - Menghitung secara dinamis statistik login dan aktivitas per hari dalam 7 hari terakhir.
   - Menggunakan transisi CSS halus `transition-all duration-300` saat tinggi batang bergeser.
   - Tooltip hover interaktif yang menampilkan angka riil user login dan user aktif.
   - Mengeliminasi scrollbar vertikal di dalam card grafik.
3. **Ringkasan Hari Ini**:
   - Menghilangkan ruang kosong statis `650px`, menjadikannya kartu adaptif yang padat dan informatif.
   - Terhubung langsung ke stream real-time untuk pembaruan `completionValue`, `completionPercent`, dan `completedModules`.
4. **Active Users Panel**:
   - Menghapus tinggi statis `836px`, digantikan kontainer adaptif yang proporsional baik saat ada 0, 1, maupun banyak user online.
   - Menambahkan counter badge aktif `X Online`.
5. **Proporsi Layout Global**:
   - Mengganti pembatas fixed `max-w-[1408px] mx-auto` menjadi layout responsif `w-full` dengan padding `p-6 lg:p-8`, memastikan tampilan sejajar dan tidak terpotong oleh sidebar.

---

## 4. Daftar Berkas yang Dibuat / Diubah

1. `src/database/migrations/1790000000000-CreateUserActivityTable.ts` *(Baru)*: Migrasi skema tabel `user_activity`.
2. `src/user_activity/user-activity.module.ts`: Konfigurasi dependensi modul TypeORM.
3. `src/user_activity/user-activity.service.ts`: Logika tracking, query paralel indikator, dan SSE stream pipeline.
4. `src/user_activity/user-activity.middleware.ts`: Filter middleware global bypass aset statis.
5. `src/user_activity/learning-scope.ts`: Pola regex dan resolver rute pembelajaran.
6. `src/information/information.controller.ts`: Endpoint render SSR dan SSE stream Super Admin.
7. `src/views/super_admin/information/index.hbs`: Template UI Handlebars dan script koneksi EventSource klien.

---

## 5. Panduan Pengujian & Demo ke Tim (Testing Guide)

Untuk mendemonstrasikan fitur ini kepada tim, ikuti skenario berikut:

1. **Persiapan Browser**:
   - Buka Browser A (misal: Google Chrome) dan login sebagai **Super Admin**.
   - Masuk ke menu **Information** (`http://localhost:3000/information`).
   - Buka Browser B / Incognito Window dan login sebagai **Student/User**.
2. **Uji Real-time "Sedang Belajar"**:
   - Di Browser B, buka salah satu materi kursus atau sesi pembelajaran.
   - **Hasil pada Browser A**: Dalam < 1 detik, kartu peserta langsung muncul di card "Sedang Belajar" dengan indikator status absensi, tugas, dan kuis tanpa me-refresh halaman Super Admin.
3. **Uji Indikator Absensi**:
   - Di Browser B, lakukan absensi pada sesi tersebut.
   - **Hasil pada Browser A**: Indikator pada kartu peserta langsung berubah dari 🔴 **Belum Absen** menjadi 🟢 **Sudah Absen**.
4. **Uji Metrik Ringkasan & Grafik**:
   - Perhatikan card "Participant activity" dan "Ringkasan hari ini".
   - Angka metrik online dan grafik aktivitas hari berjalan langsung ter-update menyesuaikan keaktifan student.
5. **Uji Keluar Sesi Pembelajaran**:
   - Di Browser B, klik navigasi kembali ke halaman utama `/dashboard` atau profil.
   - **Hasil pada Browser A**: Kartu peserta pada section "Sedang Belajar" otomatis hilang, dan status counter kembali ke `0 user sedang belajar`.

---
*Dokumentasi ini siap digunakan untuk presentasi dan review teknis bersama tim engineering & produk.*
