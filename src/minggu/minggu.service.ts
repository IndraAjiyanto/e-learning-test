import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMingguDto } from './dto/create-minggu.dto';
import { UpdateMingguDto } from './dto/update-minggu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Minggu } from 'src/entities/minggu.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { ProgresMinggu } from 'src/entities/progres_minggu.entity';
import { th } from 'date-fns/locale';
import { UserKelas } from 'src/entities/user_kelas.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';

@Injectable()
export class MingguService {
  constructor(
    @InjectRepository(Minggu)
    private readonly mingguRepository: Repository<Minggu>,

    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,

    @InjectRepository(ProgresMinggu)
    private readonly progresMingguRepository: Repository<ProgresMinggu>,

    @InjectRepository(UserKelas)
    private readonly userKelasRepository: Repository<UserKelas>,

    @InjectRepository(Pertemuan)
    private readonly pertemuanRepository: Repository<Pertemuan>,
  ) {}

  async create(createMingguDto: CreateMingguDto, kelasId: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { id: kelasId },
    });
    if (!kelas) {
      throw new NotFoundException('kelas Not Found');
    }
    if(createMingguDto.minggu_ke === 1){
      const data = await this.mingguRepository.create({
        ...createMingguDto,
        kelas: kelas,
      });
      const minggu = await this.mingguRepository.save(data);

      const userKelass = await this.userKelasRepository.find({
        where: { kelas: { id: kelas.id }, progres: false },
        relations: ['user'],
      });
if(userKelass.length > 0){
      for (const userKelas of userKelass) {
        await this.progresMingguRepository.save({
          minggu: minggu,
          user: userKelas.user,
          quiz: false,
          proses: true,
        });
      }
    }
    }else{

    const minggu = await this.mingguRepository.findOne({
      where: {
        minggu_ke: createMingguDto.minggu_ke - 1,
        kelas: { id: kelas.id },
      }, relations: ['progres_minggu'],
    });

    if(!minggu){
      throw new NotFoundException('minggu sebelumnya harus dibuat terlebih dahulu');
    }else if (!minggu.akhir) {
      if (createMingguDto.akhir_check === 'true') {
        createMingguDto.akhir = true;
      }
      const data = await this.mingguRepository.create({
        ...createMingguDto,
        kelas: kelas,
      });
      const newMinggu = await this.mingguRepository.save(data);

      if(minggu.progres_minggu.length > 0){
        const progresMinggu = await this.progresMingguRepository.find({
          where: { minggu: { id: minggu.id }, proses: true , quiz: true },
          relations: ['user'],
        });

      if(progresMinggu.length > 0){
        for (const progres of progresMinggu) {
          await this.progresMingguRepository.save({
            minggu: newMinggu,
            user: progres.user,
            quiz: false,
            proses: true,
          });
        }
      }
    }
    }
    }
  }

  async noPertemuan(kelasId: number) {
    const mingguTerakhir = await this.findMingguKelas(kelasId);
    const mingguBaru = mingguTerakhir + 1;
    return mingguBaru;
  }

  async findMingguKelas(kelasId: number) {
    const minggu = await this.mingguRepository.findOne({
      where: { kelas: { id: kelasId } },
      order: { minggu_ke: 'DESC' },
    });
    if (!minggu) {
      return 0;
    }
    return minggu.minggu_ke;
  }

  async findOne(mingguId: number) {
    return await this.mingguRepository.findOne({
      where: { id: mingguId },
      relations: ['pertemuan', 'quiz', 'kelas'],
      order: {
        pertemuan: {
          pertemuan_ke: 'ASC',
        },
      },
    });
  }

  async findPertemuanAkhir(mingguId: number) {
    return await this.pertemuanRepository.findOne({
      where: { minggu: { id: mingguId }, akhir: true},
    });
  }

  async update(id: number, updateMingguDto: UpdateMingguDto) {
    const minggu = await this.findOne(id);
    if (!minggu) {
      throw new NotFoundException('week not found');
    }

    if (updateMingguDto.akhir_check === 'true') {
      updateMingguDto.akhir = true;
    } else {
      updateMingguDto.akhir = false;
    }
    Object.assign(minggu, updateMingguDto);
    return await this.mingguRepository.save(minggu);
  }

  async remove(id: number, kelasId: number) {
    const minggu = await this.findOne(id);
    if (!minggu) {
      throw new NotFoundException('week not found');
    }
    await this.mingguRepository.remove(minggu);
    const semuaMinggu = await this.mingguRepository.find({
      where: { kelas: { id: kelasId } },
      order: { createdAt: 'ASC' },
    });

    for (let i = 0; i < semuaMinggu.length; i++) {
      semuaMinggu[i].minggu_ke = i + 1;
      await this.mingguRepository.save(semuaMinggu[i]);
    }
  }
}
