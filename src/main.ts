import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import methodOverride from 'method-override';
import session from 'express-session';
import passport from 'passport';
import { format } from 'date-fns';
import { enUS, id, ja } from 'date-fns/locale';
import { RolesGuard } from './common/guards/roles.guard';
import flash from 'connect-flash';
import { ForbiddenExceptionFilter } from './common/filters/forbidden-exception.filter';
import { InternalServerErrorExceptionFilter } from './common/filters/internal-server-error.filter';
import { NotFoundExceptionFilter } from './common/filters/not-found-exception.filter';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';
import connectPgSimple from 'connect-pg-simple';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global filters
  app.useGlobalFilters(new InternalServerErrorExceptionFilter())
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

  // Konfigurasi Handlebars dengan engine()
  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: join(process.cwd(), 'src', 'views', 'layouts'),
      partialsDir: join(process.cwd(), 'src', 'views', 'partials'),
      helpers: {
        // Helper untuk perhitungan
        addOne: (index: number) => index + 1,
        check: (a: number, b: number) => a < b,
        eq: (a: any, b: any) => a == b,
        gte: (a: number, b: number) => a >= b,
        gt: (a: number, b: number) => a > b,
        multiply: (a: number, b: number) => a * b,
        divide: (a: number, b: number) => (b !== 0 ? a / b : 0),
        subtract: (a: number, b: number) => a - b,

        // Helper untuk array
        isArray: (value: any) => Array.isArray(value),
        array: function (...args: any[]) {
          return args.slice(0, -1);
        },
        lookup: (str: any[], index: number) => str[index],

        // Helper untuk string
        substring: (str: string, start: number, end: number) => {
          if (str && typeof str === 'string') {
            return str.substring(start, end).toUpperCase();
          }
          return '';
        },
        truncate: (text: string, length: number) => {
          if (!text) return '';
          const str = text.toString();
          if (str.length <= length) return str;
          return str.substring(0, length) + '...';
        },
        nl2br: (text: string) => {
          if (!text) return '';
          const escaped = Handlebars.escapeExpression(text);
          return new Handlebars.SafeString(escaped.replace(/\n/g, '<br>'));
        },
        startsWith: (str: string, prefix: string) => {
          if (!str || typeof str !== 'string') return false;
          return str.startsWith(prefix);
        },

        // Helper untuk tanggal dan waktu
        formDate: (date: Date) => new Date(date).toISOString().split('T')[0],
        formatDate: (date: Date) => {
          if (!date) return '';
          const d = new Date(date);
          const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          };
          return d.toLocaleDateString('en-US', options);
        },
        formatTanggal: (tanggal: string, lang: string) => {
          if (!tanggal) {
            return 'Not set';
          }

          let locale;

          switch (lang) {
            case 'id':
              locale = id;
              break;
            case 'en':
              locale = enUS;
              break;
            case 'ja':
              locale = ja;
              break;
            default:
              locale = id;
          }

          return format(new Date(tanggal), 'EEEE, d MMMM yyyy', { locale });
        },
        formatTime: (waktu: string) => waktu.slice(0, 5),
        formatMinutes: (ms: number) => Math.floor(ms / 60000),

        // Helper untuk logika bisnis
        isNowBetween: (
          tanggal: string,
          waktu_awal: string,
          waktu_akhir: string,
        ) => {
          const now = new Date();
          const start = new Date(`${tanggal}T${waktu_awal}`);
          const end = new Date(`${tanggal}T${waktu_akhir}`);
          return now >= start && now <= end;
        },
        hasUserAbsen: (absenList: any[], userId: string) => {
          if (!absenList || !Array.isArray(absenList)) {
            return false;
          }
          return absenList.some(
            (absen) => absen.user && absen.user.id === userId,
          );
        },
        roles: (userRole: string, ...roles: string[]) => {
          const allowedRoles = roles.slice(0, -1);
          return allowedRoles.includes(userRole);
        },

        hasRole: (user: any, role: string, options: any) => {
          if (user && user.role === role) {
            return options.fn(this);
          }
          return options.inverse(this);
        },
        hasAnyRole: (user: any, roles: string[], options: any) => {
          if (user && roles.includes(user.role)) {
            return options.fn(this);
          }
          return options.inverse(this);
        },

        formatRupiah: (angka: number) => {
          if (angka == null || angka === undefined) {
            return 'Not set';
          }
          return angka.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          });
        },

        computeIcon: (iconValue: string) => {
          const raw = (iconValue || '').toString().trim();
          if (!raw) return 'fa-solid fa-circle-question';

          const v = raw;
          const hasFaPrefix =
            /\b(fa|fas|far|fal|fad|fab|fa-solid|fa-regular|fa-light|fa-duotone)\b/i.test(
              v,
            ) || v.split(/\s+/).some((s: string) => /^fa-/i.test(s));

          if (hasFaPrefix) {
            if (/^fa-\w+/i.test(v) && !/\s+/.test(v)) return 'fa-solid ' + v;
            return v;
          }

          if (!v.includes(' ')) return 'fa-solid fa-' + v;
          return v;
        },

        json: (context: any) => JSON.stringify(context),
        t: (key: string) => {
          try {
            const i18n = I18nContext.current();
            if (i18n) {
              return i18n.t(key);
            }
          } catch (e) {}
          return key;
        },
        isJSON: (str: string) => {
          if (!str || typeof str !== 'string') return false;
          try {
            JSON.parse(str);
            return true;
          } catch (e) {
            return false;
          }
        },
        jsonToText: (jsonStr: string) => {
          if (!jsonStr || typeof jsonStr !== 'string') return '';
          try {
            const data = JSON.parse(jsonStr);
            if (data.html) {
              return data.html
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .trim();
            } else if (data.text) {
              return data.text;
            }
            return '';
          } catch (e) {
            return jsonStr;
          }
        },

        default: (value: any, defaultValue: any) => value || defaultValue,
        getByLang: (obj: any, lang: string) => {
          if (!obj || typeof obj !== 'object') return '';
          return obj[lang] || obj['id'] || '';
        },
      },
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
            tableName: 'session',
            createTableIfMissing: true,
        }),
      secret: 'rahasia-super',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 86400000,
      },
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
