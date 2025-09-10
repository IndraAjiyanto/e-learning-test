import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePertemuanDto } from './dto/create-pertemuan.dto';
import { UpdatePertemuanDto } from './dto/update-pertemuan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Pertanyaan } from 'src/entities/pertanyaan.entity';

@Injectable()
export class PertemuansService {
  constructor(
    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,

    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Pertanyaan)
    private readonly pertanyaanRepository: Repository<Pertanyaan>
  ){}

  async create(createPertemuanDto: CreatePertemuanDto) {
    const kelas = await this.kelasRepository.findOne({where: {id: createPertemuanDto.kelasId}})
    if(!kelas){
      throw new NotFoundException('kelas ini tidak ada')
    }
    const pertemuan = await this.pertemuanRepository.findOne({where: {pertemuan_ke: createPertemuanDto.pertemuan_ke - 1, kelas: {id: kelas.id}}})

    if(!pertemuan?.akhir){
      if(createPertemuanDto.akhir_check === 'true'){
        createPertemuanDto.akhir = true
      }
    const user = await this.pertemuanRepository.create({
      ...createPertemuanDto,
      kelas: kelas,
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

  async findPertemuanKelas(id: number){
    const pertemuan = await this.pertemuanRepository.findOne({where: {kelas: {id: id}}, order: {createdAt: 'DESC'}})
    if(!pertemuan){
      return 0
    }
    return pertemuan.pertemuan_ke
  }

  async noPertemuan(id: number){
    const pertemuanTerakhir = await this.findPertemuanKelas(id)
    const pertemuanBaru = pertemuanTerakhir + 1
    return pertemuanBaru
  }

async findMuridInKelas(kelasId: number, pertemuanId: number) {
  const users = await this.userRepository.find({where: {kelas: {id: kelasId}, absen: {pertemuan: {id: pertemuanId}}}, relations: ['kelas', 'absen', 'absen.pertemuan']})
  return users;
}

async findPertanyaan(pertemuanId: number){
  return await this.pertanyaanRepository.find({where: {pertemuan: {id:pertemuanId}}, relations: ['jawaban']})
}




  async findOne(id: number) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: {id},
      relations: ['kelas', 'absen', 'materi', 'tugas']
    })
    if (!pertemuan) {
      throw new NotFoundException(`Pertemuan tidak ditemukan`);
    }

    if (!pertemuan.kelas) {
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

  async remove(id: number, kelasId: number) {
    const pertemuan = await this.findOne(id)
    if(!pertemuan){
      throw new NotFoundException('pertemuan tidak ditemukan')
    }
    await this.pertemuanRepository.remove(pertemuan)
  const semuaPertemuan = await this.pertemuanRepository.find({
    where: { kelas: { id: kelasId } },
    order: { createdAt: 'ASC' }
  });

  for (let i = 0; i < semuaPertemuan.length; i++) {
    semuaPertemuan[i].pertemuan_ke = i + 1;
    await this.pertemuanRepository.save(semuaPertemuan[i]);
  }

}

}
