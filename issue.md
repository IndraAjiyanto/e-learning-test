# UI/UX Template & Guidelines: Program Detail Page

## Tujuan
Dokumen ini menjadi panduan (template) bagi Junior Programmer atau asisten AI untuk mengimplementasikan atau mereplikasi desain UI/UX halaman "Detail Program/Kelas" (berbasis `Bdetail.hbs`) ke halaman atau program lain di dalam ekosistem web e-learning ini. Panduan ini berdasarkan hasil perombakan terbaru agar sinkron dengan standar desain Figma.

---

## 1. Spesifikasi Teknologi
- **Framework Utama:** NestJS (Handlebars / `.hbs` templates)
- **Styling:** Tailwind CSS (Vanilla)
- **Reaktivitas / State Management:** Alpine.js (`x-data`, `x-show`, `x-transition`)
- **Iconography:** FontAwesome (`<i class="fas fa-..."></i>`)

---

## 2. Struktur Layout Utama (Base Container)
Container utama halaman **wajib** menggunakan gradient warna *inline-style* yang telah disesuaikan dengan proporsi di Figma agar transisi warnanya tajam di area *header*.

```html
<!-- Gunakan style linear-gradient eksplisit untuk menghindari bug compiler Tailwind pada warna spesifik -->
<div class='min-h-screen text-slate-900 px-6 py-10 pt-28' style="background: linear-gradient(180deg, #FAFAFA 0%, #CEE5F6 15%, #FAFAFA 100%);">
  <div class='max-w-7xl mx-auto px-2 py-2'>
     <!-- Tombol Kembali -->
     <!-- Konten Grid -->
  </div>
</div>
```

---

## 3. Komponen Kunci (Key Components)

### A. Tombol Kembali (Back Button)
Harus diletakkan di atas grid konten utama dengan *styling* melingkar:
```html
<button onclick="history.back()" class="flex items-center justify-center w-10 h-10 rounded-full border border-[#0B1F3B]/30 hover:bg-[#0B1F3B]/10 transition mb-8 text-[#0B1F3B]">
  <i class="fas fa-arrow-left"></i>
</button>
```

### B. Badge "Batch & Tanggal Mulai"
Kartu harus berukuran lebar membentang ke samping (`w-full max-w-xl`), BUKAN `inline-flex`.
```html
<div class="flex items-center justify-center w-full max-w-xl border-2 border-slate-200 bg-white rounded-full px-14 py-2 shadow-sm mb-8">
  <span class="text-[#0B1F3B] font-bold text-xl tracking-wide">
    {{kelas.grup}} - Start Learning <span x-text="new Date('{{kelas.tanggal_mulai}}').toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})"></span>
  </span>
</div>
```

### C. Sistem Tab Navigasi & Alpine.js
Kontainer konten sebelah kiri (Lebar `lg:col-span-2`) di-wrap dengan state Alpine.js (`x-data`) untuk mengatur perpindahan tab secara dinamis tanpa *reload*.

**Menu Tab Wajib:**
1. `participants`
2. `what_you_learn`
3. `benefits`
4. `learning_flow`
5. `schedule_fees`
6. `gallery`
7. `faq`

**Format Navigasi Horizontal:**
```html
<div class='border-b border-slate-200 flex gap-6 text-base font-medium overflow-x-auto pb-2'>
  <!-- Ulangi button ini untuk setiap tab -->
  <button
    @click="switchTab('tab_name')"
    :class="activeTab === 'tab_name' ? 'border-b-2 border-[#0B1F3B] text-[#0B1F3B] font-semibold' : 'text-slate-500 hover:text-slate-700'"
    class='pb-3 transition-colors whitespace-nowrap'
  >
    Tab Name
  </button>
</div>
```

**Standar Struktur Konten Tab:**
Setiap isi *file partial* tab harus di-wrap dengan instruksi visibilitas & transisi Alpine:
```html
<div x-show="activeTab === 'tab_name'" x-transition>
  
  <!-- Bagian Loading Spinner (jika data didapat dari fetch API / backend) -->
  <div x-show="loading.tab_name" class="flex justify-center py-16">
    <i class="fas fa-spinner fa-spin text-4xl text-[#0B1F3B]"></i>
  </div>
  
  <!-- Isi Konten Data -->
  <div x-show="!loading.tab_name">
     <div class='bg-white rounded-xl p-6 shadow-lg ring-1 ring-gray-200'>
        <h3 class="font-montserrat text-3xl font-bold mb-6 ...">Judul Tab</h3>
        <!-- Elemen daftar/grid disini -->
     </div>
  </div>
</div>
```

### D. Sidebar Kanan (Price & Registration)
Kartu di sebelah kanan (kolom ke-3) harus bersifat `sticky` agar mengikuti layar saat pengguna men-*scroll* konten informasi yang panjang.
```html
<div class='lg:col-span-1'>
  <div class='sticky top-28 bg-slate-50 rounded-2xl p-6 shadow-xl ring-1 ring-slate-200/50 flex flex-col gap-6'>
    <!-- Section: Learning Date, Location, Capacity -->
    
    <!-- Section: Registration Button -->
    <a href="#" class='w-full text-center bg-[#0B1F3B] text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg'>
      Registration Now
    </a>
  </div>
</div>
```

---

## 4. Checklist Implementasi Tambahan & Error Handling
*(Catatan Penting Bagi Programmer yang Melanjutkan)*

- [ ] **Variabel State Alpine vs API Respon:** Jika Anda mengambil data tab secara *asynchronous* (`fetchTab`), perhatikan struktur JSON dari controller NestJS Anda. Pastikan variabel array di `x-for` Alpine sudah disesuaikan dengan key dari backend (Misal: respon JSON memiliki atribut `benefit_kelas`, maka *template loop* wajib menggunakan `benefits?.benefit_kelas || []`).
- [ ] **Fallback Data Kosong:** Saat menggunakan `<template x-for="item in ...">`, selalu berikan perlindungan OR Empty Array (`|| []`) agar *Alpine.js* tidak melempar pesan *error* saat *array* belum di-*load* atau kosong.
- [ ] **Formatting Tanggal Dinamis:** Manfaatkan *javascript native* di dalam Alpine (`x-text="new Date(...)"`) untuk merender tanggal *Unix* atau *ISO* dari *backend* Handlebars ke format tanggal *Human Readable*.
- [ ] **Lokalisasi Bahasa (i18n):** Pastikan pemanggilan kalimat dinamis menggunakan `x-html="getByLang(item.deskripsi, lang)"` dipertahankan apabila platform berjalan dalam fitur dwi-bahasa (ID/EN).
