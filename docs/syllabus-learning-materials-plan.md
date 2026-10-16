# Rencana Detail Silabus: Video dan Materi Pendukung

Tanggal: 16 Oktober 2026. Status: usulan implementasi berdasarkan inspeksi kode, screenshot, dan dua halaman PDF acuan. Dokumen ini tidak menandakan fitur sudah dibuat atau migrasi sudah dijalankan.

## 1. Hasil perbandingan

Acuan visual: `C:/Users/murtaja/Downloads/UI Silabus LMS Kesatria-selection.pdf`. Screenshot kondisi sekarang telah dibuka dan dibandingkan dengan template.

| Bagian | Kondisi kode sekarang | Target PDF | Pekerjaan |
| --- | --- | --- | --- |
| Teori | `syllabus.content` ditampilkan di kolom kiri | Teori tetap di kiri, di bawah video | Pertahankan konten; pisahkan kartu video dan teori |
| Video Pembelajaran | Belum ada pada halaman detail silabus | Player, judul, durasi, kontrol pemutaran | Tambah sumber video silabus dan player |
| Materi Pembelajaran | Belum ada pada sidebar | PDF dan PPTX, nama file, ukuran, lihat, unduh | Tambah relasi, metadata, pengelolaan admin, preview, unduh |
| Quiz | Belum dikerjakan / Belum Lulus / Lulus; skor terbaik; CTA dinamis | Contoh menampilkan Belum Lulus, skor 20, minimum 70 | Gunakan logika yang ada; pindahkan posisinya di bawah materi |
| Cara Belajar | Sudah tersedia | Tetap di bawah quiz | Sesuaikan petunjuk dengan ketersediaan video dan quiz |
| Judul dan isi | Judul berasal dari data; konten mendukung HTML dan blok lama | Judul BMC serta teori yang rapi | Isi contoh bukan teks yang harus di-hardcode |

Perbedaan badge kuning pada screenshot dan merah pada PDF adalah perbedaan keadaan belajar. Jangan memaksa semua peserta menjadi `Belum Lulus`, skor 20, atau ambang lulus 70. Screenshot bahkan menampilkan ambang 10; gunakan konfigurasi quiz masing-masing.

Fokus utama permintaan adalah kartu materi di kanan. Video dimasukkan sebagai fase tersendiri agar keseluruhan halaman bisa mencapai acuan PDF tanpa menahan pengiriman sidebar.

## 2. Bukti kode dan batas pemeriksaan

- `src/views/user/syllabus/detail.hbs`: layout dua kolom; teori; kartu quiz; petunjuk. Renderer menangani HTML dan sebagian blok EditorJS, tanpa player video khusus.
- `src/syllabus/syllabus.controller.ts`, `detailForUser`: rute `GET /syllabus/learn/:syllabusId` dan data untuk template.
- `src/syllabus/syllabus.service.ts`, `findDetailForUser`: mengambil silabus, quiz pertama, skor terbaik pengguna, nilai minimum, dan silabus berikutnya. Belum mengambil materi.
- `src/entities/syllabus.entity.ts`: memiliki `content` JSONB, relasi course, quiz, dan progress; belum memiliki relasi materi.
- `src/entities/materials.entity.ts`: `Material` sudah mempunyai `title`, `file`, `fileType` (`video`, `pdf`, `ppt`), `driveFileId`, dan relasi `session`. Belum ada nama file asli, ukuran, durasi, atau relasi silabus.
- `src/materials/material.service.ts`: create dan findOne mensyaratkan session. Menambahkan FK saja belum membuat layanan ini mendukung silabus.
- `src/materials/material.controller.ts`: upload PDF, upload PPT/PPTX, dan input video berbasis session; viewer memakai session untuk navigasi. Batas yang terlihat: PDF 10 MB dan PPT 50 MB.
- `src/materials/google-slides.service.ts`: PPT/PPTX dikonversi menjadi Google Slides dan dipublikasikan; hasil tersimpan berupa URL preview dan ID Drive. Alur ini belum menyimpan file PPTX asli untuk unduhan identik.
- `src/views/materi/{pdf,ppt,video}.hbs`: viewer sudah tersedia, tetapi breadcrumb dan konteksnya masih session/week/course.
- `src/views/admin/course/{create_syllabus,edit_syllabus}.hbs`: editor Quill mengirim HTML; jangan menganggap seluruh konten lama berupa EditorJS atau menimpa formatnya.
- `src/courses/courses.service.ts`, `findSyllabusForUser`: daftar silabus menghitung unlock dari kelulusan quiz sebelumnya. Pemeriksaan akses setara belum terlihat dalam `findDetailForUser`; perlu ditelusuri dan diuji pada akses URL langsung.
- `src/syllabus/syllabus.service.ts`, `update`: edit silabus ditolak jika sudah diselesaikan pengguna. Pengelolaan materi baru harus menghormati kebijakan ini sampai ada keputusan lain.
- `src/data-source.ts` dan `package.json`: proyek memakai PostgreSQL/TypeORM dan migrasi versi di `src/database/migrations/`; `synchronize` dikendalikan environment.

