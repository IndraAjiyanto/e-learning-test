# Implementasi Final: Materi pada Detail Silabus

Tanggal: 16 Oktober 2026.
Status: **DRAF UNTUK REVIEW PENGGUNA — BELUM DISETUJUI UNTUK IMPLEMENTASI.**

Dokumen ini menetapkan usulan keputusan, lingkup implementasi, urutan kerja, dan kriteria penerimaan. Penyusunannya hanya mengubah dokumen; tidak menjalankan migrasi, mengubah aplikasi, memasangkan materi, atau mempublikasikan file.

## 1. Keputusan yang disarankan

**Tambahkan tabel penghubung `syllabus_material` untuk menghubungkan silabus dengan materi yang sudah ada. Pertahankan tabel `material`, hubungan ke session, file, teori, quiz, nilai, dan progress.**

Menambah tabel dan menyambungkan tabel bukan dua pilihan yang selalu terpisah. Dalam usulan ini, tabel baru hanya menyimpan hubungan. Isi materi tetap menggunakan sumber yang sudah tersedia.

Contoh konseptual:

```text
Course → Syllabus → syllabus_material → Material → file/URL yang sudah ada
Course → Weeks → Session ──────────────→ Material
```

Contoh: silabus A dihubungkan ke materi PDF B melalui satu catatan penghubung. ID materi B, session asal, dan lokasi PDF B tetap sama. Melepas B dari silabus A hanya menghapus hubungan tersebut.

**Alasan memilih ini:** prioritas pengguna adalah mempertahankan materi yang sudah diisi. Model penghubung memungkinkan materi yang sama dipakai di beberapa silabus tanpa mengganti pemilik session atau menggandakan file.

Ini menggantikan rekomendasi awal untuk menambahkan kepemilikan `syllabusId` langsung ke `Material` pada [rencana sebelumnya](syllabus-learning-materials-plan.md). Rancangan penghubung dipilih untuk lingkup pemakaian ulang materi; unggah materi mandiri langsung ke silabus mempunyai kebutuhan berbeda.

### Perbandingan pilihan

| Pilihan | Kelebihan | Kekurangan / batas | Rekomendasi |
| --- | --- | --- | --- |
| Tambah `syllabusId` langsung di `material` | Sederhana bila satu materi hanya untuk satu silabus | Tidak mendukung beberapa silabus per materi tanpa struktur tambahan; aturan pemilik session/silabus perlu diubah | Cocok bila materi akan menjadi milik silabus secara eksklusif |
| Tambah tabel penghubung `syllabus_material` | Relasi session tetap; satu materi bisa digunakan beberapa silabus; cukup melepas hubungan untuk menghilangkan dari halaman | Memerlukan query relasi dan perlindungan edit/hapus materi bersama | **Pilihan utama untuk materi lama pada proyek ini** |
| Tambah tabel materi silabus dengan salinan judul/file | Pengelolaan materi mandiri dapat dipisahkan | Duplikasi metadata dan aturan penghapusan aset menjadi lebih rumit | Tidak dipilih untuk tahap pemakaian ulang |
| Tanpa perubahan skema | Cukup untuk tata letak atau tautan yang memang sudah tersimpan | Kode saat ini belum punya pemetaan Material–Syllabus | Hanya jika audit membuktikan data yang ada mencukupi lingkup yang disepakati |

Rekomendasi ini bersyarat pada hasil audit: materi yang ingin ditampilkan harus benar-benar tersedia dan boleh dipakai oleh peserta silabus tujuan. Kesamaan course bukan bukti bahwa setiap materi otomatis cocok.

## 2. Review yang diperlukan dari pengguna

Semua pilihan di bawah masih **usulan**, bukan keputusan pengguna yang sudah disetujui.

