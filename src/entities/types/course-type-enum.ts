export type CourseTypeEnum = 'hacker' | 'hipster' | 'hustler';

export const COURSE_TYPE_ENUM_VALUES: CourseTypeEnum[] = [
  'hacker',
  'hipster',
  'hustler',
];

export const COURSE_TYPE_BADGE_BG: Record<CourseTypeEnum, string> = {
  hacker: '#DCFCE7', // hijau
  hipster: '#FEF3C7', // kuning
  hustler: '#DBEAFE', // biru
};

export const COURSE_TYPE_BADGE_TEXT: Record<CourseTypeEnum, string> = {
  hacker: '#166534', // hijau gelap
  hipster: '#92400E', // kuning gelap
  hustler: '#1E40AF', // biru gelap
};

export const COURSE_TYPE_BADGE_BORDER: Record<CourseTypeEnum, string> = {
  hacker: '#16A34A', // hijau
  hipster: '#F59E0B', // kuning
  hustler: '#3B82F6', // biru
};
