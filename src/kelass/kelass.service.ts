import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateKelassDto } from './dto/create-kelass.dto';
import { UpdateKelassDto } from './dto/update-kelass.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { In, Not, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { Minggu } from 'src/entities/minggu.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Nilai } from 'src/entities/nilai.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { Absen } from 'src/entities/absen.entity';
import { Tugas } from 'src/entities/tugas.entity';
import { JawabanTugas } from 'src/entities/jawaban_tugas.entity';
import { Pembayaran } from 'src/entities/pembayaran.entity';
import { UserKelas } from 'src/entities/user_kelas.entity';
import { Mentor } from 'src/entities/mentor.entity';

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
        @InjectRepository(JenisKelas)
        private readonly jenisKelasRepository: Repository<JenisKelas>,
        @InjectRepository(Minggu)
        private readonly mingguRepository: Repository<Minggu>,
        @InjectRepository(ProgresMinggu)
        private readonly progresMingguRepository: Repository<ProgresMinggu>,
        @InjectRepository(Nilai)
        private readonly nilaiRepository: Repository<Nilai>,
        @InjectRepository(Quiz)
        private readonly quizRepository: Repository<Quiz>,
        @InjectRepository(Absen)
        private readonly absenRepository: Repository<Absen>,
        @InjectRepository(JawabanTugas)
        private readonly jawabanTugasRepository: Repository<JawabanTugas>,
        @InjectRepository(ProgresPertemuan)
        private readonly progresPertemuanRepository: Repository<ProgresPertemuan>,
        @InjectRepository(Pembayaran)
        private readonly pembayaranRepository: Repository<Pembayaran>,
        @InjectRepository(UserKelas)
        private readonly userKelasRepository: Repository<UserKelas>,
        @InjectRepository(Mentor)
        private readonly mentorRepository: Repository<Mentor>,
  ){}

  async create(createKelassDto: CreateKelassDto) {
    const kategori = await this.kategoriRepository.findOne({where: {id: createKelassDto.kategoriId}})
    if(!kategori){
      throw new NotFoundException('kategori ini tidak ada')
    }
    const jenis_kelas = await this.jenisKelasRepository.findOne({where: {id: createKelassDto.jenis_kelasId}})
        if(!jenis_kelas){
      throw new NotFoundException('jenis_kelas ini tidak ada')
    }
    const kelas = await this.kelasRepository.create({
      ...createKelassDto,
      kategori: kategori,
      jenis_kelas: jenis_kelas
    })
    return await this.kelasRepository.save(kelas)
  }

  async addUserToKelas(userId: number, kelasId: number): Promise<UserKelas> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['user_kelas', 'user_kelas.kelas'],
    });
  
    if (!user) {
      throw new NotFoundException('User tidak ada');
    }
  
    const kelas = await this.kelasRepository.findOne({where: {id: kelasId}, relations: ['user_kelas','user_kelas.user'] });
    if (!kelas) {
      throw new NotFoundException('Kelas tidak ada');
    }
  
    const sudahGabung = await this.userKelasRepository.findOne({where: {user: {id: userId}, kelas: {id: kelasId}}})
    if (sudahGabung) {
      throw new BadRequestException('User sudah tergabung dalam kelas');
    }

    const daftar = await this.pembayaranRepository.find({where: { kelas: {id: kelasId}, proses: 'proces'}})
    const gabung = await this.userRepository.find({where: {user_kelas: {kelas: {id:kelasId}}}})
    const jumlah_user = daftar.length + gabung.length

    if(jumlah_user >= kelas.kuota ){
      throw new BadRequestException('Saat ini kelas sedang penuh');
    }
  

    const user_kelas = await this.userKelasRepository.create({
      progres: false,
      user: user,
      kelas: kelas
  })
    
    return await this.userKelasRepository.save(user_kelas);
  }

  async sumStudent(kelasId: number){
        const daftar = await this.pembayaranRepository.find({where: { kelas: {id: kelasId}, proses: 'proces'}})
    const gabung = await this.userKelasRepository.find({where: {kelas: {id:kelasId}}})
    const jumlah_user = daftar.length + gabung.length
    return jumlah_user
  }

async findMyCourse(userId: number) {
  const user = await this.userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  return await this.kelasRepository.find({
    where: {
      user_kelas: { user : {id: userId} }  
    },
    relations: ['user_kelas','user_kelas.user', 'kategori', 'jenis_kelas'], 
  });
}

