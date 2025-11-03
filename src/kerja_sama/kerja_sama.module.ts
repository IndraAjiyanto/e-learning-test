import { Module } from '@nestjs/common';
import { KerjaSamaService } from './kerja_sama.service';
import { KerjaSamaController } from './kerja_sama.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KerjaSama } from 'src/entities/kerja_sama.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
        imports: [TypeOrmModule.forFeature([KerjaSama]), CommonModule],
  controllers: [KerjaSamaController],
  providers: [KerjaSamaService],
})
export class KerjaSamaModule {}
