import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinalAssignment } from 'src/entities/final_assignment.entity';
import { UserAssignment } from 'src/entities/user_assignment.entity';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { CreateFinalAssignmentDto } from './dto/create-final-assignment.dto';
import { ProcessStatus } from 'src/entities/types/process-status';
import { randomUUID } from 'crypto';

@Injectable()
export class FinalAssignmentService {
  constructor(
    @InjectRepository(FinalAssignment)
    private readonly finalAssignmentRepo: Repository<FinalAssignment>,
    @InjectRepository(UserAssignment)
    private readonly userAssignmentRepo: Repository<UserAssignment>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByCourse(
    courseId: string,
    includeSubmissions = false,
  ): Promise<FinalAssignment | null> {
    const relations = includeSubmissions
      ? [
          'userAssignments',
          'userAssignments.user',
          'userAssignments.user.biodata',
        ]
      : [];

    return this.finalAssignmentRepo.findOne({
      where: { courseId },
      relations,
    });
  }

  async findOne(id: string): Promise<FinalAssignment> {
    const fa = await this.finalAssignmentRepo.findOne({
      where: { id },
      relations: ['userAssignments', 'userAssignments.user', 'course'],
    });
    if (!fa) {
      throw new NotFoundException('Final assignment not found');
    }
    return fa;
  }

  async createOrUpdate(
    courseId: string,
    dto: CreateFinalAssignmentDto,
  ): Promise<FinalAssignment> {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    let parsedContent: any = undefined;
    if (typeof dto.content === 'string') {
      try {
        parsedContent = JSON.parse(dto.content);
      } catch (err) {
        parsedContent = undefined;
      }
    } else if (dto.content) {
      parsedContent = dto.content;
    }

    let fa = await this.finalAssignmentRepo.findOne({ where: { courseId } });
    if (fa) {
      fa.title = dto.title;
      fa.description = dto.description;
      if (parsedContent !== undefined) {
        fa.content = parsedContent;
      }
      return this.finalAssignmentRepo.save(fa);
    }

    fa = this.finalAssignmentRepo.create({
      courseId,
      title: dto.title,
      description: dto.description,
      content: parsedContent,
    });
    return this.finalAssignmentRepo.save(fa);
  }

  async remove(idOrCourseId: string): Promise<boolean> {
    const fa = await this.finalAssignmentRepo.findOne({
      where: [{ id: idOrCourseId }, { courseId: idOrCourseId }],
    });
    if (!fa) {
      return false;
    }
    await this.finalAssignmentRepo.remove(fa);
    return true;
  }

  async getSubmissions(
    finalAssignmentId: string,
    status?: ProcessStatus,
  ): Promise<UserAssignment[]> {
    const where: any = { finalAssignmentId };
    if (status) {
      where.status = status;
    }
    return this.userAssignmentRepo.find({
      where,
      relations: ['user', 'user.biodata'],
      order: { createdAt: 'DESC' },
    });
  }

  async reviewSubmission(
    submissionId: string,
    status: ProcessStatus,
    commentText?: string,
    reviewer?: any,
  ): Promise<UserAssignment> {
    const submission = await this.userAssignmentRepo.findOne({
      where: { id: submissionId },
      relations: ['user', 'user.biodata'],
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    submission.status = status;

    if (commentText && commentText.trim()) {
      const trimmedComment = commentText.trim();
      submission.comment = trimmedComment;

      if (!Array.isArray(submission.commentHistory)) {
        submission.commentHistory = [];
      }

      submission.commentHistory.unshift({
        id: randomUUID(),
        comment: trimmedComment,
        status,
        reviewerId: reviewer?.id,
        reviewerName: reviewer?.username || 'Mentor',
        createdAt: new Date().toISOString(),
      });
    }

    return this.userAssignmentRepo.save(submission);
  }

  async submitAssignment(
    finalAssignmentId: string,
    userId: string,
    filePath: string,
  ): Promise<UserAssignment> {
    let submission = await this.userAssignmentRepo.findOne({
      where: { finalAssignmentId, userId },
    });

    if (submission) {
      submission.filePath = filePath;
      submission.status = 'process';
      return this.userAssignmentRepo.save(submission);
    }

    submission = this.userAssignmentRepo.create({
      finalAssignmentId,
      userId,
      filePath,
      status: 'process',
      commentHistory: [],
    });
    return this.userAssignmentRepo.save(submission);
  }
}

