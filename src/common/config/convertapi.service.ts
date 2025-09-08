import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';

const convertapi = require('convertapi');

@Injectable()
export class ConvertApiService {
  private api = convertapi(process.env.CONVERTAPI_SECRET_KEY || 'YOUR_SECRET_KEY'); 

  async pptToPdf(inputPath: string, outputDir: string): Promise<string> {
    try {
      await fs.mkdir(outputDir, { recursive: true });

      const result = await this.api.convert('pdf', { File: inputPath }, 'pptx');
      const outputPath = join(outputDir, 'output.pdf');
      await result.file.save(outputPath);

      return outputPath;
    } catch (error) {
      throw new Error(`Failed to convert PPT to PDF: ${error.message}`);
    }
  }

  async pptToPng(inputPath: string, outputDir: string): Promise<string[]> {
    try {
      await fs.mkdir(outputDir, { recursive: true });

      const result = await this.api.convert('png', { File: inputPath }, 'pptx');
      const slideUrls: string[] = [];

      for (let i = 0; i < result.files.length; i++) {
        const fileName = `slide-${i + 1}.png`;
        const outPath = join(outputDir, fileName);
        await result.files[i].save(outPath);
        
        const urlPath = `/uploads/ppt/${inputPath.split('/').pop()}/${fileName}`;
        slideUrls.push(urlPath);
      }

      return slideUrls;
    } catch (error) {
      throw new Error(`Failed to convert PPT to PNG: ${error.message}`);
    }
  }
}