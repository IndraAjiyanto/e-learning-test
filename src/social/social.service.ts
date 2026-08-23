import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Social } from 'src/entities/social.entity';
import { Repository } from 'typeorm';
import { FooterService } from 'src/footer/footer.service';

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
    const social = this.socialRepository.create(createSocialDto);
    await this.socialRepository.save(social);
    await this.clearFooterCache();
    return social;
  }

  async findAll() {
    return await this.socialRepository.find();
  }

  async findOne(id: number) {
    const social = await this.socialRepository.findOne({ where: { id } });
    if (!social) {
      throw new NotFoundException('Social not found');
    }
    return social;
  }

  async update(id: number, updateSocialDto: UpdateSocialDto) {
    const social = await this.findOne(id);
    if (!social) {
      throw new NotFoundException('Social not found');
    }
    Object.assign(social, updateSocialDto);
    await this.socialRepository.save(social);
    await this.clearFooterCache();
    return social;
  }

  async remove(id: number) {
    const social = await this.findOne(id);
    if (!social) {
      throw new NotFoundException('Social not found');
    }
    await this.socialRepository.remove(social);
    await this.clearFooterCache();
  }
}
