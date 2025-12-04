import { Module } from '@nestjs/common';
import { OurExperienceService } from './our_experience.service';
import { OurExperienceController } from './our_experience.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OurExperience } from 'src/entities/our_experience.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OurExperience])],
  controllers: [OurExperienceController],
  providers: [OurExperienceService],
})
export class OurExperienceModule {}