| ID | Keputusan | Usulan untuk disetujui | Dampak |
| --- | --- | --- | --- |
| D1 | Model data | Tabel penghubung; tidak memindahkan materi session | Ada migrasi skema tambahan |
| D2 | Lingkup rilis pertama | Admin memilih/melepas materi yang sudah ada dan mengatur urutannya | Unggah langsung ke silabus belum tersedia |
| D3 | Materi yang boleh dipilih | Materi dari course yang sama, dipilih eksplisit admin | Pemakaian lintas course tidak termasuk |
| D4 | Video | Maksimal satu video utama per silabus dari materi video yang sudah ada | Tidak membangun hosting atau playlist baru |
| D5 | Unduhan | PDF asli bila tersedia; PPT/PPTX asli hanya bila keberadaannya terbukti | Preview Slides saja tidak memenuhi unduh PPTX identik |
| D6 | Materi yang sedang dipakai bersama | Tolak edit/ganti/hapus sumber selama masih terhubung ke silabus; buat materi pengganti lalu ubah hubungan | Menambah perlindungan pada pengelolaan materi session |
| D7 | Silabus yang sudah diluluskan peserta | Ikuti larangan edit yang berlaku, termasuk perubahan hubungan materi | Jika ingin melengkapi lampiran silabus yang sudah lulus, perlu keputusan pengecualian secara eksplisit |
| D8 | Publikasi eksternal | Tidak membuat publikasi baru otomatis; gunakan aset yang sudah disetujui pemilik konten | Materi privat membutuhkan jalur akses yang sesuai |

**Urutan review:** setujui atau koreksi D1–D8, terutama D2, D5, dan D7. Setelah itu izinkan fase 0 untuk memeriksa data. Hasil audit menentukan apakah lingkup ini cukup atau diperlukan perluasan sebelum implementasi.

Jika kebutuhan wajib mencakup unggah PDF/PPTX/video langsung pada silabus tanpa session, jangan menyatakan rilis pertama sudah memenuhi seluruh kebutuhan. Tambahkan lingkup tersebut melalui revisi desain sebelum eksekusi terkait.

## 3. Apa fungsi migrasi dan apakah file lama hilang?

| Jenis tindakan | Fungsi dalam rencana | Status |
| --- | --- | --- |
| Migrasi skema | Membuat tabel penghubung beserta foreign key, index, dan aturan keunikan | Diperlukan untuk rancangan ini |
| Pengisian hubungan | Menambahkan pasangan ID silabus dan ID materi yang dipilih admin | Dilakukan setelah pemetaan diverifikasi; bukan otomatis saat migrasi |
| Penambahan metadata file | Menyimpan nama, ukuran, atau lokasi file asli yang terbukti tersedia | Terpisah dan hanya jika audit membuktikan diperlukan |
| Pemindahan file | Mengubah lokasi fisik berkas | Tidak diperlukan untuk pemakaian ulang |
| Reset / seed ulang | Mengosongkan atau mengganti konten | Dilarang dalam lingkup ini |

Migrasi awal membuat tabel penghubung kosong. Ia tidak menulis ulang teori, mengubah ID, memutus session, menghapus materi, mengonversi PPT, atau memindahkan file.

**File lama tidak perlu hilang akibat rancangan ini. Namun, keselamatannya harus dibuktikan dari migrasi, alur aplikasi, dan storage.** Database menyimpan referensi; berkas fisik dapat berada pada storage/provider terpisah. Backup database saja belum mencakup seluruh berkas.

Menambahkan foreign key saja tidak cukup: kode lama dapat menghapus file terlebih dahulu sebelum database menolak penghapusan catatan. Perlindungan aplikasi wajib dipasang sebelum hubungan pertama dibuat.

## 4. Dasar kode dan hal yang belum diketahui

| Bukti lokal | Temuan |
| --- | --- |
| `src/entities/materials.entity.ts` | Material menyimpan judul, file, jenis, ID Drive, dan hubungan session; belum ada hubungan silabus |
| `src/entities/syllabus.entity.ts` | Teori berada di `content`; relasi course, quiz, dan progress sudah tersedia |
| `src/materials/material.service.ts` | Create/findOne mengasumsikan session; remove menghapus aset sebelum menghapus catatan |
| `src/materials/material.controller.ts` | Alur upload/viewer berbasis session; penggantian PDF memanggil penghapusan file sebelum menyimpan perubahan |
| `src/materials/google-slides.service.ts` | Upload mengonversi dan mempublikasikan presentasi; penggantian dapat menghapus presentasi lama sebelum referensi database diperbarui |
| `src/syllabus/syllabus.service.ts` | Detail user belum mengambil Material; update silabus ditolak jika sudah ada peserta lulus |
| `src/entities/session.entity.ts`, `src/entities/weeks.entity.ts` | Materi mempunyai konteks course melalui session dan weeks; ada relasi penghapusan berantai yang perlu diuji |
| `src/data-source.ts` | PostgreSQL/TypeORM; skema dapat disinkronkan dari environment dan migrasi dibaca dari hasil build |

