import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendances.controller';
import { AttendanceService } from './attendances.service';

describe('AttendancesController', () => {
  let controller: AttendanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [AttendanceService],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
