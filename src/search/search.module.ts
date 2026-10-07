import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Session } from 'src/entities/session.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { Payment } from 'src/entities/payment.entity';
import { Registration } from 'src/entities/registration.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Session,
      Syllabus,
      Payment,
      Registration,
      Portofolios,
      UserCourse,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
