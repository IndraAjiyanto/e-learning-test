import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Portfolio } from 'src/entities/portfolio.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';

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

  findAll() {
    return `This action returns all portfolios`;
  }

  async findOne(portfolioId: number) {
    return await this.portfolioRepository.findOne({where: {id:portfolioId}})
  }

  update(id: number, updatePortfolioDto: UpdatePortfolioDto) {
    return `This action updates a #${id} portfolio`;
  }

  remove(id: number) {
    return `This action removes a #${id} portfolio`;
  }
}
