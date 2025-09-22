import { Module } from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { AlumniController } from './alumni.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alumni } from 'src/entities/alumni.entity';
import { Kelas } from 'src/entities/kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alumni, Kelas])],
  controllers: [AlumniController],
  providers: [AlumniService],
  exports: [AlumniService]
})
export class AlumniModule {}
