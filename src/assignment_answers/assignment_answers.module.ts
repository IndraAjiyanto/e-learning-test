import { Module } from '@nestjs/common';
import { AnswerTasksService } from './assignment_answers.service';
import { AnswerTasksController } from './assignment_answers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Assignment } from 'src/entities/assignment.entity';
import { AnswerTask } from 'src/entities/answer_task.entity';
import { Comment } from 'src/entities/comment.entity';
@Module({
  imports: [TypeOrmModule.forFeature([AnswerTask, Assignment, User, Comment])],

  controllers: [AnswerTasksController],
  providers: [AnswerTasksService],
  exports: [AnswerTasksService],
})
export class AnswerTasksModule {}
