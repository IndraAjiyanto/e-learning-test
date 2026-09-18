/**
 * Pemeriksa sisi ADMIN untuk program non-bootcamp: isi silabus (materi dan
 * tugas) dan layar penyelesaian.
 *
 * Berdiri sendiri, di luar design-check.mjs, karena pemeriksa itu masuk
 * sebagai student dari awal sampai akhir. Layar-layar di sini butuh admin,
 * dan menyisipkan login kedua ke sana berarti membongkar alurnya.
 *
 * Jalankan:
 *   COURSE=<uuid program non-bootcamp> ENROLLED=<jumlah pendaftar> \
 *     node test/ui/syllabus-admin-check.mjs
 *
 * COURSE wajib. Tanpa itu pemeriksa ini BERHENTI dengan status gagal, bukan
 * melewati diam-diam - `npm run test:ui` pernah lulus hijau padahal tidak
 * memeriksa apa pun karena variabelnya tidak diisi, dan itu tidak boleh
 * terulang.
 *
 * Yang diperiksa bukan rupa halaman melainkan datanya: materi dan tugas
 * betul-betul ditambahkan lewat formulir, dibaca ulang dari daftar, lalu
 * dihapus lagi supaya basis data kembali seperti semula.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:3069';
const COURSE = process.env.COURSE;
const ENROLLED = process.env.ENROLLED;
const EMAIL = process.env.ADMIN_EMAIL || 'super@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD || '12345678';

if (!COURSE) {
  console.error(
    'COURSE tidak diisi. Pemeriksa ini butuh satu program non-bootcamp:\n' +
      "  COURSE=$(docker exec elt-postgres psql -U postgres -d e_learning_migrasi_test -At \\\n" +
      "    -c \"SELECT id FROM course WHERE program_type <> 'bootcamp' LIMIT 1\") \\\n" +
      '    node test/ui/syllabus-admin-check.mjs',
  );
  process.exit(1);
}

let failed = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) failed++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  ' + extra : ''}`);
};

const browser = await chromium.launch();
const page = await browser.newPage();

// Kesalahan javascript dikumpulkan, TETAPI 404 berkas unggahan lama tidak
// dihitung: beberapa baris seed menunjuk gambar yang memang tidak pernah ada
// di disk (avatar admin, gambar kategori), dan itu muncul di setiap halaman
// lewat shell bersama - bukan perkara halaman silabus.
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  if (/status of 404/.test(m.text())) return;
  errors.push(m.text());
});
const missingAssets = new Set();
page.on('response', (r) => {
  if (r.status() < 400) return;
  const p = new URL(r.url()).pathname;
  if (p.startsWith('/asset/')) missingAssets.add(p);
  else ok(`unexpected ${r.status()} on ${p}`, false);
});

// ---- login
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
const loginForm = page.locator('form[action="/login"]');
await loginForm.locator('input[name="email"]').fill(EMAIL);
await loginForm.locator('input[name="password"]').fill(PASSWORD);
await Promise.all([
  page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 }),
  loginForm.locator('button[type="submit"], input[type="submit"]').first().click(),
]);
ok('login as admin', !page.url().includes('/login'), page.url());

// ---- daftar silabus: kedua layar baru harus TERJANGKAU dari sini
const listUrl = `${BASE}/program/syllabus/manage/${COURSE}`;
const listResp = await page.goto(listUrl, { waitUntil: 'networkidle' });
ok('syllabus list responds 200', listResp.status() === 200, String(listResp.status()));

const contentLinks = page.locator('a:has-text("Content")');
const nContent = await contentLinks.count();
ok('every syllabus links to its content page', nContent > 0, `${nContent} tautan`);
ok('list links to the completion screen',
  (await page.locator('a:has-text("See who completed what")').count()) === 1);

if (nContent === 0) {
  console.error('\nProgram ini belum punya satu silabus pun - tidak ada yang bisa diisi.');
  await browser.close();
  process.exit(1);
}

// ---- isi silabus
await contentLinks.first().click();
await page.waitForLoadState('networkidle');
const detailUrl = page.url();
ok('content page opens', /\/manage\/[^/]+\/[0-9a-f-]{36}$/.test(detailUrl), detailUrl);
ok('content page has a Materials heading',
  (await page.getByRole('heading', { name: 'Materials' }).count()) === 1);
ok('content page has an Assignments heading',
  (await page.getByRole('heading', { name: 'Assignments' }).count()) === 1);

// Satu sumber berkas saja yang terlihat pada satu saat. Kalau keduanya muncul,
// admin bisa mengisi unggahan DAN tautan sekaligus dan salah satunya diam-diam
// diabaikan.
const linkField = page.locator('form[action$="/material"] input[name="link"]');
const fileField = page.locator('form[action$="/material"] input[name="upload"]');
ok('link field is hidden while the type is PDF', !(await linkField.isVisible()));
await page.locator('form[action$="/material"] select[name="fileType"]').selectOption('video');
await page.waitForTimeout(150);
ok('link field appears for video', await linkField.isVisible());
ok('upload field is hidden for video', !(await fileField.isVisible()));

const stamp = Date.now();
const MAT = `PROBE material ${stamp}`;
await page.locator('form[action$="/material"] input[name="title"]').fill(MAT);
await linkField.fill('https://example.com/probe-slides');
await page.locator('form[action$="/material"] button[type="submit"]').click();
await page.waitForLoadState('networkidle');
ok('a linked material is saved and read back', (await page.content()).includes(MAT));

const TASK = `PROBE assignment ${stamp}`;
await page.locator('form[action$="/assignment"] input[name="title"]').fill(TASK);
await page.locator('form[action$="/assignment"] input[name="link"]').fill('https://example.com/probe-task');
await page.locator('form[action$="/assignment"] button[type="submit"]').click();
await page.waitForLoadState('networkidle');
ok('a linked assignment is saved and read back', (await page.content()).includes(TASK));

// Unggahan PDF sungguhan - jalur berkasnya berbeda dari jalur tautan, jadi
// lulusnya tautan tidak membuktikan apa pun tentang unggahan.
const pdfPath = path.join(os.tmpdir(), `probe-syllabus-${stamp}.pdf`);
fs.writeFileSync(pdfPath, Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
  '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
  '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 99 99]>>endobj\n' +
  'trailer<</Root 1 0 R>>\n%%EOF\n'));
await page.locator('form[action$="/material"] select[name="fileType"]').selectOption('pdf');
await page.waitForTimeout(150);
const PDFMAT = `PROBE pdf ${stamp}`;
await page.locator('form[action$="/material"] input[name="title"]').fill(PDFMAT);
await fileField.setInputFiles(pdfPath);
await page.locator('form[action$="/material"] button[type="submit"]').click();
await page.waitForLoadState('networkidle');
ok('an uploaded PDF material is saved and read back', (await page.content()).includes(PDFMAT));

// Cacah di daftar dibaca ulang: bukti barisnya benar-benar masuk basis data,
// bukan hanya tergambar di halaman yang barusan.
await page.goto(listUrl, { waitUntil: 'networkidle' });
const row = await page.locator('li:has(a:has-text("Content"))').first().innerText();
const mats = Number((row.match(/(\d+)\s*mat/) || [])[1]);
const tasks = Number((row.match(/(\d+)\s*task/) || [])[1]);
ok('the list counts the new material', mats >= 2, `${mats} mat`);
ok('the list counts the new assignment', tasks >= 1, `${tasks} task`);

// ---- layar penyelesaian
const compResp = await page.goto(`${BASE}/program/syllabus/completion/${COURSE}`, { waitUntil: 'networkidle' });
ok('completion responds 200', compResp.status() === 200, String(compResp.status()));
ok('completion has its heading',
  (await page.getByRole('heading', { name: 'Completion' }).count()) === 1);

// Inti layar ini: student yang BELUM mengerjakan apa pun tetap terlihat.
// Kalau barisnya berasal dari baris progres, merekalah yang hilang - padahal
// justru mereka yang dicari admin.
if (ENROLLED !== undefined) {
  const bodyRows = await page.locator('table tbody tr').count();
  ok('every enrolled student is listed, not only those with progress',
    bodyRows === Number(ENROLLED), `${bodyRows} baris vs ${ENROLLED} terdaftar`);
} else {
  console.log('SKIP  jumlah baris tidak dibandingkan (ENROLLED tidak diisi)');
}
// Tabelnya - bukan seluruh halaman - yang tidak boleh memuat absensi.
// Kepala halaman justru MENYEBUT kata itu, untuk mengatakan bahwa program
// mandiri tidak punya absensi, dan itu memang yang diinginkan.
ok('the completion table holds no attendance column',
  !/attendance/i.test(await page.locator('table').innerText().catch(() => '')));
ok('the page says outright that there is no attendance',
  /no attendance/i.test(await page.locator('body').innerText()));

// ---- bersihkan: basis data harus kembali seperti sebelum pemeriksa jalan
await page.goto(detailUrl, { waitUntil: 'networkidle' });
page.on('dialog', (d) => d.accept());
for (const sel of ['form[action*="/material/"][action$="/delete"] button',
                   'form[action*="/assignment/"][action$="/delete"] button']) {
  while ((await page.locator(sel).count()) > 0) {
    await page.locator(sel).first().click();
    await page.waitForLoadState('networkidle');
  }
}
const after = await page.content();
ok('probe materials are gone', !after.includes(MAT) && !after.includes(PDFMAT));
ok('probe assignment is gone', !after.includes(TASK));
fs.rmSync(pdfPath, { force: true });

ok('no javascript errors', errors.length === 0, errors.slice(0, 2).join(' | '));
if (missingAssets.size) {
  console.log(`\nCATATAN: ${missingAssets.size} berkas seed hilang di disk (bukan perkara silabus):`);
  for (const p of missingAssets) console.log('  404', p);
}

await browser.close();
console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
