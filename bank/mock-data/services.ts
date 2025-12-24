/**
 * Mock Data: Services
 * Table SQL: services
 */

export type ServiceCategory = 'rectorat' | 'academique' | 'administratif'

export interface Service {
  id: string
  slug: string
  category: ServiceCategory
  name_fr: string
  name_en: string
  name_ar: string
  description_fr?: string
  icon: string
  head_id?: string
  email?: string
  phone?: string
  location?: string
  sort_order: number
  is_active: boolean
}

export const mockServices: Service[] = [
  // === RECTORAT ===
  {
    id: 'srv-cabinet',
    slug: 'cabinet',
    category: 'rectorat',
    name_fr: 'Cabinet du Recteur',
    name_en: 'Rector\'s Office',
    name_ar: 'مكتب العميد',
    description_fr: 'Le cabinet assure le secrétariat et la coordination des activités du Recteur.',
    icon: 'building-columns',
    email: 'cabinet@usenghor.org',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'srv-communication',
    slug: 'communication',
    category: 'rectorat',
    name_fr: 'Service Communication',
    name_en: 'Communication Service',
    name_ar: 'خدمة الاتصالات',
    description_fr: 'Gestion de la communication interne et externe de l\'Université.',
    icon: 'megaphone',
    email: 'communication@usenghor.org',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'srv-direction-campus',
    slug: 'direction-campus',
    category: 'rectorat',
    name_fr: 'Direction des Campus',
    name_en: 'Campus Direction',
    name_ar: 'إدارة الحرم الجامعي',
    description_fr: 'Coordination des campus externalisés et relations avec les partenaires locaux.',
    icon: 'map',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'srv-developpement',
    slug: 'developpement-entrepreneuriat',
    category: 'rectorat',
    name_fr: 'Direction du Développement et de l\'Entrepreneuriat',
    name_en: 'Development and Entrepreneurship Direction',
    name_ar: 'إدارة التنمية وريادة الأعمال',
    icon: 'rocket',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'srv-relations-ext',
    slug: 'relations-exterieures',
    category: 'rectorat',
    name_fr: 'Direction des Relations Extérieures',
    name_en: 'External Relations Direction',
    name_ar: 'إدارة العلاقات الخارجية',
    icon: 'globe',
    sort_order: 5,
    is_active: true
  },
  {
    id: 'srv-alumni',
    slug: 'programme-alumni',
    category: 'rectorat',
    name_fr: 'Programme Alumni',
    name_en: 'Alumni Program',
    name_ar: 'برنامج الخريجين',
    icon: 'users',
    email: 'alumni@usenghor.org',
    sort_order: 6,
    is_active: true
  },

  // === SERVICES ACADÉMIQUES ===
  {
    id: 'srv-cifip',
    slug: 'cifip',
    category: 'academique',
    name_fr: 'Centre d\'Ingénierie de Formations et d\'Innovation Pédagogique',
    name_en: 'Training Engineering and Pedagogical Innovation Center',
    name_ar: 'مركز هندسة التدريب والابتكار التربوي',
    description_fr: 'Conception et innovation pédagogique des formations.',
    icon: 'lightbulb',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'srv-bibliotheque',
    slug: 'bibliotheque',
    category: 'academique',
    name_fr: 'Bibliothèque',
    name_en: 'Library',
    name_ar: 'المكتبة',
    description_fr: 'Ressources documentaires et espaces de travail pour étudiants et enseignants.',
    icon: 'book-open',
    email: 'bibliotheque@usenghor.org',
    location: 'Bâtiment A, RDC',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'srv-scolarite',
    slug: 'scolarite',
    category: 'academique',
    name_fr: 'Service de Scolarité',
    name_en: 'Academic Affairs',
    name_ar: 'خدمة الشؤون الأكاديمية',
    description_fr: 'Gestion des inscriptions, examens et diplômes.',
    icon: 'clipboard-list',
    email: 'scolarite@usenghor.org',
    phone: '+20 3 xxx xxxx',
    location: 'Bâtiment B, 1er étage',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'srv-informatique',
    slug: 'informatique',
    category: 'academique',
    name_fr: 'Service Informatique',
    name_en: 'IT Service',
    name_ar: 'خدمة تكنولوجيا المعلومات',
    description_fr: 'Support technique et infrastructure numérique.',
    icon: 'server',
    email: 'it@usenghor.org',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'srv-audiovisuel',
    slug: 'audiovisuel',
    category: 'academique',
    name_fr: 'Service Audiovisuel',
    name_en: 'Audiovisual Service',
    name_ar: 'خدمة السمعيات البصرية',
    icon: 'video',
    sort_order: 5,
    is_active: true
  },

  // === SERVICES ADMINISTRATIFS ===
  {
    id: 'srv-comptabilite',
    slug: 'comptabilite',
    category: 'administratif',
    name_fr: 'Service de la Comptabilité',
    name_en: 'Accounting Service',
    name_ar: 'خدمة المحاسبة',
    icon: 'calculator',
    email: 'comptabilite@usenghor.org',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'srv-personnel',
    slug: 'personnel-achats',
    category: 'administratif',
    name_fr: 'Service du Personnel et des Achats',
    name_en: 'Human Resources and Procurement',
    name_ar: 'خدمة الموارد البشرية والمشتريات',
    icon: 'users-cog',
    email: 'rh@usenghor.org',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'srv-qualite',
    slug: 'assurance-qualite',
    category: 'administratif',
    name_fr: 'Service de l\'Assurance Qualité et du Suivi-Évaluation',
    name_en: 'Quality Assurance and Monitoring-Evaluation',
    name_ar: 'خدمة ضمان الجودة والمتابعة والتقييم',
    icon: 'check-circle',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'srv-voyage',
    slug: 'bureau-voyage',
    category: 'administratif',
    name_fr: 'Bureau Voyage',
    name_en: 'Travel Office',
    name_ar: 'مكتب السفر',
    icon: 'plane',
    email: 'voyage@usenghor.org',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'srv-interieur',
    slug: 'service-interieur',
    category: 'administratif',
    name_fr: 'Service Intérieur',
    name_en: 'Internal Services',
    name_ar: 'الخدمات الداخلية',
    icon: 'home',
    sort_order: 5,
    is_active: true
  }
]
