import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSertifikatDto } from './dto/create-sertifikat.dto';
import { UpdateSertifikatDto } from './dto/update-sertifikat.dto';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Repository } from 'typeorm';
import { Sertifikat } from 'src/entities/sertifikat.entity';
import { User } from 'src/entities/user.entity';
import cloudinary from 'src/common/config/multer.config';
import { Biodata } from 'src/entities/biodata.entity';

@Injectable()
export class SertifikatService {
    constructor(
      @InjectRepository(Kelas)
      private readonly kelasRepository: Repository<Kelas>,
      @InjectRepository(Sertifikat)
      private readonly sertifikatRepository: Repository<Sertifikat>,
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(Biodata)
      private readonly biodataRepository: Repository<Biodata>,
    ){}

  create(createSertifikatDto: CreateSertifikatDto) {
    return 'This action adds a new sertifikat';
  }

  async generateCertificate(kelasId: number, userId: number) {
    const user = await this.userRepository.findOne({where: {id:userId}})
    if(!user){
      throw new NotFoundException('user not found')
    }
    const kelas = await this.kelasRepository.findOne({where: {id:kelasId}, relations: ['minggu', 'minggu.quiz']})
        if(!kelas){
      throw new NotFoundException('kelas not found')
    }

    const sertifikat = await this.sertifikatRepository.findOne({where: {user: {id:userId}, kelas: {id: kelasId}}})
    if(!sertifikat){
      const templatePath = path.join(process.cwd(), 'tmp', 'sertifikat.pdf');
    const templateBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const page2 = pdfDoc.getPages()[1];
    const {height} = page2.getSize()

    page.drawText(user.username, {
      x: 380,
      y: 355,
      size: 36,
      color: rgb(0, 0, 0),
    });
    const rows : any [] = [];

  const headers = ["Material", "Interval", "Predicate"];
        for (const m of kelas.minggu){
     for(const q of m.quiz){
      rows.push([q.nama_quiz, ])
     }
  }


let startY = height - 200;
let cellWidth = 150;
let cellHeight = 30;
let startX = 190;

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
const cert = this.sertifikatRepository.create({
  sertif: result.secure_url, // ⬅️ pake secure_url biar bisa langsung diakses public
  user: user,
  kelas: kelas,
});

return await this.sertifikatRepository.save(cert);
    }else{
      return sertifikat
    }
    
  }

  async findBiodata(userId: number){
    return await this.biodataRepository.findOne({where: {user: {id:userId}}})
  }

  findAll() {
    return `This action returns all sertifikat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sertifikat`;
  }

  update(id: number, updateSertifikatDto: UpdateSertifikatDto) {
    return `This action updates a #${id} sertifikat`;
  }

  remove(id: number) {
    return `This action removes a #${id} sertifikat`;
  }
}
