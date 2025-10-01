import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePertemuanDto } from './dto/create-pertemuan.dto';
import { UpdatePertemuanDto } from './dto/update-pertemuan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';
import { Minggu } from 'src/entities/minggu.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { LogbookMentor } from 'src/entities/logbook_mentor.entity';

@Injectable()
export class PertemuansService {
  constructor(
    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,

    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,

    @InjectRepository(Minggu)
    private readonly mingguRepository: Repository<Minggu>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(Logbook)
    private readonly logBookRepository: Repository<Logbook>,

    @InjectRepository(Pertanyaan)
    private readonly pertanyaanRepository: Repository<Pertanyaan>,

    @InjectRepository(LogbookMentor)
    private readonly logbookMentorRepository: Repository<LogbookMentor>
  ){}

  async create(createPertemuanDto: CreatePertemuanDto) {
    const minggu = await this.mingguRepository.findOne({where: {id: createPertemuanDto.mingguId}})
    if(!minggu){
      throw new NotFoundException('minggu ini tidak ada')
    }
    const pertemuan = await this.pertemuanRepository.findOne({where: {pertemuan_ke: createPertemuanDto.pertemuan_ke - 1, minggu: {id: minggu.id}}})

    if(!pertemuan?.akhir){
      if(createPertemuanDto.akhir_check === 'true'){
        createPertemuanDto.akhir = true
      }
    const user = await this.pertemuanRepository.create({
      ...createPertemuanDto,
      minggu: minggu,
    })
    return await this.pertemuanRepository.save(user)
    }else{
      throw new Error('tidak dapat menambahkan pertemuan lagi')
    }
  }

  async findAll() {
 return await this.pertemuanRepository
    .createQueryBuilder('pertemuan')
    .leftJoin('pertemuan.kelas', 'kelas')
    .leftJoin('pertemuan.materi', 'materi')
    .select([
      'pertemuan.id AS id',
      'pertemuan.pertemuan_ke AS pertemuan_ke',
      'pertemuan.topik AS topik',
      'pertemuan.tanggal AS tanggal',
      'pertemuan.waktu_awal AS waktu_awal',
      'pertemuan.waktu_akhir AS waktu_akhir',
      'kelas.id AS kelas_id',
      'kelas.nama_kelas AS nama_kelas',
    ])
    .addSelect([
      `SUM(CASE WHEN materi.jenis_file = 'pdf' THEN 1 ELSE 0 END) AS jumlah_pdf`,
      `SUM(CASE WHEN materi.jenis_file = 'video' THEN 1 ELSE 0 END) AS jumlah_video`,
      `SUM(CASE WHEN materi.jenis_file = 'ppt' THEN 1 ELSE 0 END) AS jumlah_ppt`,
    ])
    .groupBy('pertemuan.id')
    .addGroupBy('kelas.id')
    .getRawMany();
  }

  async findAllKelas(){
    return await this.kelasRepository.find();
  }

  async findPertemuanMinggu(mingguId: number){
    const pertemuan = await this.pertemuanRepository.findOne({where: {minggu: {id: mingguId}}, order: {createdAt: 'DESC'}})
    if(!pertemuan){
      return 0
    }
    return pertemuan.pertemuan_ke
  }

  async noPertemuan(mingguId: number){
    const pertemuanTerakhir = await this.findPertemuanMinggu(mingguId)
    const pertemuanBaru = pertemuanTerakhir + 1
    return pertemuanBaru
  }

async findMuridInKelas(kelasId: number, pertemuanId: number) {
  const users = await this.userRepository.find({where: {user_kelas: {kelas: {id: kelasId}}, absen: {pertemuan: {id: pertemuanId}}}, relations: ['user_kelas', 'user_kelas.kelas','absen', 'absen.pertemuan']})
  return users;
}

async findPertanyaan(pertemuanId: number){
  return await this.pertanyaanRepository.find({where: {quiz: {id:pertemuanId}}, relations: ['jawaban']})
}

async findLogBook(pertemuanId: number){
  return await this.logBookRepository.find({where: {pertemuan: {id: pertemuanId}}})
}

async findLogBookMentor(pertemuanId: number){
  return  await this.logbookMentorRepository.find({where: {pertemuan: {id: pertemuanId}}})
}

  async findOne(id: number) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: {id},
      relations: ['minggu', 'minggu.kelas', 'absen', 'materi', 'tugas']
    })
    if (!pertemuan) {
      throw new NotFoundException(`Pertemuan tidak ditemukan`);
    }

    if (!pertemuan.minggu) {
      throw new NotFoundException('kelas tidak ditemukan');
    }

    return pertemuan;
  }

  async update(id: number, updatePertemuanDto: UpdatePertemuanDto) {
    const pertemuan = await this.findOne(id)
    if(!pertemuan){
      throw new NotFoundException('pertemuan tidak ditemukan');
    }

    if(updatePertemuanDto.akhir_check === 'true'){
        updatePertemuanDto.akhir = true
      }else{
        updatePertemuanDto.akhir = false
      }
    Object.assign(pertemuan, updatePertemuanDto)
    return await this.pertemuanRepository.save(pertemuan)
  }

  async remove(pertemuanId: number, mingguId: number) {
    const pertemuan = await this.findOne(pertemuanId)
    if(!pertemuan){
      throw new NotFoundException('pertemuan tidak ditemukan')
    }
    await this.pertemuanRepository.remove(pertemuan)
  const semuaPertemuan = await this.pertemuanRepository.find({
    where: { minggu: { id: mingguId } },
    order: { createdAt: 'ASC' }
  });

  for (let i = 0; i < semuaPertemuan.length; i++) {
    semuaPertemuan[i].pertemuan_ke = i + 1;
    await this.pertemuanRepository.save(semuaPertemuan[i]);
  }

}

}
