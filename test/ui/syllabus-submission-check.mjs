/**
 * Siklus penuh pengumpulan tugas silabus, dua peran bergantian:
 * student mengumpulkan -> mentor minta revisi -> student memperbaiki ->
 * mentor menyetujui -> student TIDAK BISA mengubah lagi.
 *
 * Yang diperiksa bukan rupa halaman melainkan aturannya. Terutama yang
 * terakhir: kalau jawaban yang sudah lolos masih bisa ditukar diam-diam,
 * penilaian mentor tidak berarti apa-apa - dan penjagaannya harus ada di
 * SERVER, bukan cuma pada tombol yang disembunyikan.
 *
 * Jalankan:
 *   COURSE=<uuid program SPL> node test/ui/syllabus-submission-check.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:3069';
const COURSE = process.env.COURSE;
const STUDENT = process.env.STUDENT_EMAIL || 'indra@gmail.com';
const ADMIN = process.env.ADMIN_EMAIL || 'super@gmail.com';
const PASSWORD = '12345678';

if (!COURSE) {
  console.error('COURSE tidak diisi. Isi dengan uuid program non-bootcamp.');
  process.exit(1);
}

let failed = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) failed++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  ' + extra : ''}`);
};

// Sesi student mengikuti bahasa pilihannya, jadi teks statusnya bisa Inggris,
// Indonesia, atau Jepang. Uji ini mencocokkan ketiganya - bukan memaksa aplikasi
// berbahasa Inggris supaya uji-nya gampang.
const UNDER_REVIEW = /Under Review|Dalam Tinjauan|\u5be9\u67fb\u4e2d/i;
const NEEDS_REVISION = /Needs Revision|Perlu Revisi|\u4fee\u6b63\u304c\u5fc5\u8981/i;
const APPROVED = /Approved|Disetujui|\u627f\u8a8d\u6e08\u307f/i;

const browser = await chromium.launch();

async function login(email) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
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

// ---- admin menyiapkan satu tugas percobaan
const stamp = Date.now();
const TASK = `PROBE task ${stamp}`;
await admin.goto(`${BASE}/program/syllabus/manage/${COURSE}`, { waitUntil: 'networkidle' });
await admin.locator('a:has-text("Content")').first().click();
await admin.waitForLoadState('networkidle');
const detailUrl = admin.url();
await admin.locator('form[action$="/assignment"] input[name="title"]').fill(TASK);
await admin.locator('form[action$="/assignment"] input[name="link"]').fill('https://example.com/probe-brief');
await admin.locator('form[action$="/assignment"] button[type="submit"]').click();
await admin.waitForLoadState('networkidle');
ok('admin created a probe assignment', (await admin.content()).includes(TASK));

const syllabusId = detailUrl.split('/').pop();

// ---- student melihatnya dan mengumpulkan
await student.goto(`${BASE}/program/syllabus/detail/${syllabusId}`, { waitUntil: 'networkidle' });
const row = student.locator('li', { hasText: TASK }).last();
ok('student sees the assignment', await row.count() > 0);
ok('it starts as not submitted', /Not submitted|Belum/i.test(await row.innerText()));

await row.locator('input[name="file"]').fill('https://drive.example.com/first-try');
await row.locator('button[type="submit"]').click();
await student.waitForLoadState('networkidle');
const row2 = student.locator('li', { hasText: TASK }).last();
ok('after submitting it is under review', UNDER_REVIEW.test(await row2.innerText()),
   (await row2.innerText()).replace(/\s+/g, ' ').slice(0, 90));
ok('the submitted link is shown back', (await row2.innerText()).includes('first-try'));

// ---- mentor minta revisi, dengan komentar
await admin.goto(detailUrl, { waitUntil: 'networkidle' });
const taskCard = admin.locator('li', { hasText: TASK }).last();
await taskCard.locator('a:has-text("Submissions")').click();
await admin.waitForLoadState('networkidle');
const answersUrl = admin.url();
ok('the submissions screen opens', /\/answers$/.test(answersUrl), answersUrl);
ok('the student submission is listed', (await admin.content()).includes('first-try'));

await admin.locator('input[name="comment"]').first().fill('Tolong tambahkan bagian pengujian.');
await admin.locator('button[value="rejected"]').first().click();
await admin.waitForLoadState('networkidle');
ok('mentor can ask for revision', /Needs revision/i.test(await admin.locator('body').innerText()));

// ---- student melihat permintaan revisi dan memperbaiki
await student.goto(`${BASE}/program/syllabus/detail/${syllabusId}`, { waitUntil: 'networkidle' });
const row3 = student.locator('li', { hasText: TASK }).last();
const t3 = await row3.innerText();
ok('student sees it needs revision', NEEDS_REVISION.test(t3), t3.replace(/\s+/g,' ').slice(0,90));
ok('student can read the mentor comment', t3.includes('pengujian'));

await row3.locator('input[name="file"]').fill('https://drive.example.com/second-try');
await row3.locator('button[type="submit"]').click();
await student.waitForLoadState('networkidle');
const row4 = student.locator('li', { hasText: TASK }).last();
ok('resubmitting puts it back under review', UNDER_REVIEW.test(await row4.innerText()));
ok('the new link replaced the old one', (await row4.innerText()).includes('second-try'));

// ---- mentor menyetujui
await admin.goto(answersUrl, { waitUntil: 'networkidle' });
ok('mentor sees only ONE row for this student (UQ task+user)',
   await admin.locator('button[value="approved"]').count() === 1,
   `${await admin.locator('button[value="approved"]').count()} baris`);
await admin.locator('button[value="approved"]').first().click();
await admin.waitForLoadState('networkidle');
ok('mentor can approve', /Approved/i.test(await admin.locator('body').innerText()));

// ---- student tidak bisa mengubah lagi
await student.goto(`${BASE}/program/syllabus/detail/${syllabusId}`, { waitUntil: 'networkidle' });
const row5 = student.locator('li', { hasText: TASK }).last();
ok('student sees it approved', APPROVED.test(await row5.innerText()));
ok('the resubmit form is gone once approved',
   await row5.locator('input[name="file"]').count() === 0);

// Penjagaan SERVER, bukan cuma tombol yang hilang: dikirim langsung.
const assignmentId = answersUrl.split('/assignment/')[1].split('/')[0];
const forced = await student.evaluate(async ([url]) => {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'file=https://drive.example.com/sneaky',
    redirect: 'follow',
  });
  return r.status;
}, [`${BASE}/program/syllabus/detail/${syllabusId}/assignment/${assignmentId}/submit`]);
await student.goto(`${BASE}/program/syllabus/detail/${syllabusId}`, { waitUntil: 'networkidle' });
const row6 = student.locator('li', { hasText: TASK }).last();
ok('a direct POST cannot overwrite an approved answer',
   !(await row6.innerText()).includes('sneaky'), `HTTP ${forced}`);
ok('the approved answer is still the one the mentor saw',
   (await row6.innerText()).includes('second-try'));

// ---- bersihkan
await admin.goto(detailUrl, { waitUntil: 'networkidle' });
admin.on('dialog', (d) => d.accept());
const del = admin.locator('li', { hasText: TASK }).last()
  .locator('form[action*="/assignment/"][action$="/delete"] button');
if (await del.count() > 0) { await del.first().click(); await admin.waitForLoadState('networkidle'); }
ok('probe assignment removed', !(await admin.content()).includes(TASK));

await browser.close();
console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
