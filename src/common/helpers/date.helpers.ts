import { format } from 'date-fns';
import { enUS, id, ja } from 'date-fns/locale';

export const dateHelpers = {
  formDate: (date: string | Date | null | undefined): string => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fr-CA').format(d);
  },
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
  /**
   * Mengubah string tanggal (YYYY-MM-DD, dari kolom date) menjadi Date lokal
   * pada tengah malam, supaya bisa dibandingkan dengan `today` tanpa
   * pengaruh zona waktu / jam.
   */
  toLocalDate: (dateStr: string): Date => {
    const d = new Date(`${dateStr}T00:00:00`);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  /**
   * Normalisasi array dueDates (kolom date[]) menjadi string YYYY-MM-DD mentah.
   * Driver Postgres mengubah elemen date[] menjadi objek Date yang, saat
   * diserialisasi, menjadi string ISO UTC (mis. "2026-09-07T17:00:00.000Z")
   * sehingga tanggal terlihat bergeser. Helper ini memakai komponen tanggal
   * lokal server supaya nilai yang dikirim sama persis dengan yang di-set admin.
   */
  toDateOnlyArray: (values: (string | Date)[] | null | undefined): string[] => {
    if (!values) return [];
    return values.map((v) => {
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      const d = typeof v === 'string' ? new Date(v) : v;
      if (isNaN(d.getTime())) return String(v);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    });
  },
  /**
   * FALLBACK untuk cicilan lama: menghitung tanggal tenggat cicilan bulan ke-N
   * relatif dari tanggal pembayaran DP (`from`), mempertahankan hari pada `from`.
   */
  getMonthlyDueDate: (from: Date, month: number, dueDay: number): Date => {
    const base = new Date(from);
    base.setHours(0, 0, 0, 0);
    const targetMonth = base.getMonth() + month;
    const lastDayOfMonth = new Date(
      base.getFullYear(),
      targetMonth + 1,
      0,
    ).getDate();
    const day = Math.min(Math.max(1, dueDay), lastDayOfMonth);
    return new Date(base.getFullYear(), targetMonth, day);
  },
};
