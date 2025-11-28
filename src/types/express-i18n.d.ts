import { I18nContext } from 'nestjs-i18n';

declare module 'express-serve-static-core' {
  interface Request {
    i18n?: I18nContext;
  }
}
