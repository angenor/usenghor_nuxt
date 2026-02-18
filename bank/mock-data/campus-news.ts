/**
 * Mock Data: Actualités des Campus Externalisés
 */

export interface CampusNews {
  id: string
  campus_id: string
  project_id?: string // Optional link to a project
  title_fr: string
  title_en?: string
  title_ar?: string
  date: string
  excerpt_fr: string
  excerpt_en?: string
  image?: string
  url?: string
  is_featured?: boolean
}

export const mockCampusNews: CampusNews[] = [
  // Siège - Alexandrie
  {
    id: 'news-siege-1',
    campus_id: 'siege',
    title_fr: 'L\'Université Senghor célèbre ses 35 ans au service de la Francophonie',
    title_en: 'Senghor University celebrates 35 years serving the Francophonie',
    title_ar: 'جامعة سنغور تحتفل بمرور 35 عامًا في خدمة الفرانكوفونية',
    date: '2025-01-20',
    excerpt_fr: 'L\'Université Senghor d\'Alexandrie a célébré son 35e anniversaire en présence de nombreuses personnalités de la Francophonie.',
    excerpt_en: 'Senghor University of Alexandria celebrated its 35th anniversary in the presence of many Francophonie dignitaries.',
    image: '',
    url: '/actualites/35-ans-senghor',
    is_featured: true
  },
  {
    id: 'news-siege-2',
    campus_id: 'siege',
    title_fr: 'Nouveau partenariat stratégique avec l\'OIF',
    title_en: 'New Strategic Partnership with OIF',
    title_ar: 'شراكة استراتيجية جديدة مع المنظمة الدولية للفرنكوفونية',
    date: '2025-01-18',
    excerpt_fr: 'L\'Université Senghor renforce sa collaboration avec l\'Organisation Internationale de la Francophonie pour développer de nouveaux programmes.',
    excerpt_en: 'Senghor University strengthens its collaboration with the International Organization of the Francophonie to develop new programs.',
    image: '',
    is_featured: true
  },
  {
    id: 'news-siege-3',
    campus_id: 'siege',
    title_fr: 'Rentrée académique 2024-2025 : record d\'inscriptions',
    title_en: '2024-2025 Academic Year: Record Enrollments',
    title_ar: 'العام الدراسي 2024-2025: رقم قياسي في التسجيلات',
    date: '2025-01-10',
    excerpt_fr: 'L\'Université Senghor accueille cette année un nombre record d\'étudiants venus de 35 pays francophones.',
    excerpt_en: 'Senghor University welcomes a record number of students from 35 French-speaking countries this year.',
    image: ''
  },
  {
    id: 'news-siege-4',
    campus_id: 'siege',
    title_fr: 'Visite officielle du Secrétaire général de la Francophonie',
    title_en: 'Official Visit of the Secretary General of the Francophonie',
    title_ar: 'زيارة رسمية للأمين العام للفرانكوفونية',
    date: '2024-12-15',
    excerpt_fr: 'Le Secrétaire général de l\'OIF a effectué une visite de travail à l\'Université Senghor pour discuter des perspectives de coopération.',
    excerpt_en: 'The OIF Secretary General made a working visit to Senghor University to discuss cooperation prospects.',
    image: ''
  },
  {
    id: 'news-siege-5',
    campus_id: 'siege',
    title_fr: 'Lancement du nouveau Master en Intelligence Artificielle et Développement',
    title_en: 'Launch of New Master in AI and Development',
    title_ar: 'إطلاق ماجستير جديد في الذكاء الاصطناعي والتنمية',
    date: '2024-12-01',
    excerpt_fr: 'L\'Université Senghor lance un programme innovant alliant intelligence artificielle et problématiques de développement en Afrique.',
    excerpt_en: 'Senghor University launches an innovative program combining artificial intelligence with development issues in Africa.',
    image: ''
  },
  {
    id: 'news-siege-6',
    campus_id: 'siege',
    title_fr: 'Publication du rapport annuel 2024',
    title_en: '2024 Annual Report Published',
    title_ar: 'نشر التقرير السنوي 2024',
    date: '2024-11-20',
    excerpt_fr: 'Le rapport annuel 2024 met en lumière les réalisations de l\'université et ses perspectives de développement.',
    excerpt_en: 'The 2024 annual report highlights the university\'s achievements and development prospects.',
    image: ''
  },
  {
    id: 'news-siege-7',
    campus_id: 'siege',
    title_fr: 'Conférence internationale sur la gouvernance en Afrique',
    title_en: 'International Conference on Governance in Africa',
    title_ar: 'مؤتمر دولي حول الحوكمة في أفريقيا',
    date: '2024-11-05',
    excerpt_fr: 'L\'Université Senghor a organisé une conférence réunissant experts et décideurs autour des enjeux de gouvernance.',
    excerpt_en: 'Senghor University organized a conference bringing together experts and decision-makers on governance issues.',
    image: ''
  },
  {
    id: 'news-siege-8',
    campus_id: 'siege',
    title_fr: 'Signature d\'un accord avec l\'Université du Caire',
    title_en: 'Agreement Signed with Cairo University',
    title_ar: 'توقيع اتفاقية مع جامعة القاهرة',
    date: '2024-10-25',
    excerpt_fr: 'Un accord de coopération académique a été signé entre l\'Université Senghor et l\'Université du Caire.',
    excerpt_en: 'An academic cooperation agreement was signed between Senghor University and Cairo University.',
    image: ''
  },

  // Campus Dakar
  {
    id: 'news-dakar-1',
    campus_id: 'campus-dakar',
    title_fr: 'Nouveau partenariat avec l\'Université de Bordeaux',
    title_en: 'New Partnership with University of Bordeaux',
    date: '2025-01-15',
    excerpt_fr: 'Le campus de Dakar signe un accord de coopération avec l\'Université de Bordeaux pour renforcer les échanges académiques.',
    excerpt_en: 'The Dakar campus signs a cooperation agreement with the University of Bordeaux to strengthen academic exchanges.',
    image: '',
    url: '/actualites/partenariat-bordeaux'
  },
  {
    id: 'news-dakar-2',
    campus_id: 'campus-dakar',
    title_fr: 'Succès de la promotion 2024 : 95% d\'insertion professionnelle',
    title_en: '2024 Cohort Success: 95% Employment Rate',
    date: '2024-12-20',
    excerpt_fr: 'Les diplômés du Master Management affichent un taux d\'insertion professionnelle exceptionnel.',
    image: ''
  },

  // Campus Yaoundé
  {
    id: 'news-yaounde-1',
    campus_id: 'campus-yaounde',
    title_fr: 'Lancement du programme de recherche sur les forêts équatoriales',
    title_en: 'Launch of Equatorial Forests Research Program',
    date: '2025-01-10',
    excerpt_fr: 'Le campus de Yaoundé lance un programme de recherche ambitieux sur la préservation des forêts équatoriales.',
    image: ''
  },
  {
    id: 'news-yaounde-2',
    campus_id: 'campus-yaounde',
    title_fr: 'Visite officielle du Ministre de l\'Environnement',
    title_en: 'Official Visit from the Minister of Environment',
    date: '2024-11-28',
    excerpt_fr: 'Le Ministre de l\'Environnement a visité le campus pour discuter des collaborations futures.',
    image: ''
  },

  // Campus Abidjan
  {
    id: 'news-abidjan-1',
    campus_id: 'campus-abidjan',
    title_fr: 'Le campus d\'Abidjan accueille le MASA 2025',
    title_en: 'Abidjan Campus Hosts MASA 2025',
    date: '2025-01-05',
    excerpt_fr: 'Le campus sera partenaire officiel du Marché des Arts du Spectacle Africain en mars 2025. Cette collaboration permettra aux étudiants de participer activement à l\'organisation de cet événement majeur de la scène culturelle africaine.',
    excerpt_en: 'The campus will be an official partner of the African Performing Arts Market in March 2025. This collaboration will allow students to actively participate in organizing this major event on the African cultural scene.',
    image: '',
    url: '/actualites/masa-2025'
  },
  {
    id: 'news-abidjan-2',
    campus_id: 'campus-abidjan',
    title_fr: 'Exposition des travaux d\'étudiants au Musée des Civilisations',
    title_en: 'Student Works Exhibition at Museum of Civilizations',
    date: '2024-12-15',
    excerpt_fr: 'Les étudiants du Master Culture présentent leurs projets de fin d\'études au musée. Une occasion unique de découvrir les talents émergents de la scène culturelle ivoirienne.',
    excerpt_en: 'Master Culture students present their final projects at the museum. A unique opportunity to discover emerging talents from the Ivorian cultural scene.',
    image: ''
  },
  {
    id: 'news-abidjan-3',
    campus_id: 'campus-abidjan',
    title_fr: 'Signature d\'un accord avec l\'ENA de Côte d\'Ivoire',
    title_en: 'Agreement Signed with ENA of Ivory Coast',
    date: '2024-11-28',
    excerpt_fr: 'Le campus renforce son partenariat stratégique avec l\'École Nationale d\'Administration pour la formation des cadres de la fonction publique ivoirienne.',
    excerpt_en: 'The campus strengthens its strategic partnership with the National School of Administration for training Ivorian civil service executives.',
    image: ''
  },
  {
    id: 'news-abidjan-4',
    campus_id: 'campus-abidjan',
    title_fr: 'Remise des diplômes de la promotion 2024',
    title_en: '2024 Graduation Ceremony',
    date: '2024-10-20',
    excerpt_fr: 'Cérémonie officielle de remise des diplômes en présence du Ministre de l\'Enseignement Supérieur. 85 diplômés ont été célébrés cette année.',
    excerpt_en: 'Official graduation ceremony in the presence of the Minister of Higher Education. 85 graduates were celebrated this year.',
    image: ''
  },
  {
    id: 'news-abidjan-5',
    campus_id: 'campus-abidjan',
    title_fr: 'Lancement du programme de mentorat avec les alumni',
    title_en: 'Launch of Alumni Mentorship Program',
    date: '2024-09-15',
    excerpt_fr: 'Un nouveau programme de mentorat connecte les étudiants actuels avec les anciens diplômés occupant des postes stratégiques en Afrique de l\'Ouest.',
    excerpt_en: 'A new mentorship program connects current students with alumni holding strategic positions in West Africa.',
    image: ''
  },
  {
    id: 'news-abidjan-6',
    campus_id: 'campus-abidjan',
    title_fr: 'Conférence internationale sur le développement durable en Afrique',
    title_en: 'International Conference on Sustainable Development in Africa',
    date: '2024-08-22',
    excerpt_fr: 'Le campus a organisé une conférence réunissant des experts internationaux sur les enjeux du développement durable en Afrique subsaharienne.',
    excerpt_en: 'The campus organized a conference bringing together international experts on sustainable development challenges in sub-Saharan Africa.',
    image: ''
  },
  {
    id: 'news-abidjan-7',
    campus_id: 'campus-abidjan',
    title_fr: 'Ouverture des inscriptions pour la rentrée 2025',
    title_en: 'Registration Open for 2025 Academic Year',
    date: '2024-07-10',
    excerpt_fr: 'Les candidatures sont ouvertes pour les Masters en Management, Culture et Politiques Publiques. Date limite : 30 septembre 2024.',
    excerpt_en: 'Applications are open for Masters in Management, Culture and Public Policy. Deadline: September 30, 2024.',
    image: ''
  },
  {
    id: 'news-abidjan-8',
    campus_id: 'campus-abidjan',
    title_fr: 'Visite de la Secrétaire Générale de l\'OIF',
    title_en: 'Visit from OIF Secretary General',
    date: '2024-06-05',
    excerpt_fr: 'La Secrétaire Générale de l\'Organisation Internationale de la Francophonie a visité le campus et rencontré les étudiants.',
    excerpt_en: 'The Secretary General of the International Organization of the Francophonie visited the campus and met with students.',
    image: ''
  },
  {
    id: 'news-abidjan-9',
    campus_id: 'campus-abidjan',
    title_fr: 'Hackathon Innovation Sociale : 48h pour changer le monde',
    title_en: 'Social Innovation Hackathon: 48 Hours to Change the World',
    date: '2024-05-18',
    excerpt_fr: 'Plus de 100 étudiants ont participé au hackathon pour développer des solutions innovantes aux défis sociaux de la Côte d\'Ivoire.',
    excerpt_en: 'Over 100 students participated in the hackathon to develop innovative solutions to Ivory Coast\'s social challenges.',
    image: ''
  },
  {
    id: 'news-abidjan-10',
    campus_id: 'campus-abidjan',
    title_fr: 'Nouveau laboratoire numérique inauguré',
    title_en: 'New Digital Lab Inaugurated',
    date: '2024-04-12',
    excerpt_fr: 'Un laboratoire équipé des dernières technologies a été inauguré pour accompagner la transformation digitale de nos formations.',
    excerpt_en: 'A laboratory equipped with the latest technologies was inaugurated to support the digital transformation of our programs.',
    image: ''
  },

  // Campus Tunis
  {
    id: 'news-tunis-1',
    campus_id: 'campus-tunis',
    title_fr: 'Accréditation internationale pour le Master Santé Publique',
    title_en: 'International Accreditation for Public Health Master',
    title_ar: 'اعتماد دولي لماجستير الصحة العامة',
    date: '2025-01-08',
    excerpt_fr: 'Le Master Santé Publique du campus de Tunis obtient l\'accréditation de l\'APHEA.',
    excerpt_en: 'The Public Health Master at the Tunis campus receives APHEA accreditation.',
    image: ''
  },
  {
    id: 'news-tunis-2',
    campus_id: 'campus-tunis',
    title_fr: 'Coopération renforcée avec l\'OMS Afrique du Nord',
    title_en: 'Strengthened Cooperation with WHO North Africa',
    date: '2024-12-10',
    excerpt_fr: 'Signature d\'un protocole d\'accord avec le bureau régional de l\'OMS.',
    image: ''
  },

  // Campus Rabat
  {
    id: 'news-rabat-1',
    campus_id: 'campus-rabat',
    title_fr: 'Le campus de Rabat classé parmi les meilleures formations en patrimoine',
    title_en: 'Rabat Campus Ranked Among Top Heritage Programs',
    title_ar: 'تصنيف فرع الرباط ضمن أفضل برامج التراث',
    date: '2025-01-12',
    excerpt_fr: 'Le Master en Gestion du Patrimoine Culturel est reconnu par l\'UNESCO comme formation d\'excellence.',
    image: ''
  },
  {
    id: 'news-rabat-2',
    campus_id: 'campus-rabat',
    title_fr: 'Projet de restauration de la médina de Fès',
    title_en: 'Fez Medina Restoration Project',
    date: '2024-11-20',
    excerpt_fr: 'Les étudiants participent à un projet de restauration dans le cadre de leur formation.',
    image: ''
  },

  // Campus Libreville
  {
    id: 'news-libreville-1',
    campus_id: 'campus-libreville',
    title_fr: 'Nouvelle spécialisation en économie verte',
    title_en: 'New Specialization in Green Economy',
    date: '2025-01-03',
    excerpt_fr: 'Le campus lance une nouvelle spécialisation axée sur l\'économie verte et le développement durable.',
    image: ''
  },
  {
    id: 'news-libreville-2',
    campus_id: 'campus-libreville',
    title_fr: 'Mission de terrain dans les parcs nationaux du Gabon',
    title_en: 'Field Mission in Gabon National Parks',
    date: '2024-12-05',
    excerpt_fr: 'Les étudiants ont participé à une mission de terrain dans les parcs nationaux.',
    image: ''
  },

  // Campus Cotonou
  {
    id: 'news-cotonou-1',
    campus_id: 'campus-cotonou',
    title_fr: 'Partenariat avec le Ministère de la Santé du Bénin',
    title_en: 'Partnership with Benin Ministry of Health',
    date: '2025-01-06',
    excerpt_fr: 'Signature d\'un accord de partenariat pour renforcer la formation des cadres de santé.',
    image: ''
  },
  {
    id: 'news-cotonou-2',
    campus_id: 'campus-cotonou',
    title_fr: 'Stage hospitalier : retour sur une expérience enrichissante',
    title_en: 'Hospital Internship: A Rewarding Experience',
    date: '2024-11-25',
    excerpt_fr: 'Témoignages des étudiants sur leurs stages dans les hôpitaux partenaires.',
    image: ''
  },

  // ============================================
  // ACTUALITÉS LIÉES AUX PROJETS
  // ============================================

  // Transform'Action Africa - Actualités
  {
    id: 'news-transformaction-1',
    campus_id: 'siege',
    project_id: 'project-transformaction-africa',
    title_fr: 'Clôture de la Cohorte 2024 : 45 Transform\'acteurs diplômés',
    title_en: '2024 Cohort Closing: 45 Transform\'actors Graduated',
    title_ar: 'اختتام فوج 2024: تخرج 45 محولاً',
    date: '2025-01-10',
    excerpt_fr: 'La cérémonie de clôture de la Cohorte 2024 a célébré 45 cadres dirigeants venus de 12 pays africains, désormais équipés pour conduire le changement dans leurs organisations.',
    excerpt_en: 'The 2024 Cohort closing ceremony celebrated 45 senior executives from 12 African countries, now equipped to drive change in their organizations.',
    image: '',
    url: '/actualites/transformaction-cohorte-2024'
  },
  {
    id: 'news-transformaction-2',
    campus_id: 'siege',
    project_id: 'project-transformaction-africa',
    title_fr: 'Session présentielle à Abidjan : immersion dans l\'innovation publique',
    title_en: 'In-person Session in Abidjan: Immersion in Public Innovation',
    title_ar: 'الجلسة الحضورية في أبيدجان: الانغماس في الابتكار العام',
    date: '2024-11-15',
    excerpt_fr: 'La deuxième session présentielle de la Cohorte 2024 s\'est tenue à Abidjan avec des ateliers sur l\'innovation dans le secteur public africain.',
    excerpt_en: 'The second in-person session of the 2024 Cohort was held in Abidjan with workshops on innovation in the African public sector.',
    image: ''
  },
  {
    id: 'news-transformaction-3',
    campus_id: 'siege',
    project_id: 'project-transformaction-africa',
    title_fr: 'Nouveau partenariat avec le PNUD pour Transform\'Action Africa',
    title_en: 'New Partnership with UNDP for Transform\'Action Africa',
    title_ar: 'شراكة جديدة مع برنامج الأمم المتحدة الإنمائي',
    date: '2024-09-20',
    excerpt_fr: 'L\'Université Senghor et le PNUD signent un accord de partenariat pour renforcer l\'impact de Transform\'Action Africa sur la gouvernance publique.',
    excerpt_en: 'Senghor University and UNDP sign a partnership agreement to strengthen Transform\'Action Africa\'s impact on public governance.',
    image: ''
  },
  {
    id: 'news-transformaction-4',
    campus_id: 'siege',
    project_id: 'project-transformaction-africa',
    title_fr: 'Témoignage : Marie Koné, Transform\'actrice 2023',
    title_en: 'Testimonial: Marie Koné, Transform\'actor 2023',
    title_ar: 'شهادة: ماري كوني، محولة 2023',
    date: '2024-07-05',
    excerpt_fr: 'Marie Koné, Directrice des Ressources Humaines au Ministère de la Fonction Publique de Côte d\'Ivoire, partage son expérience Transform\'Action.',
    excerpt_en: 'Marie Koné, HR Director at the Ministry of Public Service of Côte d\'Ivoire, shares her Transform\'Action experience.',
    image: ''
  },

  // KreAfrika - Actualités
  {
    id: 'news-kreafrika-1',
    campus_id: 'siege',
    project_id: 'project-kreafrika',
    title_fr: 'KreAfrika au Festival de Cannes 2025',
    title_en: 'KreAfrika at Cannes Festival 2025',
    title_ar: 'كري أفريكا في مهرجان كان 2025',
    date: '2025-01-08',
    excerpt_fr: 'KreAfrika sera présent au Marché du Film de Cannes 2025 pour accompagner 10 professionnels africains du cinéma et de l\'audiovisuel.',
    excerpt_en: 'KreAfrika will be present at the Cannes Film Market 2025 to support 10 African cinema and audiovisual professionals.',
    image: '',
    url: '/actualites/kreafrika-cannes-2025'
  },
  {
    id: 'news-kreafrika-2',
    campus_id: 'siege',
    project_id: 'project-kreafrika',
    title_fr: 'Séminaire de Kinshasa : 120 professionnels formés',
    title_en: 'Kinshasa Seminar: 120 Professionals Trained',
    title_ar: 'ندوة كينشاسا: تدريب 120 محترفاً',
    date: '2024-12-01',
    excerpt_fr: 'Le séminaire régional KreAfrika de Kinshasa a réuni 120 professionnels des industries créatives d\'Afrique centrale sur la gestion des équipements culturels.',
    excerpt_en: 'The KreAfrika regional seminar in Kinshasa brought together 120 creative industries professionals from Central Africa on cultural facility management.',
    image: ''
  },
  {
    id: 'news-kreafrika-3',
    campus_id: 'siege',
    project_id: 'project-kreafrika',
    title_fr: 'Lancement de la plateforme e-learning KreAfrika',
    title_en: 'Launch of KreAfrika E-learning Platform',
    title_ar: 'إطلاق منصة التعلم الإلكتروني كري أفريكا',
    date: '2024-10-15',
    excerpt_fr: 'La nouvelle plateforme de formation en ligne KreAfrika propose 15 modules gratuits pour les professionnels des industries créatives africaines.',
    excerpt_en: 'The new KreAfrika online training platform offers 15 free modules for African creative industries professionals.',
    image: ''
  },
  {
    id: 'news-kreafrika-4',
    campus_id: 'campus-abidjan',
    project_id: 'project-kreafrika',
    title_fr: 'KreAfrika et le MASA : un partenariat renforcé',
    title_en: 'KreAfrika and MASA: A Strengthened Partnership',
    title_ar: 'كري أفريكا وMASA: شراكة معززة',
    date: '2024-08-20',
    excerpt_fr: 'KreAfrika devient partenaire officiel du Marché des Arts du Spectacle Africain (MASA) pour les éditions 2025 et 2026.',
    excerpt_en: 'KreAfrika becomes official partner of the African Performing Arts Market (MASA) for the 2025 and 2026 editions.',
    image: ''
  }
]
