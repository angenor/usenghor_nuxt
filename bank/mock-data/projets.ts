/**
 * Mock Data: Projets de l'Université Senghor (Admin)
 * Gestion complète des projets institutionnels pour le back-office
 */

import type { EditorJSContent } from './news'

// Types
export type ProjectStatus = 'planned' | 'ongoing' | 'completed' | 'suspended'
export type PublicationStatus = 'draft' | 'published' | 'archived'

export interface ProjectPartner {
  id: string
  partner_id: string
  name: string
  logo?: string
  website?: string
  role?: string
}

export interface ProjectCountry {
  id: string
  name: string
  code: string // ISO 3166-1 alpha-2
}

export interface Project {
  id: string
  slug: string
  title_fr: string
  title_en: string
  title_ar: string
  summary_fr?: string
  summary_en?: string
  summary_ar?: string
  /** Contenu riche FR (EditorJS format) */
  description_fr?: EditorJSContent
  /** Contenu riche EN (EditorJS format) */
  description_en?: EditorJSContent
  /** Contenu riche AR (EditorJS format) */
  description_ar?: EditorJSContent
  /** Legacy: description texte brut (pour migration) */
  description_text_fr?: string
  description_text_en?: string
  description_text_ar?: string
  cover_image?: string
  cover_image_alt?: string
  gallery?: string[]
  // Classifications
  category_ids: string[]
  department_id?: string
  department_name?: string
  manager_id?: string
  manager_name?: string
  // Dates et budget
  start_date: string
  end_date?: string
  budget?: number
  currency: string
  // Portée
  beneficiaries?: string
  countries: ProjectCountry[]
  partners: ProjectPartner[]
  // Statuts
  status: ProjectStatus
  publication_status: PublicationStatus
  featured: boolean
  // Liens
  website?: string
  album_id?: string
  // Métadonnées
  created_at: string
  updated_at: string
  published_at?: string
}

export interface ProjectFilters {
  search?: string
  status?: ProjectStatus
  publication_status?: PublicationStatus
  category_id?: string
  department_id?: string
  country_code?: string
  partner_id?: string
  date_from?: string
  date_to?: string
  featured?: boolean
}

export interface ProjectStats {
  total: number
  byStatus: Record<ProjectStatus, number>
  byPublicationStatus: Record<PublicationStatus, number>
  featured: number
  totalBudget: number
}

// Labels et couleurs
export const projectStatusLabels: Record<ProjectStatus, string> = {
  planned: 'Planifié',
  ongoing: 'En cours',
  completed: 'Terminé',
  suspended: 'Suspendu'
}

export const projectStatusColors: Record<ProjectStatus, string> = {
  planned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

export const projectPublicationStatusLabels: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé'
}

export const projectPublicationStatusColors: Record<PublicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
}

