# Implementation Plan: Detail Harga History Payment dari Table Invoice

- **Task Link**: [ClickUp z8pbk8y6uc](https://app.clickup.com/t/90182814122/z8pbk8y6uc)
- **Status**: Siap untuk Dieksekusi

---

## 1. Daftar File yang Terlibat

1. **`src/invoice/invoice.service.ts`**
   - Mengisi kolom `price`, `promo`, `promo_code`, dan `subtotal` (sebagai penampung total akhir pembayaran) saat membuat invoice Xendit dan manual.
2. **`src/payments/payments.service.ts`**
   - Menyelaraskan fungsi `findPaymentHistory` agar membaca data riil dari relasi `payment.invoice` (`price`, `promo`, `promo_code`, dan `subtotal`).
3. **`src/views/partials/components/ui/modal/transaction_detail/index.hbs`**
   - Menyesuaikan getter modal Alpine.js (`priceFormatted`, `promoPriceFormatted`, `promoCodeFormatted`, dan `finalTotalFormatted`) agar mengambil data persis dari field snapshot invoice (`price`, `promo`, `promoCode`, dan `subtotal`).

---

## 2. Rincian Perubahan Kode Riil

### Langkah 1: Penyesuaian Pembuatan Invoice (Xendit & Manual)
**Berkas**: [`src/invoice/invoice.service.ts`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/invoice/invoice.service.ts)

- **Pada `createInvoiceForPayment` (Baris 66-76)**:
  ```typescript
  const invoice = this.invoiceRepository.create({
    payment: payment,
    price: course?.price ? Number(course.price) : null,
    promo: course?.promo ? Number(course.promo) : null,
    promo_code: discountAmount ?? 0,
    subtotal: finalTotal, // Sesuai aturan task: nilai total pembayaran user disimpan di column subtotal
    discount_amount: discountAmount,
    final_total: finalTotal,
    payment_method: paymentMethod,
    invoice_number: payment.no,
    status: invoiceStatus,
    // ... metadata lainnya
  });
  ```
- **Pada `createManualInvoice` (Baris 144-154)**:
  ```typescript
  const invoice = this.invoiceRepository.create({
    payment: payment,
    price: price,
    promo: promo,
    promo_code: 0,
    subtotal: finalTotal, // Sesuai aturan task: total disimpan di column subtotal
    discount_amount: 0,
    final_total: finalTotal,
    payment_method: isInstallment ? 'Installment' : 'Manual Transfer',
    invoice_number: payment.no,
    status: 'pending',
    // ... metadata lainnya
  });
  ```

---

### Langkah 2: Penyesuaian Pengambilan Data di Payment History
**Berkas**: [`src/payments/payments.service.ts`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/payments/payments.service.ts)

- **Pada `findPaymentHistory` (Baris 377-425)**:
  ```typescript
  const price =
    payment.invoice?.price !== null && payment.invoice?.price !== undefined
      ? Number(payment.invoice.price)
      : normalPrice;

  const promo =
    payment.invoice?.promo !== null && payment.invoice?.promo !== undefined
      ? Number(payment.invoice.promo)
      : promoPrice;

  const promoCode =
    payment.invoice?.promo_code !== null && payment.invoice?.promo_code !== undefined
      ? Number(payment.invoice.promo_code)
      : (payment.invoice?.discount_amount ? Number(payment.invoice.discount_amount) : 0);

  // Task aturan bisnis: Data "total" di ambil dari table invoice column "subtotal"
  const total =
    payment.invoice?.subtotal !== null && payment.invoice?.subtotal !== undefined
      ? Number(payment.invoice.subtotal)
      : (payment.invoice?.final_total !== null && payment.invoice?.final_total !== undefined
          ? Number(payment.invoice.final_total)
          : fallbackPrice);

  return {
    id: payment.id,
    kind: isInstallment ? 'installment' : 'full',
    // ...
    amount: total,
    subtotal: total,
    total: total,
    finalTotal: total,
    discount: promoCode,
    originalPrice: price,
    price: price,
    promo: promo,
    promoPrice: promo,
    promoCode: promoCode,
    // ...
  };
  ```

---

### Langkah 3: Penyesuaian Getter Modal Transaction Detail
**Berkas**: [`src/views/partials/components/ui/modal/transaction_detail/index.hbs`](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/components/ui/modal/transaction_detail/index.hbs)

- **Pada `priceFormatted` (Baris 111-119)**:
  Membaca `this.row?.price` dengan fallback `this.row?.originalPrice`.
- **Pada `promoPriceFormatted` (Baris 121-129)**:
  Membaca `this.row?.promo` dengan fallback `this.row?.promoPrice`.
- **Pada `promoCodeFormatted` (Baris 131-137)**:
  Membaca `this.row?.promoCode` dengan fallback `this.row?.discount`.
- **Pada `finalTotalFormatted` (Baris 139-144)**:
  Membaca `this.row?.subtotal` (sesuai instruksi: Data "total" di ambil dari table invoice column "subtotal") dengan fallback `this.row?.total` / `this.row?.finalTotal` / `this.row?.amount`.

---

## 3. Rencana Verifikasi Pengujian

1. **Pengujian Snapshot Pembayaran Xendit**:
   - Lakukan simulasi pembuatan order Xendit dengan potongan voucher.
   - Verifikasi record di tabel `invoice` memiliki `price`, `promo`, `promo_code`, dan `subtotal` yang terisi nominal final.
2. **Pengujian Snapshot Pembayaran Manual**:
   - Upload bukti pembayaran manual.
   - Verifikasi record di tabel `invoice` terbuat dengan nilai `price`, `promo`, dan `subtotal`.
3. **Pengujian Tampilan Modal History Payment**:
   - Buka `/users/profile?tab=history-payment` dan klik *View Detail*.
   - Verifikasi 4 baris ringkasan:
     - `Harga`: mengambil dari `invoice.price`
     - `Harga Promo`: mengambil dari `invoice.promo`
     - `Promo Code`: mengambil dari `invoice.promo_code`
     - `Total`: mengambil dari `invoice.subtotal`
