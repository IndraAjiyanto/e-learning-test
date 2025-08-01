import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as methodOverride from 'method-override';
import * as hbs from 'hbs';
import * as session from 'express-session';
import * as passport from 'passport';

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
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
