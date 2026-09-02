# Pedoman Modular Komponen — E-Learning Platform

> **Tujuan:** Acuan tunggal bagi tim dev (slicing Figma, lanjut tab, bikin halaman baru, refactor) agar semua komponen konsisten, reusable, dan scalable.
> **Versi:** 2.1 (General, dirapikan) — 2026-09-01
> **Scope:** `src/views/partials/components/ui/**` + `src/views/*.hbs`
> **Referensi:** `mpp_pattern_analysis.md`, `src/common/helpers`, `src/main.ts` (handlebars engine)

---

## Daftar Isi

0. [Ringkasan Cepat](#0-ringkasan-cepat)
1. [Filosofi Modular](#1-filosofi-modular)
2. [Hirarki Level Komponen](#2-hirarki-level-komponen)
3. [Struktur Folder & Penamaan](#3-struktur-folder--penamaan)
4. [Kapan Buat Atomik (L1) vs Section (L2)?](#4-kapan-buat-atomik-l1-vs-section-l2)
5. [Anatomi Komponen (Template Wajib)](#5-anatomi-komponen-template-wajib)
6. [Helper, i18n & Data Flow](#6-helper-i18n--data-flow)
7. [Responsive & Styling (Figma → Tailwind)](#7-responsive--styling-figma--tailwind)
8. [Panduan Praktis: Cara Modular](#8-panduan-praktis-cara-modular)
9. [Checklist Slicing (Figma → Code)](#9-checklist-slicing-figma--code)
10. [Validasi & Quality Gate](#10-validasi--quality-gate)
11. [Anti-Pattern](#11-anti-pattern)
12. [Studi Kasus: Halaman About](#12-studi-kasus-halaman-about)
13. [Roadmap](#13-roadmap)
14. [Lampiran](#14-lampiran)

---

## 0. Ringkasan Cepat

**3 Larangan Keras — baca ini dulu:**

1. 🚫 Jangan taruh HTML bisnis di `src/views/*.hbs` (page). Page hanya boleh `{{> components/ui/sections/... }}` + Alpine router bila perlu.
2. 🚫 Jangan buat file flat di root `ui/` (mis. `ui/card_benefit.hbs`). Semua komponen baru wajib `ui/{jenis}/{nama}/index.hbs`.
3. 🚫 Jangan panggil helper langsung tanpa lewat `src/common/helpers` (1 pintu `hbsHelpers` di `main.ts`).

**Saya ingin... → lakukan ini:**

| Kebutuhan | Tindakan | Detail |
|---|---|---|
| Tambah komponen kecil yang dipakai ulang (card, button, input) | Buat `ui/{jenis}/{nama}/index.hbs` | [§8.1](#81-tambah-komponen-atomik-baru-l1) |
| Tambah blok vertikal baru di halaman (mis. section promo) | Buat `ui/sections/{nama}/index.hbs`, panggil dari page | [§8.2](#82-tambah-section-baru-l2) |
| Tambah tab baru di halaman yang sudah punya tab | Tambah section + `tab_btn` + Alpine `activeSection` | [§8.3](#83-tambah-tab-baru) |
| Tambah halaman baru dari nol | Buat `src/views/{nama}.hbs`, rangkai section, tambah route | [§8.4](#84-tambah-halaman-baru) |
| Cek apakah komponen sudah ada sebelum bikin baru | `Get-ChildItem ui -Recurse` | [§9](#9-checklist-slicing-figma--code) |
| Validasi sebelum PR | `npm run build` + quality gate | [§10](#10-validasi--quality-gate) |

---

## 1. Filosofi Modular

**Mengapa modular?**

- 1 komponen = 1 tanggung jawab, 1 file `index.hbs`, 1 sumber kebenaran.
- Page tidak berisi HTML bisnis — hanya merangkai section. Section tidak berisi style duplikat — hanya merangkai atomik.
- Tambah fitur = tambah folder, bukan edit file raksasa. Hapus fitur = hapus folder, tidak takut merusak page lain.

---

## 2. Hirarki Level Komponen

| Level | Nama | Folder | Contoh | Ciri |
|---|---|---|---|---|
| **L0** | Token & Helper | `src/common/helpers/`, `src/common/public/style.css` | `waHelpers`, `stringHelpers`, `t`, `getByLang`, `computeIcon`, `default` | Tidak render UI, hanya fungsi. Di-import via `hbsHelpers` di `main.ts`. |
| **L1** | Atomik | `ui/{jenis}/{nama}/index.hbs` | `ui/button/tab_btn`, `ui/card/card_value`, `ui/input/email`, `ui/text/sub_title`, `ui/accordion/faq` | Tidak tergantung section/page. Props eksplisit di header komentar. Tidak ada `{{#each}}` data BE besar — hanya render 1 item. |
| **L2** | Section | `ui/sections/{nama}/index.hbs` | `sections/hero`, `sections/benefit`, `sections/story` | Self-contained: punya `block sm:hidden` + `hidden sm:block`, loop `{{#each data}}` + fallback dummy, panggil atomik. Tidak panggil section lain. |
| **L2.5** | Sub-section | `ui/sections/{nama}/sub_components/` | `team/sub_components/team_grid` | Hanya bila 1 section >200 baris & punya ≥2 mode berbeda (contoh CEO vs grid). Jika dipakai di >1 section → promosikan ke L1. |
| **L3** | Layout | `src/views/layouts/main.hbs`, `partials/navbar.hbs`, `footer` | `layouts/main.hbs` | Wrapper global (`<html>`, Alpine, Tailwind, `{{{body}}}`). Tidak boleh import section. |
| **L4** | Page | `src/views/*.hbs` | `dashboard.hbs`, `about.hbs`, `free_program.hbs` | Hanya merangkai L2 (+ L1 bila butuh nav). Untuk tab, page pegang Alpine `activeSection` + `localStorage`. Data di-inject controller via `res.render(view, { data })`. |

**Aturan emas:** L4 boleh panggil L2 & L1 → L2 boleh panggil L1 → L1 **tidak boleh** panggil L2/L4. L0 boleh dipakai semua level.

---

## 3. Struktur Folder & Penamaan

### 3.1 Tree Standar

```
src/views/partials/components/ui/
 ├─ sections/{nama}/index.hbs          # L2, selalu index.hbs
 │   └─ sub_components/{nama}.hbs      # opsional, hanya untuk section kompleks
 ├─ button/{nama}/index.hbs            # L1
 ├─ card/{nama}/index.hbs              # L1
 │   └─ category/{free,paid,mpp,...}/index.hbs  # varian kategori
 ├─ input/{nama}/index.hbs             # L1
 ├─ text/{sub_title,description,link}/index.hbs
 ├─ accordion/{nama}/index.hbs
 ├─ alert/index.hbs, auth/index.hbs, icon/{logo}/index.hbs
 └─ ... (tambah jenis baru bila perlu: badge, modal, table)

src/views/
 ├─ dashboard.hbs, about.hbs, free_program.hbs, ...  # L4
 └─ layouts/main.hbs                                 # L3
```

### 3.2 Konvensi Penamaan

| Aspek | Aturan | Contoh |
|---|---|---|
| Folder & file | `snake_case` konsisten (existing codebase pakai ini, jangan campur `kebab-case`) | `card_value`, `tab_btn`, `card_benefit` |
| File utama | Selalu `index.hbs`, jangan file flat | `{{> components/ui/card/card_value/index }}` — bukan `card_value.hbs` |
| Props di Handlebars | `camelCase` | `iconName`, `fallbackIcon`, `desktopAlign` |
| Field data BE | `kebab-case`, biarkan apa adanya | `nameClassesType` |
| Nama section | = nama fitur di Figma | Figma "Hero Section" → folder `hero` |
| Nama atomik | `jenis_nama`, hindari penomoran | `card_value`, `card_team`, `button/consultation` — bukan `card1`, `card2` |

---

## 4. Kapan Buat Atomik (L1) vs Section (L2)?

**Buat L1 (atomik) jika:**
- Dipakai di ≥2 section/page (contoh `card_value` dipakai di `story` & `values`).
- Tidak punya loop `{{#each}}` data BE besar — hanya render 1 entitas.
- Bisa dideskripsikan dalam 1 kalimat, mis. *"Tombol tab dengan icon & text yang aktif bila `activeSection===section`."*

**Buat L2 (section) jika:**
- Dipakai sebagai blok vertikal di page (hero, benefit, gallery).
- Punya layout mobile vs desktop (`block sm:hidden` / `hidden sm:block`) + loop + fallback + header.
- Mengandung ≥2 atomik berbeda (contoh `benefit` = `section_header` + loop `card_benefit`).

**Decision tree:**

```
Butuh komponen baru?
  ├─ Dipakai di ≥2 tempat?
  │     → L1 atomik: ui/{jenis}/{nama}
  ├─ Hanya di 1 page, tapi >100 baris & punya 2 variant mobile/desktop?
  │     → L2 section: ui/sections/{nama}
  └─ Hanya dipakai di 1 section, <50 baris, tidak reusable?
        → jangan dipecah, tetap di section/index.hbs
```

---

## 5. Anatomi Komponen (Template Wajib)

### 5.1 Header Komentar (wajib di baris 1–10)

```hbs
{{!--
  Komponen: Card Value (About)
  Lokasi: src/views/partials/components/ui/card/card_value/index.hbs
  Level: L1 Atomik

  Props:
  - title       : string|HTML (wajib, support getByLang)
  - description : string|HTML (wajib)
  - icon        : string (opsional, fallback ke fallbackIcon)
  - iconBase    : string (base path, contoh "/public/image/about/values/")
  - iconName    : string (nama file, contoh this.icon)
  - fallbackIcon: string (default "/public/image/about/values/adaptability.svg")
  - bgClass     : string (default "bg-[#E0F1F9]/65")
  - showDivider : boolean
--}}
```

### 5.2 Aturan Desain Props

- **Wajib vs opsional harus jelas.** Prop wajib tanpa default akan error bila tidak di-passing — beri fallback lewat helper `default`: `{{default title "Untitled"}}`.
- **Multibahasa:** selalu `getByLang title lang` bila data BE berbentuk `{en, id, ja}`. Sertakan `lang` di props atomik.
- **Fallback aset:** `onerror="this.src='{{default fallbackIcon ...}}'"` untuk image; `{{default profile "/public/image/about/orang.png"}}` untuk avatar.
- **Boolean flag:** gunakan boolean Handlebars asli (`desktop=true`), bukan string `"true"`. Contoh flag umum: `desktop`, `isMobile`, `showDivider`.
- **Styling via props:** `bgClass`, `iconBgClass`, `wrapperClass`, `dividerClass` — agar reusable tanpa perlu edit CSS.

### 5.3 Contoh Atomik Minimal

```hbs
{{!-- ui/button/tab_btn/index.hbs --}}
<button
  @click="toggleActiveSection('{{section}}');"
  :class="activeSection === '{{section}}' ? 'bg-[#003060] text-white' : 'bg-white text-[#0B1F3B]'"
  class="px-4 py-2.5 rounded-[12px] flex items-center gap-2 font-montserrat"
>
  <i class="{{icon}}"></i><span>{{text}}</span>
</button>
```

### 5.4 Contoh Section Minimal

```hbs
{{!-- ui/sections/promo/index.hbs --}}
<div class="block sm:hidden"> {{!-- mobile --}}
  {{> components/ui/text/sub_title/index title=(t 'test.promo.title') }}
  {{#each promos}}
    {{> components/ui/card/card_value/index title=(getByLang title ../lang) description=(getByLang description ../lang) lang=../lang }}
  {{else}}
    {{> components/ui/card/card_value/index title="Fallback" description="..." }}
  {{/each}}
</div>
<div class="hidden sm:block"> {{!-- desktop, sama tapi grid --}}
  ...
</div>
```

---

## 6. Helper, i18n & Data Flow

### 6.1 Helper Global (1 Pintu)

Semua helper didaftarkan di `src/common/helpers/index.ts` → digabung sebagai `hbsHelpers` → dipasang di `main.ts` lewat opsi `helpers: hbsHelpers`. **Jangan** memanggil `Handlebars.registerHelper` secara manual di tempat lain.

Helper yang tersedia: `t 'key'` (i18n), `getByLang obj lang`, `computeIcon icon`, `default value fallback`, `nl2br`, `waLink phone`, `truncate`, `json`, `eq`.

### 6.2 i18n

- Key selalu berformat `test.{page}.{section}.{field}`, contoh `test.about.team.title`.
- File terjemahan ada di `src/common/i18n/` (en/id/ja).
- Di atomik, jangan hardcode teks — selalu pakai `text=(t 'test...')` atau `title=(getByLang title lang)`.

### 6.3 Data BE → FE

- **Controller:** `return res.render('about', { paragraphs, commitment, value, team, teamLead, background, experience, visions, social, lang })`
- **Middleware:** `res.locals.lang = req.cookies.lang || 'en'`
- **Di template:** `{{#each commitment}}` + `{{else}}` fallback dummy, agar tampilan tidak kosong bila data BE belum ada.

---

## 7. Responsive & Styling (Figma → Tailwind)

| Aspek | Aturan |
|---|---|
| Breakpoint | Tunggal, `sm` (640px). Mobile = `block sm:hidden`, Desktop = `hidden sm:block`. Jangan pakai `md:` untuk show/hide utama. |
| Warna token | `bg-[#003060]` navy, `bg-[#6EB6E5]` blue, `bg-[#E0F1F9]/65 backdrop-blur-[6.6px]` card, `text-[#0B1F3B]` heading. |
| Font | `font-montserrat` (heading), `font-sans` (body), `font-inter` (tab desktop). |
| Radius & shadow | `rounded-[12px]` (desktop), `rounded-[16px]`/`[20px]` (mobile), `shadow-[0px_0px_6px_0px_rgba(0,0,0,0.5)]`. |
| Image | `object-cover`, `onerror` fallback, avatar `w-16 h-16 rounded-full border-[3px] translate-y-[8%]`. |

---

## 8. Panduan Praktis: Cara Modular

### 8.1 Tambah Komponen Atomik Baru (L1)

1. Cek dulu apakah sudah ada komponen serupa (lihat [§9](#9-checklist-slicing-figma--code) langkah 2) — jangan duplikat.
2. Tentukan `jenis` (button/card/input/text/dst) dan `nama` sesuai konvensi §3.2.
3. Buat folder `ui/{jenis}/{nama}/index.hbs`.
4. Isi header komentar wajib (§5.1) lengkap dengan daftar props.
5. Gunakan helper via `hbsHelpers` saja (§6.1), jangan hardcode teks (§6.2).
6. Uji render dengan data dummy di 1 section dulu sebelum dipakai di tempat lain.

### 8.2 Tambah Section Baru (L2)

Contoh: menambah section `promo` di `dashboard`.

```powershell
New-Item -ItemType Directory -Path "src/views/partials/components/ui/sections/promo" -Force
Copy-Item "src/views/partials/components/ui/sections/mission/index.hbs" "src/views/partials/components/ui/sections/promo/index.hbs"
# edit promo/index.hbs: ganti section_header t 'test.home.promo.title' + loop promos → card/card_value
```

Lalu di `dashboard.hbs`, tambahkan `{{> components/ui/sections/promo/index}}` sesuai urutan vertikal yang diinginkan.

### 8.3 Tambah Tab Baru

Contoh: menambah tab `career` di halaman `about`.

1. Di `about.hbs`:
   - Tambah `case 'career': return '/public/image/about/bgCareer.png'` di fungsi `bgImage()`.
   - Tambah tombol tab di kedua nav (mobile & desktop): `{{> components/ui/button/tab_btn section="career" icon="fas fa-briefcase" text=(t 'test.about.tabAbout.career') }}`.
   - Tambah `x-show="activeSection==='career'"` yang membungkus `{{> components/ui/sections/career/index}}`.
2. Buat `ui/sections/career/index.hbs` baru, lalu inject data `career[]` dari controller.
3. `localStorage` untuk tab aktif sudah otomatis persist — tidak perlu setup tambahan.

### 8.4 Tambah Halaman Baru

Contoh: membuat halaman baru `career.hbs`.

1. Buat `src/views/career.hbs`, mulai dengan `{{> components/ui/sections/hero/index }}` lalu tambahkan section-section custom lainnya.
2. Daftarkan route di `app.module`/controller, inject data yang dibutuhkan + `footerData` (middleware sudah menyediakan ini secara global).
3. Jalankan `npm run build:css:prod` — harus selesai dalam `Done 3-5s` tanpa error.

---

## 9. Checklist Slicing (Figma → Code)

1. **Identifikasi:** Figma frame = section (`hero`, `benefit`). Card di dalamnya = atomik (`card_benefit`).
2. **Cek existing:** jalankan `Get-ChildItem ui -Recurse` — kalau `card_value` sudah ada, reuse, jangan bikin `card_value2`.
3. **Buat section:** `New-Item ui/sections/nama -Force` → copy `mission/index.hbs` (skeleton paling simple) → ganti key `t` di `section_header`.
4. **Pilih atomik yang sesuai:** butuh list → `list_item`, card → `card/card_value`, tombol → `button/consultation`, input → `input/email`.
5. **Lengkapi props:** tambah `lang=../lang` bila multilang, `desktop=true` bila butuh variant, `fallbackIcon` bila icon berasal dari BE.
6. **Responsive:** duplikat mobile & desktop di 1 file `index.hbs` yang sama — jangan pisah jadi `mobile.hbs`/`desktop.hbs`.
7. **Fallback:** selalu sediakan `{{else}}` dengan 1–2 dummy card agar preview tidak kosong saat data BE belum ada.
8. **Validasi:** `npm run build` → harus `Done` tanpa error `Missing helper/partial`.

---

## 10. Validasi & Quality Gate

Wajib dijalankan sebelum membuka PR:

```powershell
npm run build                    # harus Done, tidak ada @variants error
Select-String -Path "src/views/**/*.hbs" -Pattern "{{> components/ui" | Measure-Object  # >=50 hit, 0 miss
npm run start:dev                # cek localhost:3000/dashboard, /about — no 500, no Missing helper: concat
Get-ChildItem src/views/partials/components/ui -Recurse -File -Filter "*.hbs" | Sort-Object FullName
```

**Definition of Done** untuk 1 section:
- 1 folder `index.hbs`
- Header props lengkap
- Fallback data tersedia
- Mobile & desktop tersedia dalam 1 file
- Memanggil atomik via `components/ui/{jenis}` (bukan hardcode HTML)
- Build hijau (tanpa error)

---

## 11. Anti-Pattern

Jangan lakukan hal-hal berikut:

- ❌ `src/views/dashboard.hbs` berisi `<div class="hero">... 100 baris ...</div>` — harus dipecah jadi `sections/hero`.
- ❌ `ui/card_benefit.hbs` flat tanpa folder — harus `ui/card/card_benefit/index.hbs`.
- ❌ `{{> dashboard/hero_section }}` (path non-ui) — harus `{{> components/ui/sections/hero/index }}`.
- ❌ Hardcode teks seperti `"Bahasa Indonesia"` langsung di template — harus `(t 'test.xxx')` + `getByLang`.
- ❌ Logic `if (desktop) { ... }` di JS — pakai prop `desktop=true` + `{{#if desktop}}` di HBS.
- ❌ Duplikat komponen jadi `card_value2` — reuse komponen existing via props `bgClass`, `iconBase`, dll.

---

## 12. Studi Kasus: Halaman About

Alur relasi antar level pada halaman About (ilustrasi pola umum, bukan aturan khusus halaman ini):

```
about.hbs (L4)
  → sections/story | mission | values | team (L2)
      → card/card_value | card_team (L1)
      → button/tab_btn (L1)
```

Pola yang sama berlaku untuk semua page lain di project ini — L4 merangkai L2, L2 merangkai L1.

---

## 13. Roadmap

| Prioritas | Item | Status |
|---|---|---|
| P0 | Fix mismatch `team` `iconUrl` → `iconSrc` (tidak sesuai header `btn_action`) | TODO |
| P0 | Migrasi legacy flat (`section_header`, `btn_action`, `card_alumni`, `card_gallery`, `tab_filter_btn`) → `ui/text\|button\|card/*` | TODO |
| P1 | `mission` raw cards → `card_value` + `list_item` | TODO |
| P1 | Aktifkan atomik `category` (`ui/card/category/*`) bila tab free/paid/mpp dilanjutkan | Pending |
| P2 | Pecah `team_leader` (257 baris) → `card/card_leader` + `accordion/education` | Backlog |
| P2 | Storybook / Handlebars preview untuk `docs/modular.md` | Backlog |

---

## 14. Lampiran

**Verifikasi build:**

```
> npm run build
  tailwindcss → Done 3930ms (daisyUI 6 themes)
  esbuild alpine → main.js 48.3kb
  esbuild editor → editor.bundle.js 366.7kb
```

**Tree ringkas `ui/`:**

```
ui/
 ├─ sections/{hero,benefit,program,alumni,partner,gallery,faq,story,mission,values,team}
 ├─ button/{consultation,tab_btn,submit}
 ├─ card/{card_benefit,card_program,card_value,card_team,category/*}
 ├─ accordion/faq, input/*, text/*, alert, auth, icon/logo_kesatria
 └─ (legacy flat akan dimigrasi — lihat §13 Roadmap)
```

**Referensi file absolut:**

- `src/views/dashboard.hbs`, `src/views/about.hbs`
- `src/views/partials/components/ui/sections/*/index.hbs`
- `src/views/partials/components/ui/{button|card|accordion|input|text}/*/index.hbs`
- `mpp_pattern_analysis.md`

---

*Pedoman general — update setiap kali menambah jenis komponen baru. Untuk detail line-accurate per section, lihat git history versi 1.0.*
