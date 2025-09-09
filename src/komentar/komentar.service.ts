import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKomentarDto } from './dto/create-komentar.dto';
import { UpdateKomentarDto } from './dto/update-komentar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Komentar } from 'src/entities/komentar.entity';
import { Repository } from 'typeorm';
import { JawabanTugas, Proses } from 'src/entities/jawaban_tugas.entity';

@Injectable()
export class KomentarService {
      @InjectRepository(Komentar)
      private readonly komentarRepository: Repository<Komentar>
      @InjectRepository(JawabanTugas)
      private readonly jawabanTugasRepository: Repository<JawabanTugas>

  async create(createKomentarDto: CreateKomentarDto) {
    const jawaban_tugas = await this.jawabanTugasRepository.findOne({where: {id: createKomentarDto.jawaban_tugasId}})
        if(!jawaban_tugas){
            throw new NotFoundException('User tidak ada');
        }
      const komentar = await this.komentarRepository.create({
      ...createKomentarDto,
      jawaban_tugas: jawaban_tugas
    })
    return await this.komentarRepository.save(komentar)
  }

  findAll() {
    return `This action returns all komentar`;
  }

  findOne(id: number) {
    return `This action returns a #${id} komentar`;
  }

  update(id: number, updateKomentarDto: UpdateKomentarDto) {
    return `This action updates a #${id} komentar`;
  }

async updateJawabanTugas(jawaban_tugasId: number, proses: Proses) {
  const jawaban_tugas = await this.jawabanTugasRepository.findOne({
    where: { id: jawaban_tugasId },
  });

  if (!jawaban_tugas) {
    throw new NotFoundException('Jawaban Tugas tidak ada');
  }

  jawaban_tugas.proses = proses;
  return await this.jawabanTugasRepository.save(jawaban_tugas);
}


  remove(id: number) {
    return `This action removes a #${id} komentar`;
  }
}
