import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJawabanTugassDto } from './dto/create-jawaban_tugass.dto';
import { UpdateJawabanTugassDto } from './dto/update-jawaban_tugass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JawabanTugas } from 'src/entities/jawaban_tugas.entity';
import { Not, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Tugas } from 'src/entities/tugas.entity';
import { Komentar } from 'src/entities/komentar.entity';

@Injectable()
export class JawabanTugassService {
  @InjectRepository(JawabanTugas)
  private readonly jawabanTugasRepository: Repository<JawabanTugas>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Tugas)
  private readonly tugasRepository: Repository<Tugas>;
  @InjectRepository(Komentar)
  private readonly komentarRepository: Repository<Komentar>;

  async create(createJawabanTugassDto: CreateJawabanTugassDto) {
    const user = await this.userRepository.findOne({
      where: { id: createJawabanTugassDto.userId },
    });
    const tugas = await this.tugasRepository.findOne({
      where: { id: createJawabanTugassDto.tugasId },
    });
    if (!user) {
      throw new NotFoundException('user Not found');
    }
    if (!tugas) {
      throw new NotFoundException('tugas Not found');
    }
    const jawaban_tugas = await this.jawabanTugasRepository.create({
      file: createJawabanTugassDto.file,
      proses: createJawabanTugassDto.proses,
      user: user,
      tugas: tugas,
    });
    return await this.jawabanTugasRepository.save(jawaban_tugas);
  }

    async createKomentar(komentarText: string, jawaban_tugasId: number) {
      const jawaban_tugas = await this.jawabanTugasRepository.findOne({
        where: { id: jawaban_tugasId },
      });
      if (!jawaban_tugas) {
        throw new NotFoundException('answer not found');
      }
      const komentar = await this.komentarRepository.create({
        komentar: komentarText,
        jawaban_tugas: jawaban_tugas,
      });
      return await this.komentarRepository.save(komentar);
    }

  async findTugas(tugasId: number) {
    return await this.tugasRepository.findOne({
      where: { id: tugasId },
      relations: ['pertemuan', 'pertemuan.minggu', 'pertemuan.minggu.kelas'],
    });
  }

  async findJawabanTugas(userId: number, tugasId: number) {
    return await this.jawabanTugasRepository.find({
      where: { user: { id: userId }, tugas: { id: tugasId } },
      relations: ['komentar'],
    });
  }

  async findJawabanExists(userId: number, tugasId: number) {
    return await this.jawabanTugasRepository.find({
      where: {
        user: { id: userId },
        tugas: { id: tugasId },
        proses: Not('rejected'),
      },
    });
  }

  async findAllJawabanTugas(tugasId: number) {
    return await this.jawabanTugasRepository.find({
      where: { tugas: { id: tugasId } },
      relations: ['user', 'komentar', 'tugas'],
    });
  }

  findAll() {
    return `This action returns all jawabanTugass`;
  }

  async findOne(id: number) {
    const jawaban_tugas = await this.jawabanTugasRepository.findOne({
      where: { id: id },
    });
    if (!jawaban_tugas) {
      throw new NotFoundException('Jawaban Tugas Not Found');
    }
    return jawaban_tugas;
  }

  async update(id: number, updateJawabanTugassDto: UpdateJawabanTugassDto) {
        const jawaban_tugas = await this.findOne(id);
    if (!jawaban_tugas) {
      throw new NotFoundException('answer not found');
    }
    if(updateJawabanTugassDto.proses){
    jawaban_tugas.proses = updateJawabanTugassDto.proses;
    }
    if(updateJawabanTugassDto.file){
    jawaban_tugas.file = updateJawabanTugassDto.file;
    }
    return await this.jawabanTugasRepository.save(jawaban_tugas);
  }

  remove(id: number) {
    return `This action removes a #${id} jawabanTugass`;
  }
}
