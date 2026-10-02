# Implementation Plan: Penghapusan Kolom Status Program pada Role Admin

- **Task Link**: [ClickUp z8pbk8y799](https://app.clickup.com/t/90182814122/z8pbk8y799)
- **Status**: Draft Proposal Sebelum Eksekusi

---

## 1. Daftar File yang Terlibat

1. **`src/views/partials/components/ui/admin/program/table.hbs`**
   - Menambahkan gating `{{#if isSuperAdmin}}` pada header kolom `Status Program` dan body dropdown baris tabel.
   - Mengatur conditional min-width dan melepas pembatas lebar program name saat role admin agar tabel tetap proporsional dan tidak meninggalkan ruang kosong.
2. **`src/views/admin/course/index.hbs`**
   - Memastikan `isSuperAdmin` diteruskan secara eksplisit ke partial `table` (`{{> components/ui/admin/program/table isSuperAdmin=isSuperAdmin}}`).
3. **`src/courses/courses.controller.ts`**
   - Memperketat otorisasi route backend: mengubah `@Roles('admin', 'super_admin')` menjadi `@Roles('super_admin')` pada:
     - `@Patch(':courseId/status-json')`
     - `@Patch(':courseId/toggle-launch')`
     - `@Patch(':courseId/toggle-launch-json')`
     - `@Patch(':courseId/toggle-status')`

---

## 2. Rincian Modifikasi Kode Riil

### Langkah 1: Modifikasi `table.hbs` (Frontend Gating & Dynamic Width)
**File**: [`src/views/partials/components/ui/admin/program/table.hbs`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/components/ui/admin/program/table.hbs)

1. **Penyesuaian Header Row**:
   - Baris 27:
     ```hbs
     {{!-- Ubah min-width container header: 1168px untuk super_admin, 1043px untuk admin --}}
     <div class='w-full {{#if isSuperAdmin}}min-w-[1168px]{{else}}min-w-[1043px]{{/if}} h-[43.5px] shrink-0 flex flex-row gap-0 justify-start items-start bg-[#FAFAFA] [border-width:0px_0px_1px_0px] [border-style:solid] [border-color:#E5E5E5] [margin:0px_0px_-0.5px_0px]'>
     ```
   - Baris 34 (Kolom Program Name Header):
     ```hbs
     <div class='box-border w-[14%] min-w-[180px] flex-1 {{#if isSuperAdmin}}max-w-[210px]{{/if}} h-full flex flex-row gap-0 p-[12px] justify-start items-center'>
     ```
   - Baris 52-54 (Kolom Status Program Header):
     ```hbs
     {{#if isSuperAdmin}}
     <div class='box-border w-[10.5%] min-w-[125px] shrink-0 h-full flex flex-row gap-0 p-[12px] justify-start items-center'>
       <div class='text-[12px]/[normal] flex-1 text-[#525252] font-inter font-medium text-left'>Status Program</div>
     </div>
     {{/if}}
     ```

2. **Penyesuaian Body Row**:
   - Baris 62:
     ```hbs
     {{!-- Ubah min-width baris data: 1168px untuk super_admin, 1043px untuk admin --}}
     <div class='w-full {{#if isSuperAdmin}}min-w-[1168px]{{else}}min-w-[1043px]{{/if}} h-[71.5px] shrink-0 flex flex-row gap-0 justify-start items-start bg-[#FFFFFF] [border-width:0px_0px_1px_0px] [border-style:solid] [border-color:#E5E5E5] [margin:0px_0px_-0.5px_0px] hover:bg-[#fafafa] transition-colors'>
     ```
   - Baris 82 (Kolom Program Name Data):
     ```hbs
     <div class='box-border w-[14%] min-w-[180px] flex-1 {{#if isSuperAdmin}}max-w-[210px]{{/if}} h-full flex flex-row gap-0 p-[16px_12px] justify-start items-center'>
     ```
   - Baris 122-221 (Kolom Status Program Dropdown):
     ```hbs
     {{#if isSuperAdmin}}
     {{!-- Status Program (Dropdown Lifecycle: Unlaunch -> Launch -> Learning -> Done) --}}
     <div class='box-border w-[10.5%] min-w-[125px] shrink-0 h-full flex flex-row p-[16px_8px] justify-start items-center relative'
          x-data='{ open: false }'
          :class="open ? 'z-30' : 'z-10'"
          @click.outside='open = false'>
       ...
     </div>
     {{/if}}
     ```

---

### Langkah 2: Eksplisit Parameter di `index.hbs`
**File**: [`src/views/admin/course/index.hbs`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/admin/course/index.hbs#L37)

- Baris 37:
  ```hbs
  {{!-- Teruskan isSuperAdmin eksplisit ke komponen table --}}
  {{> components/ui/admin/program/table isSuperAdmin=isSuperAdmin}}
  ```

---

### Langkah 3: Pengetatan Otorisasi Backend Controller
**File**: [`src/courses/courses.controller.ts`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/courses/courses.controller.ts)

- Baris 1432:
  ```typescript
  @Roles('super_admin')
  @Patch(':courseId/toggle-launch')
  ```
- Baris 1454:
  ```typescript
  @Roles('super_admin')
  @Patch(':courseId/toggle-launch-json')
  ```
- Baris 1475:
  ```typescript
  @Roles('super_admin')
  @Patch(':courseId/status-json')
  ```
- Baris 1500:
  ```typescript
  @Roles('super_admin')
  @Patch(':courseId/toggle-status')
  ```

---

## 3. Rencana Pengujian & Verifikasi

1. **Uji Login Role Admin**:
   - Buka URL `/program`.
   - Pastikan header tabel hanya berisi 9 kolom (No, Cover, Program Name, Group, Category, Status, Quota, Student, Action).
   - Pastikan tidak ada kolom "Status Program" dan tidak ada dropdown interaktif.
   - Pastikan susunan tabel rapi, tidak ada celah kosong dan tidak ada overlap elemen.
2. **Uji API Security Role Admin**:
   - Kirim request `PATCH /program/{id}/status-json` dengan session admin.
   - Verifikasi respon menghasilkan status HTTP `403 Forbidden`.
3. **Uji Login Role Super Admin**:
   - Buka URL `/program`.
   - Pastikan kolom "Status Program" muncul secara utuh pada posisi kolom ke-9.
   - Ubah status program via dropdown, pastikan modal konfirmasi muncul dan status berhasil diperbarui.
