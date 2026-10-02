const path = require('path');
const { Client } = require('pg');
require('dotenv').config();
const { mapUpdateProgram } = require(path.resolve('./dist/courses/mappers/create-course.mapper'));
const { UpdateCoursesDto } = require(path.resolve('./dist/courses/dto/update-courses.dto'));
const { ValidationPipe } = require('@nestjs/common');

const pipe = new ValidationPipe({ whitelist: true, transform: true });

async function testAll() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await client.connect();
  const res = await client.query('SELECT * FROM course ORDER BY "createdAt" DESC LIMIT 5');
  await client.end();

  for (const course of res.rows) {
    console.log('\n--- Testing Course:', course.id, course.name, '---');
    const body = {
      name: course.name,
      group: course.group,
      categoryId: course.categoryId,
      courseTypeId: course.courseTypeId || '',
      program_type: course.program_type || 'bootcamp',
      logbook_enabled: String(course.logbook_enabled),
      paid_check: String(course.checkPaid),
      method: course.method || 'online',
      description_id: course.description?.id || '',
      description_en: course.description?.en || '',
      description_ja: course.description?.ja || '',
      lokasi_id: course.locations?.id || '',
      lokasi_en: course.locations?.en || '',
      lokasi_ja: course.locations?.ja || '',
      locationLink: course.locationLink || '',
      startDate: course.startDate ? new Date(course.startDate).toISOString().slice(0, 10) : '',
      endDate: course.startEnd ? new Date(course.startEnd).toISOString().slice(0, 10) : '',
      date_registration: course.date_registration ? new Date(course.date_registration).toISOString().slice(0, 10) : '',
      month: course.month ? String(course.month) : '',
      day: course.day ? String(course.day) : '',
      quota: course.quota ? String(course.quota) : '',
      price: course.price ? String(course.price) : '',
      promo: course.promo ? String(course.promo) : '',
      form: course.form || '',
      time_start: course.time_start || '',
      time_end: course.time_end || '',
      technologiesIds: ['d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44']
    };

    try {
      const dto = mapUpdateProgram(body, { role: 'super_admin' });
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
}

testAll().catch(console.error);
