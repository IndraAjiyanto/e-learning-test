import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { ImageBenefit } from 'src/entities/image_benefit.entity';
import { Category } from 'src/entities/category.entity';
import { CourseType } from 'src/entities/course_type.entity';
import { Partner } from 'src/entities/partner.entity';
import { CategoryPartner } from 'src/entities/category_partner.entity';
import { Benefit } from 'src/entities/benefit.entity';
import { Team } from 'src/entities/team.entity';
import { Social } from 'src/entities/social.entity';
import { About } from 'src/entities/about.entity';
import { Value } from 'src/entities/value.entity';
import { Vision } from 'src/entities/visions.entity';
import { TeamLead } from 'src/entities/team_lead.entity';
import { Commitment } from 'src/entities/commitment.entity';
import { Mission } from 'src/entities/mission.entity';
import { Experience } from 'src/entities/experience.entity';
import { Award } from 'src/entities/award.entity';
import { Background } from 'src/entities/background.entity';
import { Faq } from 'src/entities/faq.entity';
import { TranslationModule } from 'src/translation/translation.module';
import { OurExperience } from 'src/entities/our_experience.entity';
import { Paragraph } from 'src/entities/paragraph.entity';
import { GalleryModule } from 'src/gallery/gallery.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Commitment,
      TeamLead,
      Vision,
      Value,
      About,
      Team,
      Benefit,
      Course,
      Social,
      Faq,
      Alumni,
      Portofolios,
      ImageBenefit,
      Category,
      CourseType,
      Partner,
      Mission,
      Experience,
      Award,
      Background,
      Paragraph,
      Faq,
      OurExperience,
      CategoryPartner,
    ]),
    TranslationModule, // Import TranslationModule
    GalleryModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
