import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinalAssignment } from 'src/entities/final_assignment.entity';
import { UserAssignment } from 'src/entities/user_assignment.entity';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { UserCourse } from 'src/entities/user_course.entity';
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
    @InjectRepository(UserCourse)
    private readonly userCourseRepo: Repository<UserCourse>,
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

  /**
   * Kiriman milik SATU peserta pada satu final assignment.
   *
   * Sisi student tidak boleh memakai `getSubmissions` di atas: fungsi itu
   * mengembalikan kiriman semua orang, jadi halaman student akan ikut
   * memegang nama peserta lain. Tab tugas student cukup tahu "kiriman saya
   * ada atau belum".
   */
  async findSubmissionByUser(
    finalAssignmentId: string,
    userId: string,
  ): Promise<UserAssignment | null> {
    return this.userAssignmentRepo.findOne({
      where: { finalAssignmentId, userId },
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Final assignment yang boleh dikirimi oleh peserta tertentu.
   *
   * `@Roles('user')` menahan orang yang bukan peserta, tapi tidak menahan
   * peserta program LAIN: tanpa pemeriksaan ini, siapa pun yang tahu UUID
   * sebuah final assignment bisa menimpa kiriman peserta program itu -
   * cukup dengan mengarang satu ID. Karena itu keberadaan peserta di
   * `user_courses` ikut diperiksa, dan jawabannya 403, bukan 404: programnya
   * memang ada, peserta memang tidak berhak mengrimnya.
   */
  async findOneForSubmission(
    id: string,
    userId: string,
  ): Promise<FinalAssignment> {
    const finalAssignment = await this.findOne(id);

    const enrollment = await this.userCourseRepo.findOne({
      where: {
        course: { id: finalAssignment.courseId },
        user: { id: userId },
      },
    });
    if (!enrollment) {
      throw new ForbiddenException(
        'You are not enrolled in the program that owns this final assignment',
      );
    }

    return finalAssignment;
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

