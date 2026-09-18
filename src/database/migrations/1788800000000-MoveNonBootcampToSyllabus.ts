import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * S2 dari docs/syllabus-table-plan.md - satu-satunya tahap yang menyentuh data
 * yang sudah ada.
 *
 * Memindahkan isi program non-bootcamp dari jalur `weeks -> session` ke jalur
 * `syllabus`, lalu membersihkan jalur lamanya.
 *
 * YANG HILANG DAN TIDAK BISA DIKEMBALIKAN
 *
 * `attendance` milik program non-bootcamp dibuang. Datanya terwakili
 * `syllabus_progress.completedAt`, tetapi TIDAK sepadan, dan `down()` bukan
 * kebalikan yang sempurna. Diukur pada data nyata saat migrasi ini ditulis:
 *
 *   sebelum up()   : 5 sesi, 1 absensi, 3 wadah weeks
 *   setelah down() : 5 sesi, 2 absensi, 3 wadah weeks
 *
 * Absensi bertambah satu karena `down()` membangunnya ulang dari SETIAP
 * progres yang selesai, sedangkan aslinya hanya satu sesi yang benar-benar
 * punya baris absensi - yang satunya ditandai selesai oleh tambalan
 * `openNextSessionWhenLogbookIsOff`, yang memang tidak pernah membuat absensi.
 * Keterangan itu tidak ada di `syllabus_progress`, jadi tidak bisa
 * dikembalikan. Status juga dipukul rata 'present' dengan catatan kosong.
 *
 * Artinya: `down()` mengembalikan program ke keadaan yang BISA DIPAKAI, bukan
 * ke keadaan yang identik. Ini disadari dan disetujui pemilik.
 *
 * Selebihnya kembali utuh: silabus menjadi sesi di dalam wadah `weeks`
 * tersirat, beserta materi, tugas, jawaban, komentar, logbook, dan progresnya.
 * Wadah dibangun ulang untuk SEMUA program non-bootcamp - termasuk yang belum
 * punya silabus sama sekali, supaya tidak ada program yang pulang tanpa wadah.
 *
 * Idempoten di kedua arah: program yang silabusnya sudah ada dilewati.
 */
