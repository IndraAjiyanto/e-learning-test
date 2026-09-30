# Implementation Plan: Detail Transaksi pada Halaman History Payment

## 1. Analisis Task ClickUp & Hubungannya
- **Task ID**: `z8pbk8xq6x` (URL: `https://app.clickup.com/t/90182814122/z8pbk8xq6x`)
- **Nama Task**: *Detail transaksi pada halaman history payment*
- **Deskripsi Task**:
  > *"Role user pada halaman detail payment, tambahkan label 'harga promo' di bawah label 'harga' lalu label 'discount' ganti menjadi 'promo code'.*
  > *Data backend yang digunakan per label nya :*
  > - *harga : table invoice column price*
  > - *harga promo : table invoice column promo*
  > - *promo code : table invoice column promo_code*
  > - *final total : table invoice column final_total*
  > 
  > *Karena ada beberapa tambahan column baru di invoice, column column tersebut di isi dengan :*
  > - *price → ketika user melakukan pembayaran xendit atau upload bukti pembayaran manual, ambil harga price program untuk di simpan ke invoice*
  > - *promo → ketika user melakukan pembayaran xendit atau upload bukti pembayaran manual, ambil harga promo program untuk di simpan ke invoice*
  > - *promo_code → ketika user melakukan pembayaran xendit atau upload bukti pembayaran manual, ambil hitungan dari harga promo program yang di diskon oleh promo code"*

---

## 2. Nomor Urut Alur Bisnis (End-to-End)
1. **Input / Maker**:
   - User memilih program dan metode (Full Payment / Installment).
   - User membayar via gateway Xendit (`/api/payment/create`) ATAU mengunggah bukti transfer manual (`/payment/:userId/:courseId/manual` atau `/payment/:userId/:courseId/:installmentsId`).
2. **Snapshot Invoice (Persistence)**:
   - Sistem mengambil harga asli program (`course.price`) disimpan ke `invoice.price`.
   - Sistem mengambil harga promo program (`course.promo`) disimpan ke `invoice.promo`.
   - Sistem menghitung potongan voucher (`discountAmount`) disimpan ke `invoice.promo_code`.
   - Nilai akhir disimpan ke `invoice.final_total`.
3. **Antrean Verifikasi**:
   - Transaksi masuk antrean (`payments` status `process` untuk verifikasi manual super admin, atau menunggu webhook Xendit untuk gateway).
4. **Approval & Selesai**:
   - Super admin menyetujui transaksi manual ATAU webhook Xendit memvalidasi `PAID`. Status berubah menjadi `approved` / `paid`.
5. **Post-Condition (Penyajian Data History)**:
   - User membuka `GET /users/profile?tab=history-payment` lalu menekan tombol *View Detail*.
   - Modal `transaction_detail/index.hbs` menampilkan rincian ringkasan 4 baris sesuai token Figma:
     - `Harga`: `invoice.price`
     - `Harga Promo`: `invoice.promo`
     - `Promo Code`: `invoice.promo_code` (warna `#EF4444`)
     - `Total`: `invoice.final_total` (warna `#173B68`, font weight 700)

---

## 3. Komparasi: Kode Existing vs Kebutuhan Baru

