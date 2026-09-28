import { CreateCoursesDto } from '../dto/create-courses.dto';
import { UpdateCoursesDto } from '../dto/update-courses.dto';
import {
  Method,
  PROGRAM_TYPES,
  ProgramType,
} from 'src/entities/course.entity';

/**
 * Anti-Corruption Layer untuk payload form "Create Program".
 *
 * HTML form (wire format) memakai nama field yang berbeda dari kolom entitas,
 * dan ada dua generasi form (lama & baru) dengan bentuk yang berbeda:
 *   - Form LAMA  (admin/course/formCreate.hbs, left_column/right_column):
 *       jenis_kelasId, description[id|en|ja], locations[id|en|ja],
 *       materialsId[]/En[]/Ja[], learningTargetsId[]/En[]/Ja[], criteriaId[]/En[]/Ja[]
 *   - Form BARU  (admin/program/create.hbs, card_01..06):
 *       courseTypeId, description_id/en/ja, lokasi_id/en/ja,
 *       materialsId[]/En[]/Ja[], dst (sama untuk list)
 *
 * Semua variasi di atas dinormalisasi di sini menjadi satu kontrak domain
 * `CreateCoursesDto` (nama field = kolom entitas Course), sehingga service
 * tidak perlu tahu bentuk wire-nya. Multer (via append-field) sudah mengubah
 * notasi kurung menjadi array/objek, jadi mapper tinggal menyamakan bentuknya.
 */

type WireBody = Record<string, unknown>;
type LangMap = { id: string; en: string; ja: string };

const asText = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.length ? asText(value[0]) : '';
  switch (typeof value) {
    case 'string':
      return value.trim();
    case 'number':
    case 'boolean':
    case 'bigint':
      return String(value).trim();
    default:
      return '';
  }
};

const asArray = (value: unknown): string[] => {
  if (value === undefined || value === null) return [];
  const arr: unknown[] = Array.isArray(value) ? value : [value];
  return arr.map((v) => asText(v)).filter((v) => v !== '');
};

const pickMultilang = (
  body: WireBody,
  flatPrefix: string,
  nestedKey: string,
): LangMap => {
  const result: LangMap = { id: '', en: '', ja: '' };

  // Bentuk nested: description[id] / locations[id] (form lama)
  const nested: unknown = body[nestedKey];
  if (nested !== null && typeof nested === 'object') {
    const obj = nested as Record<string, unknown>;
    result.id = asText(obj.id);
    result.en = asText(obj.en);
    result.ja = asText(obj.ja);
  }

  // Bentuk flat: description_id / lokasi_id (form baru) ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â menang atas nested
  if (body[`${flatPrefix}_id`] !== undefined) {
    result.id = asText(body[`${flatPrefix}_id`]);
  }
  if (body[`${flatPrefix}_en`] !== undefined) {
    result.en = asText(body[`${flatPrefix}_en`]);
  }
  if (body[`${flatPrefix}_ja`] !== undefined) {
    result.ja = asText(body[`${flatPrefix}_ja`]);
  }

  return result;
};

const toInt = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : Math.trunc(value);
  }
  if (typeof value !== 'string') return undefined;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
};

const toBool = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  const v = value.toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true;
  if (v === 'false' || v === '0' || v === 'no' || v === 'off') return false;
  return undefined;
};

const toMethod = (value: unknown): Method =>
  value === 'offline' ? 'offline' : 'online';

/**
 * Nilai enum tipe program dari form. Nilai yang tidak dikenal (termasuk medan
 * yang tidak dikirim sama sekali) menjadi `undefined`, sehingga default kolom
 * 'bootcamp' yang berlaku - bukan tipe karangan.
 */
function toProgramType(raw: unknown): ProgramType | undefined {
  const value = asText(raw);
  return (PROGRAM_TYPES as string[]).includes(value)
    ? (value as ProgramType)
    : undefined;
}

