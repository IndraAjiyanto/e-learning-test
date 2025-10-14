import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePertanyaanDto } from './dto/create-pertanyaan.dto';
import { UpdatePertanyaanDto } from './dto/update-pertanyaan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Jawaban } from 'src/entities/jawaban.entity';
import { Quiz } from 'src/entities/quiz.entity';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class PertanyaansService {
      @InjectRepository(Pertanyaan)
      private readonly pertanyaanRepository: Repository<Pertanyaan>
      @InjectRepository(Pertemuan)
      private readonly pertemuanRepository: Repository<Pertemuan>
      @InjectRepository(Jawaban)
      private readonly jawabanRepository: Repository<Jawaban>
      @InjectRepository(Quiz)
      private readonly quizRepository: Repository<Quiz>
      
  async create(createPertanyaanDto: CreatePertanyaanDto) {
          const quiz = await this.quizRepository.findOne({where: {id: createPertanyaanDto.quizId}})
        if(!quiz){
          throw new NotFoundException('quiz ini tidak ada')
        }
          const pertanyaan = await this.pertanyaanRepository.create({
          pertanyaan_soal: createPertanyaanDto.pertanyaan_soal,
          gambar: createPertanyaanDto.gambar,
          quiz: quiz
        })
        return await this.pertanyaanRepository.save(pertanyaan)
  }

  findAll() {
    return `This action returns all pertanyaans`;
  }

  async findPertanyaan(quizId: number){
    return await this.pertanyaanRepository.find({where: {quiz: {id: quizId}}, relations: ['jawaban.jawaban_user']})
  }

  async findOne(pertanyaanId: number) {
    const pertanyaan = await this.pertanyaanRepository.findOne({where: {id: pertanyaanId}, relations: ['jawaban', 'quiz']})
    if(!pertanyaan){
      throw new NotFoundException('Pertanyaan tidak ditemukan')
    }
    return pertanyaan
  }

async update(pertanyaanId: number, updatePertanyaanDto: UpdatePertanyaanDto) {
  const pertanyaan = await this.findOne(pertanyaanId);
  if (!pertanyaan) {
    throw new NotFoundException('Pertanyaan tidak ditemukan');
  }

  // update pertanyaan_soal
  pertanyaan.pertanyaan_soal = updatePertanyaanDto.pertanyaan_soal;
  pertanyaan.gambar = updatePertanyaanDto.gambar;
  await this.pertanyaanRepository.save(pertanyaan);

  // ambil jawaban lama
  const jawabanLama = await this.jawabanRepository.find({
    where: { pertanyaan: { id: pertanyaanId } },
  });

  if (!jawabanLama || jawabanLama.length === 0) {
    throw new NotFoundException('Jawaban tidak ditemukan');
  }

  // hapus jawaban lama
  await this.jawabanRepository.remove(jawabanLama);

  // insert jawaban baru
  const jawabanBaru = updatePertanyaanDto.pilihan.map((pilihan, index) => {
    return this.jawabanRepository.create({
      jawaban: pilihan,
      jawaban_benar: Number(updatePertanyaanDto.jawaban) === index, // true kalau index sesuai jawaban benar
      pertanyaan: pertanyaan,
    });
  });

  return await this.jawabanRepository.save(jawabanBaru);
}

  async remove(pertanyaanId: number) {
    const pertanyaan = await this.findOne(pertanyaanId)
    const jawaban = await this.jawabanRepository.find({where: {pertanyaan: {id: pertanyaanId}}})
    if(!jawaban){
      throw new NotFoundException('jawaban tidak ditemukan')
    }
    if(!pertanyaan){
      throw new NotFoundException('pertanyaan tidak ditemukan')
    }
    await this.jawabanRepository.remove(jawaban)
    await this.pertanyaanRepository.remove(pertanyaan)
  }

    async getPublicIdFromUrl(url: string) {
      // Pisahkan berdasarkan "/upload/"
      const parts = url.split('/upload/');
      if (parts.length < 2) {
        return null;
      }
  
      // Ambil bagian setelah upload/
      let path = parts[1];
  
      // Hapus "v1234567890/" (versi auto Cloudinary)
      path = path.replace(/^v[0-9]+\/?/, '');
  
      // Buang extension (.jpg, .png, .pdf, dll)
      path = path.replace(/\.[^.]+$/, '');
  
      console.log('Public ID:', path); // Debug: lihat public ID yang dihasilkan
  
      await this.deleteFileIfExists(path);
    }
  
    async deleteFileIfExists(publicId: string) {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
  
        if (result.result === 'not found') {
          console.log('File not found in Cloudinary.');
        } else {
          console.log('File deleted from Cloudinary:', result);
        }
      } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        throw error;
      }
    }
}
