# PRD - Responsive Mobile Navbar User

Tanggal: 7 Oktober 2026. Baseline kode: `963a9aa0`.
Status: spesifikasi slicing; UI belum diimplementasikan.
Task ClickUp: `90182814122/z8pbk8yh9v` - **Responsive mobile navbar user**.

## 1. Kebutuhan dan tujuan

Isi task yang ditempel pengguna:

> Selaraskan navbar mobile supaya isi navbar nya sama dengan yang ada di desktop namun dalam design mobile

Teks ini menjadi sumber task; metadata, lampiran, dan checklist lain di ClickUp tidak diklaim telah diverifikasi.
Target: drawer navbar publik/user, **bukan sidebar dashboard pelajar, app bar user, atau navigasi admin**.

Keputusan pengguna:

- Panel putih, aksen navy, logo Kesatria asli dengan ukuran kecil.
- Menu utama: Beranda, Kelas, Corporate Training, Informasi.
- Informasi: Tentang, Galeri, Portofolio, Alumni.
- Tidak ada menu tambahan Marketing Program / Marketing Program Partner.
- Bahasa terlihat sebagai ID, EN, JP.
- Reuse komponen proyek; komponen baru di `src/views/partials/components/ui/user/` dengan prefix `user_mobile_nav_`.
- Tahap sekarang menghasilkan dokumen untuk AI implementer, bukan perubahan UI.

## 2. Audit kode dan scope

| Sumber | Temuan |
| --- | --- |
| `src/views/partials/navbar.hbs:1` | Alpine state dibagi desktop/mobile; handler harus menjaga perilaku desktop. |
| `src/views/partials/navbar.hbs:82` | Desktop menjadi acuan menu, URL, kategori, CTA, dan aturan akun. |
| `src/views/partials/navbar.hbs:275` | Drawer sekarang navy, lebar 320 px, logo putih, MPP statis. |
| `src/views/layouts/main.hbs:131` | Navbar pada cabang shell publik non-bareShell. Jangan memperluas cakupan render. |
| `src/views/partials/components/ui/nav/lang_switcher/index.hbs:1` | Bahasa tersedia; default juga dipakai app bar user. Mobile existing untuk latar gelap. |
| `src/views/partials/components/ui/card/category/dynamic/index.hbs:1` | Kategori reusable, varian mobile teks putih/ikon besar. |
| `src/views/partials/components/ui/nav/dropdown_row/index.hbs:1` | Row Informasi reusable; handler default belum menutup drawer. |
| `src/main.ts:65` | Registrasi Handlebars menggunakan direktori partial proyek. |
| `src/common/public/js/alpine.js:1` | Alpine dan collapse tersedia. Tidak perlu framework baru. |

In scope: drawer di bawah 1024 px, varian komponen opt-in, paritas menu/data/akun, aksesibilitas, regresi desktop.

Out of scope: redesign desktop/dashboard/admin; perubahan API, database, route, atau aturan auth; menghapus fitur/route/partial MPP; menambah Blog/Logout/menu dashboard yang tidak ada pada desktop navbar; dependency baru dan refactor global.

## 3. Matriks desktop ke mobile

| Desktop | Target mobile | Sumber/tujuan |
| --- | --- | --- |
| Logo | Logo kecil header | `/public/image/logo_baru.png`, link `/dashboard` |
| Beranda | Baris utama | `/dashboard`, key `home` |
| Kelas | Accordion | Key `class` |
| Kategori | Daftar dinamis sesuai urutan API | `GET /dashboard/api/category`; `/category/program/` + `kat.name` |
| Ikon/deskripsi kategori | Ikon ringkas + teks | `kat.icon`, `kat.name`, `getByLang(kat.text, lang)`, fallback ID |
| Konsultasi Kelas | CTA ringkas setelah kategori | `classCtaTitle`, `classCtaDesc`, `classCtaButton`; `waLink social.[0].number` |
| Corporate Training | Baris utama, boleh wrap | `/dashboard/corporate-training`, `corporateTraining` |
| Informasi | Accordion | Key `information` |
| Tentang | Submenu | `/dashboard/about`, `about`, `infoAboutDesc` |
| Galeri | Submenu | `/dashboard/gallery`, `gallery`, `infoGalleryDesc` |
| Portofolio | Submenu | `/dashboard/portofolios`, `portfolio`, `infoPortfolioDesc` |
| Alumni | Submenu | `/dashboard/alumni`, `alumni`, `infoAlumniDesc` |
| Bahasa | ID / EN / JP sejajar | POST `/translation`: `id` / `en` / `ja` |
| Masuk | Tombol footer | `/login`, kondisi sama dengan desktop |
| Profil | Avatar + username footer | `/users/profile`, kondisi dan target tab sama dengan desktop |
| CTA login Informasi | Dikonsolidasikan ke Masuk footer | Tujuan tetap tersedia, tanpa duplikasi card besar |
| Intro mega-menu | Tidak wajib menyalin paragraf panjang | Adaptasi mobile, bukan replika grid desktop |

