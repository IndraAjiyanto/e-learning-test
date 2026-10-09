import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Repository } from 'typeorm';
import { Certificates } from 'src/entities/certificate.entity';
import { User } from 'src/entities/user.entity';
import cloudinary from 'src/common/config/multer.config';
import { Biodata } from 'src/entities/biodata.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { certificateTemplateForCourse } from 'src/courses/program-type';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Certificates)
    private readonly certificatesRepository: Repository<Certificates>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Biodata)
    private readonly biodataRepository: Repository<Biodata>,
    @InjectRepository(Portofolios)
    private readonly portfolioRepository: Repository<Portofolios>,
  ) { }

  private async nextCertificateNumber(): Promise<string> {
    const certificates = await this.certificatesRepository.find({
      select: { noCertificate: true },
    });
    const highestNumber = certificates.reduce((highest, certificate) => {
      const match = certificate.noCertificate?.match(/(\d+)$/);
      return Math.max(highest, match ? Number(match[1]) : 0);
    }, 0);
    return `KSA-KC-${String(highestNumber + 1).padStart(4, '0')}`;
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };
      return entities[character];
    });
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  async getPreviewHtml(courseId: string, userId: string): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['biodata'],
    });
    if (!user) throw new NotFoundException('user not found');

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['category', 'courseType'],
    });
    if (!course) throw new NotFoundException('course not found');

    let certificate = await this.certificatesRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    if (!certificate && !user.biodata?.fullName?.trim()) {
      throw new BadRequestException(
        'Complete your biodata before opening the certificate.',
      );
    }

    const portfolio = await this.portfolioRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!certificate && !portfolio) {
      throw new ForbiddenException(
        'Upload a portfolio before opening the certificate.',
      );
    }

    if (!certificate) {
      certificate = this.certificatesRepository.create({
        noCertificate: await this.nextCertificateNumber(),
        certificate: null as unknown as string,
        user,
        course,
      });
      certificate = await this.certificatesRepository.save(certificate);
    } else if (!certificate.noCertificate) {
      certificate.noCertificate = await this.nextCertificateNumber();
      certificate = await this.certificatesRepository.save(certificate);
    }

    const templatePath = path.join(
      process.cwd(),
      'src',
      'common',
      'assets',
      'sertifikat',
      certificateTemplateForCourse(course),
    );
    const certificateDate = this.formatDate(certificate.createdAt);
    const categoryName = this.escapeHtml(course.category?.name || 'Program');
    const courseName = this.escapeHtml(course.name);
    const classType = this.escapeHtml(
      course.courseType?.nameClassesType || 'Excellent',
    );
    const fullName = this.escapeHtml(
      user.biodata?.fullName?.trim() || user.username || 'Participant',
    );
    const certificateNumber = this.escapeHtml(certificate.noCertificate);
    let html = fs.readFileSync(templatePath, 'utf8');
    let programLabelIndex = 0;

    html = html
      .replace('No. KSA-KC-[0000]', `No. ${certificateNumber}`)
      .replace('Participant Full Name', fullName)
      .replace('[Bootcamp Track Name]', courseName)
      .replace('[Class Title]', courseName)
      .replace('[Webinar Title]', courseName)
      .replace('[Field of Scope]', categoryName)
      .replace('[Month DD, YYYY]', certificateDate)
      .replace('[Month YYYY] – [Month YYYY]', certificateDate)
      .replace('>Excellent<', `>${classType}<`)
      .replace('Intensive<br>Bootcamp', categoryName)
      .replace('Kickstart<br>Class', categoryName)
      .replace('Faster<br>Class', categoryName)
      .replace('Starter<br>Class', categoryName)
      .replace(
        /(<div[^>]*(?:data-role="big"|id="k[12]")[^>]*>)[^<]*(<\/div>)/g,
        (_match, openingTag, closingTag) => {
          const label = programLabelIndex === 0 ? categoryName : '';
          programLabelIndex += 1;
          return `${openingTag}${label}${closingTag}`;
        },
      );

    return html;
  }

  async renderCertificatePdf(html: string): Promise<Buffer> {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle' });
      return Buffer.from(
        await page.pdf({
          format: 'A4',
          landscape: true,
          printBackground: true,
          preferCSSPageSize: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
        }),
      );
    } finally {
      await browser.close();
    }
  }

  async generateCertificate(courseId: string, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['biodata'],
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: [
        'weeks',
        'weeks.quiz',
        'courseType',
        'category',
        'mentorings',
      ],
    });
    if (!course) {
      throw new NotFoundException('course not found');
    }

    const certificates = await this.certificatesRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
      relations: ['course'],
    });
    if (certificates?.certificate) {
      return certificates;
    }

    if (!user.biodata?.fullName?.trim()) {
      throw new BadRequestException(
        'Complete your biodata before downloading the certificate.',
      );
    }

    const portfolio = await this.portfolioRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!certificates && !portfolio) {
      throw new ForbiddenException(
        'Upload a portfolio before downloading the certificate.',
      );
    }

    const certificateNumber =
      certificates?.noCertificate ?? (await this.nextCertificateNumber());

    {
      // Berkasnya ada di src/common/assets/sertifikat.pdf. Path lama menunjuk
      // <cwd>/common/assets/certificates.pdf — salah folder DAN salah nama, jadi
      // pembuatan sertifikat selalu gagal ENOENT di environment mana pun.
      // Dua font di bawah sudah memakai pola 'src/common/...' yang benar.
      const templatePath = path.join(
        process.cwd(),
        'src',
        'common',
        'assets',
        'sertifikat.pdf',
      );
      const templateBytes = fs.readFileSync(templatePath);

      const pdfDoc = await PDFDocument.load(templateBytes);
      pdfDoc.registerFontkit(fontkit);
      const page = pdfDoc.getPages()[0];
      const page2 = pdfDoc.getPages()[1];
      const { width, height } = page.getSize();

      const openSauceBoldBytes = fs.readFileSync(
        'src/common/font/OpenSauceSans-Bold.ttf',
      );

      // Embed font ke PDF
      const openSauceBold = await pdfDoc.embedFont(openSauceBoldBytes);

      // Hitung lebar text untuk center alignment
      const nameSize = 43.8;
      const nameWidth = openSauceBold.widthOfTextAtSize(
        user.biodata.fullName,
        nameSize,
      );
      const nameCenterX = (width - nameWidth) / 2;

      page.drawText(user.biodata.fullName, {
        x: nameCenterX,
        y: 349,
        size: nameSize,
        font: openSauceBold,
        color: rgb(0, 0, 0),
      });

      const text1 = `Has completed from the Private ${course.category.name} Program ${course.name} at`;
      const text2 = `the  Kesatria Academy, from December 7 to March 7, having successfully learned and`;
      const text3 = `practiced ${course.name} materials and is ready to become a professional in the field.`;

      const openSauceRegularBytes = fs.readFileSync(
        'src/common/font/OpenSauceSans-Regular.ttf',
      );

      // Embed font ke PDF
      const openSauceRegular = await pdfDoc.embedFont(openSauceRegularBytes);

      const textSize = 13.8;

      // Hitung lebar dan posisi center untuk text1
      const text1Width = openSauceRegular.widthOfTextAtSize(text1, textSize);
      const text1CenterX = (width - text1Width) / 2;

      // Hitung lebar dan posisi center untuk text2
      const text2Width = openSauceRegular.widthOfTextAtSize(text2, textSize);
      const text2CenterX = (width - text2Width) / 2;

      // Hitung lebar dan posisi center untuk text3
      const text3Width = openSauceRegular.widthOfTextAtSize(text3, textSize);
      const text3CenterX = (width - text3Width) / 2;

      page.drawText(text1, {
        x: text1CenterX,
        y: 310,
        size: textSize,
        font: openSauceRegular,
        color: rgb(0, 0, 0),
      });

      page.drawText(text2, {
        x: text2CenterX,
        y: 290,
        size: textSize,
        font: openSauceRegular,
        color: rgb(0, 0, 0),
      });

      page.drawText(text3, {
        x: text3CenterX,
        y: 268,
        size: textSize,
        font: openSauceRegular,
        color: rgb(0, 0, 0),
      });

      // Tambahkan nama mentor jika ada
      if (course.mentors && course.mentors.length > 0) {
        const mentorName = course.mentors[0].name; // Ambil mentor pertama
        const mentorSize = 12;
        const mentorWidth = openSauceBold.widthOfTextAtSize(
          mentorName,
          mentorSize,
        );

        // Posisi di bagian kanan bawah (sama dengan posisi "Izaz Rizqullah, S.Kom")
        // Center align di area kanan (sekitar kolom mentor)
        const mentorAreaCenterX = 590; // Pusat area tanda tangan mentor
        const mentorX = mentorAreaCenterX - mentorWidth / 2; // Center text
        const mentorY = 106; // Posisi vertikal (di atas tulisan "Mentors")

        page.drawText(mentorName, {
          x: mentorX,
          y: mentorY,
          size: mentorSize,
          font: openSauceBold,
          color: rgb(0, 0, 0),
        });
      }

      const rows: any[] = [];

      const headers = ['Material', 'Interval', 'Predicate'];
      for (const m of course.weeks) {
        for (const q of m.quiz) {
          rows.push([q.quizName]);
        }
      }

      const startY = height - 200;
      const cellWidth = 150;
      const cellHeight = 30;
      const startX = 190;

      // Header
      headers.forEach((header, i) => {
        page2.drawRectangle({
          x: startX + i * cellWidth,
          y: startY,
          width: cellWidth,
          height: cellHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        page2.drawText(header, {
          x: startX + i * cellWidth + 10,
          y: startY + 10,
          size: 12,
        });
      });

      // Rows
      rows.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const y = startY - (rowIndex + 1) * cellHeight;
          const x = startX + colIndex * cellWidth;

          page2.drawRectangle({
            x,
            y,
            width: cellWidth,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          page2.drawText(String(cell), {
            x: x + 10,
            y: y + 10,
            size: 12,
          });
        });
      });

      const pdfBytes = await pdfDoc.save();

      // 3. Convert ke Buffer
      const buffer = Buffer.from(pdfBytes);

      // 4. Upload ke Cloudinary
      const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'nestjs/certificates',
            resource_type: 'raw', // wajib biar pdf diterima
            public_id: `certificate-${user.username}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            allowed_formats: ['pdf'],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        uploadStream.end(buffer);
      });

      // sekarang result sudah berisi object Cloudinary
      const cert = this.certificatesRepository.create({
        ...(certificates ?? {}),
        certificate: result.secure_url,
        noCertificate: certificateNumber,
        user,
        course,
      });

      return await this.certificatesRepository.save(cert);
    }
  }

  async findBiodata(userId: string) {
    return await this.biodataRepository.findOne({
      where: { user: { id: userId } },
    });
  }
}
