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
import { Award } from '../entities/award.entity';
import { Background } from '../entities/background.entity';
import { Benefit } from '../entities/benefit.entity';
import { BenefitCategory } from '../entities/benefit_category.entity';
import { Category } from '../entities/category.entity';
import { CategoryPartner } from '../entities/category_partner.entity';
import { Commitment } from '../entities/commitment.entity';
import { Course } from '../entities/course.entity';
import { CourseFlow } from '../entities/course_flow.entity';
import { CourseType } from '../entities/course_type.entity';
import { Experience } from '../entities/experience.entity';
import { Faq } from '../entities/faq.entity';
import { CategoryFaq } from '../entities/faqs.entity';
import { Installment } from '../entities/installment.entity';
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

@Injectable()
export class BulkDeleteService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private readonly entityMap: Record<string, EntityTarget<ObjectLiteral>> = {
    category: Category,
    categories: Category,
    voucher: Voucher,
    vouchers: Voucher,
    partner: Partner,
    partners: Partner,
    partnership: Partner,
    category_partner: CategoryPartner,
    categorypartner: CategoryPartner,
    faq: Faq,
    faqs: CategoryFaq,
    benefit: Benefit,
    benefits: Benefit,
    benefit_category: BenefitCategory,
    benefitcategory: BenefitCategory,
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
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException(
        'Please select at least one item to delete.',
      );
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
          'Super Admin accounts or currently active accounts cannot be deleted.',
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

    // 4. Entity umum
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
    ];
    const filesToClean: string[] = [];
    for (const item of items) {
      for (const field of fileKeys) {
        const val = (item as Record<string, unknown>)[field];
        if (typeof val === 'string') {
          filesToClean.push(val);
        }
      }
    }
    await this.deletePhysicalFiles(filesToClean);

    await repo.remove(items);
    return {
      success: true,
      count: items.length,
      message: `Successfully deleted ${items.length} selected item(s).`,
    };
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
    ];
    const filesToClean: string[] = [];
    for (const item of items) {
      for (const field of fileKeys) {
        const val = (item as Record<string, unknown>)[field];
        if (typeof val === 'string') {
          filesToClean.push(val);
        }
      }
    }
    await this.deletePhysicalFiles(filesToClean);

    await repo.remove(items);
    return {
      success: true,
      count: items.length,
      message: `Successfully deleted all data (${items.length} items).`,
    };
  }
}

