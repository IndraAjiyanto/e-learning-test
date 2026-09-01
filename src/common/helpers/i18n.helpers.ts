import { I18nContext } from 'nestjs-i18n';

export const i18nHelpers = {
  t: (key: string) => {
    try {
      const i18n = I18nContext.current();
      if (i18n) {
        return i18n.t(key);
      }
    } catch (e) {}
    return key;
  },
};
