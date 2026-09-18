/**
 * Ketamatan program SPL: SEMUA silabus selesai, baru tamat.
 * (keputusan pemilik 2026-09-18)
 *
 * Ketamatan disimpan di `user_courses.progress` - kolom yang SAMA yang dipakai
 * jalur bootcamp dan yang dibaca `activeCourseCompleted` untuk membuka
 * sertifikat. Jadi yang diuji di sini bukan kolomnya, melainkan akibatnya:
 * tombol unduh sertifikat muncul atau tidak.
 *
 * Yang paling penting: ketamatan itu DIHITUNG ULANG, bukan sekadar dinyalakan.
 * Mentor bisa menarik persetujuan logbook, dan kalau itu terjadi programnya
 * kembali belum tamat. Kolom yang hanya bisa naik akan menerbitkan sertifikat
 * untuk program yang syaratnya sudah tidak terpenuhi lagi.
 *
 * YANG DITINGGALKAN pemeriksa ini, dan kenapa:
 *   - satu baris `syllabus_logbook` per silabus pada LOGBOOK_COURSE. Tidak ada
 *     jalur hapus logbook di aplikasi, jadi ia tidak bisa membersihkannya lewat
 *     antarmuka. Barisnya di-upsert per silabus, jadi tidak menumpuk berapa
 *     kali pun dijalankan.
 *   - LOGBOOK_COURSE berakhir dalam keadaan TAMAT. Itu disengaja: langkah
 *     terakhir menyetujui kembali logbook yang tadi ditolak, dan tanpa itu
 *     jalan berikutnya menemukan silabus kedua terkunci lalu gagal karena
 *     keadaan sisa. Dibuktikan dengan menjalankannya dua kali berturut-turut.
 *
 * Karena itu pakailah program percobaan untuk LOGBOOK_COURSE, bukan program
 * yang dipakai student sungguhan.
 *
 * Jalankan:
 *   DONE_COURSE=<SPL yang sudah tamat> PARTIAL_COURSE=<SPL yang belum> \
 *   LOGBOOK_COURSE=<SPL berlogbook, 2 silabus> \
 *     node test/ui/syllabus-completion-check.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:3069';
const DONE = process.env.DONE_COURSE;
const PARTIAL = process.env.PARTIAL_COURSE;
const LOGBOOK = process.env.LOGBOOK_COURSE;
const STUDENT = process.env.STUDENT_EMAIL || 'indra@gmail.com';
const ADMIN = process.env.ADMIN_EMAIL || 'super@gmail.com';
const PASSWORD = '12345678';

if (!DONE || !PARTIAL) {
  console.error('DONE_COURSE dan PARTIAL_COURSE wajib diisi.');
  process.exit(1);
}

let failed = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) failed++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  ' + extra : ''}`);
};

const CERT = /Unduh Sertifikat|Download Certificate|修了証/i;

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

const student = await login(STUDENT);
ok('student logged in', !student.url().includes('/login'), student.url());

// Id student diambil dari URL pendaratannya sendiri, bukan diminta lewat env.
// `UID` adalah variabel khusus di zsh dan tidak bisa dipakai sebagai nama env;
// mengambilnya dari aplikasi sekalian menghapus satu variabel yang harus diisi
// dengan benar.
const STUDENT_ID =
  process.env.STUDENT_ID ||
  new URL(student.url()).pathname.split('/').filter(Boolean).pop();
if (!/^[0-9a-f-]{36}$/.test(STUDENT_ID || '')) {
  console.error(`Tidak bisa menentukan id student dari ${student.url()} - isi STUDENT_ID.`);
  await browser.close();
  process.exit(1);
}

const shell = (cid) => `${BASE}/program/myProgram/${STUDENT_ID}?courseId=${cid}`;

/**
 * Blok sertifikat dikawal `{{#if activeCourseCompleted}}` DI SERVER, jadi
 * kalau programnya belum tamat ia tidak ada sama sekali di HTML - bukan ada
 * tapi disembunyikan. Karena itu yang dibaca `content()`, bukan `innerText()`:
 * blok itu duduk di dalam tab yang tertutup, dan innerText tidak melihat isi
 * elemen tersembunyi sehingga program yang SUDAH tamat pun terbaca kosong.
 */
