import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKategorisDto } from './dto/create-kategoris.dto';
import { UpdateKategorisDto } from './dto/update-kategoris.dto';
import cloudinary from 'src/common/config/multer.config';
import { InjectRepository } from '@nestjs/typeorm';
import { Kategori } from 'src/entities/kategori.entity';
import { Repository } from 'typeorm';
import { AlurKelas } from 'src/entities/alur_kelas.entity';
import { Kelas } from 'src/entities/kelas.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';

@Injectable()
export class KategorisService {
  constructor(
    @InjectRepository(Kategori)
    private readonly kategoriRepository: Repository<Kategori>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(JenisKelas)
    private readonly jenisKelasRepository: Repository<JenisKelas>,
  ) {}

  async create(createKategorisDto: CreateKategorisDto) {
    const kategori = await this.kategoriRepository.create(createKategorisDto);
    return await this.kategoriRepository.save(kategori);
  }

  async findOneKategori(kategoriName: string){
    return await this.kategoriRepository.findOne({where: {nama_kategori: kategoriName}, relations: ['kelas','kelas.alumni','pertanyaan_umum','']})
  }

  async findJenisKelas(){
    return await this.jenisKelasRepository.find()
  }

  async findAll(){
    return await this.kategoriRepository.find()
  }


  async findOne(kategoriId: number) {
    const kategori = await this.kategoriRepository.findOne({
      where: { id: kategoriId },
    });
    if (!kategori) {
      throw new NotFoundException('Category not found');
    }
    return kategori;
  }

  async findKelasByKategori(kategoriId: number) {
    return await this.kelasRepository.find({
      where: { kategori: { id: kategoriId } },
      relations: ['kategori', 'jenis_kelas', 'user_kelas', 'user_kelas.user'],
    });
  }

  async update(kategoriId: number, updateKategorisDto: UpdateKategorisDto) {
    const kategori = await this.findOne(kategoriId);
    if (!kategori) {
      throw new NotFoundException('Category not found');
    }
    Object.assign(kategori, updateKategorisDto);
    return await this.kategoriRepository.save(kategori);
  }

  async getPublicIdFromUrl(url: string) {
    // Cek jika url null atau undefined
    if (!url) {
      return null;
    }

    // Pisahkan berdasarkan "/upload/"
    const parts = url.split('/upload/');
    if (parts.length < 2) {
      return null;
    }

    // Ambil bagian setelah upload/
    let path = parts[1];

    // Hapus "v1234567890/" (versi auto Cloudinary)
    path = path.replace(/^v[0-9]+\/?/, '');

    // Buang extension (.jpg, .png, .pdf, dll)
    path = path.replace(/\.[^.]+$/, '');

    console.log('Public ID:', path); // Debug: lihat public ID yang dihasilkan

    await this.deleteFileIfExists(path);
  }

  async deleteFileIfExists(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'not found') {
      } else {
      }
    } catch (error) {
      throw error;
    }
  }

  async remove(kategoriId: number) {
    const kategori = await this.findOne(kategoriId);
    if (!kategori) {
      throw new NotFoundException('Category not found');
    }
    await this.kategoriRepository.remove(kategori);
    return { message: 'kategori successfully deleted' };
  }
}
