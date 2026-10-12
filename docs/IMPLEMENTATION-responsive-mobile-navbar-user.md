# Implementation Handoff - Responsive Mobile Navbar User

Tanggal: 7 Oktober 2026. Status: rencana eksekusi, **belum diterapkan**.
PRD: `docs/PRD-responsive-mobile-navbar-user.md`.
Task: `90182814122/z8pbk8yh9v` - Responsive mobile navbar user.

## 1. Baca sebelum mengubah kode

1. Baca PRD, instruksi workspace/AGENTS, dan perubahan lokal pengguna.
2. Verifikasi baseline `963a9aa0`; line number/caller dapat berubah.
3. Baca `src/views/partials/navbar.hbs` utuh: state, desktop, actions, drawer.
4. Baca partial `nav/lang_switcher`, `nav/dropdown_row`, `card/category/dynamic` dan seluruh caller-nya.
5. Baca `src/views/layouts/main.hbs`, `src/main.ts`, `tailwind.config.js`, `src/common/public/js/alpine.js`.
6. Baca `src/translation/translation.controller.ts`, endpoint kategori di `src/dashboard/dashboard.controller.ts`, `src/i18n/{id,en,ja}/test.json`.

Target hanya drawer navbar publik. Jangan menafsirkan user sebagai permintaan redesign dashboard sidebar.

## 2. Daftar perubahan yang diizinkan

| File | Tujuan |
| --- | --- |
| `src/views/partials/navbar.hbs` | Ganti blok drawer, tambah handler/atribut mobile seperlunya; desktop markup dipertahankan. |
| `src/views/partials/components/ui/user/user_mobile_nav_drawer/index.hbs` | Baru: shell dan komposisi drawer. |
| `src/views/partials/components/ui/nav/lang_switcher/index.hbs` | Varian opt-in `userMobile=true`, tanpa mengubah default app bar. |
| `src/views/partials/components/ui/nav/dropdown_row/index.hbs` | Varian opt-in `userMobile=true`, default desktop tetap. |
| `src/views/partials/components/ui/card/category/dynamic/index.hbs` | Varian opt-in `userMobile=true`, kartu lain tetap. |
| `src/i18n/id/test.json`, `src/i18n/en/test.json`, `src/i18n/ja/test.json` | Hanya key baru untuk status/aksesibilitas yang diperlukan. |
| `e2e/user-mobile-navbar-*.yaml` | Flow UI bila environment mendukung; cek suite dahulu. |

JS/style sumber hanya bila diperlukan, jelaskan alasannya. Jangan edit bundle/CSS generated manual. Build dapat mengubah artefak: review diff mengikuti kebijakan repo dan jangan menghapus perubahan pengguna.

## 3. Kontrak integrasi

- Navbar tetap pemilik state. Reuse `open`, `classOpen`, `infoOpen`, `lang`, `active`, `category`, helper active, `getByLang`, `truncate`.
- Tambah state minimum: status fetch, pemicu fokus, overflow/background sebelum open.
- `toggleMenu()` boleh mendelegasikan open/close eksplisit. Overlay/Escape/resize memanggil close, bukan toggle yang bisa membuka ulang.
- `setActive(path)` mempertahankan kontrak desktop dan menjalankan cleanup drawer yang sama.
- Fetch tetap sekali; validasi `res.ok` dan bentuk array. Kegagalan tidak boleh memutus menu utama.
- Jangan mengubah helper active MPP global hanya untuk menghapus item drawer.

Contoh kontrak pemanggilan (belum diimplementasikan):

```hbs
{{> components/ui/user/user_mobile_nav_drawer/index }}
{{> components/ui/nav/lang_switcher/index userMobile=true }}
{{> components/ui/card/category/dynamic/index userMobile=true }}
```

- Pemanggilan drawer berada di scope Alpine navbar; dua contoh berikutnya berada di dalam drawer, bukan UI duplikat di luar.
- Partial kategori berada di template x-for dengan variabel `kat`, key `kat.id`, dan output satu root element.
- Row Informasi memakai `components/ui/nav/dropdown_row/index` dengan `userMobile=true` serta props existing `href`, `icon`, `title`, `desc`.
- Context Handlebars `user`, `isAuthenticated`, `isAuthPage`, `lang`, `social` diwarisi induk.
- Prioritas branch: `if userMobile`, lalu branch legacy/default. Jangan men-shadow state induk.
- Trigger memakai type button; pilihan bahasa type submit. Hindari kelas active/base yang bertabrakan.

## 4. Fase implementasi dan gerbang kelulusan

### Phase 0 - Verifikasi baseline dan scope

**Pekerjaan**

- Cek git status/instruksi folder dan cocokkan matriks PRD dengan desktop terkini.
- Cari semua caller partial, khususnya language switcher pada app bar user.
- Pastikan logo asli ada; HTML memakai URL publik, bukan path filesystem.
- Identifikasi environment kategori, social, tamu, akun verified, dan auth page; jangan meminta password di chat.
- Cek suite UI existing. Saat dokumen dibuat, `e2e_list_flows` melaporkan belum ada direktori `e2e/`.

