// Data statis halaman Corporate Training.
// Field teks disimpan multibahasa ({ id, en, ja }) dan dilokalkan di view lewat
// helper `localizeList` (src/common/helpers/string.helpers.ts).
type L10n = { id: string; en: string; ja: string };

const L = (id: string, en: string, ja: string): L10n => ({ id, en, ja });

const INTEGRATED: L10n = L(
  'Integrated Training',
  'Integrated Training',
  '統合型トレーニング',
);
const THEMATIC: L10n = L(
  'Thematic Training',
  'Thematic Training',
  'テーマ別トレーニング',
);
const PRODUCT_SERVICE: L10n = L(
  'Product/Service',
  'Product/Service',
  'プロダクト/サービス',
);
const CODE_CLASS: L10n = L('Code Class', 'Code Class', 'コードクラス');
const DESIGN_CLASS: L10n = L('Design Class', 'Design Class', 'デザインクラス');
const BUSINESS_CLASS: L10n = L(
  'Business Class',
  'Business Class',
  'ビジネスクラス',
);
const ERP_CLASS: L10n = L('Implementasi ERP', 'ERP Implementation', 'ERP導入');
const REQUEST_PROPOSAL: L10n = L(
  'Minta proposal',
  'Request a proposal',
  '提案を依頼する',
);
const DISCUSS_IMPL: L10n = L(
  'Diskusikan implementasi',
  'Discuss implementation',
  '導入について相談する',
);

