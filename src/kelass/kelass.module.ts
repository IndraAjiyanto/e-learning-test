import { Module } from '@nestjs/common';
import { KelassService } from './kelass.service';
import { KelassController } from './kelass.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';
import { User } from 'src/entities/user.entity';
import { Pertemuan } from 'src/entities/pertemuan.entity';
import { Absen } from 'src/entities/absen.entity';
import { Kategori } from 'src/entities/kategori.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kelas, User, Pertemuan, Absen, Kategori])],
  controllers: [KelassController],
  providers: [KelassService],
  exports: [KelassService],
})
export class KelassModule {}
