import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { Minggu } from 'src/entities/minggu.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';

@Injectable()
export class KelassService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>, 
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Pertemuan)
        private readonly pertemuanRepository: Repository<Pertemuan>,
        @InjectRepository(Kategori)
        private readonly kategoriRepository: Repository<Kategori>,
        @InjectRepository(Minggu)
        private readonly mingguRepository: Repository<Minggu>,
        @InjectRepository(ProgresMinggu)
        private readonly progresMingguRepository: Repository<ProgresMinggu>,
  ){}

  async create(createKelassDto: CreateKelassDto) {
    const kategori = await this.kategoriRepository.findOne({where: {id: createKelassDto.kategoriId}})
    if(!kategori){
      throw new NotFoundException('kategori ini tidak ada')
    }
    const kelas = await this.kelasRepository.create({
      ...createKelassDto,
      kategori: kategori,
    })
    return await this.kelasRepository.save(kelas)
  }

  async addUserToKelas(userId: number, kelasId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['kelas'],
    });
  
    if (!user) {
      throw new NotFoundException('User tidak ada');
    }
  
    const kelas = await this.kelasRepository.findOneBy({ id: kelasId });
    if (!kelas) {
      throw new NotFoundException('Kelas tidak ada');
    }
  
    const sudahGabung = user.kelas.some((k) => k.id === kelas.id);
    if (sudahGabung) {
      throw new BadRequestException('User sudah tergabung dalam kelas');
    }
  
    user.kelas.push(kelas);
    return await this.userRepository.save(user);
  }

async findMyCourse(userId: number) {
  const user = await this.userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  return await this.kelasRepository.find({
    where: {
      user: { id: userId }  
    },
    relations: ['user', 'kategori'], 
  });
}

async findPertemuanAndPertanyaan(mingguId: number, userId: number) {
  const minggu = await this.findOne(mingguId);
  if (!minggu) {
    throw new NotFoundException(`minggu dengan ID ${mingguId} tidak ditemukan`);
  }

  return await this.pertemuanRepository.find({
    where: { minggu: { id: mingguId } },
    relations: [
      'minggu',
      'absen.user',
      'pertanyaan',
      'tugas',
      'pertanyaan.jawaban',
      'pertanyaan.jawaban_user',
      'pertanyaan.jawaban_user.user', 
    ],
  });

}


async findMinggu(kelasId: number, userId: number) {
  const kelas = await this.findOne(kelasId);
  if (!kelas) {
    throw new NotFoundException(`Kelas dengan ID ${kelasId} tidak ditemukan`);
  }

  return await this.mingguRepository
    .createQueryBuilder('minggu')
    .leftJoinAndSelect(
      'minggu.progres_minggu',
      'progres_minggu',
      'progres_minggu.userId = :userId',
      { userId }
    )
    .leftJoinAndSelect('minggu.quiz', 'quiz')
    .leftJoinAndSelect('minggu.pertemuan', 'pertemuan')
    .leftJoinAndSelect('pertemuan.absen', 'absen')
    .leftJoinAndSelect('absen.user', 'user')
    .leftJoinAndSelect('pertemuan.tugas', 'tugas')
    .leftJoinAndSelect('quiz.pertanyaan', 'pertanyaan')
    .leftJoinAndSelect('quiz.nilai', 'nilai')
    .leftJoinAndSelect('pertanyaan.jawaban', 'jawaban')
    .leftJoinAndSelect('pertanyaan.jawaban_user', 'jawaban_user', 'jawaban_user.userId = :userId', { userId }) // <- filter jawaban user juga
    .leftJoinAndSelect('jawaban_user.user', 'jawaban_user_user')
    .where('minggu.kelasId = :kelasId', { kelasId })
    .getMany();
}


async findMingguClass(  kelasId: number) {
    const kelas = await this.findOne(kelasId);
  if (!kelas) {
    throw new NotFoundException(`User with ID ${kelasId} not found`);
  }
  return await this.mingguRepository.find({
    where: {
      kelas: { id: kelasId }
    },
    relations: ['quiz', 'pertemuan', 'pertemuan.absen', 'pertemuan.tugas', 'quiz.pertanyaan','quiz.nilai', 'quiz.pertanyaan.jawaban', 'quiz.pertanyaan.jawaban_user', 'quiz.pertanyaan.jawaban_user.user']
  });
}

async createProgresMinggu(userId: number, mingguList: Minggu[]) {
  const progres: ProgresMinggu[] = [];

  for (const m of mingguList) {
    const existingProgres = await this.progresMingguRepository.findOne({where: {minggu: {id: m.id}, user: {id: userId}}})
    if(existingProgres){

    }else if(m.minggu_ke === 1){
      const data = await this.progresMingguRepository.create({
  user: { id: userId },
  minggu: { id: m.id },
  quiz: true
});

    progres.push(data);
    }else{
            const data = await this.progresMingguRepository.create({
  user: { id: userId },
  minggu: { id: m.id },
  quiz: false
});

    progres.push(data);
    }

  }

  return await this.progresMingguRepository.save(progres);
}

async findMingguTerakhir(kelasId: number){
  const minggu = await this.mingguRepository.find({where: {kelas: {id: kelasId}, akhir: true}})
  if(minggu.length){
    return true
  }else{
    return false
  }
}

async findUser(){
  return await this.userRepository.find({where: {role: 'user'}})
}

async findKategori(){
  return await this.kategoriRepository.find()
}


  async findAll() {
    return await this.kelasRepository.find({relations: ['kategori']})
  }

  async findAllLaunch() {
    return await this.kelasRepository.find({where: {launch: true}, relations: ['kategori']})
  }

  async findMurid(id: number){
    return await this.userRepository.find({where: {kelas: {id: id}}})
  }

  async allKelas(){
   return await this.kelasRepository.find({relations: ['user', 'kategori']})
  }

  async findOne(kelasId: number) {
    const kelas =  await this.kelasRepository.findOne({where: {id: kelasId}, relations: ['user', 'kategori']})
    if(!kelas){
      throw new NotFoundException()
    }
    return kelas
  }

  async updateLaunch(kelasId: number, updateKelassDto: UpdateKelassDto){
    const kelas = await this.findOne(kelasId)
    if(!kelas){
      throw new NotFoundException()
    }
    if(kelas.launch === true){
      updateKelassDto.launch = false
    } else if (kelas.launch === false){
      updateKelassDto.launch = true
    }
    Object.assign(kelas, updateKelassDto)
    return await this.kelasRepository.save(kelas)
  }

  async update(id: number, updateKelassDto: UpdateKelassDto) {
  const kelas = await this.findOne(id);
  if (!kelas) {
    throw new NotFoundException(`Kelas dengan ID ${id} tidak ditemukan`);
  }

  if (updateKelassDto.kategoriId) {
    const kategori = await this.kategoriRepository.findOne({
      where: { id: updateKelassDto.kategoriId }
    });
    
    if (!kategori) {
      throw new NotFoundException(`Kategori dengan ID ${updateKelassDto.kategoriId} tidak ditemukan`);
    }
    
    kelas.kategori = kategori;
  }
  const { kategoriId, ...otherProperties } = updateKelassDto;
  Object.assign(kelas, otherProperties);

  return await this.kelasRepository.save(kelas);
  }

  async remove(id: number) {
    const kelas = await this.findOne(id)
    if(!kelas){
      throw new NotFoundException()
    }
    return await this.kelasRepository.remove(kelas)
  }

async removeUserKelas(userId: number, kelasId: number) {

await this.kelasRepository  
    .createQueryBuilder()
  .relation(Kelas, "user")
  .of(kelasId)
  .remove(userId);
}



}
