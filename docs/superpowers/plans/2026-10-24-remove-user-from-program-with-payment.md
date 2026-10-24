# Remove User from Program With Financial Records Preserved Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengizinkan admin mengeluarkan user dari program (mencabut enrollment `user_courses`) meskipun user tersebut memiliki riwayat pembayaran/transaksi atau pendaftaran, dengan tetap mempertahankan seluruh data transaksi keuangan dan buktinya.

**Architecture:** Modifikasi method `removeCourseUser(userId, courseId)` di `CoursesService` untuk menghapus pengecekan pemblokiran transaksi (`hasPayment` dan `hasRegistration`). Penghapusan hanya dilakukan terhadap entitas `UserCourse` sehingga relasi keikutsertaan dicabut, sementara data `Payment`, `Registration`, `Invoice`, dan `InstallmentPayment` tetap utuh.

**Tech Stack:** NestJS, TypeORM, PostgreSQL, Jest.

**Spec:** `docs/superpowers/specs/2026-10-24-remove-user-from-program-design.md`

## Global Constraints
- Bahasa dan stack: TypeScript, NestJS, TypeORM.
- Tidak boleh menghapus data pada tabel `payments`, `registrations`, `invoice`, maupun `installment_payments`.
- File bukti transfer fisik pada storage/Cloudinary tidak boleh dihapus saat pelepasan user dari program.
- Menjaga konsistensi response dan flash message pada `CoursesController`.

## Review Focus
- Permintaan hapus saat user tidak terdaftar di program harus melempar `NotFoundException('User not found')`.
- User yang memiliki multiple pembayaran pada program tersebut tetap berhasil dikeluarkan dari program tanpa error foreign key.
- Record pembayaran di tabel `payments` dan invoice di tabel `invoice` tetap ada dengan `userId` dan `courseId` yang valid setelah user dicabut hak aksesnya.
- Admin yang membuka kembali halaman `/program/addUser/:courseId` melihat user sudah tidak ada di daftar student terdaftar, dan user kembali muncul di pencarian untuk ditambahkan ulang jika diperlukan.

---

### Task 1: Add Unit Tests for `removeCourseUser` in `CoursesService`

**Files:**
- Create/Modify: `src/courses/courses.service.spec.ts`

**Interfaces:**
- Consumes: `CoursesService.removeCourseUser(userId: string, courseId: string)`
- Produces: Test suite validating unenrollment with existing payment & registration records.

- [ ] **Step 1: Write failing unit test in `courses.service.spec.ts`**
  Buat test case untuk `removeCourseUser`:
  - `should successfully remove user from course even if user has payment records`
  - `should successfully remove user from course even if user has registration records`
  - `should throw NotFoundException if user is not enrolled in course`
  - Verifikasi bahwa `userCourseRepository.remove` dipanggil, sedangkan `paymentRepository.remove` dan `registrationRepository.remove` TIDAK pernah dipanggil.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx jest src/courses/courses.service.spec.ts -t "removeCourseUser"`
  Expected: FAIL (karena implementasi saat ini masih melempar `BadRequestException` ketika `hasPayment` atau `hasRegistration` bernilai true).

---

### Task 2: Remove Payment & Registration Blocker in `CoursesService.removeCourseUser`

**Files:**
- Modify: `src/courses/courses.service.ts:1865-1892`

**Interfaces:**
- Consumes: `userId: string`, `courseId: string`
- Produces: `removeCourseUser(userId: string, courseId: string): Promise<UserCourse>`

- [ ] **Step 1: Update `removeCourseUser` in `src/courses/courses.service.ts`**
  Hapus blok pengecekan:
  ```typescript
  const hasPayment = await this.paymentRepository.findOne({ ... });
  if (hasPayment) { throw new BadRequestException(...); }

  const hasRegistration = await this.registrationRepository.findOne({ ... });
  if (hasRegistration) { throw new BadRequestException(...); }
  ```
  Pertahankan pengecekan record `userCourses` dan pemanggilan `await this.userCourseRepository.remove(userCourses)`.

- [ ] **Step 2: Run unit test to verify it passes**
  Run: `npx jest src/courses/courses.service.spec.ts -t "removeCourseUser"`
  Expected: PASS

- [ ] **Step 3: Commit changes**
  ```bash
  git add src/courses/courses.service.ts src/courses/courses.service.spec.ts
  git commit -m "fix(courses): allow removing user from course with financial records preserved"
  ```

---

### Task 3: Verification & Regression Check

**Files:**
- Test verification across related modules (`courses`, `payments`, `registrations`).

- [ ] **Step 1: Run whole test suite for affected modules**
  Run: `npx jest src/payments/payments.service.spec.ts src/payments/payments.controller.spec.ts`
  Expected: PASS

- [ ] **Step 2: Verify database state & endpoints**
  Verifikasi via dry-run script atau psql bahwa penghapusan record di `user_courses` tidak menyentuh baris di `payments`, `registrations`, dan `invoice`.

