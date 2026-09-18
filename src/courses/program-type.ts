import { ProgramType } from 'src/entities/course.entity';

/**
 * Terjemahan SATU-SATUNYA dari tipe program menjadi perilaku.
 *
 * Aturannya: kode di luar berkas ini TIDAK PERNAH membandingkan
 * `course.programType` dengan nilai tertentu. Kalau ia bercabang langsung di
 * empat puluh tempat, maka saat Japan Pathway mulai berbeda dari bootcamp,
 * keempat puluh tempat itu harus dicari ulang satu per satu. Di sini
 * cabangnya ada satu, dan sisanya membaca kapabilitas.
 *
 * Lihat docs/program-type-plan.md bagian 4.
 */
export interface ProgramCapabilities {
  /** 'weeks' menampilkan kepala minggu; 'syllabus' menampilkan sesi datar. */
  structure: 'weeks' | 'syllabus';
  /** Satuan yang dibuka berurutan. */
  unlockUnit: 'week' | 'session';
  /** Apakah admin boleh mematikan logbook pada program ini. */
  logbookConfigurable: boolean;
  /** Di mana kuis dipasang: per minggu, atau satu untuk seluruh program. */
  quizScope: 'week' | 'program';
  /** Kata yang dipakai di antarmuka untuk satu wadah urutan. */
  unitLabel: 'week' | 'syllabus';
  /**
   * 'self_paced' = SPL, student jalan sendiri tanpa jadwal pendampingan.
   * 'guided'     = ada pendampingan intensif.
   */
  pacing: 'self_paced' | 'guided';
  /**
   * Siapa yang mendampingi. Inilah satu-satunya tempat Bootcamp dan Japan
   * Pathway berbeda hari ini; sengaja sudah punya namanya sendiri supaya saat
   * perbedaannya dipakai tidak perlu dicari-cari lagi.
   */
  mentorship: 'none' | 'mentor' | 'sensei';
}

const BOOTCAMP: ProgramCapabilities = {
  structure: 'weeks',
  unlockUnit: 'week',
  logbookConfigurable: false,
  quizScope: 'week',
  unitLabel: 'week',
  pacing: 'guided',
  mentorship: 'mentor',
};

const NON_BOOTCAMP: ProgramCapabilities = {
  // Starter Class dan Faster Class sama-sama masuk sini; bedanya cuma harga,
  // dan harga dijawab category.type, bukan berkas ini.
  structure: 'syllabus',
  unlockUnit: 'session',
  logbookConfigurable: true,
  // Opsi A pada rencana: silabus adalah Session di dalam satu Weeks tersirat,
  // jadi kuis tetap punya rumah tanpa perubahan skema - hanya artinya yang
  // berubah, dari kuis minggu menjadi kuis program.
  quizScope: 'program',
  unitLabel: 'syllabus',
  pacing: 'self_paced',
  mentorship: 'none',
};

// Japan Pathway. Isinya hari ini sama dengan bootcamp kecuali `mentorship`.
const LPK: ProgramCapabilities = { ...BOOTCAMP, mentorship: 'sensei' };

export function capabilitiesFor(
  type?: ProgramType | null,
): ProgramCapabilities {
  switch (type) {
    case 'non_bootcamp':
      return NON_BOOTCAMP;
    case 'lpk':
      return LPK;
    case 'bootcamp':
    default:
      return BOOTCAMP;
  }
}

/**
 * Bentuk ringkas untuk dikirim ke Handlebars. Template cukup menulis
 * `{{#if (eq caps.structure 'syllabus')}}` dan tidak pernah menyebut nama tipe
 * programnya.
 */
export function capabilitiesForCourse(course?: {
  programType?: ProgramType | null;
  logbookEnabled?: boolean | null;
} | null): ProgramCapabilities & { logbookEnabled: boolean } {
  const caps = capabilitiesFor(course?.programType);
  return {
    ...caps,
    // Kolomnya ada di semua program, tetapi hanya berarti pada program yang
    // memang boleh mematikannya. Pada bootcamp dan LPK logbook selalu menyala,
    // apa pun isi kolomnya - supaya data lama yang tidak sengaja bernilai
    // false tidak diam-diam mematikan logbook sebuah bootcamp.
    logbookEnabled: caps.logbookConfigurable
      ? course?.logbookEnabled !== false
      : true,
  };
}
