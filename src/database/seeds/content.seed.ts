import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { Benefit } from 'src/entities/benefit.entity';
import { Category } from 'src/entities/category.entity';
import { Alumni } from 'src/entities/alumni.entity';
import { CategoryPartner } from 'src/entities/category_partner.entity';
import { Partner } from 'src/entities/partner.entity';
import { Gallery } from 'src/entities/gallery.entity';
import { Faq } from 'src/entities/faq.entity';
import { Social } from 'src/entities/social.entity';
import { Vision } from 'src/entities/visions.entity';
import { Mission } from 'src/entities/mission.entity';
import { Commitment } from 'src/entities/commitment.entity';
import { Value } from 'src/entities/value.entity';
import { Paragraph } from 'src/entities/paragraph.entity';
import { Team } from 'src/entities/team.entity';
import { TeamLead } from 'src/entities/team_lead.entity';
import { Background } from 'src/entities/background.entity';
import { Experience } from 'src/entities/experience.entity';

// Multi-language jsonb helper: getByLang() reads obj[lang] || obj['id'].
// Cast to any: entity columns are typed string[] but the app stores {id,en,ja} objects.
const L = (id: string, en: string, ja: string): any => ({ id, en, ja });
const PHOTO = '/public/image/about/orang.png';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  const benefitRepo = ds.getRepository(Benefit);
  if ((await benefitRepo.count()) > 0) {
    console.log('content.seed: benefit table not empty, skipping. Clear the DB to re-seed.');
    await app.close();
    return;
  }

  // --- Social (footer + contact) ---
  await ds.getRepository(Social).save({
    linkedin: 'https://www.linkedin.com/company/kesatria-academy',
    instagram: 'https://www.instagram.com/kesatriaacademy',
    youtube: 'https://www.youtube.com/@kesatriaacademy',
    videoYoutube: 'https://youtu.be/Ft3UMrgTDpc',
    linkForm: 'https://forms.gle/kesatria',
    email: 'kesatriaacademy@gmail.com',
    address:
      'Jl. S. Parman No.62, RT.002/RW.002, Karangbawang, Purwokerto Kulon, Kec. Purwokerto Sel., Kabupaten Banyumas, Jawa Tengah 53141',
    number: '+62 896 4683 4607',
    linkAddress: 'https://maps.google.com/?q=Kesatria+Academy+Purwokerto',
  });

  // --- Benefit (Why Choose, no 1..5) ---
  await ds.getRepository(Benefit).save([
    {
      no: 1,
      icon: 'fa-gift',
      title: L('Kelas Percobaan Gratis', 'Free Trial Class', '無料体験クラス'),
      description: L(
        'Rasakan langsung suasana belajar terstruktur kami. Coba satu kelas sepenuhnya gratis sebelum memutuskan.',
        'Experience our structured learning atmosphere firsthand. Try a class completely free before committing.',
        '構造化された学習環境をまず体験。受講前に1クラスを完全無料でお試しいただけます。',
      ),
    },
    {
      no: 2,
      icon: 'fa-user-tie',
      title: L('Bimbingan Ahli', 'Expert Guidance', '専門家による指導'),
      description: L(
        'Belajar dari praktisi industri aktif di perusahaan teknologi terkemuka. Dapatkan tools relevan dan wawasan fungsional yang mendalam.',
        'Learn from active industry professionals working at top tech firms. Gain relevant tools and deep functional insights.',
        '大手テック企業で活躍する現役実務者から学ぶ。実践的なツールと深い知見が得られます。',
      ),
    },
    {
      no: 3,
      icon: 'fa-briefcase',
      title: L('Dukungan Karier', 'Career Support', 'キャリアサポート'),
      description: L(
        'Tim talenta kami membantu penyusunan portofolio, perbaikan resume, dan mengarahkanmu langsung ke jalur rekrutmen.',
        'Our talent team assists in portfolio building, resume polishing, and guides you straight into recruitment pipelines.',
        'タレントチームがポートフォリオ作成、履歴書の改善、採用パイプラインへの橋渡しを支援します。',
      ),
    },
    {
      no: 4,
      icon: 'fa-diagram-project',
      title: L('Proyek Nyata', 'Real-World Projects', '実践プロジェクト'),
      description: L(
        'Kerjakan studi kasus dan proyek nyata yang mencerminkan tantangan industri sesungguhnya.',
        'Work on case studies and real projects that mirror genuine industry challenges.',
        '実際の業界課題を反映したケーススタディと実プロジェクトに取り組みます。',
      ),
    },
    {
      no: 5,
      icon: 'fa-certificate',
      title: L('Sertifikat Diakui', 'Recognized Certification', '認定資格'),
      description: L(
        'Selesaikan program dan dapatkan sertifikat yang diakui industri sebagai bukti kompetensimu.',
        'Complete the program and earn an industry-recognized certificate as proof of your competency.',
        'プログラムを修了し、能力の証明として業界に認められた修了証を取得できます。',
      ),
    },
  ]);

  // --- Category (Programs, 4 cards) ---
  await ds.getRepository(Category).save([
    {
      name: 'Bootcamp',
      icon: '/public/image/dashboard/bootcamp.png',
      hero_section_image: '/public/image/dashboard/bgHeroSection.png',
      contact: '+62 896 4683 4607',
      type: 'Special Program',
      text: L(
        'Program intensif 3-6 bulan untuk menjadi talenta digital siap kerja.',
        'Intensive 3-6 month program to become job-ready digital talent.',
        '3〜6か月の集中プログラムで即戦力のデジタル人材へ。',
      ),
      description: L(
        'Kurikulum berbasis proyek dengan mentoring dari praktisi industri, ditutup dengan capstone project dan penyaluran karier.',
        'Project-based curriculum with mentoring from industry practitioners, capped by a capstone project and career placement.',
        'プロジェクトベースのカリキュラムと実務者によるメンタリング、キャップストーンとキャリア支援で締めくくります。',
      ),
    },
    {
      name: 'Short Class',
      icon: '/public/image/dashboard/short.png',
      hero_section_image: '/public/image/dashboard/bgHeroSection.png',
      contact: '+62 896 4683 4607',
      type: 'Paid Program',
      text: L(
        'Kelas singkat fokus satu skill, selesai dalam hitungan pekan.',
        'Short focused classes on a single skill, finished in weeks.',
        '単一スキルに特化した短期クラス、数週間で修了。',
      ),
      description: L(
        'Cocok untuk profesional yang ingin cepat menambah kemampuan spesifik tanpa komitmen panjang.',
        'Ideal for professionals who want to quickly add a specific skill without a long commitment.',
        '長期のコミットなしに特定スキルを素早く習得したい社会人に最適です。',
      ),
    },
    {
      name: 'In House Training',
      icon: '/public/image/dashboard/inhouse.png',
      hero_section_image: '/public/image/dashboard/bgHeroSection.png',
      contact: '+62 896 4683 4607',
      type: 'Special Program',
      text: L(
        'Pelatihan korporat yang disesuaikan dengan kebutuhan tim Anda.',
        'Corporate training tailored to your team needs.',
        'チームのニーズに合わせた企業研修。',
      ),
      description: L(
        'Materi, jadwal, dan studi kasus disesuaikan dengan roadmap teknis organisasi Anda.',
        'Curriculum, schedule, and case studies adjusted to your organization technical roadmap.',
        'カリキュラム・日程・ケーススタディを御社の技術ロードマップに合わせます。',
      ),
    },
    {
      name: 'Wiratek Internship Program',
      icon: '/public/image/dashboard/wip.png',
      hero_section_image: '/public/image/dashboard/bgHeroSection.png',
      contact: '+62 896 4683 4607',
      type: 'Free Program',
      text: L(
        'Program magang untuk mahasiswa dan fresh graduate bersama Kesatria Academy.',
        'Internship program for students and fresh graduates with Kesatria Academy.',
        '学生・新卒向けのインターンシッププログラム。',
      ),
      description: L(
        'Pengalaman kerja nyata pada proyek klien dengan bimbingan mentor senior.',
        'Real work experience on client projects with senior mentor guidance.',
        'シニアメンターの指導のもと、クライアント案件で実務経験を積みます。',
      ),
    },
  ]);

  // --- Alumni (testimonials, take 6) ---
  const alumniMsgs: [string, string, string, string][] = [
    [
      'Rangga Pratama',
      'Frontend Engineer at Tokopedia',
      'Terus jaga budaya mentorship yang rendah hati namun kritis. Mentor yang memposisikan diri sebagai partner belajar adalah aset terbesar bootcamp ini.',
      'Continue to foster a culture of mentorship that is humble yet critical. Mentors who can position themselves as learning partners are this bootcamp’s greatest asset.',
    ],
    [
      'Salsabila Nur',
      'Backend Developer at Bank Jago',
      'Saya banyak belajar cara berkomunikasi efektif dalam tim teknis dan mengelola ekspektasi dalam proyek. Soft skill dan etika kerja yang dibahas sangat relevan.',
      'I learned a lot about how to communicate effectively within a tech team and how to manage expectations in projects. The soft skills and work ethics covered are highly relevant.',
    ],
    [
      'Damar Wicaksono',
      'Fullstack Developer at Gojek',
      'Bootcamp ini memberi saya lebih dari sekadar ilmu; saya membangun jaringan profesional yang kuat lewat kolaborasi proyek antar peserta.',
      'This bootcamp gave me more than just knowledge; I built a strong professional network by collaborating with fellow participants on projects.',
    ],
    [
      'Nadia Kusuma',
      'Data Analyst at Bibit',
      'Materi selalu terhubung dengan kasus industri nyata. Saya merasa siap kerja sejak minggu pertama bekerja.',
      'The material was always tied to real industry cases. I felt job-ready from my first week at work.',
    ],
    [
      'Farhan Maulana',
      'QA Engineer at Traveloka',
      'Feedback dari mentor tajam dan membangun. Portofolio yang saya susun di sini langsung dipakai saat wawancara.',
      'Feedback from mentors was sharp and constructive. The portfolio I built here was used directly in interviews.',
    ],
    [
      'Intan Permata',
      'Product Engineer at Dana',
      'Lingkungan belajarnya kolaboratif. Simulasi kerja tim di kelas benar-benar mirip dinamika industri.',
      'The learning environment is collaborative. The teamwork simulations in class really mirror industry dynamics.',
    ],
  ];
  await ds.getRepository(Alumni).save(
    alumniMsgs.map(([name, pos, idMsg, enMsg]) => ({
      profile: PHOTO,
      name: L(name, name, name),
      currentPosition: L(pos, pos, pos),
      message: L(idMsg, enMsg, enMsg),
    })),
  );

  // --- Partners (4 categories + logos) ---
  const partnerRepo = ds.getRepository(Partner);
  const catPartnerRepo = ds.getRepository(CategoryPartner);
  const partnerCats = await catPartnerRepo.save([
    { category: 'Government Institutions' },
    { category: 'Company' },
    { category: 'Institutions' },
    { category: 'BUMN' },
  ]);
  const logo = '/public/image/logo_baru.png';
  for (const pc of partnerCats) {
    await partnerRepo.save([
      { image: logo, categoryPartner: pc },
      { image: logo, categoryPartner: pc },
      { image: logo, categoryPartner: pc },
    ]);
  }

  // --- Gallery (no '1'..'6') ---
  const galleryImgs = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&h=600&fit=crop',
  ];
  await ds.getRepository(Gallery).save(
    galleryImgs.map((filePath, i) => ({
      filePath,
      title: `Kesatria Academy Activity ${i + 1}`,
      description: 'Learning activities, collaboration, and community at Kesatria Academy.',
      no: String(i + 1) as '1' | '2' | '3' | '4' | '5' | '6',
    })),
  );

  // --- FAQ (7 items, questions from Figma) ---
  const faqs: [string, string, string, string][] = [
    [
      'Apa yang akan saya pelajari di bootcamp ini?',
      'What will I learn in this bootcamp?',
      'Anda akan mempelajari fondasi pemrograman, pengembangan aplikasi web modern, kolaborasi tim, hingga penyusunan portofolio yang siap kerja.',
      'You will learn programming fundamentals, modern web application development, team collaboration, and building a job-ready portfolio.',
    ],
    [
      'Apakah bootcamp online atau offline?',
      'Is the bootcamp online or offline?',
      'Tersedia format online maupun offline (di kampus Purwokerto), tergantung program yang Anda pilih.',
      'Both online and offline (at our Purwokerto campus) formats are available, depending on the program you choose.',
    ],
    [
      'Apakah saya perlu pengalaman pemrograman sebelumnya?',
      'Do I need prior programming experience?',
      'Tidak wajib. Program dasar dirancang untuk pemula, dengan pra-materi untuk menyamakan fondasi.',
      'Not required. Our foundational programs are designed for beginners, with pre-course material to level the playing field.',
    ],
    [
      'Apakah saya mendapat sertifikat setelah lulus?',
      'Will I receive a certificate after completing the bootcamp?',
      'Ya. Setiap peserta yang menyelesaikan program menerima sertifikat kelulusan yang diakui industri.',
      'Yes. Every participant who completes the program receives an industry-recognized certificate of completion.',
    ],
    [
      'Bagaimana jika saya melewatkan satu kelas?',
      'What if I miss a class?',
      'Rekaman sesi tersedia, dan Anda dapat menjadwalkan sesi susulan bersama mentor.',
      'Session recordings are available, and you can schedule a catch-up session with a mentor.',
    ],
    [
      'Bagaimana cara mendaftar?',
      'How can I register?',
      'Klik tombol daftar di halaman program pilihan Anda, lengkapi formulir, lalu tim kami akan menghubungi Anda.',
      'Click the register button on your chosen program page, complete the form, and our team will contact you.',
    ],
    [
      'Apakah ada dukungan karier setelah lulus?',
      'Is there career support after graduation?',
      'Ya. Kami membantu penyusunan portofolio, persiapan wawancara, dan menghubungkan Anda dengan mitra perekrut.',
      'Yes. We help with portfolio building, interview preparation, and connecting you with hiring partners.',
    ],
  ];
  await ds.getRepository(Faq).save(
    faqs.map(([qId, qEn, aId, aEn]) => ({
      question: L(qId, qEn, qEn),
      answer: L(aId, aEn, aEn),
    })),
  );

  // --- About: Vision & Mission ---
  await ds.getRepository(Vision).save({
    visions: L(
      'Menjadi institusi pendidikan digital terkemuka yang mencetak talenta teknologi informasi unggul, siap kerja, dan kompetitif secara global untuk mendorong transformasi digital Indonesia.',
      'To become a leading digital education institution that nurtures outstanding information technology talents, job-ready and globally competitive, to drive Indonesia’s digital transformation.',
      'インドネシアのデジタル変革を推進するため、即戦力でグローバルに競争力のある優れたIT人材を育成する、先進的なデジタル教育機関になること。',
    ),
  });
  await ds.getRepository(Mission).save(
    [
      [
        'Menjadi Penyedia Terdepan:',
        'To Become a Leading Provider:',
        'terhadap pendidikan digital yang terus berinovasi seiring perkembangan teknologi informasi.',
        'of digital education that continuously innovates in line with advancements in information technology.',
      ],
      [
        'Mengembangkan SDM Unggul:',
        'To Develop Exceptional Human Resources:',
        'yang memiliki keahlian teknis sekaligus soft skill sesuai kebutuhan industri.',
        'equipped with both technical expertise and soft skills that meet industry demands.',
      ],
      [
        'Menyiapkan Lulusan Siap Kerja:',
        'To Prepare Job-Ready Graduates:',
        'melalui program pembelajaran praktis dan pendampingan profesional.',
        'through practical learning programs and professional mentoring.',
      ],
      [
        'Membangun Generasi Kompetitif Global:',
        'To Build a Globally Competitive Generation:',
        'dengan kompetensi digital yang diakui secara internasional.',
        'with internationally recognized digital competencies.',
      ],
      [
        'Mempercepat Transformasi Digital:',
        'To Accelerate Digital Transformation:',
        'dengan menumbuhkan talenta yang berdampak dan bernilai.',
        'by cultivating impactful and valuable talents.',
      ],
    ].map(([cId, cEn, iId, iEn], idx) => ({
      missionOrder: idx + 1,
      content: L(cId, cEn, cEn),
      items: L(iId, iEn, iEn),
    })),
  );

  // --- About: Values ---
  await ds.getRepository(Value).save(
    [
      ['fa-lightbulb', 'Inovasi', 'Innovation', 'Selalu mencari cara baru yang lebih baik dalam belajar dan mengajar.', 'Always seeking better new ways to learn and teach.'],
      ['fa-handshake', 'Kolaborasi', 'Collaboration', 'Tumbuh bersama melalui kerja sama dan saling berbagi.', 'Growing together through cooperation and sharing.'],
      ['fa-award', 'Keunggulan', 'Excellence', 'Menjaga standar mutu tinggi di setiap program.', 'Maintaining high quality standards in every program.'],
      ['fa-heart', 'Integritas', 'Integrity', 'Jujur, transparan, dan bertanggung jawab.', 'Honest, transparent, and accountable.'],
      ['fa-users', 'Inklusif', 'Inclusive', 'Kesempatan setara untuk semua pembelajar.', 'Equal opportunity for all learners.'],
      ['fa-rocket', 'Berdampak', 'Impact', 'Fokus pada hasil nyata bagi peserta dan industri.', 'Focused on real outcomes for learners and industry.'],
    ].map(([icon, tId, tEn, dId, dEn], idx) => ({
      icon,
      valueOrder: idx + 1,
      title: L(tId, tEn, tEn),
      description: L(dId, dEn, dEn),
    })),
  );

  // --- About: Commitment (Story tab cards) ---
  await ds.getRepository(Commitment).save(
    [
      ['fa-universal-access', 'Pendidikan Inklusif & Terjangkau', 'Inclusive & Accessible Education', 'Memberi kesempatan setara lewat pengalaman belajar yang fleksibel dan terjangkau.', 'Providing equal opportunities through flexible and accessible learning experiences.'],
      ['fa-briefcase', 'Pertumbuhan Karier & Mentoring', 'Career Growth & Professional Mentoring', 'Mendampingi lewat mentoring, portofolio, sertifikasi, dan jalur penyaluran karier.', 'Supporting learners through mentoring, portfolio building, certifications, and career placement pathways.'],
      ['fa-industry', 'Pengalaman Industri Nyata', 'Real-World Industry Experience', 'Proyek langsung, studi kasus, dan kolaborasi dengan praktisi untuk menjembatani teori dan praktik.', 'Hands-on projects, case studies, and collaboration with experts to bridge theory and practice.'],
      ['fa-microchip', 'Adopsi Teknologi Inovatif', 'Innovative Technology Adoption', 'Terus berkembang dengan tools mutakhir dan metodologi modern.', 'Continuously evolving with cutting-edge tools and modern methodologies.'],
      ['fa-people-group', 'Komunitas Digital yang Memberdayakan', 'Empowering Digital Community', 'Membangun jejaring belajar kolaboratif yang tumbuh bersama.', 'Fostering collaborative learning networks that grow together.'],
      ['fa-star', 'Keunggulan dalam Pembelajaran Digital', 'Excellence in Digital Learning', 'Pendidikan berkualitas tinggi dan berorientasi industri.', 'High-quality, industry-driven education.'],
    ].map(([icon, tId, tEn, dId, dEn], idx) => ({
      icon,
      commitmentOrder: idx + 1,
      title: L(tId, tEn, tEn),
      description: L(dId, dEn, dEn),
    })),
  );

  // --- About: Story paragraphs ---
  await ds.getRepository(Paragraph).save(
    [
      [
        'Kesatria Academy adalah lembaga layanan pendidikan yang berfokus pada pengembangan talenta digital unggul di bidang teknologi informasi. Program kami dirancang untuk menjawab kebutuhan industri yang nyata dan terus berkembang.',
        'Kesatria Academy is an educational services institution focused on developing superior digital talent in the information technology sector. Our programs are designed to address real and evolving industry needs.',
      ],
      [
        'Kami percaya pendidikan teknologi bukan hanya soal pemahaman teori, melainkan perjalanan transformatif yang membangun kemampuan praktis, keterampilan pemecahan masalah, dan etika kerja profesional yang kuat.',
        'We believe technology education is not solely about theory, but a transformative journey that builds practical capabilities, problem-solving skills, and a strong professional work ethic.',
      ],
      [
        'Dengan kurikulum yang selaras dengan standar industri dan lingkungan belajar yang mendorong kolaborasi dan inovasi, Kesatria Academy berupaya memberdayakan talenta digital masa depan untuk unggul di tingkat lokal maupun internasional.',
        'With a curriculum aligned to industry standards and a learning environment that encourages collaboration and innovation, Kesatria Academy empowers future digital talents to excel locally and internationally.',
      ],
    ].map(([pId, pEn], idx) => ({
      paragraphOrder: idx + 1,
      paragraphs: L(pId, pEn, pEn),
    })),
  );

  // --- About: Team lead + team ---
  await ds.getRepository(TeamLead).save({
    profile: PHOTO,
    name: 'Faisal Wirakusuma, S.Kom., M.Sc.',
    position: L('Chief Executive Officer', 'Chief Executive Officer', '最高経営責任者'),
    linkedin: 'https://www.linkedin.com/in/faisal-wirakusuma',
    instagram: 'https://www.instagram.com/faisalwira',
    description: L(
      'Faisal adalah Founder dan CEO Wiratek Solusi Asia dengan pengalaman lebih dari 11 tahun di pengembangan aplikasi web, pembuatan API, data science, dan analitik. Ia berpengalaman menangani proyek untuk BUMN, instansi pemerintah, dan perusahaan swasta.',
      'Faisal is the Founder and CEO of Wiratek Solusi Asia, with over 11 years of experience in web application development, API creation, data science, and analytics. He has handled projects for state-owned enterprises, government agencies, and private companies.',
      'ファイサルはWiratek Solusi Asiaの創業者兼CEOで、Web開発、API構築、データサイエンス、分析で11年以上の経験を持ちます。',
    ),
  });
  await ds.getRepository(Background).save(
    [
      ['Bachelor of Science, Information Technology (S.Kom)', 'Indonesia Islamic University (2005 - 2010)'],
      ['Master of Science, Advanced Computer Science (M.Sc)', 'The University of Manchester (2014 - 2015)'],
    ].map(([c, d], idx) => ({ backgroundOrder: idx + 1, content: L(c, c, c), details: L(d, d, d) })),
  );
  await ds.getRepository(Experience).save(
    [
      ['CEO & Founder', 'PT Wiratek Solusi Asia (2015 - Present)'],
      ['Senior IT & Data Consultant', 'Enterprise solutions for BUMN & private sectors (2011 - 2015)'],
    ].map(([c, d], idx) => ({ experienceOrder: idx + 1, content: L(c, c, c), details: L(d, d, d) })),
  );
  await ds.getRepository(Team).save(
    [
      ['Rizal Rahadian Ramadhan, S.E', 'Chief Finance Officer', 'Mengawasi perencanaan keuangan, anggaran, dan strategi investasi perusahaan.', 'Oversees the company financial planning, budgeting, and investment strategies.'],
      ['Adipura Arya Kangsadewa, S.Bns', 'Education & Culture Manager', 'Memimpin pengembangan program pelatihan dan kemitraan strategis.', 'Leads the development of training programs and strategic partnerships.'],
      ['Zahra Andriani Mustika Fitri, S.M', 'Human Resource & Recruiter', 'Mengelola proses rekrutmen dan inisiatif pengembangan talenta.', 'Manages recruitment processes and talent development initiatives.'],
      ['Gilang Priambodo, S.Bns', 'Operational & Creative Admin', 'Mengoordinasikan operasi harian dan proses administrasi.', 'Coordinates daily operations and administrative processes.'],
      ['Feri Handoyo, S.Kom', 'Instructor', 'Instruktur pemrograman dan pengembangan aplikasi berbasis proyek.', 'Instructor specializing in project-based programming and application development.'],
      ['Reno Agil Saputra, S.Kom', 'Web Development Mentor', 'Mentor web development dengan pengalaman membimbing proyek nyata.', 'Web development mentor experienced in guiding real-world projects.'],
    ].map(([name, pos, dId, dEn], idx) => ({
      profile: PHOTO,
      name,
      teamOrder: idx + 1,
      linkedin: 'https://www.linkedin.com/company/kesatria-academy',
      instagram: 'https://www.instagram.com/kesatriaacademy',
      position: L(pos, pos, pos),
      description: L(dId, dEn, dEn),
    })),
  );

  console.log('content.seed: done.');
  await app.close();
}
bootstrap();
