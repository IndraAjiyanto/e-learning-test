import { Module } from '@nestjs/common';
import { CollaborationsService } from './collaborations.service';
import { PartnerController } from './collaborations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { Collaboration } from 'src/entities/collaboration.entity';
import { PartnerModule } from 'src/partner/partner.module';
import { CategoryPartnerModule } from 'src/category_partner/category_partner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collaboration]),
    CommonModule,
    PartnerModule,
    CategoryPartnerModule,
  ],
  controllers: [PartnerController],
  providers: [CollaborationsService],
})
export class CollaborationsModule {}
