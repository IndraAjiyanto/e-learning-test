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
    throw new NotFoundException(`Kelas with ID ${kelasId} not found`);
  }

  // Ambil semua minggu dengan relasi lengkap
  const allMinggu = await this.mingguRepository.find({
    where: {
      kelas: { id: kelasId }
    },
    relations: [
      'quiz', 
      'pertemuan', 
      'pertemuan.absen',
      'pertemuan.absen.user', 
      'pertemuan.tugas', 
      'quiz.pertanyaan',
      'quiz.nilai', 
      'quiz.pertanyaan.jawaban', 
      'quiz.pertanyaan.jawaban_user', 
      'quiz.pertanyaan.jawaban_user.user'
    ],
    order: { minggu_ke: 'ASC' } // Asumsikan ada field urutan untuk mengurutkan minggu
  });

  // Proses setiap minggu untuk menentukan akses
  const processedMinggu = allMinggu.map((minggu, index) => {
    let canAccess = false;
    let accessMessage = '';

    if (index === 0) {
      // Minggu pertama selalu bisa diakses
      canAccess = true;
      accessMessage = 'Akses tersedia';
    } else {
      // Cek apakah quiz minggu sebelumnya memenuhi nilai minimum
      const previousMinggu = allMinggu[index - 1];
      const userQuizNilai = this.getUserQuizScore(previousMinggu.quiz, userId);
      const minimumScore = previousMinggu.quiz['nilai_minimal'] || 0;

      if (userQuizNilai !== null && userQuizNilai >= minimumScore) {
        canAccess = true;
        accessMessage = 'Akses tersedia';
      } else if (userQuizNilai === null) {
        canAccess = false;
        accessMessage = `Selesaikan quiz minggu ${index} terlebih dahulu`;
      } else {
        canAccess = false;
        accessMessage = `Nilai quiz minggu ${index} tidak memenuhi minimum (${userQuizNilai}/${minimumScore})`;
      }
    }

    return {
      ...minggu,
      canAccess,
      accessMessage,
      // Jika tidak bisa akses, sembunyikan detail pertemuan
      pertemuan: canAccess ? minggu.pertemuan : [],
    };
  });

  return processedMinggu;
}

// Helper method untuk mendapatkan nilai quiz user
private getUserQuizScore(quiz: any, userId: number): number | null {
  if (!quiz || !quiz.nilai) {
    return null;
  }

  const userNilai = quiz.nilai.find((nilai: any) => nilai.user_id === userId);
  return userNilai ? userNilai.score : null;
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