export function mapCreateProgram(
  body: WireBody,
  user?: { role?: string; id?: string },
): CreateCoursesDto {
  const description = pickMultilang(body, 'description', 'description');
  const locations = pickMultilang(body, 'lokasi', 'locations');

  // Program Type: form baru sudah `courseTypeId`, form lama masih `jenis_kelasId`
  const courseTypeId = asText(body.courseTypeId ?? body.jenis_kelasId);

  const paidCheckRaw = toBool(body.paid_check) ?? false;
  const role = user?.role;

  const dto: CreateCoursesDto = {
    name: asText(body.name),
    group: asText(body.group),
    method: toMethod(body.method),
    categoryId: asText(body.categoryId),
    courseTypeId,
    description,
    locations,
    locationLink: asText(body.locationLink),
    materialsId: asArray(body.materialsId),
    materialsEn: asArray(body.materialsEn),
    materialsJa: asArray(body.materialsJa),
    learningTargetsId: asArray(body.learningTargetsId),
    learningTargetsEn: asArray(body.learningTargetsEn),
    learningTargetsJa: asArray(body.learningTargetsJa),
    startDate: asText(body.startDate),
    endDate: asText(body.endDate),
    // Bentuk belajar. Form lama tidak mengirimkannya sama sekali, dan itu
    // memang benar: tanpa nilai, programnya bootcamp - sama seperti seluruh
    // program yang sudah ada.
    programType: toProgramType(body.program_type ?? body.programType),
    // Hanya non_bootcamp yang boleh mematikan logbook; program lain selalu
    // menyala apa pun isi medannya.
    logbookEnabled:
      toProgramType(body.program_type ?? body.programType) === 'non_bootcamp'
        ? toBool(body.logbook_enabled ?? body.logbookEnabled) ?? true
        : true,
  };

  const image = asArray(body.uploadedImageUrls)[0];
  if (image) dto.image = image;

  const mentoringsId = asText(body.mentoringsId);
  if (mentoringsId) dto.mentoringsId = mentoringsId;

  const technologiesIds = asArray(body.technologiesIds);
  if (technologiesIds.length) dto.technologiesIds = technologiesIds;

  const criteriaId = asArray(body.criteriaId);
  const criteriaEn = asArray(body.criteriaEn);
  const criteriaJa = asArray(body.criteriaJa);
  if (criteriaId.length || criteriaEn.length || criteriaJa.length) {
    dto.criteriaId = criteriaId;
    dto.criteriaEn = criteriaEn;
    dto.criteriaJa = criteriaJa;
  }

  // Schedule: month (paid) XOR day (free) ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â samakan semantik controller lama:
  // bila month terisi, day dinolkan; bila day terisi, month dinolkan.
  const month = toInt(body.month);
  const day = toInt(body.day);
  if (month) {
    dto.month = month;
    dto.day = 0;
  } else if (day) {
    dto.day = day;
    dto.month = 0;
  }

  const price = toInt(body.price);
  if (price !== undefined) dto.price = price;
  const promo = toInt(body.promo);
  if (promo !== undefined) dto.promo = promo;
  const quota = toInt(body.quota);
  if (quota !== undefined) dto.quota = quota;

  const form = asText(body.form);
  if (form) dto.form = form;

  const timeStart = asText(body.time_start);
  if (timeStart) dto.time_start = timeStart;
  const timeEnd = asText(body.time_end);
  if (timeEnd) dto.time_end = timeEnd;

  const dateRegistration = asText(body.date_registration);
  if (dateRegistration) dto.date_registration = dateRegistration;

  // Business rule yang sebelumnya tersebar di controller:
  // paid_check true  -> checkPaid, promo default 0, process sesuai role
  // paid_check false -> harga 0, process sesuai role
  dto.checkPaid = paidCheckRaw;
  if (paidCheckRaw) {
    dto.form = '';
    dto.promo = dto.promo ?? 0;
  } else {
    dto.price = 0;
    dto.promo = 0;
  }
  if (role === 'super_admin') {
    dto.process = 'approved';
  } else if (role === 'admin') {
    dto.process = 'process';
    dto.launch = false; // default launch false untuk admin
  }

  const launch = toBool(body.launch);
  if (launch !== undefined) dto.launch = launch;

  return dto;
}

