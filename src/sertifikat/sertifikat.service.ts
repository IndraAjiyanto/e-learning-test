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
    const kelas = await this.kelasRepository.findOne({where: {id:kelasId}})
        if(!kelas){
      throw new NotFoundException('kelas not found')
    }
    const sertifikat = await this.sertifikatRepository.findOne({where: {user: {id:userId}, kelas: {id: kelasId}}})
    if(!sertifikat){
      const templatePath = path.join(process.cwd(), 'tmp', 'sertifikat.pdf');
    const templateBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];

    page.drawText(user.username, {
      x: 300,
      y: 250,
      size: 36,
      color: rgb(0, 0, 0),
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