export const corporateTrainingPrograms = [
  {
    no: 1,
    name: 'Javascript',
    sub: L(
      'Full Stack Developer Masterclass',
      'Full Stack Developer Masterclass',
      'フルスタック開発マスタークラス',
    ),
    category: 'code',
    categoryLabel: CODE_CLASS,
    type: INTEGRATED,
    description: L(
      'Pelatihan pengembangan aplikasi web modern dari frontend hingga backend menggunakan Javascript, React.js atau Vue.js, serta Node.js.',
      'Modern web application development training from frontend to backend using JavaScript, React.js or Vue.js, and Node.js.',
      'JavaScript、React.jsまたはVue.js、Node.jsを使って、フロントエンドからバックエンドまでのモダンなWebアプリケーション開発を学ぶ研修です。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 2,
    name: 'Flutter',
    sub: L(
      'Mobile Apps Developer Masterclass',
      'Mobile Apps Developer Masterclass',
      'モバイルアプリ開発マスタークラス',
    ),
    category: 'code',
    categoryLabel: CODE_CLASS,
    type: INTEGRATED,
    description: L(
      'Kuasai pengembangan aplikasi mobile lintas platform menggunakan Flutter dan Dart dengan antarmuka interaktif.',
      'Master cross-platform mobile app development using Flutter and Dart with interactive interfaces.',
      'FlutterとDartを使ったクロスプラットフォームのモバイルアプリ開発を、インタラクティブなインターフェースと共に習得します。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 3,
    name: 'Python',
    sub: L(
      'Web Application & Software Masterclass',
      'Web Application & Software Masterclass',
      'Webアプリ・ソフトウェアマスタークラス',
    ),
    category: 'code',
    categoryLabel: CODE_CLASS,
    type: INTEGRATED,
    description: L(
      'Pelajari Python untuk web development, data processing, automasi, dan pembuatan aplikasi nyata dengan Flask atau Django.',
      'Learn Python for web development, data processing, automation, and building real applications with Flask or Django.',
      'FlaskやDjangoを使った実践的なアプリ開発をはじめ、Web開発・データ処理・自動化のためのPythonを学びます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 4,
    name: 'AWS',
    sub: L(
      'Cloud Computing Masterclass',
      'Cloud Computing Masterclass',
      'クラウドコンピューティングマスタークラス',
    ),
    category: 'code',
    categoryLabel: CODE_CLASS,
    type: INTEGRATED,
    description: L(
      'Tingkatkan kemampuan mengelola infrastruktur cloud, deployment aplikasi, server, dan arsitektur AWS sesuai standar industri.',
      'Improve your ability to manage cloud infrastructure, application deployment, servers, and AWS architecture to industry standards.',
      'クラウドインフラの管理、アプリのデプロイ、サーバー、AWSアーキテクチャを業界標準に沿って設計・運用する能力を高めます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 17,
    name: 'Data Science & AI',
    sub: THEMATIC,
    category: 'code',
    categoryLabel: CODE_CLASS,
    type: THEMATIC,
    description: L(
      'Bangun pemahaman fundamental data science dan siklus proyek artificial intelligence dengan tools visual yang praktis.',
      'Build a fundamental understanding of data science and the artificial intelligence project cycle using practical visual tools.',
      '実践的なビジュアルツールを使って、データサイエンスの基礎とAIプロジェクトサイクルの理解を深めます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 18,
    name: 'Generative AI (GenAI)',
    sub: THEMATIC,
    category: 'code',
    categoryLabel: CODE_CLASS,
    type: THEMATIC,
    description: L(
      'Praktik menggunakan Generative AI untuk menghasilkan teks, gambar, dan kode dengan teknik prompt engineering.',
      'Practice using Generative AI to produce text, images, and code with prompt engineering techniques.',
      'プロンプトエンジニアリングの技法を使って、テキスト・画像・コードを生成する生成AIの実践練習。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 6,
    name: 'Figma',
    sub: L(
      'UI/UX Designer Masterclass',
      'UI/UX Designer Masterclass',
      'UI/UXデザインマスタークラス',
    ),
    category: 'design',
    categoryLabel: DESIGN_CLASS,
    type: INTEGRATED,
    description: L(
      'Pahami prinsip desain antarmuka, wireframe, prototype, dan design system menggunakan Figma.',
      'Learn interface design principles, wireframes, prototypes, and design systems using Figma.',
      'Figmaを使ったインターフェース設計の原則、ワイヤーフレーム、プロトタイプ、デザインシステムを学びます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 7,
    name: 'Canva',
    sub: L(
      'Graphic Designer Masterclass',
      'Graphic Designer Masterclass',
      'グラフィックデザインマスタークラス',
    ),
    category: 'design',
    categoryLabel: DESIGN_CLASS,
    type: INTEGRATED,
    description: L(
      'Tingkatkan keterampilan membuat konten visual profesional untuk branding, media sosial, dan presentasi.',
      'Improve your skills in creating professional visual content for branding, social media, and presentations.',
      'ブランディング・SNS・プレゼンテーション向けのプロ品質ビジュアルコンテンツ制作スキルを高めます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 8,
    name: 'CapCut',
    sub: L(
      'Video Editor Masterclass',
      'Video Editor Masterclass',
      '動画編集マスタークラス',
    ),
    category: 'design',
    categoryLabel: DESIGN_CLASS,
    type: INTEGRATED,
    description: L(
      'Pelajari storytelling visual, transisi, efek kreatif, dan produksi konten video untuk media sosial.',
      'Learn visual storytelling, transitions, creative effects, and video content production for social media.',
      'ビジュアルストーリーテリング、トランジション、クリエイティブなエフェクト、SNS向け動画制作を学びます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 9,
    name: 'Canva & Instagram',
    sub: L(
      'Design & Social Media Planning',
      'Design & Social Media Planning',
      'デザイン&SNSプランニング',
    ),
    category: 'design',
    categoryLabel: DESIGN_CLASS,
    type: INTEGRATED,
    description: L(
      'Buat visual yang konsisten dan rancang kalender konten Instagram untuk meningkatkan engagement brand.',
      'Create consistent visuals and design an Instagram content calendar to boost brand engagement.',
      '一貫したビジュアル制作とInstagramコンテンツカレンダーの設計でブランドエンゲージメントを高めます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 10,
    name: 'Canva & TikTok',
    sub: L(
      'Design & Social Media Planning',
      'Design & Social Media Planning',
      'デザイン&SNSプランニング',
    ),
    category: 'design',
    categoryLabel: DESIGN_CLASS,
    type: INTEGRATED,
    description: L(
      'Buat video pendek yang engaging dengan Canva serta strategi storytelling dan tren TikTok.',
      'Create engaging short videos with Canva along with storytelling strategies and TikTok trends.',
      'Canvaで魅力的なショート動画を作り、TikTokのトレンドとストーリーテリング戦略を学びます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 11,
    name: 'Microsoft Office',
    sub: L('Masterclass', 'Masterclass', 'マスタークラス'),
    category: 'business',
    categoryLabel: BUSINESS_CLASS,
    type: INTEGRATED,
    description: L(
      'Tingkatkan penguasaan Excel, Word, dan PowerPoint untuk efisiensi kerja dan presentasi data profesional.',
      'Improve mastery of Excel, Word, and PowerPoint for work efficiency and professional data presentation.',
      '業務効率化とプロフェッショナルなデータプレゼンのため、Excel・Word・PowerPointのスキルを磨きます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 12,
    name: 'Digital Marketing',
    sub: L('Masterclass', 'Masterclass', 'マスタークラス'),
    category: 'business',
    categoryLabel: BUSINESS_CLASS,
    type: INTEGRATED,
    description: L(
      'Pelajari SEO, SEM, content marketing, dan analisis performa untuk mengoptimalkan branding serta penjualan.',
      'Learn SEO, SEM, content marketing, and performance analysis to optimize branding and sales.',
      'SEO・SEM・コンテンツマーケティング・パフォーマンス分析を学び、ブランディングと売上を最適化します。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 13,
    name: 'Business Management',
    sub: L('Masterclass', 'Masterclass', 'マスタークラス'),
    category: 'business',
    categoryLabel: BUSINESS_CLASS,
    type: INTEGRATED,
    description: L(
      'Bahas manajemen modern, kepemimpinan, dan pengelolaan sumber daya bisnis untuk profesional dan calon manajer.',
      'Cover modern management, leadership, and business resource management for professionals and aspiring managers.',
      '現代のマネジメント、リーダーシップ、ビジネス資源の管理を、プロフェッショナルや管理職候補向けに学びます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 14,
    name: 'Technopreneurship',
    sub: L('Masterclass', 'Masterclass', 'マスタークラス'),
    category: 'business',
    categoryLabel: BUSINESS_CLASS,
    type: INTEGRATED,
    description: L(
      'Gabungkan teknologi dan kewirausahaan untuk membangun ide produk, startup digital, dan bisnis inovatif.',
      'Combine technology and entrepreneurship to build product ideas, digital startups, and innovative businesses.',
      'テクノロジーと起業家精神を融合し、プロダクトアイデアやデジタルスタートアップ、革新的なビジネスを構築します。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 15,
    name: 'Meta Ads',
    sub: L(
      'Facebook & Instagram Masterclass',
      'Facebook & Instagram Masterclass',
      'Facebook & Instagramマスタークラス',
    ),
    category: 'business',
    categoryLabel: BUSINESS_CLASS,
    type: INTEGRATED,
    description: L(
      'Rancang kampanye Meta Ads, atur budget, dan analisis performa untuk meningkatkan engagement serta konversi.',
      'Design Meta Ads campaigns, manage budgets, and analyze performance to increase engagement and conversions.',
      'Meta広告キャンペーンの設計、予算管理、パフォーマンス分析を通じてエンゲージメントとコンバージョンを高めます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 16,
    name: 'Public Speaking',
    sub: L('Personal/Business', 'Personal/Business', 'パーソナル/ビジネス'),
    category: 'business',
    categoryLabel: BUSINESS_CLASS,
    type: INTEGRATED,
    description: L(
      'Latih kemampuan vokal, storytelling, dan presentasi efektif untuk konteks personal maupun profesional.',
      'Train vocal skills, storytelling, and effective presentation for both personal and professional contexts.',
      '発声、ストーリーテリング、効果的なプレゼンテーションを、個人・ビジネスの両場面で磨きます。',
    ),
    cta: REQUEST_PROPOSAL,
  },
  {
    no: 5,
    name: 'Odoo',
    sub: L(
      'Enterprise Resource Planning (ERP)',
      'Enterprise Resource Planning (ERP)',
      'エンタープライズリソースプランニング（ERP）',
    ),
    category: 'impl',
    categoryLabel: ERP_CLASS,
    type: PRODUCT_SERVICE,
    description: L(
      'Implementasikan sistem ERP berbasis Odoo untuk mengintegrasikan fungsi operasional perusahaan secara efisien.',
      'Implement an Odoo-based ERP system to integrate your company operations efficiently.',
      'OdooベースのERPシステムを導入し、企業の業務機能を効率的に統合します。',
    ),
    cta: DISCUSS_IMPL,
  },
];

export const corporateTrainingFaqs = [
  {
    question: L(
      'Apakah ada pelatihan untuk perusahaan atau kampus?',
      'Is there training for companies or campuses?',
      '企業や大学向けの研修はありますか？',
    ),
    answer: L(
      'Ada. Kami menyediakan pelatihan in-house yang disesuaikan dengan kebutuhan perusahaan atau institusi.',
      'Yes. We provide in-house training tailored to the needs of companies or institutions.',
      'はい。企業や機関のニーズに合わせた社内研修をご用意しています。',
    ),
  },
  {
    question: L(
      'Apakah materi bisa disesuaikan dengan kebutuhan tim kami?',
      "Can the material be tailored to our team's needs?",
      '研修内容は自社チームのニーズに合わせられますか？',
    ),
    answer: L(
      'Bisa. Kami menyesuaikan program dengan tujuan bisnis, kemampuan awal, dan jumlah peserta tim Anda.',
      'Yes. We adjust the program to your business goals, initial skill level, and team size.',
      'はい。ビジネス目標、メンバーの習熟度、受講人数に合わせてプログラムを調整します。',
    ),
  },
  {
    question: L(
      'Apakah beberapa menu bisa digabung dalam satu program?',
      'Can several menus be combined into one program?',
      '複数のメニューを1つのプログラムに組み合わせられますか？',
    ),
    answer: L(
      'Bisa. Beberapa menu dapat dikombinasikan sesuai kebutuhan tim, atau kami bantu menyusun paket baru.',
      "Yes. Several menus can be combined to fit your team's needs, or we can help create a new package.",
      'はい。チームのニーズに合わせて組み合わせることも、新しいパッケージを作成することも可能です。',
    ),
  },
  {
    question: L(
      'Apakah pelatihan bisa online atau offline?',
      'Can the training be online or offline?',
      '研修はオンラインとオフラインのどちらも可能ですか？',
    ),
    answer: L(
      'Bisa keduanya. Pelatihan dapat dilakukan secara online atau offline langsung di institusi Anda.',
      'Both. Training can be held online or offline directly at your institution.',
      '両方可能です。オンラインまたは貴機関でのオフラインで実施できます。',
    ),
  },
  {
    question: L(
      'Berapa biaya dan durasi pelatihan?',
      'How much does the training cost and how long does it take?',
      '研修の費用と期間はどのくらいですか？',
    ),
    answer: L(
      'Biaya dan durasi menyesuaikan menu, jumlah peserta, dan kebutuhan organisasi. Rinciannya ada di proposal.',
      'Cost and duration depend on the menus, number of participants, and your organization needs. Details are in the proposal.',
      '費用と期間はメニュー・参加人数・組織のニーズにより異なります。詳細は提案書に記載しています。',
    ),
  },
  {
    question: L(
      'Apakah Odoo ERP termasuk pelatihan?',
      'Is Odoo ERP part of the training?',
      'Odoo ERPも研修に含まれますか？',
    ),
    answer: L(
      'Odoo ERP adalah layanan implementasi sistem untuk mendukung efisiensi operasional, bukan kelas.',
      'Odoo ERP is a system implementation service to support operational efficiency, not a class.',
      'Odoo ERPは業務効率化のためのシステム導入サービスであり、クラスではありません。',
    ),
  },
];
