/**
 * Kuis per silabus, dari dibuat admin sampai dikerjakan student.
 *
 * Keputusan pemilik 2026-09-18: SATU kuis per silabus. Sampai commit ini
 * keputusan itu baru ada di skema (`quiz.syllabusId` dari migrasi
 * 1788900000000) dan belum ada yang memakainya.
 *
 * Yang paling penting diperiksa di sini: kuis bootcamp TIDAK ikut berubah.
 * Kuis silabus dan kuis minggu berbagi satu tabel, jadi setiap kali jalur
 * silabus disentuh ada peluang jalur bootcamp ikut tergeser.
 *
 * Jalankan:
 *   COURSE=<uuid SPL> BOOTCAMP_QUIZ=<uuid kuis bootcamp> \
 *     node test/ui/syllabus-quiz-check.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:3069';
const COURSE = process.env.COURSE;
const BOOTCAMP_QUIZ = process.env.BOOTCAMP_QUIZ;
const STUDENT = process.env.STUDENT_EMAIL || 'indra@gmail.com';
const ADMIN = process.env.ADMIN_EMAIL || 'mentor@gmail.com';
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

// ---- admin membuat kuis pada satu silabus
await admin.goto(`${BASE}/program/syllabus/manage/${COURSE}`, { waitUntil: 'networkidle' });
await admin.locator('a:has-text("Content")').first().click();
await admin.waitForLoadState('networkidle');
const detailUrl = admin.url();
const syllabusId = detailUrl.split('/').pop();

ok('the content page has a Quiz panel',
   (await admin.getByRole('heading', { name: 'Quiz' }).count()) === 1);

const quizForm = admin.locator('form[action$="/quiz"]');
ok('a syllabus without a quiz shows the create form', await quizForm.count() === 1);

const NAME = `PROBE quiz ${Date.now()}`;
await quizForm.locator('input[name="quizName"]').fill(NAME);
await quizForm.locator('input[name="minScore"]').fill('60');
await quizForm.locator('input[name="duration"]').fill('15');
await quizForm.locator('button[type="submit"]').click();
await admin.waitForLoadState('networkidle');
const body = await admin.locator('body').innerText();
ok('the quiz is created and shown', body.includes(NAME), body.replace(/\s+/g,' ').match(/PROBE quiz[^\n]{0,60}/)?.[0] || '');
ok('its settings are read back', /min 60/.test(body) && /15 min/.test(body));

// SATU per silabus: formulir tambahnya harus hilang, bukan sekadar disembunyikan
ok('the create form is replaced, not duplicated',
   await admin.locator('form[action$="/quiz"]').count() === 0);

// dan rutenya sendiri menolak kuis kedua
const second = await admin.evaluate(async ([url]) => {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'quizName=PROBE second&minScore=10&duration=5',
  });
  return r.status;
}, [`${BASE}/program/syllabus/manage/${COURSE}/${syllabusId}/quiz`]);
await admin.goto(detailUrl, { waitUntil: 'networkidle' });
ok('a direct POST cannot add a second quiz',
   !(await admin.locator('body').innerText()).includes('PROBE second'), `HTTP ${second}`);

// ---- pertanyaannya dikelola di layar kuis yang sudah ada
const qLink = admin.locator('a:has-text("Questions")');
ok('the quiz links to the existing question screen', await qLink.count() === 1);
await qLink.click();
await admin.waitForLoadState('networkidle');
const quizId = admin.url().split('/').pop();
const qBody = await admin.locator('body').innerText();
ok('the question screen opens for a syllabus quiz', admin.url().includes('/quiz/'), admin.url());
ok('its header says Syllabus, not a blank Week',
   /Syllabus\s*\d/.test(qBody) && !/Week\s*$/m.test(qBody),
   qBody.replace(/\s+/g,' ').match(/[^\n]*Syllabus \d[^\n]{0,30}/)?.[0] || '');

// ---- student melihat kuisnya di silabus
await student.goto(`${BASE}/program/syllabus/detail/${syllabusId}`, { waitUntil: 'networkidle' });
const sBody = await student.locator('body').innerText();
ok('student sees the quiz on the syllabus', sBody.includes(NAME));
ok('no untranslated i18n keys leaked', !/test\.(quiz|startLearning)\./.test(sBody),
   sBody.match(/test\.[a-zA-Z.]+/)?.[0] || '');
const take = student.locator(`a[href="/quiz/form/${quizId}"]`);
ok('student has a way into the quiz', await take.count() === 1);
await take.click();
await student.waitForLoadState('networkidle');
ok('the quiz page opens for a student', student.url().includes('/quiz/form/'), student.url());
ok('the quiz page shows its name', (await student.locator('body').innerText()).includes(NAME));

// ---- bootcamp tidak boleh ikut berubah
if (BOOTCAMP_QUIZ) {
  const r = await admin.goto(`${BASE}/quiz/${BOOTCAMP_QUIZ}`, { waitUntil: 'networkidle' });
  const bBody = await admin.locator('body').innerText();
  ok('a bootcamp quiz still opens', r.status() === 200, String(r.status()));
  ok('a bootcamp quiz still says Week, with its number',
     /Week\s*\d+/.test(bBody),
     bBody.replace(/\s+/g,' ').match(/[^\n]*Week \d+[^\n]{0,20}/)?.[0] || 'tidak ada "Week N"');
  ok('a bootcamp quiz does not claim to be a syllabus', !/Syllabus\s*\d/.test(bBody));
}

// ---- hapus dari LAYAR KUIS, bukan dari layar silabus.
// Rute hapus yang lama menuntut `weeksId` di path-nya dan kuis silabus tidak
// punya minggu, jadi tanpa percabangan tombol itu menghasilkan URL dengan ruas
// kosong dan gagal diam-diam. Ini yang membuktikan cabangnya benar.
admin.on('dialog', (d) => d.accept());
await admin.goto(`${BASE}/quiz/${quizId}`, { waitUntil: 'networkidle' });
const delOnQuiz = admin.locator('form[method="POST"] button[title="Delete Quiz"]');
ok('the quiz screen has a working delete for a syllabus quiz',
   await delOnQuiz.count() === 1);
const delAction = await admin.locator('form:has(button[title="Delete Quiz"])').getAttribute('action');
ok('its action has no empty path segment', !/\/\//.test(delAction.replace('http://','')), delAction);
// Tombolnya memakai SweetAlert, bukan confirm() bawaan, jadi handler dialog
// Playwright tidak akan pernah terpanggil - yang harus diklik tombol Delete di
// dalam modalnya.
await delOnQuiz.click();
await admin.locator('.swal2-confirm').waitFor({ state: 'visible', timeout: 10000 });
await Promise.all([
  admin.waitForNavigation({ timeout: 20000 }).catch(() => {}),
  admin.locator('.swal2-confirm').click(),
]);
await admin.waitForLoadState('networkidle');
ok('deleting from the quiz screen actually removes it',
   !(await admin.locator('body').innerText()).includes(NAME),
   admin.url());

// ---- bersihkan sisa kalau ada
await admin.goto(detailUrl, { waitUntil: 'networkidle' });
const del = admin.locator('form[action*="/quiz/"][action$="/delete"] button');
if (await del.count() > 0) { await del.first().click(); await admin.waitForLoadState('networkidle'); }
ok('probe quiz removed', !(await admin.locator('body').innerText()).includes(NAME));
ok('the create form is back after deleting',
   await admin.locator('form[action$="/quiz"]').count() === 1);

await browser.close();
console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
