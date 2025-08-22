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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.useStaticAssets(join(__dirname, '..','src', 'common','public'), {
    prefix: '/public/'
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
hbs.registerHelper('isNowBetween', function(tanggal, waktu_mulai, waktu_akhir, options) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (todayStr !== tanggal) {
    return options.inverse(this);
  }

  const start = new Date(`${tanggal}T${waktu_mulai}`);
  const end = new Date(`${tanggal}T${waktu_akhir}`);

  if (now >= start && now <= end) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});


  hbs.registerHelper('formatTanggal', function (tanggal: string) {
    return format(new Date(tanggal), 'EEEE, d MMMM yyyy', { locale: id });
  });
  hbs.registerHelper('isSameUser', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
