/**
 * Pemeriksa UI area student.
 *
 * Pakai:
 *   npm run test:ui
 *   STUDENT_EMAIL=... IDS='{"uid":"...","cid":"..."}' npm run test:ui
 *
 * Butuh aplikasi yang sedang berjalan di localhost:3069 dan sekali
 * `npx playwright install chromium`.
 *
 * Menyusuri satu per satu layar area student, memotretnya di lebar frame desain
 * (1728px), dan melaporkan apa yang tidak sesuai lewat pemeriksaan DOM.
 *
 * Bukan perbandingan piksel: frame desain memakai data contoh yang berbeda dari
 * database lokal, jadi diff piksel akan selalu merah. Yang diperiksa adalah hal
 * yang memang bisa diperiksa mesin: judul, urutan item sidebar, keberadaan
 * elemen yang digambar frame, teks tombol, dan error konsol.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:3069';
const OUT = process.env.OUT || path.join(process.cwd(), 'test', 'ui', 'shots');
const EMAIL = process.env.EMAIL || 'indra@gmail.com';
const PASSWORD = '12345678';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const consoleErrors = [];

function check(screen, label, pass, detail = '') {
  results.push({ screen, label, pass, detail });
}

const SCREENS = [
  {
    name: 'dashboard',
    url: '/users/profile?tab=dashboard',
    design: 'dashboard.png',
    async assert(page, s) {
      check(s, 'page title "Welcome back" banner', await page.getByText('WELCOME BACK', { exact: false }).count() > 0);
      check(s, '3 stat cards', await page.locator('text=/Ongoing Courses|Completed Courses|Portfolio Published/').count() >= 3);
      check(s, 'Continue Learning section', await page.getByText('Continue Learning').count() > 0);
      check(s, 'Student Activity Summary', await page.getByText(/Student Activity/i).count() > 0);
      check(s, 'banner illustration (frame has one)', await page.locator('main img[alt*="illustration" i]').count() > 0, 'known gap: no asset');
    },
  },
  {
    name: 'profile',
    url: '/users/profile?tab=profile',
    design: 'profile.png',
    async assert(page, s) {
      check(s, 'greeting title "Welcome, <name>"', await page.getByRole('heading', { name: /^Welcome,/ }).count() > 0);
      check(s, 'subtitle "Below is your profile information."', await page.getByText('Below is your profile information.').first().count() > 0);
      check(s, 'avatar with edit badge', await page.getByRole('button', { name: /Update profile photo/i }).count() > 0);
      check(s, 'Username field', await page.locator('#profile-username').count() > 0);
      check(s, 'Email field', await page.locator('#profile-email').count() > 0);
      check(s, '"Your Biodata" card', await page.getByRole('heading', { name: 'Your Biodata' }).count() > 0);
      check(s, 'Full Name required', await page.locator('#biodata-fullname').count() > 0);
      check(s, 'Address is a tall field', await page.locator('textarea#biodata-city').count() > 0);
      check(s, 'Education select', await page.locator('#biodata-education-trigger').count() > 0);
      check(s, 'Gender select', await page.locator('#biodata-gender-trigger').count() > 0);
      check(s, 'WhatsApp field', await page.locator('#biodata-no').count() > 0);
      check(s, 'two Save Changes buttons (one per card)', await page.getByRole('button', { name: 'Save Changes' }).count() === 2,
        `found ${await page.getByRole('button', { name: 'Save Changes' }).count()}`);
      const disabled = await page.getByRole('button', { name: 'Save Changes' }).first().isDisabled();
      check(s, 'Save disabled until something changes', disabled);
      check(s, 'left icon inside every input', await page.locator('svg.h-4.w-4').count() >= 6);
    },
  },
  {
    name: 'my-learning',
    url: '/users/profile?tab=learning',
    design: 'my-learning.png',
    async assert(page, s) {
      check(s, 'title "My Learning"', await page.getByRole('heading', { name: 'My Learning' }).count() > 0);
      check(s, 'filter row', await page.locator('text=/All Category|All Type|All Method/').count() >= 1);
      check(s, 'programs counter', await page.getByText(/programs? available/i).count() > 0);

      // Kartu program harus membuka Start Learning DI DALAM shell. Sebelumnya
      // menuju /program/:id yang dirender tanpa bareShell, sehingga student
      // mendapat navbar dan footer landing di tengah area backoffice.
      const cardHrefs = await page.locator('[x-show*="learning"] a[href^="/program"]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
      check(s, 'program cards stay inside the shell',
        cardHrefs.length > 0 && cardHrefs.every((h) => h.includes('/program/myProgram/')),
        cardHrefs.filter((h) => !h.includes('/program/myProgram/')).slice(0, 2).join(' | '));
    },
  },
  {
    name: 'my-portfolio',
    url: '/users/profile?tab=portfolio',
    design: 'my-portfolio.png',
    async assert(page, s) {
      check(s, 'title "My Portfolio"', await page.getByRole('heading', { name: 'My Portfolio' }).count() > 0);
      check(s, 'left filter card "Active Filters"', await page.getByText('Active Filters').count() > 0);
      check(s, 'Reset control', await page.getByRole('button', { name: /^Reset$/ }).count() > 0);
      check(s, 'Category filter', await page.getByText('Category', { exact: true }).count() > 0);
      check(s, 'Class Type filter', await page.getByText('Class Type', { exact: true }).count() > 0);
      check(s, 'Projects Available counter', await page.getByText('Projects Available').count() > 0);
      const visible = await page.locator('body').innerText();
      check(s, 'visible copy says "Portfolio", not "Portofolio"', !visible.includes('Portofolio'),
        (visible.match(/[^\n]*Portofolio[^\n]*/) || [''])[0].slice(0, 80));
    },
  },
  {
    name: 'payment-history',
    url: '/users/profile?tab=history-payment',
    design: 'payment-history.png',
    async assert(page, s) {
      check(s, 'title "Payment History"', await page.getByRole('heading', { name: 'Payment History' }).count() > 0);
      check(s, 'sidebar item renamed to "Payment History"', await page.locator('aside, nav').getByText('Payment History').count() > 0);
      check(s, 'Date Range filter', await page.getByText('Date Range').count() > 0);
      check(s, 'Payment Status filter', await page.getByText('Payment Status').count() > 0);
      check(s, 'Payment Method filter', await page.getByText('Payment Method').first().count() > 0);
      check(s, 'Program / Course filter', await page.getByText('Program / Course').count() > 0);
      check(s, 'Apply Filter button', await page.getByRole('button', { name: 'Apply Filter' }).count() > 0);
      check(s, 'Reset Filter control', await page.getByRole('button', { name: /Reset Filter/ }).count() > 0);
      check(s, 'transaction search box', await page.getByPlaceholder(/Search transactions/).count() > 0);
      check(s, 'ONE list, no sub-tabs', await page.getByRole('button', { name: /^(Full Payment|Registration|Installment)$/ }).count() === 0);
      const rows = await page.getByRole('button', { name: 'View Detail' }).count();
      check(s, 'rows render with View Detail', rows > 0, `${rows} rows`);
      check(s, 'View proof button', await page.getByRole('button', { name: 'View proof' }).count() > 0);
      check(s, 'pagination summary', await page.getByText(/Showing \d+-\d+ of \d+ history/).count() > 0);
    },
  },
  {
    name: 'start-learning',
    urlFrom: (ids) => `/program/myProgram/${ids.uid}?courseId=${ids.cid}`,
    design: 'start-learning.png',
    waitFor: '#start-learning-container h2',
    async assert(page, s) {
      check(s, 'title "Start Learning"', await page.getByRole('heading', { name: 'Start Learning' }).count() > 0);
      check(s, 'subtitle about unlocking', await page.getByText(/Complete each week/i).count() > 0);
      check(s, 'breadcrumb "My Learning / Start Learning"', await page.getByRole('navigation', { name: 'Breadcrumb' }).count() > 0);
      // Diperiksa lewat innerText kontainer: isinya datang dari fragment, dan
      // getByText tidak menjangkaunya dengan andal.
      const learning = await page.locator('#start-learning-container').innerText();
      check(s, 'week list', /Week \d/.test(learning), learning.slice(0, 60).replace(/\n/g, ' '));
      check(s, 'sticky program card', await page.getByRole('link', { name: /Detail Program/ }).count() + await page.getByRole('button', { name: /Detail Program/ }).count() > 0);
      check(s, 'Join Group button', await page.getByText(/Join Group/).count() > 0);
      check(s, 'My Logbook button', await page.getByText(/My Logbook/).count() > 0);
      check(s, 'week pagination (frame has one)', await page.getByText(/Showing \d+-\d+ of \d+ weeks/).count() > 0, 'known gap: needs unlock PRD');

      // Tombol Detail Program pernah menunjuk /program/detail/:id yang selalu 404;
      // path sebenarnya mengulang prefix controller.
      const detailHref = await page.locator('a[href*="detail"]').first().getAttribute('href').catch(() => null);
      check(s, 'Detail Program link resolves', !detailHref || detailHref.includes('/program/program/detail/'), String(detailHref));
    },
  },
  {
    name: 'logbook',
    url: '/users/profile?tab=logbook',
    design: null,
    async assert(page, s) {
      check(s, 'title "My Logbook"', await page.getByRole('heading', { name: 'My Logbook' }).count() > 0);
      check(s, 'search box', await page.getByPlaceholder(/Search activities/).count() > 0);
      check(s, 'Export Excel button', await page.getByRole('button', { name: /Export Excel/ }).count() > 0);
      check(s, 'table header', await page.getByRole('columnheader', { name: 'Activity' }).count() > 0);
    },
  },
  {
    name: 'assignment',
    urlFrom: (ids) => `/program/myProgram/${ids.uid}?courseId=${ids.cid}&tab=assignment`,
    waitFor: '#assignment-container h2',
    design: null,
    async assert(page, s) {
      const fragment = await page.locator('#assignment-container').innerHTML();
      check(s, 'fragment loaded with its heading', /Assignment/.test(fragment) && fragment.length > 1000,
        `${fragment.length} chars`);
      check(s, 'week sections render', /Week \d/.test(fragment));
      check(s, 'fragment is not a whole login page', !/Log In to System|Corporate Training/.test(fragment));
      check(s, 'no fabricated score', !(await page.content()).includes('Poin: 90/100'));
      check(s, 'no fabricated deadline', !(await page.content()).includes('Deadline time:23:59'));
    },
  },
  {
    name: 'change-password',
    url: '/users/profile?tab=password',
    design: null,
    async assert(page, s) {
      check(s, 'password page heading', await page.getByRole('heading', { name: /Change (your )?Password/i }).count() > 0);
      check(s, 'three password fields', await page.locator('input[type="password"]').count() === 3);
      check(s, 'Save disabled until valid', await page.getByRole('button', { name: 'Save Changes' }).first().isDisabled());
      check(s, 'copy is about passwords, not deletion', !(await page.content()).includes('Permanently remove this user'));
    },
  },
  {
    name: 'course-navigation',
    urlFrom: (ids) => `/program/myProgram/${ids.uid}?courseId=${ids.cid}`,
    design: 'start-learning.png',
    async assert(page, s) {
      // Frame desain menampilkan lima item datar di sidebar, tanpa pohon course.
      const navLabels = await page.evaluate(() => {
        const nav = [...document.querySelectorAll('nav')]
          .find((n) => n.innerText.includes('Dashboard') && n.innerText.includes('Profile'));
        if (!nav) return [];
        return [...nav.querySelectorAll('button, a')]
          .map((el) => el.innerText.trim())
          .filter(Boolean)
          .filter((l) => l !== 'Log Out');   // Log Out berdiri sendiri di bawah, bukan item nav
      });
      check(s, 'sidebar has exactly the five design items', navLabels.length === 5,
        navLabels.join(' | '));
      check(s, 'no course tree in the sidebar',
        !navLabels.some((l) => /Presentation|Certificate|Join Group/.test(l)), navLabels.join(' | '));

      // Panel tab harus tetap bersaudara dengan kontainer fragment.
      const nested = await page.evaluate(() => {
        const sl = document.getElementById('start-learning-container');
        if (!sl) return ['no start-learning-container'];
        return [...document.querySelectorAll('[x-show^="activeSection ==="]')]
          .filter((el) => el !== sl && sl.contains(el))
          .map((el) => el.getAttribute('x-show'));
      });
      check(s, 'tab panels are siblings, not nested in the fragment container',
        nested.length === 0, nested.slice(0, 3).join(' | '));

      // Setiap bagian per-course harus terjangkau dari kartu program.
      for (const label of ['Presentation', 'Assignment', 'Quiz', 'Certificate', 'My Logbook', 'Join Group']) {
        const btn = page.getByRole('button', { name: new RegExp(`^${label}$`) }).last();
        await btn.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(1500);
        const chars = await page.evaluate(() => {
          const shown = [...document.querySelectorAll('[x-show^="activeSection ==="]')]
            .filter((el) => getComputedStyle(el).display !== 'none');
          return shown.map((el) => el.innerText.trim()).join(' ').length;
        });
        check(s, `"${label}" reachable from the program card`, chars > 20, `${chars} chars`);
        await page.goBack().catch(() => {});
        await page.goto(`${BASE}${screenUrl}`, { waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(1200);
      }
    },
  },
  {
    name: 'standalone-learning-pages',
    url: '/users/profile?tab=learning',
    design: null,
    async assert(page, s) {
      // Setiap halaman belajar yang punya rute sendiri harus memakai chrome
      // backoffice, bukan navbar publik dan footer landing.
      const ids = JSON.parse(process.env.IDS || '{}');
      const extra = JSON.parse(process.env.EXTRA_IDS || '{}');
      const paths = [
        ['logbook list', `/logbooks/user/${ids.cid}`],
        ['attendance form', extra.sid ? `/attendance/form/${extra.sid}` : null],
        ['material pdf', extra.sid ? `/learning-material/pdf/${extra.sid}` : null],
        ['quiz form', extra.qid ? `/quiz/form/${extra.qid}` : null],
        ['portfolio create', `/portfolio/formCreate/${ids.cid}`],
      ].filter(([, p]) => p);

      for (const [label, path] of paths) {
        await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(600);
        const html = await page.content();
        const landing = /Corporate Training/.test(html);
        const frame = /Payment History/.test(html);
        check(s, `${label} uses the backoffice chrome`, !landing && frame,
          landing ? 'landing navbar present' : 'no sidebar found');
      }

      // Program yang sudah diikuti tidak boleh lagi mendarat di halaman landing.
      await page.goto(`${BASE}/program/${ids.cid}`, { waitUntil: 'networkidle' });
      check(s, 'enrolled program redirects into the shell',
        new URL(page.url()).pathname.startsWith('/program/myProgram/'), page.url());
    },
  },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1728, height: 1200 } });
