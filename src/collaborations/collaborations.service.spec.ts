import { Test, TestingModule } from '@nestjs/testing';
<<<<<<<< HEAD:src/collaborations/collaborations.service.spec.ts
import { CollaborationsService } from './collaborations.service';

describe('KerjaSamaService', () => {
  let service: CollaborationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaborationsService],
    }).compile();

    service = module.get<CollaborationsService>(CollaborationsService);
========
import { PartnerService } from './partner.service';

describe('PartnerService', () => {
  let service: PartnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartnerService],
    }).compile();

    service = module.get<PartnerService>(PartnerService);
>>>>>>>> b7ff9871c1cfe29152a1fc01b684a8f7c247c1c9:src/partner/partner.service.spec.ts
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
