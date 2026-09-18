# Menghapus sub-menu My Learning — rencana implementasi

> **Tanggal:** 2026-09-17
> **Pemicu:** pemilik menyatakan desain My Learning tidak punya sub-menu, dan
> seluruh area belajar harus tetap memakai layout backoffice.
> **Referensi:** `docs/design/user-area/start-learning.png` dan
> `start-learning-week-expanded.png`

## 1. Keadaan sekarang versus desain

Kedua frame Start Learning menunjukkan sidebar dengan **lima item datar**:
Dashboard, Profile, My Learning, My Portfolio, Payment History, lalu Log Out.
Tidak ada pohon course dan tidak ada sub-menu.

Aplikasi sekarang menyisipkan pohon course di bawah My Learning. Setiap course
bisa dibuka dan memuat enam sub-item: Presentation, My Logbook, Assignment,
Quiz, Certificate, dan Join Group Class.

## 2. Kenapa tidak bisa langsung dihapus

Pohon itu satu-satunya jalan menuju enam panel tersebut. Menghapusnya begitu
saja membuat Presentation, Assignment, Quiz, dan Certificate tidak bisa
dijangkau sama sekali.

Desain sudah menunjukkan ke mana perginya sebagian:

| Yang di sub-menu | Di desain letaknya |
|---|---|
| Join Group Class | tombol di kartu program, kolom kanan Start Learning |
| My Logbook | tombol di kartu program |
| (Detail Program) | tombol di kartu program |
| Absensi | tombol "Mark Attendance" di dalam kartu sesi |
| Materi PDF / Video / PPT | tiga ubin di dalam kartu sesi |
| Presentation, Assignment, Quiz, Certificate | **tidak muncul di frame mana pun** |

Empat yang terakhir memang belum digambar. Tetapi polanya sudah jelas: kartu
program di kolom kanan adalah tempat navigasi per-course. Jadi keempatnya
ditaruh di sana, memakai bentuk tombol yang sama.

## 3. Langkah

1. **Tambah empat tombol** ke kartu program Start Learning: Presentation,
   Assignment, Quiz, Certificate. Dikelompokkan bersama Join Group, My Logbook,
   dan Detail Program yang sudah ada.
2. **Hapus pohon course** dari sidebar desktop dan dari navigasi mobile.
3. **Jadikan My Learning item datar**: tanpa chevron, tanpa accordion.
4. **Pertahankan seluruh state Alpine** (`openedCourses`, `selectCourse`,
   `selectCourseSection`, `loadCourseFragment`). Tombol di kartu memakai jalur
   yang sama persis, jadi logika buka-kunci sesi tidak tersentuh.
5. **Tambah asersi** di `npm run test:ui`: sidebar tepat lima item, dan setiap
   panel per-course tetap terjangkau dari kartu Start Learning.

## 4. Yang tidak berubah

Rute, controller, nama section, dan seluruh logika fragment. Ini murni
pemindahan titik masuk di dalam satu halaman yang sama.

## 5. Risiko

Kecil. Satu-satunya jalur yang hilang adalah membuka panel per-course dari
sidebar tanpa lebih dulu berada di Start Learning. Setelah perubahan, alurnya
menjadi My Learning, pilih program, lalu pilih bagiannya — persis yang
ditunjukkan breadcrumb pada frame desain.
