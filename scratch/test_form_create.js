const path = require('path');
const { mapCreateProgram } = require(path.resolve(__dirname, '../dist/courses/mappers/create-course.mapper'));
const { CreateCoursesDto } = require(path.resolve(__dirname, '../dist/courses/dto/create-courses.dto'));
const { ValidationPipe } = require('@nestjs/common');

const pipe = new ValidationPipe({ whitelist: true, transform: true });

async function testForm(name, body, role = 'super_admin') {
  console.log(`\n=== Testing ${name} ===`);
  try {
    const dto = mapCreateProgram(body, { role });
    console.log('DTO:', JSON.stringify(dto, null, 2));
    const transformed = await pipe.transform(dto, {
      type: 'body',
      metatype: CreateCoursesDto,
      data: ''
    });
    console.log('PASS!');
  } catch (err) {
    console.log('FAIL! Response:', JSON.stringify(err.getResponse ? err.getResponse() : err));
  }
}

async function run() {
  // Test Form 1: admin/course/create.hbs with valid data
  await testForm('create.hbs with valid data', {
    name: 'Fullstack Web Development',
    group: 'https://chat.whatsapp.com/12345678',
    categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    courseTypeId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    program_type: 'bootcamp',
    logbook_enabled: 'true',
    paid_check: 'true',
    quota: '50',
    price: '2000000',
    promo: '1500000',
    method: 'online',
    mentoringsId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    description_id: 'Belajar web dev',
    description_en: 'Learn web dev',
    description_ja: 'Web開発を学ぶ',
    month: '3',
    date_registration: '2026-10-01',
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    lokasi_id: 'Online',
    lokasi_en: 'Online',
    lokasi_ja: 'オンライン',
    locationLink: 'https://zoom.us/j/123456',
    technologiesIds: ['d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'],
    uploadedImageUrls: ['/asset/program/1790824521859-s04xo9xec6d.jpg']
  });

  // Test Form 2: What if super_admin leaves Tag (courseTypeId) empty because in UI it says "Tag" without *?
  await testForm('create.hbs without Tag (courseTypeId empty)', {
    name: 'Fullstack Web Development',
    group: 'https://chat.whatsapp.com/12345678',
    categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    courseTypeId: '',
    program_type: 'bootcamp',
    paid_check: 'true',
    price: '2000000',
    month: '3',
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    description_id: 'Belajar',
    description_en: 'Learn',
    description_ja: '学ぶ',
    lokasi_id: 'Online',
    lokasi_en: 'Online',
    lokasi_ja: 'オンライン',
    locationLink: 'https://zoom.us',
    technologiesIds: ['d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'],
    uploadedImageUrls: ['/asset/program/sample.jpg']
  });

  // Test Form 3: What if locationLink is NOT a URL?
  await testForm('create.hbs with non-URL locationLink', {
    name: 'Fullstack Web Development',
    group: 'https://chat.whatsapp.com/12345678',
    categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    courseTypeId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    program_type: 'bootcamp',
    paid_check: 'true',
    price: '2000000',
    month: '3',
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    description_id: 'Belajar',
    description_en: 'Learn',
    description_ja: '学ぶ',
    lokasi_id: 'Online',
    lokasi_en: 'Online',
    lokasi_ja: 'オンライン',
    locationLink: 'Online',
    uploadedImageUrls: ['/asset/program/sample.jpg']
  });

  // Test Form 4: formCreate.hbs (from Category Detail -> Add Program)
  // In formCreate.hbs, categoryId select is disabled: <select name="categoryId" disabled>
  // So body does NOT have categoryId!
  await testForm('formCreate.hbs when categoryId is disabled in form', {
    name: 'Fullstack Web Development',
    group: 'https://chat.whatsapp.com/12345678',
    // categoryId is NOT in body because disabled
    jenis_kelasId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    program_type: 'bootcamp',
    paid_check: 'true',
    quota: '50',
    price: '2000000',
    promo: '0',
    method: 'online',
    mentoringsId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    description: { id: 'Belajar', en: 'Learn', ja: '学ぶ' },
    locations: { id: 'Online', en: 'Online', ja: 'オンライン' },
    locationLink: 'https://maps.google.com',
    month: '3',
    date_registration: '2026-10-01',
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    technologiesIds: ['d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'],
    uploadedImageUrls: ['/asset/program/sample.jpg']
  });

  // Test Form 5: formCreate.hbs in createKelas after our fix (body.categoryId = categoryId)
  const categoryIdFromParam = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  await testForm('formCreate.hbs in createKelas (after fix: body.categoryId = categoryId)', {
    name: 'Fullstack Web Development',
    group: 'https://chat.whatsapp.com/12345678',
    categoryId: categoryIdFromParam,
    jenis_kelasId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    program_type: 'bootcamp',
    paid_check: 'true',
    quota: '50',
    price: '2000000',
    promo: '0',
    method: 'online',
    mentoringsId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    description: { id: 'Belajar', en: 'Learn', ja: '学ぶ' },
    locations: { id: 'Online', en: 'Online', ja: 'オンライン' },
    locationLink: 'https://maps.google.com',
    month: '3',
    date_registration: '2026-10-01',
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    technologiesIds: ['d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'],
    uploadedImageUrls: ['/asset/program/sample.jpg']
  });
}

run();