Key singkat memakai namespace `test.navbar`. Pertahankan ejaan URL `/dashboard/portofolios`.

**Interpretasi slicing:** paritas adalah tujuan navigasi, data, kondisi, dan aksi yang sama. Konsultasi disertakan karena ada di desktop. Konsolidasi login dan penghilangan intro panjang merupakan adaptasi layout yang diusulkan dokumen, bukan checklist tambahan dari ClickUp.

**MPP:** hapus hanya pemanggilan `components/ui/card/category/mpp/index isMobile=true` dari drawer. Jangan memfilter kategori API berdasarkan nama diam-diam. Jika API nyata berisi kategori MPP, laporkan konflik tanpa-MPP versus paritas desktop sebelum mengubah filter/data.

## 4. Spesifikasi slicing

| Elemen | Spesifikasi |
| --- | --- |
| Panel | Dari kanan, putih `#FFFFFF`, target 288 px, maksimum `calc(100vw - 24px)` |
| Tinggi | Fallback 100vh lalu 100dvh |
| Logo | Aset `src/common/public/image/logo_baru.png`; target lebar 104 px, tinggi auto, maksimal 28 px, contain tanpa distorsi |
| Header | Minimum 64 px, padding horizontal 16 px, border bawah `#E5E7EB` |
| Tutup | Ikon 18 px, area sentuh 44 x 44 px |
| Menu | Inter 14 px / line-height 20 px, medium/semibold, min-height 44 px |
| Ikon/chevron | Ikon 18 px, chevron 12-14 px; kolom terpisah, tidak menyusut |
| Submenu | Judul 13-14 px, deskripsi 11-12 px, tinggi mengikuti isi |
| Spasi | Padding 16 px, gap 10-12 px, radius item 8 px |
| Teks | Utama `#1F2937`, pendukung `#4A5568`, aksen `#003060` |
| Aktif | Latar `#E4F1F7`, navy, semibold, penanda aksesibel |
| Footer | Border atas, padding 16 px + safe area, bahasa di atas akun |
| Bahasa | Tiga kolom sama lebar, label 12 px; visual kapsul 32 px dalam area sentuh min. 44 px |
| Masuk | Navy, teks putih, min-height 44 px, lebar penuh |

Struktur: header `shrink-0`; konten `min-h-0 flex-1 overflow-y-auto`; footer `shrink-0` dengan safe-area. Footer tidak absolute menimpa menu. Untuk viewport sangat pendek/zoom, sediakan fallback scroll seluruh panel.

Kolom teks `min-w-0`; label navigasi boleh wrap/menambah tinggi, username boleh truncate. Jangan memotong logo dari mockup atau memakai logo putih pada panel putih.

State visual: tertutup, menu utama, Kelas, Informasi, kedua accordion terbuka, item aktif, tamu, profil, kategori loading/kosong/gagal.

## 5. Kontrak perilaku

### Drawer dan aksesibilitas

- Hamburger membuka; tutup, overlay, Escape, dan link menutup dengan cleanup idempoten.
- Resize ke `>=1024` menutup, reset accordion, pulihkan scroll/background. Fokus jangan tertinggal pada hamburger tersembunyi.
- State desktop `menu` terpisah dari accordion mobile. Pertahankan dua accordion independen seperti baseline; keduanya boleh terbuka.
- Close mereset accordion; open ulang menampilkan menu utama.
- Active state mengikuti pathname saat load/back/forward dan helper existing; parent menandai submenu aktif.
- Fokus awal ke tutup; Tab/Shift+Tab hanya pada elemen drawer yang terlihat; close mengembalikan fokus jika pemicu masih terlihat.
- Gunakan dialog bernama dengan navigasi di dalamnya, isolasi background, `aria-expanded`, `aria-controls`, dan `aria-current=page` pada link tepat aktif.
- Ikon dekoratif tidak dibacakan screen reader; semua kontrol bernama aksesibel.
- Simpan/pulihkan overflow dan isolasi background sebelumnya; jangan merusak modal lain.
- Gunakan hidden awal/x-cloak, reduced motion, serta overlay di atas konten dan di bawah panel. Uji header auth dengan backdrop blur: fixed drawer tidak boleh terkunci pada dimensi header.

### Bahasa dan akun

