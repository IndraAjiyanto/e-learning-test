import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import methodOverride from 'method-override';
import session from 'express-session';
import passport from 'passport';
import { RolesGuard } from './common/guards/roles.guard';
import flash from 'connect-flash';
import { ForbiddenExceptionFilter } from './common/filters/forbidden-exception.filter';
import { NotFoundExceptionFilter } from './common/filters/not-found-exception.filter';
import { InternalServerErrorExceptionFilter } from './common/filters/internal-server-error.filter';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import { engine } from 'express-handlebars';
import connectPgSimple from 'connect-pg-simple';
import { FooterService } from './footer/footer.service';
import { hbsHelpers } from './common/helpers';
import { readFlashToast } from './common/utils/toast.util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global filters
  app.useGlobalFilters(new InternalServerErrorExceptionFilter());
  app.useGlobalFilters(new ForbiddenExceptionFilter());
  app.useGlobalFilters(new NotFoundExceptionFilter());

  // Static assets
  app.useStaticAssets(join(process.cwd(), 'src', 'common', 'public'), {
    prefix: '/public/',
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.useStaticAssets(join(process.cwd(), 'public', 'asset'), {
    prefix: '/asset/',
  });

  // Cookie parser
  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-Learning API')
    .setDescription('API documentation for the e-learning application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  // Konfigurasi Handlebars — helpers via agregator 1 pintu (src/common/helpers/index.ts)
  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: join(process.cwd(), 'src', 'views', 'layouts'),
      partialsDir: join(process.cwd(), 'src', 'views', 'partials'),
      helpers: hbsHelpers,
    }),
  );

  app.setBaseViewsDir(join(process.cwd(), 'src', 'views'));
  app.setViewEngine('hbs');
  app.set('view cache', false);

  const PgSession = connectPgSimple(session);

  app.use(methodOverride('_method'));
  app.use(
    session({
      store: new PgSession({
        conObject: {
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        },
        tableName: 'web_sessions',
        createTableIfMissing: true,
      }),
      secret: 'rahasia-super',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 },
    }),
  );

  app.use(flash());

  // Sesi disimpan di Postgres (connect-pg-simple), jadi penulisannya asinkron:
  // express-session baru menulis sesi saat res.end(), sesudah response terkirim.
  // Pada POST -> redirect, browser mengikuti Location seketika (terukur 0ms jeda),
  // sehingga GET berikutnya sempat membaca sesi LAMA dan flash yang baru ditulis
  // hilang — notifikasi tidak pernah muncul. Tunggu sesi tersimpan dulu baru
  // kirim redirect. Dipasang global supaya berlaku untuk semua controller dan
  // kedua kanal notifikasi (flash `success` lama maupun flash `toast` baru).
  app.use((req: Request, res: Response, next: NextFunction) => {
    const redirect = res.redirect.bind(res) as (...args: any[]) => void;

    res.redirect = ((...args: any[]) => {
      if (!req.session) return redirect(...args);

      req.session.save((err) => {
        if (err) console.error('Gagal menyimpan sesi sebelum redirect:', err);
        redirect(...args);
      });
    }) as Response['redirect'];

    next();
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    // Key terpisah dari 'success': partial `sweetalert` merender 'success'
    // sebagai toast sendiri, jadi ini mencegah dua notifikasi untuk satu aksi.
    res.locals.toast = readFlashToast(req);
    next();
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req: any, res: Response, next: NextFunction) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
  });

  const footerService = app.get(FooterService);
  app.use(async (req: any, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role;
      if (role !== 'admin' && role !== 'super_admin') {
        const [footerData, footerCategories] = await Promise.all([
          footerService.getFooterData(),
          footerService.getCategories(),
        ]);
        res.locals.footerData = footerData;
        res.locals.footerCategories = footerCategories;
      }
    } catch (error) {
      console.error('Footer middleware error:', error);
    }
    next();
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    // Default to 'id' so this matches nestjs-i18n's fallbackLanguage: a cookie-less
    // visitor gets one consistent language across both t() and getByLang().
    const lang = req.cookies?.lang || 'id';
    res.locals.currentLang = lang;
    res.locals.lang = lang;
    // Auth screens (login/register/forgot/reset/verify) render over a photo bg -
    // navbar must be transparent there. Checked server-side so no Alpine flash.
    res.locals.isAuthPage =
      /^\/(login|register|session-expired|verify-email)(\/|$)/.test(req.path) ||
      /^\/users\/(forgot-password|reset-password|send-verify-email|verify-email)(\/|$)/.test(
        req.path,
      );
    next();
  });

  app.useGlobalGuards(new RolesGuard(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
