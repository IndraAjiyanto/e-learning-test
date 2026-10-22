import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { Material } from 'src/entities/materials.entity';
import { Session } from 'src/entities/session.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { GoogleSlidesService } from './google-slides.service';
import type { Request, Response } from 'express';

describe('MaterialController', () => {
  let controller: MaterialController;

  const materialRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data: Record<string, unknown>) => data),
    save: jest.fn((data: Record<string, unknown>) => Promise.resolve(data)),
    remove: jest.fn(),
  };

  const sessionRepository = { findOne: jest.fn() };
  const syllabusRepository = { findOne: jest.fn() };
  const googleSlidesService = { upload: jest.fn(), delete: jest.fn() };

  const makeReq = (body: Record<string, unknown> = {}) => {
    const flash = jest.fn();
    const req = {
      body,
      user: { id: 'admin-1' },
      flash,
    } as unknown as Request;
    return { req, flash };
  };

  const makeRes = () => {
    const res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };
    return res as unknown as Response & typeof res;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialController],
      providers: [
        MaterialService,
        { provide: getRepositoryToken(Material), useValue: materialRepository },
        { provide: getRepositoryToken(Session), useValue: sessionRepository },
        { provide: getRepositoryToken(Syllabus), useValue: syllabusRepository },
        { provide: GoogleSlidesService, useValue: googleSlidesService },
      ],
    }).compile();

    controller = module.get<MaterialController>(MaterialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('formCreateForSyllabus', () => {
    it('mengalihkan admin ke syllabus saat jenis materi sudah terisi', async () => {
      materialRepository.findOne.mockResolvedValue({
        id: 'mat-1',
        fileType: 'pdf',
      });
      const { req, flash } = makeReq();
      const res = makeRes();

      await controller.formCreateForSyllabus('syl-1', 'pdf', req, res);

      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/syllabus/syl-1');
      expect(flash).toHaveBeenCalledWith(
        'toastError',
        expect.stringContaining('Material Already Exists'),
      );
    });

    it('menampilkan form create saat slot jenis materi masih kosong', async () => {
      materialRepository.findOne.mockResolvedValue(null);
      const { req } = makeReq();
      const res = makeRes();

      await controller.formCreateForSyllabus('syl-1', 'ppt', req, res);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(
        'admin/materi/create',
        expect.objectContaining({ syllabusId: 'syl-1', syllabusMode: true }),
      );
    });

    it('mengabaikan jenis berkas yang tidak dikenal', async () => {
      const { req } = makeReq();
      const res = makeRes();

      await controller.formCreateForSyllabus('syl-1', 'zip', req, res);

      expect(materialRepository.findOne).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalled();
    });
  });

  describe('createPdfForSyllabus', () => {
    it('menolak PDF kedua pada syllabus yang sama', async () => {
      syllabusRepository.findOne.mockResolvedValue({ id: 'syl-1' });
      materialRepository.findOne.mockResolvedValue({
        id: 'mat-1',
        fileType: 'pdf',
      });
      const { req } = makeReq({
        uploadedFileUrls: ['/asset/material/pdf/baru.pdf'],
      });
      const res = makeRes();

      await controller.createPdfForSyllabus({} as never, res, 'syl-1', req, {
        originalname: 'baru.pdf',
        size: 1024,
      } as never);

      expect(materialRepository.save).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/syllabus/syl-1');
    });

    it('menyimpan nama & ukuran berkas asli agar terlihat student', async () => {
      syllabusRepository.findOne.mockResolvedValue({ id: 'syl-1' });
      materialRepository.findOne.mockResolvedValue(null);
      const { req } = makeReq({
        uploadedFileUrls: ['/asset/material/pdf/modul.pdf'],
      });
      const res = makeRes();

      await controller.createPdfForSyllabus({} as never, res, 'syl-1', req, {
        originalname: 'modul.pdf',
        size: 2048,
      } as never);

      expect(materialRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          originalFileName: 'modul.pdf',
          fileSizeBytes: 2048,
          fileType: 'pdf',
          file: '/asset/material/pdf/modul.pdf',
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith('/syllabus/syl-1');
    });
  });
});