/**
 * Normalisasi payload form "Edit Program" (PATCH /program/:courseId).
 *
 * Form edit (admin/course/edit.hbs, partial admin/program/edit/*) memakai
 * nama wire yang sama dengan form lama: jenis_kelasId, description[id|en|ja],
 * locations[id|en|ja], materialsId[]/En[]/Ja[], dst. Hasilnya adalah partial
 * DTO (hanya field yang dikirim) agar PATCH tidak menghapus kolom lain.
 * Flag `technologiesIds_sent` (hidden di form edit) menandakan section
 * technology memang dirender ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â bila tidak ada technologiesIds terpilih,
 * kembalikan array kosong (clear), samakan semantik controller lama.
 */
export function mapUpdateProgram(
  body: WireBody,
  user?: { role?: string; id?: string },
): UpdateCoursesDto {
  const dto: UpdateCoursesDto = {};

  if (body.name !== undefined) dto.name = asText(body.name);
  if (body.group !== undefined) dto.group = asText(body.group);
  if (body.method === 'online' || body.method === 'offline') {
    dto.method = body.method;
  }

  const categoryId = asText(body.categoryId);
  if (categoryId) dto.categoryId = categoryId;

  const courseTypeId = asText(body.courseTypeId ?? body.jenis_kelasId);
  if (courseTypeId) dto.courseTypeId = courseTypeId;

  const mentoringsId = asText(body.mentoringsId);
  if (mentoringsId) dto.mentoringsId = mentoringsId;

  if (body.description !== undefined || body.description_id !== undefined) {
    dto.description = pickMultilang(body, 'description', 'description');
  }
  if (body.locations !== undefined || body.lokasi_id !== undefined) {
    dto.locations = pickMultilang(body, 'lokasi', 'locations');
  }

  if (body.locationLink !== undefined) {
    dto.locationLink = asText(body.locationLink);
  }

  const listKeys = [
    'materialsId',
    'materialsEn',
    'materialsJa',
    'learningTargetsId',
    'learningTargetsEn',
    'learningTargetsJa',
    'criteriaId',
    'criteriaEn',
    'criteriaJa',
  ] as const;
  for (const key of listKeys) {
    if (body[key] !== undefined) {
      Object.assign(dto, { [key]: asArray(body[key]) });
    }
  }

  // Technologies: kosongkan bila section dirender tapi tidak ada yang dipilih.
  if (body.technologiesIds !== undefined) {
    dto.technologiesIds = asArray(body.technologiesIds);
  } else if (body.technologiesIds_sent !== undefined) {
    dto.technologiesIds = [];
  }

  const month = toInt(body.month);
  if (month !== undefined) dto.month = month;
  const day = toInt(body.day);
  if (day !== undefined) dto.day = day;

  const startDate = asText(body.startDate);
  if (startDate) dto.startDate = startDate;
  const endDate = asText(body.endDate);
  if (endDate) dto.endDate = endDate;

  const price = toInt(body.price);
  if (price !== undefined) dto.price = price;
  const promo = toInt(body.promo);
  if (promo !== undefined) dto.promo = promo;
  const quota = toInt(body.quota);
  if (quota !== undefined) dto.quota = quota;

  if (body.form !== undefined) dto.form = asText(body.form);

  const timeStart = asText(body.time_start);
  if (timeStart) dto.time_start = timeStart;
  const timeEnd = asText(body.time_end);
  if (timeEnd) dto.time_end = timeEnd;

  const dateRegistration = asText(body.date_registration);
  if (dateRegistration) dto.date_registration = dateRegistration;

  if (body.paid_check !== undefined) {
    dto.checkPaid = toBool(body.paid_check);
  }

  const programType = toProgramType(body.program_type ?? body.programType);
  if (programType) {
    dto.programType = programType;
    dto.logbookEnabled =
      programType === 'non_bootcamp'
        ? toBool(body.logbook_enabled ?? body.logbookEnabled) ?? true
        : true;
  }

  if (user?.role === 'super_admin') {
    dto.process = 'approved';
  }

  const image = asArray(body.uploadedImageUrls)[0];
  if (image) dto.image = image;

  return dto;
}
