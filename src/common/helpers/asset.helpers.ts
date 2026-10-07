/**
 * Helper Handlebars untuk cache-busting aset statis.
 * Lokasi: src/common/helpers/asset.helpers.ts
 *
 * - assetV(path) → suffix "?v=<mtime epoch ms>" untuk file di src/common/public
 *
 * Kenapa ada: nginx menyajikan .js/.css dengan `expires 7d` (nginx.conf),
 * sedangkan referensi aset di layouts/main.hbs tidak berversi. Browser yang
 * meng-cache aset sebelum deploy tidak pernah mengunduh ulang, sehingga
 * perubahan CSS/JS (mis. fitur collapse sidebar admin) tidak sampai ke klien.
 *
 * Nilai versi diambil dari mtime file: setiap kali file berubah, URL ikut
 * berubah dan cache lama otomatis terbuang — tanpa bump manual seperti
 * `invoice-pdf.bundle.js?v=7`. statSync cukup murah (2x per render) dan tidak
 * di-cache supaya hasil build ulang saat development langsung terlihat.
 *
 * Pemakaian di template — triple-stash, bukan double-stash:
 * Handlebars men-escape "=" menjadi "&#x3D;" pada {{...}}, sehingga URL jadi
 * "?v&#x3D;...". Browser memang men-decode-nya kembali, tapi outputnya berantakan.
 * Input helper ini literal di template (bukan user input), jadi {{{...}}} aman.
 *
 *   <link href="/public/css/style.css{{{assetV 'css/style.css'}}}" rel="stylesheet">
 */
import { statSync } from 'fs';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'src', 'common', 'public');

export const assetHelpers = {
  /**
   * Return "?v=<mtime>" untuk aset di bawah src/common/public.
   * Return string kosong bila file tidak ditemukan (URL tetap valid, tanpa versi).
   */
  assetV: (relPath: string): string => {
    try {
      return `?v=${Math.floor(statSync(join(PUBLIC_DIR, relPath)).mtimeMs)}`;
    } catch {
      return '';
    }
  },
};

export default assetHelpers;