- Label ID -> `id`, EN -> `en`, JP -> **`ja`**, bukan `jp`.
- Reuse POST `/translation`; bukan endpoint baru atau state lokal saja. Pilihan aktif setelah redirect berasal dari `lang` server.
- Backend `src/translation/translation.controller.ts` memakai cookie `secure: true`; verifikasi persistensi di environment yang mendukungnya sebelum menyimpulkan bug UI.
- Reuse key `src/i18n/{id,en,ja}/test.json`; key status/aksesibilitas baru tersedia pada tiga bahasa.

| Kondisi | Aksi akun |
| --- | --- |
| `isAuthenticated && user.isVerified` | Profil dengan avatar existing/fallback inisial |
| Bukan kondisi profil dan `!isAuthPage` | Masuk |
| Bukan kondisi profil dan `isAuthPage` | Tanpa aksi akun; bahasa tetap ada |
| Profil dengan role user | Pertahankan target tab baru dan rel noopener noreferrer |
| Profil dengan role lain yang mencapai navbar | Pertahankan tanpa target tab baru seperti desktop |

### Kategori dan konsultasi

- Reuse satu fetch milik navbar; jangan fetch ulang dari partial.
- Bedakan loading, kosong, gagal; tidak memakai kategori contoh/hardcoded.
- Normalize path ikon seperti desktop; ikon kosong/gagal memakai fallback.
- Deskripsi mengikuti bahasa aktif/fallback ID dan tidak menyebabkan overflow.
- Konsultasi memakai `social` dan `waLink`, bukan nomor baru. Pertahankan fallback `#` desktop saat data kosong; jangan mengklaim kontak berfungsi tanpa data.

## 6. Reuse dan komponen baru

Path tabel relatif terhadap `src/views/partials/components/ui/`.

| Komponen | Rencana |
| --- | --- |
| `nav/lang_switcher/index.hbs` | Varian opt-in `userMobile=true`: ID/EN/JP segmented; default dan mobile lama tetap. |
| `card/category/dynamic/index.hbs` | Varian `userMobile=true`: putih, ikon kecil, active state/fallback; kartu lain tetap. |
| `nav/dropdown_row/index.hbs` | Varian `userMobile=true`: row ringkas, close handler mobile; default desktop tetap. |
| `user/user_mobile_nav_drawer/index.hbs` | Partial baru yang direncanakan: komposisi header/menu/CTA/footer, bukan state kedua. |

Komponen tambahan hanya bila dibutuhkan, dengan pola `user/user_mobile_nav_<fungsi>/index.hbs`. Jangan duplikasi komponen yang bisa diperluas melalui varian.

State tetap dimiliki navbar. Drawer mewarisi `open`, `classOpen`, `infoOpen`, `category`, `lang`, helper active dan handler. Jangan membuat nested state yang men-shadow induk. Varian baru didahulukan sebelum flag legacy `mobile`/`isMobile` bila keduanya diberikan.

## 7. Acceptance criteria

- AC-01: Menu/URL sesuai matriks, tanpa MPP statis atau menu tambahan.
- AC-02: Putih, logo asli kecil, proporsi sesuai token, tanpa overlap/overflow horizontal.
- AC-03: Kategori dari fetch existing; loading/kosong/error dan icon fallback benar.
- AC-04: Informasi lengkap, konsultasi memakai data existing, login tidak diduplikasi sebagai card besar.
- AC-05: ID/EN/JP mengirim id/en/ja; active state bertahan setelah redirect.
- AC-06: Kondisi login/profil, halaman auth, avatar, dan tab baru sama dengan desktop.
- AC-07: Open/close/link/Escape/resize/fokus/background isolation/scroll tanpa state tertinggal.
- AC-08: Label panjang, Jepang, banyak kategori, zoom, landscape tetap dapat digunakan.
- AC-09: Desktop dan caller default tidak berubah; admin/bare shell tidak terkena.
- AC-10: Reuse partial, prefix/path user benar, tanpa dependency baru.
- AC-11: Bukti validasi template/build/QA tersedia; keterbatasan dilaporkan jujur.

## 8. Fase eksekusi

0. Verifikasi baseline, caller, scope, dan data.
1. Slice shell putih dan varian opt-in komponen.
2. Samakan menu, data, bahasa, dan kondisi akun.
3. Selesaikan interaksi, aksesibilitas, dan responsive edge case.
4. Validasi regresi dan serahkan bukti implementasi.

Detail phase, gate, QA, dan prompt AI ada di `docs/IMPLEMENTATION-responsive-mobile-navbar-user.md`.
Dokumen ini bukan bukti implementasi, mockup editable, atau pengujian runtime yang sudah selesai.
