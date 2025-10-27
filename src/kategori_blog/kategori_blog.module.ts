import { Module } from '@nestjs/common';
import { KategoriBlogService } from './kategori_blog.service';
import { KategoriBlogController } from './kategori_blog.controller';

@Module({
  controllers: [KategoriBlogController],
  providers: [KategoriBlogService],
})
export class KategoriBlogModule {}
