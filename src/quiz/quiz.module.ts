import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from 'src/entities/quiz.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Score } from 'src/entities/score.entity';
import { User } from 'src/entities/user.entity';
import { Question } from 'src/entities/question.entity';
import { QuizProgress } from 'src/entities/quiz_progress.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { UserAnswer } from 'src/entities/user_answer.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Course } from 'src/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      Weeks,
      Score,
      User,
      Question,
      QuizProgress,
      SessionProgress,
      UserAnswer,
      UserCourse,
      Course,
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
