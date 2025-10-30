import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { join } from 'path';
import cloudinary from './multer.config';

const execAsync = promisify(exec);

@Injectable()
export class LibreOfficeService {
  private libreOfficePath: string;

  constructor() {
    // Path ke LibreOffice di Windows
    // Sesuaikan dengan lokasi instalasi LibreOffice Anda
    this.libreOfficePath =
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe';

    // Alternatif path lain yang mungkin:
    // 'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe'
    // atau cek di: process.env.LIBREOFFICE_PATH
  }

  /**
   * Convert PPT/PPTX ke PDF menggunakan LibreOffice
   * @param inputPath - Path file PPT/PPTX input
   * @param outputDir - Direktori output untuk file PDF
   * @returns Path file PDF hasil konversi
   */
  async convertPptToPdf(inputPath: string, outputDir: string): Promise<string> {
    try {
      // Pastikan output directory ada
      await fs.mkdir(outputDir, { recursive: true });

      // Command LibreOffice untuk convert ke PDF
      // --headless: jalankan tanpa GUI
      // --convert-to pdf: format output
      // --outdir: direktori output
      const command = `"${this.libreOfficePath}" --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;

      console.log('Executing LibreOffice command:', command);

      const { stdout, stderr } = await execAsync(command, {
        timeout: 60000, // 60 detik timeout
      });

      if (stderr && !stderr.includes('Warning')) {
        console.error('LibreOffice stderr:', stderr);
      }

      console.log('LibreOffice stdout:', stdout);

      // Dapatkan nama file output (nama file sama tapi ekstensi jadi .pdf)
      const inputFileName =
        inputPath.split('\\').pop() || inputPath.split('/').pop();
      const pdfFileName = inputFileName!.replace(/\.(ppt|pptx)$/i, '.pdf');
      const pdfPath = join(outputDir, pdfFileName);

      // Cek apakah file PDF berhasil dibuat
      try {
        await fs.access(pdfPath);
        console.log('PDF created successfully:', pdfPath);
        return pdfPath;
      } catch (error) {
        throw new Error(`PDF file not created: ${pdfPath}`);
      }
    } catch (error) {
      console.error('LibreOffice conversion error:', error);
      throw new Error(`Failed to convert PPT to PDF: ${error.message}`);
    }
  }

  /**
   * Convert PPT/PPTX ke PNG (gambar per slide) menggunakan LibreOffice + pdf-poppler
   * @param inputPath - Path file PPT/PPTX input
   * @param outputDir - Direktori output untuk file PNG
   * @returns Array path file PNG hasil konversi
   */
  async convertPptToPng(
    inputPath: string,
    outputDir: string,
  ): Promise<string[]> {
    const pdftopic = require('pdf-poppler');

    try {
      // Pastikan output directory ada
      await fs.mkdir(outputDir, { recursive: true });

      // Step 1: Convert PPT ke PDF dulu menggunakan LibreOffice
      console.log('Converting PPT to PDF...');
      const pdfPath = await this.convertPptToPdf(inputPath, outputDir);
      console.log('PDF created:', pdfPath);

      // Step 2: Convert PDF ke PNG menggunakan pdf-poppler
      console.log('Converting PDF to PNG slides...');
      const options = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: 'slide',
        page: null, // null = all pages
        scale: 2048, // resolution (higher = better quality)
      };

      await pdftopic.convert(pdfPath, options);

      // Hapus file PDF setelah berhasil convert ke PNG
      try {
        await fs.unlink(pdfPath);
        console.log('Cleaned up intermediate PDF file:', pdfPath);
      } catch (unlinkError) {
        console.error('Failed to delete PDF file:', unlinkError);
      }

      // Dapatkan semua file PNG yang dibuat
      const files = await fs.readdir(outputDir);
      const pngFiles = files
        .filter((file) => file.startsWith('slide-') && file.endsWith('.png'))
        .map((file) => join(outputDir, file))
        .sort();

      if (pngFiles.length === 0) {
        throw new Error('No PNG files created from PDF');
      }

      console.log(`Successfully created ${pngFiles.length} PNG slides`);
      return pngFiles;
    } catch (error) {
      console.error('PPT to PNG conversion error:', error);
      throw new Error(`Failed to convert PPT to PNG: ${error.message}`);
    }
  }

  /**
   * Cek apakah LibreOffice terinstall dan bisa diakses
   */
  async checkLibreOfficeInstalled(): Promise<boolean> {
    try {
      const command = `"${this.libreOfficePath}" --version`;
      const { stdout } = await execAsync(command);
      console.log('LibreOffice version:', stdout);
      return true;
    } catch (error) {
      console.error('LibreOffice not found or not accessible:', error.message);
      return false;
    }
  }

  /**
   * Convert PPT ke PNG dan upload langsung ke Cloudinary
   * @param inputPath - Path file PPT/PPTX input
   * @param outputDir - Direktori temporary untuk proses konversi
   * @param pertemuanId - ID pertemuan untuk naming folder di Cloudinary
   * @returns Object berisi URL file PPT original dan array URL slides PNG
   */
  async convertAndUploadPptToCloudinary(
    inputPath: string,
    outputDir: string,
    pertemuanId: number,
  ): Promise<{ pptUrl: string; slideUrls: string[] }> {
    try {
      // Step 1: Convert PPT ke PNG
      const slidePaths = await this.convertPptToPng(inputPath, outputDir);

      // Step 2: Upload file PPT original ke Cloudinary
      console.log('Uploading original PPT to Cloudinary...');
      const pptUpload = await cloudinary.uploader.upload(inputPath, {
        folder: 'nestjs/ppt/files',
        public_id: `ppt-${pertemuanId}-${Date.now()}`,
        resource_type: 'raw', // untuk file non-image
      });

      // Step 3: Upload semua slide PNG ke Cloudinary
      console.log(`Uploading ${slidePaths.length} slides to Cloudinary...`);
      const slideUrls: string[] = [];

      const uploadPromises = slidePaths.map(async (slidePath, index) => {
        try {
          const uploadedSlide = await cloudinary.uploader.upload(slidePath, {
            folder: 'nestjs/ppt/slides',
            public_id: `slide-${pertemuanId}-${Date.now()}-${index}`,
            resource_type: 'image',
          });
          return uploadedSlide.secure_url;
        } catch (uploadError) {
          console.error(`Failed to upload slide ${index}:`, uploadError);
          return null;
        } finally {
          // Cleanup local slide file
          try {
            await fs.unlink(slidePath);
          } catch (unlinkError) {
            console.error(
              `Failed to delete slide file ${slidePath}:`,
              unlinkError,
            );
          }
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      slideUrls.push(
        ...(uploadResults.filter((url) => url !== null) as string[]),
      );

      // Step 4: Cleanup temporary files
      try {
        await fs.unlink(inputPath);
        // Cleanup slide directory
        try {
          await fs.rmdir(outputDir);
        } catch (rmdirError) {
          console.error('Failed to remove slide directory:', rmdirError);
        }
      } catch (unlinkError) {
        console.error('Failed to cleanup temp file:', unlinkError);
      }

      console.log(
        `Successfully uploaded PPT and ${slideUrls.length} slides to Cloudinary`,
      );

      return {
        pptUrl: pptUpload.secure_url,
        slideUrls,
      };
    } catch (error) {
      console.error('Convert and upload error:', error);
      throw new Error(`Failed to convert and upload PPT: ${error.message}`);
    }
  }
}
