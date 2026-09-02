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

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
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
    const lang = req.cookies?.lang || 'en';
    res.locals.currentLang = lang;
    res.locals.lang = lang;
    next();
  });

  app.useGlobalGuards(new RolesGuard(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
