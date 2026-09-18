import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Menandai tamat program SPL yang seluruh silabusnya SUDAH selesai.
 *
 * Aturannya (keputusan pemilik 2026-09-18): semua silabus selesai, baru tamat.
 * Mulai sekarang `SyllabusService.refreshCourseCompletion()` yang menjaganya
 * setiap kali student menandai silabus selesai atau mentor menilai logbook.
 * Migrasi ini untuk yang TERLANJUR selesai sebelum kode itu ada.
 *
 * Tanpa ini mereka tidak akan pernah tertolong: `markComplete()` berhenti lebih
 * awal kalau silabusnya sudah selesai, jadi tidak ada lagi tindakan yang
 * memicu perhitungan ulang. Ditemukan hidup di basis data lokal - "Dasar
 * Pemrograman Web (SPL)", 3 dari 3 silabus selesai, `progress` masih false,
 * sehingga tombol sertifikatnya tidak pernah muncul.
 *
 * Definisi "selesai" dijaga SAMA PERSIS dengan `SyllabusService.isDone()`:
 * `completedAt` terisi, ditambah `logbookOk` kalau program memakai logbook.
 * Kalau di sini lebih longgar, akan ada program yang dinyatakan tamat padahal
 * silabus terakhirnya masih terkunci bagi studentnya sendiri.
 *
 * Logbook dianggap menyala kecuali `logbook_enabled` benar-benar `false` -
 * cerminan `capabilitiesForCourse()`, di mana kolom itu hanya berarti pada
 * program yang memang boleh mematikannya.
 *
 * Program BOOTCAMP tidak disentuh sama sekali: ketamatannya ditentukan lulus
 * kuis minggu final, dan itu bukan urusan migrasi ini.
 *
 * Hanya menyalakan, tidak pernah mematikan. Migrasi ini menambal data lama;
 * mencabut ketamatan seseorang berdasarkan tebakan bukan haknya.
 */
export class BackfillSyllabusCourseCompletion1789000000000
  implements MigrationInterface
{
  name = 'BackfillSyllabusCourseCompletion1789000000000';

  public async up(q: QueryRunner): Promise<void> {
    const [ready] = await q.query(
      `SELECT to_regclass('public.syllabus') IS NOT NULL
          AND to_regclass('public.syllabus_progress') IS NOT NULL
          AND to_regclass('public.user_courses') IS NOT NULL AS ok`,
    );
    if (!ready?.ok) return;

    await q.query(`
      UPDATE "user_courses" uc
         SET "progress" = true
        FROM "course" c
       WHERE c.id = uc."courseId"
         AND c.program_type = 'non_bootcamp'
         AND uc."progress" IS DISTINCT FROM true
         -- program harus punya silabus; yang kosong tidak pernah tamat
         AND EXISTS (SELECT 1 FROM "syllabus" s WHERE s."courseId" = c.id)
         -- dan tidak boleh ada satu pun silabus yang belum selesai
         AND NOT EXISTS (
               SELECT 1
                 FROM "syllabus" s
                 LEFT JOIN "syllabus_progress" sp
                        ON sp."syllabusId" = s.id
                       AND sp."userId" = uc."userId"
                WHERE s."courseId" = c.id
                  AND (
                        sp.id IS NULL
                     OR sp."completedAt" IS NULL
                     OR (COALESCE(c.logbook_enabled, true) <> false
                         AND sp."logbookOk" IS DISTINCT FROM true)
                  )
             )
    `);
  }

  /**
   * Sengaja tidak mengembalikan apa pun.
   *
   * Migrasi ini tidak menyimpan mana baris yang ia ubah dan mana yang memang
   * sudah `true` sejak awal, jadi satu-satunya "pembalikan" yang mungkin adalah
   * mematikan ketamatan semua program SPL - termasuk milik orang yang
   * mendapatkannya dengan benar lewat kode baru. Diam lebih aman daripada itu.
   */
  public async down(): Promise<void> {
    // tidak ada
  }
}
