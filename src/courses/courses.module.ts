import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { Session} from 'src/entities/session.entity';
import { Attendance } from 'src/entities/attendance.entity';
import { Category } from 'src/entities/category.entity';
import { UserAnswersModule } from 'src/user_answers/user_answers.module';
import { UsersModule } from 'src/users/users.module';
import { Weeks } from 'src/entities/weeks.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { CourseType } from 'src/entities/course_type.entity';
import { Score } from 'src/entities/score.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { AnswerTask } from 'src/entities/answer_task.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { Payment } from 'src/entities/payment.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Mentors } from 'src/entities/mentor.entity';
import { CommonModule } from 'src/common/common.module';
import { QuizProgress } from 'src/entities/quiz_progress.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { Technology } from 'src/entities/technology.entity';
import { Mentorings } from 'src/entities/mentoring.entity';
import { Registration } from 'src/entities/registration.entity';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { Installment } from 'src/entities/installment.entity';
import { CourseQuestions } from 'src/entities/course_question.entity';
import { ProgramBenefits } from 'src/entities/course_benefit.entity';
import { CourseFlow } from 'src/entities/course_flow.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { QuestionsModule } from 'src/questions/questions.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([
      Technology,
      Logbook,
      UserCourse,
      Mentors,
      Course,
      User,
      Session,
      Attendance,
      Category,
      Weeks,
      WeekProgress,
      CourseType,
      Score,
      Quiz,
      Installment,
      AnswerTask,
      SessionProgress,
      Payment,
      QuizProgress,
      Mentorings,
      Registration,
      WeekProgress,
      MentorLogbook,
      CourseQuestions,
      ProgramBenefits,
      CourseFlow,
      Installment,
      Alumni,
      Portofolios,
    ]),
    QuestionsModule,
    UserAnswersModule,
    UsersModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
