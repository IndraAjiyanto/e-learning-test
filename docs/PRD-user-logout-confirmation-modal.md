# Product Requirements Document (PRD) - Modal Konfirmasi Logout User

## 1. Executive Summary & Objective
Implementasi fitur Modal Konfirmasi Logout pada seluruh antarmuka pengguna (`role: user`/student) berdasarkan task ClickUp [z8pbk8xwud](https://app.clickup.com/t/90182814122/z8pbk8xwud). Tujuannya adalah mencegah user keluar dari sesi pembelajaran secara tidak sengaja (*unintended session termination*) dengan menampilkan modal dialog verifikasi sebelum mengeksekusi rute backend `GET /logout`.

Komponen ini dibangun baru secara modular di lingkup user (`src/views/partials/components/ui/user/modal/logout_confirm/index.hbs`) dengan mengadopsi standar desain, arsitektur event-driven, dan aksesibilitas dari modal konfirmasi Super Admin (`src/views/partials/components/ui/super_admin/modal/delete_confirm/index.hbs`).

---

## 2. Komparasi Kode & Gap Analisis

| Aspek | Kondisi Super Admin (`delete_confirm`) | Kondisi User Saat Ini | Solusi Komponen Baru User (`logout_confirm`) |
|---|---|---|---|
| **Lokasi Berkas** | `src/views/partials/components/ui/super_admin/modal/delete_confirm/index.hbs` | Belum ada modal konfirmasi logout di user | Buat di `src/views/partials/components/ui/user/modal/logout_confirm/index.hbs` |
| **Mekanisme Trigger** | `onclick="openDeleteModal(this)"` mengirim event `delete-confirm:open` | Direct link `<a href="/logout">` tanpa pencegahan di [user_profile/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/user/user_profile/index.hbs#L254) & [shell_frame/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/user/shell_frame/index.hbs#L94) | Ganti `<a>` menjadi `<button type="button" onclick="openLogoutModal()">` yang melempar event `logout-confirm:open` |
| **Backdrop & Kontainer** | Backdrop blur 16px (`#0a0a0a/70`), card putih `max-w-[400px]`, `rounded-xl p-6` | Tidak ada | Mengadopsi struktur container, shadow, dan backdrop Super Admin secara identik |
| **Ikon Utama** | Ikon seru/trash merah dalam pill bulat (`border-8 border-[#FEF2F2] bg-[#FEE2E2]`) | Tidak ada | Ikon Log Out `fa-arrow-right-from-bracket` dalam badge sirkular merah (`border-8 border-[#FEF2F2] bg-[#FEE2E2]` teks `#C0392B`) |
| **Aksi Tombol** | Dua tombol: `Cancel` (border netral) & `Delete` (`#dc2626`) | Langsung navigasi ke `/logout` | Dua tombol: `Cancel` (fokus awal non-destruktif) & `Log Out` (`#C0392B` teks putih) |
| **Aksesibilitas & State** | Focus trap (`cycleFocus`), Escape listener, Click-away dismiss, Body scroll-lock | Tidak ada | Diadopsi penuh menggunakan Alpine.js native tanpa library tambahan |

---

## 3. Alur Bisnis Konfirmasi Logout (4 Tahapan)

1. **Input / Maker (User Trigger)**:
   - User mengklik tombol "Log Out" pada Desktop Sidebar ([shell_frame](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/user/shell_frame/index.hbs#L94) / [user_profile](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/user/user_profile/index.hbs#L375)) atau Mobile Navigation Bar ([user_profile](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/user/user_profile/index.hbs#L254)).
2. **Antrean Verifikasi (Modal State Activation)**:
   - Event `logout-confirm:open` dipancarkan ke `window`.
   - Modal muncul dengan transisi backdrop blur 16px.
   - Body scroll terkunci (`overflow-hidden`).
   - Fokus otomatis berpindah ke tombol non-destruktif "Cancel" via `requestAnimationFrame` untuk mencegah eksekusi logout yang tidak disengaja melalui tombol Enter.
3. **Approval / User Decision**:
   - **Opsi A (Batal)**: User menekan tombol "Cancel", menekan tombol Escape, atau mengklik di luar area card dialog. Modal ditutup, fokus dikembalikan ke elemen pemicu, dan sesi tetap aktif.
   - **Opsi B (Konfirmasi Keluar)**: User menekan tombol "Log Out". State berubah ke `submitting = true` untuk mencegah klik ganda.
4. **Post-Condition / Selesai**:
   - Browser diarahkan ke backend rute `GET /logout` ([src/auth/auth.controller.ts:117](file:///E:/Wiratek%20Projek/clone%20e-learning/src/auth/auth.controller.ts#L117)).
   - Sesi dihancurkan, cookie auth dibersihkan, dan user diredirect kembali ke halaman login/beranda.

---

## 4. Spesifikasi Desain & Design Tokens

- **Backdrop Overlay**: `bg-[#0a0a0a]/70 backdrop-blur-[16px]`
- **Modal Box**: `w-full max-w-[400px] rounded-xl bg-white p-6 shadow-[0px_8px_8px_-4px_rgba(0,0,0,0.03),0px_20px_24px_-4px_rgba(0,0,0,0.08)]`
- **Icon Container**: Sirkular 48px (`h-12 w-12 rounded-full border-8 border-[#FEF2F2] bg-[#FEE2E2] text-[#C0392B]`)
- **Judul**: `font-inter text-lg font-semibold leading-7 text-[#171717]` (Default: "Log Out")
- **Pesan Deskripsi**: `font-inter text-sm font-normal leading-5 text-[#525252]` (Default: "Are you sure you want to log out?")
- **Tombol Cancel**: `h-11 flex-1 rounded-lg border border-[#d4d4d4] bg-white text-[#404040] hover:bg-[#f5f5f5]`
- **Tombol Confirm**: `h-11 flex-1 rounded-lg border border-[#C0392B] bg-[#C0392B] text-white hover:bg-[#a5311f]`
