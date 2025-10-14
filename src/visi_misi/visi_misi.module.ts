import { Module } from '@nestjs/common';
import { VisiMisiService } from './visi_misi.service';
import { VisiMisiController } from './visi_misi.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisiMisi } from 'src/entities/visi_misi.entity';

@Module({
    imports: [TypeOrmModule.forFeature([VisiMisi])],
  controllers: [VisiMisiController],
  providers: [VisiMisiService],
  exports: [VisiMisiService],
})
export class VisiMisiModule {}
