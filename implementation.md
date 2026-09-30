# Implementation Plan: Redesign Tombol Logout (Figma Frame 2147229725)

## 1. Analisis Task ClickUp & Hubungannya
- **Task ID**: `z8pbk8xuyy` (URL: `https://app.clickup.com/t/90182814122/z8pbk8xuyy`)
- **Nama Task**: List Portfolio
- **Deskripsi Task**: *"Membuat sebuah halaman baru untuk menampilkan list portofolio."*
- **Assignee**: John Calvin S | **Creator**: Chinta Fitriana (UI/UX) | **Status**: In Progress
- **Korelasi Desain**:
  Pada pengerjaan halaman student area (termasuk List Portfolio & User Profile), frame desain Figma (`Frame 2147229725`) memuat pembaruan visual pada komponen sidebar student, khususnya **Tombol Log Out** di bagian bawah.

---

## 2. Perbandingan: Kode Saat Ini vs Desain Baru

| Atribut Visual | Kode Saat Ini (Existing) | Desain Baru (Figma Frame 2147229725) |
| :--- | :--- | :--- |
| **Background** | Merah solid (`#C0392B`) | Putih (`#FFFFFF`) |
| **Warna Teks & Ikon** | Putih (`#FFFFFF`) | Merah (`#C0392B`) |
| **Box Shadow** | Tidak ada | `0px 0px 4px rgba(0, 0, 0, 0.25)` |
| **Border Radius** | `8px` (`rounded-lg`) | `8px` (`border-radius: 8px`) |
| **Tinggi (Height)** | `44px` (`h-11` / `2.75rem`) | `40px` (`height: 40px` / `h-10`) |
| **Padding** | `10px 14px` (`0.625rem 0.875rem`) | `10px 24px` (`padding: 10px 24px`) |
| **Gap** | `12px` (`gap-3` / `0.75rem`) | `10px` (`gap: 10px` / `gap-2.5`) |
| **Tipografi** | Inter/Montserrat, font-medium (500), 14px | Montserrat, font-semibold (600), 14px, line-height 20px |
| **Ikon** | FontAwesome `fa-arrow-right-from-bracket` | SVG Feather/Lucide `log-out` 18x18px, border 2px solid `#C0392B` |
| **State Hover** | Merah lebih gelap (`#a5311f`) | Soft hover effect (`#fef2f2` / subtle light red background) |

---

## 3. Rencana Perubahan Berkas (Target Files)

### A. `src/common/public/style.css`
Ubah aturan CSS kelas `.js-user-sidebar-logout-link`:
```css
/* Log Out: background putih, drop shadow, teks & icon merah #C0392B */
.js-user-sidebar-logout-link {
  background-color: #FFFFFF;
  color: #C0392B;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  height: 2.5rem; /* 40px */
  padding: 0.625rem 1.5rem; /* 10px 24px */
  gap: 0.625rem; /* 10px */
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
}
.js-user-sidebar-logout-link:hover {
  background-color: #fef2f2;
}
html[data-user-sidebar='collapsed'] .js-user-sidebar-logout-link {
  background-color: #FFFFFF;
  color: #C0392B;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
}
html[data-user-sidebar='collapsed'] .js-user-sidebar-logout-link:hover {
  background-color: #fef2f2;
}
```

### B. `src/views/user/user_profile/index.hbs`
1. **Navigasi Mobile (Baris ~253)**:
   Ubah tombol logout mobile agar konsisten dengan desain baru:
   - Dari: `text-white bg-[#C0392B] hover:bg-[#a5311f] h-11 px-4`
   - Menjadi: `h-10 px-6 py-2.5 gap-2.5 rounded-lg bg-white text-[#C0392B] shadow-[0px_0px_4px_rgba(0,0,0,0.25)] font-montserrat font-semibold text-sm leading-5 hover:bg-[#fef2f2]`
   - Ikon disesuaikan ke ukuran 18px.
2. **Navigasi Desktop Sidebar (Baris ~376)**:
   - Perbarui kelas font menjadi `font-montserrat font-semibold` dan pastikan ikon berukuran 18px.

### C. `src/views/partials/user/shell_frame/index.hbs`
- Sesuaikan link tombol logout desktop (Baris ~94) dengan `font-montserrat font-semibold` dan ukuran icon 18px agar identik di seluruh halaman shell.

### D. Kompilasi CSS
- Jalankan: `npm run build:css:prod` untuk memperbarui berkas `src/common/public/css/style.css`.

---

## 4. Rencana Pengujian
1. Verifikasi tampilan visual desktop sidebar saat expanded (terbentang) dan collapsed (menciut).
2. Verifikasi tampilan tombol logout pada navigasi mobile di halaman profil.
3. Jalankan automated test layout sidebar bila diperlukan (`npm run test:ui`).