Database Manager pada pemeriksaan 16 Oktober 2026 mengembalikan daftar sumber kosong. Skema aktif, isi `syllabus.content`, pemetaan materi sebenarnya, file asli, dan izin storage belum terverifikasi.

PDF acuan tidak dibuka ulang dalam revisi ini. Sasaran visual mengikuti hasil analisis sebelumnya: video di atas teori dan kartu dokumen di atas quiz. Acuan asli perlu ditinjau kembali saat implementasi UI.

## 5. Kontrak data yang diusulkan

Tabel baru `syllabus_material` berupa entity relasi eksplisit. Nama tabel/kolom akhir mengikuti konvensi skema yang diperiksa pada fase 0.

| Kolom | Fungsi |
| --- | --- |
| `id` | ID hubungan, menggunakan konvensi ID proyek |
| `syllabusId` | FK wajib ke silabus |
| `materialId` | FK wajib ke materi yang sudah ada |
| `sortOrder` | Urutan tampil; gunakan ID sebagai pembanding tambahan bila urutan sama |
| `isPrimaryVideo` | Penanda video utama; default false |
| `createdAt` | Waktu hubungan dibuat |

Aturan:

1. Pasangan `syllabusId + materialId` unik. Percobaan pemasangan ulang tidak membuat duplikat.
2. Index mendukung pembacaan per silabus dan pemeriksaan semua hubungan per materi.
3. FK ke Material memakai pembatasan penghapusan, bukan cascade. FK ke Syllabus boleh menghapus catatan penghubung saat silabus sah dihapus; tidak menghapus Material atau asetnya.
4. Maksimal satu hubungan berstatus video utama per silabus. Terapkan index unik bersyarat; layanan memastikan hanya materi berjenis video yang dapat ditandai.
5. Pemasangan dan perubahan urutan dilakukan dengan validasi role, akses course, serta aturan edit silabus yang berlaku.
6. Course materi harus sama dengan course silabus untuk lingkup awal. Jangan memilih berdasarkan kemiripan judul atau nomor urut.
7. Tidak menambahkan `syllabusId` ke Material dan tidak mengubah nullability session dalam lingkup awal.
8. Metadata aset tetap berada pada sumber materi, bukan disalin ke setiap hubungan. Bila nama/ukuran tidak diketahui, UI menyembunyikan nilai tersebut.
9. Tidak ada pemasangan massal dalam migration `up`. Admin memilih pemetaan setelah sumber diverifikasi.

Jika audit memastikan metadata asli belum tersimpan tetapi wajib untuk rilis, ajukan tambahan nullable pada Material: nama asli, ukuran byte, dan kunci/lokasi file asli. Nilai lama tetap kosong sampai diverifikasi. Penyimpanan file asli baru atau pemulihan PPTX lama merupakan pekerjaan tersendiri; tabel penghubung tidak menciptakan kembali file yang tidak tersedia.

## 6. Perilaku aplikasi dan perlindungan sumber

### Admin

- Pada detail silabus, tampilkan daftar materi yang sudah dipasang dan pilihan materi dari course yang sama.
- Admin dapat memasang, melepas, mengurutkan dokumen, serta memilih/mengganti video utama.
- Tampilkan konteks session asal agar pemetaan dapat diperiksa.
- Tombol lepas hanya menghapus hubungan. Jangan memanggil `MaterialService.remove` untuk operasi ini.
- Simpan hubungan secara terpisah dari editor teori agar `syllabus.content` tetap utuh.
- Untuk rilis pertama, materi baru dibuat melalui session yang memang valid dan relevan. Jangan membuat session palsu demi memenuhi relasi.
- Jika course tidak memiliki session/materi yang sesuai, tampilkan keadaan kosong dan laporkan kebutuhan unggah mandiri; jangan memasang materi lintas course diam-diam.

### Peserta

