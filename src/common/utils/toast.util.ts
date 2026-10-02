import type { Request } from 'express';

export interface ToastPayload {
  title: string;
  description: string;
}

const TOAST_FLASH_KEY = 'toast';
const TOAST_ERROR_FLASH_KEY = 'toastError';

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

/**
 * Kirim toast gagal untuk komponen ui/super_admin/toast/error.
 *
 * Kembaran flashToast di atas. Key-nya `toastError`, bukan `error`: partial
 * global `sweetalert` masih merender flash `error` sebagai toast SweetAlert
 * sendiri, jadi memakai key yang sama akan memunculkan dua notifikasi untuk
 * satu kegagalan.
 */
export function flashToastError(
  req: Request,
  title: string,
  description: string,
): void {
  req.flash(TOAST_ERROR_FLASH_KEY, JSON.stringify({ title, description }));
}

/** Baca flash toast gagal (sekali pakai); null bila kosong atau bukan JSON valid. */
export function readFlashToastError(req: Request): ToastPayload | null {
  const [raw] = req.flash(TOAST_ERROR_FLASH_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ToastPayload>;
    if (!parsed?.title) return null;

    return { title: parsed.title, description: parsed.description ?? '' };
  } catch {
    return null;
  }
}

const TOAST_WARNING_FLASH_KEY = 'toastWarning';

/**
 * Kirim toast warning untuk komponen ui/super_admin/toast/warning.
 */
export function flashToastWarning(
  req: Request,
  title: string,
  description: string,
): void {
  req.flash(TOAST_WARNING_FLASH_KEY, JSON.stringify({ title, description }));
}

/** Baca flash toast warning (sekali pakai); null bila kosong atau bukan JSON valid. */
export function readFlashToastWarning(req: Request): ToastPayload | null {
  const [raw] = req.flash(TOAST_WARNING_FLASH_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ToastPayload>;
    if (!parsed?.title) return null;

    return { title: parsed.title, description: parsed.description ?? '' };
  } catch {
    return null;
  }
}

