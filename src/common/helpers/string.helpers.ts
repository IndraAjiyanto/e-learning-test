import Handlebars from 'handlebars';

export const stringHelpers = {
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
  isArray: (value: any) => Array.isArray(value),
  array: function (...args: any[]) {
    return args.slice(0, -1);
  },
  lookup: (str: any[], index: number) => (str ? str[index] : ''),
  json: (context: any) => JSON.stringify(context),
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
  concat: function (...args: any[]) {
    // Remove the Handlebars options object from the end
    const strings = args.slice(0, -1);
    return strings.join('');
  },
};
