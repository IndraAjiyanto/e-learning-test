import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Social } from 'src/entities/social.entity';
import { Category } from 'src/entities/category.entity';
import { FooterService } from './footer.service';
import { FooterMiddleware } from './footer.middleware';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Social, Category]),
  ],
  providers: [FooterService, FooterMiddleware],
  exports: [FooterService],
})
export class FooterModule {}
