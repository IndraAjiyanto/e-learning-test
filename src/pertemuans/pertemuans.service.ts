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
import { ProgresPertemuan } from 'src/entities/progres_pertemuan.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';
import { Tugas } from 'src/entities/tugas.entity';

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
    private readonly logbookMentorRepository: Repository<LogbookMentor>,

    @InjectRepository(ProgresPertemuan)
    private readonly progresPertemuanRepository: Repository<ProgresPertemuan>,

    @InjectRepository(ProgresMinggu)
    private readonly progresMingguRepository: Repository<ProgresMinggu>,

    @InjectRepository(Tugas)
    private readonly tugasRepository: Repository<Tugas>,

  ) {}

  async create(createPertemuanDto: CreatePertemuanDto) {
    const minggu = await this.mingguRepository.findOne({
      where: { id: createPertemuanDto.mingguId }, relations: ['kelas'],
    });
    if (!minggu) {
      throw new NotFoundException('minggu ini tidak ada');
    }
    if(createPertemuanDto.pertemuan_ke === 1){
      const data = await this.pertemuanRepository.create({
        ...createPertemuanDto,
        minggu: minggu,
      });
      const new_pertemuan = await this.pertemuanRepository.save(data);
      const progresMinggu = await this.progresMingguRepository.find({
        where: { minggu: { id: minggu.id }, proses: true },
        relations: ['user'],
      });
      if(progresMinggu.length > 0){
      for (const progres of progresMinggu) {
        await this.progresPertemuanRepository.save({
          logbook: false,
          absen: true,
          pertemuan: new_pertemuan,
          user: progres.user,
        });
      }
    }
  }else{


    const pertemuan = await this.pertemuanRepository.findOne({
      where: {
        pertemuan_ke: createPertemuanDto.pertemuan_ke - 1,
        minggu: { id: minggu.id },
      },
    });

    if(!pertemuan){
      throw new NotFoundException('pertemuan sebelumnya harus dibuat terlebih dahulu');
    }else if (!pertemuan.akhir) {
      if (createPertemuanDto.akhir_check === 'true') {
        createPertemuanDto.akhir = true;
      }
      const user = await this.pertemuanRepository.create({
        ...createPertemuanDto,
        minggu: minggu,
      });
      const new_pertemuan = await this.pertemuanRepository.save(user);
      const progresPertemuan = await this.progresPertemuanRepository.find({
        where: { pertemuan: { id: pertemuan.id }, absen: true, logbook: true },
        relations: ['user'],
      });
      if(progresPertemuan.length > 0){
      for (const progres of progresPertemuan) {
        await this.progresPertemuanRepository.save({
          absen: true,
          logbook: false,
          pertemuan: new_pertemuan,
          user: progres.user,
        });
      }

    }
    }
  }
}

  async findAllKelas() {
    return await this.kelasRepository.find();
  }

  async findPertemuanMinggu(mingguId: number) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: { minggu: { id: mingguId } },
      order: { createdAt: 'DESC' },
    });
    if (!pertemuan) {
      return 0;
    }
    return pertemuan.pertemuan_ke;
  }

  async noPertemuan(mingguId: number) {
    const pertemuanTerakhir = await this.findPertemuanMinggu(mingguId);
    const pertemuanBaru = pertemuanTerakhir + 1;
    return pertemuanBaru;
  }

  async findMuridInKelas(kelasId: number, pertemuanId: number) {
    return await this.userRepository.find({
      where: {
        user_kelas: { kelas: { id: kelasId } },
        absen: { pertemuan: { id: pertemuanId } },
      },
      relations: ['absen'],
    });
  }

  async findPertanyaan(pertemuanId: number) {
    return await this.pertanyaanRepository.find({
      where: { quiz: { id: pertemuanId } },
      relations: ['jawaban'],
    });
  }

  async findLogBook(pertemuanId: number) {
    return await this.logBookRepository.find({
      where: { pertemuan: { id: pertemuanId } },
      relations: [
        'user',
        'pertemuan',
        'pertemuan.minggu',
        'pertemuan.minggu.kelas',
      ],
    });
  }

  async findLogBookMentor(pertemuanId: number) {
    return await this.logbookMentorRepository.find({
      where: { pertemuan: { id: pertemuanId } },
      relations: [
        'user',
        'pertemuan',
        'pertemuan.minggu',
        'pertemuan.minggu.kelas',
      ],
    });
  }

  async findTugas(pertemuanId: number) {
    return await this.tugasRepository.find({
      where: { pertemuan : { id: pertemuanId } },
    });
  }

  async findOne(id: number) {
    const pertemuan = await this.pertemuanRepository.findOne({
      where: { id },
      relations: ['minggu', 'minggu.kelas'],
    });
    if (!pertemuan) {
      throw new NotFoundException(`Pertemuan tidak ditemukan`);
    }

    if (!pertemuan.minggu) {
      throw new NotFoundException('kelas tidak ditemukan');
    }

    return pertemuan;
  }

  async update(id: number, updatePertemuanDto: UpdatePertemuanDto) {
    const pertemuan = await this.findOne(id);
    if (!pertemuan) {
      throw new NotFoundException('pertemuan tidak ditemukan');
    }

    if (updatePertemuanDto.akhir_check === 'true') {
      updatePertemuanDto.akhir = true;
    } else {
      updatePertemuanDto.akhir = false;
    }
    Object.assign(pertemuan, updatePertemuanDto);
    return await this.pertemuanRepository.save(pertemuan);
  }

  async remove(pertemuanId: number, mingguId: number) {
    const pertemuan = await this.findOne(pertemuanId);
    if (!pertemuan) {
      throw new NotFoundException('pertemuan tidak ditemukan');
    }
    await this.pertemuanRepository.remove(pertemuan);
    const semuaPertemuan = await this.pertemuanRepository.find({
      where: { minggu: { id: mingguId } },
      order: { createdAt: 'ASC' },
    });

    for (let i = 0; i < semuaPertemuan.length; i++) {
      semuaPertemuan[i].pertemuan_ke = i + 1;
      await this.pertemuanRepository.save(semuaPertemuan[i]);
    }
  }
}
