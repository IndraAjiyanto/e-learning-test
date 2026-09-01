import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePertanyaanDto } from './dto/create-pertanyaan.dto';
import { UpdatePertanyaanDto } from './dto/update-pertanyaan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { Repository } from 'typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Jawaban } from 'src/entities/jawaban.entity';
import { Quiz } from 'src/entities/quiz.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PertanyaansService {
  @InjectRepository(Pertanyaan)
  private readonly pertanyaanRepository: Repository<Pertanyaan>;
  @InjectRepository(Pertemuan)
  private readonly pertemuanRepository: Repository<Pertemuan>;
  @InjectRepository(Jawaban)
  private readonly jawabanRepository: Repository<Jawaban>;
  @InjectRepository(Quiz)
  private readonly quizRepository: Repository<Quiz>;

  async create(createPertanyaanDto: CreatePertanyaanDto) {
    const quiz = await this.quizRepository.findOne({
      where: { id: createPertanyaanDto.quizId },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    const pertanyaan = await this.pertanyaanRepository.create({
      pertanyaan_soal: createPertanyaanDto.pertanyaan_soal,
      gambar: createPertanyaanDto.gambar,
      quiz: quiz,
    });
    return await this.pertanyaanRepository.save(pertanyaan);
  }

  async findPertanyaan(quizId: string) {
    return await this.pertanyaanRepository.find({
      where: { quiz: { id: quizId } },
      relations: ['jawaban.jawaban_user'],
    });
  }

  async findOne(pertanyaanId: string) {
    const pertanyaan = await this.pertanyaanRepository.findOne({
      where: { id: pertanyaanId },
      relations: ['jawaban', 'quiz'],
    });
    if (!pertanyaan) {
      throw new NotFoundException('Question not found');
    }
    return pertanyaan;
  }

  async update(pertanyaanId: string, updatePertanyaanDto: UpdatePertanyaanDto) {
    const pertanyaan = await this.findOne(pertanyaanId);
    if (!pertanyaan) {
      throw new NotFoundException('Question not found');
    }

    pertanyaan.pertanyaan_soal = updatePertanyaanDto.pertanyaan_soal;
    pertanyaan.gambar = updatePertanyaanDto.gambar;
    await this.pertanyaanRepository.save(pertanyaan);

    const jawabanLama = await this.jawabanRepository.find({
      where: { pertanyaan: { id: pertanyaanId } },
    });

    if (!jawabanLama || jawabanLama.length === 0) {
      throw new NotFoundException('Answer not found');
    }

    await this.jawabanRepository.remove(jawabanLama);

    const jawabanBaru = updatePertanyaanDto.pilihan.map((pilihan, index) => {
      return this.jawabanRepository.create({
        jawaban: pilihan,
        jawaban_benar: Number(updatePertanyaanDto.jawaban) === index,
        pertanyaan: pertanyaan,
      });
    });

    return await this.jawabanRepository.save(jawabanBaru);
  }

  async remove(pertanyaanId: string) {
    const pertanyaan = await this.findOne(pertanyaanId);
    const jawaban = await this.jawabanRepository.find({
      where: { pertanyaan: { id: pertanyaanId } },
    });
    if (!jawaban) {
      throw new NotFoundException('Answer not found');
    }
    if (!pertanyaan) {
      throw new NotFoundException('Question not found');
    }
    await this.jawabanRepository.remove(jawaban);
    await this.pertanyaanRepository.remove(pertanyaan);
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {}
  }
}
