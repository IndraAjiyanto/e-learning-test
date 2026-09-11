import type { Request } from 'express';

export interface ToastPayload {
  title: string;
  description: string;
}

const TOAST_FLASH_KEY = 'toast';

/**
 * Kirim toast sukses untuk komponen ui/super_admin/toast/success.
 *
 * Judul & deskripsi dibawa bersama dalam satu payload supaya copy notifikasi
 * hidup di controller saja, tidak terbelah antara controller & .hbs.
 *
 * Sengaja memakai key `toast`, bukan `success`: partial global `sweetalert`
 * merender flash `success` sebagai toast SweetAlert sendiri, jadi memakai
 * `success` akan memunculkan dua notifikasi untuk satu aksi.
 */
export function flashToast(
  req: Request,
  title: string,
  description: string,
): void {
  req.flash(TOAST_FLASH_KEY, JSON.stringify({ title, description }));
}

/** Baca flash toast (sekali pakai); null bila kosong atau isinya bukan JSON valid. */
export function readFlashToast(req: Request): ToastPayload | null {
  const [raw] = req.flash(TOAST_FLASH_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ToastPayload>;
    if (!parsed?.title) return null;

    return { title: parsed.title, description: parsed.description ?? '' };
  } catch {
    return null;
  }
}
