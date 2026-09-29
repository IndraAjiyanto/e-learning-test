import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { Session } from 'src/entities/session.entity';
import { Syllabus } from 'src/entities/syllabus.entity';
import { Payment } from 'src/entities/payment.entity';
import { Registration } from 'src/entities/registration.entity';
import { Portofolios } from 'src/entities/portofolios.entity';
import { UserCourse } from 'src/entities/user_course.entity';

export interface SearchItem {
  id?: string;
  title: string;
  subtitle: string;
  image?: string;
  url: string;
  badge?: string;
}

export interface SearchResultData {
  courses: SearchItem[];
  programs: SearchItem[];
  learnings: SearchItem[];
  portfolios: SearchItem[];
  payments: SearchItem[];
  menus: SearchItem[];
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Syllabus)
    private readonly syllabusRepository: Repository<Syllabus>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(Portofolios)
    private readonly portfolioRepository: Repository<Portofolios>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
  ) {}

  private readonly userMenus = [
    {
      title: 'Dashboard',
      subtitle: 'Menu • Accessed from sidebar',
      url: '/users/profile?tab=dashboard',
      keywords: ['dashboard', 'home', 'beranda', 'main', 'overview', 'ringkasan'],
    },
    {
      title: 'Profile',
      subtitle: 'Menu • Accessed from sidebar',
      url: '/users/profile?tab=profile',
      keywords: ['profile', 'profil', 'akun', 'account', 'password', 'biodata', 'settings', 'pengaturan', 'email'],
    },
    {
      title: 'My Learning',
      subtitle: 'Menu • Accessed from sidebar',
      url: '/users/profile?tab=learning',
      keywords: ['learning', 'my learning', 'materi', 'kursus', 'kelas', 'study', 'course', 'program', 'bootcamp', 'belajar', 'modul'],
    },
    {
      title: 'My Portfolio',
      subtitle: 'Menu • Accessed from sidebar',
      url: '/users/profile?tab=portfolio',
      keywords: ['portfolio', 'portofolio', 'project', 'karya', 'tugas', 'proyek', 'showcase'],
    },
    {
      title: 'Payment History',
      subtitle: 'Menu • Accessed from sidebar',
      url: '/users/profile?tab=history-payment',
      keywords: ['payment', 'history', 'pembayaran', 'riwayat', 'transaksi', 'tagihan', 'installment', 'cicilan', 'invoice', 'bayar', 'lunas', 'paid'],
    },
  ];

  async search(query: string, userId?: string): Promise<SearchResultData> {
    const q = (query || '').trim();
    if (!q) {
      return {
        courses: [],
        programs: [],
        learnings: [],
        portfolios: [],
        payments: [],
        menus: [],
      };
    }

    const lowerQ = q.toLowerCase();

    // 1. Search Catalog Courses & Programs
    const matchedCourses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.weeks', 'weeks')
      .leftJoinAndSelect('course.courseType', 'courseType')
      .where('LOWER(course.name) LIKE :q', { q: `%${lowerQ}%` })
      .orWhere('LOWER(course.group) LIKE :q', { q: `%${lowerQ}%` })
      .orWhere('LOWER(category.name) LIKE :q', { q: `%${lowerQ}%` })
      .take(8)
      .getMany();

    const courses: SearchItem[] = [];
    const programs: SearchItem[] = [];

    matchedCourses.forEach((course) => {
      const isProgram =
        course.programType === 'bootcamp' ||
        (course.category?.name &&
          course.category.name.toLowerCase().includes('program')) ||
        course.name.toLowerCase().includes('program');

      const modulesCount =
        course.weeks && course.weeks.length > 0 ? course.weeks.length : 8;
      const durationText = course.month ? `${course.month} months` : 'Flexible';
      const isUrl = course.group && /^https?:\/\//i.test(course.group);
      const level = isUrl
        ? (course.courseType?.nameClassesType || 'Bootcamp')
        : (course.group || 'Beginner');

      const targetUrl = `/program/${course.id}`;
      const image = course.image || '/public/image/user_profile/uiux_image.png';

      if (isProgram) {
        programs.push({
          id: course.id,
          title: course.name,
          subtitle: `Program • ${durationText} • ${level}`,
          image,
          url: targetUrl,
        });
      } else {
        courses.push({
          id: course.id,
          title: course.name,
          subtitle: `Course • ${modulesCount} modules • ${level}`,
          image,
          url: targetUrl,
        });
      }
    });

    // 2. Search My Learning (Enrolled Courses, Sessions & Syllabus)
    const learnings: SearchItem[] = [];

    // 2a. User enrolled courses
    try {
      const isLearningKeyword = [
        'learning',
        'my learning',
        'materi',
        'kursus',
        'kelas',
        'study',
        'belajar',
      ].some((k) => lowerQ.includes(k));

      const userCoursesQb = this.userCourseRepository
        .createQueryBuilder('uc')
        .leftJoinAndSelect('uc.course', 'course')
        .leftJoinAndSelect('course.category', 'category');

      if (!isLearningKeyword) {
        userCoursesQb.where('LOWER(course.name) LIKE :q', { q: `%${lowerQ}%` })
          .orWhere('LOWER(course.group) LIKE :q', { q: `%${lowerQ}%` });
      }

      if (userId) {
        userCoursesQb.andWhere('uc.userId = :userId', { userId });
      }

      const userCourses = await userCoursesQb.take(4).getMany();
      userCourses.forEach((uc) => {
        if (uc.course) {
          learnings.push({
            id: uc.course.id,
            title: uc.course.name,
            subtitle: `My Learning • ${uc.progress ? 'Completed' : 'In Progress'}`,
            image: uc.course.image || '/public/image/user_profile/uiux_image.png',
            url: `/users/profile?tab=learning&search=${encodeURIComponent(uc.course.name)}`,
          });
        }
      });
    } catch (e) {
      // Ignore if error
    }

    // 2b. Sessions & Syllabuses
    try {
      const matchedSessions = await this.sessionRepository
        .createQueryBuilder('session')
        .leftJoinAndSelect('session.weeks', 'weeks')
        .where('LOWER(session.topic) LIKE :q', { q: `%${lowerQ}%` })
        .take(3)
        .getMany();

      matchedSessions.forEach((session) => {
        if (!learnings.some((l) => l.title === session.topic)) {
          learnings.push({
            id: session.id,
            title: session.topic || 'Learning Session',
            subtitle: 'My Learning • Session',
            url: `/users/profile?tab=learning`,
          });
        }
      });

      const matchedSyllabuses = await this.syllabusRepository
        .createQueryBuilder('syllabus')
        .where('LOWER(syllabus.title) LIKE :q', { q: `%${lowerQ}%` })
        .take(3)
        .getMany();

      matchedSyllabuses.forEach((syllabus) => {
        if (!learnings.some((l) => l.title === syllabus.title)) {
          learnings.push({
            id: syllabus.id,
            title: syllabus.title,
            subtitle: 'My Learning • Module',
            url: `/users/profile?tab=learning`,
          });
        }
      });
    } catch (e) {
      // Ignore
    }

    // 3. Search My Portfolio
    const portfolios: SearchItem[] = [];
    try {
      const isPortfolioKeyword = [
        'portfolio',
        'portofolio',
        'project',
        'karya',
        'proyek',
        'showcase',
      ].some((k) => lowerQ.includes(k));

      const portfolioQb = this.portfolioRepository
        .createQueryBuilder('pf')
        .leftJoinAndSelect('pf.course', 'course');

      if (!isPortfolioKeyword) {
        portfolioQb.where(
          '(LOWER(pf.title) LIKE :q OR LOWER(pf.description) LIKE :q OR LOWER(course.name) LIKE :q)',
          { q: `%${lowerQ}%` },
        );
      }

      if (userId) {
        portfolioQb.andWhere('pf.userId = :userId', { userId });
      }

      const matchedPortfolios = await portfolioQb.take(4).getMany();
      matchedPortfolios.forEach((pf) => {
        const coverImage =
          Array.isArray(pf.image) && pf.image.length > 0 ? pf.image[0] : '';
        const courseName = pf.course?.name ? ` • ${pf.course.name}` : '';

        portfolios.push({
          id: pf.id,
          title: pf.title || 'Untitled Portfolio',
          subtitle: `My Portfolio${courseName}`,
          image: coverImage || undefined,
          url: `/users/profile?tab=portfolio`,
        });
      });
    } catch (e) {
      // Ignore
    }

    // 4. Search Payment History (Payments & Registrations)
    const payments: SearchItem[] = [];
    try {
      const isGeneralPaymentQuery = [
        'payment',
        'pembayaran',
        'history',
        'riwayat',
        'transaksi',
        'tagihan',
        'installment',
        'cicilan',
        'invoice',
        'bayar',
      ].some((k) => lowerQ.includes(k));

      const isPaidQuery = ['paid', 'lunas', 'approved', 'sukses', 'success'].some((k) =>
        lowerQ.includes(k),
      );

      // 4a. Payments
      const paymentQb = this.paymentRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.course', 'course')
        .leftJoinAndSelect('p.invoice', 'invoice');

      if (isGeneralPaymentQuery) {
        // Return recent payments
      } else if (isPaidQuery) {
        paymentQb.where("p.process = 'approved'");
      } else {
        paymentQb.where(
          '(LOWER(course.name) LIKE :q OR LOWER(p.no) LIKE :q OR LOWER(CAST(p.process AS text)) LIKE :q)',
          { q: `%${lowerQ}%` },
        );
      }

      if (userId) {
        paymentQb.andWhere('p.userId = :userId', { userId });
      }

      const matchedPayments = await paymentQb.take(4).getMany();
      matchedPayments.forEach((p) => {
        const courseName = p.course?.name || 'Program Payment';
        const status =
          p.process === 'approved'
            ? 'Paid'
            : p.process === 'process'
              ? 'Processing'
              : 'Failed';
        const dateStr = p.createdAt
          ? new Date(p.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '';

        payments.push({
          id: p.id,
          title: courseName,
          subtitle: `Payment History • ${status}${dateStr ? ` • ${dateStr}` : ''}`,
          badge: status,
          url: `/users/profile?tab=history-payment`,
        });
      });

      // 4b. Registrations
      const regQb = this.registrationRepository
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.course', 'course');

      if (isGeneralPaymentQuery) {
        // Return recent registrations
      } else if (isPaidQuery) {
        regQb.where("r.process = 'approved'");
      } else {
        regQb.where(
          '(LOWER(course.name) LIKE :q OR LOWER(CAST(r.process AS text)) LIKE :q)',
          { q: `%${lowerQ}%` },
        );
      }

      if (userId) {
        regQb.andWhere('r.userId = :userId', { userId });
      }

      const matchedRegistrations = await regQb.take(4).getMany();
      matchedRegistrations.forEach((r) => {
        const courseName = r.course?.name || 'Program Registration';
        // Avoid duplicate with payment for same course
        if (!payments.some((p) => p.title === courseName)) {
          const status =
            r.process === 'approved'
              ? 'Paid'
              : r.process === 'process'
                ? 'Processing'
                : 'Failed';
          const dateStr = r.createdAt
            ? new Date(r.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '';

          payments.push({
            id: r.id,
            title: courseName,
            subtitle: `Payment History • ${status}${dateStr ? ` • ${dateStr}` : ''}`,
            badge: status,
            url: `/users/profile?tab=history-payment`,
          });
        }
      });
    } catch (e) {
      console.error('Payment search error:', e);
    }

    // 5. Search Menus / Pages
    const isGenericMenuQuery = ['menu', 'page', 'halaman', 'tab'].includes(lowerQ);

    const matchedMenus: SearchItem[] = this.userMenus
      .filter((menu) => {
        if (isGenericMenuQuery) return true;
        return (
          menu.title.toLowerCase().includes(lowerQ) ||
          menu.keywords.some((k) => k.toLowerCase().includes(lowerQ))
        );
      })
      .map((menu) => ({
        title: menu.title,
        subtitle: menu.subtitle,
        url: menu.url,
      }));

    // If search matched items in specific tabs, ensure those tab menus are included in Menu/Page
    const ensureMenu = (title: string, url: string, subtitle: string) => {
      if (!matchedMenus.some((m) => m.title === title)) {
        matchedMenus.push({
          title,
          subtitle,
          url,
        });
      }
    };

    if (payments.length > 0) {
      ensureMenu(
        'Payment History',
        '/users/profile?tab=history-payment',
        'Menu • View transactions & payments',
      );
    }
    if (portfolios.length > 0) {
      ensureMenu(
        'My Portfolio',
        '/users/profile?tab=portfolio',
        'Menu • Project collection & portfolio',
      );
    }
    if (learnings.length > 0) {
      ensureMenu(
        'My Learning',
        '/users/profile?tab=learning',
        'Menu • View courses & learning materials',
      );
    }

    return {
      courses: courses.slice(0, 4),
      programs: programs.slice(0, 4),
      learnings: learnings.slice(0, 4),
      portfolios: portfolios.slice(0, 4),
      payments: payments.slice(0, 4),
      menus: matchedMenus.slice(0, 5),
    };
  }
}
