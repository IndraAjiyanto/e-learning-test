import { Test, TestingModule } from '@nestjs/testing';
import { TechnologiesController } from './technologies.controller';
import { TechnologiesService } from './technologies.service';

import { UploadService } from 'src/common/upload/upload.service';
import { Reflector } from '@nestjs/core';

describe('TechnologiesController', () => {
  let controller: TechnologiesController;

  let service: TechnologiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnologiesController],
      providers: [
        {
          provide: TechnologiesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllPaginated: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UploadService,
          useValue: { upload: jest.fn() },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<TechnologiesController>(TechnologiesController);
    service = module.get<TechnologiesService>(TechnologiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should successfully create technology with valid SVG', async () => {
    const res: any = { redirect: jest.fn() };
    const req: any = { body: {}, flash: jest.fn() };
    const dto = { name: 'Figma', svg: '<svg viewBox="0 0 10 10"><circle r="5"/></svg>' };

    await controller.create(dto as any, res, req);
    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Figma', svg: dto.svg }),
    );
    expect(res.redirect).toHaveBeenCalledWith('/technology');
  });

  it('should reject invalid SVG format on create', async () => {
    const res: any = { redirect: jest.fn() };
    const req: any = { body: {}, flash: jest.fn() };
    const dto = { name: 'Broken', svg: 'invalid svg without tags' };

    await controller.create(dto as any, res, req);
    expect(service.create).not.toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith('error', 'Format kode SVG tidak valid.');
    expect(res.redirect).toHaveBeenCalledWith('/technology');
  });
});
