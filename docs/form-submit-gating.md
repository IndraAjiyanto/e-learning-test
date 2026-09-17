# Gating tombol simpan pada form admin & super admin

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

---

# Bagian admin

Halaman `src/views/admin/**` memakai aturan yang sama — tombol baru aktif bila
form layak dikirim — tetapi mekanismenya berbeda karena form di sini tidak
memakai factory `formData` + `errorFor()` seperti super admin. Sebagian besar
field-nya input biasa tanpa `x-model`, jadi kelayakan dibaca dari **constraint
validation bawaan browser**.

## Helper `adminFormGate()`

Didefinisikan di `components/ui/admin/form/gate.hbs` dan dimuat sekali lewat
`layouts/main.hbs`, jadi tersedia di semua halaman.

```hbs
x-data="{ ...adminFormGate(), loading: false }"
x-init="recomputeFormValid()"
@input="recomputeFormValid()"
@change="recomputeFormValid()"
```

lalu tombolnya:

```hbs
{{> components/ui/admin/button/primary-button
  text='Save' type='submit' loading='loading' disabled='!formValid' }}
```

Bila form juga punya berkas wajib, gabungkan di `canSubmit()` milik halaman dan
kirim `disabled='!canSubmit()'`.

## Jebakan: `checkValidity()` melewati input hidden

`searchable_select` menaruh nilainya di `<input type="hidden">`, dan constraint
validation bawaan browser **tidak memeriksa field hidden** — select wajib yang
masih kosong tetap terbaca valid. Karena itu:

- `searchable_select` menerima prop `required` yang merender `data-required`
  pada hidden input-nya;
- `recomputeFormValid()` memeriksa hidden input ber-`data-required` secara
  terpisah, sesudah `checkValidity()`.

Konsekuensinya: **field wajib harus benar-benar menyandang atribut `required`.**
Label bertanda `*` saja tidak cukup — gerbangnya tidak melihat label. Sudah
pernah terjadi: `weeks/create` menyala di form kosong karena `Description*`
tidak punya `required`.

## Jebakan: dua atribut `:disabled` pada satu tombol

`components/ui/admin/button/primary-button` dulu memancarkan `:disabled` sendiri
untuk `loading` dan untuk `disabled`. Atribut duplikat dibuang parser HTML —
yang pertama menang — sehingga salah satu syarat hilang diam-diam. Sekarang
komponennya meng-OR keduanya menjadi satu binding, jadi `loading` **tidak perlu**
ikut ditulis di ekspresi `disabled`.

## Daftar form admin

| Halaman | Syarat tombol aktif |
|---|---|
| `attendance` create, edit | seluruh field wajib (termasuk select user) |
| `assignments/create` | field wajib **plus** berkas valid |
| `course/formCreate` | `canSubmit()` milik `programCreateForm` — field aktif + cover |
| `course/create`, `program/create`, `course/edit` | `formComplete` dari `program_form_script` (sudah ada sebelumnya) |
| `course/addUser` | user terpilih (sudah ada sebelumnya) |
| `logbooks` create, edit | field wajib **plus** gambar; edit memakai gambar tersimpan |
| `materi/create` (pdf, ppt, video) | field wajib **plus** berkas/URL; edit boleh memakai yang tersimpan |
| `mentor_logbook` create, edit | field wajib **plus** gambar |
| `questions` create, edit | field wajib |
| `quiz` create, edit | field wajib |
| `session` create, edit | field wajib |
| `weeks` create, edit | field wajib |

## Menambahkan form admin baru

1. Sebarkan `...adminFormGate()` ke `x-data`, pasang `x-init`/`@input`/`@change`.
2. Tandai setiap field wajib dengan `required` — termasuk `required=true` pada
   `searchable_select`.
3. Kirim `disabled='!formValid'` (atau `'!canSubmit()'` bila ada syarat berkas).
4. Uji halaman **create** (tombol harus mati saat dibuka) dan halaman **edit**
   (tombol harus menyala dengan data — regresi paling berbahaya dari aturan ini).

---

# Halaman edit: harus ada perubahan dulu

Berlaku untuk **semua** halaman edit, admin maupun super admin (40 halaman).
Tombol Save baru aktif bila form valid **dan** isinya berbeda dari saat halaman
dibuka. Aturan ini dulu hanya dipakai halaman edit profil.

## Helper `formDirtyGate()`

Ada di `components/ui/admin/form/gate.hbs`, bersebelahan dengan `adminFormGate()`
(yang sudah menyertakannya, jadi halaman admin cukup memakai `initGate()`).

```hbs
x-data='{ ...someForm({ ... }), ...formDirtyGate() }'
x-init='$nextTick(() => captureBaseline())'
```

```hbs
disabled='!canSubmit() || !isDirty || loading'
```

Sengaja bekerja di level DOM, bukan di dalam factory: satu factory super admin
dipakai halaman create dan edit sekaligus, sedangkan aturan ini hanya untuk
edit. Menaruhnya di factory akan ikut mengunci halaman create yang punya nilai
default — valid tapi belum "berubah".

## Tiga jebakan yang sudah ditemui

**1. Patokan terambil terlalu cepat.** Sebagian halaman edit mengisi nilai
awalnya lewat binding Alpine (`x-init` prefill), yang baru diterapkan sesudah
init. Karena itu `captureBaseline()` dipanggil di dalam `$nextTick`; tanpa itu
form langsung terbaca berubah padahal belum disentuh.

**2. Input berkas.** Objek `File` tidak bisa dibandingkan langsung, jadi
diserialisasi sebagai `nama:ukuran`. Berkas lama yang tidak diunggah ulang tetap
terbaca sama; memilih berkas baru menandai form berubah.

**3. Hidden input yang diisi Alpine — ini yang paling berbahaya.** Dropdown
kustom (mis. pemilih kategori di `partner/edit`) menaruh nilainya di
`<input type="hidden">` lewat binding `:value`. Menyetel `.value` secara
langsung **tidak memicu event apa pun**, jadi `@input`/`@change` di markup tidak
pernah menyala. Di halaman yang seluruh field-nya berupa dropdown semacam itu,
tombol Save macet permanen. Karena itu helper memasang listener sendiri untuk
`input`, `change`, **dan `click`** pada elemen form, dengan `$nextTick` supaya
Alpine sempat menuliskan nilainya lebih dulu.

## Cakupan

40 dari 40 halaman edit. Diverifikasi di browser pada tujuh halaman yang
mewakili setiap bentuk `x-data` (satu baris, bertingkat, objek literal, factory
admin) plus `partner/edit` yang hanya punya hidden input + berkas: semuanya
terbuka dengan tombol mati, lalu menyala begitu satu nilai diubah. Halaman
create dipastikan tidak ikut terpengaruh.

## Celah yang masih terbuka

`course_benefits`, `course_flows`, `course_questions`, dan `participants` hanya
digating oleh `isDirty` — factory-nya (`courseFlowForm` dkk.) belum punya
`canSubmit()`, jadi validitas isinya belum ikut diperiksa. Menambahkan
`canSubmit()` di keempat factory itu akan melengkapinya.
