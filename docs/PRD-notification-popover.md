# Product Requirements Document (PRD) - User Header Notification Pop-Up

## 1. Executive Summary & Objective
Implementasi fitur Notification Pop-up pada Header User ([src/views/partials/user/app_bar/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/user/app_bar/index.hbs#L53-L55)) berdasarkan task ClickUp [z8pbk8xvjz](https://app.clickup.com/t/90182814122/z8pbk8xvjz) dan desain token CSS Figma. Komponen ini menampilkan daftar notifikasi terkini kepada user terautentikasi (`role: user`) yang dikelompokkan ke dalam 5 kategori bisnis utama dengan kapabilitas penandaan status baca (*read/unread*).

---

## 2. Analisis & Gap Analisis Kode Saat Ini

| Aspek | Kondisi Saat Ini di Repositori | Kebutuhan Desain / Task ClickUp | Gap & Rencana Solusi |
|---|---|---|---|
| **Header Notification Anchor** | Button statis tanpa interaksi di [user/app_bar/index.hbs:53-55](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/user/app_bar/index.hbs#L53-L55) | Button memiliki unread badge count dan memicu floating popover saat diklik | Tambahkan container interaktif `x-data`, badge counter, dan trigger toggle |
| **Komponen UI Popover** | Belum ada komponen notifikasi di `src/views/partials/components/ui/` | Panel popover (788px desktop, arrow pointer, header, list item, CTA view all) | Buat komponen tunggal baru di [src/views/partials/components/ui/notification/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/components/ui/notification/index.hbs) |
| **Kategori Data Notifikasi** | Entity domain sudah ada ([session](file:///E:/Wiratek%20Projek/clone%20e-learning/src/entities/session.entity.ts), [weeks](file:///E:/Wiratek%20Projek/clone%20e-learning/src/entities/weeks.entity.ts), [syllabus](file:///E:/Wiratek%20Projek/clone%20e-learning/src/entities/syllabus.entity.ts), [quiz](file:///E:/Wiratek%20Projek/clone%20e-learning/src/entities/quiz.entity.ts), [user_activity](file:///E:/Wiratek%20Projek/clone%20e-learning/src/entities/user_activity.entity.ts)) | 5 Kategori visual: `Session`, `Week`, `Silabus`, `Quiz`, `Session User` | Siapkan mapper konfigurasi warna, ikon, dan label untuk 5 kategori ini |
| **State Management** | Tidak ada state notifikasi di client-side | Toggle open/close, click outside dismiss, mark all as read, unread dot tracking | Gunakan native Alpine.js state di dalam partial tanpa library eksternal baru |

---

## 3. Alur Bisnis Notifikasi (5 Tahapan)

1. **Input / Maker (Trigger Generator)**: Event sistem terjadi ketika ada entitas pembelajaran baru dirilis (`Session`, `Weeks`, `Syllabus`, `Quiz`) atau aktivitas login user tercatat di [UserActivity](file:///E:/Wiratek%20Projek/clone%20e-learning/src/entities/user_activity.entity.ts).
2. **Antrean Notifikasi**: Sistem menyajikan daftar item notifikasi terbaru (maksimal 5 item pada popover ringkas) yang diurutkan descending berdasarkan waktu (`timestamp` terbaru).
3. **Penyajian UI & Unread Indicator**: Icon bell pada header menampilkan red/blue unread badge jika terdapat item unread. Tiap baris notifikasi unread memiliki visual status blue dot `#1764F6`.
4. **Approval / User Interaction**: User mengklik icon bell untuk membuka popover, membaca notifikasi, atau menekan "Mark all as read".
5. **Post-Condition / Selesai**: Seluruh badge unread ter-update menjadi 0, blue dot hilang, dan user dapat mengklik "View all notifications" untuk berpindah ke rute riwayat lengkap jika dibutuhkan.

---

## 4. Spesifikasi 5 Kategori Notifikasi (CSS & Design Match)

1. **Session**
   - Icon: `graduation-cap` (FontAwesome `fa-graduation-cap` / Phosphor `ph-graduation-cap`)
   - Badge Container: Background `#EFEEFF`, Text `#5049F2`
   - Icon Background: Circle `#EFEEFF`, Stroke `#5049F2`
2. **Week**
   - Icon: `calendar-days` (FontAwesome `fa-calendar-days` / Phosphor `ph-calendar-blank`)
   - Badge Container: Background `#E6F6F2`, Text `#159A7F`
   - Icon Background: Circle `#E6F6F2`, Stroke `#159A7F`
3. **Silabus**
   - Icon: `book-open` (FontAwesome `fa-book-open` / Phosphor `ph-book-open`)
   - Badge Container: Background `#FFF4DD`, Text `#F29A00`
   - Icon Background: Circle `#FFF4DD`, Stroke `#F29A00`
4. **Quiz**
   - Icon: `brain` (FontAwesome `fa-brain` / Phosphor `ph-brain`)
   - Badge Container: Background `#FDECEF`, Text `#F34E5D`
   - Icon Background: Circle `#FDECEF`, Stroke `#F34E5D`
5. **Session User**
   - Icon: `user-round` (FontAwesome `fa-user` / Phosphor `ph-user`)
   - Badge Container: Background `#EAF2FF`, Text `#3778EE`
   - Icon Background: Circle `#EAF2FF`, Stroke `#3778EE`

---

## 5. Batasan & Penerapan Prinsip Ponytail (Full)
- **Minimal Files**: Cukup 1 partial baru [src/views/partials/components/ui/notification/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/components/ui/notification/index.hbs) yang di-include langsung ke [src/views/partials/user/app_bar/index.hbs](file:///E:/Wiratek%20Projek/clone%20e-learning/src/views/partials/user/app_bar/index.hbs).
- **Zero New Dependencies**: Menggunakan Alpine.js dan Tailwind CSS yang sudah terpasang.
- **Client-Side Graceful Fallback**: Mendukung data props statis/mock bawaan jika API backend belum terintegrasi, serta siap menerima endpoint fetch via Alpine `init()`.
