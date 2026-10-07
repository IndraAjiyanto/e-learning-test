/**
 * Sumber asal ("dari mana Anda mengetahui program ini") untuk payments dan
 * registrations.
 *
 * Isi list ini WAJIB sama persis dengan enum Postgres
 * `payments_referalsource_enum` dan `registrations_referal_source_enum`
 * (src/database/migrations/1788100000000-RefactorDatabaseServer.ts). Kolomnya
 * bertipe enum, bukan varchar, jadi nilai yang bukan member list akan membuat
 * INSERT ditolak Postgres.
 *
 * Kenapa perlu satu konstanta: sebelum file ini, list yang sama ditulis ulang
 * di empat tempat - tiga kali di courses.controller.ts, sekali lagi sebagai
 * `validSources` di payments.controller.ts - sementara form pembayaran
 * (/payment/registration) justru punya daftar sendiri yang TIDAK cocok dengan
 * enum. Akibatnya pilihan "Social Media" gagal disimpan lewat jalur Xendit
 * (INSERT ditolak) dan diam-diam tersimpan jadi "Other" lewat jalur manual.
 *
 * Tipe-nya `string[]` biasa, bukan `as const`, supaya bisa langsung dipasang ke
 * `@Column({ enum: ... })` TypeORM tanpa friksi readonly.
 */
export const REFERAL_SOURCES: string[] = [
  'Instagram',
  'TikTok',
  'LinkedIn',
  'Friends',
  'University',
  'WhatsApp Group',
  'Webinar/Event',
  'Website',
  'Other',
];

/**
 * Penjaga untuk nilai yang datang dari form (req.body) atau draft localStorage.
 *
 * Form boleh saja mengirim apa saja - validasinya hanya di sisi client, jadi
 * nilainya harus diperiksa ulang sebelum menyentuh kolom enum. Nilai yang tidak
 * dikenal dikembalikan pemanggil sebagai `null` (atau fallback yang lebih
 * bermakna seperti 'Other'), bukan diteruskan mentah ke database.
 */
export function isReferalSource(value: unknown): boolean {
  return typeof value === 'string' && REFERAL_SOURCES.includes(value);
}

/**
 * Key i18n untuk label tiap sumber, TANPA prefix `test.payment.form.sourceOptions.`
 * supaya daftar ini tidak perlu diubah lagi kalau namespace-nya dipindah.
 *
 * Yang diterjemahkan hanya label yang tampil. Nilai yang dikirim ke server dan
 * disimpan ke kolom enum tetap versi kanonis dari `REFERAL_SOURCES` di atas,
 * jadi menerjemahkan label tidak mungkin mengubah isi database.
 */
export const REFERAL_SOURCE_LABEL_KEYS: Record<string, string> = {
  Instagram: 'instagram',
  TikTok: 'tiktok',
  LinkedIn: 'linkedin',
  Friends: 'friends',
  University: 'university',
  'WhatsApp Group': 'whatsappGroup',
  'Webinar/Event': 'webinarEvent',
  Website: 'website',
  Other: 'other',
};

export interface ReferalSourceOption {
  /** Nilai kanonis untuk kolom enum - jangan diterjemahkan. */
  value: string;
  /** Key i18n lengkap untuk label yang ditampilkan. */
  labelKey: string;
}

/**
 * Opsi dropdown siap pakai untuk template yang sudah memakai i18n.
 *
 * Dipakai halaman pembayaran (/payment/registration). Halaman free-program
 * (/daftar-program) sengaja tetap memakai `REFERAL_SOURCES` apa adanya karena
 * partial-nya belum punya i18n, dan bentuk `string[]` di sana tidak boleh ikut
 * berubah.
 */
export function getReferalSourceI18nOptions(): ReferalSourceOption[] {
  return REFERAL_SOURCES.map((value) => ({
    value,
    labelKey: `test.payment.form.sourceOptions.${REFERAL_SOURCE_LABEL_KEYS[value]}`,
  }));
}
