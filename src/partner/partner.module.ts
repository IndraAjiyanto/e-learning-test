import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner} from 'src/entities/partner.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Partner]), CommonModule],
  controllers: [PartnerController],
  providers: [PartnerService],
})
export class PartnerModule {}
