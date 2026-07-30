import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class LogbookExportService {
  private readonly publicDir = path.join(process.cwd(), 'public');

  async exportLogbookToExcel(logbooks: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Logbook');

    sheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'User', key: 'user', width: 20 },
      { header: 'Kegiatan', key: 'kegiatan', width: 30 },
      { header: 'Rincian', key: 'rincian', width: 50 },
      { header: 'Kendala', key: 'kendala', width: 40 },
      { header: 'Dokumentasi', key: 'dokumentasi', width: 16 },
      { header: 'Dokumentasi Lain', key: 'dokumentasi_lain', width: 30 },
      { header: 'Program', key: 'program', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Tanggal', key: 'tanggal', width: 20 },
    ];

    this.styleHeader(sheet);

    for (let i = 0; i < logbooks.length; i++) {
      const log = logbooks[i];
      const rowNum = i + 2;

      const statusText =
        log.proses === 'acc'
          ? 'Approved'
          : log.proses === 'proces'
            ? 'Process'
            : 'Rejected';

      sheet.addRow({
        no: i + 1,
        user: log.user?.username || '-',
        kegiatan: log.kegiatan || '-',
        rincian: log.rincian_kegiatan || '-',
        kendala: log.kendala || '-',
        dokumentasi: '',
        dokumentasi_lain: log.dokumentasi_lain || '-',
        program: log.pertemuan?.minggu?.kelas?.nama_kelas || '-',
        status: statusText,
        tanggal: this.formatDate(log.createdAt),
      });

      await this.embedImage(workbook, sheet, log.dokumentasi, rowNum, 6);
      const row = sheet.getRow(rowNum);
      row.height = 113;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async exportLogbookMentorToExcel(logbooks: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Logbook Mentor');

    sheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'User', key: 'user', width: 20 },
      { header: 'Kegiatan', key: 'kegiatan', width: 30 },
      { header: 'Rincian', key: 'rincian', width: 50 },
      { header: 'Kendala', key: 'kendala', width: 40 },
      { header: 'Dokumentasi', key: 'dokumentasi', width: 16 },
      { header: 'Program', key: 'program', width: 20 },
      { header: 'Tanggal', key: 'tanggal', width: 20 },
    ];

    this.styleHeader(sheet);

    for (let i = 0; i < logbooks.length; i++) {
      const log = logbooks[i];
      const rowNum = i + 2;

      sheet.addRow({
        no: i + 1,
        user: log.user?.username || '-',
        kegiatan: log.kegiatan || '-',
        rincian: log.rincian_kegiatan || '-',
        kendala: log.kendala || '-',
        dokumentasi: '',
        program: log.pertemuan?.minggu?.kelas?.nama_kelas || '-',
        tanggal: this.formatDate(log.createdAt),
      });

      await this.embedImage(workbook, sheet, log.dokumentasi, rowNum, 6);
      const row = sheet.getRow(rowNum);
      row.height = 113;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private async embedImage(
    workbook: ExcelJS.Workbook,
    sheet: ExcelJS.Worksheet,
    dokumentasiPath: string,
    rowNum: number,
    colNum: number,
  ): Promise<void> {
    const buffer = await this.getImageBuffer(dokumentasiPath);
    if (!buffer) {
      sheet.getCell(rowNum, colNum).value = '-';
      return;
    }

    const ext = this.getImageExtension(dokumentasiPath);
    const imageId = workbook.addImage({
      buffer: buffer as any,
      extension: ext,
    });

    // 3x4 cm at 96 DPI = 113x151 pixels
    sheet.addImage(imageId, {
      tl: { col: colNum - 1, row: rowNum - 1 } as any,
      ext: { width: 113, height: 120 },
    });
  }

  private async getImageBuffer(urlPath: string): Promise<Buffer | null> {
    if (!urlPath) return null;

    try {
      const resolved = path.resolve(this.publicDir, '.' + urlPath);

      if (!resolved.startsWith(this.publicDir)) return null;

      return await fs.readFile(resolved);
    } catch {
      return null;
    }
  }

  private getImageExtension(filePath: string): 'jpeg' | 'png' | 'gif' {
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    if (ext === 'jpg' || ext === 'jpeg') return 'jpeg';
    if (ext === 'png') return 'png';
    if (ext === 'gif') return 'gif';
    return 'jpeg';
  }

  private styleHeader(sheet: ExcelJS.Worksheet): void {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  private formatDate(date: Date | string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
