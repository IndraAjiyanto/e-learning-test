import { Module } from '@nestjs/common';
import { CategoryPartnerService } from './category_partner.service';
import { CategoryPartnerController } from './category_partner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryPartner } from 'src/entities/category_partner.entity';

@Module({
  imports : [TypeOrmModule.forFeature([CategoryPartner])],
  controllers: [CategoryPartnerController],
  providers: [CategoryPartnerService],
  exports: [CategoryPartnerService]
})
export class CategoryPartnerModule {}
