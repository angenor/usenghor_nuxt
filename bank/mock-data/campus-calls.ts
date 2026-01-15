/**
 * Mock Data: Appels des Campus Externalisés
 */

export interface CampusCall {
  id: string
  campus_id: string
  title_fr: string
  title_en?: string
  title_ar?: string
  type: 'candidature' | 'projet' | 'bourse' | 'recrutement'
  status: 'open' | 'closed'
  deadline: string
  description_fr: string
  description_en?: string
  description_ar?: string
  image: string
  partner_logos: string[]
  url?: string
  is_active: boolean
}

export const mockCampusCalls: CampusCall[] = [
  // Siège - Alexandrie
  {
    id: 'call-siege-1',
    campus_id: 'siege',
    title_fr: 'Appel à candidatures Master Développement 2025-2026',
    title_en: 'Call for Applications Master Development 2025-2026',
    title_ar: 'دعوة للتقدم لماجستير التنمية 2025-2026',
    type: 'candidature',
    status: 'open',
    deadline: '2025-06-30',
    description_fr: 'L\'Université Senghor ouvre ses candidatures pour le Master en Développement, formation phare destinée aux futurs cadres africains souhaitant contribuer au développement durable du continent.',
    description_en: 'Senghor University opens applications for the Master in Development, a flagship program for future African leaders wishing to contribute to sustainable development of the continent.',
    description_ar: 'تفتح جامعة سنغور باب التقديم لماجستير التنمية، البرنامج الرائد للقادة الأفارقة المستقبليين.',
    image: 'https://picsum.photos/seed/call-siege-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png'
    ],
    url: 'https://usenghor.org/candidatures/master-developpement',
    is_active: true
  },
  {
    id: 'call-siege-2',
    campus_id: 'siege',
    title_fr: 'Master Administration et Gestion des Entreprises 2025-2026',
    title_en: 'Master in Business Administration 2025-2026',
    title_ar: 'ماجستير إدارة الأعمال 2025-2026',
    type: 'candidature',
    status: 'open',
    deadline: '2025-07-15',
    description_fr: 'Formation d\'excellence en administration et gestion des entreprises, préparant les futurs dirigeants africains aux défis du management moderne.',
    description_en: 'Excellence training in business administration, preparing future African leaders for modern management challenges.',
    description_ar: 'تدريب متميز في إدارة الأعمال لإعداد القادة الأفارقة المستقبليين.',
    image: 'https://picsum.photos/seed/call-siege-2/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/03.png'
    ],
    url: 'https://usenghor.org/candidatures/master-administration',
    is_active: true
  },
  {
    id: 'call-siege-3',
    campus_id: 'siege',
    title_fr: 'Bourses d\'excellence OIF 2025',
    title_en: 'OIF Excellence Scholarships 2025',
    title_ar: 'منح التميز OIF 2025',
    type: 'bourse',
    status: 'open',
    deadline: '2025-05-31',
    description_fr: 'L\'Organisation Internationale de la Francophonie offre 30 bourses complètes pour les étudiants méritants souhaitant intégrer l\'Université Senghor.',
    description_en: 'The International Organization of La Francophonie offers 30 full scholarships for deserving students wishing to join Senghor University.',
    description_ar: 'تقدم المنظمة الدولية للفرنكوفونية 30 منحة كاملة للطلاب المستحقين.',
    image: 'https://picsum.photos/seed/call-siege-3/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/04.jpg'
    ],
    url: 'https://usenghor.org/bourses/excellence-oif',
    is_active: true
  },
  {
    id: 'call-siege-4',
    campus_id: 'siege',
    title_fr: 'Appel à projets de recherche 2025',
    title_en: 'Research Projects Call 2025',
    title_ar: 'دعوة لمشاريع البحث 2025',
    type: 'projet',
    status: 'open',
    deadline: '2025-08-15',
    description_fr: 'L\'Université Senghor lance un appel à projets pour financer des recherches sur les thématiques du développement durable, de la gouvernance et de la santé en Afrique.',
    description_en: 'Senghor University launches a call for projects to fund research on sustainable development, governance and health in Africa.',
    description_ar: 'تطلق جامعة سنغور دعوة لمشاريع لتمويل البحوث حول التنمية المستدامة.',
    image: 'https://picsum.photos/seed/call-siege-4/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg'
    ],
    url: 'https://usenghor.org/projets/recherche-2025',
    is_active: true
  },
  {
    id: 'call-siege-5',
    campus_id: 'siege',
    title_fr: 'Bourses de mobilité AUF 2025',
    title_en: 'AUF Mobility Scholarships 2025',
    title_ar: 'منح التنقل AUF 2025',
    type: 'bourse',
    status: 'open',
    deadline: '2025-04-30',
    description_fr: 'Programme de bourses en partenariat avec l\'Agence Universitaire de la Francophonie pour favoriser la mobilité des étudiants et enseignants.',
    description_en: 'Scholarship program in partnership with the Agence Universitaire de la Francophonie to promote student and teacher mobility.',
    description_ar: 'برنامج منح بالشراكة مع الوكالة الجامعية للفرنكوفونية.',
    image: 'https://picsum.photos/seed/call-siege-5/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png'
    ],
    url: 'https://usenghor.org/bourses/mobilite-auf',
    is_active: true
  },
  // Recrutements - Siège
  {
    id: 'recruit-siege-1',
    campus_id: 'siege',
    title_fr: 'Enseignant-chercheur en Économie du Développement',
    title_en: 'Lecturer-Researcher in Development Economics',
    title_ar: 'أستاذ باحث في اقتصاديات التنمية',
    type: 'recrutement',
    status: 'open',
    deadline: '2025-04-15',
    description_fr: 'L\'Université Senghor recrute un enseignant-chercheur spécialisé en économie du développement. Doctorat exigé avec publications dans des revues à comité de lecture.',
    description_en: 'Senghor University is recruiting a lecturer-researcher specialized in development economics. PhD required with publications in peer-reviewed journals.',
    description_ar: 'تبحث جامعة سنغور عن أستاذ باحث متخصص في اقتصاديات التنمية.',
    image: 'https://picsum.photos/seed/recruit-siege-1/800/400',
    partner_logos: [],
    url: 'https://usenghor.org/recrutements/enseignant-economie',
    is_active: true
  },
  {
    id: 'recruit-siege-2',
    campus_id: 'siege',
    title_fr: 'Responsable des relations internationales',
    title_en: 'International Relations Manager',
    title_ar: 'مدير العلاقات الدولية',
    type: 'recrutement',
    status: 'open',
    deadline: '2025-05-01',
    description_fr: 'Poste stratégique pour développer et coordonner les partenariats internationaux de l\'université. Master minimum, expérience en coopération internationale requise.',
    description_en: 'Strategic position to develop and coordinate the university\'s international partnerships. Minimum Master\'s degree, experience in international cooperation required.',
    description_ar: 'منصب استراتيجي لتطوير وتنسيق الشراكات الدولية للجامعة.',
    image: 'https://picsum.photos/seed/recruit-siege-2/800/400',
    partner_logos: [],
    url: 'https://usenghor.org/recrutements/relations-internationales',
    is_active: true
  },
  // Appels clos - Siège
  {
    id: 'call-siege-closed-1',
    campus_id: 'siege',
    title_fr: 'Master Santé Internationale 2024-2025',
    title_en: 'Master in International Health 2024-2025',
    title_ar: 'ماجستير الصحة الدولية 2024-2025',
    type: 'candidature',
    status: 'closed',
    deadline: '2024-06-30',
    description_fr: 'Formation spécialisée en santé publique internationale pour les professionnels de santé francophones.',
    description_en: 'Specialized training in international public health for French-speaking health professionals.',
    description_ar: 'تدريب متخصص في الصحة العامة الدولية.',
    image: 'https://picsum.photos/seed/call-siege-closed-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg'
    ],
    is_active: true
  },
  {
    id: 'call-siege-closed-2',
    campus_id: 'siege',
    title_fr: 'Bourses doctorales 2024',
    title_en: 'Doctoral Scholarships 2024',
    title_ar: 'منح الدكتوراه 2024',
    type: 'bourse',
    status: 'closed',
    deadline: '2024-05-15',
    description_fr: 'Programme de bourses pour doctorants travaillant sur des thématiques de développement africain.',
    description_en: 'Scholarship program for doctoral students working on African development topics.',
    description_ar: 'برنامج منح لطلاب الدكتوراه.',
    image: 'https://picsum.photos/seed/call-siege-closed-2/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png'
    ],
    is_active: true
  },

  // Campus Dakar
  {
    id: 'call-dakar-1',
    campus_id: 'campus-dakar',
    title_fr: 'Appel à candidatures Master Management 2025',
    title_en: 'Call for Applications Master Management 2025',
    title_ar: 'دعوة للتقدم لماجستير الإدارة 2025',
    type: 'candidature',
    status: 'open',
    deadline: '2025-06-30',
    description_fr: 'Le campus de Dakar lance son appel à candidatures pour le Master en Management des Organisations pour la rentrée 2025.',
    description_en: 'The Dakar campus launches its call for applications for the Master in Organizational Management for the 2025 academic year.',
    image: 'https://picsum.photos/seed/call-dakar-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/20.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg'
    ],
    url: 'https://usenghor.org/candidatures/dakar-management',
    is_active: true
  },
  {
    id: 'call-dakar-2',
    campus_id: 'campus-dakar',
    title_fr: 'Bourses d\'excellence UCAD-Senghor',
    title_en: 'UCAD-Senghor Excellence Scholarships',
    title_ar: 'منح التميز UCAD-سنغور',
    type: 'bourse',
    status: 'open',
    deadline: '2025-05-15',
    description_fr: 'Bourses couvrant les frais de scolarité pour les étudiants méritants du Master Santé Publique.',
    description_en: 'Scholarships covering tuition fees for deserving students in the Public Health Master.',
    image: 'https://picsum.photos/seed/call-dakar-2/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/20.jpg'
    ],
    is_active: true
  },

  // Campus Yaoundé
  {
    id: 'call-yaounde-1',
    campus_id: 'campus-yaounde',
    title_fr: 'Appel à projets environnementaux 2025',
    title_en: 'Environmental Projects Call 2025',
    title_ar: 'دعوة لمشاريع بيئية 2025',
    type: 'projet',
    status: 'open',
    deadline: '2025-04-30',
    description_fr: 'Le campus de Yaoundé recherche des projets innovants dans le domaine de la gestion environnementale pour l\'Afrique Centrale.',
    description_en: 'The Yaoundé campus seeks innovative projects in environmental management for Central Africa.',
    image: 'https://picsum.photos/seed/call-yaounde-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/17.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg'
    ],
    is_active: true
  },

  // Campus Abidjan - Données enrichies
  {
    id: 'call-abidjan-1',
    campus_id: 'campus-abidjan',
    title_fr: 'Master 2 en Pilotage et évaluation des politiques publiques 2025',
    title_en: 'Master 2 in Public Policy Management and Evaluation 2025',
    title_ar: 'ماجستير 2 في قيادة وتقييم السياسات العامة 2025',
    type: 'candidature',
    status: 'open',
    deadline: '2025-09-15',
    description_fr: 'L\'Université Senghor, en partenariat avec l\'ENA de Côte d\'Ivoire et l\'Université Félix Houphouët-Boigny, ouvre les candidatures pour le Master 2 en Pilotage et Évaluation des Politiques Publiques. Cette formation d\'excellence vise à former des cadres supérieurs capables de concevoir, piloter et évaluer les politiques publiques dans l\'espace francophone africain.',
    description_en: 'Senghor University, in partnership with ENA of Côte d\'Ivoire and Félix Houphouët-Boigny University, opens applications for the Master 2 in Public Policy Management and Evaluation. This program of excellence aims to train senior executives capable of designing, managing and evaluating public policies in the francophone African space.',
    image: 'https://picsum.photos/seed/call-abidjan-pp/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/03.png'
    ],
    url: 'https://usenghor.org/candidatures/abidjan-politiques-publiques',
    is_active: true
  },
  {
    id: 'call-abidjan-2',
    campus_id: 'campus-abidjan',
    title_fr: 'Master 2 Culture et Industries Créatives 2025',
    title_en: 'Master 2 in Culture and Creative Industries 2025',
    title_ar: 'ماجستير 2 في الثقافة والصناعات الإبداعية 2025',
    type: 'candidature',
    status: 'open',
    deadline: '2025-07-15',
    description_fr: 'Le campus d\'Abidjan lance son appel à candidatures pour le Master 2 en Culture et Industries Créatives, en partenariat avec le Ministère de la Culture et de la Francophonie. Formation axée sur le management culturel, l\'économie créative et la valorisation du patrimoine africain.',
    description_en: 'The Abidjan campus launches its call for applications for the Master 2 in Culture and Creative Industries, in partnership with the Ministry of Culture and Francophonie. Training focused on cultural management, creative economy and the enhancement of African heritage.',
    image: 'https://picsum.photos/seed/call-abidjan-culture/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/03.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/20.png'
    ],
    url: 'https://usenghor.org/candidatures/abidjan-culture',
    is_active: true
  },
  {
    id: 'call-abidjan-3',
    campus_id: 'campus-abidjan',
    title_fr: 'Bourses d\'excellence Francophonie - Campus Abidjan 2025',
    title_en: 'Francophonie Excellence Scholarships - Abidjan Campus 2025',
    title_ar: 'منح التميز الفرنكوفونية - حرم أبيدجان 2025',
    type: 'bourse',
    status: 'open',
    deadline: '2025-06-30',
    description_fr: 'L\'Organisation Internationale de la Francophonie (OIF) et l\'Université Senghor offrent 15 bourses d\'excellence couvrant les frais de scolarité et une allocation mensuelle pour les étudiants méritants souhaitant intégrer les Masters du campus d\'Abidjan.',
    description_en: 'The International Organization of La Francophonie (OIF) and Senghor University offer 15 excellence scholarships covering tuition fees and a monthly allowance for deserving students wishing to join the Masters programs at the Abidjan campus.',
    image: 'https://picsum.photos/seed/call-abidjan-bourse/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/04.jpg'
    ],
    url: 'https://usenghor.org/bourses/abidjan-excellence',
    is_active: true
  },
  {
    id: 'call-abidjan-4',
    campus_id: 'campus-abidjan',
    title_fr: 'Appel à projets Innovation et Développement Durable 2025',
    title_en: 'Call for Projects Innovation and Sustainable Development 2025',
    title_ar: 'دعوة لمشاريع الابتكار والتنمية المستدامة 2025',
    type: 'projet',
    status: 'open',
    deadline: '2025-08-31',
    description_fr: 'Le campus d\'Abidjan, avec le soutien de l\'Agence Universitaire de la Francophonie (AUF), lance un appel à projets destiné aux chercheurs et doctorants travaillant sur des solutions innovantes pour le développement durable en Afrique de l\'Ouest.',
    description_en: 'The Abidjan campus, with the support of the Agence Universitaire de la Francophonie (AUF), launches a call for projects for researchers and doctoral students working on innovative solutions for sustainable development in West Africa.',
    image: 'https://picsum.photos/seed/call-abidjan-innovation/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/1.png'
    ],
    url: 'https://usenghor.org/projets/abidjan-innovation',
    is_active: true
  },

  // Campus Tunis
  {
    id: 'call-tunis-1',
    campus_id: 'campus-tunis',
    title_fr: 'Bourses de mobilité Maghreb',
    title_en: 'Maghreb Mobility Scholarships',
    title_ar: 'منح التنقل للمغرب العربي',
    type: 'bourse',
    status: 'open',
    deadline: '2025-05-31',
    description_fr: 'Programme de bourses pour faciliter la mobilité des étudiants entre les campus du Maghreb.',
    description_en: 'Scholarship program to facilitate student mobility between Maghreb campuses.',
    image: 'https://picsum.photos/seed/call-tunis-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/27.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.jpg'
    ],
    is_active: true
  },

  // Campus Rabat
  {
    id: 'call-rabat-1',
    campus_id: 'campus-rabat',
    title_fr: 'Appel à candidatures Patrimoine Culturel',
    title_en: 'Cultural Heritage Applications Call',
    title_ar: 'دعوة للتقدم للتراث الثقافي',
    type: 'candidature',
    status: 'open',
    deadline: '2025-06-15',
    description_fr: 'Le campus de Rabat recrute pour son Master en Gestion du Patrimoine Culturel.',
    image: 'https://picsum.photos/seed/call-rabat-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/31.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/03.jpg'
    ],
    is_active: true
  },

  // Campus Libreville
  {
    id: 'call-libreville-1',
    campus_id: 'campus-libreville',
    title_fr: 'Appel à projets Forêts tropicales',
    title_en: 'Tropical Forests Projects Call',
    type: 'projet',
    status: 'open',
    deadline: '2025-08-30',
    description_fr: 'Projets de recherche sur la conservation des forêts du bassin du Congo.',
    image: 'https://picsum.photos/seed/call-libreville-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/25.jpg'
    ],
    is_active: true
  },

  // Campus Cotonou
  {
    id: 'call-cotonou-1',
    campus_id: 'campus-cotonou',
    title_fr: 'Master Santé Publique 2025',
    title_en: 'Public Health Master 2025',
    type: 'candidature',
    status: 'open',
    deadline: '2025-07-01',
    description_fr: 'Ouverture des candidatures pour le Master en Santé Publique, spécialisation Santé Communautaire.',
    image: 'https://picsum.photos/seed/call-cotonou-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/11.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg'
    ],
    is_active: true
  },

  // ============================================
  // APPELS CLOS - Campus Abidjan
  // ============================================
  {
    id: 'call-abidjan-closed-1',
    campus_id: 'campus-abidjan',
    title_fr: 'Master 2 Gestion des Ressources Humaines 2024',
    title_en: 'Master 2 Human Resources Management 2024',
    type: 'candidature',
    status: 'closed',
    deadline: '2024-06-30',
    description_fr: 'Formation destinée aux professionnels RH souhaitant renforcer leurs compétences en management des ressources humaines dans le contexte africain.',
    description_en: 'Training for HR professionals looking to strengthen their human resources management skills in the African context.',
    image: 'https://picsum.photos/seed/call-abidjan-rh-closed/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg'
    ],
    is_active: true
  },
  {
    id: 'call-abidjan-closed-2',
    campus_id: 'campus-abidjan',
    title_fr: 'Appel à projets Économie Sociale et Solidaire 2024',
    title_en: 'Social and Solidarity Economy Projects Call 2024',
    type: 'projet',
    status: 'closed',
    deadline: '2024-09-15',
    description_fr: 'Soutien aux projets innovants dans le domaine de l\'économie sociale et solidaire en Afrique de l\'Ouest.',
    description_en: 'Support for innovative projects in the field of social and solidarity economy in West Africa.',
    image: 'https://picsum.photos/seed/call-abidjan-ess-closed/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png'
    ],
    is_active: true
  },
  {
    id: 'call-abidjan-closed-3',
    campus_id: 'campus-abidjan',
    title_fr: 'Bourses de recherche doctorale 2024',
    title_en: 'Doctoral Research Scholarships 2024',
    type: 'bourse',
    status: 'closed',
    deadline: '2024-05-31',
    description_fr: 'Programme de bourses pour doctorants travaillant sur des thématiques liées au développement culturel africain.',
    description_en: 'Scholarship program for doctoral students working on topics related to African cultural development.',
    image: 'https://picsum.photos/seed/call-abidjan-doctorat-closed/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png'
    ],
    is_active: true
  },

  // ============================================
  // RECRUTEMENTS - Campus Abidjan
  // ============================================
  {
    id: 'recruit-abidjan-1',
    campus_id: 'campus-abidjan',
    title_fr: 'Enseignant-chercheur en Management culturel',
    title_en: 'Lecturer-Researcher in Cultural Management',
    type: 'recrutement',
    status: 'open',
    deadline: '2025-04-30',
    description_fr: 'Le campus d\'Abidjan recrute un enseignant-chercheur (H/F) spécialisé en management culturel et économie créative. Doctorat exigé avec une expérience d\'au moins 3 ans dans l\'enseignement supérieur.',
    description_en: 'The Abidjan campus is recruiting a lecturer-researcher (M/F) specialized in cultural management and creative economy. PhD required with at least 3 years of experience in higher education.',
    image: 'https://picsum.photos/seed/recruit-abidjan-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png'
    ],
    url: 'https://usenghor.org/recrutements/enseignant-culture',
    is_active: true
  },
  {
    id: 'recruit-abidjan-2',
    campus_id: 'campus-abidjan',
    title_fr: 'Coordinateur pédagogique',
    title_en: 'Academic Coordinator',
    type: 'recrutement',
    status: 'open',
    deadline: '2025-05-15',
    description_fr: 'Poste de coordinateur pédagogique pour assurer le suivi des programmes de Master et la coordination avec les universités partenaires. Master minimum, 5 ans d\'expérience.',
    description_en: 'Academic coordinator position to ensure monitoring of Master programs and coordination with partner universities. Minimum Master degree, 5 years of experience.',
    image: 'https://picsum.photos/seed/recruit-abidjan-2/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png'
    ],
    url: 'https://usenghor.org/recrutements/coordinateur-pedagogique',
    is_active: true
  },
  {
    id: 'recruit-abidjan-3',
    campus_id: 'campus-abidjan',
    title_fr: 'Assistant(e) administratif(ve) et financier(ère)',
    title_en: 'Administrative and Financial Assistant',
    type: 'recrutement',
    status: 'open',
    deadline: '2025-03-31',
    description_fr: 'Recrutement d\'un(e) assistant(e) pour la gestion administrative et financière du campus. BAC+3 en gestion, comptabilité ou administration. Maîtrise du français et de l\'anglais appréciée.',
    description_en: 'Recruitment of an assistant for administrative and financial management of the campus. Bachelor\'s degree in management, accounting or administration. French and English proficiency appreciated.',
    image: 'https://picsum.photos/seed/recruit-abidjan-3/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png'
    ],
    url: 'https://usenghor.org/recrutements/assistant-admin',
    is_active: true
  }
]
