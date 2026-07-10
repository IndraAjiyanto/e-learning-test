import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController, PublicGalleryController } from './gallery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gallery } from '../entities/gallery.entity';
import { CommonModule } from 'src/common/common.module';
import { Kategori } from 'src/entities/kategori.entity';
import { KategorisModule } from 'src/kategoris/kategoris.module';
@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Gallery, Kategori]),KategorisModule],
  controllers: [GalleryController, PublicGalleryController],
  providers: [GalleryService],
  exports: [GalleryService]
})
export class GalleryModule {}
