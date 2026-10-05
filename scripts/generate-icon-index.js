/**
 * Membangun indeks ikon Font Awesome Free untuk komponen
 * ui/super_admin/form/icon_picker.
 *
 * Sumber: @fortawesome/fontawesome-free/metadata/icon-families.json (±5 MB,
 * berisi raw SVG). Yang dibutuhkan picker hanya nama, label, gaya bebas, dan
 * kata kunci pencarian — jadi file itu diringkas jadi satu aset kecil.
 *
 * Format baris (array, bukan objek, supaya payload-nya minimal):
 *   [name, label, styles, terms]
 *   styles : gabungan huruf gaya bebas — 's' solid, 'r' regular, 'b' brands
 *   terms  : kata kunci pencarian tambahan (alias + search terms FA), sudah
 *            dibuang yang duplikat dengan name/label
 *
 * Jalan otomatis lewat `npm run build` dan `npm run start:dev`.
 */
const fs = require('fs');
const path = require('path');

const SRC = require.resolve(
  '@fortawesome/fontawesome-free/metadata/icon-families.json',
);
const OUT = path.join(
  __dirname,
  '..',
  'src',
  'common',
  'public',
  'assets',
  'fa-icons.json',
);

// Maksimal kata kunci per ikon. FA memberi sampai puluhan term; yang paling
// relevan ada di depan, dan memangkasnya memotong ukuran aset drastis.
const MAX_TERMS = 8;

const STYLE_CODE = { solid: 's', regular: 'r', brands: 'b' };

function build() {
  const meta = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  const rows = [];

  for (const [name, def] of Object.entries(meta)) {
    const classic = def?.svgs?.classic;
    if (!classic) continue;

    const styles = Object.keys(classic)
      .map((s) => STYLE_CODE[s])
      .filter(Boolean)
      .join('');
    if (!styles) continue;

    const label = def.label || name;

    // Kata yang sudah ada di name/label tidak perlu diulang sebagai term —
    // pencarian tetap mengecek keduanya.
    const covered = new Set(
      `${name} ${label}`.toLowerCase().split(/[\s-]+/).filter(Boolean),
    );

    const terms = [
      ...(def.aliases?.names || []),
      ...(def.search?.terms || []),
    ]
      .map((t) => String(t).toLowerCase().trim())
      .filter((t) => t && !covered.has(t));

    rows.push([name, label, styles, [...new Set(terms)].slice(0, MAX_TERMS)]);
  }

  // Urutan ini juga urutan tampil saat kotak pencarian masih kosong. Alfabetis
  // murni membuat panel terbuka pada fa-0, fa-1, fa-2 ... — ikon angka & huruf
  // tunggal jarang dipakai dan memberi kesan pertama yang buruk, jadi mereka
  // didorong ke belakang.
  const trivial = (name) => /^[0-9a-z]$/.test(name);
  rows.sort(
    (a, b) =>
      Number(trivial(a[0])) - Number(trivial(b[0])) || a[0].localeCompare(b[0]),
  );

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(rows));

  const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(`fa-icons.json: ${rows.length} icons, ${kb} KB`);
}

build();
