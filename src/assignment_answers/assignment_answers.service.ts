import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignmentAnswersDto } from './dto/create-assignment_answers.dto';
import { UpdateAssignmentAnswersDto } from './dto/update-assignment_answers.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerTask } from 'src/entities/answer_task.entity';
import { Not, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Assignment } from 'src/entities/assignment.entity';
import { Comment } from 'src/entities/comment.entity';

@Injectable()
export class AnswerTasksService {
  @InjectRepository(AnswerTask)
  private readonly jawabanTugasRepository: Repository<AnswerTask>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Assignment)
  private readonly tugasRepository: Repository<Assignment>;
  @InjectRepository(Comment)
  private readonly komentarRepository: Repository<Comment>;

  async create(createJawabanTugassDto: CreateAssignmentAnswersDto) {
    const user = await this.userRepository.findOne({
      where: { id: createJawabanTugassDto.userId },
    });
    const assignments = await this.tugasRepository.findOne({
      where: { id: createJawabanTugassDto.taskId },
    });
    if (!user) {
      throw new NotFoundException('user Not found');
    }
    if (!assignments) {
      throw new NotFoundException('assignments Not found');
    }
    const taskAnswers = await this.jawabanTugasRepository.create({
      file: createJawabanTugassDto.file,
      process: createJawabanTugassDto.process,
      user: user,
      task: assignments,
    });
    return await this.jawabanTugasRepository.save(taskAnswers);
  }

  async createKomentar(komentarText: string, assignment_answerId: number) {
    const answersTask = await this.jawabanTugasRepository.findOne({
      where: { id: assignment_answerId },
    });
    if (!answersTask) {
      throw new NotFoundException('answer not found');
    }
    const komentar = await this.komentarRepository.create({
      komentar: komentarText,
      answer_task: answersTask,
    });
    return await this.komentarRepository.save(komentar);
  }

  async findTugas(assignmentId: number) {
    const assignments = await this.tugasRepository.findOne({
      where: { id: assignmentId },
      relations: ['session', 'session.weeks', 'session.weeks.course'],
    });
    if (!assignments) {
      throw new NotFoundException('Tugas Not Found');
    }
    return assignments;
  }

  async findJawabanTugas(userId: number, assignmentId: number) {
    return await this.jawabanTugasRepository.find({
      where: { user: { id: userId }, task: { id: assignmentId } },
      relations: ['komentar'],
    });
  }

  async findJawabanExists(userId: number, assignmentId: number) {
    return await this.jawabanTugasRepository.find({
      where: {
        user: { id: userId },
        task: { id: assignmentId },
        process: Not('rejected'),
      },
    });
  }

  async findAllJawabanTugas(assignmentId: number) {
    return await this.jawabanTugasRepository.find({
      where: { task: { id: assignmentId } },
      relations: ['user', 'komentar', 'assignments'],
    });
  }

  async findOne(id: number) {
    const taskAnswers = await this.jawabanTugasRepository.findOne({
      where: { id: id },
    });
    if (!taskAnswers) {
      throw new NotFoundException('Jawaban Tugas Not Found');
    }
    return taskAnswers;
  }

  async update(id: number, updateJawabanTugassDto: UpdateAssignmentAnswersDto) {
    const taskAnswers = await this.findOne(id);
    if (!taskAnswers) {
      throw new NotFoundException('answer not found');
    }
    if (updateJawabanTugassDto.process) {
      taskAnswers.process = updateJawabanTugassDto.process;
    }
    if (updateJawabanTugassDto.file) {
      taskAnswers.file = updateJawabanTugassDto.file;
    }
    return await this.jawabanTugasRepository.save(taskAnswers);
  }
}
