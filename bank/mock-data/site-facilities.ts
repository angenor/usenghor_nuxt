// Types
export interface SiteFacility {
  id: string
  slug: string
  icon: string
  name_fr: string
  name_en: string
  name_ar: string
  description_fr: string
  description_en: string
  description_ar: string
  features_fr: string[]
  features_en: string[]
  features_ar: string[]
  image: string
  images: string[] // Multiple images for gallery/carousel
  capacity?: string
  sort_order: number
}

// Données mock des installations du siège d'Alexandrie
export const mockSiteFacilities: SiteFacility[] = [
  {
    id: 'facility-housing',
    slug: 'hebergement',
    icon: 'fa-solid fa-house',
    name_fr: 'Hébergement',
    name_en: 'Housing',
    name_ar: 'السكن',
    description_fr: 'La cité universitaire de l\'Université Senghor offre un cadre de vie confortable et propice aux études. Les résidences modernes accueillent les étudiants dans des chambres individuelles ou doubles, toutes équipées et climatisées.',
    description_en: 'The Senghor University residential complex offers a comfortable living environment conducive to study. Modern residences welcome students in single or double rooms, all equipped and air-conditioned.',
    description_ar: 'يوفر المجمع السكني لجامعة سنغور بيئة معيشية مريحة تساعد على الدراسة. تستقبل المساكن الحديثة الطلاب في غرف فردية أو مزدوجة، جميعها مجهزة ومكيفة.',
    features_fr: [
      'Chambres individuelles et doubles climatisées',
      'Connexion Wi-Fi haut débit',
      'Espaces communs et salons',
      'Buanderie et services de nettoyage',
      'Sécurité 24h/24'
    ],
    features_en: [
      'Air-conditioned single and double rooms',
      'High-speed Wi-Fi connection',
      'Common areas and lounges',
      'Laundry and cleaning services',
      '24/7 security'
    ],
    features_ar: [
      'غرف فردية ومزدوجة مكيفة',
      'اتصال واي فاي عالي السرعة',
      'مناطق مشتركة وصالات',
      'خدمات الغسيل والتنظيف',
      'أمن على مدار الساعة'
    ],
    image: 'https://picsum.photos/seed/senghor-housing/800/600',
    images: [
      'https://picsum.photos/seed/housing-exterior/800/600',
      'https://picsum.photos/seed/housing-room/800/600',
      'https://picsum.photos/seed/housing-lounge/800/600',
      'https://picsum.photos/seed/housing-corridor/800/600'
    ],
    capacity: '200 chambres',
    sort_order: 1
  },
  {
    id: 'facility-library',
    slug: 'bibliotheque',
    icon: 'fa-solid fa-book',
    name_fr: 'Bibliothèque',
    name_en: 'Library',
    name_ar: 'المكتبة',
    description_fr: 'La bibliothèque universitaire est un centre de ressources documentaires de référence pour la Francophonie. Elle dispose d\'un fonds riche couvrant tous les domaines d\'enseignement de l\'université.',
    description_en: 'The university library is a reference documentary resource center for the Francophonie. It has a rich collection covering all the university\'s teaching areas.',
    description_ar: 'المكتبة الجامعية هي مركز موارد وثائقية مرجعي للفرانكوفونية. تمتلك مجموعة غنية تغطي جميع مجالات التدريس في الجامعة.',
    features_fr: [
      'Plus de 50 000 ouvrages et documents',
      'Accès aux bases de données numériques',
      'Salles de lecture climatisées',
      'Espaces de travail en groupe',
      'Postes informatiques',
      'Service de prêt inter-bibliothèques'
    ],
    features_en: [
      'Over 50,000 books and documents',
      'Access to digital databases',
      'Air-conditioned reading rooms',
      'Group work spaces',
      'Computer stations',
      'Inter-library loan service'
    ],
    features_ar: [
      'أكثر من 50,000 كتاب ووثيقة',
      'الوصول إلى قواعد البيانات الرقمية',
      'قاعات قراءة مكيفة',
      'مساحات للعمل الجماعي',
      'محطات حاسوب',
      'خدمة الإعارة بين المكتبات'
    ],
    image: 'https://picsum.photos/seed/senghor-library/800/600',
    images: [
      'https://picsum.photos/seed/library-main/800/600',
      'https://picsum.photos/seed/library-reading/800/600',
      'https://picsum.photos/seed/library-shelves/800/600',
      'https://picsum.photos/seed/library-study/800/600'
    ],
    capacity: '150 places assises',
    sort_order: 2
  },
  {
    id: 'facility-conference',
    slug: 'salles-conference',
    icon: 'fa-solid fa-microphone',
    name_fr: 'Salles de Conférence',
    name_en: 'Conference Halls',
    name_ar: 'قاعات المؤتمرات',
    description_fr: 'L\'Université Senghor dispose de plusieurs espaces événementiels de grande capacité pour accueillir conférences internationales, colloques, soutenances de thèses et cérémonies officielles.',
    description_en: 'Senghor University has several large-capacity event spaces to host international conferences, symposia, thesis defenses and official ceremonies.',
    description_ar: 'تمتلك جامعة سنغور عدة مساحات للفعاليات ذات سعة كبيرة لاستضافة المؤتمرات الدولية والندوات ومناقشات الأطروحات والاحتفالات الرسمية.',
    features_fr: [
      'Amphithéâtre principal (300 places)',
      'Salle de conférence (150 places)',
      'Salles de réunion modulables',
      'Équipements audiovisuels modernes',
      'Traduction simultanée',
      'Vidéoconférence'
    ],
    features_en: [
      'Main amphitheater (300 seats)',
      'Conference room (150 seats)',
      'Modular meeting rooms',
      'Modern audiovisual equipment',
      'Simultaneous translation',
      'Video conferencing'
    ],
    features_ar: [
      'المدرج الرئيسي (300 مقعد)',
      'قاعة المؤتمرات (150 مقعد)',
      'غرف اجتماعات قابلة للتعديل',
      'معدات سمعية بصرية حديثة',
      'ترجمة فورية',
      'مؤتمرات الفيديو'
    ],
    image: 'https://picsum.photos/seed/senghor-conference/800/600',
    images: [
      'https://picsum.photos/seed/conference-amphitheater/800/600',
      'https://picsum.photos/seed/conference-hall/800/600',
      'https://picsum.photos/seed/conference-meeting/800/600',
      'https://picsum.photos/seed/conference-event/800/600'
    ],
    capacity: '500 places totales',
    sort_order: 3
  },
  {
    id: 'facility-academic',
    slug: 'espaces-academiques',
    icon: 'fa-solid fa-chalkboard',
    name_fr: 'Espaces Académiques',
    name_en: 'Academic Spaces',
    name_ar: 'المساحات الأكاديمية',
    description_fr: 'Les espaces académiques de l\'Université Senghor comprennent des salles de cours modernes, des laboratoires informatiques et des ateliers pratiques adaptés aux besoins pédagogiques.',
    description_en: 'Senghor University\'s academic spaces include modern classrooms, computer labs and practical workshops adapted to educational needs.',
    description_ar: 'تشمل المساحات الأكاديمية لجامعة سنغور فصولاً دراسية حديثة ومختبرات حاسوب وورش عمل عملية مكيفة للاحتياجات التعليمية.',
    features_fr: [
      '20 salles de cours climatisées',
      'Laboratoires informatiques équipés',
      'Tableaux interactifs',
      'Espaces de coworking',
      'Salles de travaux pratiques',
      'Connexion internet haut débit'
    ],
    features_en: [
      '20 air-conditioned classrooms',
      'Equipped computer labs',
      'Interactive whiteboards',
      'Coworking spaces',
      'Practical work rooms',
      'High-speed internet connection'
    ],
    features_ar: [
      '20 فصلاً دراسياً مكيفاً',
      'مختبرات حاسوب مجهزة',
      'لوحات تفاعلية',
      'مساحات عمل مشتركة',
      'غرف أعمال تطبيقية',
      'اتصال إنترنت عالي السرعة'
    ],
    image: 'https://picsum.photos/seed/senghor-academic/800/600',
    images: [
      'https://picsum.photos/seed/academic-classroom/800/600',
      'https://picsum.photos/seed/academic-lab/800/600',
      'https://picsum.photos/seed/academic-coworking/800/600',
      'https://picsum.photos/seed/academic-workshop/800/600'
    ],
    capacity: '600 étudiants',
    sort_order: 4
  },
  {
    id: 'facility-sports',
    slug: 'installations-sportives',
    icon: 'fa-solid fa-futbol',
    name_fr: 'Installations Sportives',
    name_en: 'Sports Facilities',
    name_ar: 'المرافق الرياضية',
    description_fr: 'Le campus dispose d\'installations sportives variées permettant aux étudiants de pratiquer différentes activités physiques et de maintenir un équilibre entre études et bien-être.',
    description_en: 'The campus has various sports facilities allowing students to practice different physical activities and maintain a balance between studies and well-being.',
    description_ar: 'يضم الحرم الجامعي مرافق رياضية متنوعة تسمح للطلاب بممارسة أنشطة بدنية مختلفة والحفاظ على التوازن بين الدراسة والرفاهية.',
    features_fr: [
      'Gymnase polyvalent',
      'Terrain de football',
      'Courts de tennis',
      'Salle de fitness',
      'Terrain de basketball',
      'Vestiaires équipés'
    ],
    features_en: [
      'Multipurpose gymnasium',
      'Football field',
      'Tennis courts',
      'Fitness room',
      'Basketball court',
      'Equipped changing rooms'
    ],
    features_ar: [
      'صالة رياضية متعددة الأغراض',
      'ملعب كرة قدم',
      'ملاعب تنس',
      'غرفة لياقة بدنية',
      'ملعب كرة سلة',
      'غرف تبديل ملابس مجهزة'
    ],
    image: 'https://picsum.photos/seed/senghor-sports/800/600',
    images: [
      'https://picsum.photos/seed/sports-gymnasium/800/600',
      'https://picsum.photos/seed/sports-football/800/600',
      'https://picsum.photos/seed/sports-tennis/800/600',
      'https://picsum.photos/seed/sports-fitness/800/600'
    ],
    sort_order: 5
  },
  {
    id: 'facility-pool',
    slug: 'piscine',
    icon: 'fa-solid fa-water-ladder',
    name_fr: 'Piscine',
    name_en: 'Swimming Pool',
    name_ar: 'حمام السباحة',
    description_fr: 'La piscine du campus offre un espace de détente et de sport aquatique. Elle est accessible aux étudiants et au personnel tout au long de l\'année.',
    description_en: 'The campus swimming pool offers a space for relaxation and water sports. It is accessible to students and staff throughout the year.',
    description_ar: 'يوفر حمام السباحة في الحرم الجامعي مساحة للاسترخاء والرياضات المائية. وهو متاح للطلاب والموظفين على مدار العام.',
    features_fr: [
      'Piscine semi-olympique (25m)',
      'Eau traitée et contrôlée',
      'Horaires réservés femmes/hommes',
      'Cours de natation disponibles',
      'Vestiaires séparés',
      'Surveillance par maître-nageur'
    ],
    features_en: [
      'Semi-Olympic pool (25m)',
      'Treated and controlled water',
      'Reserved hours for women/men',
      'Swimming lessons available',
      'Separate changing rooms',
      'Lifeguard supervision'
    ],
    features_ar: [
      'مسبح شبه أولمبي (25 متر)',
      'مياه معالجة ومراقبة',
      'ساعات مخصصة للنساء/الرجال',
      'دروس سباحة متاحة',
      'غرف تبديل ملابس منفصلة',
      'إشراف منقذ'
    ],
    image: 'https://picsum.photos/seed/senghor-pool/800/600',
    images: [
      'https://picsum.photos/seed/pool-main/800/600',
      'https://picsum.photos/seed/pool-terrace/800/600',
      'https://picsum.photos/seed/pool-changing/800/600',
      'https://picsum.photos/seed/pool-sunset/800/600'
    ],
    capacity: '50 nageurs',
    sort_order: 6
  },
  {
    id: 'facility-hotel',
    slug: 'hotel',
    icon: 'fa-solid fa-hotel',
    name_fr: 'Hôtel',
    name_en: 'Hotel',
    name_ar: 'الفندق',
    description_fr: 'L\'hôtel du campus accueille les visiteurs, intervenants extérieurs et partenaires de l\'université. Il offre un hébergement de qualité à proximité immédiate des installations académiques.',
    description_en: 'The campus hotel welcomes visitors, external speakers and university partners. It offers quality accommodation in immediate proximity to academic facilities.',
    description_ar: 'يستقبل فندق الحرم الجامعي الزوار والمتحدثين الخارجيين وشركاء الجامعة. يوفر إقامة عالية الجودة على مقربة من المرافق الأكاديمية.',
    features_fr: [
      '30 chambres confortables',
      'Chambres climatisées avec salle de bain',
      'Service de restauration',
      'Wi-Fi gratuit',
      'Vue sur la Méditerranée',
      'Réception 24h/24'
    ],
    features_en: [
      '30 comfortable rooms',
      'Air-conditioned rooms with bathroom',
      'Catering service',
      'Free Wi-Fi',
      'Mediterranean view',
      '24/7 reception'
    ],
    features_ar: [
      '30 غرفة مريحة',
      'غرف مكيفة مع حمام',
      'خدمة المطاعم',
      'واي فاي مجاني',
      'إطلالة على البحر المتوسط',
      'استقبال على مدار الساعة'
    ],
    image: 'https://picsum.photos/seed/senghor-hotel/800/600',
    images: [
      'https://picsum.photos/seed/hotel-facade/800/600',
      'https://picsum.photos/seed/hotel-room/800/600',
      'https://picsum.photos/seed/hotel-restaurant/800/600',
      'https://picsum.photos/seed/hotel-sea-view/800/600'
    ],
    capacity: '30 chambres',
    sort_order: 7
  }
]