async function certificateShown(courseId) {
  await student.goto(shell(courseId), { waitUntil: 'networkidle' });
  return CERT.test(await student.content());
}

// ---- program yang SEMUA silabusnya selesai
ok('a fully finished SPL program offers the certificate',
   await certificateShown(DONE));

// ---- program yang belum semua
ok('an unfinished SPL program does NOT offer the certificate',
   !(await certificateShown(PARTIAL)));

// ---- ketamatan dihitung ulang, bukan sekali nyala lalu menetap
if (LOGBOOK) {
  const admin = await login(ADMIN);

  // Selesaikan SEMUA silabus program berlogbook itu, lengkap dengan
  // persetujuan mentornya, sampai programnya tamat.
  await admin.goto(`${BASE}/program/syllabus/manage/${LOGBOOK}`, { waitUntil: 'networkidle' });
  const links = await admin.locator('a:has-text("Content")').evaluateAll((as) =>
    as.map((a) => a.getAttribute('href').split('/').pop()));

  for (const sid of links) {
    await student.goto(`${BASE}/program/syllabus/detail/${sid}`, { waitUntil: 'networkidle' });
    if (student.url().includes('myProgram')) break;      // masih terkunci
    const mark = student.locator('form[action$="/complete"] button');
    if (await mark.count()) { await mark.click(); await student.waitForLoadState('networkidle'); }

    const lf = student.locator('form[action$="/logbook"]');
    if (await lf.count()) {
      const act = `PROBE selesai ${sid.slice(0, 8)} ${Date.now()}`;
      await lf.locator('input[name="activity"]').fill(act);
      await lf.locator('button[type="submit"]').click();
      await student.waitForLoadState('networkidle');

      // Disetujui lewat KARTU yang memuat logbook ini, bukan kartu pertama di
      // halaman: kartunya diurutkan terbaru dulu, dan program ini punya logbook
      // untuk silabus lain juga, jadi `.first()` menyetujui yang salah lalu
      // silabus ini tidak pernah terhitung selesai.
      await admin.goto(`${BASE}/program/syllabus/logbook/${LOGBOOK}`, { waitUntil: 'networkidle' });
      const card = admin
        .locator('div.rounded-xl.border')
        .filter({ hasText: act })
        .filter({ has: admin.locator('button[value="approved"]') });
      if (await card.count()) {
        await card.first().locator('button[value="approved"]').click();
        await admin.waitForLoadState('networkidle');
      }
    }
  }

  ok('finishing every syllabus makes the program complete',
     await certificateShown(LOGBOOK));

  // INTI: mentor menarik SATU persetujuan -> programnya tidak tamat lagi.
  await admin.goto(`${BASE}/program/syllabus/logbook/${LOGBOOK}`, { waitUntil: 'networkidle' });
  await admin
    .locator('div.rounded-xl.border')
    .filter({ hasText: /Approved/ })
    .filter({ has: admin.locator('button[value="rejected"]') })
    .first()
    .locator('button[value="rejected"]')
    .click();
  await admin.waitForLoadState('networkidle');

  ok('withdrawing one approval revokes completion again',
     !(await certificateShown(LOGBOOK)));

  // dikembalikan supaya pemeriksa ini bisa dijalankan berulang
  await admin.goto(`${BASE}/program/syllabus/logbook/${LOGBOOK}`, { waitUntil: 'networkidle' });
  for (let guard = 0; guard < 10; guard++) {
    await admin.goto(`${BASE}/program/syllabus/logbook/${LOGBOOK}`, { waitUntil: 'networkidle' });
    const notYet = admin
      .locator('div.rounded-xl.border')
      .filter({ hasText: /Needs revision|Under review/ })
      .filter({ has: admin.locator('button[value="approved"]') });
    if ((await notYet.count()) === 0) break;
    await notYet.first().locator('button[value="approved"]').click();
    await admin.waitForLoadState('networkidle');
  }
}

// ---- bootcamp tidak boleh ikut tergeser
const BC = process.env.BOOTCAMP_COURSE;
if (BC) {
  const before = await certificateShown(BC);
  await student.goto(shell(BC), { waitUntil: 'networkidle' });
  ok('a bootcamp program keeps its own completion rule',
     (await certificateShown(BC)) === before, `tetap ${before}`);
}

await browser.close();
console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
