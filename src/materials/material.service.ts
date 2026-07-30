import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileType, Material } from 'src/entities/materials.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}
  async create(createMaterialDto: CreateMaterialDto) {
    const session = await this.sessionRepository.findOne({
      where: { id: createMaterialDto.sessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    const material = await this.materialRepository.create({
      ...createMaterialDto,
      session: session,
    });
    return await this.materialRepository.save(material);
  }

  async findMateriBypertemuan(sessionId: number) {
    return await this.materialRepository.find({
      where: { session: { id: sessionId } },
      relations: ['session'],
    });
  }

  async findMaterialPdf(sessionId: number) {
    return await this.materialRepository.find({
      where: { session: { id: sessionId }, fileType: 'pdf' },
    });
  }

  async findMaterialPpt(sessionId: number) {
    const materialList = await this.materialRepository.find({
      where: { session: { id: sessionId }, fileType: 'ppt' },
    });

    return materialList;
  }

  async findSession(sessionId: number) {
    return await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['weeks', 'weeks.course'],
    });
  }

  async findMaterialVideo(sessionId: number) {
    return await this.materialRepository.find({
      where: { session: { id: sessionId }, fileType: 'video' },
    });
  }

  async findSessionsByCourse(weeksId: number) {
    const session = await this.sessionRepository.find({
      where: { weeks: { id: weeksId } },
      relations: ['materials'],
      order: { id: 'ASC' },
    });

    return session.map((p) => ({
      ...p,
      materialPdf: p.materials.filter((m) => m.fileType === 'pdf'),
      materialVideo: p.materials.filter((m) => m.fileType === 'video'),
      materialPpt: p.materials.filter((m) => m.fileType === 'ppt'),
    }));
  }

  async findMaterialsByTypeAndSession(weeksId: number, fileType: FileType) {
    return await this.materialRepository.find({
      where: {
        fileType: fileType,
        session: { weeks: { id: weeksId } },
      },
    });
  }

  async findIdentityMateri(fileType: FileType, sessionId: number) {
    return await this.materialRepository.find({
      where: { fileType: fileType, session: { id: sessionId } },
      relations: ['session'],
    });
  }

  async findOne(id: number) {
    const material = await this.materialRepository.findOne({
      where: { id },
      relations: ['session'],
    });
    if (!material) {
      throw new NotFoundException(`Material not found`);
    }

    if (!material.session) {
      throw new NotFoundException('Session not found');
    }

    return material;
  }

  async deleteFile(url: string) {
    if (!url) return;

    try {
      const filePath = path.join(process.cwd(), 'public', url);

      await fs.unlink(filePath);
    } catch (error) {
    }
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const material = await this.findOne(id);
    if (!material) {
      throw new NotFoundException('Material not found');
    }
    Object.assign(material, updateMaterialDto);
    return await this.materialRepository.save(material);
  }

  async remove(materialId: number) {
    const material = await this.findOne(materialId);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.fileType == 'pdf') {
      await this.deleteFile(material.file);
    }

    return await this.materialRepository.remove(material);
  }
}
