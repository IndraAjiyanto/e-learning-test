import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from '../entities/mission.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
  ) {}

  async create(createMissionDto: CreateMissionDto): Promise<Mission> {
    const mission = this.missionRepository.create(createMissionDto);
    return await this.missionRepository.save(mission);
  }

  async findAll(): Promise<Mission[]> {
    return await this.missionRepository.find();
  }

  async noPertemuan() {
    const mission_old = await this.missionRepository.find({
      order: { missionOrder: 'DESC' },
      take: 1,
    });
    if (!mission_old || mission_old.length === 0) {
      return 0;
    }
    const mission_new = mission_old[0].missionOrder + 1;
    return mission_new;
  }

  async findOne(id: number): Promise<Mission | null> {
    return await this.missionRepository.findOneBy({ id });
  }

  async update(id: number, updateMissionDto: UpdateMissionDto): Promise<Mission | null> {
    await this.missionRepository.update(id, updateMissionDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const mission = await this.findOne(id);
    if (!mission) {
      throw new Error('Mision not found');
    }
    await this.missionRepository.remove(mission);
    const allMission = await this.missionRepository.find();
    for (const item of allMission) {
      if (item.missionOrder > mission.missionOrder) {
        item.missionOrder -= 1;
        await this.missionRepository.save(item);
      }
    }
  }
}