**Output/gate:** daftar file terarah, kontrak data dan reuse teridentifikasi; konflik kategori MPP dilaporkan, tidak ditebak. Belum mengubah route/schema/desain desktop.

### Phase 1 - Slice shell dan varian visual

**Pekerjaan**

- Buat partial drawer user dan hubungkan menggantikan blok mobile lama; hanya satu drawer/overlay.
- Terapkan putih 288 px, logo 104 px dengan rasio asli/max-height 28 px, header/konten scroll/footer safe-area.
- Tambahkan varian `userMobile` pada tiga partial existing, pertahankan default.
- Terapkan kolom ikon-teks-chevron, `min-w-0`, min-height 44 px, wrap, focus ring, warna aktif.
- Pertahankan context Alpine, endpoint, dan kondisi render; jangan memakai kategori mock permanen.

**Output/gate:** template valid, tidak ada partial missing, logo tidak terdistorsi, header/menu/footer tidak overlap pada 320 dan 390 px. Belum diklaim memenuhi seluruh AC.

### Phase 2 - Paritas menu, data, bahasa, akun

**Pekerjaan**

- Urutan Beranda -> Kelas -> Corporate Training -> Informasi.
- Hapus hanya pemanggilan MPP statis, bukan file/route/terjemahan.
- Kategori sesuai API, icon fallback, deskripsi/fallback ID, loading/kosong/error.
- Empat submenu Informasi memakai row varian baru dan URL persis PRD.
- Konsultasi ringkas memakai key dan kontak desktop, bukan hardcode.
- ID/EN/JP mengirim `id/en/ja`; pilihan aktif dari server.
- Masuk/profil mengikuti matriks auth, avatar fallback, dan aturan tab baru.

**Output/gate:** AC-01, AC-03, AC-04, AC-05, AC-06 dengan bukti. Data/environment tidak tersedia ditandai belum diuji.

### Phase 3 - Interaksi dan responsive edge case

**Pekerjaan**

- Satukan cleanup close: X, overlay, Escape, link, resize.
- Implementasikan fokus awal/trap dinamis/restore, isolasi background, nama dialog, atribut accordion.
- Modal logout di `components/ui/user/modal/logout_confirm/index.hbs` hanya referensi. Jangan menyalin trap dua tombolnya karena drawer punya elemen dinamis dan submenu tersembunyi.
- Pulihkan overflow asli; jangan meninggalkan body terkunci setelah resize atau profil tab baru.
- Uji 100dvh, safe-area, reduced motion, label EN/JP, layar pendek/zoom.
- Uji auth header setelah scroll/backdrop blur. Jika perlu teleport/layer lain, pastikan state/context Alpine tetap bekerja dan desktop tidak berubah.
- Pertahankan dua accordion independen; keduanya terbuka tidak membuat footer menutupi menu.

**Output/gate:** AC-02, AC-07, AC-08; tidak ada error JS baru, fokus/scroll tidak tertinggal.

### Phase 4 - Validasi, regresi, handoff

**Pekerjaan**

- Parse/compile Handlebars memakai dependency existing. Ini tidak membuktikan partial/context runtime benar, jadi lakukan render smoke pada app juga.
- Jalankan `npm run build:css:prod`; `npm run build:script` bila JS sumber berubah. Build penuh bila environment memungkinkan.
- Hindari `npm run lint`/format global untuk perubahan HBS: lint existing menarget TypeScript dan melakukan auto-fix.
- Panggil diagnostics pada source berubah; jika HBS tidak punya language server, nyatakan batasan dan pakai compile/render validation.
- Jalankan matriks QA dan regresi caller default. Jangan memakai runner browser lain hanya karena dependency-nya tercantum di package.json.
- Serahkan diff, hasil perintah, screenshot, status tiap AC, dan risiko tersisa.

**Output/gate:** AC-09, AC-10, AC-11 dan seluruh gate sebelumnya. Jangan klaim selesai tanpa validasi runtime; jangan commit/merge tanpa permintaan.

## 5. Matriks QA minimum

| Area | Kasus | Ekspektasi |
| --- | --- | --- |
| Responsive | 320x568, 360x800, 390x844, 768x1024, 1023x768 | Muat, tanpa scroll horizontal/overlap |
| Breakpoint | 1023 -> 1024 -> 1023; desktop 1280x800 dan 1440x900 | Cleanup saat desktop; navbar/dropdown desktop tidak berubah |
| Tinggi pendek | Landscape 844x390, zoom 200% | Semua kontrol tetap terjangkau |
| Menu | Masing-masing accordion dan keduanya terbuka | Isi benar, chevron/aria sinkron, scroll aman |
| Active route | Beranda, kategori, Corporate Training, seluruh Informasi, profil | Parent/link tepat; back/forward memperbarui state |
| Close | X, overlay, Escape, link internal, profil tab baru | Reset accordion, scroll pulih, fokus aman |
| Keyboard | Tab/Shift+Tab, Enter/Space, Escape | Fokus hanya elemen terlihat dalam drawer |
| Data | Banyak kategori, nama panjang, ikon kosong/rusak, loading/kosong/gagal | Fallback benar, tanpa kategori fiktif |
| Bahasa | ID -> EN -> JP -> ID | Payload id/en/ja, redirect, active state konsisten |
| Akun | Tamu, unverified, verified user, role lain bila relevan | Kondisi dan target sama desktop; username panjang aman |
| Auth page | isAuthPage, termasuk setelah scroll | Tanpa login duplikat, drawer setinggi viewport |
| Shared partial | Desktop, app bar user, kartu kategori non-mobile | Default visual/perilaku tetap |
| Shell | Admin dan bare shell | Tidak muncul drawer baru |

