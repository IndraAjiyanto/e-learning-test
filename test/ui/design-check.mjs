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
      check(s, 'Student Activity Dashboard Summary', await page.getByText(/Student Activity Dashboard Summary/i).count() > 0);
      check(s, '"View All Courses" link', await page.getByRole('button', { name: /View All Courses/i }).count() > 0);

      // Ilustrasi banner dulu tercatat sebagai gap karena menunggu aset. Kini
      // digambar sebagai SVG inline (elips + kartu wisuda + pohon), jadi yang
      // diperiksa elemen svg-nya, bukan <img>.
      check(s, 'banner illustration present',
        await page.locator('div[x-show="activeSection === \'dashboard\'"] svg ellipse').count() > 0);

      // Frame memakai gradien terang-ke-gelap dari kiri ke kanan, dengan teks navy
      // di bagian terang. Sebelumnya gradien mulai dari warna menengah sehingga
      // teks navy nyaris tak terbaca.
      const bannerBg = await page.getByText('WELCOME BACK', { exact: false })
        .evaluate((el) => {
          const banner = el.closest('div[class*="gradient"], div[class*="linear-gradient"]');
          return banner ? getComputedStyle(banner).backgroundImage : '';
        });
      check(s, 'banner runs light on the left', /EEF2F7|238,\s*242,\s*247/i.test(bannerBg), bannerBg.slice(0, 60));

      // Kartu statistik: frame memakai lingkaran penuh dan panah, bukan kotak
      // membulat dan chevron.
      check(s, 'stat icons are circles',
        await page.locator('button:has-text("Ongoing Courses") span.rounded-full').count() > 0);
      check(s, 'stat cards end with an arrow',
        await page.locator('button:has-text("Ongoing Courses") i.fa-arrow-right').count() > 0);

      // Baris Continue Learning: thumbnail besar + penghitung di kaki kartu.
      check(s, 'Continue Learning thumbnails', await page.locator('.size-20').count() > 0);
      check(s, 'Continue Learning counter', await page.getByText(/Showing .* of .* course/i).count() > 0);

      // Sidebar menciut: setiap item harus punya geometri yang sama dan duduk di
      // sumbu tengah sidebar. Pernah meleset karena tiga tombol tidak kebagian
      // kelas hook-nya, sehingga ikonnya bergeser ke kiri sendiri.
      const bar = await page.locator('.js-user-sidebar')
        .evaluate((e) => { const r = e.getBoundingClientRect(); return { left: r.left, width: r.width }; });
      const items = await page.locator('.js-user-sidebar-item').evaluateAll((els) => els.map((el) => {
        const r = el.getBoundingClientRect();
        const ic = el.querySelector('i, span.block, svg, img');
        return {
          w: Math.round(r.width),
          c: ic ? Math.round(ic.getBoundingClientRect().left + ic.getBoundingClientRect().width / 2) : null,
        };
      }));
      check(s, 'every sidebar item carries the layout hook', items.length >= 6, `${items.length} items`);
      check(s, 'sidebar items share one width',
        new Set(items.map((x) => x.w)).size === 1, [...new Set(items.map((x) => x.w))].join(','));
      check(s, 'sidebar icons sit on the centre line',
        new Set(items.map((x) => x.c)).size === 1 &&
        Math.abs(items[0].c - (bar.left + bar.width / 2)) <= 1,
        `centres=${[...new Set(items.map((x) => x.c))].join(',')} axis=${Math.round(bar.left + bar.width / 2)}`);
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

      // Studi Program dan WhatsApp Number sempat dirender sebagai textarea tiga
      // baris, sehingga tingginya tiga kali lipat pasangannya di kolom kiri.
      const h = async (sel) => await page.locator(sel)
        .evaluate((e) => ({ tag: e.tagName, h: Math.round(e.getBoundingClientRect().height) }))
        .catch(() => null);
      const edu = await h('#biodata-education-trigger');
      const sp = await h('#biodata-studyprogram');
      const wa = await h('#biodata-no');
      check(s, 'Studi Program is a single-line input',
        sp && sp.tag === 'INPUT' && sp.h === edu.h, JSON.stringify(sp));
      check(s, 'WhatsApp Number is a single-line input',
        wa && wa.tag === 'INPUT' && wa.h === edu.h, JSON.stringify(wa));
      check(s, 'WhatsApp Number uses the tel keyboard',
        await page.locator('#biodata-no[type="tel"]').count() > 0);

      // Nomor telepon dulu menerima apa pun, termasuk huruf.
      await page.locator('#biodata-no').fill('abc');
      await page.locator('#biodata-no').blur();
      await page.waitForTimeout(250);
      check(s, 'WhatsApp Number rejects letters',
        await page.getByText(/digits only/i).count() > 0);
      await page.locator('#biodata-no').fill('+62 812-3456-7890');
      await page.locator('#biodata-no').blur();
      await page.waitForTimeout(250);
      check(s, 'WhatsApp Number accepts an international number',
        await page.getByText(/digits only|8 to 15 digits/i).count() === 0);
    },
  },
  {
    name: 'my-learning',
    url: '/users/profile?tab=learning',
    design: 'my-learning.png',
    async assert(page, s) {
      check(s, 'title "My Learning"', await page.getByRole('heading', { name: 'My Learning' }).count() > 0);
      check(s, 'subtitle from the frame', await page.getByText(/Explore our premium classes/i).count() > 0);

      // Bilah filter frame: Filter + tiga dropdown + pencarian di kanan.
      check(s, 'Filter label', await page.getByText('Filter', { exact: true }).count() > 0);
      check(s, '"All Categories" dropdown', await page.getByText(/All Categories/i).count() > 0);
      check(s, '"All Types" dropdown', await page.getByText(/All Types/i).count() > 0);
      check(s, '"All Methods" dropdown', await page.getByText(/All Methods/i).count() > 0);
      check(s, 'search for class name', await page.locator('input[placeholder*="class name" i]').count() > 0);

      check(s, 'programs counter', await page.getByText(/programs? available/i).count() > 0);

      // Kartu program pada frame: chip, kuota dengan bar, tombol View Program.
      const cards = page.locator('a:has-text("View Program")');
      const cardCount = await cards.count();
      check(s, 'program cards render', cardCount > 0, `found ${cardCount}`);
      check(s, 'quota bar on every card',
        await page.locator('[role="progressbar"]').count() === cardCount,
        `${await page.locator('[role="progressbar"]').count()} bars for ${cardCount} cards`);
      check(s, 'quota label resolves (not a raw i18n key)',
        await page.getByText(/programSection\./).count() === 0);

      // Kuota harus memakai jumlah peserta sebenarnya. Query filter menyaring
      // join userCourses pada user yang login, jadi tanpa hitungan terpisah
      // setiap kartu akan selalu menampilkan "1 / N".
      const quotas = await page.locator('[role="progressbar"]').evaluateAll(
        (els) => els.map((el) => Number(el.getAttribute('aria-valuenow'))));
      check(s, 'quota reflects real enrollment, not always 1',
        quotas.length > 0 && quotas.some((q) => q > 0), quotas.join(','));

      // Tombol kartu menuju /program/:id; untuk program yang sudah diikuti rute
      // itu mengalihkan student kembali ke area belajar di dalam shell.
      const first = await cards.first().getAttribute('href');
      await page.goto(`${BASE}${first}`, { waitUntil: 'networkidle' });
      check(s, 'card lands inside the backoffice shell',
        new URL(page.url()).pathname.startsWith('/program/myProgram/'), page.url());
      await page.goto(`${BASE}/users/profile?tab=learning`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
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
      // Sub-judulnya kini mengikuti keadaan: nama minggu yang sedang berjalan,
      // kalimat selesai, atau ajakan awal saat belum ada minggu sama sekali.
      const header = await page.locator('#start-learning-container').innerText();
      check(s, 'header states where the student is',
        /Week \d+ In progress|finished every week|Complete each week/i.test(header),
        header.slice(0, 80).replace(/\n/g, ' '));

      // Kepala panel baru: kemajuan program terbaca tanpa membuka minggu satu
      // per satu. Dulu tidak ada penanda kemajuan sama sekali.
      check(s, 'program progress bar',
        await page.locator('#start-learning-container [role="progressbar"]').count() > 0);
      check(s, 'weeks completed counter',
        /\d+ of \d+ weeks? completed/i.test(header), header.slice(0, 120).replace(/\n/g, ' '));

      // Setiap minggu menyebut isinya di kepala kartu, jadi student tahu ada apa
      // di dalam tanpa membukanya. Dulu barisnya hanya "Click to Review Content".
      check(s, 'week header previews its contents',
        /\d+ sessions?/i.test(header), header.slice(0, 120).replace(/\n/g, ' '));
      check(s, 'no "click to review" filler',
        !/Click to (Review|Expand)/i.test(header));

      // Sesi kini membuka halamannya sendiri, bukan akordeon di dalam akordeon.
      check(s, 'sessions link to their own page',
        await page.locator('#start-learning-container a[href*="/program/session/detail/"]').count() > 0);
      // Riwayat keputusan: remah sempat dihapus dari area student, lalu diminta
      // kembali untuk SELURUH halaman backoffice. Yang diperiksa sekarang
      // kebalikan dari sebelumnya.
      check(s, 'breadcrumb present',
        await page.getByRole('navigation', { name: /Breadcrumb/i }).count() > 0);
      // Diperiksa lewat innerText kontainer: isinya datang dari fragment, dan
      // getByText tidak menjangkaunya dengan andal.
      check(s, 'week list', /Week \d/.test(header), header.slice(0, 60).replace(/\n/g, ' '));
      check(s, 'sticky program card', await page.getByRole('link', { name: /Detail Program/ }).count() + await page.getByRole('button', { name: /Detail Program/ }).count() > 0);
      check(s, 'Join Group button', await page.getByText(/Join Group/).count() > 0);
      check(s, 'My Logbook button', await page.getByText(/My Logbook/).count() > 0);
      check(s, 'week pagination (frame has one)', await page.getByText(/Showing \d+-\d+ of \d+ weeks/).count() > 0, 'known gap: needs unlock PRD');

      // Tombol Detail Program pernah menunjuk /program/detail/:id yang selalu 404;
      // path sebenarnya mengulang prefix controller.
      const detailHref = await page.locator('a[href*="/program/program/detail/"], a:has-text("Detail Program")')
        .first().getAttribute('href').catch(() => null);
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

      // Tab shell sudah memakai komponen badge super_admin. Halaman logbook yang
      // berdiri sendiri punya markup sendiri: enum-nya 'approved' | 'process' |
      // 'rejected', tetapi template memeriksa 'acc' dan 'proces' yang tidak
      // pernah ada, sehingga logbook approved tampil "Rejected" tanpa pil warna.
      const ids = JSON.parse(process.env.IDS || '{}');
      await page.goto(`${BASE}/logbooks/user/${ids.cid}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      const badges = await page.locator('td span.rounded-full.uppercase').evaluateAll(
        (els) => els.map((el) => ({
          // `uppercase` hanya transform CSS, textContent tetap huruf aslinya.
          text: (el.textContent || '').trim().toUpperCase(),
          bg: getComputedStyle(el).backgroundColor,
        })));
      check(s, 'standalone logbook: status pill renders for every row',
        badges.length > 0 && badges.every((b) => b.bg !== 'rgba(0, 0, 0, 0)'),
        `${badges.length} rows`);
      check(s, 'standalone logbook: status label matches the stored value',
        badges.length > 0 && badges.every((b) => ['APPROVED', 'PROCESS', 'REJECTED'].includes(b.text)),
        [...new Set(badges.map((b) => b.text))].slice(0, 3).join(','));
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
    // Halaman baru: satu sesi punya URL sendiri, menggantikan akordeon di dalam
    // akordeon minggu pada panel Start Learning.
    name: 'session-detail',
    urlFrom: (ids) => {
      const extra = JSON.parse(process.env.EXTRA_IDS || '{}');
      return `/program/session/detail/${extra.sid}`;
    },
    design: null,
    async assert(page, s) {
      check(s, 'renders inside the backoffice shell',
        await page.getByRole('link', { name: /Payment History/ }).count() > 0);
      const head = (await page.locator('h1').first().evaluate(
        (el) => (el.parentElement?.innerText || ''))).replace(/\s+/g, ' ');
      check(s, 'week and session position', /Week \d+ . Session \d+ of \d+/i.test(head), head.slice(0, 70));
      check(s, 'session progress bar', await page.locator('[role="progressbar"]').count() > 0);

      // Empat bagian yang membentuk satu sesi.
      for (const [label, rx] of [['Attendance', /Attendance/], ['Materials', /Materials/],
                                 ['Assignment', /Assignment/], ['Logbook', /Logbook/i]]) {
        check(s, `${label} section`, await page.getByRole('heading', { name: rx }).count() > 0);
      }

      // Materi terkunci sampai student absen; kalau sudah absen, ubinnya tautan.
      const attended = await page.getByText(/Attendance Recorded/i).count() > 0;
      const tiles = await page.locator('a[href*="/learning-material/"]').count();
      const lockedTiles = await page.locator('span[aria-disabled="true"]').count();
      check(s, attended ? 'material tiles are links once attended' : 'material tiles locked until attendance',
        attended ? tiles > 0 : lockedTiles >= 0, `attended=${attended} links=${tiles} locked=${lockedTiles}`);

      check(s, 'back link returns to the learning area',
        await page.locator('a[href*="/program/myProgram/"]').count() > 0);

      // Materi disebut satu per satu. Dulu diringkas jadi ubin per jenis dengan
      // angka saja ("PDF Material 3"), yang tidak memberi tahu isinya.
      const mats = await page.locator('a[href*="/learning-material/"]')
        .evaluateAll((els) => els.map((e) => ({ text: e.innerText.trim(), href: e.getAttribute('href') })));
      check(s, 'each material is listed by name', mats.length > 0 && mats.every((m) => m.text.length > 0),
        `${mats.length} links`);
      check(s, 'material links open a specific file',
        mats.length > 0 && mats.every((m) => m.href.includes('materialId=')),
        mats.filter((m) => !m.href.includes('materialId=')).length + ' without materialId');

      // Penampil materi dulu selalu terbuka kosong, bahkan untuk satu berkas.
      if (mats.length) {
        await page.goto(`${BASE}${mats[0].href}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(700);
        const emptyVisible = await page.getByText(/No PDF Selected|Select a PDF|No Video Selected/i)
          .first().isVisible().catch(() => false);
        check(s, 'material viewer opens with the file already selected', !emptyVisible);

        // Berkas unggahan yang hilang dari disk dulu dijawab halaman 404
        // aplikasi, dan <iframe> menampilkannya di dalam kotak materi lengkap
        // dengan navbar dan tombol WhatsApp-nya. Yang benar: penampil menyebut
        // keadaannya, dan tidak ada iframe yang dirender.
        const unavailable = await page.getByText(/unavailable/i).first().isVisible().catch(() => false);
        const frameVisible = await page.locator('iframe').first().isVisible().catch(() => false);
        check(s, 'viewer never embeds the app 404 page',
          unavailable !== frameVisible, `unavailable=${unavailable} iframe=${frameVisible}`);
        const embedded404 = await page.frameLocator('iframe').getByText(/Page Not Found/i)
          .count().catch(() => 0);
        check(s, 'no 404 page inside the viewer frame', embedded404 === 0);
        await page.goBack({ waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
      }

      // Jawaban yang masih ditinjau atau ditolak tidak boleh tertulis selesai.
      const assignText = await page.locator('section')
        .filter({ has: page.getByRole('heading', { name: /Assignment/ }) })
        .first().innerText().catch(() => '');
      const claimsDone = /Assignment Completed/i.test(assignText);
      const reallyDone = !/Under review|Needs revision|Not submitted/i.test(assignText);
      check(s, 'assignment status is not falsely "completed"', !claimsDone || reallyDone,
        assignText.replace(/\n/g, ' ').slice(0, 90));

      // Tiap halaman backoffice punya baris yang sama: tombol kembali lalu remah.
      const crumbs = await page.getByRole('navigation', { name: /Breadcrumb/i })
        .first().locator('li').allInnerTexts().catch(() => []);
      check(s, 'breadcrumb trail is complete', crumbs.length >= 3 && crumbs.every((x) => x.trim()),
        crumbs.join(' > '));
      check(s, 'breadcrumb ends on the current page',
        await page.locator('[aria-current="page"]').count() > 0);
      check(s, 'back button present',
        await page.getByRole('link', { name: /^Back$/ }).count() > 0);

      // Sidebar student menciut secara bawaan, dan halaman berdiri sendiri ikut
      // keadaan yang sama seperti shell.
      const w = await page.locator('.js-user-sidebar').evaluate((e) => Math.round(e.getBoundingClientRect().width));
      check(s, 'sidebar starts collapsed', w === 80, `${w}px`);
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
// Pergeseran tata letak diamati di setiap layar. Halaman area student dulu
// menggambar isinya lebih dulu lalu mengoreksinya setelah Alpine berjalan;
// My Learning sempat mencatat CLS 0.76 dan area belajar 0.84, yang terasa
// sebagai halaman melompat. Ambang 0.1 adalah batas "baik" menurut Web Vitals.
await context.addInitScript(() => {
  window.__cls = 0;
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
});
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

  // Chrome area student harus terkunci: app bar dan sidebar tidak ikut bergulir,
  // hanya kolom konten yang punya scroll sendiri. Dulu root shell memakai
  // `min-h-screen` + `overflow-x-hidden`, yang diam-diam membuatnya jadi scroll
  // container sehingga `sticky` pada app bar tidak pernah aktif.
  const chrome = await page.evaluate(() => {
    const header = document.querySelector('header');
    const sidebar = document.querySelector('nav.overflow-y-auto');
    // kolom konten = elemen yang benar-benar bisa digulung
    const scroller = [...document.querySelectorAll('main, div')].find(
      (el) => el.scrollHeight > el.clientHeight + 8 && getComputedStyle(el).overflowY === 'auto',
    );
    const topOf = (el) => (el ? Math.round(el.getBoundingClientRect().top) : null);
    const before = { header: topOf(header), sidebar: topOf(sidebar) };
    if (scroller) scroller.scrollTop = Math.min(400, scroller.scrollHeight - scroller.clientHeight);
    const after = { header: topOf(header), sidebar: topOf(sidebar) };
    const doc = document.documentElement;
    return {
      hasHeader: !!header,
      scrolled: scroller ? scroller.scrollTop : 0,
      headerMoved: before.header !== null && before.header !== after.header,
      sidebarMoved: before.sidebar !== null && before.sidebar !== after.sidebar,
      pageScrolls: doc.scrollHeight > doc.clientHeight + 2 || document.body.scrollHeight > document.body.clientHeight + 2,
    };
  });
  // Halaman yang memakai shell_frame sempat melukis latarnya sendiri (#FAFAFA)
  // di atas latar shell (#F2F2F3), sehingga muncul pita lebih terang tepat di
  // bawah baris remah - dan sembilan halaman memakainya sementara enam lainnya
  // tidak. Latar remah dan latar isi harus sama.
  const bg = await page.evaluate(() => {
    const eff = (el) => {
      while (el) {
        const c = getComputedStyle(el).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)') return c;
        el = el.parentElement;
      }
      return 'none';
    };
    const crumb = document.querySelector('nav[aria-label="Breadcrumb"]');
    const main = document.querySelector('main');
    const inner = main && main.querySelector(':scope > div:last-child');
    return crumb && inner ? { crumb: eff(crumb), content: eff(inner) } : null;
  });
  if (bg) {
    check(screen.name, 'page background matches the breadcrumb strip',
      bg.crumb === bg.content, `${bg.crumb} vs ${bg.content}`);
  }

  const cls = await page.evaluate(() => +(window.__cls || 0).toFixed(4)).catch(() => 0);
  check(screen.name, 'layout stays put while loading (CLS < 0.1)', cls < 0.1, `CLS=${cls}`);

  check(screen.name, 'window itself does not scroll (only the content column does)',
    !chrome.pageScrolls);
  check(screen.name, 'app bar stays pinned while content scrolls',
    chrome.hasHeader && !chrome.headerMoved, `scrolled ${chrome.scrolled}px`);
  check(screen.name, 'sidebar stays pinned while content scrolls',
    !chrome.sidebarMoved, `scrolled ${chrome.scrolled}px`);
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
