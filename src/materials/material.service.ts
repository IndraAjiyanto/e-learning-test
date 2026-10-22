import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FileType,
  FILE_TYPE_LABEL,
  Material,
} from 'src/entities/materials.entity';
import { Repository } from 'typeorm';
import { Session } from 'src/entities/session.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { GoogleSlidesService } from './google-slides.service';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Syllabus)
    private readonly syllabusRepository: Repository<Syllabus>,
    private readonly googleSlidesService: GoogleSlidesService,
  ) {}

  /**
   * Materi milik satu syllabus dengan jenis berkas tertentu (pdf/ppt/video).
   */
  async findSyllabusMaterialByType(
    syllabusId: string,
    fileType: FileType,
  ): Promise<Material | null> {
    return await this.materialRepository.findOne({
      where: { syllabus: { id: syllabusId }, fileType },
    });
  }

  /**
   * Batas upload syllabus: satu syllabus hanya boleh punya SATU materi untuk
   * tiap jenis berkas (1 PDF + 1 PPT + 1 Video).
   *
   * Materi yang sudah ada tidak boleh digandakan lewat upload baru — admin
   * memakai Edit (replace berkas) atau Delete dulu bila ingin mengunggah
   * berkas pengganti. Materi milik session TIDAK dibatasi jumlahnya.
   */
  async assertSyllabusSlotAvailable(
    syllabusId: string,
    fileType: FileType,
  ): Promise<void> {
    if (!fileType) return;

    const existing = await this.findSyllabusMaterialByType(
      syllabusId,
      fileType,
    );
    if (existing) {
      throw new BadRequestException(
        `Materi ${FILE_TYPE_LABEL[fileType]} untuk syllabus ini sudah ada. ` +
          'Silakan edit materi yang tersedia untuk menggantinya.',
      );
    }
  }

  async create(createMaterialDto: CreateMaterialDto) {
    if (createMaterialDto.syllabusId) {
      const syllabus = await this.syllabusRepository.findOne({
        where: { id: createMaterialDto.syllabusId },
      });
      if (!syllabus) {
        throw new NotFoundException('Syllabus not found');
      }

      await this.assertSyllabusSlotAvailable(
        createMaterialDto.syllabusId,
        createMaterialDto.fileType,
      );

      const material = this.materialRepository.create({
        ...createMaterialDto,
        driveFileId: createMaterialDto.driveFileId ?? undefined,
        session: undefined,
        syllabus: syllabus,
      });
      return await this.materialRepository.save(material);
    }

    const session = await this.sessionRepository.findOne({
      where: { id: createMaterialDto.sessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    const material = this.materialRepository.create({
      ...createMaterialDto,
      driveFileId: createMaterialDto.driveFileId ?? undefined,
      session: session,
    });
    return await this.materialRepository.save(material);
  }

  async findMateriBypertemuan(sessionId: string) {
    return await this.materialRepository.find({
      where: { session: { id: sessionId } },
      relations: ['session'],
    });
  }

  async findMaterialPdf(sessionId: string) {
    return await this.materialRepository.find({
      where: { session: { id: sessionId }, fileType: 'pdf' },
    });
  }

  async findMaterialPpt(sessionId: string) {
    const materialList = await this.materialRepository.find({
      where: { session: { id: sessionId }, fileType: 'ppt' },
    });

    return materialList;
  }

  async findSession(sessionId: string) {
    return await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['weeks', 'weeks.course'],
    });
  }

  async findMaterialVideo(sessionId: string) {
    return await this.materialRepository.find({
      where: { session: { id: sessionId }, fileType: 'video' },
    });
  }

  async findSyllabusMaterialPdf(syllabusId: string) {
    return await this.materialRepository.find({
      where: { syllabus: { id: syllabusId }, fileType: 'pdf' },
    });
  }

  async findSyllabusMaterialPpt(syllabusId: string) {
    return await this.materialRepository.find({
      where: { syllabus: { id: syllabusId }, fileType: 'ppt' },
    });
  }

  async findSyllabusMaterialVideo(syllabusId: string) {
    return await this.materialRepository.find({
      where: { syllabus: { id: syllabusId }, fileType: 'video' },
    });
  }

  async findSessionsByCourse(weeksId: string) {
    const session = await this.sessionRepository.find({
      where: { weeks: { id: weeksId } },
      relations: ['materials'],
      order: { sessionOrder: 'ASC' },
    });

    return session.map((p) => ({
      ...p,
      materialPdf: p.materials.filter((m) => m.fileType === 'pdf'),
      materialVideo: p.materials.filter((m) => m.fileType === 'video'),
      materialPpt: p.materials.filter((m) => m.fileType === 'ppt'),
    }));
  }

  async findMaterialsByTypeAndSession(weeksId: string, fileType: FileType) {
    return await this.materialRepository.find({
      where: {
        fileType: fileType,
        session: { weeks: { id: weeksId } },
      },
    });
  }

  async findIdentityMateri(fileType: FileType, sessionId: string) {
    return await this.materialRepository.find({
      where: { fileType: fileType, session: { id: sessionId } },
      relations: ['session'],
    });
  }

  async findOne(id: string) {
    const material = await this.materialRepository.findOne({
      where: { id },
      relations: ['session', 'syllabus'],
    });
    if (!material) {
      throw new NotFoundException(`Material not found`);
    }

    if (!material.session && !material.syllabus) {
      throw new NotFoundException('Session not found');
    }

    return material;
  }

  /**
   * Halaman tujuan setelah create/update/delete: materi milik sylabus
   * kembali ke halaman detail sylabus, milik session ke halaman detail
   * session (perilaku lama dipertahankan).
   */
  findRedirectPath(material: {
    session?: { id: string } | null;
    syllabus?: { id: string } | null;
  }) {
    if (material.syllabus?.id) {
      return `/syllabus/${material.syllabus.id}`;
    }
    return `/session/${material.session?.id || ''}`;
  }

  async deleteFile(url: string) {
    if (!url) return;
    if (/^https?:\/\//i.test(url)) return;

    const rel = url.startsWith('/') ? url.slice(1) : url;

    const candidates: string[] = [];
    if (rel.startsWith('asset/')) {
      candidates.push(path.join(process.cwd(), 'public', rel));
    } else if (rel.startsWith('uploads/')) {
      candidates.push(path.join(process.cwd(), rel));
      candidates.push(path.join(process.cwd(), 'public', rel));
    } else {
      candidates.push(path.join(process.cwd(), 'public', rel));
      candidates.push(path.join(process.cwd(), rel));
    }

    for (const candidate of candidates) {
      try {
        await fs.unlink(candidate);
        return;
      } catch {
        // ignore - lanjut ke kandidat berikutnya
      }
    }
  }

  async update(id: string, updateMaterialDto: UpdateMaterialDto) {
    const material = await this.findOne(id);
    if (!material) {
      throw new NotFoundException('Material not found');
    }
    Object.assign(material, updateMaterialDto);
    return await this.materialRepository.save(material);
  }

  async remove(materialId: string) {
    const material = await this.findOne(materialId);
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.fileType === 'pdf') {
      await this.deleteFile(material.file);
    } else if (material.fileType === 'ppt') {
      if (material.driveFileId) {
        await this.googleSlidesService.delete(
          material.file,
          material.driveFileId,
        );
      }
    }

    return await this.materialRepository.remove(material);
  }
}
