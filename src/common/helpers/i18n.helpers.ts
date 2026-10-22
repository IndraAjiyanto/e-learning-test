import { I18nContext } from 'nestjs-i18n';

/**
 * Kunci yang terjemahannya tidak ditemukan, dicatat sekali saja.
 *
 * Helper di bawah mengembalikan string kosong untuk kunci semacam itu, dan
 * diam-diam kosong berarti kunci yang hilang tidak pernah ketahuan. Peringatan
 * ini yang menggantikannya - satu baris per kunci, bukan per permintaan.
 */
const missingKeys = new Set<string>();

/**
 * Handlebars selalu menyisipkan objek options sebagai argumen terakhir helper.
 * Hash parameter ada di `options.hash`, bukan di level atas options.
 */
const readHashParams = (rest: unknown[]): Record<string, unknown> => {
  const last = rest[rest.length - 1];
  if (!last || typeof last !== 'object') return {};
  const hash = (last as { hash?: Record<string, unknown> }).hash;
  return hash && typeof hash === 'object' ? hash : {};
};

export const i18nHelpers = {
  /**
   * Terjemahkan `key`, lalu ganti token `{nama}` dengan nilai yang dikirim
   * sebagai hash parameter Handlebars.
   *
   *   {{t 'test.syllabus.quiz.passedMessage' minScore=minScore}}
   *
   * Bahasa berbeda menaruh angka di posisi berbeda, jadi menyisipkan angka
   * dari luar kalimat (mis. "Nilai minimal 80 untuk lulus" dirakit manual di
   * template) tidak bisa dipakai untuk tiga bahasa sekaligus. Token di dalam
   * terjemahan yang menaruh angkanya sendiri.
   */
  t: (key: string, ...rest: unknown[]) => {
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
            console.warn(
              `[i18n] terjemahan tidak ditemukan untuk kunci: ${key}`,
            );
          }
          return '';
        }

        if (typeof value !== 'string' || value === '') return value;

        return value.replace(/\{(\w+)\}/g, (match, name: string): string => {
          const params = readHashParams(rest);
          const replacement = params[name];
          if (replacement === undefined || replacement === null) return match;
          // Hanya nilai sederhana yang aman diserialkan jadi teks. Objek
          // dibiarkan apa adanya supaya tidak muncul "[object Object]".
          if (typeof replacement === 'string') return replacement;
          if (
            typeof replacement === 'number' ||
            typeof replacement === 'boolean'
          ) {
            return String(replacement);
          }
          return match;
        });
      }
    } catch {
      // ignore
    }
    return '';
  },
};
