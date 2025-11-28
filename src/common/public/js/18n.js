import * as hbs from 'hbs';
import * as handlebarsI18n from 'handlebars-i18n';

export function registerI18n(i18nObject) {
  handlebarsI18n(hbs, i18nObject);
}
