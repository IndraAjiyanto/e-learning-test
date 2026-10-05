import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from 'src/entities/partner.entity';
import { CommonModule } from 'src/common/common.module';
import { CategoryPartnerModule } from 'src/category_partner/category_partner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner]),
    CommonModule,
    CategoryPartnerModule,
  ],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService],
})
export class PartnerModule {}