Pemeriksaan ini bersifat statis. Database aktif, konfigurasi penyimpanan, kredensial Google, dan aplikasi berjalan belum diverifikasi. Tidak ada build, unit test, atau E2E yang dijalankan untuk dokumen ini.

Saat analisis terdapat perubahan lokal pada `implementation.md`, `src/materials/material.controller.ts`, dan `src/registrations/registrations.controller.ts`. Analisis membaca kondisi working tree. Implementasi berikutnya wajib mempertahankan perubahan tersebut dan memeriksa diff sebelum mengedit.

## 3. Seberapa penting migrasi?

**Migrasi diperlukan untuk rancangan fitur lengkap yang direkomendasikan. Perubahan tampilan saja tidak memerlukan migrasi.**

| Pilihan | Migrasi skema | Konsekuensi |
| --- | --- | --- |
| Mengubah susunan kartu quiz saja | Tidak | Tidak menambahkan materi yang dapat dikelola |
| Menyisipkan tautan di JSONB `content` | Tidak harus | Tetap membutuhkan validasi, editor, dan renderer baru; metadata materi bercampur dengan teori, dan round-trip editor HTML berisiko menghilangkannya |
| Memperluas `Material` agar dapat dimiliki silabus | Ya, tambahan kolom/relasi | Memakai upload dan viewer yang ada, dengan metadata dan kepemilikan yang jelas; rekomendasi |
| Membuat tabel materi silabus terpisah | Ya | Memisahkan dampak terhadap session, tetapi menduplikasi model dan alur pengelolaan; alternatif jika audit menemukan perluasan Material terlalu berisiko |

Migrasi di sini berarti perubahan skema terkontrol, bukan memindahkan seluruh database atau merombak nilai/progress peserta. Tidak perlu menyalin materi session ke silabus secara otomatis. Hubungan keduanya belum tersedia untuk pemetaan yang dapat dipercaya.

### Rancangan data yang direkomendasikan

Perluas `material`, pertahankan `sessionId` untuk data lama, dan tambahkan:

- `syllabusId`: UUID nullable, FK ke syllabus, index untuk pengambilan materi per silabus.
- `originalFileName`: teks nullable, diisi dari upload.
- `fileSizeBytes`: angka ukuran nullable, diisi dari file asli.
- `originalFileUrl`: lokasi file asli nullable, terutama agar unduh PPTX tidak mengambil URL preview Slides.
- `durationSeconds`: angka nullable untuk video; tidak menampilkan durasi palsu jika belum diketahui.

Gunakan `file` sebagai sumber tampilan sesuai jenis yang sudah berlaku. Nama properti final mengikuti konvensi proyek. Jenis internal `ppt` tetap bisa mewakili PPT/PPTX; label UI harus mencerminkan file sebenarnya. File asli disimpan di storage, bukan sebagai biner di tabel.

Satu Material harus mempunyai tepat satu pemilik: session ATAU syllabus. Validasi create/update wajib menolak dua pemilik sekaligus dan tanpa pemilik. Audit nullability dan baris lama sebelum menambah constraint database; jangan menghapus baris tanpa pemilik untuk membuat migrasi lolos. Jika ada anomali, jadwalkan pemetaan yang disetujui dan validasi constraint setelah perbaikan.

Tambahkan relasi balik pada Syllabus. Tidak perlu perubahan `scores`, `quiz_progresses`, atau `syllabus_progresses` untuk menampilkan video dan dokumen. Tidak ada persyaratan baru bahwa video harus selesai sebelum quiz boleh dikerjakan.

## 4. Kontrak perilaku