await context.addCookies([{ name: 'lang', value: 'en', domain: 'localhost', path: '/' }]);
const page = await context.newPage();
page.on('pageerror', (e) => consoleErrors.push(String(e)));

// Login
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
const loginForm = page.locator('form[action="/login"]');
await loginForm.locator('input[name="email"]').fill(EMAIL);
await loginForm.locator('input[name="password"]').fill(PASSWORD);
await Promise.all([
  page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 }),
  loginForm.locator('button[type="submit"], input[type="submit"]').first().click(),
]);
console.log('logged in, landed on', new URL(page.url()).pathname);

const ids = JSON.parse(process.env.IDS || '{}');
let screenUrl = '';

for (const screen of SCREENS) {
  const url = screen.url || screen.urlFrom(ids);
  screenUrl = url;
  const before = consoleErrors.length;
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
  if (screen.waitFor) {
    await page.waitForSelector(screen.waitFor, { state: 'attached', timeout: 15000 }).catch(() =>
      check(screen.name, `content loaded (${screen.waitFor})`, false, 'timed out'));
  }
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, `${screen.name}.png`), fullPage: true });
  try {
    await screen.assert(page, screen.name);
  } catch (e) {
    check(screen.name, 'assertions ran without throwing', false, String(e).split('\n')[0]);
  }
  const errs = consoleErrors.slice(before);
  check(screen.name, 'no console errors', errs.length === 0, errs.slice(0, 2).join(' | '));

  const badExpr = await page.evaluate(() => {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      for (const a of el.attributes) {
        const n = a.name;
        if (!(n.startsWith('x-') || n.startsWith('@') || n.startsWith(':'))) continue;
        if (n === 'x-cloak' || n === 'x-ref' || n.startsWith('x-transition')) continue;
        const v = a.value;
        if (!v.trim()) continue;
        // Alpine memakai dua bentuk: sebagian atribut dikompilasi sebagai
        // ekspresi (return ...), sebagian lagi sebagai pernyataan. Alih-alih
        // menebak per atribut, keduanya dicoba; dilaporkan hanya bila DUA-DUANYA
        // gagal, yang berarti ekspresinya memang bukan JavaScript yang sah.
        const forms = ['return (' + v + ')', v];
        const ok = forms.some((body) => {
          try { new AsyncFunction(['s'], 'with(s){' + body + '}'); return true; }
          catch { return false; }
        });
        if (!ok) out.push(n + ' :: ' + v.replace(/\s+/g, ' ').slice(0, 90));
      }
    }
    return [...new Set(out)];
  });
  check(screen.name, 'every Alpine expression compiles', badExpr.length === 0, badExpr.slice(0, 2).join(' | '));
}

await browser.close();

// Laporan
const byScreen = {};
for (const r of results) (byScreen[r.screen] ??= []).push(r);
let failed = 0;
for (const [screen, rows] of Object.entries(byScreen)) {
  const bad = rows.filter((r) => !r.pass);
  failed += bad.length;
  console.log(`\n${bad.length === 0 ? 'OK  ' : 'DIFF'} ${screen}  (${rows.length - bad.length}/${rows.length})`);
  for (const r of bad) console.log(`       ✗ ${r.label}${r.detail ? '  — ' + r.detail : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed, ${failed} mismatches`);
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2));