- Ambil dokumen melalui hubungan silabus; kartu Materi Pembelajaran tampil di atas quiz.
- Ambil video utama melalui hubungan yang ditandai; tampilkan di atas teori.
- Viewer menyediakan navigasi kembali ke silabus tujuan.
- Preview dan unduh memeriksa hak peserta atas silabus, aturan terkunci, serta pasangan hubungan yang diminta. ID material saja tidak cukup.
- Rute silabus tidak bergantung pada navigasi viewer session; baca aset yang sama setelah pemeriksaan konteks silabus.
- Unduh hanya tersedia bila file sumber yang benar dapat diambil. Jangan memakai URL preview Slides sebagai unduhan PPTX.
- Tidak mengubah status, skor, kelulusan, atau progress. Tidak menambah syarat menyelesaikan video sebelum quiz.
- Tangani materi kosong, video kosong, file/provider gagal, dan metadata tidak lengkap tanpa tombol palsu.

### Edit, ganti, dan hapus sumber

- Materi yang mempunyai hubungan silabus ditolak untuk edit/ganti/hapus pada seluruh jalur aplikasi. Pesan admin menyebutkan bahwa materi sedang dipakai silabus.
- Untuk mengganti konten, buat materi baru lalu ganti hubungan pada silabus yang boleh diedit. Materi lama tetap tersedia pada session asal.
- Periksa penggunaan sebelum upload pengganti, penghapusan PDF, atau panggilan Google Slides yang dapat menghapus aset lama.
- Pemasangan hubungan dan perubahan/penghapusan sumber harus memakai aturan transaksi/penguncian yang konsisten, agar pemeriksaan penggunaan tidak kalah oleh permintaan bersamaan.
- Audit penghapusan session, weeks, dan course serta cleanup yang dipanggilnya. Tidak boleh menghapus berkas terlebih dahulu lalu baru gagal karena FK.
- Tidak ada cleanup massal aset dalam fitur ini. Penghapusan file oleh administrator provider di luar aplikasi tetap memerlukan backup/pemulihan tersendiri.
- Link publik atau file statis tidak menjadi privat hanya karena halaman diberi guard. Audit keterpaparan URL; kebutuhan materi privat harus dipenuhi sebelum rilis materi tersebut.

## 7. Fase eksekusi dan hasil yang harus direview

### Fase 0 — Audit data dan kesesuaian lingkup

Prasyarat: pengguna sudah mereview arah D1–D8 dan mengizinkan audit.

- Hubungkan sumber melalui Database Manager; describe skema sebelum query baca yang dibatasi. Jika sumber belum tersedia, catat keterbatasan dan jangan mengklaim audit produksi selesai.
- Periksa contoh silabus yang benar, format teori, materi course/session, URL, file asli, izin peserta, dan status kelulusan.
- Cocokkan histori migrasi dengan seluruh migrasi pending; verifikasi konfigurasi sinkronisasi.
- Buat daftar pemetaan calon pasangan silabus–materi untuk review admin. Jangan menyimpan data sensitif dalam dokumen publik.
- Siapkan dasar pembanding ID, isi teori, relasi, nilai/progress, dan inventaris aset; gunakan checksum bila dapat diambil.
- Tentukan mekanisme backup database dan storage serta buktikan restore pada lingkungan terpisah yang diizinkan.

**Hasil:** laporan audit, pemetaan calon materi, kebutuhan metadata, dan bukti pemulihan.
**Lulus:** materi yang dimaksud memang tersedia dan lingkup pemakaian ulang disetujui. Jika tidak, revisi lingkup unggah mandiri/arsip asli dahulu; jangan memaksakan model ini.

### Fase 1 — Skema dan perlindungan sumber

- Tulis pengujian perilaku untuk pemasangan, duplikasi, lintas course, video utama, silabus terkunci, dan penghapusan sumber.
- Buat entity penghubung dan migrasi terisolasi; tambahkan relasi yang diperlukan pada entity dan registrasi module.
- Implementasikan layanan hubungan, pemeriksaan akses, transaksi, dan pembatasan operasi sumber sebelum hubungan pertama dibuat.
- Lindungi seluruh jalur cleanup/penghapusan yang relevan, termasuk kegagalan operasi dan permintaan bersamaan.
- Siapkan versi pemulihan aplikasi yang tetap mempertahankan pemeriksaan penggunaan sumber.