- Halaman detail menerima tambahan `video` dan `learningMaterials` dari server; template tidak mencari relasi database sendiri.
- Item materi menyediakan ID, judul, jenis, nama asli/ukuran bila tersedia, tujuan preview, dan tujuan unduh yang telah diperiksa aksesnya.
- PDF dan PPT/PPTX muncul di kartu Materi Pembelajaran di atas quiz. Gunakan daftar agar tidak terikat pada tepat dua file; satu PDF dan satu PPTX merupakan contoh PDF acuan.
- Usulan MVP video: satu video utama per silabus, dipilih eksplisit admin. Dukungan playlist bukan syarat acuan.
- Lihat PDF membuka viewer PDF; Lihat Slide membuka viewer presentasi. Viewer membawa breadcrumb kembali ke silabus yang benar.
- Unduh PDF/PPTX mengembalikan file asli dengan nama yang benar. Jangan menggunakan published URL Slides sebagai tautan unduh PPTX.
- Usulan rute khusus konteks: `GET /syllabus/learn/:syllabusId/materials/:materialId` dan akhiran `/download`. Ini rute usulan, belum tersedia. Server memeriksa materi memang milik silabus tersebut dan pengguna memiliki akses course/silabus.
- Gunakan kembali implementasi viewer/upload yang relevan; jangan membuat session palsu agar rute lama menerima silabus.
- Pertahankan status dan rute quiz yang sudah ada. Kelulusan tetap berasal dari skor terhadap `minScore`.
- Jika materi kosong: tampilkan keterangan singkat tanpa tombol palsu. Jika video kosong: sembunyikan player dan sesuaikan petunjuk. Jika berkas hilang/provider gagal: tampilkan pesan dan tindakan yang memang tersedia.
- Nama/ukuran file lama yang belum diketahui tidak direkayasa dari placeholder PDF. Konten HTML dan EditorJS lama tetap terbaca dan tidak dimigrasikan massal.
- Untuk konten baru, validasi URL/media serta sanitasi teks/HTML pada batas input/render yang digunakan. Akses preview/unduh tidak boleh menerima URL bebas untuk diambil server.

## 5. Fase implementasi

### Fase 0: tetapkan kontrak dan periksa data

- Tetapkan target minimum sidebar PDF/PPTX serta video sebagai kelanjutan acuan penuh.
- Periksa skema aktif, histori migrasi, nullability sessionId, dan jumlah materi tanpa pemilik menggunakan Database Manager. Jangan menyimpulkan kondisi DB hanya dari entity.
- Tetapkan apakah materi boleh dipublikasikan lewat Google Slides. Implementasi yang ada memanggil publish; jika materi harus privat, jalur ini memerlukan rancangan akses lain sebelum dipakai.
- Pastikan sumber video, kebijakan unduh file asli, dan apakah materi boleh ditambah/diganti setelah peserta lulus.
- Inventarisasi file materi sebenarnya. PDF acuan adalah desain UI, bukan PDF/PPTX pelajaran yang otomatis harus diunggah.

Hasil: kontrak perilaku dan keputusan yang belum final tercatat. Selesai ketika relasi data serta cara preview/unduh ditetapkan; bukan menunggu desain ulang halaman lain.

### Fase 1: fondasi data dan layanan

- Buat migrasi tambahan untuk relasi dan metadata; pastikan materi session lama tetap valid.
- Perbarui entity, DTO, module registration, serta operasi Material agar mendukung pemilik session atau syllabus secara eksplisit.
- Perluas `findDetailForUser` untuk mengembalikan materi milik silabus dan video utama secara deterministik.
- Terapkan pemeriksaan kepemilikan materi, enrollment/course access, serta aturan silabus terkunci pada jalur baru.
- Buat pengujian perilaku terlebih dahulu: pemilik valid/tidak valid, materi silang silabus, metadata kosong, serta kompatibilitas materi session.

Hasil: data siap digunakan UI. Selesai ketika schema upgrade pada data contoh representatif dan pengujian layanan lulus tanpa mengubah nilai/progress lama.

### Fase 2: pengelolaan admin dan file

- Tambahkan pengelolaan PDF/PPTX dan video pada detail admin silabus; gunakan aturan edit silabus yang berlaku.
- Pakai validasi upload yang ada; rekam nama dan ukuran dari upload, bukan input yang dipercaya begitu saja.
- Simpan file PPTX asli terpisah dari hasil preview, dan pertahankan ID Drive untuk pengelolaan preview.
- Tambahkan create/replace/remove yang menjaga file lama sampai pengganti berhasil tersimpan; kegagalan upload/konversi tidak boleh merusak materi yang sudah bekerja.
- Lindungi perubahan pemilik melalui DTO update; pemilik berasal dari konteks rute yang tervalidasi.

Hasil: admin bisa mengisi materi nyata. Selesai ketika tambah, ganti, hapus, error upload, dan edit yang terkunci teruji; materi session tetap dapat dikelola.

### Fase 3: sidebar, preview, dan unduh

- Tambahkan kartu Materi Pembelajaran di `src/views/user/syllabus/detail.hbs` sebelum quiz.
- Hubungkan viewer dengan konteks silabus dan implementasikan endpoint unduh file asli.
- Render nama, tipe, dan ukuran yang tersedia; jangan hardcode nama file, skor, atau status contoh.
- Buat layout mobile satu kolom dengan urutan baca yang jelas dan akses materi/quiz yang mudah ditemukan; kontrol dapat dipakai dengan keyboard dan memiliki label.
- Uji kondisi tanpa materi, satu jenis file, beberapa file, nama panjang, serta file/provider tidak tersedia.

