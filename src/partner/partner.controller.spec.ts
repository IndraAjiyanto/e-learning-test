import { Test, TestingModule } from '@nestjs/testing';
import { PartnerController } from './partner.controller';
import { PartnerService } from './partner.service';
import { UploadService } from 'src/common/upload/upload.service';
import { CategoryPartnerService } from 'src/category_partner/category_partner.service';
import { Response, Request } from 'express';

describe('PartnerController', () => {
  let controller: PartnerController;
  let partnerService: Partial<Record<keyof PartnerService, jest.Mock>>;

  beforeEach(async () => {
    partnerService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerController],
      providers: [
        {
          provide: PartnerService,
          useValue: partnerService,
        },
        {
          provide: UploadService,
          useValue: {},
        },
        {
          provide: CategoryPartnerService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PartnerController>(PartnerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPartnersApi', () => {
    it('should return partners as json on success', async () => {
      const mockPartners = [{ id: '1', name: 'Partner 1' }];
      partnerService.findAll!.mockResolvedValue(mockPartners);

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await controller.getPartnersApi(mockRes);

      expect(partnerService.findAll).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockPartners);
    });

    it('should return status 500 and error json when findAll fails', async () => {
      partnerService.findAll!.mockRejectedValue(new Error('Database failure'));

      const mockJson = jest.fn();
      const mockRes = {
        status: jest.fn().mockReturnValue({ json: mockJson }),
        json: mockJson,
      } as unknown as Response;

      await controller.getPartnersApi(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Database failure',
      });
    });
  });

  describe('findAll', () => {
    it('should render super_admin/partner/index with user', () => {
      const mockReq = {
        user: { id: 'u1', username: 'admin' },
      } as unknown as Request;
      const mockRes = {
        render: jest.fn(),
      } as unknown as Response;

      controller.findAll(mockRes, mockReq);

      expect(mockRes.render).toHaveBeenCalledWith('super_admin/partner/index', {
        user: mockReq.user,
      });
    });
  });
});

