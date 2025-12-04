import { Module } from '@nestjs/common';
import { OurExperienceService } from './our_experience.service';
import { OurExperienceController } from './our_experience.controller';

@Module({
  controllers: [OurExperienceController],
  providers: [OurExperienceService],
})
export class OurExperienceModule {}