### UI testing di Sokudo

- `e2e_list_flows` dahulu, lalu `e2e_validate` dan `e2e_run`. Tidak memasang/menjalankan Playwright, Puppeteer, Cypress, Selenium untuk tugas ini.
- Kandidat flow: `e2e/user-mobile-navbar-navigation.yaml`, `e2e/user-mobile-navbar-language.yaml`, `e2e/user-mobile-navbar-auth.yaml`. Ini rencana, bukan flow yang sudah dibuat/diuji.
- Dialek: dokumen header (`url` wajib; `name`, `tags`, `env`, `clearState` opsional), separator `---`, lalu sequence langkah. Gunakan langkah yang lolos validator, seperti `launchApp`, `openLink`, `tapOn`, `inputText`, `assertVisible`, `takeScreenshot`, `back`.
- Jangan mengarang step resize/snapshot atau header viewport. Kasus ukuran layar/keyboard/data error yang tidak didukung runner diuji manual, dengan kondisi dicatat.
- Selector harus unik dan scope drawer: desktop tersembunyi mungkin memiliki label sama. Tap lulus belum membuktikan kontrol yang tepat dipilih.
- Bukti minimum: menu utama, Kelas, Informasi, profil, JP, layar kecil, regresi desktop. Tidak ada klaim pass tanpa hasil runner/catatan manual.
- Jika AI lain tidak memiliki tool Sokudo, lakukan QA manual dan tandai automation belum dijalankan; jangan mengganti framework.

## 6. Prompt siap untuk model AI lain

```text
Implementasikan task Responsive mobile navbar user: selaraskan isi navbar
mobile dengan desktop dalam desain drawer putih dan proporsional.

Baca terlebih dahulu:
- docs/PRD-responsive-mobile-navbar-user.md
- docs/IMPLEMENTATION-responsive-mobile-navbar-user.md
- src/views/partials/navbar.hbs dan partial shared yang disebut dokumen.

Kerjakan Phase 0 sampai Phase 4 berurutan. Scope hanya drawer navbar publik/user,
bukan sidebar dashboard/admin. Desktop tidak boleh berubah. Reuse lang_switcher,
dropdown_row, category/dynamic dengan varian opt-in userMobile=true.
Partial baru: components/ui/user/user_mobile_nav_drawer/index.hbs.
Partial tambahan hanya di components/ui/user/ dengan prefix user_mobile_nav_.
Jangan menduplikasi komponen atau menambah dependency.

Gunakan /public/image/logo_baru.png, drawer 288 px, logo target 104 px dengan
rasio asli, menu minimum 44 px, serta konten scroll terpisah dari header/footer.
Beranda, kategori Kelas dinamis, Corporate Training, Informasi lengkap,
konsultasi desktop, bahasa, Masuk/profil sesuai kondisi existing.
Hapus hanya item MPP statis di drawer. ID/EN/JP POST /translation dengan id/en/ja.
Jangan mengubah backend, route, data kategori, aturan auth, caller default.

Pertahankan satu state/fetch navbar. Selesaikan close cleanup, resize 1024 px,
active route, focus trap/restore, background isolation, scroll lock. Teks panjang,
bahasa Jepang, layar pendek, dua accordion terbuka tidak boleh overlap.
Ikuti seluruh AC dan QA. Gunakan test/build existing yang relevan. Di Sokudo,
UI testing hanya e2e tools/YAML. Jika environment/tool tidak ada, laporkan yang
belum diuji. Jangan commit/merge otomatis.

Laporan akhir: file berubah, hasil validasi, bukti visual, status tiap acceptance
criterion, dan keterbatasan tersisa. Jangan klaim pass tanpa bukti.
```

## 7. Format laporan implementer

- Ringkasan dan fase selesai.
- File berubah/dibuat serta alasan varian/komponen baru.
- Tabel AC-01 sampai AC-11: lulus/gagal/belum diuji, dengan bukti.
- Perintah build/diagnostics dan hasil sebenarnya, termasuk kegagalan environment.
- Screenshot mobile/desktop dan hasil runner jika tersedia.
- Risiko tersisa atau keputusan pengguna yang diperlukan.

Saat handoff ditulis, belum ada partial/varian UI baru, flow YAML, perubahan backend, atau pengujian runtime yang dieksekusi.
