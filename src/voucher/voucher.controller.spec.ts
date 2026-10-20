import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { Request, Response } from 'express';
import * as toastUtil from 'src/common/utils/toast.util';

describe('VoucherController', () => {
  let controller: VoucherController;
  let service: {
    findAll: jest.Mock;
    findAllUsers: jest.Mock;
    findAllCourses: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    isCodeAvailable: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findAllUsers: jest.fn(),
      findAllCourses: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      isCodeAvailable: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoucherController],
      providers: [
        {
          provide: VoucherService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<VoucherController>(VoucherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkCode', () => {
    it('returns available: true when code is not taken', async () => {
      service.isCodeAvailable.mockResolvedValue(true);
      const res = {
        json: jest.fn(),
      } as unknown as Response;

      await controller.checkCode('PROMO123', '', res);

      expect(service.isCodeAvailable).toHaveBeenCalledWith('PROMO123', undefined);
      expect(res.json).toHaveBeenCalledWith({ available: true });
    });

    it('returns available: false when code is duplicate', async () => {
      service.isCodeAvailable.mockResolvedValue(false);
      const res = {
        json: jest.fn(),
      } as unknown as Response;

      await controller.checkCode('DUPLICATE', '', res);

      expect(service.isCodeAvailable).toHaveBeenCalledWith('DUPLICATE', undefined);
      expect(res.json).toHaveBeenCalledWith({ available: false });
    });
  });

  describe('create', () => {
    let req: Partial<Request>;
    let res: { redirect: jest.Mock };

    beforeEach(() => {
      req = {
        flash: jest.fn(),
      };
      res = {
        redirect: jest.fn(),
      };
    });

    it('redirects to /voucher on success', async () => {
      service.create.mockResolvedValue({ id: 'v1' });
      const spyFlash = jest.spyOn(toastUtil, 'flashToast').mockImplementation();

      await controller.create(
        { code_voucher: 'NEWCODE', type: 'free' },
        res as unknown as Response,
        req as unknown as Request,
      );

      expect(service.create).toHaveBeenCalled();
      expect(spyFlash).toHaveBeenCalledWith(
        req,
        'Voucher Created',
        'The voucher has been issued successfully.',
      );
      expect(res.redirect).toHaveBeenCalledWith('/voucher');
    });

    it('shows toast error and redirects to /voucher/formCreate when code is duplicate', async () => {
      service.create.mockRejectedValue(new ConflictException('Voucher code is already in use.'));
      const spyError = jest.spyOn(toastUtil, 'flashToastError').mockImplementation();

      await controller.create(
        { code_voucher: 'DUPLICATE', type: 'free' },
        res as unknown as Response,
        req as unknown as Request,
      );

      expect(spyError).toHaveBeenCalledWith(
        req,
        'Voucher Code Already In Use',
        'That code is already taken by another voucher. Please use a different code.',
      );
      expect(res.redirect).toHaveBeenCalledWith('/voucher/formCreate');
    });
  });

  describe('update', () => {
    let req: Partial<Request>;
    let res: { redirect: jest.Mock };

    beforeEach(() => {
      req = {
        flash: jest.fn(),
      };
      res = {
        redirect: jest.fn(),
      };
    });

    it('shows toast error and redirects to edit form when code is duplicate', async () => {
      service.update.mockRejectedValue(new ConflictException('Voucher code is already in use.'));
      const spyError = jest.spyOn(toastUtil, 'flashToastError').mockImplementation();

      await controller.update(
        'v1',
        { code_voucher: 'DUPLICATE' },
        res as unknown as Response,
        req as unknown as Request,
      );

      expect(spyError).toHaveBeenCalledWith(
        req,
        'Voucher Code Already In Use',
        'That code is already taken by another voucher. Please use a different code.',
      );
      expect(res.redirect).toHaveBeenCalledWith('/voucher/formEdit/v1');
    });
  });
});
