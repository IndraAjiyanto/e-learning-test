/**
 * Agregator 1 pintu untuk semua Handlebars helpers
 * Server: import { hbsHelpers } from './common/helpers'
 * Client (isomorphic): import { formatWa, waLink } from './common/helpers/wa.helper'
 */
import { waHelpers } from './wa.helper';
import { stringHelpers } from './string.helpers';
import { dateHelpers } from './date.helpers';
import { numberHelpers } from './number.helpers';
import { logicHelpers } from './logic.helpers';
import { i18nHelpers } from './i18n.helpers';

export const hbsHelpers = {
  ...waHelpers,
  ...stringHelpers,
  ...dateHelpers,
  ...numberHelpers,
  ...logicHelpers,
  ...i18nHelpers,
};

export * from './wa.helper';
export * from './string.helpers';
export * from './date.helpers';
export * from './number.helpers';
export * from './logic.helpers';
export * from './i18n.helpers';

export default hbsHelpers;
