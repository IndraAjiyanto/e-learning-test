import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePembayaranDto } from './dto/create-pembayaran.dto';
import { UpdatePembayaranDto } from './dto/update-pembayaran.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pembayaran } from 'src/entities/pembayaran.entity';
import { Repository } from 'typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class PembayaransService {
  constructor(
    @InjectRepository(Pembayaran)
    private readonly pembayaranRepository: Repository<Pembayaran>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async create(createPembayaranDto: CreatePembayaranDto) {
        const user = await this.userRepository.findOne({where: {id: createPembayaranDto.userId}})
        if(!user){
          return
        }

        const kelas = await this.kelasRepository.findOne({where: {id: createPembayaranDto.kelasId}})
        if(!kelas){
          return
        }

        const check = await  this.checkPembayaran(createPembayaranDto.userId, createPembayaranDto.kelasId)
        if(check == false){
          return false 
        }else{
          const pembayaran = await this.pembayaranRepository.create({
          ...createPembayaranDto,
          user: user,
          kelas: kelas
        })
        return await this.pembayaranRepository.save(pembayaran)
      }
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

  async checkPembayaran(userId:number, kelasId:number){
    const pembayaran = await this.pembayaranRepository.find({where: {user: {id:userId}, kelas:{id:kelasId}}})
    if(pembayaran.length){
      return false
    }else{
      return true
    }
  }

  async findKelas(kelasId: number){
    const kelas = await this.kelasRepository.findOne({where: {id:kelasId}, relations: ['pertemuan', 'kategori']})
    if(!kelas){
      return
    }else{
      return kelas
    }
  }

  async findPembayaran(userId: number){
    const pembayaran = await this.pembayaranRepository.find({where: {user: {id: userId}}, relations: ['kelas']})
  if(!pembayaran){
      return
    }else{
      return pembayaran
    }
  }

  async findAll() {
    const pembayaran = await this.pembayaranRepository.find({relations: ['user', 'kelas']})
    if(!pembayaran){
      return
    }else{
      return pembayaran
    }
  }

  async findOne(pembayaranId: number) {
    const pembayaran = await this.pembayaranRepository.findOne({where: {id:pembayaranId}, relations: ['user', 'kelas']})
    if(!pembayaran){
      return
    }else{
      return pembayaran
    }
  }

  async update(pembayaranId: number, updatePembayaranDto: UpdatePembayaranDto) {
        const pembayaran = await this.findOne(pembayaranId)
        if(!pembayaran){
          return
        }
        Object.assign(pembayaran, updatePembayaranDto)
        return await this.pembayaranRepository.save(pembayaran)
      }

  remove(id: number) {
    return `This action removes a #${id} pembayaran`;
  }
}
