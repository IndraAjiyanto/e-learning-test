import { Module, forwardRef } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import {
  GalleryController,
  PublicGalleryController,
} from './gallery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gallery } from '../entities/gallery.entity';
import { CommonModule } from 'src/common/common.module';
import { Category } from 'src/entities/category.entity';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([Gallery, Category]),
    CategoriesModule,
  ],
  controllers: [GalleryController, PublicGalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
