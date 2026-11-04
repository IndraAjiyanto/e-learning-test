import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityTarget, In, ObjectLiteral } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Entities
import { About } from '../entities/about.entity';
import { Alumni } from '../entities/alumni.entity';
import { Award } from '../entities/award.entity';
import { Background } from '../entities/background.entity';
import { Benefit } from '../entities/benefit.entity';
import { BenefitCategory } from '../entities/benefit_category.entity';
import { Category } from '../entities/category.entity';
import { CategoryPartner } from '../entities/category_partner.entity';
import { Commitment } from '../entities/commitment.entity';
import { Course } from '../entities/course.entity';
import { ProgramBenefits } from '../entities/course_benefit.entity';
import { CourseFlow } from '../entities/course_flow.entity';
import { CourseQuestions } from '../entities/course_question.entity';
import { CourseType } from '../entities/course_type.entity';
import { Experience } from '../entities/experience.entity';
import { Faq } from '../entities/faq.entity';
import { CategoryFaq } from '../entities/faqs.entity';
import { Gallery } from '../entities/gallery.entity';
import { Installment } from '../entities/installment.entity';
import { Mentors } from '../entities/mentor.entity';
import { Participants } from '../entities/participants.entity';
import { Portofolios } from '../entities/portofolios.entity';
import { Syllabus } from '../entities/syllabus.entity';
import { UserCourse } from '../entities/user_course.entity';
import { Weeks } from '../entities/weeks.entity';
import { Mission } from '../entities/mission.entity';
import { Paragraph } from '../entities/paragraph.entity';
import { Partner } from '../entities/partner.entity';
import { Social } from '../entities/social.entity';
import { Team } from '../entities/team.entity';
import { TeamLead } from '../entities/team_lead.entity';
import { Technology } from '../entities/technology.entity';
import { User } from '../entities/user.entity';
import { Value } from '../entities/value.entity';
import { Vision } from '../entities/visions.entity';
import { Voucher } from '../entities/voucher.entity';
import { Session } from '../entities/session.entity';
import { Question } from '../entities/question.entity';
import { Answer } from '../entities/answer.entity';
import { Material } from '../entities/materials.entity';
import { Assignment } from '../entities/assignment.entity';
import { Attendance } from '../entities/attendance.entity';
import { Logbook } from '../entities/logbook.entity';
import { Score } from '../entities/score.entity';
import { AnswerTask } from '../entities/answer_task.entity';
import { SessionProgress } from '../entities/session_progress.entity';

