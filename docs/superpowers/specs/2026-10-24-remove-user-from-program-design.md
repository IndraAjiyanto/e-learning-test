# Design Specification: Allow Removing User from Program With Financial Records Preserved

## 1. Intent & Goal
Saat ini, admin/super admin tidak dapat mengeluarkan peserta (student/user) dari suatu program (`course`) apabila user tersebut telah memiliki riwayat pembayaran (`payments`) atau riwayat pendaftaran (`registrations`). Sistem secara sengaja memblokir aksi tersebut dengan pesan error:
- `"User tidak dapat dihapus dari program karena sudah memiliki riwayat pembayaran."`
- `"User tidak dapat dihapus dari program karena sudah memiliki riwayat registration."`

Tujuan perubahan ini adalah mengizinkan admin untuk mencabut hak akses program dari user (menghapus record enrollment `user_courses`), sementara riwayat transaksi keuangan (`payments`, `installment_payments`, `invoice`, `registrations`) tetap dipertahankan secara utuh untuk keperluan audit dan pencatatan keuangan.

## 2. Requirements & Constraints
1. **Pencabutan Akses**: Menghapus record `UserCourse` antara user dan program yang bersangkutan saat admin melakukan aksi delete pada route `DELETE /program/:userId/program/:courseId`.
2. **Integritas Data Keuangan**: Data pada tabel `payments`, `installment_payments`, `invoice`, dan `registrations` TIDAK BOLEH dihapus ataupun dimodifikasi relasinya saat user dikeluarkan dari program.
3. **Validasi Eksistensi**:
   - Jika record enrollment `UserCourse` tidak ditemukan, sistem tetap mengembalikan `NotFoundException('User not found')` atau bad request yang sesuai.
   - Pengecekan pemblokiran `hasPayment` dan `hasRegistration` di `removeCourseUser` pada `CoursesService` dihapus.
4. **Testing**:
   - Unit test harus memverifikasi bahwa pemanggilan `removeCourseUser(userId, courseId)` berhasil menghapus `UserCourse` meskipun user memiliki record pembayaran dan pendaftaran, dan memastikan repository `PaymentRepository` serta `RegistrationRepository` tidak memanggil operasi delete/remove.