// Helper function to get flag emoji from country code
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Générer un nouvel ID
export function generateProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function generateProjectPartnerId(): string {
  return `pp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function generateProjectCountryId(): string {
  return `pc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Générer un slug
export function slugifyProject(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Données mock
export const mockProjects: Project[] = [
  {
    id: 'project-transformaction-africa',
    slug: 'transformaction-africa',
    title_fr: 'Transform\'Action Africa',
    title_en: 'Transform\'Action Africa',
    title_ar: 'ترانسفورم أكشن أفريكا',
    summary_fr: 'Transform\'Action Africa est un parcours pédagogique, collectif et créatif, conçu pour les leaders qui conduisent des dynamiques de transformation structurelle au sein des organisations publiques africaines.',
    summary_en: 'Transform\'Action Africa is a pedagogical, collective and creative pathway designed for leaders driving structural transformation dynamics within African public organizations.',
    summary_ar: 'ترانسفورم أكشن أفريكا هو مسار تعليمي جماعي وإبداعي، مصمم للقادة الذين يقودون ديناميكيات التحول الهيكلي داخل المنظمات العامة الأفريقية.',
    description_fr: {
      time: 1705747200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'ta1',
          type: 'paragraph',
          data: {
            text: '<b>Transform\'Action Africa</b> est un parcours pédagogique, collectif et créatif, conçu pour les leaders qui conduisent des dynamiques de transformation structurelle au sein des organisations publiques africaines, au service de la transition sociale et écologique.'
          }
        },
        {
          id: 'ta2',
          type: 'header',
          data: {
            text: 'Notre mission',
            level: 2
          }
        },
        {
          id: 'ta3',
          type: 'paragraph',
          data: {
            text: 'Former les cadres publics qui transforment l\'Afrique en renforçant les compétences managériales et de leadership des cadres du secteur public en Afrique francophone, pour améliorer leurs pratiques professionnelles et la performance de leurs organisations.'
          }
        },
        {
          id: 'ta4',
          type: 'header',
          data: {
            text: 'Format du programme',
            level: 2
          }
        },
        {
          id: 'ta5',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              '<b>Durée</b> : 30 jours répartis sur 6 mois',
              '<b>Modalités</b> : 3 semaines de sessions résidentielles en présentiel combinées à des modules de formation à distance',
              '<b>Adaptation</b> : Programme personnalisé pour refléter les spécificités culturelles et contextuelles des organisations africaines'
            ]
          }
        },
        {
          id: 'ta6',
          type: 'header',
          data: {
            text: 'Approche pédagogique',
            level: 2
          }
        },
        {
          id: 'ta7',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              '<b>Apprentissage par l\'action</b> : Les participants travaillent sur des projets concrets de transformation de leurs organisations',
              '<b>Intelligence collective</b> : Échanges entre pairs et co-construction de solutions',
              '<b>Créativité</b> : Méthodes de design thinking et d\'innovation sociale',
              '<b>Résolution collective de problèmes</b> : Méthodologies créatives adaptées au contexte africain'
            ]
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/transformaction-africa/1200/600',
    cover_image_alt: 'Programme Transform\'Action Africa',
    gallery: [
      'https://picsum.photos/seed/transformaction-africa-1/800/600',
      'https://picsum.photos/seed/transformaction-africa-2/800/600',
      'https://picsum.photos/seed/transformaction-africa-3/800/600'
    ],
    category_ids: ['cat-1', 'cat-8'],
    department_id: 'dep-admin',
    department_name: 'Administration et Gestion',
    status: 'ongoing',
    publication_status: 'published',
    featured: true,
    start_date: '2022-01-15',
    budget: 5000000,
    currency: 'EUR',
    partners: [
      { id: 'pp-1', partner_id: 'partner-afd', name: 'Agence Française de Développement (AFD)', website: 'https://www.afd.fr', role: 'Financement principal' },
      { id: 'pp-2', partner_id: 'partner-makesense', name: 'Makesense', logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/25.png', website: 'https://makesense.org', role: 'Expertise pédagogique' }
    ],
    countries: [
      { id: 'pc-1', name: 'Côte d\'Ivoire', code: 'CI' },
      { id: 'pc-2', name: 'Sénégal', code: 'SN' },
      { id: 'pc-3', name: 'Cameroun', code: 'CM' },
      { id: 'pc-4', name: 'Bénin', code: 'BJ' },
      { id: 'pc-5', name: 'Togo', code: 'TG' },
      { id: 'pc-6', name: 'Mali', code: 'ML' },
      { id: 'pc-7', name: 'Burkina Faso', code: 'BF' },
      { id: 'pc-8', name: 'Niger', code: 'NE' },
      { id: 'pc-9', name: 'Guinée', code: 'GN' },
      { id: 'pc-10', name: 'RDC', code: 'CD' },
      { id: 'pc-11', name: 'Madagascar', code: 'MG' },
      { id: 'pc-12', name: 'Mauritanie', code: 'MR' }
    ],
    website: 'https://usenghor-francophonie.org/transformaction/',
    beneficiaries: 'Cadres dirigeants des organisations publiques africaines',
    created_at: '2022-01-01T10:00:00Z',
    updated_at: '2025-01-15T14:30:00Z',
    published_at: '2022-01-10T08:00:00Z'
  },
  {
    id: 'project-kreafrika',
    slug: 'kreafrika',
    title_fr: 'KreAfrika',
    title_en: 'KreAfrika',
    title_ar: 'كري أفريكا',
    summary_fr: 'KreAfrika est un projet qui vise à renforcer les compétences des professionnels des Industries Culturelles et Créatives en Afrique.',
    summary_en: 'KreAfrika is a project aimed at strengthening the skills of professionals in Cultural and Creative Industries in Africa.',
    summary_ar: 'كري أفريكا هو مشروع يهدف إلى تعزيز مهارات المهنيين في الصناعات الثقافية والإبداعية في أفريقيا.',
    description_fr: {
      time: 1705747200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'ka1',
          type: 'paragraph',
          data: {
            text: '<b>KreAfrika</b> est un projet mis en œuvre par l\'Université Senghor, le groupe médiatique TRACE et le Campus Groupe AFD, qui vise à renforcer les compétences des professionnels des Industries Culturelles et Créatives (ICC) en Afrique.'
          }
        },
        {
          id: 'ka2',
          type: 'header',
          data: {
            text: 'Objectifs',
            level: 2
          }
        },
        {
          id: 'ka3',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              'Renforcer les compétences des professionnels des ICC en Afrique',
              'Réduire les inégalités de genre dans les industries culturelles et créatives africaines',
              'Favoriser l\'échange des pratiques et savoir-faire dans le domaine des industries créatives'
            ]
          }
        },
        {
          id: 'ka4',
          type: 'header',
          data: {
            text: 'Séminaires régionaux',
            level: 2
          }
        },
        {
          id: 'ka5',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              '<b>Dakar</b> : Politiques publiques dans les ICC',
              '<b>Kinshasa & Nairobi</b> : Gestion des équipements culturels',
              '<b>Abidjan & Alexandrie-Le Caire</b> : Entrepreneuriat et financement'
            ]
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/kreafrika/1200/600',
    cover_image_alt: 'Programme KreAfrika',
    gallery: [
      'https://picsum.photos/seed/kreafrika-1/800/600',
      'https://picsum.photos/seed/kreafrika-2/800/600',
      'https://picsum.photos/seed/kreafrika-3/800/600'
    ],
    category_ids: ['cat-2'],
    department_id: 'dep-culture',
    department_name: 'Culture',
    status: 'ongoing',
    publication_status: 'published',
    featured: true,
    start_date: '2021-01-01',
    budget: 2500000,
    currency: 'EUR',
    partners: [
      { id: 'pp-3', partner_id: 'partner-trace', name: 'TRACE', logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/31.jpg', website: 'https://trace.tv', role: 'Partenaire média' },
      { id: 'pp-4', partner_id: 'partner-afd-campus', name: 'Campus Groupe AFD', website: 'https://campus.afd.fr', role: 'Formation professionnelle' }
    ],
    countries: [
      { id: 'pc-13', name: 'Sénégal', code: 'SN' },
      { id: 'pc-14', name: 'RDC', code: 'CD' },
      { id: 'pc-15', name: 'Kenya', code: 'KE' },
      { id: 'pc-16', name: 'Côte d\'Ivoire', code: 'CI' },
      { id: 'pc-17', name: 'Égypte', code: 'EG' }
    ],
    website: 'https://sites.google.com/usenghor.org/kreafrika/accueil',
    beneficiaries: 'Professionnels des Industries Culturelles et Créatives',
    created_at: '2021-01-01T10:00:00Z',
    updated_at: '2025-01-10T11:00:00Z',
    published_at: '2021-01-05T08:00:00Z'
  },
  {
    id: 'project-levee-fonds',
    slug: 'levee-de-fonds',
    title_fr: 'Campagne de levée de fonds',
    title_en: 'Fundraising Campaign',
    title_ar: 'حملة جمع التبرعات',
    summary_fr: 'Campagne de mobilisation de ressources pour soutenir les bourses d\'excellence et les projets d\'innovation.',
    summary_en: 'Resource mobilization campaign to support excellence scholarships and innovation projects.',
    summary_ar: 'حملة تعبئة الموارد لدعم منح التميز ومشاريع الابتكار.',
    description_fr: {
      time: 1705747200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'lf1',
          type: 'paragraph',
          data: {
            text: 'La campagne de levée de fonds de l\'Université Senghor vise à mobiliser des ressources pour soutenir ses missions fondamentales.'
          }
        },
        {
          id: 'lf2',
          type: 'header',
          data: {
            text: 'Objectifs de la campagne',
            level: 2
          }
        },
        {
          id: 'lf3',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              'Financer 100 bourses d\'excellence par an',
              'Soutenir les projets de recherche innovants',
              'Moderniser les infrastructures numériques',
              'Développer de nouveaux programmes de formation'
            ]
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/levee-fonds/1200/600',
    category_ids: ['cat-1'],
    status: 'ongoing',
    publication_status: 'published',
    featured: false,
    start_date: '2024-01-01',
    budget: 1000000,
    currency: 'EUR',
    partners: [
      { id: 'pp-5', partner_id: 'partner-alumni', name: 'Alumni Senghor', role: 'Réseau de donateurs' },
      { id: 'pp-6', partner_id: 'partner-fondations', name: 'Fondations partenaires', role: 'Co-financement' }
    ],
    countries: [
      { id: 'pc-18', name: 'International', code: 'UN' }
    ],
    beneficiaries: '100 boursiers/an',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-01-05T09:00:00Z',
    published_at: '2024-01-05T08:00:00Z'
  },
  {
    id: 'project-bourses-excellence',
    slug: 'bourses-excellence',
    title_fr: 'Programme de bourses d\'excellence',
    title_en: 'Excellence Scholarship Program',
    title_ar: 'برنامج منح التميز',
    summary_fr: 'Programme de bourses destiné aux étudiants les plus méritants de l\'espace francophone africain.',
    summary_en: 'Scholarship program for the most deserving students from the African French-speaking world.',
    summary_ar: 'برنامج منح للطلاب الأكثر استحقاقاً من العالم الأفريقي الناطق بالفرنسية.',
    description_fr: {
      time: 1705747200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'be1',
          type: 'paragraph',
          data: {
            text: 'Le programme de bourses d\'excellence de l\'Université Senghor permet chaque année à des étudiants talentueux de poursuivre leurs études.'
          }
        },
        {
          id: 'be2',
          type: 'header',
          data: {
            text: 'Critères d\'éligibilité',
            level: 2
          }
        },
        {
          id: 'be3',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              'Excellence académique',
              'Projet professionnel cohérent',
              'Engagement citoyen démontré',
              'Potentiel de leadership'
            ]
          }
        },
        {
          id: 'be4',
          type: 'header',
          data: {
            text: 'Types de bourses',
            level: 2
          }
        },
        {
          id: 'be5',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              'Bourses complètes (frais de scolarité + hébergement)',
              'Bourses partielles (frais de scolarité)',
              'Bourses de mobilité'
            ]
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/bourses-excellence/1200/600',
    category_ids: ['cat-1'],
    status: 'ongoing',
    publication_status: 'published',
    featured: false,
    start_date: '2020-09-01',
    currency: 'EUR',
    partners: [
      { id: 'pp-7', partner_id: 'partner-oif', name: 'OIF', logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg', website: 'https://www.francophonie.org', role: 'Financement' },
      { id: 'pp-8', partner_id: 'partner-pays', name: 'Pays bailleurs', role: 'Co-financement' },
      { id: 'pp-9', partner_id: 'partner-fondations2', name: 'Fondations partenaires', role: 'Bourses spécifiques' }
    ],
    countries: [
      { id: 'pc-19', name: '35 pays francophones', code: 'UN' }
    ],
    beneficiaries: '200 boursiers actuels',
    created_at: '2020-09-01T10:00:00Z',
    updated_at: '2024-12-15T11:00:00Z',
    published_at: '2020-09-05T08:00:00Z'
  },
  {
    id: 'project-recherche-francophone',
    slug: 'recherche-francophone',
    title_fr: 'Réseau de recherche francophone',
    title_en: 'Francophone Research Network',
    title_ar: 'شبكة البحث الفرنكوفونية',
    summary_fr: 'Réseau collaboratif de recherche sur les grands défis du développement en Afrique francophone.',
    summary_en: 'Collaborative research network on major development challenges in French-speaking Africa.',
    summary_ar: 'شبكة بحثية تعاونية حول تحديات التنمية الكبرى في أفريقيا الناطقة بالفرنسية.',
    description_fr: {
      time: 1705747200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'rf1',
          type: 'paragraph',
          data: {
            text: 'Le Réseau de recherche francophone rassemble des chercheurs de l\'espace francophone autour de thématiques communes.'
          }
        },
        {
          id: 'rf2',
          type: 'header',
          data: {
            text: 'Axes de recherche',
            level: 2
          }
        },
        {
          id: 'rf3',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              'Gouvernance et développement',
              'Santé publique et systèmes de santé',
              'Environnement et changement climatique',
              'Industries culturelles et créatives',
              'Transformation digitale'
            ]
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/recherche-francophone/1200/600',
    category_ids: ['cat-4'],
    status: 'ongoing',
    publication_status: 'published',
    featured: false,
    start_date: '2018-01-01',
    currency: 'EUR',
    partners: [
      { id: 'pp-10', partner_id: 'partner-auf', name: 'AUF', logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/03.png', website: 'https://www.auf.org', role: 'Coordination' },
      { id: 'pp-11', partner_id: 'partner-cnrs', name: 'CNRS', website: 'https://www.cnrs.fr', role: 'Recherche' },
      { id: 'pp-12', partner_id: 'partner-ird', name: 'IRD', website: 'https://www.ird.fr', role: 'Recherche' },
      { id: 'pp-13', partner_id: 'partner-univ', name: 'Universités partenaires', role: 'Membres du réseau' }
    ],
    countries: [
      { id: 'pc-20', name: '25 pays', code: 'UN' }
    ],
    beneficiaries: '150 chercheurs',
    created_at: '2018-01-01T10:00:00Z',
    updated_at: '2024-11-20T14:00:00Z',
    published_at: '2018-01-10T08:00:00Z'
  },
  {
    id: 'project-africa-digital',
    slug: 'africa-digital-leaders',
    title_fr: 'Africa Digital Leaders',
    title_en: 'Africa Digital Leaders',
    title_ar: 'قادة أفريقيا الرقميين',
    summary_fr: 'Programme de formation des futurs leaders du numérique en Afrique.',
    summary_en: 'Training program for future digital leaders in Africa.',
    summary_ar: 'برنامج تدريب قادة المستقبل الرقميين في أفريقيا.',
    description_fr: {
      time: 1705747200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'ad1',
          type: 'paragraph',
          data: {
            text: 'Africa Digital Leaders est un programme intensif de formation au leadership numérique.'
          }
        },
        {
          id: 'ad2',
          type: 'header',
          data: {
            text: 'Programme',
            level: 2
          }
        },
        {
          id: 'ad3',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              '6 mois de formation intensive',
              'Modules en ligne et présentiels',
              'Mentorat par des leaders du secteur',
              'Projet d\'entreprise accompagné'
            ]
          }
        },
        {
          id: 'ad4',
          type: 'header',
          data: {
            text: 'Compétences développées',
            level: 2
          }
        },
        {
          id: 'ad5',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              'Leadership et management',
              'Stratégie digitale',
              'Intelligence artificielle',
              'Cybersécurité',
              'Entrepreneuriat tech'
            ]
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/africa-digital/1200/600',
    category_ids: ['cat-5'],
    status: 'planned',
    publication_status: 'published',
    featured: false,
    start_date: '2025-06-01',
    currency: 'EUR',
    partners: [
      { id: 'pp-14', partner_id: 'partner-google', name: 'Google', website: 'https://www.google.com', role: 'Partenaire technologique' },
      { id: 'pp-15', partner_id: 'partner-microsoft', name: 'Microsoft', website: 'https://www.microsoft.com', role: 'Partenaire technologique' },
      { id: 'pp-16', partner_id: 'partner-orange', name: 'Orange Digital Center', website: 'https://www.orangedigitalcenter.com', role: 'Espaces de formation' }
    ],
    countries: [
      { id: 'pc-21', name: 'Afrique francophone', code: 'UN' }
    ],
    beneficiaries: '50 leaders/an',
    created_at: '2024-10-01T10:00:00Z',
    updated_at: '2025-01-18T09:00:00Z',
    published_at: '2024-10-15T08:00:00Z'
  },
  // BROUILLON
  {
    id: 'project-sante-numerique',
    slug: 'sante-numerique-afrique',
    title_fr: 'Santé numérique en Afrique',
    title_en: 'Digital Health in Africa',
    title_ar: 'الصحة الرقمية في أفريقيا',
    summary_fr: 'Programme de renforcement des capacités en santé numérique pour les professionnels de santé africains.',
    summary_en: 'Digital health capacity building program for African health professionals.',
    summary_ar: 'برنامج بناء القدرات في الصحة الرقمية للمهنيين الصحيين الأفارقة.',
    cover_image: 'https://picsum.photos/seed/sante-numerique/1200/600',
    category_ids: ['cat-7', 'cat-5'],
    department_id: 'dep-sante',
    department_name: 'Santé',
    status: 'planned',
    publication_status: 'draft',
    featured: false,
    start_date: '2025-09-01',
    currency: 'EUR',
    partners: [],
    countries: [],
    beneficiaries: 'Professionnels de santé',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-20T15:00:00Z'
  },
  // TERMINÉ
  {
    id: 'project-formation-gouvernance-2023',
    slug: 'formation-gouvernance-2023',
    title_fr: 'Formation en gouvernance publique 2023',
    title_en: 'Public Governance Training 2023',
    title_ar: 'تدريب الحوكمة العامة 2023',
    summary_fr: 'Programme de formation intensive en gouvernance publique pour les cadres africains - Cohorte 2023.',
    summary_en: 'Intensive public governance training program for African executives - 2023 Cohort.',
    summary_ar: 'برنامج تدريب مكثف في الحوكمة العامة للمديرين الأفارقة - دفعة 2023.',
    description_fr: {
      time: 1705747200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'fg1',
          type: 'paragraph',
          data: {
            text: 'La cohorte 2023 du programme de formation en gouvernance publique a permis de former 45 cadres dirigeants issus de 15 pays africains.'
          }
        },
        {
          id: 'fg2',
          type: 'header',
          data: {
            text: 'Résultats',
            level: 2
          }
        },
        {
          id: 'fg3',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              '45 cadres formés',
              '15 pays représentés',
              '12 projets de transformation initiés',
              '95% de satisfaction des participants'
            ]
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/gouvernance-2023/1200/600',
    category_ids: ['cat-8', 'cat-1'],
    department_id: 'dep-admin',
    department_name: 'Administration et Gestion',
    status: 'completed',
    publication_status: 'published',
    featured: false,
    start_date: '2023-01-15',
    end_date: '2023-12-15',
    budget: 800000,
    currency: 'EUR',
    partners: [
      { id: 'pp-17', partner_id: 'partner-afd', name: 'AFD', website: 'https://www.afd.fr', role: 'Financement' }
    ],
    countries: [
      { id: 'pc-22', name: '15 pays africains', code: 'UN' }
    ],
    beneficiaries: '45 cadres dirigeants formés',
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2024-01-15T11:00:00Z',
    published_at: '2023-01-10T08:00:00Z'
  },
  // SUSPENDU
  {
    id: 'project-campus-virtuel',
    slug: 'campus-virtuel',
    title_fr: 'Campus virtuel Senghor',
    title_en: 'Senghor Virtual Campus',
    title_ar: 'الحرم الجامعي الافتراضي سنغور',
    summary_fr: 'Développement d\'une plateforme de formation en ligne pour l\'ensemble des programmes de l\'université.',
    summary_en: 'Development of an online training platform for all university programs.',
    summary_ar: 'تطوير منصة تدريب عبر الإنترنت لجميع برامج الجامعة.',
    cover_image: 'https://picsum.photos/seed/campus-virtuel/1200/600',
    category_ids: ['cat-5', 'cat-1'],
    status: 'suspended',
    publication_status: 'draft',
    featured: false,
    start_date: '2023-06-01',
    currency: 'EUR',
    partners: [],
    countries: [],
    beneficiaries: 'Étudiants et professeurs',
    created_at: '2023-06-01T10:00:00Z',
    updated_at: '2024-03-15T09:00:00Z'
  }
]