@Injectable()
export class BulkDeleteService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private readonly entityMap: Record<string, EntityTarget<ObjectLiteral>> = {
    category: Category,
    categories: Category,
    alumni: Alumni,
    gallery: Gallery,
    galleries: Gallery,
    voucher: Voucher,
    vouchers: Voucher,
    partner: Partner,
    partners: Partner,
    partnership: Partner,
    category_partner: CategoryPartner,
    categorypartner: CategoryPartner,
    faq: Faq,
    faqs: CategoryFaq,
    category_faq: CategoryFaq,
    categoryfaq: CategoryFaq,
    category_faqs: CategoryFaq,
    categoryfaqs: CategoryFaq,
    course_question: CourseQuestions,
    coursequestion: CourseQuestions,
    benefit: Benefit,
    benefits: Benefit,
    benefit_category: BenefitCategory,
    benefitcategory: BenefitCategory,
    course_benefit: ProgramBenefits,
    coursebenefit: ProgramBenefits,
    course_type: CourseType,
    coursetype: CourseType,
    type_program: CourseType,
    'type-program': CourseType,
    technology: Technology,
    technologies: Technology,
    paragraph: Paragraph,
    paragraphs: Paragraph,
    story: Paragraph,
    team: Team,
    team_lead: TeamLead,
    teamlead: TeamLead,
    'team-lead': TeamLead,
    social: Social,
    value: Value,
    values: Value,
    commitment: Commitment,
    vision: Vision,
    visions: Vision,
    mission: Mission,
    missions: Mission,
    experience: Experience,
    background: Background,
    about: About,
    header: About,
    award: Award,
    awards: Award,
    installment: Installment,
    installments: Installment,
    course_flow: CourseFlow,
    courseflow: CourseFlow,
    flow_program: CourseFlow,
    flowprogram: CourseFlow,
    'flow-program': CourseFlow,
    user: User,
    users: User,
    course: Course,
    courses: Course,
    program: Course,
    programs: Course,
    mentor: Mentors,
    mentors: Mentors,
    portfolio: Portofolios,
    portfolios: Portofolios,
    portofolio: Portofolios,
    portofolios: Portofolios,
    participant: Participants,
    participants: Participants,
    week: Weeks,
    weeks: Weeks,
    syllabus: Syllabus,
    syllabi: Syllabus,
    user_course: UserCourse,
    usercourse: UserCourse,
    course_user: UserCourse,
    courseuser: UserCourse,
    session: Session,
    sessions: Session,
    question: Question,
    questions: Question,
    material: Material,
    materials: Material,
    learning_material: Material,
    learningmaterial: Material,
    'learning-material': Material,
    assignment: Assignment,
    assignments: Assignment,
    task: Assignment,
    tasks: Assignment,
    attendance: Attendance,
    attendances: Attendance,
  };

  private normalizeKey(key: string): string {
    if (!key) return '';
    return key
      .toLowerCase()
      .trim()
      .replace(/^\/|\/$/g, '')
      .split('/')[0]
      .replace(/-/g, '_');
  }

  async deletePhysicalFiles(fileUrls: (string | null | undefined)[]) {
    for (const url of fileUrls) {
      if (!url || typeof url !== 'string') continue;
      // Skip external links (Cloudinary, http, https)
      if (url.startsWith('http://') || url.startsWith('https://')) continue;

      try {
        const cleanPath = url.replace(/^\/?public\//, '').replace(/^\//, '');
        const fullPath = path.join(process.cwd(), 'public', cleanPath);
        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath).catch(() => undefined);
        }
      } catch {
        // ignore error
      }
    }
  }

  async deleteSelected(
    entityKey: string,
    ids: string[],
    currentUser?: { id?: string; role?: string },
  ) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No items selected for deletion.');
    }

    const key = this.normalizeKey(entityKey);
    const entityTarget = this.entityMap[key];
    if (!entityTarget) {
      throw new BadRequestException(`Entity '${entityKey}' is not recognized.`);
    }

    const repo = this.dataSource.getRepository(entityTarget);

    // 1. Safety check khusus User
    if (key === 'user' || key === 'users') {
      const users = (await repo.findBy({ id: In(ids) })) as User[];
      const safeUsers = users.filter(
        (u) => u.role !== 'super_admin' && u.id !== currentUser?.id,
      );
      if (safeUsers.length === 0) {
        throw new BadRequestException(
          'Cannot delete the selected user(s). Super Admin accounts and your own account are protected.',
        );
      }
      await this.deletePhysicalFiles(safeUsers.map((u) => u.profile));
      await repo.remove(safeUsers);
      return {
        success: true,
        count: safeUsers.length,
        message: `Successfully deleted ${safeUsers.length} selected user(s).`,
      };
    }

    // 2. Safety check khusus Category
    if (key === 'category' || key === 'categories') {
      const categories = (await repo.find({
        where: { id: In(ids) },
        relations: ['courses'],
      })) as Category[];
      const withCourses = categories.filter(
        (c) => (c.courses || []).length > 0,
      );
      if (withCourses.length > 0) {
        if (withCourses.length === 1) {
          throw new BadRequestException(
            `Category "${withCourses[0].name}" cannot be deleted because it still contains ${withCourses[0].courses.length} program(s). Please delete or reassign the programs first.`,
          );
        } else {
          const names = withCourses.map((c) => `"${c.name}"`).join(', ');
          throw new BadRequestException(
            `Categories ${names} cannot be deleted because they still contain related programs. Please delete or reassign the programs first.`,
          );
        }
      }
      await this.deletePhysicalFiles(categories.map((c) => c.icon));
      await repo.remove(categories);
      return {
        success: true,
        count: categories.length,
        message: `Successfully deleted ${categories.length} selected category(ies).`,
      };
    }

    // 3. Safety check khusus Course / Program
    if (
      key === 'course' ||
      key === 'courses' ||
      key === 'program' ||
      key === 'programs'
    ) {
      const courses = (await repo.find({
        where: { id: In(ids) },
        relations: ['userCourses'],
      })) as Course[];
      const withParticipants = courses.filter(
        (c) => (c.userCourses || []).length > 0,
      );
      if (withParticipants.length > 0) {
        if (withParticipants.length === 1) {
          throw new BadRequestException(
            `Program "${withParticipants[0].name}" cannot be deleted because it already has ${withParticipants[0].userCourses.length} enrolled participant(s).`,
          );
        } else {
          const names = withParticipants.map((c) => `"${c.name}"`).join(', ');
          throw new BadRequestException(
            `Programs ${names} cannot be deleted because they already have enrolled participants.`,
          );
        }
      }
    }

    // Safety check khusus Installment
    if (key === 'installment' || key === 'installments') {
      const installments = (await repo.find({
        where: { id: In(ids) },
        relations: ['payment'],
      })) as Installment[];
      const withPayments = installments.filter(
        (inst) => (inst.payment || []).length > 0,
      );
      if (withPayments.length > 0) {
        const months = withPayments
          .map((i) => `(${i.month} Months)`)
          .join(', ');
        throw new BadRequestException(
          `Installment scheme ${months} cannot be deleted because participants have already made payments using this scheme.`,
        );
      }
    }

    // Safety check khusus Week
    if (key === 'week' || key === 'weeks') {
      const weeksList = (await repo.find({
        where: { id: In(ids) },
        relations: [
          'course',
          'weekProgresses',
          'session',
          'session.attendances',
          'session.sessionProgress',
        ],
      })) as Weeks[];
      for (const w of weeksList) {
        const isCompleted =
          (w.weekProgresses || []).some((wp) => wp.quiz || wp.process) ||
          (w.session || []).some(
            (s) =>
              (s.attendances || []).length > 0 ||
              (s.sessionProgress || []).some((sp) => sp.logbook || sp.isAttended),
          );
        if (isCompleted) {
          throw new BadRequestException(
            `Week "${w.description || `Week ${w.weekNumber}`}" cannot be deleted because it has already been completed by user.`,
          );
        }
      }
    }

    // Safety check khusus Syllabus
    if (key === 'syllabus' || key === 'syllabi') {
      const syllabusList = (await repo.find({
        where: { id: In(ids) },
        relations: ['course', 'syllabusProgresses'],
      })) as Syllabus[];
      for (const s of syllabusList) {
        const isCompleted = (s.syllabusProgresses || []).some(
          (sp) => sp.quiz || sp.process,
        );
        if (isCompleted) {
          throw new BadRequestException(
            `Syllabus "${s.title}" cannot be deleted because it has already been completed by a user.`,
          );
        }
      }
    }

    // Safety check khusus Session
    if (key === 'session' || key === 'sessions') {
      const sessions = (await repo.find({
        where: { id: In(ids) },
        relations: ['weeks'],
      })) as Session[];
      const logbookRepo = this.dataSource.getRepository(Logbook);
      for (const s of sessions) {
        const approvedCount = await logbookRepo.count({
          where: { session: { id: s.id }, process: 'approved' },
        });
        if (approvedCount > 0) {
          throw new BadRequestException(
            `Session "${s.topic || s.id}" cannot be deleted because it has already been completed by user.`,
          );
        }
      }
    }

    // Safety check khusus Question
    if (key === 'question' || key === 'questions') {
      const questions = (await repo.find({
        where: { id: In(ids) },
        relations: ['quiz'],
      })) as Question[];
      const scoreRepo = this.dataSource.getRepository(Score);
      const quizIds = Array.from(
        new Set(
          questions
            .map((q) => q.quiz?.id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      for (const qId of quizIds) {
        const scoreCount = await scoreRepo.count({
          where: { quiz: { id: qId } },
        });
        if (scoreCount > 0) {
          throw new BadRequestException(
            'Questions cannot be deleted because participants have already attempted this quiz.',
          );
        }
      }
      const answerRepo = this.dataSource.getRepository(Answer);
      const answers = await answerRepo.find({
        where: { question: { id: In(ids) } },
      });
      if (answers.length > 0) {
        await answerRepo.remove(answers);
      }
      await this.deletePhysicalFiles(questions.map((q) => q.image));
    }

    // Safety check khusus Assignment / Task
    if (
      key === 'assignment' ||
      key === 'assignments' ||
      key === 'task' ||
      key === 'tasks'
    ) {
      const answerTaskRepo = this.dataSource.getRepository(AnswerTask);
      const assignments = (await repo.find({
        where: { id: In(ids) },
      })) as Assignment[];
      for (const a of assignments) {
        const approvedCount = await answerTaskRepo.count({
          where: { task: { id: a.id }, process: 'approved' },
        });
        if (approvedCount > 0) {
          throw new BadRequestException(
            `Assignment "${a.title}" cannot be deleted because it has already been completed by user.`,
          );
        }
      }
      await this.deletePhysicalFiles(assignments.map((a) => a.file));
    }

    // Safety check khusus Attendance
    if (key === 'attendance' || key === 'attendances') {
      const attendances = (await repo.find({
        where: { id: In(ids) },
        relations: ['user', 'session'],
      })) as Attendance[];
      const logbookRepo = this.dataSource.getRepository(Logbook);
      const sessionProgressRepo =
        this.dataSource.getRepository(SessionProgress);
      for (const att of attendances) {
        if (att.user && att.session) {
          const approvedLogbook = await logbookRepo.findOne({
            where: {
              user: { id: att.user.id },
              session: { id: att.session.id },
              process: 'approved',
            },
          });
          if (approvedLogbook) {
            throw new BadRequestException(
              `Attendance for user "${att.user.username || att.user.email}" cannot be deleted because the user has an approved logbook for this session.`,
            );
          }
          const sessionProgress = await sessionProgressRepo.findOne({
            where: {
              user: { id: att.user.id },
              session: { id: att.session.id },
            },
          });
          if (sessionProgress) {
            await sessionProgressRepo.remove(sessionProgress);
          }
        }
      }
    }

    // Safety check khusus Material
    if (
      key === 'material' ||
      key === 'materials' ||
      key === 'learning_material' ||
      key === 'learningmaterial' ||
      key === 'learning_materials'
    ) {
      const materials = (await repo.find({
        where: { id: In(ids) },
        relations: ['syllabus'],
      })) as Material[];
      for (const m of materials) {
        if (m.syllabus) {
          const syllabusWithProgress = await this.dataSource
            .getRepository(Syllabus)
            .findOne({
              where: { id: m.syllabus.id },
              relations: ['syllabusProgresses'],
            });
          if (
            syllabusWithProgress &&
            (syllabusWithProgress.syllabusProgresses || []).some(
              (sp) => sp.quiz || sp.process,
            )
          ) {
            throw new BadRequestException(
              `Material "${m.title}" cannot be deleted because the syllabus has already been completed by a user.`,
            );
          }
        }
      }
      await this.deletePhysicalFiles(materials.map((m) => m.file));
    }

    const items = await repo.findBy({ id: In(ids) });
    if (!items || items.length === 0) {
      throw new NotFoundException('Selected items were not found.');
    }

    // Cleanup file gambar/media jika ada
    const fileKeys = [
      'image',
      'icon',
      'logo',
      'file',
      'profile',
      'banner',
      'video',
      'filePath',
    ];
    const filesToClean: string[] = [];
    for (const item of items) {
      for (const field of fileKeys) {
        const val = (item as Record<string, unknown>)[field];
        if (typeof val === 'string') {
          filesToClean.push(val);
        } else if (Array.isArray(val)) {
          for (const sub of val) {
            if (typeof sub === 'string') filesToClean.push(sub);
          }
        }
      }
    }
    await this.deletePhysicalFiles(filesToClean);

    await repo.remove(items);
    await this.postDeleteCleanup(key, items);
    return {
      success: true,
      count: items.length,
      message: `Successfully deleted ${items.length} selected item(s).`,
    };
  }

  private async postDeleteCleanup(key: string, items: ObjectLiteral[]) {
    if (!items || items.length === 0) return;

    // Re-index remaining weeks
    if (key === 'week' || key === 'weeks') {
      const repo = this.dataSource.getRepository(Weeks);
      const courseIds = Array.from(
        new Set(
          (items as Weeks[])
            .map((w) => w.course?.id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      for (const cId of courseIds) {
        const allWeeks = await repo.find({
          where: { course: { id: cId } },
          order: { createdAt: 'ASC' },
        });
        for (let i = 0; i < allWeeks.length; i++) {
          allWeeks[i].weekNumber = i + 1;
          await repo.save(allWeeks[i]);
        }
      }
    }

    // Re-index remaining syllabus
    if (key === 'syllabus' || key === 'syllabi') {
      const repo = this.dataSource.getRepository(Syllabus);
      const courseIds = Array.from(
        new Set(
          (items as Syllabus[])
            .map((s) => s.course?.id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      for (const cId of courseIds) {
        const allSyllabus = await repo.find({
          where: { course: { id: cId } },
          order: { createdAt: 'ASC' },
        });
        for (let i = 0; i < allSyllabus.length; i++) {
          allSyllabus[i].syllabusNumber = i + 1;
          await repo.save(allSyllabus[i]);
        }
      }
    }

    // Re-index remaining sessions
    if (key === 'session' || key === 'sessions') {
      const repo = this.dataSource.getRepository(Session);
      const weekIds = Array.from(
        new Set(
          (items as Session[])
            .map((s) => s.weeks?.id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      for (const wId of weekIds) {
        const allSessions = await repo.find({
          where: { weeks: { id: wId } },
          order: { createdAt: 'ASC' },
        });
        for (let i = 0; i < allSessions.length; i++) {
          allSessions[i].sessionOrder = i + 1;
          await repo.save(allSessions[i]);
        }
      }
    }

    // Re-index remaining course flow
    if (
      key === 'course_flow' ||
      key === 'courseflow' ||
      key === 'flow_program' ||
      key === 'flowprogram' ||
      key === 'flow-program'
    ) {
      const repo = this.dataSource.getRepository(CourseFlow);
      const courseIds = Array.from(
        new Set(
          (items as CourseFlow[])
            .map((f) => f.course?.id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      for (const cId of courseIds) {
        const allFlows = await repo.find({
          where: { course: { id: cId } },
          order: { createdAt: 'ASC' },
        });
        for (let i = 0; i < allFlows.length; i++) {
          allFlows[i].sequence = i + 1;
          await repo.save(allFlows[i]);
        }
      }
    }
  }

  async deleteAll(
    entityKey: string,
    currentUser?: { id?: string; role?: string },
  ) {
    const key = this.normalizeKey(entityKey);
    const entityTarget = this.entityMap[key];
    if (!entityTarget) {
      throw new BadRequestException(`Entity '${entityKey}' is not recognized.`);
    }

    const repo = this.dataSource.getRepository(entityTarget);

    // 1. Safety check khusus User
    if (key === 'user' || key === 'users') {
      const users = (await repo.find()) as User[];
      const safeUsers = users.filter(
        (u) => u.role !== 'super_admin' && u.id !== currentUser?.id,
      );
      if (safeUsers.length === 0) {
        return {
          success: true,
          count: 0,
          message:
            'No non-admin users to delete. Super Admin accounts are protected.',
        };
      }
      await this.deletePhysicalFiles(safeUsers.map((u) => u.profile));
      await repo.remove(safeUsers);
      return {
        success: true,
        count: safeUsers.length,
        message: `Successfully deleted all user data (${safeUsers.length} users). Super Admin accounts remain secure.`,
      };
    }

    // 2. Safety check khusus Category
    if (key === 'category' || key === 'categories') {
      const categories = (await repo.find({
        relations: ['courses'],
      })) as Category[];
      const withCourses = categories.filter(
        (c) => (c.courses || []).length > 0,
      );
      if (withCourses.length > 0) {
        const names = withCourses.map((c) => `"${c.name}"`).join(', ');
        throw new BadRequestException(
          `Cannot delete all categories because the following category(ies) still contain related programs: ${names}.`,
        );
      }
      await this.deletePhysicalFiles(categories.map((c) => c.icon));
      await repo.remove(categories);
      return {
        success: true,
        count: categories.length,
        message: `Successfully deleted all categories (${categories.length} data).`,
      };
    }

    // 3. Safety check khusus Course / Program
    if (
      key === 'course' ||
      key === 'courses' ||
      key === 'program' ||
      key === 'programs'
    ) {
      const courses = (await repo.find({
        relations: ['userCourses'],
      })) as Course[];
      const withParticipants = courses.filter(
        (c) => (c.userCourses || []).length > 0,
      );
      if (withParticipants.length > 0) {
        if (withParticipants.length === 1) {
          throw new BadRequestException(
            `Program "${withParticipants[0].name}" cannot be deleted because it already has ${withParticipants[0].userCourses.length} enrolled participant(s).`,
          );
        } else {
          const names = withParticipants.map((c) => `"${c.name}"`).join(', ');
          throw new BadRequestException(
            `Programs ${names} cannot be deleted because they already have enrolled participants.`,
          );
        }
      }
    }

    // 4. Entity umum
    // Safety check khusus Installment
    if (key === 'installment' || key === 'installments') {
      const installments = (await repo.find({
        relations: ['payment'],
      })) as Installment[];
      const withPayments = installments.filter(
        (inst) => (inst.payment || []).length > 0,
      );
      if (withPayments.length > 0) {
        throw new BadRequestException(
          'Cannot delete all installments because some schemes already have payment records.',
        );
      }
    }

    // Safety check khusus Week
    if (key === 'week' || key === 'weeks') {
      const weeksList = (await repo.find({
        relations: [
          'weekProgresses',
          'session',
          'session.attendances',
          'session.sessionProgress',
        ],
      })) as Weeks[];
      const completed = weeksList.filter(
        (w) =>
          (w.weekProgresses || []).some((wp) => wp.quiz || wp.process) ||
          (w.session || []).some(
            (s) =>
              (s.attendances || []).length > 0 ||
              (s.sessionProgress || []).some((sp) => sp.logbook || sp.isAttended),
          ),
      );
      if (completed.length > 0) {
        throw new BadRequestException(
          'Cannot delete all weeks because some weeks have already been completed by user.',
        );
      }
    }

    // Safety check khusus Syllabus
    if (key === 'syllabus' || key === 'syllabi') {
      const syllabusList = (await repo.find({
        relations: ['syllabusProgresses'],
      })) as Syllabus[];
      const completed = syllabusList.filter((s) =>
        (s.syllabusProgresses || []).some((sp) => sp.quiz || sp.process),
      );
      if (completed.length > 0) {
        throw new BadRequestException(
          'Cannot delete all syllabus because some items have already been completed by user.',
        );
      }
    }

    // Safety check khusus Session
    if (key === 'session' || key === 'sessions') {
      const sessions = (await repo.find()) as Session[];
      const logbookRepo = this.dataSource.getRepository(Logbook);
      for (const s of sessions) {
        const approvedCount = await logbookRepo.count({
          where: { session: { id: s.id }, process: 'approved' },
        });
        if (approvedCount > 0) {
          throw new BadRequestException(
            'Cannot delete all sessions because some sessions have already been completed by user.',
          );
        }
      }
    }

    // Safety check khusus Question
    if (key === 'question' || key === 'questions') {
      const scoreRepo = this.dataSource.getRepository(Score);
      const scoreCount = await scoreRepo.count();
      if (scoreCount > 0) {
        throw new BadRequestException(
          'Cannot delete all questions because participants have already attempted quizzes.',
        );
      }
      const answerRepo = this.dataSource.getRepository(Answer);
      await answerRepo.clear().catch(() => undefined);
    }

    // Safety check khusus Assignment / Task
    if (
      key === 'assignment' ||
      key === 'assignments' ||
      key === 'task' ||
      key === 'tasks'
    ) {
      const answerTaskRepo = this.dataSource.getRepository(AnswerTask);
      const approvedCount = await answerTaskRepo.count({
        where: { process: 'approved' },
      });
      if (approvedCount > 0) {
        throw new BadRequestException(
          'Cannot delete all assignments because some have already been completed by user.',
        );
      }
    }

    const items = await repo.find();
    if (!items || items.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'No data to delete.',
      };
    }

    const fileKeys = [
      'image',
      'icon',
      'logo',
      'file',
      'profile',
      'banner',
      'video',
      'filePath',
    ];
    const filesToClean: string[] = [];
    for (const item of items) {
      for (const field of fileKeys) {
        const val = (item as Record<string, unknown>)[field];
        if (typeof val === 'string') {
          filesToClean.push(val);
        } else if (Array.isArray(val)) {
          for (const sub of val) {
            if (typeof sub === 'string') filesToClean.push(sub);
          }
        }
      }
    }
    await this.deletePhysicalFiles(filesToClean);

    await repo.remove(items);
    await this.postDeleteCleanup(key, items);
    return {
      success: true,
      count: items.length,
      message: `Successfully deleted all data (${items.length} items).`,
    };
  }
}
