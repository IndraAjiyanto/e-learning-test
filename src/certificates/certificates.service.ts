import { Injectable, NotFoundException } from '@nestjs/common';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Repository } from 'typeorm';
import { Certificates } from 'src/entities/certificate.entity';
import { User } from 'src/entities/user.entity';
import cloudinary from 'src/common/config/multer.config';
import { Biodata } from 'src/entities/biodata.entity';

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
  ) {}

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
    if (!certificates) {
      const templatePath = path.join(
        process.cwd(),
        'common',
        'assets',
        'certificates.pdf',
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
        certificate: result.secure_url, // ⬅️ pake secure_url biar bisa langsung diakses public
        user: user,
        course: course,
      });

      return await this.certificatesRepository.save(cert);
    } else {
      return certificates;
    }
  }

  async findBiodata(userId: string) {
    return await this.biodataRepository.findOne({
      where: { user: { id: userId } },
    });
  }
}
