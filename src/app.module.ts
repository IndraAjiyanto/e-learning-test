import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
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
import { CollaborationsModule } from './collaborations/collaborations.module';
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
import { ImageBenefitModule } from './image_benefit/image_benefit.module';
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
import { FlowCategoryModule } from './flow_category/flow_category.module';
import { FaqModule } from './faq/faq.module';
import { SuperiorityModule } from './superiority/superiority.module';
import { AuthMiddleware } from './auth/auth.middleware';
import {
  AcceptLanguageResolver,
  CookieResolver,
  I18nMiddleware,
  I18nModule,
} from 'nestjs-i18n';
import { OurExperienceModule } from './our_experience/our_experience.module';
import { GalleryModule } from './gallery/gallery.module';
import path from 'path';

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
    CollaborationsModule,
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
    ImageBenefitModule,
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
    FlowCategoryModule,
    FaqModule,
    SuperiorityModule,
    OurExperienceModule,
    GalleryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
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
            '/daftar/:id',
            '/session-expired',
            '/users/send-verify-email',
            '/users/verify-email',
            '/users/reset-password',
            '/users/forgot-password',
            '/public/*path',
            '/asset/*path',
            '/uploads/*path',
            '/dashboard',
            '/dashboard/*path',
            )
            .forRoutes('*');
  }
}
