/**
 * Logbook silabus: student menulis, mentor menyetujui, silabus berikutnya
 * TERBUKA.
 *
 * Yang dibuktikan di sini bukan sekadar "formulirnya ada", melainkan bahwa
 * JALAN BUNTU-nya hilang. Kalau program menyalakan logbook,
 * SyllabusService.isDone() menuntut `logbookOk`; sebelum ada layar ini tidak
 * ada satu pun cara mengisinya, jadi student bisa menekan "Mark complete" dan
 * silabus berikutnya terkunci selamanya. Keadaan itu ditemukan hidup di basis
 * data lokal, bukan dikarang untuk uji ini.
 *
 * Jalankan:
 *   COURSE=<uuid SPL dengan logbook MENYALA> node test/ui/syllabus-logbook-check.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:3069';
const COURSE = process.env.COURSE;
const STUDENT = process.env.STUDENT_EMAIL || 'indra@gmail.com';
const ADMIN = process.env.ADMIN_EMAIL || 'super@gmail.com';
const PASSWORD = '12345678';

if (!COURSE) {
  console.error('COURSE tidak diisi. Isi dengan uuid program SPL yang logbooknya menyala.');
  process.exit(1);
}

let failed = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) failed++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  ' + extra : ''}`);
};

const APPROVED = /Approved|Disetujui|承認済み/i;

const browser = await chromium.launch();
async function login(email) {
  const page = await (await browser.newContext()).newPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  const f = page.locator('form[action="/login"]');
  await f.locator('input[name="email"]').fill(email);
  await f.locator('input[name="password"]').fill(PASSWORD);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 }),
    f.locator('button[type="submit"], input[type="submit"]').first().click(),
  ]);
  return page;
}

const admin = await login(ADMIN);
const student = await login(STUDENT);
ok('both roles logged in', !admin.url().includes('/login') && !student.url().includes('/login'));

// ---- MENYIAPKAN keadaan awal, bukan mengandaikannya
//
// Pemeriksa ini butuh logbook silabus pertama dalam keadaan BELUM disetujui -
// itulah jalan buntu yang mau dibuktikan hilang. Pemeriksa lain
// (syllabus-completion-check) memakai program yang sama dan meninggalkannya
// dalam keadaan disetujui, jadi kalau ia jalan lebih dulu, pemeriksa ini akan
// gagal karena urutan menjalankan - bukan karena aplikasinya salah.
//
// Menyiapkan sendiri lebih baik daripada menuntut urutan tertentu: pemeriksa
// yang hasilnya bergantung pada apa yang kebetulan jalan sebelumnya tidak bisa
// dipercaya siapa pun.
// Yang ditekan harus tombol milik KARTU yang berstatus Approved, bukan tombol
// pertama di halaman: kartunya diurutkan terbaru dulu, jadi `.first()` bisa
// mengenai logbook yang memang sudah ditolak dan persiapannya tidak
// mengubah apa pun. Kesalahan itu sempat terjadi dan membuat pemeriksa ini
// tampak gagal padahal aplikasinya benar.
for (let guard = 0; guard < 10; guard++) {
  await admin.goto(`${BASE}/program/syllabus/logbook/${COURSE}`, { waitUntil: 'networkidle' });
  const approvedCard = admin
    .locator('div.rounded-xl.border')
    .filter({ hasText: /Approved/ })
    .filter({ has: admin.locator('button[value="rejected"]') });
  if ((await approvedCard.count()) === 0) break;
  await approvedCard.first().locator('button[value="rejected"]').click();
  await admin.waitForLoadState('networkidle');
}

// ---- silabus program ini, urut
await admin.goto(`${BASE}/program/syllabus/manage/${COURSE}`, { waitUntil: 'networkidle' });
const links = await admin.locator('a:has-text("Content")').evaluateAll((as) =>
  as.map((a) => a.getAttribute('href')));
ok('the program has at least two syllabi', links.length >= 2, `${links.length}`);
const first = links[0].split('/').pop();
const second = links[1].split('/').pop();

// ---- student: silabus 1 terbuka, logbooknya diminta
const r1 = await student.goto(`${BASE}/program/syllabus/detail/${first}`, { waitUntil: 'networkidle' });
ok('syllabus 1 opens for the student', !student.url().includes('myProgram'), student.url());
ok('the logbook form is asked for', await student.locator('form[action$="/logbook"]').count() === 1);

// ---- student menandai selesai (kalau belum) lalu menulis logbook
const markComplete = student.locator('form[action$="/complete"] button');
if (await markComplete.count() > 0) {
  await markComplete.click();
  await student.waitForLoadState('networkidle');
}

// INTI: sudah "complete", tetapi silabus 2 MASIH TERKUNCI karena logbook
// belum disetujui. Inilah jalan buntu yang dilaporkan.
await student.goto(`${BASE}/program/syllabus/detail/${second}`, { waitUntil: 'networkidle' });
ok('syllabus 2 is still locked while the logbook is unapproved',
   student.url().includes('myProgram'), student.url());

await student.goto(`${BASE}/program/syllabus/detail/${first}`, { waitUntil: 'networkidle' });
const lf = student.locator('form[action$="/logbook"]');
const ACT = `PROBE activity ${Date.now()}`;
await lf.locator('input[name="activity"]').fill(ACT);
await lf.locator('textarea[name="activityDetails"]').fill('Membaca materi dan mengerjakan latihan.');
await lf.locator('textarea[name="obstacles"]').fill('Belum ada.');
await lf.locator('input[name="otherDocumentation"]').fill('https://example.com/probe-doc');
await lf.locator('button[type="submit"]').click();
await student.waitForLoadState('networkidle');
const sBody = await student.locator('body').innerText();
// Isinya kembali ke dalam `value` input, dan innerText TIDAK membaca itu.
// Kesalahan yang sama pernah terjadi pada judul silabus di layar admin -
// dicatat di sini supaya tidak terulang ketiga kalinya.
const savedActivity = await student
  .locator('form[action$="/logbook"] input[name="activity"]')
  .inputValue()
  .catch(() => '');
ok('the logbook is saved and read back', savedActivity === ACT, savedActivity);
ok('it starts under review', /Under Review|Dalam Tinjauan|審査中/i.test(sBody));
ok('no untranslated i18n keys leaked', !/test\.[a-z]/i.test(sBody),
   sBody.match(/test\.[a-zA-Z.]+/)?.[0] || '');

// ---- mentor melihatnya dan menyetujui
await admin.goto(`${BASE}/program/syllabus/manage/${COURSE}`, { waitUntil: 'networkidle' });
const logbookLink = admin.locator('a:has-text("Logbooks")');
ok('the syllabus list links to the logbook screen', await logbookLink.count() === 1);
await logbookLink.click();
await admin.waitForLoadState('networkidle');
ok('the logbook screen opens', admin.url().includes('/syllabus/logbook/'), admin.url());

const card = admin.locator('div', { hasText: ACT }).last();
ok('mentor sees the submitted logbook', (await admin.locator('body').innerText()).includes(ACT));
ok('mentor sees its details too',
   (await admin.locator('body').innerText()).includes('Membaca materi'));

// Disetujui lewat KARTU yang memuat logbook percobaan ini, bukan kartu pertama
// di halaman. Kartunya diurutkan terbaru dulu, dan program ini punya logbook
// untuk silabus lain juga - `.first()` bisa menyetujui logbook yang salah, lalu
// pemeriksaan berikutnya gagal dengan alasan yang menyesatkan.
const probeCard = admin
  .locator('div.rounded-xl.border')
  .filter({ hasText: ACT })
  .filter({ has: admin.locator('button[value="approved"]') });
ok('the probe logbook has its own card', (await probeCard.count()) >= 1);
await probeCard.first().locator('button[value="approved"]').click();
await admin.waitForLoadState('networkidle');
ok('mentor can approve it', APPROVED.test(await admin.locator('body').innerText()));

// ---- INTI: jalan buntunya hilang
await student.goto(`${BASE}/program/syllabus/detail/${second}`, { waitUntil: 'networkidle' });
ok('syllabus 2 is NOW open — the dead end is gone',
   !student.url().includes('myProgram'), student.url());

// ---- logbook yang sudah disetujui tidak bisa diubah lagi
await student.goto(`${BASE}/program/syllabus/detail/${first}`, { waitUntil: 'networkidle' });
ok('the approved logbook is read-only',
   await student.locator('form[action$="/logbook"]').count() === 0);
const forced = await student.evaluate(async ([url]) => {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'activity=PROBE sneaky',
  });
  return r.status;
}, [`${BASE}/program/syllabus/detail/${first}/logbook`]);
await student.goto(`${BASE}/program/syllabus/detail/${first}`, { waitUntil: 'networkidle' });
ok('a direct POST cannot rewrite an approved logbook',
   !(await student.locator('body').innerText()).includes('PROBE sneaky'), `HTTP ${forced}`);

// ---- mentor MENARIK persetujuannya lagi
//
// Dua hal sekaligus. Pertama aturannya: persetujuan yang dicabut harus
// mengunci kembali silabus berikutnya - kalau tidak, sekali disetujui berarti
// selamanya terbuka dan tombol "Ask for revision" cuma hiasan.
//
// Kedua, kebersihan: tanpa langkah ini pemeriksa ini cuma bisa dijalankan
// SEKALI. Jalan kedua akan menemukan logbook yang sudah disetujui, formulirnya
// sudah baca-saja, dan gagal karena keadaan sisa - bukan karena aplikasinya
// salah. Tiga pemeriksa silabus lainnya membersihkan miliknya sendiri; yang ini
// tadinya tidak, dan itu ketahuan saat dijalankan dua kali berturut-turut.
await admin.goto(`${BASE}/program/syllabus/logbook/${COURSE}`, { waitUntil: 'networkidle' });
await admin
  .locator('div.rounded-xl.border')
  .filter({ hasText: ACT })
  .filter({ has: admin.locator('button[value="rejected"]') })
  .first()
  .locator('button[value="rejected"]')
  .click();
await admin.waitForLoadState('networkidle');

await student.goto(`${BASE}/program/syllabus/detail/${second}`, { waitUntil: 'networkidle' });
ok('withdrawing approval locks syllabus 2 again',
   student.url().includes('myProgram'), student.url());

await student.goto(`${BASE}/program/syllabus/detail/${first}`, { waitUntil: 'networkidle' });
ok('the student can edit the logbook again after a revision request',
   await student.locator('form[action$="/logbook"]').count() === 1);

await browser.close();
console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
