# Rencana: gambar program di atas, isinya per tab

> **Tanggal:** 2026-09-17
> **Permintaan pemilik:** gambar program dipindah ke bagian atas kartu, dan di
> bawahnya isinya dibagi per tab. Referensi tampilan: bisa.ai.
> **Catatan:** halaman belajar bisa.ai ada di balik login, jadi belum bisa
> dilihat. Rencana ini disusun dari susunan yang pemilik sebutkan, bukan dari
> tiruan tampilan bisa.ai. Begitu tangkapan layarnya ada, bagian tata letak di
> dokumen ini yang perlu disesuaikan lebih dulu.

Dokumen ini rencana. Belum ada kode yang diubah.

---

## 1. Keadaan sekarang

Area belajar hari ini dua kolom:

| | Isi |
|---|---|
| Kolom kiri | judul "Start Learning", kemajuan program, daftar minggu |
| Kolom kanan | kartu program: gambar, tag, judul, deskripsi, lalu tujuh tombol |

Ketujuh tombol itu **bukan tautan biasa** — semuanya memindahkan
`activeSection` pada shell, dan tiap bagian sudah punya panelnya sendiri:

| Tombol | `activeSection` | Dirender oleh |
|---|---|---|
| (halaman ini) | `uiux` | fragment `/program/myProgram/:id/fragment` |
| Presentation | `presentation` | fragment |
| Assignment | `assignment` | fragment |
| Quiz | `quiz` | fragment |
| My Logbook | `logbook` | partial di shell |
| Certificate | `certificate` | kartu di shell |
| Join Group | `group-class` | partial di shell |
| Detail Program | — | tautan ke halaman lain |

**Artinya pekerjaan ini lebih kecil dari kelihatannya.** Tombol-tombol itu sudah
berperilaku seperti tab; yang belum ada hanyalah bentuk tab dan kepala program
yang tetap terlihat saat berpindah.

### Yang jadi masalah sekarang

Kartu program — beserta gambar, judul, dan kemajuannya — berada **di dalam**
panel `uiux`. Begitu student membuka Assignment atau Quiz, seluruh konteks
programnya hilang: tidak ada gambar, tidak ada judul, tidak ada kemajuan, dan
tidak ada jalan pindah antar bagian selain kembali dulu ke Start Learning.

---

## 2. Susunan yang diusulkan

