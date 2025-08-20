import { Module } from '@nestjs/common';
import { BiodatasService } from './biodatas.service';
import { BiodatasController } from './biodatas.controller';
import { Biodata } from 'src/entities/biodata.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Biodata])],
  controllers: [BiodatasController],
  providers: [BiodatasService],
})
export class BiodatasModule {}