export class MoveNonBootcampToSyllabus1788800000000
  implements MigrationInterface
{
  name = 'MoveNonBootcampToSyllabus1788800000000';

  private async ready(q: QueryRunner): Promise<boolean> {
    const [row] = await q.query(
      `SELECT to_regclass('public.syllabus') IS NOT NULL
          AND to_regclass('public.session')  IS NOT NULL
          AND EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name='course' AND column_name='program_type') AS ok`,
    );
    return !!row?.ok;
  }

  public async up(q: QueryRunner): Promise<void> {
    if (!(await this.ready(q))) return;

    // 1. Sesi -> silabus. `sessionOrder` bisa NULL atau kembar pada data lama,
    //    sedangkan syllabus.order dijaga UNIQUE per program - jadi urutannya
    //    dinomori ulang dengan row_number, bukan disalin mentah.
    await q.query(`
      INSERT INTO "syllabus" ("id", "courseId", "order", "title", "description", "is_final", "createdAt", "updatedAt")
      SELECT s.id, c.id,
             row_number() OVER (PARTITION BY c.id ORDER BY s."sessionOrder" NULLS LAST, s."createdAt", s.id),
             COALESCE(NULLIF(s.topic, ''), 'Untitled'),
             NULL, s.is_final, s."createdAt", s."updatedAt"
        FROM "course" c
        JOIN "weeks"   w ON w."courseId" = c.id
        JOIN "session" s ON s."weeksId"  = w.id
       WHERE c.program_type = 'non_bootcamp'
         AND NOT EXISTS (SELECT 1 FROM "syllabus" y WHERE y.id = s.id)`);

    // id sesi dipakai ulang sebagai id silabus (lihat SELECT s.id di atas),
    // sehingga anak-anaknya bisa dipindahkan tanpa tabel pemetaan.
    await q.query(`
      INSERT INTO "syllabus_material" ("id","syllabusId","title","file","fileType","createdAt","updatedAt")
      SELECT m.id, m."sessionId", m.title, m.file, m."fileType", m."createdAt", m."updatedAt"
        FROM "material" m
        JOIN "syllabus" y ON y.id = m."sessionId"
       WHERE NOT EXISTS (SELECT 1 FROM "syllabus_material" x WHERE x.id = m.id)`);

    await q.query(`
      INSERT INTO "syllabus_assignment" ("id","syllabusId","title","file","createdAt","updatedAt")
      SELECT a.id, a."sessionId", a.title, a.file, a."createdAt", a."updatedAt"
        FROM "assignments" a
        JOIN "syllabus" y ON y.id = a."sessionId"
       WHERE NOT EXISTS (SELECT 1 FROM "syllabus_assignment" x WHERE x.id = a.id)`);

    // DISTINCT ON: syllabus_answer_task dijaga UNIQUE (taskId,userId),
    // sedangkan answer_task tidak - data lama bisa punya jawaban ganda untuk
    // satu tugas. Yang terbaru yang dibawa.
    await q.query(`
      INSERT INTO "syllabus_answer_task" ("id","taskId","userId","file","process","createdAt","updatedAt")
      SELECT DISTINCT ON (at."taskId", at."userId")
             at.id, at."taskId", at."userId", at.file, at.process, at."createdAt", at."updatedAt"
        FROM "answer_task" at
        JOIN "syllabus_assignment" sa ON sa.id = at."taskId"
       WHERE at."userId" IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM "syllabus_answer_task" x WHERE x.id = at.id)
       ORDER BY at."taskId", at."userId", at."updatedAt" DESC`);

    await q.query(`
      INSERT INTO "syllabus_comment" ("id","answerId","comment","createdAt","updatedAt")
      SELECT cm.id, cm."assignment_answerId", cm.comment, cm."createdAt", cm."updatedAt"
        FROM "comments" cm
        JOIN "syllabus_answer_task" sat ON sat.id = cm."assignment_answerId"
       WHERE NOT EXISTS (SELECT 1 FROM "syllabus_comment" x WHERE x.id = cm.id)`);

    await q.query(`
      INSERT INTO "syllabus_logbook" ("id","syllabusId","userId","activity","activity_details","documentation","obstacles","other_documentation","process","createdAt","updatedAt")
      SELECT l.id, l."sessionId", l."userId", l.activity, l.activity_details,
             l.documentation, l.obstacles, l.other_documentation, l.process,
             l."createdAt", l."updatedAt"
        FROM "logbook" l
        JOIN "syllabus" y ON y.id = l."sessionId"
       WHERE l."userId" IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM "syllabus_logbook" x WHERE x.id = l.id)`);

    // 2. Progres. `isAttended` menjadi `completedAt` - PERKIRAAN, karena tidak
    //    ada stempel waktu penyelesaian yang sebenarnya; `updatedAt` yang
    //    paling dekat. DISTINCT ON karena session_progresses tidak dijaga unik.
    await q.query(`
      INSERT INTO "syllabus_progress" ("id","syllabusId","userId","completedAt","logbookOk","createdAt","updatedAt")
      SELECT DISTINCT ON (sp."sessionId", sp."userId")
             sp.id, sp."sessionId", sp."userId",
             CASE WHEN sp."isAttended" THEN sp."updatedAt" ELSE NULL END,
             sp.logbook, sp."createdAt", sp."updatedAt"
        FROM "session_progresses" sp
        JOIN "syllabus" y ON y.id = sp."sessionId"
       WHERE sp."userId" IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM "syllabus_progress" x WHERE x.id = sp.id)
       ORDER BY sp."sessionId", sp."userId", sp."updatedAt" DESC`);

    // 3. Kuis pindah dari minggu tersirat ke program.
    await q.query(`
      UPDATE "quiz" q
         SET "courseId" = w."courseId", "weeksId" = NULL
        FROM "weeks" w
        JOIN "course" c ON c.id = w."courseId"
       WHERE q."weeksId" = w.id
         AND c.program_type = 'non_bootcamp'
         AND q."courseId" IS NULL`);

    // 4. Jalur lama dibuang. Anak-anak session ikut lewat CASCADE; `weeks`
    //    menyapu `session` dan `week_progresses` dengan cara yang sama.
    //    Inilah titik di mana `attendance` milik program SPL hilang.
    await q.query(`
      DELETE FROM "weeks" w
       USING "course" c
       WHERE w."courseId" = c.id
         AND c.program_type = 'non_bootcamp'`);
  }

  public async down(q: QueryRunner): Promise<void> {
    if (!(await this.ready(q))) return;

    // Wadah `weeks` tersirat dibangun ulang, satu per program.
    await q.query(`
      INSERT INTO "weeks" ("week_number", "description", "is_final", "courseId")
      SELECT 1, c.name, true, c.id
        FROM "course" c
       WHERE c.program_type = 'non_bootcamp'
         AND NOT EXISTS (SELECT 1 FROM "weeks" w WHERE w."courseId" = c.id)`);

    await q.query(`
      INSERT INTO "session" ("id","topic","sessionOrder","is_final","weeksId","createdAt","updatedAt")
      SELECT y.id, y.title, y."order", y.is_final, w.id, y."createdAt", y."updatedAt"
        FROM "syllabus" y
        JOIN "weeks" w ON w."courseId" = y."courseId"
       WHERE NOT EXISTS (SELECT 1 FROM "session" s WHERE s.id = y.id)`);

    await q.query(`
      INSERT INTO "material" ("id","sessionId","title","file","fileType","createdAt","updatedAt")
      SELECT m.id, m."syllabusId", m.title, m.file, m."fileType", m."createdAt", m."updatedAt"
        FROM "syllabus_material" m
       WHERE NOT EXISTS (SELECT 1 FROM "material" x WHERE x.id = m.id)`);

    await q.query(`
      INSERT INTO "assignments" ("id","sessionId","title","file","createdAt","updatedAt")
      SELECT a.id, a."syllabusId", a.title, a.file, a."createdAt", a."updatedAt"
        FROM "syllabus_assignment" a
       WHERE NOT EXISTS (SELECT 1 FROM "assignments" x WHERE x.id = a.id)`);

    await q.query(`
      INSERT INTO "answer_task" ("id","taskId","userId","file","process","createdAt","updatedAt")
      SELECT a.id, a."taskId", a."userId", a.file, a.process, a."createdAt", a."updatedAt"
        FROM "syllabus_answer_task" a
       WHERE NOT EXISTS (SELECT 1 FROM "answer_task" x WHERE x.id = a.id)`);

    await q.query(`
      INSERT INTO "comments" ("id","assignment_answerId","comment","createdAt","updatedAt")
      SELECT c.id, c."answerId", c.comment, c."createdAt", c."updatedAt"
        FROM "syllabus_comment" c
       WHERE NOT EXISTS (SELECT 1 FROM "comments" x WHERE x.id = c.id)`);

    await q.query(`
      INSERT INTO "logbook" ("id","sessionId","userId","activity","activity_details","documentation","obstacles","other_documentation","process","createdAt","updatedAt")
      SELECT l.id, l."syllabusId", l."userId", l.activity, l.activity_details,
             l.documentation, l.obstacles, l.other_documentation, l.process,
             l."createdAt", l."updatedAt"
        FROM "syllabus_logbook" l
       WHERE NOT EXISTS (SELECT 1 FROM "logbook" x WHERE x.id = l.id)`);

    await q.query(`
      INSERT INTO "session_progresses" ("id","sessionId","userId","isAttended","logbook","createdAt","updatedAt")
      SELECT p.id, p."syllabusId", p."userId", p."completedAt" IS NOT NULL,
             p."logbookOk", p."createdAt", p."updatedAt"
        FROM "syllabus_progress" p
       WHERE NOT EXISTS (SELECT 1 FROM "session_progresses" x WHERE x.id = p.id)`);

    // Absensi dibangun ulang dari progres yang selesai. BENTUKNYA kembali,
    // ISINYA tidak: status dipukul rata 'present' dan catatannya kosong,
    // karena data aslinya memang sudah tidak ada.
    await q.query(`
      INSERT INTO "attendance" ("status","attendanceTime","notes","userId","sessionId")
      SELECT 'present', p."completedAt", '', p."userId", p."syllabusId"
        FROM "syllabus_progress" p
       WHERE p."completedAt" IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM "attendance" a
            WHERE a."userId" = p."userId" AND a."sessionId" = p."syllabusId")`);

    await q.query(`
      INSERT INTO "week_progresses" ("process","quiz","userId","weekId")
      SELECT true, false, uc."userId", w.id
        FROM "weeks" w
        JOIN "course" c ON c.id = w."courseId"
        JOIN "user_courses" uc ON uc."courseId" = c.id
       WHERE c.program_type = 'non_bootcamp'
         AND NOT EXISTS (
           SELECT 1 FROM "week_progresses" wp
            WHERE wp."weekId" = w.id AND wp."userId" = uc."userId")`);

    await q.query(`
      UPDATE "quiz" q
         SET "weeksId" = w.id, "courseId" = NULL
        FROM "weeks" w
       WHERE w."courseId" = q."courseId"
         AND q."courseId" IS NOT NULL`);

    // Silabus dibuang terakhir; anaknya ikut lewat CASCADE.
    await q.query(`
      DELETE FROM "syllabus" y
       USING "course" c
       WHERE y."courseId" = c.id
         AND c.program_type = 'non_bootcamp'`);
  }
}
