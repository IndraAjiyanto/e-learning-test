import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import methodOverride from 'method-override';
import hbs from 'hbs';
import session from 'express-session';
import passport from 'passport';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { RolesGuard } from './common/guards/roles.guard';
import  flash from 'connect-flash';
import { ForbiddenExceptionFilter } from './common/filters/forbidden-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

   app.useGlobalFilters(new ForbiddenExceptionFilter());
  app.useStaticAssets(join(__dirname, '..', 'src', 'common','public'), {
    prefix: '/public/'
  });

    app.useStaticAssets(join(__dirname, '..', 'node_modules/reveal.js'), {
    prefix: '/reveal',
  });

  app.useStaticAssets(join(__dirname, '..','uploads'), {
    prefix: '/uploads/'
  });
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.setViewEngine('hbs');
  hbs.registerHelper('addOne', function (index: number) {
  return index + 1;
});
hbs.registerHelper('formDate', function(date) {
  return new Date(date).toISOString().split('T')[0];
});
hbs.registerHelper('isNowBetween', function (tanggal: string, waktu_awal: string, waktu_akhir: string) {
  const now = new Date();

  const start = new Date(`${tanggal}T${waktu_awal}`);
  const end = new Date(`${tanggal}T${waktu_akhir}`);

  return now >= start && now <= end;
});



  hbs.registerHelper('formatTanggal', function (tanggal: string) {
    return format(new Date(tanggal), 'EEEE, d MMMM yyyy', { locale: id });
  });

hbs.registerHelper("formatTime", function (waktu: string) {
  return waktu.slice(0,5);
});

hbs.registerHelper('hasUserAbsen', function(absenList, userId) {
  if (!absenList || !Array.isArray(absenList)) {
    return false;
  }
  
  return absenList.some(absen => {
    return absen.user && absen.user.id === userId;
  });
});

  hbs.registerHelper('roles', (a, b) => a === b);
  hbs.registerPartials(join(__dirname, '..', 'src','views', 'partials'));
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
hbs.registerHelper("json", (context) => JSON.stringify(context));


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
