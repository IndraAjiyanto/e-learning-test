import { BadRequestException } from '@nestjs/common';

// Cermin aturan di form/social/form.hbs. Tidak ada ValidationPipe global, jadi
// dekorator di CreateSocialDto tidak pernah dijalankan; aturan ini dipanggil
// langsung dari SocialService agar request yang melewati form tetap tertolak.

const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 15;
const ADDRESS_MIN = 10;
const ADDRESS_MAX = 500;
const URL_MAX = 2048;
const EMAIL_MAX = 254;

// Label domain standar + TLD 2-10 huruf, sehingga "gmail.comasdasd..." tertolak.
const EMAIL_PATTERN =
  /^[a-z0-9._%+-]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,10}$/i;

// Penyedia umum wajib memakai domain aslinya: "gmail.comx" tetap tertolak.
const EMAIL_PROVIDERS: Record<string, string[]> = {
  gmail: ['gmail.com'],
  yahoo: ['yahoo.com', 'yahoo.co.id'],
  outlook: ['outlook.com', 'outlook.co.id'],
  hotmail: ['hotmail.com'],
  icloud: ['icloud.com'],
};

const isEmail = (value: string) => {
  if (value.length > EMAIL_MAX || !EMAIL_PATTERN.test(value)) return false;
  const domain = value.split('@')[1].toLowerCase();
  const allowed = EMAIL_PROVIDERS[domain.split('.')[0]];
  return !allowed || allowed.includes(domain);
};
const PHONE_PATTERN = /^\+?[\d\s().-]+$/;

export const SOCIAL_FIELDS = [
  'linkedin',
  'instagram',
  'youtube',
  'videoYoutube',
  'email',
  'number',
  'address',
  'linkAddress',
  'linkForm',
] as const;

export type SocialField = (typeof SOCIAL_FIELDS)[number];
export type SocialInput = Record<SocialField, string>;

// new URL() menerima skema apa pun dan menormalkan "https:www.x.com", jadi
// awalan http(s):// dicek pada teks mentahnya.
const parseUrl = (value: string): URL | null => {
  if (value.length > URL_MAX || !/^https?:\/\/\S+$/i.test(value)) return null;
  try {
    const url = new URL(value);
    return url.hostname.includes('.') ? url : null;
  } catch {
    return null;
  }
};

const hostIs = (value: string, ...domains: string[]) => {
  const host = parseUrl(value)?.hostname.toLowerCase();
  return !!host && domains.some((d) => host === d || host.endsWith('.' + d));
};

const isMapsUrl = (value: string) => {
  const url = parseUrl(value);
  if (!url) return false;
  const host = url.hostname.toLowerCase();
  if (host === 'maps.app.goo.gl') return true;
  if (host === 'goo.gl') return url.pathname.startsWith('/maps');
  if (/^maps\.google\.[a-z.]+$/.test(host)) return true;
  return (
    /^(www\.)?google\.[a-z.]+$/.test(host) && url.pathname.startsWith('/maps')
  );
};

const urlError = (
  label: string,
  val: string,
  domains: string[],
): string | null => {
  if (!val) return `${label} is required`;
  if (!parseUrl(val)) return `${label} must be a valid URL`;
  if (domains.length && !hostIs(val, ...domains)) {
    return `Please enter a valid ${label}`;
  }
  return null;
};

const errorFor = (field: SocialField, val: string): string | null => {
  switch (field) {
    case 'linkedin':
      return urlError('LinkedIn URL', val, ['linkedin.com']);
    case 'instagram':
      return urlError('Instagram URL', val, ['instagram.com']);
    case 'youtube':
      return urlError('YouTube URL', val, ['youtube.com', 'youtu.be']);
    case 'videoYoutube':
      return urlError('YouTube Video URL', val, ['youtube.com', 'youtu.be']);
    case 'linkForm':
      return urlError('Job Form Link', val, []);
    case 'linkAddress':
      if (!val) return 'Google Maps link is required';
      if (!isMapsUrl(val)) return 'Please enter a valid Google Maps link';
      return null;
    case 'email':
      if (!val) return 'Email is required';
      if (!isEmail(val)) {
        return 'Please enter a valid email address';
      }
      return null;
    case 'number': {
      if (!val) return 'Phone number is required';
      if (!PHONE_PATTERN.test(val)) return 'Please enter a valid phone number';
      const digits = val.replace(/\D/g, '').length;
      if (digits < PHONE_MIN_DIGITS || digits > PHONE_MAX_DIGITS) {
        return `Phone number must have ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digits`;
      }
      return null;
    }
    case 'address':
      if (val.length < ADDRESS_MIN || val.length > ADDRESS_MAX) {
        return `Address must be ${ADDRESS_MIN}-${ADDRESS_MAX} characters`;
      }
      return null;
  }
};

export function validateSocial(input: object) {
  const source = input as Partial<Record<SocialField, unknown>>;
  const clean = {} as SocialInput;
  for (const field of SOCIAL_FIELDS) {
    const raw = source[field];
    const val = typeof raw === 'string' ? raw.trim() : '';
    const error = errorFor(field, val);
    if (error) throw new BadRequestException(error);
    clean[field] = val;
  }
  return clean;
}
