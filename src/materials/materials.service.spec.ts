import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MaterialService } from './material.service';
import { Material } from 'src/entities/materials.entity';
import { Session } from 'src/entities/session.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { GoogleSlidesService } from './google-slides.service';

describe('MaterialService', () => {
  let service: MaterialService;

  const materialRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data: Record<string, unknown>) => data),
    save: jest.fn((data: Record<string, unknown>) => Promise.resolve(data)),
  };

  const sessionRepository = {
    findOne: jest.fn(),
  };

  const syllabusRepository = {
    findOne: jest.fn(),
  };

  const googleSlidesService = {
    upload: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        { provide: getRepositoryToken(Material), useValue: materialRepository },
        { provide: getRepositoryToken(Session), useValue: sessionRepository },
        { provide: getRepositoryToken(Syllabus), useValue: syllabusRepository },
        { provide: GoogleSlidesService, useValue: googleSlidesService },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assertSyllabusSlotAvailable', () => {
    it('menolak upload kedua untuk jenis berkas yang sama', async () => {
      materialRepository.findOne.mockResolvedValue({
        id: 'mat-1',
        fileType: 'pdf',
      });

      await expect(
        service.assertSyllabusSlotAvailable('syl-1', 'pdf'),
      ).rejects.toThrow(BadRequestException);
    });

    it('meloloskan upload saat slot jenis berkas masih kosong', async () => {
      materialRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assertSyllabusSlotAvailable('syl-1', 'pdf'),
      ).resolves.toBeUndefined();
    });

    it('tidak membatasi jumlah materi milik session', async () => {
      materialRepository.findOne.mockResolvedValue({
        id: 'mat-1',
        fileType: 'pdf',
      });

      await expect(
        service.assertSyllabusSlotAvailable('syl-1', 'pdf'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('membuat materi syllabus saat slot jenis berkas kosong', async () => {
      syllabusRepository.findOne.mockResolvedValue({ id: 'syl-1' });
      materialRepository.findOne.mockResolvedValue(null);

      const result = await service.create({
        title: 'Modul PDF',
        file: '/asset/asset-silabus/modul.pdf',
        fileType: 'pdf',
        syllabusId: 'syl-1',
      } as never);

      expect(result).toMatchObject({
        title: 'Modul PDF',
        fileType: 'pdf',
        syllabus: { id: 'syl-1' },
      });
    });

    it('menolak materi syllabus kedua dengan jenis berkas yang sama', async () => {
      syllabusRepository.findOne.mockResolvedValue({ id: 'syl-1' });
      materialRepository.findOne.mockResolvedValue({
        id: 'mat-1',
        fileType: 'pdf',
      });

      await expect(
        service.create({
          title: 'Modul PDF 2',
          file: '/asset/asset-silabus/modul-2.pdf',
          fileType: 'pdf',
          syllabusId: 'syl-1',
        } as never),
      ).rejects.toThrow(BadRequestException);

      expect(materialRepository.save).not.toHaveBeenCalled();
    });

    it('membolehkan materi syllabus dengan jenis berkas berbeda', async () => {
      syllabusRepository.findOne.mockResolvedValue({ id: 'syl-1' });
      materialRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          title: 'Slide PPT',
          file: 'https://docs.google.com/presentation/d/abc/pub',
          fileType: 'ppt',
          syllabusId: 'syl-1',
        } as never),
      ).resolves.toBeDefined();
    });

    it('meloloskan materi session walau syllabus sudah punya PDF', async () => {
      sessionRepository.findOne.mockResolvedValue({ id: 'ses-1' });
      materialRepository.findOne.mockResolvedValue({
        id: 'mat-1',
        fileType: 'pdf',
      });

      await expect(
        service.create({
          title: 'PDF Pertemuan 1',
          file: '/asset/asset-materi-1.pdf',
          fileType: 'pdf',
          sessionId: 'ses-1',
        } as never),
      ).resolves.toBeDefined();

      expect(materialRepository.save).toHaveBeenCalled();
    });

    it('menolak syllabus yang tidak ditemukan', async () => {
      syllabusRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          title: 'Modul PDF',
          file: '/asset/asset-silabus/modul.pdf',
          fileType: 'pdf',
          syllabusId: 'syl-x',
        } as never),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
