/**
 * Mock Data: Alumni
 * Diplômés de l'Université Senghor
 */

export type Civility = 'M.' | 'Mme' | 'Dr' | 'Pr'
export type Industry = 'administration' | 'ong' | 'entrepreneuriat' | 'academie' | 'sante' | 'culture' | 'environnement' | 'media'

export interface Alumnus {
  id: string
  slug: string
  civility: Civility
  first_name: string
  last_name: string
  photo: string

  // Formation
  graduation_year: number
  promotion: string
  department_id: string
  formation_type: string

  // Situation actuelle
  current_position_fr: string
  current_position_en?: string
  current_position_ar?: string
  organization: string
  country: string
  industry: Industry

  // Témoignage (pour success stories)
  testimonial_fr?: string
  testimonial_en?: string
  testimonial_ar?: string
  is_featured: boolean

  // Métadonnées
  linkedin?: string
  is_published: boolean
}

export const mockAlumni: Alumnus[] = [
  // === FEATURED ALUMNI (Success Stories) ===
  {
    id: 'alumni-001',
    slug: 'aminata-diallo',
    civility: 'Dr',
    first_name: 'Aminata',
    last_name: 'Diallo',
    photo: '',
    graduation_year: 2015,
    promotion: 'Promo Mandela 2015',
    department_id: 'dept-management',
    formation_type: 'Master',
    current_position_fr: 'Directrice Générale',
    current_position_en: 'Chief Executive Officer',
    current_position_ar: 'المديرة العامة',
    organization: 'Agence de Développement Local - Sénégal',
    country: 'Sénégal',
    industry: 'administration',
    testimonial_fr: 'L\'Université Senghor m\'a donné les outils pour transformer ma vision en action. Le réseau d\'alumni est une richesse inestimable qui continue de m\'accompagner dans ma carrière.',
    testimonial_en: 'Senghor University gave me the tools to transform my vision into action. The alumni network is an invaluable asset that continues to support my career.',
    testimonial_ar: 'منحتني جامعة سنغور الأدوات لتحويل رؤيتي إلى عمل. شبكة الخريجين ثروة لا تقدر بثمن تستمر في دعم مسيرتي المهنية.',
    is_featured: true,
    linkedin: 'https://linkedin.com/in/aminata-diallo',
    is_published: true
  },
  {
    id: 'alumni-002',
    slug: 'jean-pierre-kouassi',
    civility: 'M.',
    first_name: 'Jean-Pierre',
    last_name: 'Kouassi',
    photo: '',
    graduation_year: 2017,
    promotion: 'Promo Senghor 2017',
    department_id: 'dept-culture',
    formation_type: 'Master',
    current_position_fr: 'Directeur du Patrimoine Culturel',
    current_position_en: 'Director of Cultural Heritage',
    current_position_ar: 'مدير التراث الثقافي',
    organization: 'Ministère de la Culture - Côte d\'Ivoire',
    country: 'Côte d\'Ivoire',
    industry: 'culture',
    testimonial_fr: 'Ma formation à Alexandrie m\'a ouvert les portes d\'un univers francophone riche et diversifié. Aujourd\'hui, je mets ces compétences au service du patrimoine de mon pays.',
    testimonial_en: 'My training in Alexandria opened the doors to a rich and diverse Francophone universe. Today, I put these skills at the service of my country\'s heritage.',
    testimonial_ar: 'فتح تدريبي في الإسكندرية أبواب عالم فرنكوفوني غني ومتنوع. اليوم، أضع هذه المهارات في خدمة تراث بلدي.',
    is_featured: true,
    linkedin: 'https://linkedin.com/in/jp-kouassi',
    is_published: true
  },
  {
    id: 'alumni-003',
    slug: 'fatima-benali',
    civility: 'Dr',
    first_name: 'Fatima',
    last_name: 'Benali',
    photo: '',
    graduation_year: 2018,
    promotion: 'Promo Diouf 2018',
    department_id: 'dept-sante',
    formation_type: 'Doctorat',
    current_position_fr: 'Experte en Santé Publique',
    current_position_en: 'Public Health Expert',
    current_position_ar: 'خبيرة في الصحة العامة',
    organization: 'Organisation Mondiale de la Santé',
    country: 'Maroc',
    industry: 'sante',
    testimonial_fr: 'Le doctorat à Senghor a été un tremplin vers une carrière internationale. L\'approche pluridisciplinaire et l\'ouverture sur l\'Afrique sont des atouts majeurs.',
    testimonial_en: 'The doctorate at Senghor was a springboard to an international career. The multidisciplinary approach and openness to Africa are major assets.',
    testimonial_ar: 'كانت الدكتوراه في سنغور نقطة انطلاق لمسيرة مهنية دولية. النهج متعدد التخصصات والانفتاح على أفريقيا من أهم المزايا.',
    is_featured: true,
    linkedin: 'https://linkedin.com/in/fatima-benali',
    is_published: true
  },
  {
    id: 'alumni-004',
    slug: 'olivier-mbeki',
    civility: 'M.',
    first_name: 'Olivier',
    last_name: 'Mbeki',
    photo: '',
    graduation_year: 2019,
    promotion: 'Promo Césaire 2019',
    department_id: 'dept-environnement',
    formation_type: 'Master',
    current_position_fr: 'Fondateur et CEO',
    current_position_en: 'Founder and CEO',
    current_position_ar: 'المؤسس والرئيس التنفيذي',
    organization: 'GreenTech Africa',
    country: 'Cameroun',
    industry: 'entrepreneuriat',
    testimonial_fr: 'Senghor m\'a appris à penser le développement durable de manière holistique. J\'ai créé mon entreprise pour apporter des solutions concrètes aux défis environnementaux africains.',
    testimonial_en: 'Senghor taught me to think about sustainable development holistically. I created my company to provide concrete solutions to African environmental challenges.',
    testimonial_ar: 'علمتني سنغور التفكير في التنمية المستدامة بشكل شامل. أنشأت شركتي لتقديم حلول ملموسة للتحديات البيئية الأفريقية.',
    is_featured: true,
    linkedin: 'https://linkedin.com/in/olivier-mbeki',
    is_published: true
  },

  // === AUTRES ALUMNI ===
  {
    id: 'alumni-005',
    slug: 'aissatou-barry',
    civility: 'Mme',
    first_name: 'Aïssatou',
    last_name: 'Barry',
    photo: '',
    graduation_year: 2016,
    promotion: 'Promo Hampaté Bâ 2016',
    department_id: 'dept-management',
    formation_type: 'Master',
    current_position_fr: 'Responsable RH',
    current_position_en: 'HR Manager',
    organization: 'Orange Guinée',
    country: 'Guinée',
    industry: 'entrepreneuriat',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/aissatou-barry',
    is_published: true
  },
  {
    id: 'alumni-006',
    slug: 'mohamed-hassan',
    civility: 'Dr',
    first_name: 'Mohamed',
    last_name: 'Hassan',
    photo: '',
    graduation_year: 2020,
    promotion: 'Promo Cheikh Anta Diop 2020',
    department_id: 'dept-sante',
    formation_type: 'Master',
    current_position_fr: 'Médecin coordinateur',
    current_position_en: 'Medical Coordinator',
    organization: 'Médecins Sans Frontières',
    country: 'Égypte',
    industry: 'ong',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/mohamed-hassan-msf',
    is_published: true
  },
  {
    id: 'alumni-007',
    slug: 'marie-claire-fotso',
    civility: 'Mme',
    first_name: 'Marie-Claire',
    last_name: 'Fotso',
    photo: '',
    graduation_year: 2019,
    promotion: 'Promo Césaire 2019',
    department_id: 'dept-culture',
    formation_type: 'Master',
    current_position_fr: 'Conservatrice de musée',
    current_position_en: 'Museum Curator',
    organization: 'Musée National du Cameroun',
    country: 'Cameroun',
    industry: 'culture',
    is_featured: false,
    is_published: true
  },
  {
    id: 'alumni-008',
    slug: 'ibrahima-sow',
    civility: 'M.',
    first_name: 'Ibrahima',
    last_name: 'Sow',
    photo: '',
    graduation_year: 2021,
    promotion: 'Promo Wangari Maathai 2021',
    department_id: 'dept-environnement',
    formation_type: 'Master',
    current_position_fr: 'Chargé de programme',
    current_position_en: 'Program Officer',
    organization: 'Programme des Nations Unies pour l\'Environnement',
    country: 'Sénégal',
    industry: 'ong',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/ibrahima-sow',
    is_published: true
  },
  {
    id: 'alumni-009',
    slug: 'nadia-ouedraogo',
    civility: 'Dr',
    first_name: 'Nadia',
    last_name: 'Ouédraogo',
    photo: '',
    graduation_year: 2017,
    promotion: 'Promo Senghor 2017',
    department_id: 'dept-sante',
    formation_type: 'Doctorat',
    current_position_fr: 'Enseignante-chercheure',
    current_position_en: 'Lecturer and Researcher',
    organization: 'Université de Ouagadougou',
    country: 'Burkina Faso',
    industry: 'academie',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/nadia-ouedraogo',
    is_published: true
  },
  {
    id: 'alumni-010',
    slug: 'patrice-ndongo',
    civility: 'M.',
    first_name: 'Patrice',
    last_name: 'Ndongo',
    photo: '',
    graduation_year: 2018,
    promotion: 'Promo Diouf 2018',
    department_id: 'dept-management',
    formation_type: 'Master',
    current_position_fr: 'Directeur financier',
    current_position_en: 'Chief Financial Officer',
    organization: 'Bolloré Transport & Logistics',
    country: 'RDC',
    industry: 'entrepreneuriat',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/patrice-ndongo',
    is_published: true
  },
  {
    id: 'alumni-011',
    slug: 'salimata-traore',
    civility: 'Mme',
    first_name: 'Salimata',
    last_name: 'Traoré',
    photo: '',
    graduation_year: 2022,
    promotion: 'Promo Miriam Makeba 2022',
    department_id: 'dept-culture',
    formation_type: 'Master',
    current_position_fr: 'Productrice audiovisuelle',
    current_position_en: 'Audiovisual Producer',
    organization: 'AfricaFilms Production',
    country: 'Mali',
    industry: 'media',
    is_featured: false,
    is_published: true
  },
  {
    id: 'alumni-012',
    slug: 'youssef-el-amrani',
    civility: 'M.',
    first_name: 'Youssef',
    last_name: 'El Amrani',
    photo: '',
    graduation_year: 2020,
    promotion: 'Promo Cheikh Anta Diop 2020',
    department_id: 'dept-environnement',
    formation_type: 'Master',
    current_position_fr: 'Consultant en développement durable',
    current_position_en: 'Sustainable Development Consultant',
    organization: 'Cabinet Deloitte',
    country: 'Maroc',
    industry: 'entrepreneuriat',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/youssef-amrani',
    is_published: true
  },
  {
    id: 'alumni-013',
    slug: 'grace-kouame',
    civility: 'Mme',
    first_name: 'Grâce',
    last_name: 'Kouamé',
    photo: '',
    graduation_year: 2016,
    promotion: 'Promo Hampaté Bâ 2016',
    department_id: 'dept-sante',
    formation_type: 'Master',
    current_position_fr: 'Directrice de programme santé',
    current_position_en: 'Health Program Director',
    organization: 'UNICEF Côte d\'Ivoire',
    country: 'Côte d\'Ivoire',
    industry: 'ong',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/grace-kouame',
    is_published: true
  },
  {
    id: 'alumni-014',
    slug: 'abdel-kader-toure',
    civility: 'Dr',
    first_name: 'Abdel Kader',
    last_name: 'Touré',
    photo: '',
    graduation_year: 2015,
    promotion: 'Promo Mandela 2015',
    department_id: 'dept-management',
    formation_type: 'Doctorat',
    current_position_fr: 'Professeur associé',
    current_position_en: 'Associate Professor',
    organization: 'Université Gaston Berger',
    country: 'Sénégal',
    industry: 'academie',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/ak-toure',
    is_published: true
  },
  {
    id: 'alumni-015',
    slug: 'leila-mahmoud',
    civility: 'Mme',
    first_name: 'Leila',
    last_name: 'Mahmoud',
    photo: '',
    graduation_year: 2023,
    promotion: 'Promo Mariama Bâ 2023',
    department_id: 'dept-culture',
    formation_type: 'Master',
    current_position_fr: 'Chargée de communication',
    current_position_en: 'Communications Officer',
    organization: 'Institut Français d\'Égypte',
    country: 'Égypte',
    industry: 'culture',
    is_featured: false,
    is_published: true
  },
  {
    id: 'alumni-016',
    slug: 'eric-mpoyi',
    civility: 'M.',
    first_name: 'Éric',
    last_name: 'Mpoyi',
    photo: '',
    graduation_year: 2019,
    promotion: 'Promo Césaire 2019',
    department_id: 'dept-environnement',
    formation_type: 'Master',
    current_position_fr: 'Responsable RSE',
    current_position_en: 'CSR Manager',
    organization: 'Total Energies RDC',
    country: 'RDC',
    industry: 'entrepreneuriat',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/eric-mpoyi',
    is_published: true
  },
  {
    id: 'alumni-017',
    slug: 'mariama-camara',
    civility: 'Dr',
    first_name: 'Mariama',
    last_name: 'Camara',
    photo: '',
    graduation_year: 2021,
    promotion: 'Promo Wangari Maathai 2021',
    department_id: 'dept-sante',
    formation_type: 'Master',
    current_position_fr: 'Épidémiologiste',
    current_position_en: 'Epidemiologist',
    organization: 'Institut Pasteur de Guinée',
    country: 'Guinée',
    industry: 'sante',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/mariama-camara',
    is_published: true
  },
  {
    id: 'alumni-018',
    slug: 'serge-habimana',
    civility: 'M.',
    first_name: 'Serge',
    last_name: 'Habimana',
    photo: '',
    graduation_year: 2022,
    promotion: 'Promo Miriam Makeba 2022',
    department_id: 'dept-management',
    formation_type: 'Master',
    current_position_fr: 'Entrepreneur',
    current_position_en: 'Entrepreneur',
    organization: 'RwandaTech Solutions',
    country: 'Rwanda',
    industry: 'entrepreneuriat',
    is_featured: false,
    linkedin: 'https://linkedin.com/in/serge-habimana',
    is_published: true
  }
]
