const fs = require('fs');
const Handlebars = require('handlebars');
const path = require('path');
const { hbsHelpers } = require(path.join(__dirname, '../dist/common/helpers/index'));

Handlebars.registerHelper(hbsHelpers);

Handlebars.registerHelper('getByLang', (val, lang) => typeof val === 'object' && val ? val[lang] : val);
Handlebars.registerHelper('default', (val, def) => val || def);

// Register dummy components
Handlebars.registerHelper('components/ui/super_admin/detail/field/index', function(options) {
  const label = options.hash ? options.hash.label : '';
  const val = options.hash ? options.hash.value : '';
  const body = options.fn ? options.fn(this) : '';
  return `[Field: ${label} -> ${val || body.trim()}]`;
});
Handlebars.registerPartial('components/ui/super_admin/detail/program_hero/index', '[Program Hero]');
Handlebars.registerPartial('components/ui/super_admin/detail/field/index', '[Field: {{label}} -> {{value}}]');
Handlebars.registerPartial('components/ui/super_admin/detail/section_card/index', '\n--- SECTION ---\n{{> @partial-block }}');

// Test admin form_info partial
const formInfoSrc = fs.readFileSync('src/views/partials/components/ui/admin/detail/form_info/index.hbs', 'utf8');
const formInfoTemplate = Handlebars.compile(formInfoSrc);

// Test admin basic_info partial
const basicInfoSrc = fs.readFileSync('src/views/partials/components/ui/admin/detail/basic_info/index.hbs', 'utf8');
const basicInfoTemplate = Handlebars.compile(basicInfoSrc);

// Sample paid course where checkPaid was false!
const testCoursePaid = {
  id: '123',
  checkPaid: false,
  price: 1000000,
  promo: 500000,
  category: { type: 'Paid Program' },
  time_start: '09:00',
  time_end: '17:00'
};

const testCourseFree = {
  id: '456',
  checkPaid: false,
  price: 0,
  promo: 0,
  form: 'https://google.com/form',
  category: { type: 'Free Program' },
  time_start: '09:00',
  time_end: '17:00'
};

console.log('=== ADMIN FORM INFO (PAID COURSE with checkPaid=false) ===');
console.log(formInfoTemplate({ course: testCoursePaid }));

console.log('=== ADMIN FORM INFO (FREE COURSE) ===');
console.log(formInfoTemplate({ course: testCourseFree }));

console.log('=== ADMIN BASIC INFO (PAID COURSE - Time Start/End should be hidden) ===');
console.log(basicInfoTemplate({ course: testCoursePaid }).includes('Time Start') ? 'FAIL: Time Start shown' : 'PASS: Time Start hidden');

console.log('=== ADMIN BASIC INFO (FREE COURSE - Time Start/End should be shown) ===');
console.log(basicInfoTemplate({ course: testCourseFree }).includes('Time Start') ? 'PASS: Time Start shown' : 'FAIL: Time Start hidden');

function registerPartials(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      registerPartials(fullPath, prefix ? `${prefix}/${file}` : file);
    } else if (file.endsWith('.hbs')) {
      const rawName = prefix ? `${prefix}/${file.slice(0, -4)}` : file.slice(0, -4);
      const partialName = rawName.replace(/\\/g, '/');
      Handlebars.registerPartial(partialName, fs.readFileSync(fullPath, 'utf8'));
    }
  }
}
registerPartials(path.join(__dirname, '../src/views/partials'));

const superAdminDetailSrc = fs.readFileSync('src/views/super_admin/course/detail.hbs', 'utf8');
const superAdminTemplate = Handlebars.compile(superAdminDetailSrc);

console.log('=== SUPER ADMIN (PAID COURSE) ===');
const saPaidOut = superAdminTemplate({ course: testCoursePaid });
const formInfoIdx = saPaidOut.indexOf('Form & Information');
if (formInfoIdx !== -1) {
  console.log('Form & Information card output:');
  console.log(saPaidOut.slice(formInfoIdx, formInfoIdx + 800));
} else {
  console.log('Form & Information not found in output!');
}

console.log('=== SUPER ADMIN (FREE COURSE) ===');
const saFreeOut = superAdminTemplate({ course: testCourseFree });
console.log(saFreeOut.includes('[Field: Price ->') ? 'FAIL: Price rendered in Free' : 'PASS: Price omitted in Free');
console.log(saFreeOut.includes('Time Start') ? 'PASS: Time Start rendered in Free' : 'FAIL: Time Start omitted in Free');

