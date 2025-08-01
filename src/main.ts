import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as methodOverride from 'method-override';
import * as hbs from 'hbs';
import * as session from 'express-session';
import * as passport from 'passport';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.useStaticAssets(join(__dirname, '..','src', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.setViewEngine('hbs');
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
