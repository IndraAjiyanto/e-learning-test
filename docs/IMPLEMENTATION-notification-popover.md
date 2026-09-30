# Implementation Plan - User Header Notification Pop-Up

## 1. Berkas & Lokasi Perubahan

1. **Berkas Baru**: [src/views/partials/components/ui/notification/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/components/ui/notification/index.hbs)
   - Bertindak sebagai single component yang merender icon trigger bell + unread count badge + popover container dengan pointer seam cover.
2. **Berkas Modifikasi**: [src/views/partials/user/app_bar/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/user/app_bar/index.hbs#L52-L56)
   - Menggantikan button statis baris 53–55 dengan pemanggilan partial `{{> components/ui/notification/index }}`.

---

## 2. Struktur Komponen [src/views/partials/components/ui/notification/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/components/ui/notification/index.hbs)

### A. Geometri & Styling Popover (Sesuai Desain CSS)
- **Container**: `relative inline-block` pada wrapper tombol bell.
- **Pointer & Pointer Seam Cover**:
  - Pointer: segitiga `31px x 18px` posisi `top: 0px` dengan border `#CDD7E6`.
  - Seam cover: elemen penutup celah `23px x 3px` warna `#FFFFFF`.
- **Panel**:
  - Ukuran: lebar `788px` pada desktop (dengan `max-w-[calc(100vw-24px)]` pada mobile/tablet agar responsif tanpa overflow).
  - Background: `#FFFFFF`, border: `1px solid #CDD7E6`, border-radius: `12px`, shadow: `0px 5px 18px rgba(35, 67, 107, 0.07)`.
  - Padding: `28px 30px 30px`.
  - Max-height: `calc(100vh - 100px)` dengan `overflow-y-auto` agar tetap aman di layar kecil.

### B. Daftar 5 Notifikasi Bawaan (Default Mock Items)
1. **Session**: "Session Baru Tersedia", category "Session", badge bg `#EFEEFF`, text `#5049F2`, icon `fa-solid fa-graduation-cap`.
2. **Week**: "Week 4 Telah Dibuka", category "Week", badge bg `#E6F6F2`, text `#159A7F`, icon `fa-solid fa-calendar-days`.
3. **Silabus**: "Silabus Pembelajaran Diperbarui", category "Silabus", badge bg `#FFF4DD`, text `#F29A00`, icon `fa-solid fa-book-open`.
4. **Quiz**: "Quiz Baru Tersedia", category "Quiz", badge bg `#FDECEF`, text `#F34E5D`, icon `fa-solid fa-brain`.
5. **Session User**: "Sesi Login Baru Terdeteksi", category "Session User", badge bg `#EAF2FF`, text `#3778EE`, icon `fa-solid fa-user`.

---

## 3. State Management (Alpine.js)

```javascript
{
  open: false,
  items: [...5 items default...],
  get unreadCount() {
    return this.items.filter(item => item.unread).length;
  },
  markAllAsRead() {
    this.items.forEach(item => { item.unread = false; });
  },
  markAsRead(id) {
    const target = this.items.find(item => item.id === id);
    if (target) target.unread = false;
  }
}
```

---

## 4. Langkah Eksekusi (Maksimal 5 Langkah Terbatas)

1. **Pembuatan Komponen**: Tulis berkas baru [src/views/partials/components/ui/notification/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/components/ui/notification/index.hbs) dengan markup popover, pointer CSS, dan Alpine state.
2. **Penyisipan ke Header User**: Edit [src/views/partials/user/app_bar/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/user/app_bar/index.hbs#L53-L55) untuk menyertakan komponen `notification/index`.
3. **Pemeriksaan Build & Lint**: Jalankan perintah `npm run build:css:prod` dan verifikasi bahwa tidak ada kompilasi CSS yang rusak.
4. **Verifikasi Tampilan UI**: Periksa render icon bell, trigger popover, status badge, tombol mark all read, dan 5 item notifikasi.
5. **Final Review & Selesai**: Dokumentasikan catatan penerapan dan siap digunakan di seluruh halaman shell user.
