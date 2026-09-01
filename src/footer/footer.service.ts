import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Social } from 'src/entities/social.entity';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class FooterService {
  constructor(
    @InjectRepository(Social)
    private readonly socialRepository: Repository<Social>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getFooterData() {
    const cacheKey = 'footer_data';
    const cached = await this.cacheManager.get<Social>(cacheKey);
    if (cached) return cached;

    const data = await this.socialRepository.find({
      order: { id: 'ASC' },
      take: 1,
    });
    const social = data[0] || null;
    if (social) {
      await this.cacheManager.set(cacheKey, social, 60 * 60 * 1000);
    }
    return social;
  }

  async getCategories() {
    const cacheKey = 'footer_categories';
    const cached = await this.cacheManager.get<Category[]>(cacheKey);
    if (cached) return cached;

    const data = await this.categoryRepository.find({
      select: ['id', 'name'],
      order: { id: 'ASC' },
    });
    await this.cacheManager.set(cacheKey, data, 60 * 1000);
    return data;
  }

  async invalidateFooterCache() {
    await this.cacheManager.del('footer_data');
  }
}