```
┌─────────────────────────────────────────────────────────┐
│  Back · Home / My Learning / Start Learning             │
├─────────────────────────────────────────────────────────┤
│  ███████████ gambar program (tinggi tetap) ████████████ │
│                                                         │
│  [WIP]  Full Stack Developer          [Detail Program]  │
│  belajar menjadi full stack developer     [Join Group]  │
│  2 dari 2 minggu selesai ─────────────────────── 100%   │
├─────────────────────────────────────────────────────────┤
│  Sessions │ Presentation │ Assignment │ Quiz │ Logbook │ │
│  ─────────                                   Certificate│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  isi tab yang sedang aktif                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Kepala program **tetap terlihat di semua tab**. Itu inti perubahannya.

### 2.1 Enam tab, dua aksi

Tab (isinya panel yang sudah ada): **Sessions, Presentation, Assignment, Quiz,
Logbook, Certificate**.

Bukan tab: **Detail Program** (pergi ke halaman lain, jadi tautan di kepala) dan
**Join Group** (aksi sekali tekan, bukan tempat yang dihuni).

`group-class` sebenarnya juga sebuah panel, jadi ia bisa saja jadi tab ketujuh.
Rekomendasi: jadikan aksi dulu. Tujuh tab sudah mulai sesak, dan bergabung ke
grup itu sesuatu yang dilakukan sekali, bukan dibuka berulang.

Nama tab pertama sebaiknya **Sessions**, bukan "Start Learning": judul halaman
sudah menyebut program, dan tab ini isinya memang daftar minggu dan sesi.

### 2.2 Perilaku tab

- Tab aktif ditandai garis bawah navy, bukan latar penuh, supaya tidak berebut
  perhatian dengan tombol aksi di kepala.
- Baris tab **menempel di bawah app bar** saat digulung, supaya pindah tab tidak
  menuntut gulung balik ke atas.
- Di layar sempit baris tab bisa digeser mendatar. Tidak diubah jadi dropdown:
  jumlahnya cuma enam, dan dropdown menyembunyikan tempat-tempat yang justru
  ingin ditemukan.
- Tab yang sedang aktif tetap tercermin di URL (`?tab=`), seperti sekarang, jadi
  halaman bisa ditautkan dan dimuat ulang tanpa kehilangan posisi.

---

## 3. Dari mana datanya

Ini bagian yang menentukan besar-kecilnya pekerjaan.

### 3.1 Gambar, judul, tag, deskripsi — sudah ada, tanpa perubahan controller

Shell sudah memuat `window.userCourses` (objek course lengkap) dan menyimpan
`activeCourseId`. Bahkan sudah ada getter `activeCourseName`. Jadi kepala
program bisa dirender dari Alpine tanpa menyentuh controller, dan ikut benar di
**dua** rute yang merender shell (`/users/profile` maupun
`/program/myProgram/:id`).

Gambar wajib punya tinggi tetap dan penanganan gagal-muat, sama seperti kartu
lain — kalau tidak, kerja menghilangkan lompatan tata letak kemarin terbuang.

### 3.2 Kemajuan program — satu-satunya yang butuh pipa baru

Angka kemajuan dihitung di `myCourseFragment`, yaitu controller fragment tab
Sessions. Kalau kepala program pindah ke shell, angkanya tidak lagi tersedia di
sana.

Tiga pilihan:

| | Cara | Ongkos |
|---|---|---|
| A | Kemajuan tetap di dalam tab Sessions saja | tidak ada perubahan data |
| B | Endpoint JSON kecil, dipanggil kepala program | satu rute baru |
| C | Hitung ulang di kedua controller shell | dua controller + satu query tambahan di tiap muat halaman |

**Rekomendasi: A dulu, B menyusul.** Kepala program tanpa kemajuan masih enak
dilihat, dan kemajuan memang paling relevan saat sedang melihat daftar minggu.
Kalau nanti pemilik ingin kemajuan selalu terlihat, B yang dikerjakan — bukan C,
karena C menambah query pada setiap pemuatan halaman profil meskipun student
sedang tidak membuka program mana pun.

---

## 4. Yang harus dirapikan supaya tidak dobel

Ini yang paling mudah terlewat. Tiap panel sekarang menganggap dirinya berdiri
sendiri, jadi masing-masing menulis judulnya lagi:

- `assignment/index.hbs:7` — judul "Assignment"
- `quiz/index.hbs:50` — judul "Quiz"
- panel Logbook dan Certificate juga punya judulnya sendiri

Begitu nama-nama itu sudah jadi label tab, menuliskannya lagi di dalam panel
membuat kata yang sama muncul dua kali berturut-turut. Judul di dalam panel
harus dihapus, atau diturunkan menjadi keterangan yang benar-benar menambah
sesuatu ("Tugas minggu ini", bukan "Assignment").

Selain itu:

- **Kartu program di kolom kanan dibubarkan.** Isinya pindah: gambar dan judul
  ke kepala, tombol jadi tab, Detail Program dan Join Group jadi aksi di kepala.
- **Kolom kiri jadi selebar penuh**, karena kolom kanannya sudah tidak ada.
- Judul "Start Learning" di dalam fragment dihapus; yang tampil judul program.

---

## 5. Risiko dan hal yang perlu diputuskan

1. **Empat dari enam tab diisi lewat fetch.** Berpindah tab berarti menunggu.
   Tanpa penahan tempat, tiap perpindahan akan melompat persis seperti yang baru
   selesai diperbaiki. Skeleton yang sudah ada
   (`components/ui/learning/skeleton`) harus dipakai untuk keempatnya, bukan
   hanya Sessions.

2. **Kepala program hanya boleh muncul pada tab yang memang milik program.**
   Dashboard, Profile, My Portfolio, dan Payment History tidak boleh kebagian
   gambar program. Daftar `nested` yang sudah dipakai baris remah bisa dipakai
   ulang untuk ini.

3. **Student bisa membuka `?tab=quiz` tanpa pernah memilih program.** Hari ini
   fragment menanganinya dengan mengambil course pertama. Dengan kepala program
   yang menampilkan gambar dan judul, keadaan "belum ada program terpilih" jadi
   terlihat; perlu diputuskan: pilih otomatis course pertama (seperti sekarang),
   atau alihkan ke My Learning.

4. **Tinggi gambar.** Terlalu tinggi dan tab terdorong ke bawah lipatan pada
   laptop; terlalu pendek dan tidak terasa sebagai kepala. Usul: 160px di ponsel,
   200px di layar besar — sejajar dengan tinggi gambar kartu program yang sudah
   dipakai (160px), jadi tidak ada ukuran baru yang dikarang.

5. **Pemeriksaan yang akan gagal.** `design-check` menguji kartu kolom kanan:
   "sticky program card", "Join Group button", "My Logbook button", dan tautan
   Detail Program (baris 268-277). Keempatnya harus ditulis ulang untuk bentuk
   tab. Ini pekerjaan yang sudah diperhitungkan, bukan kejutan.

---

## 6. Tahapan kerja

| Tahap | Isi | Risiko |
|-------|-----|--------|
| **T1** | Kepala program di shell: gambar tinggi tetap, tag, judul, deskripsi, aksi Detail Program dan Join Group. Hanya muncul pada tab milik program. Belum ada tab. | rendah |
| **T2** | Baris tab enam item, menempel saat digulung, bisa digeser di layar sempit, tersambung ke `activeSection` dan `?tab=` yang sudah ada. | rendah |
| **T3** | Bubarkan kartu kolom kanan; kolom kiri jadi selebar penuh. | sedang |
| **T4** | Hapus judul yang kini dobel di dalam tiap panel. | rendah |
| **T5** | Skeleton untuk keempat tab yang di-fetch, bukan hanya Sessions. | rendah |
| **T6** | Perbarui `design-check`: ganti empat pemeriksaan kartu kanan dengan pemeriksaan tab, tambah pemeriksaan bahwa kepala program bertahan saat pindah tab, dan CLS tetap di bawah 0,1 setelah berpindah. | rendah |
| **T7** | Opsional, setelah tangkapan layar bisa.ai ada: sesuaikan detail tata letaknya. | tergantung |

Gerbang yang sudah ada tetap dipakai di tiap tahap: `npx tsc --noEmit`,
`npm run build`, `./scripts/check-user-area.sh`, `npm run test:ui`.

---

## 7. Yang perlu jawaban pemilik

1. **Join Group jadi tab atau aksi?** Rekomendasi: aksi.
2. **Kemajuan program di kepala sejak awal, atau tetap di tab Sessions dulu?**
   Rekomendasi: tetap di tab Sessions dulu (pilihan A di bagian 3.2).
3. **Nama tab pertama: "Sessions" atau tetap "Start Learning"?**
   Rekomendasi: Sessions.
4. **Tangkapan layar halaman belajar bisa.ai** — pemutar pelajaran, daftar
   kurikulum, dan satu pelajaran yang materinya lebih dari satu. Tanpa itu,
   bagian tata letak di sini tetap tebakan yang masuk akal, bukan salinan
   referensinya.