**Hasil:** diff kode/migrasi dan hasil pengujian.
**Lulus:** constraint dan layanan bekerja; percobaan hapus/ganti sumber terhubung tidak memanggil penghapusan aset; data lama tidak diubah oleh migrasi.

### Fase 2 — Pengelolaan hubungan oleh admin

- Tambahkan pilihan materi, daftar terpasang, lepas, urutan, serta pemilihan video utama.
- Terapkan larangan edit yang disepakati, termasuk kasus peserta sudah lulus.
- Pisahkan operasi lampiran dari penyimpanan teori.
- Pastikan akses langsung ke endpoint mempunyai validasi yang sama dengan UI.

**Hasil:** admin dapat memasang materi nyata pada satu silabus percontohan.
**Lulus:** pemasangan/lepas tidak mengubah ID, session, file, atau isi teori; sumber yang dipakai dua silabus tetap utuh saat salah satu hubungan dilepas.

### Fase 3 — Halaman peserta, viewer, dan unduh

- Perluas detail user untuk mengembalikan dokumen terurut dan video utama.
- Tambahkan kartu materi di atas quiz serta video di atas teori.
- Hubungkan preview dan unduh melalui konteks silabus yang tervalidasi.
- Verifikasi nama/ukuran sesuai bukti; tandai keterbatasan file asli.
- Periksa desktop, mobile, keyboard, nama panjang, keadaan kosong, dan kegagalan provider terhadap PDF acuan.

**Hasil:** halaman silabus memakai materi yang benar.
**Lulus:** peserta berhak dapat mengakses materi; akses tidak sah ditolak; teori, navigasi, dan quiz tetap berfungsi. Jika unduh PPTX asli diwajibkan, rilis belum lulus sampai aset asli tersedia.

### Fase 4 — Verifikasi pada salinan data

- Jalankan LSP untuk source yang berubah, unit/integration test terarah, dan build proyek.
- Uji migrasi pada salinan database yang diizinkan; bandingkan dasar pembanding sebelum/sesudah.
- Gunakan Sokudo E2E: mulai `e2e_list_flows`, perluas flow yang sesuai, validasi dengan `e2e_validate`, lalu `e2e_run`. Tidak memakai runner browser alternatif.
- Jalankan alur admin → silabus → preview/unduh/video → quiz, serta regresi materi session dan skenario proteksi sumber.
- Uji rollback aplikasi ke versi pemulihan, termasuk penolakan penghapusan aset yang masih digunakan.

**Hasil:** laporan pemeriksaan dengan hasil nyata dan keterbatasan.
**Lulus:** seluruh skenario wajib pada bagian 8 terverifikasi; error provider atau file hilang tidak disamakan dengan kelulusan build.

### Fase 5 — Rilis yang disetujui pengguna

- Sajikan hasil staging, migrasi yang tepat, pemetaan pilot, dan langkah pemulihan untuk review.
- Ajukan perubahan database melalui kartu proposal Database Manager; pelaksanaan/commit mengikuti tindakan pengguna.
- Pastikan sinkronisasi otomatis tidak menghapus tabel tambahan saat deploy atau rollback.
- Terapkan skema lebih dahulu; saat tabel masih kosong, deploy aplikasi dengan perlindungan sumber. Setelah verifikasi, aktifkan pemasangan pilot.
- Periksa satu silabus dahulu, lalu perluas pemetaan sesuai persetujuan admin.

**Hasil:** fitur aktif dengan konten lama tetap dapat diakses.
**Lulus:** pemeriksaan pascarilis sesuai baseline; tidak ada kehilangan teori, hubungan session, aset, nilai, atau progress.

## 8. Kriteria penerimaan

