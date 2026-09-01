/**
 * Isomorphic WA helper — dipakai Server (Handlebars) & Client (Alpine)
 * Single source of truth untuk formatWa / waLink
 */
export function formatWa(nomor: string): string {
  if (!nomor) return '';
  const n = nomor.replace(/\D/g, '');
  if (n.startsWith('0')) return '62' + n.slice(1);
  if (n.startsWith('8')) return '62' + n;
  if (n.startsWith('62')) return n;
  return n;
}

export function waLink(phone: string, message?: string): string {
  const p = formatWa(phone || '');
  if (!p) return 'https://wa.me/';
  if (message) return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
  return `https://wa.me/${p}`;
}

export const waHelpers = { formatWa, waLink };
