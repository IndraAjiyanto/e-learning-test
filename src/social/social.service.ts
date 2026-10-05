import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Social } from 'src/entities/social.entity';
import { Repository } from 'typeorm';
import { FooterService } from 'src/footer/footer.service';
import { validateSocial } from './social.rules';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Social)
    private readonly socialRepository: Repository<Social>,
    private readonly footerService: FooterService,
  ) {}

  private async clearFooterCache() {
    await this.footerService.invalidateFooterCache();
  }

  async create(createSocialDto: CreateSocialDto) {
    const social = this.socialRepository.create(
      validateSocial(createSocialDto),
    );
    await this.socialRepository.save(social);
    await this.clearFooterCache();
    return social;
  }

  async findAll() {
    // Urutan harus eksplisit: tanpa ini Postgres mengembalikan baris sesuai
    // urutan fisiknya, dan sebuah UPDATE memindahkan baris yang diedit ke
    // belakang — daftar teracak dan nomor barisnya ikut berubah (lihat TC-045).
    return await this.socialRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const social = await this.socialRepository.findOne({ where: { id } });
    if (!social) {
      throw new NotFoundException('Social not found');
    }
    return social;
  }

  async update(id: string, updateSocialDto: UpdateSocialDto) {
    const social = await this.findOne(id);
    if (!social) {
      throw new NotFoundException('Social not found');
    }
    Object.assign(social, validateSocial({ ...social, ...updateSocialDto }));
    await this.socialRepository.save(social);
    await this.clearFooterCache();
    return social;
  }

  async remove(id: string) {
    const social = await this.findOne(id);
    if (!social) {
      throw new NotFoundException('Social not found');
    }
    await this.socialRepository.remove(social);
    await this.clearFooterCache();
  }
}