// === FONCTIONS ADMIN ===

// Récupérer tous les projets (admin)
export function getAllProjectsAdmin(): Project[] {
  return [...mockProjects].sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
}

// Récupérer un projet par ID
export function getProjectByIdAdmin(id: string): Project | undefined {
  return mockProjects.find(p => p.id === id)
}

// Récupérer un projet par slug
export function getProjectBySlugAdmin(slug: string): Project | undefined {
  return mockProjects.find(p => p.slug === slug)
}

// Récupérer les projets filtrés
export function getFilteredProjects(filters?: ProjectFilters): Project[] {
  let result = [...mockProjects]

  if (filters?.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(p =>
      p.title_fr.toLowerCase().includes(search) ||
      p.title_en.toLowerCase().includes(search) ||
      p.slug.toLowerCase().includes(search) ||
      p.summary_fr?.toLowerCase().includes(search) ||
      p.summary_en?.toLowerCase().includes(search)
    )
  }

  if (filters?.status) {
    result = result.filter(p => p.status === filters.status)
  }

  if (filters?.publication_status) {
    result = result.filter(p => p.publication_status === filters.publication_status)
  }

  if (filters?.category_id) {
    result = result.filter(p => p.category_ids.includes(filters.category_id!))
  }

  if (filters?.department_id) {
    result = result.filter(p => p.department_id === filters.department_id)
  }

  if (filters?.country_code) {
    result = result.filter(p =>
      p.countries.some(c => c.code === filters.country_code)
    )
  }

  if (filters?.partner_id) {
    result = result.filter(p =>
      p.partners.some(partner => partner.partner_id === filters.partner_id)
    )
  }

  if (filters?.date_from) {
    result = result.filter(p => p.start_date >= filters.date_from!)
  }

  if (filters?.date_to) {
    result = result.filter(p => p.start_date <= filters.date_to!)
  }

  if (filters?.featured !== undefined) {
    result = result.filter(p => p.featured === filters.featured)
  }

  return result.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
}

// Statistiques des projets
export function getProjectStats(): ProjectStats {
  return {
    total: mockProjects.length,
    byStatus: {
      planned: mockProjects.filter(p => p.status === 'planned').length,
      ongoing: mockProjects.filter(p => p.status === 'ongoing').length,
      completed: mockProjects.filter(p => p.status === 'completed').length,
      suspended: mockProjects.filter(p => p.status === 'suspended').length
    },
    byPublicationStatus: {
      draft: mockProjects.filter(p => p.publication_status === 'draft').length,
      published: mockProjects.filter(p => p.publication_status === 'published').length,
      archived: mockProjects.filter(p => p.publication_status === 'archived').length
    },
    featured: mockProjects.filter(p => p.featured).length,
    totalBudget: mockProjects.reduce((sum, p) => sum + (p.budget || 0), 0)
  }
}

// Liste des projets pour select (appels liés)
export function getProjectsForSelect(): Array<{ id: string; title: string }> {
  return mockProjects
    .filter(p => p.publication_status === 'published' || p.publication_status === 'draft')
    .map(p => ({ id: p.id, title: p.title_fr }))
    .sort((a, b) => a.title.localeCompare(b.title))
}