async findMentor(kelasId){
  return await this.mentorRepository.find({where: {kelas: {id: kelasId}}})
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

async findAbsen(mingguId: number, userId: number){

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
    .leftJoinAndSelect('minggu.kelas', 'kelas')
    .leftJoinAndSelect('kelas.user_kelas', 'user_kelas', 'user_kelas.userId = :userId', {userId})
    .leftJoinAndSelect('kelas.sertifikat', 'sertifikat', 'sertifikat.userId = :userId', {userId})
    .leftJoinAndSelect('kelas.portfolio', 'portfolio', 'portfolio.userId = :userId', {userId})
    .leftJoinAndSelect('minggu.quiz', 'quiz')
    .leftJoinAndSelect('minggu.pertemuan', 'pertemuan')
    .leftJoinAndSelect('pertemuan.progres_pertemuan', 'progres_pertemuan', 'progres_pertemuan.userId = :userId', {userId})
    .leftJoinAndSelect('pertemuan.logbook', 'logbook','logbook.userId = :userId', {userId} )
    .leftJoinAndSelect('pertemuan.absen', 'absen')
    .leftJoinAndSelect('absen.user', 'user')
    .leftJoinAndSelect('pertemuan.tugas', 'tugas')
    .leftJoinAndSelect('quiz.pertanyaan', 'pertanyaan')
    .leftJoinAndSelect('quiz.nilai', 'nilai')
    .leftJoinAndSelect('pertanyaan.jawaban', 'jawaban')
    .leftJoinAndSelect(
      'pertanyaan.jawaban_user',
      'jawaban_user',
      'jawaban_user.userId = :userId',
      { userId }
    )
    .leftJoinAndSelect('jawaban_user.user', 'jawaban_user_user')
    .where('minggu.kelasId = :kelasId', { kelasId })
    .orderBy('minggu.minggu_ke', 'ASC')
    .addOrderBy('pertemuan.pertemuan_ke', 'ASC')
    .getMany();
}


async createProgresPertemuan(userId: number, mingguList: Minggu[]) {
  const progres: ProgresPertemuan[] = [];

  for (const m of mingguList) {
    for (const p of m.pertemuan) {
      const existingProgres = await this.progresPertemuanRepository.findOne({
        where: { pertemuan: { id: p.id }, user: { id: userId } }
      });

      if (existingProgres) {
        // Sudah ada progres untuk pertemuan ini
        // Cek apakah user sudah absen di pertemuan ini
        const absen = await this.absenRepository.findOne({
          where: { user: { id: userId }, pertemuan: { id: p.id } }
        });

        if (absen) {
          // Sudah absen, cari pertemuan selanjutnya
          const pertemuanSelanjutnya = await this.pertemuanRepository.findOne({
            where: { pertemuan_ke: p.pertemuan_ke + 1, minggu: { id: m.id } }
          });

          if (pertemuanSelanjutnya) {
            // Cek apakah sudah ada progres untuk pertemuan selanjutnya
            const existingNextProgres = await this.progresPertemuanRepository.findOne({
              where: { user: { id: userId }, pertemuan: { id: pertemuanSelanjutnya.id } }
            });

            // Save progres untuk pertemuan selanjutnya
            const data = await this.progresPertemuanRepository.save({
              id: existingNextProgres?.id, // Jika ada ID = update, jika null = insert
              user: { id: userId },
              pertemuan: { id: pertemuanSelanjutnya.id },
              materi: true,
              tugas: true
            });

            progres.push(data);
          }
        }

      } else {
        // Belum ada progres untuk pertemuan ini
        if (p.pertemuan_ke === 1) {
          // Pertemuan pertama - langsung bisa akses materi dan tugas
          const data = this.progresPertemuanRepository.create({
            user: { id: userId },
            pertemuan: { id: p.id },
            materi: true,
            tugas: true
          });
          progres.push(data);
          
        } else {
          // Pertemuan selain pertama - belum bisa akses materi dan tugas
          const data = this.progresPertemuanRepository.create({
            user: { id: userId },
            pertemuan: { id: p.id },
            materi: false,
            tugas: false
          });
          progres.push(data);
        }
      }
    }
  }

  // Save semua progres yang belum di-save
  return await this.progresPertemuanRepository.save(progres);
}


async findMingguClass(  kelasId: number) {
    const kelas = await this.findOne(kelasId);
  if (!kelas) {
    throw new NotFoundException(`User with ID ${kelasId} not found`);
  }
  return await this.mingguRepository.find({
    where: {
      kelas: { id: kelasId }
    }, order: {minggu_ke: 'ASC'},
    relations: ['quiz', 'pertemuan', 'pertemuan.absen', 'pertemuan.tugas', 'quiz.pertanyaan','quiz.nilai', 'quiz.pertanyaan.jawaban', 'quiz.pertanyaan.jawaban_user', 'quiz.pertanyaan.jawaban_user.user']
  });
}

async createProgresMinggu(userId: number, mingguList: Minggu[]) {
  const progres: ProgresMinggu[] = [];

  for (const m of mingguList) {
    const existingProgres = await this.progresMingguRepository.findOne({
      where: { minggu: { id: m.id }, user: { id: userId } }
    });

    if (existingProgres) {
      // Pastikan minggu ini punya quiz
      if (!m.quiz || m.quiz.length === 0) {
        continue;
      }

      
      const nilai = await this.nilaiRepository.find({
        where: { user: { id: userId }, quiz: { id: m.quiz[0].id } }
      });

      const quiz = await this.quizRepository.findOne({
        where: { minggu: { id: m.id } }
      });

      if (!quiz) {
        continue;
      }

      if (!nilai.length) {
        continue;
      }

      // Cek apakah ada nilai yang lulus
      const hasPassingScore = nilai.some(n => n.nilai >= quiz.nilai_minimal);

      if(m.akhir === true){
          await this.userKelasRepository.update(
    { user: { id: userId }, kelas: { id: m.kelas.id } }, 
    { progres: hasPassingScore }
  );
      }
      
      // Cari minggu selanjutnya
      const mingguSelanjutnya = await this.mingguRepository.findOne({
        where: { kelas: { id: m.kelas.id }, minggu_ke: m.minggu_ke + 1 }
      });

      if (mingguSelanjutnya) {
        // Cek apakah sudah ada progres untuk minggu selanjutnya
        const existingNextProgres = await this.progresMingguRepository.findOne({
          where: { user: { id: userId }, minggu: { id: mingguSelanjutnya.id } }
        });

        // Save progres untuk minggu selanjutnya
        const data = await this.progresMingguRepository.save({
          id: existingNextProgres?.id, // Jika ada ID = update, jika null = insert
          user: { id: userId },
          minggu: { id: mingguSelanjutnya.id },
          quiz: hasPassingScore // true jika lulus, false jika tidak
        });

        progres.push(data);
      }

    } else {
      // Belum ada progres untuk minggu ini
      if (m.minggu_ke === 1) {
        // Minggu pertama - langsung bisa akses quiz
        const data = this.progresMingguRepository.create({
          user: { id: userId },
          minggu: { id: m.id },
          quiz: true
        });
        progres.push(data);
        
      } else {
        // Minggu selain pertama - belum bisa akses quiz
        const data = this.progresMingguRepository.create({
          user: { id: userId },
          minggu: { id: m.id },
          quiz: false
        });
        progres.push(data);
      }
    }
  }

  // Save semua progres yang belum di-save
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
async findJenisKelas(){
  return await this.jenisKelasRepository.find()
}


  async findAll() {
    return await this.kelasRepository.find({relations: ['kategori']})
  }

  async findAllLaunch() {
    return await this.kelasRepository.find({where: {launch: true}, relations: ['kategori']})
  }

  async findMurid(id: number){
    return await this.userRepository.find({where: {user_kelas: {kelas: {id: id}}}})
  }

  async allKelas(){
   return await this.kelasRepository.find({relations: ['user_kelas', 'user_kelas.user' ,'kategori']})
  }

  async allClassExcept(kelasId: number){
    return await this.kelasRepository.find({where: {id: Not(kelasId)}, relations: ['user_kelas', 'user_kelas.user', 'kategori', 'jenis_kelas']})
  }

  async findOne(kelasId: number) {
    const kelas = await this.kelasRepository.findOne({where: {id: kelasId}, relations: ['user_kelas', 'user_kelas.user', 'kategori', 'jenis_kelas']})
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
  
  if (updateKelassDto.jenis_kelasId) {
    const jenis_kelas = await this.jenisKelasRepository.findOne({
      where: { id: updateKelassDto.jenis_kelasId }
    });

      if (!jenis_kelas) {
      throw new NotFoundException(`Jenis kelas dengan ID ${updateKelassDto.jenis_kelasId} tidak ditemukan`);
    }

    kelas.jenis_kelas = jenis_kelas

  }

  const { jenis_kelasId, kategoriId, ...otherProperties } = updateKelassDto;
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
  const user_kelas = await this.userKelasRepository.findOne({where: {user: {id: userId}, kelas: {id: kelasId}}})
  if(!user_kelas){
    throw new NotFoundException('user kelas not found')
  }
return await this.userKelasRepository.remove(user_kelas)
}



}
