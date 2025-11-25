import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { JenisKelas } from 'src/entities/jenis_kelas.entity';
import { Kategori } from 'src/entities/kategori.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { PertanyaanUmum } from 'src/entities/pertanyaan_umum.entity';
import { BenefitCategory } from 'src/entities/benefit_category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kelas,
      JenisKelas,
      Kategori,
      Alumni,
      PertanyaanUmum,
      BenefitCategory,
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
