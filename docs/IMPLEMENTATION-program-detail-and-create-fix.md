# Implementation Plan
## Eksekusi Perbaikan Detail Program & Error Create Program (Super Admin)

### 1. Daftar File yang Diubah

1. **`src/views/super_admin/course/detail.hbs`** (Detail program - Super Admin)
2. **`src/views/partials/components/ui/admin/detail/form_info/index.hbs`** (Form info - Admin)
3. **`src/views/partials/components/ui/admin/detail/learning/index.hbs`** (Learning details - Admin)
4. **`src/courses/courses.controller.ts`** (Controller create & createKelas)
5. **`src/courses/dto/create-courses.dto.ts`** (DTO validasi courseTypeId)

---

### 2. Rincian Langkah Perubahan Kode (Step-by-Step)

#### Langkah 1: Hapus Form Link pada Paid Program & Hapus Label Target pada Detail Super Admin
**Berkas:** [`src/views/super_admin/course/detail.hbs`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/super_admin/course/detail.hbs)
- **Baris 74-78:** Hapus blok:
  ```hbs
  {{#if course.form}}
    {{#> components/ui/super_admin/detail/field/index label='Form link'}}
      <a href='{{course.form}}' target='_blank' rel='noopener noreferrer' class='break-all font-inter text-sm font-medium leading-[22.75px] text-[#737373] underline transition-colors hover:text-[#003060]'>{{course.form}}</a>
    {{/components/ui/super_admin/detail/field/index}}
  {{/if}}
  ```
- **Baris 140-144:** Hapus blok:
  ```hbs
  {{#> components/ui/super_admin/detail/field/index label='Target'}}
    <p class='break-words font-inter text-sm font-medium leading-[22.75px] text-[#737373]'>
      {{#each course.learningTargetsId}}{{this}}{{#unless @last}}, {{/unless}}{{else}}-{{/each}}
    </p>
  {{/components/ui/super_admin/detail/field/index}}
  ```

#### Langkah 2: Hapus Form Link pada Paid Program (Admin)
**Berkas:** [`src/views/partials/components/ui/admin/detail/form_info/index.hbs`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/components/ui/admin/detail/form_info/index.hbs)
- **Baris 27-32:** Hapus blok:
  ```hbs
  {{#if course.form}}
  <div class='w-full flex flex-col gap-[8px]'>
    <span class='text-[14px]/[normal] text-[#171717] font-inter font-semibold'>Form link</span>
    <a href='{{course.form}}' target='_blank' class='text-[14px]/[normal] text-[#737373] font-inter font-medium break-all underline hover:text-[#003060]'>{{course.form}}</a>
  </div>
  {{/if}}
  ```

#### Langkah 3: Hapus Label Target pada Learning Details (Admin)
**Berkas:** [`src/views/partials/components/ui/admin/detail/learning/index.hbs`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/components/ui/admin/detail/learning/index.hbs)
- **Baris 21-24:** Hapus blok:
  ```hbs
  <div class='w-full flex flex-col gap-[8px]'>
    <span class='text-[14px]/[normal] text-[#171717] font-inter font-semibold'>Target</span>
    <span class='text-[14px]/[normal] text-[#737373] font-inter font-medium break-words'>{{#if course.learningTargetsId}}{{#each course.learningTargetsId}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Memahami dasar dasar uiux design{{/if}}</span>
  </div>
  ```

#### Langkah 4: Perbaiki Injeksi Category & Error Handling di Controller
**Berkas:** [`src/courses/courses.controller.ts`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/courses/courses.controller.ts)
- **Baris 194-204 (`createKelas`):**
  Sebelum:
  ```typescript
  const dto = await this.buildCreateDto(body, req.user);
  dto.categoryId = categoryId;
  ```
  Sesudah:
  ```typescript
  body.categoryId = categoryId;
  const dto = await this.buildCreateDto(body, req.user);
  dto.categoryId = categoryId;
  ```
- **Baris 100-103 (`create`) & 216-219 (`createKelas`):**
  Perbaiki ekstraksi pesan error agar menampilkan detail array dari `ValidationPipe` jika ada:
  ```typescript
  const message =
    error.getResponse?.()?.message
      ? Array.isArray(error.getResponse().message)
        ? error.getResponse().message.join(', ')
        : error.getResponse().message
      : error.message || 'program failed created';
  req.flash('error', message);
  ```

#### Langkah 5: Sesuaikan Validasi DTO untuk `courseTypeId` (Tag)
**Berkas:** [`src/courses/dto/create-courses.dto.ts`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/courses/dto/create-courses.dto.ts)
- **Baris 45-46:**
  Tambahkan `@IsOptional()` pada `courseTypeId` agar pembuatan program tidak terblokir ketika tag tidak dipilih:
  ```typescript
  @IsOptional()
  @IsUUID()
  courseTypeId?: string;
  ```

---

### 3. Rencana Verifikasi

1. **Uji Validasi Form Super Admin**:
   - Jalankan skrip scratch simulasi validasi payload form `create.hbs` dan `formCreate.hbs`.
   - Pastikan DTO lolos tanpa memunculkan `BadRequestException`.
2. **Uji Render Template Halaman Detail**:
   - Periksa bahwa pada program Paid, `Price`, `Promo`, dan `Type: Paid` muncul, sementara `Time Start`, `Time End`, `Form link`, dan `Target` **tidak tampil**.
   - Periksa bahwa pada program Free, `Form link` dan `Type: Free` muncul, sementara `Target` **tidak tampil**.
3. **Build TypeScript Check**:
   - Jalankan `npm run build` untuk memverifikasi tidak ada error sintaks atau type mismatch.
