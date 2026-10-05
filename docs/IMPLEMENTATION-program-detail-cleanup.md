# Implementation Plan - Merapikan Halaman Detail Program (Role Admin & Super Admin)

## 1. Berkas & Lokasi Perubahan

Perubahan dilakukan pada 3 berkas template tampilan:

1. **`src/views/super_admin/course/detail.hbs`**
   - **Card Basic Information (L51–54)**: Sembunyikan field `Time Start` dan `Time End` jika `course.checkPaid` bernilai true.
   - **Card Form & Information (L77–80)**: Tambahkan field `Price` dan `Promo` di bawah condition `{{#if course.checkPaid}}`.
2. **`src/views/partials/components/ui/admin/detail/basic_info/index.hbs`**
   - **Card Basic Information (L39–40)**: Sembunyikan field `Time Start` dan `Time End` jika `course.checkPaid` bernilai true.
3. **`src/views/partials/components/ui/admin/detail/form_info/index.hbs`**
   - **Card Form & Information (L28–32)**: Tambahkan field `Price` dan `Promo` di bawah condition `{{#if course.checkPaid}}`.

---

## 2. Rincian Perubahan Kode

### A. `src/views/super_admin/course/detail.hbs`

#### 1. Basic Information (L51-54):
```hbs
{{!-- SEBELUM --}}
{{> components/ui/super_admin/detail/field/index label='Time Start' value=(formatTime course.time_start) }}
{{> components/ui/super_admin/detail/field/index label='Time End' value=(formatTime course.time_end) }}

{{!-- SESUDAH --}}
{{#unless course.checkPaid}}
{{> components/ui/super_admin/detail/field/index label='Time Start' value=(formatTime course.time_start) }}
{{> components/ui/super_admin/detail/field/index label='Time End' value=(formatTime course.time_end) }}
{{/unless}}
```

#### 2. Form & Information (L77-80):
```hbs
{{!-- SEBELUM --}}
{{#> components/ui/super_admin/detail/field/index label='Type'}}
  <p class='font-inter text-sm font-medium leading-[22.75px] text-[#737373]'>{{#if course.checkPaid}}Paid{{else}}Free{{/if}}</p>
{{/components/ui/super_admin/detail/field/index}}

{{!-- SESUDAH --}}
{{#> components/ui/super_admin/detail/field/index label='Type'}}
  <p class='font-inter text-sm font-medium leading-[22.75px] text-[#737373]'>{{#if course.checkPaid}}Paid{{else}}Free{{/if}}</p>
{{/components/ui/super_admin/detail/field/index}}

{{#if course.checkPaid}}
{{> components/ui/super_admin/detail/field/index label='Price' value=(formatRupiah course.price) }}
{{> components/ui/super_admin/detail/field/index label='Promo' value=(formatRupiah course.promo) }}
{{/if}}
```

---

### B. `src/views/partials/components/ui/admin/detail/basic_info/index.hbs`

#### Basic Information (L39-40):
```hbs
{{!-- SEBELUM --}}
<div class='w-full flex flex-col gap-[8px]'><span class='text-[14px]/[normal] text-[#171717] font-inter font-semibold'>Time Start</span><span class='text-[14px]/[normal] text-[#737373] font-inter font-medium'>{{#if course.time_start}}{{formatTime course.time_start}}{{else}}Not set{{/if}}</span></div>
<div class='w-full flex flex-col gap-[8px]'><span class='text-[14px]/[normal] text-[#171717] font-inter font-semibold'>Time End</span><span class='text-[14px]/[normal] text-[#737373] font-inter font-medium'>{{#if course.time_end}}{{formatTime course.time_end}}{{else}}Not set{{/if}}</span></div>

{{!-- SESUDAH --}}
{{#unless course.checkPaid}}
<div class='w-full flex flex-col gap-[8px]'><span class='text-[14px]/[normal] text-[#171717] font-inter font-semibold'>Time Start</span><span class='text-[14px]/[normal] text-[#737373] font-inter font-medium'>{{#if course.time_start}}{{formatTime course.time_start}}{{else}}Not set{{/if}}</span></div>
<div class='w-full flex flex-col gap-[8px]'><span class='text-[14px]/[normal] text-[#171717] font-inter font-semibold'>Time End</span><span class='text-[14px]/[normal] text-[#737373] font-inter font-medium'>{{#if course.time_end}}{{formatTime course.time_end}}{{else}}Not set{{/if}}</span></div>
{{/unless}}
```

---

### C. `src/views/partials/components/ui/admin/detail/form_info/index.hbs`

#### Form & Information (L28-32):
```hbs
{{!-- SEBELUM --}}
<div class='flex flex-row gap-[12px] justify-start items-center'>
  <span class='text-[14px]/[normal] text-[#171717] font-inter font-semibold'>Type:</span>
  <span class='text-[14px]/[normal] text-[#737373] font-inter font-medium'>{{#if course.checkPaid}}Paid{{else}}Free{{/if}}</span>
</div>

{{!-- SESUDAH --}}
<div class='flex flex-row gap-[12px] justify-start items-center'>
  <span class='text-[14px]/[normal] text-[#171717] font-inter font-semibold'>Type:</span>
  <span class='text-[14px]/[normal] text-[#737373] font-inter font-medium'>{{#if course.checkPaid}}Paid{{else}}Free{{/if}}</span>
</div>

{{#if course.checkPaid}}
<div class='w-full flex flex-col gap-[8px]'>
  <span class='text-[14px]/[normal] text-[#171717] font-inter font-semibold'>Price</span>
  <span class='text-[14px]/[normal] text-[#737373] font-inter font-medium'>{{formatRupiah course.price}}</span>
</div>
<div class='w-full flex flex-col gap-[8px]'>
  <span class='text-[14px]/[normal] text-[#171717] font-inter font-semibold'>Promo</span>
  <span class='text-[14px]/[normal] text-[#737373] font-inter font-medium'>{{formatRupiah course.promo}}</span>
</div>
{{/if}}
```

---

## 3. Langkah Pengujian & Verifikasi

1. **Pengujian Tampilan Super Admin**: Buka `/program/detail/program/admin/:courseId` dengan akun Super Admin untuk program Paid dan Free.
   - Pada Paid: Pastikan `Time Start` & `Time End` tidak muncul di Basic Information, dan `Price` serta `Promo` tampil di Form & Information dengan format Rupiah.
   - Pada Free: Pastikan `Time Start` & `Time End` muncul, `Price` & `Promo` tidak muncul, serta `target` tidak ada.
2. **Pengujian Tampilan Admin**: Buka URL yang sama dengan akun Admin untuk memastikan partial Admin merespons persis sama.
3. **Kompilasi & Build**: Jalankan `npm run build` untuk memverifikasi integritas template dan aset.
