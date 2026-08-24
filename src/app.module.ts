import {
  Logger,
  MiddlewareConsumer,
  Module,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { InvoiceModule } from './invoice/invoice.module';
import { AttendancesModule } from './attendances/attendances.module';
import { MaterialsModule } from './materials/material.module';
import { CoursesModule } from './courses/courses.module';
import { SessionsModule } from './sessions/session.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { AuthModule } from './auth/auth.module';
import { BiodatasModule } from './biodatas/biodatas.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { CategoriesModule } from './categories/categories.module';
import { AnswersModule } from './answers/answers.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { PaymentsModule } from './payments/payments.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswerTasksModule } from './assignment_answers/assignment_answers.module';
import { UserAnswersModule } from './user_answers/user_answers.module';
import { CommentsModule } from './comments/comments.module';
import { LogbookModule } from './logbook/logbook.module';
import { WeeksModule } from './weeks/weeks.module';
import { QuizModule } from './quiz/quiz.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FaqsModule } from './faqs/faqs.module';
import { AlumniModule } from './alumni/alumni.module';
import { CourseTypesModule } from './course_types/course_types.module';
import { CertificatesModule } from './certificates/certificates.module';
import { CourseQuestionsModule } from './course_questions/course_questions.module';
import { MentorLogbookModule } from './mentor_logbook/mentor_logbook.module';
import { BenefitModule } from './benefit/benefit.module';
import { MentorModule } from './mentor/mentor.module';
import { CourseFlowsModule } from './course_flows/course_flows.module';
import { ProgramBenefitModule } from './course_benefits/course_benefits.module';
import { TeamModule } from './team/team.module';
import { VisionsModule } from './visions/visions.module';
import { SocialModule } from './social/social.module';
import { InstallmentsModule } from './installments/installments.module';
import { AboutModule } from './about/about.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { TeamLeadModule } from './team_lead/team_lead.module';
import { ValueModule } from './value/value.module';
import { CommitmentModule } from './commitment/commitment.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { ParagraphsModule } from './paragraphs/paragraphs.module';
import { ContactModule } from './contact/contact.module';
import { AwardModule } from './award/award.module';
import { ExperienceModule } from './experience/experience.module';
import { BackgroundModule } from './background/background.module';
import { MissionsModule } from './missions/missions.module';
import { BenefitCategoryModule } from './benefit_category/benefit_category.module';
import { FaqModule } from './faq/faq.module';
import { AuthMiddleware } from './auth/auth.middleware';
import {
  AcceptLanguageResolver,
  CookieResolver,
  I18nMiddleware,
  I18nModule,
} from 'nestjs-i18n';
import { GalleryModule } from './gallery/gallery.module';
import { CategoryPartnerModule } from './category_partner/category_partner.module';
import { PartnerModule } from './partner/partner.module';
import { VoucherModule } from './voucher/voucher.module';
import { FooterModule } from './footer/footer.module';
import { FooterMiddleware } from './footer/footer.middleware';
import path from 'path';
import { DataSource } from 'typeorm';

const TABLES_WITH_SEQUENCE = [
  'material',
  'comments',
  'answer_task',
  'assignments',
  'portofolios',
  'course_type',
  'faqs',
  'category',
  'installment',
  'payments',
  'certificates',
  'user_courses',
  'course_questions',
  'technologies',
  'mentors',
  'course_flow',
  'program_benefits',
  'registrations',
  'course',
  'user_answers',
  'answers',
  'questions',
  'scores',
  'quiz_progresses',
  'weeks',
  'session_progresses',
  'mentor_logbook',
  'session',
  'attendance',
  'mentor_biodata',
  'week_progresses',
  'visions',
  'paragraph',
  'mission',
  'category_partner',
  'about',
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'id',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: CookieResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..','src', 'common','public'),
    // }),
    UsersModule,
    InvoiceModule,
    AttendancesModule,
    MaterialsModule,
    CoursesModule,
    SessionsModule,
    AuthModule,
    BiodatasModule,
    PortfoliosModule,
    CategoriesModule,
    AnswersModule,
    AssignmentsModule,
    PaymentsModule,
    QuestionsModule,
    AnswerTasksModule,
    UserAnswersModule,
    CommentsModule,
    LogbookModule,
    WeeksModule,
    QuizModule,
    DashboardModule,
    FaqsModule,
    AlumniModule,
    CourseTypesModule,
    CertificatesModule,
    CourseQuestionsModule,
    MentorLogbookModule,
    BenefitModule,
    MentorModule,
    CourseFlowsModule,
    ProgramBenefitModule,
    TeamModule,
    VisionsModule,
    SocialModule,
    InstallmentsModule,
    AboutModule,
    TechnologiesModule,
    TeamLeadModule,
    ValueModule,
    CommitmentModule,
    RegistrationsModule,
    ParagraphsModule,
    ContactModule,
    AwardModule,
    ExperienceModule,
    BackgroundModule,
    MissionsModule,
    BenefitCategoryModule,
    FaqModule,
    GalleryModule,
    CategoryPartnerModule,
    PartnerModule,
    VoucherModule,
    FooterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    for (const table of TABLES_WITH_SEQUENCE) {
      try {
        await this.dataSource.query(
          `CREATE SEQUENCE IF NOT EXISTS "${table}_id_seq" OWNED BY "${table}"."id"`,
        );
        const result = await this.dataSource.query(
          `SELECT COALESCE(MAX("id"), 0) AS "maxId" FROM "${table}"`,
        );
        const maxId = result[0]?.maxId ?? 0;
        await this.dataSource.query(
          `SELECT setval('"${table}_id_seq"', GREATEST(${maxId}, 1))`,
        );
        await this.dataSource.query(
          `ALTER TABLE "${table}" ALTER COLUMN "id" SET DEFAULT nextval('"${table}_id_seq"')`,
        );
      } catch (e) {
        this.logger.warn(`Skip sequence restore for "${table}": ${e.message}`);
      }
    }
    this.logger.log('All sequence defaults restored');
  }

  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(I18nMiddleware).forRoutes('*');
    consumer
      .apply(AuthMiddleware)
      .exclude(
        '/',
        '/login',
        '/translation',
        '/register',
        'program/*path',
        'category/*path',
        'blog/*path',
        '/register/:id',
        '/session-expired',
        '/users/send-verify-email',
        '/users/verify-email-success',
        '/users/verify-email',
        '/users/reset-password',
        '/users/forgot-password',
        '/public/*path',
        '/asset/*path',
        '/uploads/*path',
        '/alumni/filter',
        '/dashboard',
        '/dashboard/*path',
      )
      .forRoutes('*');

    consumer.apply(FooterMiddleware).forRoutes('*');
  }
}
