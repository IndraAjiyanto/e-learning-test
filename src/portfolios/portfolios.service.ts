import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Portfolio } from 'src/entities/portfolio.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import cloudinary from 'src/common/config/multer.config';

@Injectable()
export class PortfoliosService {
    constructor(
      @InjectRepository(Portfolio)
      private readonly portfolioRepository: Repository<Portfolio>,

          @InjectRepository(Kelas)
          private readonly kelasRepository: Repository<Kelas>,
      
          @InjectRepository(User)
          private readonly userRepository: Repository<User>,

    ){}
  async create(createPortfolioDto: CreatePortfolioDto) {
    const user = await this.userRepository.findOne({where: {id: createPortfolioDto.userId}})
    const kelas = await this.kelasRepository.findOne({where: {id: createPortfolioDto.kelasId}})
    if(!user){
      throw new NotFoundException('user not found')
    }

    if(!kelas){
      throw new NotFoundException('kelas not found')
    }

    const portfolio = await this.portfolioRepository.create({
      ...createPortfolioDto,
      user: user,
      kelas: kelas
    })

    return await this.portfolioRepository.save(portfolio)
  }

  async findAll() {
    return await this.portfolioRepository.find({relations: ['kelas', 'user']})
  }

  async findOne(portfolioId: number) {
    const portfolio = await this.portfolioRepository.findOne({where: {id:portfolioId}})
    if(!portfolio){
      throw new NotFoundException('portfolio not found')
    }
    return portfolio
  }

    async getPublicIdFromUrl(url: string) {
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
          console.log('File not found in Cloudinary.');
        } else {
          console.log('File deleted from Cloudinary:', result);
        }
      } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        throw error;
      }
    }

  async update(portfolioId: number, updatePortfolioDto: UpdatePortfolioDto) {
    await this.portfolioRepository.update(portfolioId, updatePortfolioDto);
  }

  remove(id: number) {
    return `This action removes a #${id} portfolio`;
  }
}
