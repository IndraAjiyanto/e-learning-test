# Gating tombol simpan pada form super admin

Tombol **Save / Create / Update** baru aktif setelah form layak dikirim. Dokumen
ini mencatat aturannya, form mana yang memakai aturan default, form mana yang
lebih ketat, dan jebakan yang sudah pernah membuat fitur ini tidak jalan.

## Aturan default: terisi & valid

Form dianggap siap bila **semua field wajib lolos validasinya sendiri**,
dihitung ulang dari nilai terkini — bukan dari error yang kebetulan sudah
tampil. Konsekuensinya:

- Halaman **create**: tombol mati saat dibuka, menyala setelah semua field wajib terisi.
- Halaman **edit**: tombol langsung menyala karena datanya memang sudah terisi,
  dan mati lagi begitu ada field wajib yang dikosongkan.

## Cara memasangnya

Tiga bagian, semuanya wajib:

1. Factory Alpine form menyediakan `canSubmit()`.
2. Halaman meneruskannya ke tombol: `disabled='!canSubmit() || loading'`.
3. `components/ui/super_admin/form/button` merender prop itu sebagai binding
   Alpine. Mode `row=true` meneruskannya otomatis ke tombol submit.

```hbs
{{> components/ui/super_admin/form/button
  type='submit'
  variant='primary'
  label='Save Changes'
  loading=true
  disabled='!canSubmit() || loading'
}}
```

```js
canSubmit() {
  return PATHS.every((path) => errorFor(path, read(this.formData, path)) === '');
},
```

## Jebakan: jangan pakai `hasFormErrors()` untuk gating

`formErrors` hanya terisi untuk field yang sudah **disentuh** (`touched`), karena
pesan error memang tidak boleh muncul sebelum user menyentuh field. Akibatnya
form kosong yang belum disentuh terbaca "tanpa error":

```js
// SALAH — form kosong lolos, tombol menyala sejak awal
canSubmit() { return !this.hasFormErrors(); }

// BENAR — dihitung ulang dari nilai, lepas dari touched
canSubmit() { return PATHS.every((p) => errorFor(p, read(this.formData, p)) === ''); }
```

`hasFormErrors()` tetap dipakai di `submitForm()` untuk menampilkan pesan setelah
`validateAll()`; yang tidak boleh adalah memakainya sebagai syarat tombol.

## Daftar form

### Aturan default — field wajib saja

| Factory / halaman | Halaman yang memakai |
|---|---|
| `form/background` | background create, edit |
| `form/benefit` | benefit, benefit_category create, edit |
| `form/experience` | experience create, edit |
| `form/faq` | faq, faqs create, edit |
| `form/header` | about create, edit |
| `form/icon_item` | commitment, value create, edit |
| `form/mission` | missions create, edit |
| `form/paragraphs` | paragraphs create, edit |
| `form/program_type` | courseType create, edit |
| `form/social` | social create, edit |
| `form/vision` | visions create, edit |
| `form/voucher` | voucher create, edit |
| lokal halaman | award, category_partner, course_benefits, course_flows, course_questions, installments, participants, topic |

### Lebih ketat — field wajib **plus** berkas/gambar

| Factory / halaman | Syarat tambahan |
|---|---|
| `form/alumni` | foto profil wajib ada (create maupun edit) |
| `form/gallery` | berkas gambar |
| `form/team` | berkas yang dipilih harus lolos validasi (foto sendiri opsional) |
| `form/team_lead` | create wajib foto; edit boleh memakai foto tersimpan |
| `form/technology` | wajib salah satu: kode SVG **atau** gambar |
| `category` create/edit | icon dan hero image; edit boleh memakai gambar tersimpan |
| `mentor`, `partner`, `user` create/edit | berkas yang diunggah harus lolos validasi |

### Lebih ketat lagi — harus ada perubahan

| Halaman | Aturan |
|---|---|
| Edit profile (`components/ui/profile/index.hbs`) | `hasChanges` — tombol mati sampai user benar-benar mengubah sesuatu, lalu mati lagi bila nilainya dikembalikan |

Halaman ini **sengaja dibiarkan** memakai aturannya sendiri karena lebih ketat
dari default. Ia juga tidak memakai `form/button`, melainkan `:disabled` langsung.

## Menambahkan form baru

1. Beri factory-nya `canSubmit()` yang menghitung ulang dari `formData`.
2. Kirim `disabled='!canSubmit() || loading'` ke tombol submit.
3. Untuk field berkas, tambahkan syaratnya di `canSubmit()` — dan pastikan
   halaman **edit** tidak ikut terkunci ketika berkas lama tidak diunggah ulang
   (pola yang dipakai: `isEdit ? (!hasFile || isValid) : (hasFile && isValid)`).
