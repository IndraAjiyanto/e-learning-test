import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
import { AppModule } from './app.module';
import methodOverride from 'method-override';
import hbs from 'hbs';
import session from 'express-session';
import passport from 'passport';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { RolesGuard } from './common/guards/roles.guard';
import flash from 'connect-flash';
import { ForbiddenExceptionFilter } from './common/filters/forbidden-exception.filter';
import { NotFoundExceptionFilter } from './common/filters/not-found-exception.filter';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new ForbiddenExceptionFilter());
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.useStaticAssets(join(__dirname, '..', 'src', 'common', 'public'), {
    prefix: '/public/',
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  hbs.registerHelper('addOne', function (index: number) {
    return index + 1;
  });
  hbs.registerHelper('formDate', function (date) {
    return new Date(date).toISOString().split('T')[0];
  });

  app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const i18n = req.i18n;
    res.locals.t = (key: string) => i18n?.t(key);
    next();
  });

  app.use((req, res, next) => {
  console.log("REQ I18N: ", req.i18n);
  next();
});


  hbs.registerHelper(
    'isNowBetween',
    function (tanggal: string, waktu_awal: string, waktu_akhir: string) {
      const now = new Date();

      const start = new Date(`${tanggal}T${waktu_awal}`);
      const end = new Date(`${tanggal}T${waktu_akhir}`);

      return now >= start && now <= end;
    },
  );

  hbs.registerHelper('lookup', function (str, index) {
    return str[index];
  });

  hbs.registerHelper('formatTanggal', function (tanggal: string) {
    if (!tanggal) {
      return 'Not set';
    }
    return format(new Date(tanggal), 'EEEE, d MMMM yyyy', { locale: id });
  });

  hbs.registerHelper('formatTime', function (waktu: string) {
    return waktu.slice(0, 5);
  });

  hbs.registerHelper('hasUserAbsen', function (absenList, userId) {
    if (!absenList || !Array.isArray(absenList)) {
      return false;
    }

    return absenList.some((absen) => {
      return absen.user && absen.user.id === userId;
    });
  });

  hbs.registerHelper('formatRupiah', function (angka: number) {
    if (angka == null || angka === undefined) {
      return 'Not set';
    }
    return angka.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    });
  });

  hbs.registerHelper('roles', function (userRole, ...roles) {
    // Remove the last argument which is the options object
    const allowedRoles = roles.slice(0, -1);
    return allowedRoles.includes(userRole);
  });
  hbs.registerHelper('check', (a, b) => a < b);
  hbs.registerHelper('eq', (a, b) => a == b);
  hbs.registerHelper('gte', (a, b) => a >= b);
  hbs.registerHelper('gt', (a, b) => a > b);
  hbs.registerHelper('multiply', (a, b) => a * b);
  hbs.registerHelper('divide', (a, b) => (b !== 0 ? a / b : 0));
  hbs.registerHelper('subtract', (a, b) => a - b);
  hbs.registerHelper('isArray', (value) => Array.isArray(value));
  hbs.registerHelper('substring', (str, start, end) => {
    if (str && typeof str === 'string') {
      return str.substring(start, end).toUpperCase();
    }
    return '';
  });

  hbs.registerHelper('computeIcon', function (iconValue) {
    const raw = (iconValue || '').toString().trim();
    if (!raw) return 'fa-solid fa-circle-question';

    const v = raw;
    const hasFaPrefix =
      /\b(fa|fas|far|fal|fad|fab|fa-solid|fa-regular|fa-light|fa-duotone)\b/i.test(
        v,
      ) || v.split(/\s+/).some((s) => /^fa-/i.test(s));

    if (hasFaPrefix) {
      if (/^fa-\w+/i.test(v) && !/\s+/.test(v)) return 'fa-solid ' + v;
      return v;
    }

    if (!v.includes(' ')) return 'fa-solid fa-' + v;
    return v;
  });

  hbs.registerHelper('truncate', function (text, length) {
    if (!text) return '';
    const str = text.toString();
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  });

  hbs.registerHelper('formatDate', function (date) {
    if (!date) return '';
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return d.toLocaleDateString('en-US', options);
  });

  hbs.registerPartials(resolve(process.cwd(), 'src', 'views', 'partials'));
  app.setViewEngine('hbs');

  app.set('view options', { layout: 'layouts/main' });
  app.use(methodOverride('_method'));
  app.use(
    session({
      secret: 'rahasia-super',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 },
    }),
  );
  app.use(flash());

  app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    next();
  });

  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalGuards(new RolesGuard(app.get(Reflector)));

  hbs.registerHelper('hasRole', function (user, role, options) {
    if (user && user.role === role) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  hbs.registerHelper('hasAnyRole', function (user, roles, options) {
    if (user && roles.includes(user.role)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  hbs.registerHelper('array', function (...args) {
    return args.slice(0, -1);
  });
  hbs.registerHelper('json', (context) => JSON.stringify(context));

  hbs.registerHelper('t', function (key: string, options) {
    const t = options.data.root.t;
    return t ? t(key) : key;
  });


  // Helper untuk convert newline ke <br> tag
  hbs.registerHelper('nl2br', function (text) {
    if (!text) return '';
    const escaped = hbs.Utils.escapeExpression(text);
    return new hbs.SafeString(escaped.replace(/\n/g, '<br>'));
  });

  // Helper untuk check if string is valid JSON
  hbs.registerHelper('isJSON', function (str) {
    if (!str || typeof str !== 'string') return false;
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  });

  // Helper untuk convert TinyMCE JSON to plain text
  hbs.registerHelper('jsonToText', function (jsonStr) {
    if (!jsonStr || typeof jsonStr !== 'string') return '';
    try {
      const data = JSON.parse(jsonStr);
      if (data.html) {
        // Remove HTML tags and decode entities
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
      return jsonStr; // Return as-is if not JSON
    }
  });

  // Helper untuk default value
  hbs.registerHelper('default', function (value, defaultValue) {
    return value || defaultValue;
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
