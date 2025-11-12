import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import cloudinary from './multer.config';
import * as os from 'os';

@Injectable()
export class LibreOfficeService {
  private libreOfficePath: string;
  private tempDir: string;

  constructor() {
    const platform = os.platform();

    if (platform === 'win32') {
      this.libreOfficePath =
        process.env.LIBREOFFICE_PATH ||
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
    } else if (platform === 'linux') {
      this.libreOfficePath = process.env.LIBREOFFICE_PATH || '/usr/bin/soffice';
    } else if (platform === 'darwin') {
      this.libreOfficePath =
        process.env.LIBREOFFICE_PATH ||
        '/Applications/LibreOffice.app/Contents/MacOS/soffice';
    } else {
      this.libreOfficePath = 'libreoffice';
    }

    this.tempDir = process.env.LIBREOFFICE_TEMP_DIR || os.tmpdir();

    console.log('LibreOffice Configuration:');
    console.log('- Platform:', platform);
    console.log('- LibreOffice Path:', this.libreOfficePath);
    console.log('- Temp Directory:', this.tempDir);
  }

  // =======================
  // Convert PPT/PPTX → PDF pakai spawn
  // =======================
  async convertPptToPdf(inputPath: string, outputDir: string): Promise<string> {
    await fs.mkdir(outputDir, { recursive: true });

    const args = [
      '--headless',
      '--nologo',
      '--norestore',
      '--convert-to', 'pdf',
      '--outdir', outputDir,
      inputPath,
    ];

    console.log('Spawning LibreOffice:', this.libreOfficePath, args.join(' '));

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(this.libreOfficePath, args, {
        env: { ...process.env, HOME: '/tmp' },
      });

      proc.stdout.on('data', (data) => {
        console.log('[LibreOffice stdout]', data.toString());
      });

      proc.stderr.on('data', (data) => {
        console.error('[LibreOffice stderr]', data.toString());
      });

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`LibreOffice exited with code ${code}`));
      });
    });

    const inputFileName = inputPath.split(/[/\\]/).pop();
    const pdfFileName = inputFileName!.replace(/\.(ppt|pptx)$/i, '.pdf');
    const pdfPath = join(outputDir, pdfFileName);

    try {
      await fs.access(pdfPath);
      console.log('PDF created successfully:', pdfPath);
      return pdfPath;
    } catch {
      throw new Error(`PDF file not created: ${pdfPath}`);
    }
  }

  // =======================
  // Convert PPT → PNG per slide
  // =======================
  async convertPptToPng(inputPath: string, outputDir: string): Promise<string[]> {
    await fs.mkdir(outputDir, { recursive: true });

    const pdfPath = await this.convertPptToPdf(inputPath, outputDir);

    const cmdArgs = ['-png', pdfPath, join(outputDir, 'slide')];
    await new Promise<void>((resolve, reject) => {
      const proc = spawn('pdftoppm', cmdArgs);

      proc.stdout.on('data', (data) => console.log('[pdftoppm stdout]', data.toString()));
      proc.stderr.on('data', (data) => console.error('[pdftoppm stderr]', data.toString()));

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`pdftoppm exited with code ${code}`));
      });
    });

    try {
      await fs.unlink(pdfPath);
      console.log('Deleted temp PDF:', pdfPath);
    } catch (err) {
      console.error('Failed to delete PDF:', err);
    }

    const files = await fs.readdir(outputDir);
    return files.filter((file) => file.endsWith('.png')).map((file) => join(outputDir, file));
  }

  // =======================
  // Check LibreOffice installed
  // =======================
  async checkLibreOfficeInstalled(): Promise<boolean> {
    try {
      await new Promise<void>((resolve, reject) => {
        const proc = spawn(this.libreOfficePath, ['--version']);
        proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error('Not found'))));
      });
      console.log('LibreOffice is installed.');
      return true;
    } catch (err) {
      console.error('LibreOffice not found:', err);
      return false;
    }
  }

  // =======================
  // Convert PPT → PNG → Upload Cloudinary
  // =======================
  async convertAndUploadPptToCloudinary(
    inputPath: string,
    outputDir: string,
    pertemuanId: number,
  ): Promise<{ pptUrl: string; slideUrls: string[] }> {
    try {
      const slidePaths = await this.convertPptToPng(inputPath, outputDir);

      const pptUpload = await cloudinary.uploader.upload(inputPath, {
        folder: 'nestjs/ppt/files',
        public_id: `ppt-${pertemuanId}-${Date.now()}`,
        resource_type: 'raw',
      });

      const slideUrls: string[] = [];
      const uploadPromises = slidePaths.map(async (slidePath, index) => {
        try {
          const uploadedSlide = await cloudinary.uploader.upload(slidePath, {
            folder: 'nestjs/ppt/slides',
            public_id: `slide-${pertemuanId}-${Date.now()}-${index}`,
            resource_type: 'image',
          });
          return uploadedSlide.secure_url;
        } catch (err) {
          console.error(`Failed to upload slide ${index}:`, err);
          return null;
        } finally {
          try { await fs.unlink(slidePath); } catch (_) {}
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      slideUrls.push(...uploadResults.filter((url) => url !== null));

      try {
        await fs.unlink(inputPath);
        await fs.rm(outputDir, { recursive: true, force: true });
      } catch (err) { console.error('Cleanup failed:', err); }

      return { pptUrl: pptUpload.secure_url, slideUrls };
    } catch (err) {
      console.error('Convert and upload failed:', err);
      throw new Error(`Failed to convert and upload PPT: ${err.message}`);
    }
  }
}
