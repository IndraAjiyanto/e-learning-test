import { Injectable } from '@nestjs/common';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Logbook } from 'src/entities/logbook.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Kelas } from 'src/entities/kelas.entity';

@Injectable()
export class LogbookService {
  @InjectRepository(Logbook)
  private readonly logBookRepository: Repository<Logbook>
  @InjectRepository(User)
  private readonly userRepository: Repository<User>
  @InjectRepository(Kelas)
  private readonly kelasRepository: Repository<Kelas>

  async create(createLogbookDto: CreateLogbookDto) {
    const user = await this.userRepository.findOne({where: {id: createLogbookDto.userId}})
    const kelas = await this.kelasRepository.findOne({where: {id: createLogbookDto.kelasId}})
    if(!user){
        throw new Error('User tidak ada');
    }
    if(!kelas){
        throw new Error('Kelas tidak ada');
    }
    const logbook = await this.logBookRepository.create({
      ...createLogbookDto,
      user: user,
      kelas: kelas
    })
    return await this.logBookRepository.save(logbook)
  }

  async findByUser(userId: number){
    return await this.logBookRepository.find({where: {user: {id: userId}}, relations: ['user','kelas']})
  }

  async findKelasByUser(userId: number){
    return await this.kelasRepository.find({where: {user: {id: userId}}, relations: ['user']})
  }

  async findAll() {
    return await this.logBookRepository.find({relations: ['kelas', 'user']})
  }

  findOne(id: number) {
    return `This action returns a #${id} logbook`;
  }

  update(id: number, updateLogbookDto: UpdateLogbookDto) {
    return `This action updates a #${id} logbook`;
  }

  remove(id: number) {
    return `This action removes a #${id} logbook`;
  }
}
