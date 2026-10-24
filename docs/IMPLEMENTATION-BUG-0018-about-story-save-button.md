# Implementation Plan: [BUG 0018] Perbaikan Tombol Save Changes pada About - Story

- **Task Link**: [ClickUp z8pbk8zaee](https://app.clickup.com/t/90182814122/z8pbk8zaee)
- **Bug Code**: BUG-018
- **Halaman/Fitur**: Super Admin > About - Story (`/paragraphs`)
- **Status**: Siap untuk Di-review (Draft Proposal)

---

## 1. Ringkasan Masalah (Bug Summary)

Pada halaman **About - Story** (kelola paragraf About di `/paragraphs/formEdit/:id`), ketika pengguna (Super Admin / tester) mengubah isi paragraf, tombol **Save Changes** tetap nonaktif (*disabled* / tidak dapat diklik), sehingga pengguna tidak dapat menyimpan perubahan data.

### Expected Result (Sesuai Tiket)
1. Tombol **Save Changes** dapat diklik setelah isi paragraf diubah.
2. Perubahan paragraf berhasil disimpan ke sistem dan database.
3. Menampilkan notifikasi keberhasilan (*success toast*) setelah data berhasil diperbarui.
4. Jika penyimpanan gagal, sistem menampilkan pesan error yang informatif (*error toast*).
5. Data yang telah disimpan tetap tampil setelah halaman dimuat ulang.
6. Tidak ada regresi pada halaman pembuatan (*Create Paragraph*) maupun tampilan publik About Us.

---

## 2. Analisis Akar Masalah (Root Cause Analysis)

Setelah membandingkan kode di `src/views/super_admin/paragraphs/` dengan 39 form edit lainnya dan pedoman gating form di `docs/form-submit-gating.md`, ditemukan beberapa faktor penyebab:

### A. Gating Tombol Terkunci Mati (`!canSubmit()` Tanpa Indikasi Tab Lain)
Pada `src/views/super_admin/paragraphs/edit.hbs`:
```hbs
{{> components/ui/super_admin/form/button
  type='submit'
  variant='primary'
  label='Save Changes'
  loading=true
  disabled='!canSubmit() || !isDirty || loading'
}}
```
Pada `src/views/partials/components/ui/super_admin/form/paragraphs/form.hbs`:
```javascript
const LANGS = ['id', 'en', 'ja'];
const MIN = 10;

canSubmit() {
  return LANGS.every(
    (lang) => errorFor(lang, this.formData.paragraphs[lang]) === '',
  );
}
```
- **Masalah**: `canSubmit()` mewajibkan **ketiga bahasa** (`id`, `en`, `ja`) masing-masing terisi minimal 10 karakter.
- Di halaman edit, tab aktif secara default adalah **Indonesia (`id`)**.
- Jika data paragraf di database berasal dari data lama (*legacy data*, *seed*, atau paragraf yang saat dibuat belum lengkap bahasa Jepang atau Inggrisnya), `formData.paragraphs.ja` atau `formData.paragraphs.en` bernilai kosong atau `< 10` karakter.
- Akibatnya, `canSubmit()` selalu bernilai `false`.
- Karena tombol dipasangi atribut `:disabled="!canSubmit() || !isDirty || loading"`, tombol **mati total** (`pointer-events-none opacity-50`).
- Saat pengguna mengubah teks bahasa Indonesia, `isDirty` bernilai `true`, namun tombol **tetap tidak bisa diklik** karena `!canSubmit()` masih `true`.
- Karena tombol tidak bisa diklik, fungsi `submitForm()` tidak pernah terpanggil, sehingga `revealFirstInvalid()` tidak pernah memindahkan tab ke bahasa yang bermasalah atau memperlihatkan pesan error. Pengguna merasa form macet tanpa petunjuk apa pun.

### B. Perilaku Gating Form Edit Dibandingkan dengan `create.hbs`
- Pada `create.hbs`, tombol tidak di-disable mati: saat diklik, fungsi `submitForm($event)` menjalankan `validateAll()`, lalu bila ada error, `revealFirstInvalid()` otomatis memindahkan tab ke bahasa yang belum valid dan memfokuskan field tersebut.
- Pada `edit.hbs`, tombol membutuhkan proteksi `!isDirty` (agar tidak submit tanpa perubahan), namun jika `!canSubmit()` mematikan tombol saat ada tab tersembunyi yang belum lengkap, pengguna terjebak.
- Solusi standar:
  1. Bila `!canSubmit()` dipertahankan, tab bahasa harus memberi indikator visual bila ada bahasa yang belum valid/lengkap, ATAU
  2. Tombol di-disable hanya berdasarkan `!isDirty || loading`. Ketika pengguna mengubah data dan menekan **Save Changes**, `submitForm($event)` akan memvalidasi seluruh bahasa. Jika ada bahasa yang belum lengkap, sistem secara cerdas menjalankan `revealFirstInvalid()`: otomatis berpindah ke tab bahasa tersebut dan menampilkan pesan validasi *"Paragraph (Japanese) is required"* atau *"Paragraph (Japanese) must be at least 10 characters"*.
  3. Menjamin normalisasi data awal (`paragraphsForm({ paragraphs })`) agar jika `paragraphs` bernilai string/array/null, tidak menyebabkan exception runtime.

### C. Penanganan Error Flash pada Controller
Pada `src/paragraphs/paragraphs.controller.ts` (baris 82-86):
```typescript
} catch (error: unknown) {
  const err = error as Error;
  req.flash('error', err.message || 'Failed to update paragraph');
  res.redirect('/paragraphs');
}
```
- Notifikasi error menggunakan `req.flash('error')`, padahal sistem layout `src/views/layouts/main.hbs` menggunakan `flashToastError(req, title, description)` untuk merender `components/ui/super_admin/toast/error`.
- Akibatnya, jika terjadi kegagalan update di backend, pesan error tidak tampil sebagai pop-up toast error modern sesuai *Acceptance Criteria*.

---

## 3. Rencana Perubahan (Implementation Plan)

### Berkas 1: `src/views/super_admin/paragraphs/edit.hbs`
**Lokasi**: Baris 47-54
- Sesuaikan kondisi `disabled` pada tombol Save Changes:
  ```hbs
  {{> components/ui/super_admin/form/button
    type='submit'
    variant='primary'
    label='Save Changes'
    loading=true
    disabled='!isDirty || loading'
  }}
  ```
- **Alasan**:
  - Tombol tetap nonaktif saat form dibuka pertama kali (belum ada perubahan, `!isDirty` aktif).
  - Begitu pengguna mengubah paragraf bahasa Indonesia/Inggris/Jepang, tombol **Save Changes langsung aktif**.
  - Saat tombol ditekan, `@submit.prevent='submitForm($event)'` berjalan. Jika ada tab bahasa lain yang belum memenuhi panjang minimum 10 karakter atau kosong, form akan otomatis memindahkan tab ke bahasa yang belum valid (`revealFirstInvalid()`), menampilkan border merah dan pesan error yang jelas, tanpa membuat tombol macet permanen.

### Berkas 2: `src/views/partials/components/ui/super_admin/form/paragraphs/form.hbs`
**Lokasi**: Normalisasi data awal & fungsi `revealFirstInvalid`
- Pastikan inisialisasi `paragraphs` aman dari struktur data tidak lazim (*array/string/null*):
  ```javascript
  const normalizeParagraphs = (raw) => {
    if (!raw || typeof raw !== 'object') return byLang(() => '');
    if (Array.isArray(raw)) return byLang((l, i) => raw[i] || '');
    return byLang((l) => raw[l] || '');
  };
  ```
- Sempurnakan `paragraphsForm` agar membaca data ternormalisasi:
  ```javascript
  formData: { paragraphs: normalizeParagraphs(paragraphs) },
  ```
- Pastikan fungsi `canSubmit()` dan `validateAll()` tetap sinkron dengan ketiga bahasa.

### Berkas 3: `src/paragraphs/paragraphs.controller.ts`
**Lokasi**: Baris 78-87 pada method `update`
- Gunakan `flashToastError` saat terjadi kegagalan update agar pesan error informatif muncul di toast:
  ```typescript
  try {
    await this.paragraphsService.update(id, updateParagraphsDto);
    flashToast(req, 'Changes Saved', 'The paragraph has been updated.');
    res.redirect('/paragraphs');
  } catch (error: unknown) {
    const err = error as Error;
    flashToastError(req, 'Failed to Save Changes', err.message || 'Failed to update paragraph');
    res.redirect('/paragraphs');
  }
  ```

---

## 4. Rencana Pengujian & Verifikasi (Verification Scenarios)

1. **Uji Tombol Nonaktif Saat Form Pertama Dibuka**:
   - Buka `/paragraphs/formEdit/:id`.
   - Pastikan tombol **Save Changes** dalam kondisi nonaktif (*disabled*) karena belum ada perubahan data (`isDirty = false`).
2. **Uji Tombol Aktif Saat Paragraf Diubah**:
   - Ubah salah satu kata pada textarea paragraf.
   - Pastikan tombol **Save Changes** langsung berubah menjadi aktif (*enabled*) dan dapat diklik.
3. **Uji Validasi Antar Tab (Bila Ada Bahasa Belum Lengkap)**:
   - Jika salah satu bahasa dikosongkan atau `< 10` karakter dan tombol diklik:
   - Form tidak tersubmit, tab otomatis berpindah ke bahasa yang invalid, field fokus, dan muncul pesan error merah di bawah field.
4. **Uji Berhasil Menyimpan Perubahan**:
   - Klik **Save Changes** pada data yang valid.
   - Sistem melakukan POST PATCH ke `/paragraphs/:id`.
   - Browser diarahkan kembali ke `/paragraphs`.
   - Toast hijau bertuliskan **"Changes Saved"** & *"The paragraph has been updated."* muncul.
   - Paragraf yang baru diperbarui tampil dengan benar di tabel.
5. **Uji Persistensi Saat Reload**:
   - Muat ulang (*hard reload*) halaman `/paragraphs`.
   - Data perubahan tetap tersimpan.
6. **Uji Tampilan Publik (Regression Test)**:
   - Akses halaman About publik (`/dashboard/about` atau tab Story).
   - Pastikan paragraf yang diedit tampil sesuai bahasa yang dipilih.

---

## 5. Pertanyaan & Review Sebelum Eksekusi

Mohon konfirmasi atau arahan mengenai plan di atas:
- Apakah strategi gating tombol Save Changes di `edit.hbs` menggunakan `disabled='!isDirty || loading'` (dengan validasi penuh via `submitForm` + `revealFirstInvalid()`) sudah disetujui, ataukah ada preferensi aturan gating lain yang diinginkan oleh tim?