| Komponen / Layer | Kode Saat Ini (Existing) | Kebutuhan Baru (Figma & ClickUp) |
| :--- | :--- | :--- |
| **Database Table `invoice`** | Kolom: `subtotal`, `discount_amount`, `final_total` | Tambah 3 kolom: `price` (numeric), `promo` (numeric), `promo_code` (numeric) |
| **Invoice Entity** | [invoice.entity.ts](file:///src/entities/invoice.entity.ts#L48-L62) belum ada `price`, `promo`, `promo_code` | Tambahkan decorator `@Column` untuk `price`, `promo`, `promo_code` |
| **Penyimpanan Manual Payment** | [payments.service.ts](file:///src/payments/payments.service.ts#L104-L127) `create()` belum membuat record `Invoice` | Buat record `Invoice` otomatis saat payment manual dibuat, isi snapshot `price`, `promo`, `promo_code`, `final_total` |
| **Penyimpanan Gateway Xendit** | [invoice.service.ts](file:///src/invoice/invoice.service.ts#L65-L85) baru menyimpan `subtotal`, `discount_amount`, `final_total` | Simpan `price` (`course.price`), `promo` (`course.promo`), `promo_code` (`discountAmount`) ke `Invoice` |
| **API History Payment** | [payments.service.ts](file:///src/payments/payments.service.ts#L365-L387) memetakan `subtotal`, `discount`, `originalPrice` | Petakan `price`, `promo`, `promoCode`, `finalTotal` dari relasi `payment.invoice` (dengan fallback aman ke `course`) |
| **Modal View Detail UI** | [transaction_detail/index.hbs](file:///src/views/partials/components/ui/modal/transaction_detail/index.hbs#L660-L695) baris harga dinamis (mencoret harga normal dan memakai label 'Discount') | 4 baris tetap sesuai CSS Figma: `Harga`, `Harga Promo`, `Promo Code` (warna `#EF4444`), dan `Total` |
| **I18n Translation** | Menggunakan key `test.transactionDetail.discount` ("Discount" / "Diskon") | Menggunakan key `test.transactionDetail.promoCode` ("Promo Code") |

---

## 4. Rencana Perubahan Berkas (Target Files)

### A. Database Migration
- **Berkas**: `src/database/migrations/1790400000000-AddPricePromoPromoCodeToInvoice.ts`
- **Aksi**: Tambahkan kolom `price` (numeric 12,2), `promo` (numeric 12,2), dan `promo_code` (numeric 12,2 default 0) pada tabel `invoice` secara idempoten.

### B. Entity Layer
- **Berkas**: [`src/entities/invoice.entity.ts`](file:///src/entities/invoice.entity.ts#L48-L62)
- **Aksi**: Tambahkan definisi properti:
  ```ts
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  promo: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  promo_code: number | null;
  ```

### C. Backend Service
1. **[`src/invoice/invoice.service.ts`](file:///src/invoice/invoice.service.ts#L45-L86)**:
   - Tambahkan pemetaan `price: course?.price ?? null`, `promo: course?.promo ?? null`, `promo_code: discountAmount ?? 0` saat `this.invoiceRepository.create()`.
2. **[`src/payments/payments.service.ts`](file:///src/payments/payments.service.ts#L104-L127)**:
   - Pada metode `create(createPaymentDto)` untuk pembayaran manual: buat instance `Invoice` yang menyimpan snapshot `price: course.price`, `promo: course.promo`, `promo_code: 0`, `final_total: calculatedTotal`, lalu hubungkan dengan `payment.invoice`.
   - Pada metode `findPaymentHistory(userId)` ([baris ~373](file:///src/payments/payments.service.ts#L373-L396)): sertakan `price`, `promo`, `promoCode`, dan `finalTotal` pada baris DTO agar dikonsumsi frontend modal.

### D. Frontend Modal & I18n
1. **[`src/views/partials/components/ui/modal/transaction_detail/index.hbs`](file:///src/views/partials/components/ui/modal/transaction_detail/index.hbs#L111-L144)**:
   - Tambahkan getter Alpine: `priceFormatted`, `promoPriceFormatted`, `promoCodeFormatted`, `finalTotalFormatted`.
   - Perbarui markup Summary (baris ~660-694) agar menampilkan 4 baris berurutan:
     1. `Harga` (`#6B7280`) -> `priceFormatted` (`#9CA3AF`, `line-through` / harga dicoret)
     2. Divider `#D8E6F6`
     3. `Harga Promo` (`#6B7280`) -> `promoPriceFormatted` (`#173B68`)
     4. Divider `#D8E6F6`
     5. `Promo Code` (`#6B7280`) -> `promoCodeFormatted` (`#EF4444`, font-semibold)
     6. Divider `#D8E6F6`
     7. `Total` (`#6B7280`) -> `finalTotalFormatted` (`#173B68`, font-bold, text-[15px])
2. **I18n Files**:
   - `src/i18n/id/test.json`: tambahkan `"promoCode": "Promo Code"` di `transactionDetail`.
   - `src/i18n/en/test.json`: tambahkan `"promoCode": "Promo Code"` di `transactionDetail`.
   - `src/i18n/ja/test.json`: tambahkan `"promoCode": "プロモコード"` di `transactionDetail`.

---

## 5. Verifikasi & Pengujian
1. Jalankan migrasi database: `npm run migration:run` (atau TypeORM migration check).
2. Verifikasi schema table `invoice` memiliki kolom `price`, `promo`, `promo_code`.
3. Verifikasi unit tests yang sudah ada (`npm run test -- payments.service.spec.ts` & `invoice.service.spec.ts`).
4. Jalankan `npm run build` untuk memastikan kompilasi TypeScript dan bundle aset bersih dari error.
5. Verifikasi visual modal transaksi pada halaman user profile tab history payment.