Hasil: kebutuhan utama kolom kanan berfungsi. Selesai ketika peserta berhak dapat melihat dan mengunduh kedua jenis dokumen, peserta tanpa akses ditolak, dan CTA quiz tetap bekerja untuk semua status.

### Fase 4: video dan penyesuaian teori

- Tampilkan kartu Video Pembelajaran di atas teori; gunakan pola player yang sudah ada sesuai sumber video.
- Sediakan play/pause, seek, fullscreen, dan pengaturan kecepatan yang didukung sumber. Jangan menjanjikan kontrol custom jika sumber hanya menyediakan embed.
- Tampilkan durasi dari metadata sah; untuk media langsung dapat memakai metadata player. Nilai tidak diketahui disembunyikan.
- Pertahankan isi dan gambar teori lama. Perapian HTML, misalnya highlight kuning yang tersimpan dalam konten, harus dibedakan dari perubahan CSS halaman; jangan hapus format isi secara massal.

Hasil: komposisi halaman mendekati keseluruhan PDF acuan dengan aset nyata. Selesai ketika video berfungsi, fallback jelas, konten lama terbaca, dan desktop/mobile ditinjau.

### Fase 5: regresi dan rilis bertahap

- Jalankan diagnostik LSP pada source yang berubah, pengujian terarah, dan build proyek.
- Untuk E2E, mulai dari `e2e_list_flows`, perluas suite yang ada, validasi YAML dengan `e2e_validate`, lalu jalankan hanya melalui Sokudo `e2e_run`.
- Periksa perjalanan admin unggah -> peserta buka silabus -> preview/unduh -> quiz -> kembali ke status yang benar.
- Uji belum dikerjakan, gagal, lulus, tanpa quiz, silabus terakhir, dan akses URL langsung ke silabus terkunci.
- Regresi session bootcamp: viewer PDF/PPT/video, pengelolaan admin, breadcrumb, dan berkas hilang tetap berfungsi.
- Terapkan migrasi tambahan lebih dahulu pada staging, kemudian kode kompatibel, lalu isi satu silabus percontohan. Rilis produksi dan perubahan DB tetap tindakan terpisah dengan persetujuan yang berlaku.

Hasil: bukti pemeriksaan dan daftar keterbatasan nyata. Selesai ketika skenario wajib lulus; jangan menyatakan preview/unduh lulus hanya karena build berhasil.

## 6. Strategi migrasi, pengisian data, dan rollback

1. Tulis migrasi khusus fitur ini; jangan menerima seluruh perubahan dari migration generator tanpa meninjau diff skema.
2. Pertahankan kolom lama; field baru nullable agar data session lama tetap dapat dibaca. Pastikan `sessionId` mengizinkan materi milik syllabus sesuai hasil pemeriksaan skema aktif.
3. Jangan mengandalkan `SYNCHRONIZE=true` sebagai prosedur rilis. Gunakan migrasi versi yang ditinjau dan diuji di environment sasaran.
4. Pengisian metadata lama opsional dan hanya dari sumber tepercaya. Jangan menebak pemetaan session ke syllabus berdasarkan judul.
5. Rollback awal: kembali ke kode/UI lama sambil mempertahankan schema tambahan dan berkas baru. Periksa pembaca lama yang mengasumsikan semua Material memiliki session; arahkan rilis pendahulu kompatibel bila diperlukan.
6. `down` yang menghapus kolom akan menghilangkan relasi/metadata baru. Setelah ada materi silabus nyata, rollback skema harus didahului preservasi data dan penanganan baris baru; bukan rollback otomatis yang dianggap tanpa risiko.

## 7. Keputusan yang masih perlu ditetapkan sebelum implementasi terkait

- Video: tautan YouTube/media langsung atau upload video; usulan awal memakai jalur URL yang sudah tersedia, tanpa membangun hosting video baru.
- Privasi preview: Google Slides yang dipublikasikan boleh atau tidak untuk materi kursus ini. Guard aplikasi tidak membuat URL publik menjadi privat.
- Unduh PPTX: usulan menyimpan file asli agar hasil identik dengan upload; ekspor ulang Slides harus disebut sebagai alternatif dengan konsekuensi format.
- Kebijakan edit materi setelah peserta lulus: usulan awal mengikuti pembatasan silabus sekarang; pelonggaran perlu keputusan produk.

Keputusan tersebut tidak menghalangi penulisan rencana ini. Belum ada izin atau tindakan upload eksternal, publikasi materi, perubahan database, atau deployment dalam pekerjaan analisis ini.
