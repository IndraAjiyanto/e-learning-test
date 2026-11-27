/**
 * Isomorphic WA helper — dipakai Server (Handlebars) & Client (Alpine)
 * Single source of truth untuk formatWa / waLink
 */

/**
 * Regex validasi nomor telepon/WhatsApp Indonesia:
 * - Diawali: +628, 628, atau 08
 * - Panjang nomor pelanggan setelah 8: 8 s/d 12 digit (total 10 s/d 15 karakter)
 */
export const INDONESIAN_PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;

export function isValidIndonesianPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.trim().replace(/[\s-]/g, '');
  return INDONESIAN_PHONE_REGEX.test(cleaned);
}

export function formatWa(nomor: string): string {
  if (!nomor) return '';
  const n = nomor.replace(/\D/g, '');
  if (n.startsWith('0')) return '62' + n.slice(1);
  if (n.startsWith('8')) return '62' + n;
  if (n.startsWith('62')) return n;
  return n;
}

/**
 * Normalisasi nomor HP/WhatsApp ke format lokal standar '08xxxxxxxxxx'.
 * Contoh:
 * - '+628123456789' -> '08123456789'
 * - '628123456789'  -> '08123456789'
 * - '08123456789'   -> '08123456789'
 * - '8123456789'    -> '08123456789'
 */
export function normalizePhone08(nomor: string): string {
  if (!nomor) return '';
  const n = nomor.replace(/\D/g, '');
  if (n.startsWith('62')) return '0' + n.slice(2);
  if (n.startsWith('0')) return n;
  if (n.startsWith('8')) return '0' + n;
  return n;
}

export function waLink(phone: string, message?: string): string {
  const p = formatWa(phone || '');
  if (!p) return 'https://wa.me/';
  if (typeof message === 'string' && message.trim().length > 0) {
    return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${p}`;
}

export const waHelpers = {
  formatWa,
  waLink,
  normalizePhone08,
  isValidIndonesianPhone,
};
