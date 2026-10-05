const path = require('path');
const { mapUpdateProgram } = require(path.resolve(__dirname, '../dist/courses/mappers/create-course.mapper'));
const { UpdateCoursesDto } = require(path.resolve(__dirname, '../dist/courses/dto/update-courses.dto'));
const { ValidationPipe } = require('@nestjs/common');

const pipe = new ValidationPipe({ whitelist: true, transform: true });

async function testEdit(name, body, role = 'super_admin') {
  console.log(`\n=== Testing Edit: ${name} ===`);
  try {
    const dto = mapUpdateProgram(body, { role });
    console.log('DTO:', JSON.stringify(dto, null, 2));
    const transformed = await pipe.transform(dto, {
      type: 'body',
      metatype: UpdateCoursesDto,
      data: ''
    });
    console.log('PASS!');
  } catch (err) {
    console.log('FAIL! Response:', JSON.stringify(err.getResponse ? err.getResponse() : err));
  }
}

async function run() {
  // Let's simulate a standard edit form payload submitted by browser from edit.hbs
  // In edit.hbs, the form has:
  // name, group, categoryId, courseTypeId, program_type, logbook_enabled, method,
  // description_id, description_en, description_ja,
  // lokasi_id, lokasi_en, lokasi_ja, locationLink,
  // time_start, time_end, date_registration, month, day, startDate, endDate,
  // technologiesIds[], technologiesIds_sent (if any),
  // paid_check, quota, price, promo, form, mentoringsId
  await testEdit('Normal edit form submission (Paid Program)', {
    name: 'Fullstack Web Development',
    group: 'https://chat.whatsapp.com/12345678',
    categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    courseTypeId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    program_type: 'bootcamp',
    logbook_enabled: 'true',
    method: 'online',
    description_id: 'Belajar web dev',
    description_en: 'Learn web dev',
    description_ja: 'Web開発を学ぶ',
    lokasi_id: 'Online',
    lokasi_en: 'Online',
    lokasi_ja: 'オンライン',
    locationLink: 'https://zoom.us/j/123456',
    date_registration: '2026-10-01',
    month: '3',
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    paid_check: 'true',
    quota: '50',
    price: '2000000',
    promo: '1500000',
    mentoringsId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    technologiesIds: ['d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44']
  });

  // What about Free Program edit?
  await testEdit('Normal edit form submission (Free Program)', {
    name: 'Intro to Web',
    group: 'https://chat.whatsapp.com/12345678',
    categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    courseTypeId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    program_type: 'bootcamp',
    method: 'online',
    description_id: 'Belajar',
    description_en: 'Learn',
    description_ja: '学ぶ',
    lokasi_id: 'Online',
    lokasi_en: 'Online',
    lokasi_ja: 'オンライン',
    locationLink: 'https://zoom.us',
    time_start: '10:00',
    time_end: '12:00',
    date_registration: '2026-10-01',
    day: '5',
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    paid_check: 'false',
    quota: '50',
    form: 'https://forms.google.com/123',
    mentoringsId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    technologiesIds: ['d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44']
  });

  // What if user edits with empty form / optional fields?
  // Let's check what fields are in edit.hbs!
}

run();