- [ ] Migrasi awal hanya menambah tabel/constraint/index yang disetujui; tidak memasangkan atau menghapus materi lama.
- [ ] ID dan isi teori, hubungan session, URL/aset, quiz, nilai, serta progress tetap sesuai baseline.
- [ ] Satu materi dapat dipasang ke dua silabus yang diperbolehkan tanpa menyalin file.
- [ ] Hubungan duplikat dan lintas course ditolak.
- [ ] Maksimal satu video utama; materi PDF/PPT tidak bisa ditandai sebagai video.
- [ ] Lepas dari satu silabus tidak menghapus sumber atau hubungan silabus lain.
- [ ] Edit/ganti/hapus sumber terhubung ditolak sebelum efek pada storage, termasuk melalui endpoint langsung.
- [ ] Penghapusan parent dan permintaan bersamaan tidak merusak aset yang masih dipakai.
- [ ] Aturan silabus selesai/terkunci berlaku pada perubahan lampiran dan akses peserta.
- [ ] Preview, unduh asli yang tersedia, serta video teruji dengan aset nyata.
- [ ] Keadaan kosong/gagal dan metadata tidak tersedia ditampilkan dengan benar.
- [ ] Quiz belum dikerjakan/gagal/lulus, tanpa quiz, dan silabus terakhir tetap bekerja.
- [ ] Materi session dan navigasinya tetap berfungsi.
- [ ] Backup/restore serta versi pemulihan aplikasi sudah diuji sebelum produksi.

## 9. Peta perubahan untuk pelaksana

| Area | File/lokasi | Tujuan |
| --- | --- | --- |
| Entity baru | Usulan `src/entities/syllabus-material.entity.ts` | Catatan penghubung beserta urutan/video utama |
| Entity terkait | `src/entities/materials.entity.ts`, `src/entities/syllabus.entity.ts` | Relasi baca; tidak mengganti pemilik materi |
| Migrasi | `src/database/migrations/` | Skema tambahan sesuai audit |
| Layanan hubungan | Modul silabus/materi yang sesuai | Pasang, lepas, urutkan, pilih video, dan validasi |
| Proteksi sumber | `src/materials/material.service.ts`, `material.controller.ts`, `google-slides.service.ts` serta jalur hapus parent terkait | Cegah penghapusan aset yang masih dipakai |
| Detail peserta | `src/syllabus/syllabus.service.ts`, `syllabus.controller.ts` | Data dan akses materi dalam konteks silabus |
| Admin | `src/views/admin/course/detail_syllabus_item.hbs` dan editor terkait bila diperlukan | Pemilihan materi tanpa menulis ulang teori |
| UI peserta | `src/views/user/syllabus/detail.hbs`, viewer `src/views/materi/` | Dokumen, video, preview, navigasi |
| Pengujian | Spec modul terkait dan `e2e/` | Perilaku relasi, akses, keselamatan aset, dan regresi |

Ada perubahan lokal yang sudah tersedia pada `implementation.md`, `src/materials/material.controller.ts`, dan `src/registrations/registrations.controller.ts`. Pelaksana harus membaca diff saat mulai bekerja dan mempertahankan perubahan tersebut; jangan melakukan reset atau menimpa pekerjaan yang belum dikomit.

## 10. Rollback

1. Hentikan pemasangan baru dan nonaktifkan tampilan fitur jika perlu.
2. Pertahankan tabel penghubung dan aset; jangan langsung menjalankan migrasi `down`.
3. Gunakan versi pemulihan yang tetap melindungi materi terhubung. Versi lama yang menghapus file sebelum menghapus catatan tidak aman dipakai untuk operasi destruktif meskipun FK sudah ada.
4. Jangan mengaktifkan sinkronisasi skema pada kode lama yang belum mengenali tabel/relasi baru.
5. Jika penghapusan tabel benar-benar diperlukan, ekspor serta verifikasi seluruh pemetaan dan tinjau dampaknya terlebih dahulu. Menghapus tabel penghubung akan menghilangkan pemetaan baru.
6. Restore database penuh harus memperhitungkan aktivitas peserta sejak backup agar nilai/progress terbaru tidak hilang.

## 11. Status penyerahan

- **Sudah:** pemeriksaan source terarah dan pembaruan dokumen untuk review.
- **Belum:** audit database/storage aktif, pemetaan aktual, implementasi source, migrasi, backup/restore, unit test, build, E2E, dan deployment.
- **Otorisasi berikutnya:** review D1–D8; bila disetujui, mulai fase 0. Persetujuan dokumen tidak otomatis menjadi persetujuan menjalankan perubahan database produksi atau publikasi aset.
- **Memori:** tool claude-mem tidak tersedia; ringkasan rencana disimpan melalui memori workspace Sokudo.

