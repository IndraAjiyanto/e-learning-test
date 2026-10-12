import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Hapus file gambar orphan yang terupload ke server (via EditorJS byFile)
 * tapi tidak pernah direferensikan di DB karena user batal submit form.
 *
 * Direktori yang dipantau:
 *   - public/asset/course/      → EditorJS di syllabus & final_assignment
 *   - public/asset/portfolio/temp/ → EditorJS di portfolio create/edit
 *
 * Strategi: file lebih dari MAX_AGE_HOURS jam & tidak ada URL-nya di DB → hapus.
 * ponytail: raw SQL ILIKE cukup, tidak perlu parse JSON per-row di JS.
 */
@Injectable()
export class OrphanImageCleanupService {
  private readonly logger = new Logger(OrphanImageCleanupService.name);

  // File lebih tua dari ini baru dianggap orphan (beri waktu cukup untuk submit)
  private readonly MAX_AGE_HOURS = 24;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Cron('0 2 * * *') // Setiap hari pukul 02.00
  async cleanupOrphans() {
    await Promise.all([
      this.cleanupFolder('asset/course', ['syllabus', 'final_assignment']),
      this.cleanupFolder('asset/portfolio/temp', ['portofolios']),
    ]);
  }

  /**
   * @param relFolder  Path relatif di dalam public/, misal 'asset/course'
   * @param tables     Nama tabel TypeORM (lowercase) yang menyimpan konten EditorJS
   */
  private async cleanupFolder(relFolder: string, tables: string[]) {
    const absFolder = path.join(process.cwd(), 'public', relFolder);

    let files: string[];
    try {
      files = await fs.readdir(absFolder);
    } catch {
      return; // Folder belum ada atau tidak bisa dibaca — skip
    }

    const cutoff = Date.now() - this.MAX_AGE_HOURS * 60 * 60 * 1000;
    const prefix = `/${relFolder}/`;

    for (const file of files) {
      const absPath = path.join(absFolder, file);

      let stat: Awaited<ReturnType<typeof fs.stat>>;
      try {
        stat = await fs.stat(absPath);
      } catch {
        continue;
      }

      if (!stat.isFile()) continue;
      if (stat.mtimeMs > cutoff) continue; // Terlalu baru, skip

      const url = `${prefix}${file}`;
      const isReferenced = await this.isReferencedInDb(url, tables);
      if (isReferenced) continue;

      try {
        await fs.unlink(absPath);
        this.logger.log(`Deleted orphan: ${url}`);
      } catch (err) {
        this.logger.warn(`Failed to delete ${url}: ${err.message}`);
      }
    }
  }

  /**
   * Cek apakah URL gambar ada di dalam kolom content (JSONB) atau image (text/jsonb)
   * di salah satu tabel yang diberikan.
   * ILIKE '%url%' cukup karena URL-nya unik (timestamp + random string).
   * ponytail: satu query UNION sudah cukup, tidak perlu ORM per-tabel.
   */
  private async isReferenced(url: string, table: string, column: string) {
    const result = await this.dataSource.query(
      `SELECT 1 FROM "${table}" WHERE "${column}"::text ILIKE $1 LIMIT 1`,
      [`%${url}%`],
    );
    return result.length > 0;
  }

  private async isReferencedInDb(url: string, tables: string[]) {
    for (const table of tables) {
      // Setiap tabel EditorJS punya kolom 'content' (JSONB)
      if (await this.isReferenced(url, table, 'content')) return true;
    }
    return false;
  }
}

