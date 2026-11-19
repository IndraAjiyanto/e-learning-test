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
      subtitle: 'Menu Dashboard • Ringkasan aktivitas belajar',
      url: '/users/profile?tab=dashboard',
      keywords: [
        'dashboard',
        'home',
        'beranda',
        'main',
        'overview',
        'ringkasan',
      ],
    },
    {
      title: 'Profile',
      subtitle: 'Menu Dashboard • Profil, biodata & kata sandi',
      url: '/users/profile?tab=profile',
      keywords: [
        'profile',
        'profil',
        'akun',
        'account',
        'password',
        'kata sandi',
        'biodata',
        'settings',
        'pengaturan',
        'email',
      ],
    },
    {
      title: 'My Learning',
      subtitle: 'Menu Dashboard • Program & kelas yang sedang diikuti',
      url: '/users/profile?tab=learning',
      keywords: [
        'learning',
        'my learning',
        'materi',
        'kursus',
        'kelas',
        'study',
        'course',
        'program',
        'bootcamp',
        'belajar',
        'modul',
      ],
    },
    {
      title: 'My Portfolio',
      subtitle: 'Menu Dashboard • Koleksi karya & tugas portfolio',
      url: '/users/profile?tab=portfolio',
      keywords: [
        'portfolio',
        'portofolio',
        'project',
        'karya',
        'tugas',
        'proyek',
        'showcase',
      ],
    },
    {
      title: 'Payment History',
      subtitle: 'Menu Dashboard • Riwayat transaksi, tagihan & invoice',
      url: '/users/profile?tab=history-payment',
      keywords: [
        'payment',
        'history',
        'pembayaran',
        'riwayat',
        'transaksi',
        'tagihan',
        'installment',
        'cicilan',
        'invoice',
        'bayar',
        'lunas',
        'paid',
      ],
    },
  ];

  /**
   * Global Search khusus dashboard role user:
   * HANYA mencari data yang terdaftar pada dashboard pengguna yang sedang login
   * (program/kelas yang diikuti, sesi belajar, portfolio, riwayat transaksi, dan menu).
   * Program umum di luar pendaftaran pengguna TIDAK akan ditampilkan.
   */
  async search(query: string, userId?: string): Promise<SearchResultData> {
    const q = (query || '').trim();
    if (!q || !userId) {
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

    // 1. Program & Kelas yang TERDAFTAR pada dashboard pengguna ini saja
    const courses: SearchItem[] = [];
    const programs: SearchItem[] = [];

    try {
      const isGeneralProgramKeyword = [
        'program',
        'course',
        'kursus',
        'kelas',
        'bootcamp',
        'belajar',
        'my course',
        'my program',
      ].some((k) => lowerQ.includes(k));

      const userCoursesQb = this.userCourseRepository
        .createQueryBuilder('uc')
        .leftJoinAndSelect('uc.course', 'course')
        .leftJoinAndSelect('course.category', 'category')
        .leftJoinAndSelect('course.weeks', 'weeks')
        .leftJoinAndSelect('course.courseType', 'courseType')
        .innerJoin('uc.user', 'user')
        .where('user.id = :userId', { userId });

      if (!isGeneralProgramKeyword) {
        userCoursesQb.andWhere(
          '(LOWER(course.name) LIKE :q OR LOWER(category.name) LIKE :q OR (course.group NOT LIKE :httpPrefix AND LOWER(course.group) LIKE :q))',
          { q: `%${lowerQ}%`, httpPrefix: 'http%' },
        );
      }

      const userCourses = await userCoursesQb.take(8).getMany();

      userCourses.forEach((uc) => {
        const course = uc.course;
        if (!course) return;

        const catName = (course.category?.name || '').toLowerCase();
        const typeName = (
          course.courseType?.nameClassesType || ''
        ).toLowerCase();
        const courseName = (course.name || '').toLowerCase();

        const isShortClassOrSingleCourse =
          course.programType === 'non_bootcamp' ||
          catName.includes('class') ||
          catName.includes('kursus') ||
          typeName.includes('class') ||
          typeName.includes('starter') ||
          typeName.includes('faster') ||
          (!catName.includes('program') &&
            !catName.includes('bootcamp') &&
            !courseName.includes('bootcamp') &&
            !courseName.includes('program'));

        const statusText = uc.progress ? 'Selesai' : 'Sedang Berjalan';
        const targetUrl = `/program/myProgram/${userId}?courseId=${course.id}`;
        const image =
          course.image || '/public/image/dashboard/bgHeroSection.png';

        if (isShortClassOrSingleCourse) {
          courses.push({
            id: course.id,
            title: course.name,
            subtitle: `Kelas Saya • ${statusText}${course.category?.name ? ` • ${course.category.name}` : ''}`,
            image,
            url: targetUrl,
            badge: statusText,
          });
        } else {
          programs.push({
            id: course.id,
            title: course.name,
            subtitle: `Program Saya • ${statusText}${course.category?.name ? ` • ${course.category.name}` : ''}`,
            image,
            url: targetUrl,
            badge: statusText,
          });
        }
      });
    } catch (e) {
      console.error('Enrolled courses search error:', e);
    }

    // 2. Materi & Sesi Belajar (HANYA dari program yang diikuti oleh pengguna ini)
    const learnings: SearchItem[] = [];
    try {
      // 2a. Sesi dari program yang diikuti
      const matchedSessions = await this.sessionRepository
        .createQueryBuilder('session')
        .innerJoinAndSelect('session.weeks', 'weeks')
        .innerJoinAndSelect('weeks.course', 'course')
        .innerJoin('course.userCourses', 'uc')
        .innerJoin('uc.user', 'user')
        .where('user.id = :userId', { userId })
        .andWhere(
          '(LOWER(session.topic) LIKE :q OR LOWER(course.name) LIKE :q)',
          { q: `%${lowerQ}%` },
        )
        .take(3)
        .getMany();

      matchedSessions.forEach((session) => {
        if (!learnings.some((l) => l.title === session.topic)) {
          learnings.push({
            id: session.id,
            title: session.topic || 'Sesi Belajar',
            subtitle: `Sesi Belajar • ${session.weeks?.course?.name || 'Program'}`,
            image:
              session.weeks?.course?.image ||
              '/public/image/dashboard/bgHeroSection.png',
            url: `/program/session/detail/${session.id}`,
          });
        }
      });

      // 2b. Silabus modul dari program yang diikuti
      const matchedSyllabuses = await this.syllabusRepository
        .createQueryBuilder('syllabus')
        .innerJoinAndSelect('syllabus.course', 'course')
        .innerJoin('course.userCourses', 'uc')
        .innerJoin('uc.user', 'user')
        .where('user.id = :userId', { userId })
        .andWhere(
          '(LOWER(syllabus.title) LIKE :q OR LOWER(course.name) LIKE :q)',
          { q: `%${lowerQ}%` },
        )
        .take(3)
        .getMany();

      matchedSyllabuses.forEach((syllabus) => {
        if (!learnings.some((l) => l.title === syllabus.title)) {
          learnings.push({
            id: syllabus.id,
            title: syllabus.title,
            subtitle: `Modul Belajar • ${syllabus.course?.name || 'Program'}`,
            image:
              syllabus.course?.image ||
              '/public/image/dashboard/bgHeroSection.png',
            url: `/program/myProgram/${userId}?courseId=${syllabus.course?.id}`,
          });
        }
      });
    } catch (e) {
      console.error('Learning sessions/syllabuses search error:', e);
    }

    // 3. Portofolio Milik Pengguna Ini Saja
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
        .leftJoinAndSelect('pf.course', 'course')
        .innerJoin('pf.user', 'user')
        .where('user.id = :userId', { userId });

      if (!isPortfolioKeyword) {
        portfolioQb.andWhere(
          '(LOWER(pf.title) LIKE :q OR LOWER(pf.description) LIKE :q OR LOWER(course.name) LIKE :q)',
          { q: `%${lowerQ}%` },
        );
      }

      const matchedPortfolios = await portfolioQb.take(4).getMany();
      matchedPortfolios.forEach((pf) => {
        const coverImage =
          Array.isArray(pf.image) && pf.image.length > 0 ? pf.image[0] : '';
        const courseName = pf.course?.name ? ` • ${pf.course.name}` : '';

        portfolios.push({
          id: pf.id,
          title: pf.title || 'Untitled Portfolio',
          subtitle: `Portofolio Saya${courseName}`,
          image: coverImage || '/public/image/dashboard/bgHeroSection.png',
          url: `/portfolio/detail/${pf.id}`,
        });
      });
    } catch (e) {
      console.error('Portfolio search error:', e);
    }

    // 4. Riwayat Transaksi & Pembayaran Pengguna Ini Saja
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

      const isPaidQuery = [
        'paid',
        'lunas',
        'approved',
        'sukses',
        'success',
      ].some((k) => lowerQ.includes(k));

      // 4a. Payments
      const paymentQb = this.paymentRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.course', 'course')
        .leftJoinAndSelect('p.invoice', 'invoice')
        .innerJoin('p.user', 'user')
        .where('user.id = :userId', { userId });

      if (isPaidQuery) {
        paymentQb.andWhere("p.process = 'approved'");
      } else if (!isGeneralPaymentQuery) {
        paymentQb.andWhere(
          '(LOWER(course.name) LIKE :q OR LOWER(p.no) LIKE :q OR LOWER(CAST(p.process AS text)) LIKE :q)',
          { q: `%${lowerQ}%` },
        );
      }

      const matchedPayments = await paymentQb
        .orderBy('p.createdAt', 'DESC')
        .take(4)
        .getMany();
      matchedPayments.forEach((p) => {
        const courseName = p.course?.name || 'Program Payment';
        const status =
          p.process === 'approved'
            ? 'Paid'
            : p.process === 'process'
              ? 'Processing'
              : 'Failed';
        const dateStr = p.createdAt
          ? new Date(p.createdAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '';

        payments.push({
          id: p.id,
          title: courseName,
          subtitle: `Riwayat Pembayaran • ${p.no ? `${p.no} • ` : ''}${status}${dateStr ? ` • ${dateStr}` : ''}`,
          badge: status,
          url: `/users/profile?tab=history-payment`,
        });
      });

      // 4b. Registrations
      const regQb = this.registrationRepository
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.course', 'course')
        .innerJoin('r.user', 'user')
        .where('user.id = :userId', { userId });

      if (isPaidQuery) {
        regQb.andWhere("r.process = 'approved'");
      } else if (!isGeneralPaymentQuery) {
        regQb.andWhere(
          '(LOWER(course.name) LIKE :q OR LOWER(r.no) LIKE :q OR LOWER(CAST(r.process AS text)) LIKE :q)',
          { q: `%${lowerQ}%` },
        );
      }

      const matchedRegistrations = await regQb
        .orderBy('r.createdAt', 'DESC')
        .take(4)
        .getMany();
      matchedRegistrations.forEach((r) => {
        const courseName = r.course?.name || 'Program Registration';
        if (!payments.some((p) => p.title === courseName)) {
          const status =
            r.process === 'approved'
              ? 'Paid'
              : r.process === 'process'
                ? 'Processing'
                : 'Failed';
          const dateStr = r.createdAt
            ? new Date(r.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '';

          payments.push({
            id: r.id,
            title: courseName,
            subtitle: `Riwayat Pembayaran • ${r.no ? `${r.no} • ` : ''}${status}${dateStr ? ` • ${dateStr}` : ''}`,
            badge: status,
            url: `/users/profile?tab=history-payment`,
          });
        }
      });
    } catch (e) {
      console.error('Payment search error:', e);
    }

    // 5. Menu / Navigasi Dashboard
    const isGenericMenuQuery = ['menu', 'page', 'halaman', 'tab'].includes(
      lowerQ,
    );

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
