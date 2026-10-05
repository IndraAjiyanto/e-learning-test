# Catatan Lengkap: Integrasi Xendit Payment Gateway

> Dokumen ini berisi catatan dari sesi diskusi dan eksekusi integrasi Xendit pada LMS (Learning Management System) Kesatria Academy.
> Tech Stack: NestJS + Handlebars (SSR) + PostgreSQL + TypeORM

---

## Daftar Isi

1. [Arsitektur Keseluruhan Proyek](#1-arsitektur-keseluruhan-proyek)
2. [Status Implementasi Xendit](#2-status-implementasi-xendit)
3. [Alur Cara Kerja Xendit di Projek Ini](#3-alur-cara-kerja-xendit-di-projek-ini)
4. [Temuan Kritis & Yang Perlu Di-improve](#4-temuan-kritis--yang-perlu-di-improve)
5. [Eksekusi P0 #1: Hapus Hack Redirect Success](#5-eksekusi-p0-1-hapus-hack-redirect-success)
6. [Regression Test Results](#6-regression-test-results)
7. [Langkah Verifikasi Perusahaan di Xendit](#7-langkah-verifikasi-perusahaan-di-xendit)
8. [Rencana ke Live Mode](#8-rencana-ke-live-mode)
9. [P0 yang Masih Tersisa](#9-p0-yang-masih-tersisa)

---

## 1. Arsitektur Keseluruhan Proyek

### Pola Arsitektur
- **Modular Monolith** dengan pendekatan **Layered (N-Tier) + MVC** karena SSR
- Folder `/src` terbagi per domain: `courses`, `users`, `auth`, `payments`, `invoice`, dll.
- Folder `/src/common` untuk shared logic: guards, interceptors, filters, helpers, decorators.

### Request Lifecycle
```
HTTP Request
  → Global Middlewares (AuthMiddleware, FooterMiddleware)
  → Global Guards (RolesGuard)
  → Interceptors (ValidateImageInterceptor)
  → Pipes (DTO validation via class-validator)
  → Controller → Service → Repository (TypeORM)
  → Response: res.render() (Handlebars) atau res.json()
```

### Database
- ORM: **TypeORM** dengan PostgreSQL
- Migrasi manual via `QueryRunner` + raw SQL
- Session storage: `connect-pg-simple` (tabel `web_sessions`)

### View Layer
- Engine: **express-handlebars** (`src/views/`)
- Layout: `src/views/layouts/main.hbs`
- Partials: `src/views/partials/`
- Custom helpers: `src/common/helpers/` (date, string, logic, i18n, ui, wa, number)

### Auth
- **Express Session** (stateful, backed by PostgreSQL)
- **Passport.js Local Strategy** (email + password)
- Password hashing: **bcrypt** (`@BeforeInsert` hook di entity)
- Role: `super_admin`, `admin`, `user`

---

## 2. Status Implementasi Xendit

### Apa yang Sudah Jalan
| Fitur | Status | Lokasi Kode |
|---|---|---|
| Buat Invoice Full Payment | ✅ | `invoice.service.ts:createInvoiceForPayment()` |
| Buat Invoice DP Cicilan | ✅ | `invoice.service.ts:createInvoiceForInstallment()` |
| Webhook Handler | ✅ | `invoice.service.ts:handleXenditWebhook()` |
| Cicilan Bulanan (sequential guard) | ✅ | `payments.service.ts:createMonthlyInstallmentInvoice()` |
| Reconcile / Self-healing | ✅ | `payments.service.ts:reconcileUserPayments()` |
| Anti double-charge cicilan | ✅ | Cek `getXenditInvoiceStatus()` sebelum buat invoice baru |
| Integrasi Voucher | ✅ | `voucher.service.ts:validateVoucher()` |

### API yang Digunakan
```typescript
// src/invoice/invoice.service.ts:7
import { Invoice as InvoiceClient } from 'xendit-node';

// Endpoint legacy: POST /v2/invoices
const xenditResponse = await this.xenditInvoiceClient.createInvoice({
  data: {
    externalId: payment.no,       // INV-${Date.now()}
    amount: finalTotal,
    payerEmail: user.email,
    description: `Payment for ${courseName}`,
    successRedirectUrl: `${appUrl}/payment/success/${payment.no}`,
    failureRedirectUrl: `${appUrl}/payment/failed/${payment.no}`,
    currency: 'IDR',
  },
});
```

### Env Variables yang Dibutuhkan
```env
XENDIT_SECRET_KEY=           # API key dari Xendit
XENDIT_CALLBACK_TOKEN=       # Token webhook (buat di dashboard)
APP_URL_LMS=                 # Domain produksi (untuk redirect URL)
```

---

## 3. Alur Cara Kerja Xendit di Projek Ini

### Alur Full Payment
```
User klik "Bayar"
  → POST /api/payment/create (ApiPaymentController)
  → PaymentsService.createXenditInvoice()
    - Cek harga (promo/price/downPayment)
    - Validasi voucher → hitung diskon
    - Buat record Payment (status: 'process')
    - InvoiceService.createInvoiceForPayment()
      → POST /v2/invoices (Xendit API)
      → Simpan xendit_invoice_id + url
  → Redirect user ke xendit.co/invoice/{id}
  → User pilih metode bayar, selesaikan
    ├── Webhook POST /invoice/webhook/xendit
    │   → handleXenditWebhook()
    │   → PAID/SETTLED → approved + addUserToCourse()
    └── Redirect GET /payment/success/:orderId
        → settleStuckPayment() → cek ke Xendit API
        → kalau Xendit bilang PAID → approve
```

### Alur Cicilan
```
User bayar DP → Payment + Invoice dibuat → Redirect Xendit
  → Webhook/Reconcile → DP approved → addUserToCourse()

Bulan N: createMonthlyInstallmentInvoice(paymentId, month=N)
  → Guard: bulan sebelumnya harus approved
  → Buat InstallmentPayment row
  → InvoiceService.createInvoiceForInstallment()
  → User bayar → Webhook → status='approved'
```

### Webhook Handler Detail
```typescript
// src/invoice/invoice.service.ts:244
async handleXenditWebhook(payload: any, callbackToken: string) {
  // 1. Validasi token
  if (validToken && callbackToken !== validToken) throw Unauthorized

  // 2. Cari cicilan bulanan by external_id
  const installment = await findByNo(externalId)
  if (installment) → update status approved/rejected

  // 3. Cari payment by no
  const payment = await paymentRepository.findOne({no: externalId})
  if (payment.invoice.paid_at) return  // idempotent

  // 4. PAID/SETTLED → approved + addUserToCourse()
  // 5. EXPIRED → rejected
}
```

### Reconcile / Self-healing
```typescript
// src/payments/payments.service.ts:304
async reconcileUserPayments(userId: string) {
  // 1. Loop semua payment 'process' → cek ke Xendit
  for (const p of stuckPayments) {
    if (p.invoice?.xendit_invoice_id) {
      await invoiceService.settleStuckPayment(p.id)
    }
  }

  // 2. Loop semua cicilan 'process' → cek ke Xendit
  for (const row of processRows) {
    if (row.xendit_invoice_id) {
      const res = await getXenditInvoiceStatus(row.xendit_invoice_id)
      if (PAID/SETTLED) → approved
      if (EXPIRED) → rejected
    }
  }
}
```

---

## 4. Temuan Kritis & Yang Perlu Di-improve

### P0 — Kritis (Harus Beres Sebelum Live)

#### P0 #1: Redirect Success Langsung Approve (SUDAH DIPERBAIKI)
- **Masalah:** `GET /payment/success/:orderId` langsung set `process='approved'` + enroll tanpa verifikasi
- **Pelanggaran:** Melanggar [Xendit Integration Security](https://docs.xendit.co/docs/integration-security): *"Do not confirm orders based on frontend client redirections."*
- **Risiko:** Siapapun yang tahu pola `INV-xxx` bisa approve pembayaran tanpa bayar
- **Status:** ✅ Sudah diperbaiki (lihat Bab 5)

#### P0 #2: Webhook Token Opsional
- **Masalah:** Kalau `.env` kosong `XENDIT_CALLBACK_TOKEN`, semua webhook lolos
- **Kode sekarang:** `if (validToken && callbackToken !== validToken)` → `validToken` falsy = skip
- **Solusi:** Wajibkan token saat bootstrap, throw error kalau kosong
- **Status:** ❌ Belum dieksekusi

#### P0 #3: Tidak Verifikasi Amount di Webhook
- **Masalah:** Webhook handler tidak mencocokkan `payload.amount` dengan `invoice.final_total`
- **Rekomendasi Xendit:** *"Always verify the details in the webhook notification... validating that the transaction IDs and amount"*
- **Status:** ❌ Belum dieksekusi

#### P0 #4: Simulasi Endpoint Tanpa Auth (SUDAH DIPERBAIKI)
- **Masalah:** `POST /invoice/simulate-success/:no` tidak ada auth guard
- **Status:** ✅ Sudah ditambah `@UseGuards(AuthenticatedGuard)` + `@Roles('super_admin')` + production block

#### P0 #5: `payment.no` Tidak Ada Unique Constraint
- **Masalah:** `INV-${Date.now()}` rawan tabrakan dan bisa di-enumerasi
- **Status:** ❌ Belum dieksekusi

### P1 — Migrasi ke Payment Sessions API
- Xendit sudah **deprecated** legacy Invoice API (`/v2/invoices`)
- API baru: **Payment Sessions** (`POST /sessions`) dengan `session_type: PAY/SAVE/SUBSCRIPTION`
- Keuntungan: semua payment channel, `payment.failure` webhook, save payment method native
- Dokumentasi migrasi: https://docs.xendit.co/docs/migrate-to-payment-session
- **Status:** ❌ Belum dimulai

### P2 — Transaksi Atomik
- `createXenditInvoice()` melakukan beberapa save tanpa transaksi database
- Kalau save kedua gagal, payment ada tapi invoice tidak ada → data yatim
- **Solusi:** Bungkus dalam `DataSource.transaction()` atau `QueryRunner`
- **Status:** ❌ Belum dieksekusi

### P2 — Voucher Bisa Dipakai Berulang
- `validateVoucher()` hanya hitung diskon, tidak mencatat pemakaian
- Kode sendiri mengakui: *"Karena kita menghapus PromoUsageLog..."*
- **Status:** ❌ Belum dieksekusi

---

## 5. Eksekusi P0 #1: Hapus Hack Redirect Success

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/payments/payments.controller.ts` | Hapus blok hack `:60-74`, ganti `settleStuckPayment()`. Perbaiki installment handler. Tambah `InvoiceService` ke constructor. |
| `src/invoice/invoice.controller.ts` | Tambah `@UseGuards(AuthenticatedGuard)` + `@Roles('super_admin')` + `NODE_ENV=production` guard ke endpoint simulasi. |
| `src/invoice/invoice.service.spec.ts` | Tambah 3 test case baru + reset mock antar test. |
| `src/payments/payments.controller.spec.ts` | Rewrite ke 4 test case fungsional. |

### Perubahan Detail

#### 1. `payments.controller.ts` — Constructor
```typescript
// SEBELUM
constructor(private readonly paymentsService: PaymentsService) {}

// SESUDAH
constructor(
  private readonly paymentsService: PaymentsService,
  private readonly invoiceService: InvoiceService,
) {}
```

#### 2. `payments.controller.ts` — Installment Success Handler
```typescript
// SEBELUM
if (installment.status !== 'approved') {
  installment.status = 'approved';
  installment.paidAt = new Date();
  await this.paymentsService.updateInstallmentPayment(installment);
}

// SESUDAH
if (installment.status !== 'approved' && installment.xendit_invoice_id) {
  const xenditStatus = await this.invoiceService.getXenditInvoiceStatus(
    installment.xendit_invoice_id,
  );
  if (
    xenditStatus &&
    (xenditStatus.status === 'PAID' || xenditStatus.status === 'SETTLED')
  ) {
    installment.status = 'approved';
    installment.paidAt = xenditStatus.paidAt || new Date();
    await this.paymentsService.updateInstallmentPayment(installment);
  }
}
```

#### 3. `payments.controller.ts` — Payment Success Handler
```typescript
// SEBELUM (HACK)
try {
  if (req.user && course && order.process !== 'approved') {
    order.process = 'approved';
    if (order.installment && !order.dpPaidAt) {
      order.dpPaidAt = new Date();
    }
    await this.paymentsService['paymentRepository'].save(order);
    await this.paymentsService.addUserToCourse(req.user.id, course.id);
  }
} catch (err) {}

// SESUDAH (VERIFIKASI)
if (order.process !== 'approved') {
  await this.invoiceService
    .settleStuckPayment(order.id)
    .catch(() => undefined);
  const refreshed = await this.paymentsService.getPaymentByNo(orderId);
  if (refreshed) {
    Object.assign(order, refreshed);
  }
}
```

#### 4. `invoice.controller.ts` — Simulate Endpoint
```typescript
// SEBELUM
@Post('simulate-success/:no')
async simulateSuccess(...) { ... }

// SESUDAH
@UseGuards(AuthenticatedGuard)
@Roles('super_admin')
@Post('simulate-success/:no')
async simulateSuccess(...) {
  if (process.env.NODE_ENV === 'production') {
    throw new ForbiddenException('Simulasi tidak tersedia di production');
  }
  ...
}
```

#### 5. `invoice.service.spec.ts` — Test Baru
```typescript
it('returns already-approved payment without calling Xendit', async () => {
  paymentRepo.findOne.mockResolvedValue(makePayment({ process: 'approved' }));
  const result = await service.settleStuckPayment('p1');
  expect(mockClient.getInvoiceById).not.toHaveBeenCalled();
  expect(result!.process).toBe('approved');
});

it('returns payment without invoice without error', async () => {
  paymentRepo.findOne.mockResolvedValue(makePayment({ invoice: null }));
  const result = await service.settleStuckPayment('p1');
  expect(result!.process).toBe('process');
});

it('keeps process when Xendit returns PENDING', async () => {
  paymentRepo.findOne.mockResolvedValue(makePayment());
  mockClient.getInvoiceById.mockResolvedValue({ status: 'PENDING' });
  const result = await service.settleStuckPayment('p1');
  expect(paymentRepo.save).not.toHaveBeenCalled();
  expect(result!.process).toBe('process');
});
```

#### 6. `payments.controller.spec.ts` — Test Baru
```typescript
it('calls settleStuckPayment when order is not approved', async () => { ... });
it('does not call settleStuckPayment when order is already approved', async () => { ... });
it('calls getXenditInvoiceStatus for installment redirect', async () => { ... });
it('does not approve installment when Xendit status is not PAID', async () => { ... });
```

---

## 6. Regression Test Results

```
Test Suites: 8 passed, 96 failed (pre-existing), 104 total
Tests:       62 passed, 96 failed (pre-existing), 158 total
TypeScript:  ✅ Clean compile (tsc --noEmit)
```

### Test Suites yang PASS (8/8)

| Test Suite | Status | Catatan |
|---|---|---|
| `invoice.service.spec.ts` | ✅ PASS | +3 test baru, total 10 test |
| `payments.controller.spec.ts` | ✅ PASS | Dari skeleton → 4 test fungsional |
| `payments.service.spec.ts` | ✅ PASS | Tidak diubah |
| `installment-payment.service.spec.ts` | ✅ PASS | Tidak diubah |
| `app.controller.spec.ts` | ✅ PASS | Tidak diubah |
| `translation.controller.spec.ts` | ✅ PASS | Tidak diubah |
| `translation.service.spec.ts` | ✅ PASS | Tidak diubah |
| `sessionUnlock.spec.ts` | ✅ PASS | Tidak diubah |

### 96 Test Gagal — Bukan Regresi
Semua gagal dengan pola yang sama: `Nest can't resolve dependencies of the XService (?)`. Ini adalah scaffold `.spec.ts` dari NestJS CLI yang tidak pernah diupdate untuk menyediakan mock repository. Sudah gagal sebelum perubahan ini.

---

## 7. Langkah Verifikasi Perusahaan di Xendit

### Tahap 1: Persiapan Dokumen (Sebelum Buka Dashboard)

Berdasarkan [dokumentasi resmi Xendit untuk Indonesia](https://docs.xendit.co/docs/indonesia-business-documents):

**A. Dokumen Bisnis (Business Documents)**
- Akta Pendirian Perusahaan (PT/CV) atau NIB dari OSS
- NPWP Perusahaan
- Surat Keterangan Domisili (jika ada)

**B. Dokumen Identitas (Identity Documents)**
- KTP Direksi/Pengambil Keputusan (minimal 1 orang)
- NPWP Pribadi Direksi

**C. Bukti Bisnis (Proof of Business)**
- Website aktif (URL lengkap, wajib bisa diakses publik)
- Foto toko/kantor (jika ada lokasi fisik)

> Individual applications hanya diizinkan sebagai XP sub-accounts. Bisnis utama wajib PT/CV.

### Tahap 2: Proses di Dashboard Xendit

1. Login ke [dashboard.xendit.co](https://dashboard.xendit.co)
2. Klik banner **"Verify Business"** di bagian atas
3. Isi informasi bisnis (nama, jenis badan usaha, bidang usaha, website)
4. Upload dokumen sesuai 3 kategori di atas
5. Submit → proses verifikasi **maksimal 14 hari kerja**

### Tahap 3: Setelah Verifikasi Disetujui

1. **Aktifkan Payment Channels** (sidebar → Payment Channels → Activate):
   - VA BCA, BNI, BRI, Mandiri → instant
   - QRIS → instant
   - GoPay, OVO, DANA → instant
   - Credit Card → mungkin perlu dokumentasi tambahan
   - Indomaret/Alfamart → mungkin perlu kontak CS

2. **Ambil API Keys** (Settings → Developers → API Keys):
   - Copy **Secret Key Live** (`xnd_live_...`)

3. **Buat Callback Token** (Settings → Webhooks):
   - Generate token baru → catat

4. **Atur Webhook URL:**
   - URL: `https://domain-anda.com/invoice/webhook/xendit`
   - Method: POST

5. **Switch ke Live Mode** di dashboard

---

## 8. Rencana ke Live Mode

### FASE 1: Dashboard Xendit (Anda)
- [ ] Daftar akun Xendit
- [ ] Submit verifikasi perusahaan
- [ ] Tunggu approval (maks 14 hari kerja)
- [ ] Aktifkan payment channels
- [ ] Ambil API keys (Live)
- [ ] Buat webhook callback token
- [ ] Atur webhook URL

### FASE 2: Server Produksi
- [ ] Isi `.env`:
  ```env
  XENDIT_SECRET_KEY=xnd_live_...
  XENDIT_CALLBACK_TOKEN=token-dari-dashboard
  APP_URL_LMS=https://domain-anda.com
  NODE_ENV=production
  ```
- [ ] Deploy kode yang sudah di-fix
- [ ] Pastikan HTTPS aktif

### FASE 3: Validasi Akhir
- [ ] Test full payment VA BCA di Live Mode
- [ ] Test cicilan (DP + bulan 1)
- [ ] Test simulasi expired
- [ ] Cek webhook masuk di dashboard Xendit
- [ ] Cek settlement ke rekening H+2

---

## 9. P0 yang Masih Tersisa

| No | Temuhan | File | Status |
|---|---|---|---|
| P0 #1 | Redirect success langsung approve | `payments.controller.ts` | ✅ Selesai |
| P0 #2 | Webhook token opsional | `invoice.service.ts` constructor | ❌ Belum |
| P0 #3 | Tidak verifikasi amount di webhook | `invoice.service.ts:handleXenditWebhook()` | ❌ Belum |
| P0 #4 | Simulasi endpoint tanpa auth | `invoice.controller.ts` | ✅ Selesai |
| P0 #5 | `payment.no` tidak ada unique constraint | Entity + migration | ❌ Belum |
| P1 | Migrasi ke Payment Sessions API | `invoice.service.ts` | ❌ Belum |
| P2 | Transaksi tidak atomik | `payments.service.ts` | ❌ Belum |
| P2 | Voucher bisa dipakai berulang | `voucher.service.ts` | ❌ Belum |

---

## Referensi Dokumentasi Xendit

| Topik | URL |
|---|---|
| Create Account | https://docs.xendit.co/docs/create-account |
| Verifying Your Account | https://docs.xendit.co/docs/verifying-your-account |
| Indonesia Business Documents | https://docs.xendit.co/docs/indonesia-business-documents |
| Activate Payment Channels | https://docs.xendit.co/docs/activate-payment-channels |
| Handling Webhooks | https://docs.xendit.co/docs/handling-webhooks |
| Integration Security | https://docs.xendit.co/docs/integration-security |
| Migrate to Payment Sessions | https://docs.xendit.co/docs/migrate-to-payment-session |
| API Keys | https://docs.xendit.co/docs/api-keys |
| Dashboard | https://dashboard.xendit.co |

---

> Dokumen ini dibuat pada 10 September 2026
> Terakhir diupdate: 10 September 2026
