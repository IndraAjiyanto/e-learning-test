import { I18nContext } from 'nestjs-i18n';

/**
 * Kunci yang terjemahannya tidak ditemukan, dicatat sekali saja.
 *
 * Helper di bawah mengembalikan string kosong untuk kunci semacam itu, dan
 * diam-diam kosong berarti kunci yang hilang tidak pernah ketahuan. Peringatan
 * ini yang menggantikannya - satu baris per kunci, bukan per permintaan.
 */
const missingKeys = new Set<string>();

export const i18nHelpers = {
  t: (key: string) => {
    try {
      const i18n = I18nContext.current();
      if (i18n) {
        const value = i18n.t(key);

        // nestjs-i18n mengembalikan KUNCI-nya sendiri ketika terjemahannya
        // tidak ada. Dulu nilai itu diteruskan apa adanya, dengan dua akibat:
        //
        // 1. Kuncinya ikut tercetak ke layar. "test.profile.editPassword.
        //    subtitle" sempat tampil sebagai subjudul halaman ganti password.
        // 2. Pola {{default (t 'kunci') 'Cadangan'}} yang dipakai di banyak
        //    tempat tidak pernah berlaku - helper `default` melihat kunci itu
        //    sebagai nilai yang sah, jadi teks cadangannya tidak pernah
        //    terpakai justru pada satu-satunya keadaan yang membutuhkannya.
        //
        // Dikosongkan supaya cadangannya yang jalan, dan kalau memang tidak ada
        // cadangan, yang tampil ruang kosong - bukan nama kunci.
        if (typeof value === 'string' && value === key) {
          if (!missingKeys.has(key)) {
            missingKeys.add(key);
            console.warn(`[i18n] terjemahan tidak ditemukan untuk kunci: ${key}`);
          }
          return '';
        }
        return value;
      }
    } catch (e) {}
    return '';
  },
};
