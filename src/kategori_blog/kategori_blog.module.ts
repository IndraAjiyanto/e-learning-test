import { Module } from '@nestjs/common';
import { KategoriBlogService } from './kategori_blog.service';
import { KategoriBlogController } from './kategori_blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KategoriBlog } from 'src/entities/kategori_blog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KategoriBlog])],
  controllers: [KategoriBlogController],
  providers: [KategoriBlogService],
  exports: [KategoriBlogService],
})
export class KategoriBlogModule {}
