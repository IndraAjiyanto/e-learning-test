import { format } from 'date-fns';
import { enUS, id, ja } from 'date-fns/locale';

export const dateHelpers = {
  formDate: (date: Date) => new Date(date).toISOString().split('T')[0],
  formatDate: (date: string | Date, lang?: string) => {
    if (!date) return lang ? 'Not set' : '';
    if (lang) {
      let locale;
      switch (lang) {
        case 'id':
          locale = id;
          break;
        case 'en':
          locale = enUS;
          break;
        case 'ja':
          locale = ja;
          break;
        default:
          locale = id;
      }
      return format(new Date(date), 'EEEE, d MMMM yyyy', { locale });
    }
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return d.toLocaleDateString('en-US', options);
  },
  formatTime: (waktu: string) => (waktu ? waktu.slice(0, 5) : '-'),
  formatMinutes: (ms: number) => Math.floor(ms / 60000),
};
