import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/entities/session.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { User } from 'src/entities/user.entity';
import { Question } from 'src/entities/question.entity';
import { Weeks } from 'src/entities/weeks.entity';
import { Logbook } from 'src/entities/logbook.entity';
import { MentorLogbook } from 'src/entities/mentor_logbook.entity';
import { SessionProgress } from 'src/entities/session_progress.entity';
import { WeekProgress } from 'src/entities/week_progress.entity';
import { Assignment } from 'src/entities/assignment.entity';
import { AnswerTask } from 'src/entities/answer_task.entity';
import { Attendance } from 'src/entities/attendance.entity';
import { Score } from 'src/entities/score.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Weeks)
    private readonly weeksRepository: Repository<Weeks>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Logbook)
    private readonly logBookRepository: Repository<Logbook>,

    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    @InjectRepository(MentorLogbook)
    private readonly mentorLogbookRepository: Repository<MentorLogbook>,

    @InjectRepository(SessionProgress)
    private readonly sessionProgressRepository: Repository<SessionProgress>,

    @InjectRepository(WeekProgress)
    private readonly weekProgressRepository: Repository<WeekProgress>,

    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,

    @InjectRepository(AnswerTask)
    private readonly answerTaskRepository: Repository<AnswerTask>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
  ) {}

  async create(createSessionDto: CreateSessionDto) {
    if (createSessionDto.isFinalCheck === 'true') {
      createSessionDto.isFinal = true;
    } else {
      createSessionDto.isFinal = false;
    }
    const weeks = await this.weeksRepository.findOne({
      where: { id: createSessionDto.weeksId },
      relations: ['course'],
    });
    if (!weeks) {
      throw new NotFoundException('weeks ini tidak ada');
    }

    const session = this.sessionRepository.create({
      ...createSessionDto,
      weeks: weeks,
    });
    return await this.sessionRepository.save(session);
  }

  async findCourse(courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['weeks'],
    });

    return course;
  }

  async findAllCourses() {
    return await this.courseRepository.find();
  }

  async findWeekSessions(weeksId: string) {
    const weeks = await this.weeksRepository.findOne({
      where: { id: weeksId },
      relations: ['session'],
    });
    if (!weeks) {
      throw new NotFoundException('weeks ini tidak ada');
    }
    const lastSession =
      weeks.session.length > 0 ? weeks.session[weeks.session.length - 1] : null;

    return lastSession ? lastSession.sessionOrder : 0;
  }

  async findSessionByUser(sessionId: string, userId: string) {
    return await this.sessionRepository.findOne({
      where: {
        id: sessionId,
        logbooks: { user: { id: userId } },
        attendances: { user: { id: userId } },
        assignments: { taskAnswers: { user: { id: userId } } },
      },
      relations: [
        'weeks',
        'materials',
        'assignments',
        'assignments.taskAnswers',
        'assignments.taskAnswers.user',
        'logbooks',
        'logbooks.user',
        'attendances',
        'attendances.user',
      ],
    });
  }

  async findSession(weeksId: string) {
    const weeks = await this.weeksRepository.findOne({
      where: { id: weeksId },
      relations: ['session'],
    });
    if (!weeks) {
      throw new NotFoundException('weeks ini tidak ada');
    }
    return weeks.session;
  }

  async findFinalSessions(courseId: string) {
    const finalSessions = await this.sessionRepository
      .createQueryBuilder('session')
      .innerJoinAndSelect('session.weeks', 'weeks')
      .innerJoinAndSelect('weeks.course', 'course')
      .where('course.id = :courseId', { courseId })
      .andWhere('session.isFinal = :isFinal', { isFinal: true })
      .getMany();

    return finalSessions;
  }

  async findSyllabus(courseId: string) {
    const syllabus = await this.weeksRepository.find({
      where: { course: { id: courseId } },
      relations: ['session'],
    });

    return syllabus;
  }

  async findLastSession(weeksId: string) {
    const lastSession = await this.sessionRepository.findOne({
      where: {
        weeks: { id: weeksId },
        isFinal: true,
      },
    });

    return lastSession;
  }

  async findTotalSession(courseId: string) {
    const totalSession = await this.sessionRepository.count({
      where: {
        weeks: { course: { id: courseId } },
      },
    });

    return totalSession;
  }

  async getNextOrder(weeksId: string) {
    const lastSession = await this.findWeekSessions(weeksId);
    const newSession = lastSession + 1;
    return newSession;
  }

  async findStudentsInCourse(courseId: string, sessionId: string) {
    const users = await this.userRepository.find({
      where: {
        userCourses: { course: { id: courseId } },
        absent: { session: { id: sessionId } },
      },
      relations: ['absent', 'biodata'],
    });

    if (users.length === 0) {
      return [];
    }

    const approvedLogbooks = await this.logBookRepository.find({
      where: {
        session: { id: sessionId },
        process: 'approved',
      },
      relations: ['user'],
    });

    const approvedUserIds = new Set(
      approvedLogbooks.map((lb) => lb.user?.id).filter(Boolean),
    );

    return users.map((user) => {
      const hasApprovedLogbook = approvedUserIds.has(user.id);
      const canDelete = !hasApprovedLogbook;
      return {
        ...user,
        canDelete,
        absent: (user.absent || []).map((att) => ({
          ...att,
          canDelete,
        })),
        attendance: (user.absent || []).map((att) => ({
          ...att,
          canDelete,
        })),
      };
    });
  }

  async findQuestions(sessionId: string) {
    return await this.questionRepository.find({
      where: { quiz: { id: sessionId } },
      relations: ['answers'],
    });
  }

  async findLogBook(sessionId: string) {
    const currentSession = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['weeks', 'weeks.course'],
    });

    const logbooks = await this.logBookRepository.find({
      where: { session: { id: sessionId } },
      relations: [
        'user',
        'user.biodata',
        'session',
        'session.weeks',
        'session.weeks.course',
      ],
    });

    if (logbooks.length === 0) {
      return [];
    }

    if (!currentSession?.weeks?.course) {
      return logbooks.map((lb) => ({ ...lb, canDelete: true }));
    }

    const courseId = currentSession.weeks.course.id;
    const currentWeekNumber = currentSession.weeks.weekNumber;
    const currentOrder = currentSession.sessionOrder;

    const subsequentSessions = await this.sessionRepository
      .createQueryBuilder('s')
      .innerJoin('s.weeks', 'w')
      .innerJoin('w.course', 'c')
      .where('c.id = :courseId', { courseId })
      .andWhere(
        '((w.weekNumber = :currentWeekNumber AND s.sessionOrder > :currentOrder) OR (w.weekNumber > :currentWeekNumber))',
        { currentWeekNumber, currentOrder },
      )
      .select(['s.id', 'w.id', 'w.weekNumber'])
      .getMany();

    const userIds = Array.from(
      new Set(
        logbooks
          .map((lb) => lb.user?.id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (userIds.length === 0) {
      return logbooks.map((lb) => ({ ...lb, canDelete: true }));
    }

    const activeUserIds = new Set<string>();

    if (subsequentSessions.length > 0) {
      const subsequentSessionIds = subsequentSessions.map((s) => s.id);
      const [attendedRows, logbookRows, taskAnswerRows, subsequentWeekProgressRows] =
        await Promise.all([
          this.attendanceRepository
            .createQueryBuilder('a')
            .innerJoin('a.session', 's')
            .innerJoin('a.user', 'u')
            .where('s.id IN (:...subsequentSessionIds)', { subsequentSessionIds })
            .andWhere('u.id IN (:...userIds)', { userIds })
            .select('u.id', 'userId')
            .distinct(true)
            .getRawMany<{ userId: string }>(),

          this.logBookRepository
            .createQueryBuilder('lb')
            .innerJoin('lb.session', 's')
            .innerJoin('lb.user', 'u')
            .where('s.id IN (:...subsequentSessionIds)', { subsequentSessionIds })
            .andWhere('u.id IN (:...userIds)', { userIds })
            .select('u.id', 'userId')
            .distinct(true)
            .getRawMany<{ userId: string }>(),

          this.answerTaskRepository
            .createQueryBuilder('at')
            .innerJoin('at.task', 'asg')
            .innerJoin('asg.session', 's')
            .innerJoin('at.user', 'u')
            .where('s.id IN (:...subsequentSessionIds)', {
              subsequentSessionIds,
            })
            .andWhere('u.id IN (:...userIds)', { userIds })
            .select('u.id', 'userId')
            .distinct(true)
            .getRawMany<{ userId: string }>(),

          this.weekProgressRepository
            .createQueryBuilder('wp')
            .innerJoin('wp.week', 'w')
            .innerJoin('w.course', 'c')
            .innerJoin('wp.user', 'u')
            .where('c.id = :courseId', { courseId })
            .andWhere('w.weekNumber > :currentWeekNumber', { currentWeekNumber })
            .andWhere('u.id IN (:...userIds)', { userIds })
            .andWhere('wp.quiz = true')
            .select('u.id', 'userId')
            .distinct(true)
            .getRawMany<{ userId: string }>(),
        ]);

      attendedRows.forEach((r) => activeUserIds.add(r.userId));
      logbookRows.forEach((r) => activeUserIds.add(r.userId));
      taskAnswerRows.forEach((r) => activeUserIds.add(r.userId));
      subsequentWeekProgressRows.forEach((r) => activeUserIds.add(r.userId));
    }

    // If current session is final, also check if user has attempted/completed quiz in this week
    if (currentSession.isFinal && currentSession.weeks?.id) {
      const quizScores = await this.scoreRepository
        .createQueryBuilder('sc')
        .innerJoin('sc.quiz', 'q')
        .innerJoin('q.weeks', 'w')
        .innerJoin('sc.user', 'u')
        .where('w.id = :weekId', { weekId: currentSession.weeks.id })
        .andWhere('u.id IN (:...userIds)', { userIds })
        .select('u.id', 'userId')
        .distinct(true)
        .getRawMany<{ userId: string }>();

      quizScores.forEach((r) => activeUserIds.add(r.userId));
    }

    return logbooks.map((lb) => ({
      ...lb,
      canDelete: !activeUserIds.has(lb.user?.id),
    }));
  }

  async findLogBookMentor(sessionId: string) {
    return await this.mentorLogbookRepository.find({
      where: { session: { id: sessionId } },
      relations: [
        'user',
        'user.biodata',
        'session',
        'session.weeks',
        'session.weeks.course',
      ],
    });
  }

  async findTugas(sessionId: string) {
    const assignments = await this.assignmentRepository.find({
      where: { session: { id: sessionId } },
    });

    if (assignments.length === 0) {
      return [];
    }

    const assignmentIds = assignments.map((a) => a.id);
    const approvedAnswers = await this.answerTaskRepository
      .createQueryBuilder('at')
      .select('at.taskId', 'taskId')
      .where('at.taskId IN (:...assignmentIds)', { assignmentIds })
      .andWhere("at.process = 'approved'")
      .groupBy('at.taskId')
      .getRawMany<{ taskId: string }>();

    const approvedAssignmentIds = new Set(
      approvedAnswers.map((item) => item.taskId),
    );

    return assignments.map((a) => ({
      ...a,
      hasApprovedSubmission: approvedAssignmentIds.has(a.id),
    }));
  }

  async findOne(id: string) {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['weeks', 'weeks.course'],
    });
    if (!session) {
      throw new NotFoundException(`Pertemuan tidak ditemukan`);
    }

    if (!session.weeks) {
      throw new NotFoundException('course tidak ditemukan');
    }

    return session;
  }

  async hasCompletedUser(sessionId: string): Promise<boolean> {
    const count = await this.logBookRepository.count({
      where: {
        session: { id: sessionId },
        process: 'approved',
      },
    });
    return count > 0;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto) {
    const session = await this.findOne(id);
    if (!session) {
      throw new NotFoundException('session tidak ditemukan');
    }

    if (updateSessionDto.isFinalCheck === 'true') {
      updateSessionDto.isFinal = true;
      // Hanya satu session per week yang boleh final — lepas flag dari session
      // lain di week yang sama agar findLastSession tidak ambigu/salah baca.
      await this.sessionRepository
        .createQueryBuilder()
        .update()
        .set({ isFinal: false })
        .where('weeksId = :weeksId', { weeksId: session.weeks.id })
        .andWhere('id != :id', { id })
        .execute();
    } else {
      updateSessionDto.isFinal = false;
    }
    Object.assign(session, updateSessionDto);
    return await this.sessionRepository.save(session);
  }

  async remove(sessionId: string, weeksId: string) {
    const session = await this.findOne(sessionId);
    if (!session) {
      throw new NotFoundException('session tidak ditemukan');
    }

    const isCompleted = await this.hasCompletedUser(sessionId);
    if (isCompleted) {
      throw new BadRequestException(
        'Session cannot be deleted because it has already been completed by user',
      );
    }

    await this.sessionRepository.remove(session);
    const semuaPertemuan = await this.sessionRepository.find({
      where: { weeks: { id: weeksId } },
      order: { createdAt: 'ASC' },
    });

    for (let i = 0; i < semuaPertemuan.length; i++) {
      semuaPertemuan[i].sessionOrder = i + 1;
      await this.sessionRepository.save(semuaPertemuan[i]);
    }
  }
}
