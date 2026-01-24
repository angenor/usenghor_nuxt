/**
 * Mock Data: Actualités (Admin)
 * Gestion complète des actualités pour le back-office
 */

// Type pour le contenu EditorJS
export interface EditorJSBlock {
  id?: string
  type: string
  data: Record<string, unknown>
}

export interface EditorJSContent {
  time?: number
  blocks: EditorJSBlock[]
  version?: string
}

// Types
export type NewsStatus = 'draft' | 'published' | 'archived'
export type HighlightStatus = 'standard' | 'featured' | 'headline'

export interface NewsTag {
  id: string
  name: string
  slug: string
  color?: string
}

export interface NewsMedia {
  id: string
  url: string
  alt?: string
  caption?: string
  order: number
}

export interface NewsAuthor {
  id: string
  name: string
  avatar?: string
  role?: string
}

export interface News {
  id: string
  slug: string
  title: string
  summary?: string
  /** Contenu riche FR (EditorJS format) */
  content: EditorJSContent
  /** Contenu riche EN (EditorJS format) */
  content_en?: EditorJSContent
  /** Contenu riche AR (EditorJS format) */
  content_ar?: EditorJSContent
  /** Contenu HTML legacy (pour migration) */
  content_html?: string
  video_url?: string
  cover_image?: string
  cover_image_alt?: string

  // Associations
  author: NewsAuthor
  tags: NewsTag[]
  media: NewsMedia[]
  campus_id?: string
  campus_name?: string
  department_id?: string
  department_name?: string
  service_id?: string
  service_name?: string
  event_id?: string
  event_name?: string
  project_id?: string
  project_name?: string

  // Statuts
  status: NewsStatus
  highlight_status: HighlightStatus

  // Dates
  created_at: string
  updated_at: string
  published_at?: string
  visible_from?: string
}

// Labels et couleurs
export const newsStatusLabels: Record<NewsStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé'
}

export const newsStatusColors: Record<NewsStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

export const highlightStatusLabels: Record<HighlightStatus, string> = {
  standard: 'Standard',
  featured: 'Mise en avant',
  headline: 'À la une'
}

export const highlightStatusColors: Record<HighlightStatus, string> = {
  standard: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  featured: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  headline: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
}

// Tags prédéfinis
export const mockNewsTags: NewsTag[] = [
  { id: 'tag-1', name: 'Académique', slug: 'academique', color: 'blue' },
  { id: 'tag-2', name: 'Partenariat', slug: 'partenariat', color: 'green' },
  { id: 'tag-3', name: 'Événement', slug: 'evenement', color: 'purple' },
  { id: 'tag-4', name: 'Recherche', slug: 'recherche', color: 'orange' },
  { id: 'tag-5', name: 'International', slug: 'international', color: 'cyan' },
  { id: 'tag-6', name: 'Alumni', slug: 'alumni', color: 'pink' },
  { id: 'tag-7', name: 'Formation', slug: 'formation', color: 'indigo' },
  { id: 'tag-8', name: 'Innovation', slug: 'innovation', color: 'yellow' },
  { id: 'tag-9', name: 'Culture', slug: 'culture', color: 'red' },
  { id: 'tag-10', name: 'Gouvernance', slug: 'gouvernance', color: 'teal' }
]

// Auteurs prédéfinis
export const mockNewsAuthors: NewsAuthor[] = [
  { id: 'author-1', name: 'Service Communication', role: 'Communication', avatar: 'https://ui-avatars.com/api/?name=SC&background=3b82f6&color=fff' },
  { id: 'author-2', name: 'Dr. Amina Diallo', role: 'Directrice des études', avatar: 'https://ui-avatars.com/api/?name=AD&background=10b981&color=fff' },
  { id: 'author-3', name: 'Prof. Jean-Pierre Mbeki', role: 'Vice-recteur', avatar: 'https://ui-avatars.com/api/?name=JM&background=8b5cf6&color=fff' },
  { id: 'author-4', name: 'Marie Koné', role: 'Chargée de relations internationales', avatar: 'https://ui-avatars.com/api/?name=MK&background=f59e0b&color=fff' },
  { id: 'author-5', name: 'Karim Benali', role: 'Responsable projets', avatar: 'https://ui-avatars.com/api/?name=KB&background=ef4444&color=fff' }
]

// Données mock
export const mockNews: News[] = [
  // À LA UNE
  {
    id: 'news-1',
    slug: '35-ans-universite-senghor',
    title: 'L\'Université Senghor célèbre ses 35 ans au service de la Francophonie',
    summary: 'L\'Université Senghor d\'Alexandrie a célébré son 35e anniversaire en présence de nombreuses personnalités de la Francophonie.',
    content: {
      time: 1705747200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'b1',
          type: 'paragraph',
          data: {
            text: 'L\'Université Senghor d\'Alexandrie a célébré son 35e anniversaire lors d\'une cérémonie officielle qui s\'est tenue le 20 janvier 2025. Cet événement a réuni de nombreuses personnalités de la Francophonie, dont la Secrétaire générale de l\'OIF.'
          }
        },
        {
          id: 'b2',
          type: 'header',
          data: {
            text: '35 ans d\'excellence académique',
            level: 2
          }
        },
        {
          id: 'b3',
          type: 'paragraph',
          data: {
            text: 'Depuis sa création en 1990, l\'Université Senghor a formé plus de 3 000 cadres africains dans les domaines de la gouvernance, de la culture, de la santé et de l\'environnement.'
          }
        },
        {
          id: 'b4',
          type: 'quote',
          data: {
            text: 'Notre université incarne la vision du Président Léopold Sédar Senghor : former les élites africaines de demain.',
            caption: 'Le Recteur, lors de son discours d\'ouverture',
            alignment: 'left'
          }
        },
        {
          id: 'b5',
          type: 'header',
          data: {
            text: 'Perspectives d\'avenir',
            level: 2
          }
        },
        {
          id: 'b6',
          type: 'paragraph',
          data: {
            text: 'À l\'occasion de cet anniversaire, plusieurs nouveaux programmes ont été annoncés, notamment un Master en Intelligence Artificielle et Développement, ainsi que l\'ouverture prochaine d\'un nouveau campus à Nairobi.'
          }
        }
      ]
    },
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    cover_image: 'https://picsum.photos/seed/news-35ans/1200/600',
    cover_image_alt: 'Cérémonie des 35 ans de l\'Université Senghor',
    author: mockNewsAuthors[0],
    tags: [mockNewsTags[0], mockNewsTags[4]],
    media: [
      { id: 'media-1-1', url: 'https://picsum.photos/seed/news-35-1/800/600', alt: 'Cérémonie officielle', order: 0 },
      { id: 'media-1-2', url: 'https://picsum.photos/seed/news-35-2/800/600', alt: 'Discours du Recteur', order: 1 },
      { id: 'media-1-3', url: 'https://picsum.photos/seed/news-35-3/800/600', alt: 'Invités de marque', order: 2 }
    ],
    status: 'published',
    highlight_status: 'headline',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-20T14:30:00Z',
    published_at: '2025-01-20T10:00:00Z'
  },

  // MISES EN AVANT
  {
    id: 'news-2',
    slug: 'nouveau-partenariat-oif',
    title: 'Nouveau partenariat stratégique avec l\'OIF',
    summary: 'L\'Université Senghor renforce sa collaboration avec l\'Organisation Internationale de la Francophonie pour développer de nouveaux programmes.',
    content: {
      time: 1705660800000,
      version: '2.28.2',
      blocks: [
        {
          id: 'oif1',
          type: 'paragraph',
          data: {
            text: 'L\'Université Senghor et l\'Organisation Internationale de la Francophonie (OIF) ont signé un nouvel accord de partenariat stratégique visant à renforcer leur collaboration dans plusieurs domaines.'
          }
        },
        {
          id: 'oif2',
          type: 'header',
          data: {
            text: 'Objectifs du partenariat',
            level: 2
          }
        },
        {
          id: 'oif3',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              'Développement de nouveaux programmes de formation',
              'Renforcement des capacités des institutions francophones',
              'Promotion de la mobilité académique',
              'Soutien à la recherche sur les enjeux africains'
            ]
          }
        },
        {
          id: 'oif4',
          type: 'paragraph',
          data: {
            text: 'Ce partenariat prévoit également la création d\'un fonds de bourses destiné aux étudiants méritants issus des pays les moins avancés de l\'espace francophone.'
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-oif/1200/600',
    author: mockNewsAuthors[2],
    tags: [mockNewsTags[1], mockNewsTags[4]],
    media: [],
    campus_id: 'siege',
    campus_name: 'Siège - Alexandrie',
    status: 'published',
    highlight_status: 'featured',
    created_at: '2025-01-16T09:00:00Z',
    updated_at: '2025-01-18T11:00:00Z',
    published_at: '2025-01-18T08:00:00Z'
  },
  {
    id: 'news-3',
    slug: 'rentree-academique-2024-2025',
    title: 'Rentrée académique 2024-2025 : record d\'inscriptions',
    summary: 'L\'Université Senghor accueille cette année un nombre record d\'étudiants venus de 35 pays francophones.',
    content: {
      time: 1704700800000,
      version: '2.28.2',
      blocks: [
        {
          id: 'r1',
          type: 'paragraph',
          data: {
            text: 'L\'année académique 2024-2025 marque un tournant dans l\'histoire de l\'Université Senghor avec un nombre record d\'inscriptions. Plus de 450 étudiants venus de 35 pays francophones ont rejoint nos programmes de Master.'
          }
        },
        {
          id: 'r2',
          type: 'header',
          data: {
            text: 'Répartition par département',
            level: 2
          }
        },
        {
          id: 'r3',
          type: 'paragraph',
          data: {
            text: 'Le département Administration-Gestion reste le plus attractif avec 35% des inscriptions, suivi du département Culture (25%), Santé (22%) et Environnement (18%).'
          }
        },
        {
          id: 'r4',
          type: 'header',
          data: {
            text: 'Nouveaux pays représentés',
            level: 2
          }
        },
        {
          id: 'r5',
          type: 'paragraph',
          data: {
            text: 'Pour la première fois, nous accueillons des étudiants de Sainte-Lucie et de Dominique, élargissant ainsi notre représentation géographique aux Caraïbes francophones.'
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-rentree/1200/600',
    author: mockNewsAuthors[1],
    tags: [mockNewsTags[0], mockNewsTags[6]],
    media: [],
    status: 'published',
    highlight_status: 'featured',
    created_at: '2025-01-08T10:00:00Z',
    updated_at: '2025-01-10T15:00:00Z',
    published_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'news-4',
    slug: 'kreafrika-festival-cannes-2025',
    title: 'KreAfrika au Festival de Cannes 2025',
    summary: 'KreAfrika sera présent au Marché du Film de Cannes 2025 pour accompagner 10 professionnels africains du cinéma.',
    content: {
      time: 1704441600000,
      version: '2.28.2',
      blocks: [
        {
          id: 'k1',
          type: 'paragraph',
          data: {
            text: 'Le programme KreAfrika de l\'Université Senghor sera présent au Marché du Film du Festival de Cannes 2025, qui se tiendra du 14 au 25 mai.'
          }
        },
        {
          id: 'k2',
          type: 'header',
          data: {
            text: 'Délégation africaine',
            level: 2
          }
        },
        {
          id: 'k3',
          type: 'paragraph',
          data: {
            text: 'Dix professionnels africains du cinéma et de l\'audiovisuel, sélectionnés parmi les bénéficiaires du programme, seront accompagnés pour développer leurs réseaux et présenter leurs projets aux producteurs internationaux.'
          }
        },
        {
          id: 'k4',
          type: 'header',
          data: {
            text: 'Programme d\'activités',
            level: 2
          }
        },
        {
          id: 'k5',
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              'Pitch sessions avec des producteurs internationaux',
              'Networking avec les professionnels du secteur',
              'Participation aux conférences professionnelles',
              'Visite du Marché du Film'
            ]
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-cannes/1200/600',
    author: mockNewsAuthors[4],
    tags: [mockNewsTags[8], mockNewsTags[4], mockNewsTags[7]],
    media: [],
    project_id: 'project-kreafrika',
    project_name: 'KreAfrika',
    status: 'published',
    highlight_status: 'featured',
    created_at: '2025-01-05T14:00:00Z',
    updated_at: '2025-01-08T10:00:00Z',
    published_at: '2025-01-08T09:00:00Z'
  },

  // ACTUALITÉS STANDARD
  {
    id: 'news-5',
    slug: 'visite-secretaire-general-oif',
    title: 'Visite officielle du Secrétaire général de la Francophonie',
    summary: 'Le Secrétaire général de l\'OIF a effectué une visite de travail à l\'Université Senghor.',
    content: {
      time: 1702627200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'v1',
          type: 'paragraph',
          data: {
            text: 'Le Secrétaire général de l\'Organisation Internationale de la Francophonie a effectué une visite officielle à l\'Université Senghor le 15 décembre 2024.'
          }
        },
        {
          id: 'v2',
          type: 'paragraph',
          data: {
            text: 'Au programme : visite des installations, rencontre avec les étudiants et signature de conventions de partenariat.'
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-sg/1200/600',
    author: mockNewsAuthors[0],
    tags: [mockNewsTags[4], mockNewsTags[1]],
    media: [],
    status: 'published',
    highlight_status: 'standard',
    created_at: '2024-12-10T09:00:00Z',
    updated_at: '2024-12-15T16:00:00Z',
    published_at: '2024-12-15T10:00:00Z'
  },
  {
    id: 'news-6',
    slug: 'master-ia-developpement',
    title: 'Lancement du nouveau Master en Intelligence Artificielle et Développement',
    summary: 'L\'Université Senghor lance un programme innovant alliant IA et problématiques de développement en Afrique.',
    content: {
      time: 1701388800000,
      version: '2.28.2',
      blocks: [
        {
          id: 'ia1',
          type: 'paragraph',
          data: {
            text: 'L\'Université Senghor est fière d\'annoncer le lancement de son nouveau Master en Intelligence Artificielle et Développement pour la rentrée 2025-2026.'
          }
        },
        {
          id: 'ia2',
          type: 'header',
          data: {
            text: 'Un programme unique en son genre',
            level: 2
          }
        },
        {
          id: 'ia3',
          type: 'paragraph',
          data: {
            text: 'Ce programme de deux ans combine une formation technique en IA avec une compréhension approfondie des enjeux de développement du continent africain.'
          }
        },
        {
          id: 'ia4',
          type: 'header',
          data: {
            text: 'Partenariats académiques',
            level: 2
          }
        },
        {
          id: 'ia5',
          type: 'paragraph',
          data: {
            text: 'Le programme est développé en partenariat avec l\'Université de Montréal et le MIT Africa Initiative.'
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-ia/1200/600',
    author: mockNewsAuthors[1],
    tags: [mockNewsTags[6], mockNewsTags[7], mockNewsTags[3]],
    media: [],
    department_id: 'dep-admin',
    department_name: 'Administration et Gestion',
    status: 'published',
    highlight_status: 'standard',
    created_at: '2024-11-28T11:00:00Z',
    updated_at: '2024-12-01T09:00:00Z',
    published_at: '2024-12-01T08:00:00Z'
  },
  {
    id: 'news-7',
    slug: 'conference-gouvernance-afrique',
    title: 'Conférence internationale sur la gouvernance en Afrique',
    summary: 'L\'Université Senghor a organisé une conférence réunissant experts et décideurs autour des enjeux de gouvernance.',
    content: {
      time: 1699171200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'g1',
          type: 'paragraph',
          data: {
            text: 'Du 3 au 5 novembre 2024, l\'Université Senghor a accueilli la 12e Conférence internationale sur la gouvernance en Afrique.'
          }
        },
        {
          id: 'g2',
          type: 'paragraph',
          data: {
            text: 'Plus de 200 participants venus de 25 pays ont échangé sur les défis et opportunités de la gouvernance publique sur le continent.'
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-gouv/1200/600',
    author: mockNewsAuthors[2],
    tags: [mockNewsTags[9], mockNewsTags[2]],
    media: [],
    status: 'published',
    highlight_status: 'standard',
    created_at: '2024-10-30T10:00:00Z',
    updated_at: '2024-11-05T14:00:00Z',
    published_at: '2024-11-05T08:00:00Z'
  },
  {
    id: 'news-8',
    slug: 'accord-universite-caire',
    title: 'Signature d\'un accord avec l\'Université du Caire',
    summary: 'Un accord de coopération académique a été signé avec l\'Université du Caire.',
    content: {
      time: 1698217200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'c1',
          type: 'paragraph',
          data: {
            text: 'L\'Université Senghor et l\'Université du Caire ont signé un accord de coopération académique portant sur les échanges d\'étudiants et d\'enseignants, ainsi que sur des projets de recherche conjoints.'
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-caire/1200/600',
    author: mockNewsAuthors[3],
    tags: [mockNewsTags[1], mockNewsTags[4]],
    media: [],
    status: 'published',
    highlight_status: 'standard',
    created_at: '2024-10-20T09:00:00Z',
    updated_at: '2024-10-25T11:00:00Z',
    published_at: '2024-10-25T08:00:00Z'
  },
  {
    id: 'news-9',
    slug: 'campus-abidjan-masa-2025',
    title: 'Le campus d\'Abidjan accueille le MASA 2025',
    summary: 'Le campus sera partenaire officiel du Marché des Arts du Spectacle Africain en mars 2025.',
    content: {
      time: 1704355200000,
      version: '2.28.2',
      blocks: [
        {
          id: 'm1',
          type: 'paragraph',
          data: {
            text: 'Le campus d\'Abidjan de l\'Université Senghor sera partenaire officiel du Marché des Arts du Spectacle Africain (MASA) en mars 2025.'
          }
        },
        {
          id: 'm2',
          type: 'paragraph',
          data: {
            text: 'Cette collaboration permettra aux étudiants de participer activement à l\'organisation de cet événement majeur de la scène culturelle africaine.'
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-masa/1200/600',
    author: mockNewsAuthors[0],
    tags: [mockNewsTags[8], mockNewsTags[2]],
    media: [],
    campus_id: 'campus-abidjan',
    campus_name: 'Campus Abidjan',
    status: 'published',
    highlight_status: 'standard',
    created_at: '2024-12-28T10:00:00Z',
    updated_at: '2025-01-05T09:00:00Z',
    published_at: '2025-01-05T08:00:00Z'
  },
  {
    id: 'news-10',
    slug: 'transformaction-cohorte-2024',
    title: 'Clôture de la Cohorte 2024 : 45 Transform\'acteurs diplômés',
    summary: 'La cérémonie de clôture de la Cohorte 2024 a célébré 45 cadres dirigeants venus de 12 pays africains.',
    content: {
      time: 1704700800000,
      version: '2.28.2',
      blocks: [
        {
          id: 't1',
          type: 'paragraph',
          data: {
            text: 'La Cohorte 2024 du programme Transform\'Action Africa s\'est achevée avec succès le 10 janvier 2025.'
          }
        },
        {
          id: 't2',
          type: 'header',
          data: {
            text: 'Une promotion exceptionnelle',
            level: 2
          }
        },
        {
          id: 't3',
          type: 'paragraph',
          data: {
            text: '45 cadres dirigeants venus de 12 pays africains sont désormais équipés pour conduire le changement dans leurs organisations.'
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-ta/1200/600',
    author: mockNewsAuthors[4],
    tags: [mockNewsTags[6], mockNewsTags[9]],
    media: [],
    project_id: 'project-transformaction-africa',
    project_name: 'Transform\'Action Africa',
    status: 'published',
    highlight_status: 'standard',
    created_at: '2025-01-08T14:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
    published_at: '2025-01-10T09:00:00Z'
  },

  // BROUILLONS
  {
    id: 'news-11',
    slug: 'ouverture-campus-nairobi',
    title: 'Ouverture prochaine du campus de Nairobi',
    summary: 'L\'Université Senghor annoncera bientôt l\'ouverture de son nouveau campus au Kenya.',
    content: {
      time: 1705737600000,
      version: '2.28.2',
      blocks: [
        {
          id: 'n1',
          type: 'paragraph',
          data: {
            text: 'BROUILLON - Contenu à compléter...'
          }
        },
        {
          id: 'n2',
          type: 'paragraph',
          data: {
            text: 'Annonce officielle prévue pour février 2025.'
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-nairobi/1200/600',
    author: mockNewsAuthors[0],
    tags: [mockNewsTags[4], mockNewsTags[7]],
    media: [],
    status: 'draft',
    highlight_status: 'standard',
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-01-22T15:00:00Z'
  },
  {
    id: 'news-12',
    slug: 'nouveau-programme-sante',
    title: 'Nouveau programme en Santé Numérique',
    summary: 'Un nouveau Master en Santé Numérique sera lancé à la rentrée 2025.',
    content: {
      time: 1705564800000,
      version: '2.28.2',
      blocks: [
        {
          id: 's1',
          type: 'paragraph',
          data: {
            text: 'BROUILLON - En cours de rédaction...'
          }
        }
      ]
    },
    author: mockNewsAuthors[1],
    tags: [mockNewsTags[6], mockNewsTags[7]],
    media: [],
    department_id: 'dep-sante',
    department_name: 'Santé',
    status: 'draft',
    highlight_status: 'standard',
    created_at: '2025-01-18T11:00:00Z',
    updated_at: '2025-01-21T14:00:00Z'
  },

  // ARCHIVÉS
  {
    id: 'news-13',
    slug: 'rentree-academique-2023-2024',
    title: 'Rentrée académique 2023-2024',
    summary: 'Retour sur la rentrée académique de l\'année précédente.',
    content: {
      time: 1696118400000,
      version: '2.28.2',
      blocks: [
        {
          id: 'a1',
          type: 'paragraph',
          data: {
            text: 'Article archivé - Rentrée académique 2023-2024.'
          }
        }
      ]
    },
    cover_image: 'https://picsum.photos/seed/news-old/1200/600',
    author: mockNewsAuthors[0],
    tags: [mockNewsTags[0]],
    media: [],
    status: 'archived',
    highlight_status: 'standard',
    created_at: '2023-10-01T10:00:00Z',
    updated_at: '2024-10-01T10:00:00Z',
    published_at: '2023-10-01T08:00:00Z'
  }
]

// Fonctions utilitaires
export function generateNewsId(): string {
  return `news-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function generateTagId(): string {
  return `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function generateMediaId(): string {
  return `media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Statistiques des actualités
export interface NewsStats {
  total: number
  published: number
  draft: number
  archived: number
  headline: number
  featured: number
}

export function getNewsStats(): NewsStats {
  return {
    total: mockNews.length,
    published: mockNews.filter(n => n.status === 'published').length,
    draft: mockNews.filter(n => n.status === 'draft').length,
    archived: mockNews.filter(n => n.status === 'archived').length,
    headline: mockNews.filter(n => n.highlight_status === 'headline' && n.status === 'published').length,
    featured: mockNews.filter(n => n.highlight_status === 'featured' && n.status === 'published').length
  }
}

// Récupérer les actualités avec filtres
export interface NewsFilters {
  search?: string
  status?: NewsStatus | 'all'
  highlight_status?: HighlightStatus | 'all'
  tag_id?: string
  author_id?: string
  campus_id?: string
  department_id?: string
  date_from?: string
  date_to?: string
}

export function getFilteredNews(filters?: NewsFilters): News[] {
  let result = [...mockNews]

  if (!filters) return result

  // Recherche textuelle
  if (filters.search) {
    const query = filters.search.toLowerCase()
    result = result.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.slug.toLowerCase().includes(query) ||
      n.summary?.toLowerCase().includes(query)
    )
  }

  // Filtre par statut
  if (filters.status && filters.status !== 'all') {
    result = result.filter(n => n.status === filters.status)
  }

  // Filtre par mise en avant
  if (filters.highlight_status && filters.highlight_status !== 'all') {
    result = result.filter(n => n.highlight_status === filters.highlight_status)
  }

  // Filtre par tag
  if (filters.tag_id) {
    result = result.filter(n => n.tags.some(t => t.id === filters.tag_id))
  }

  // Filtre par auteur
  if (filters.author_id) {
    result = result.filter(n => n.author.id === filters.author_id)
  }

  // Filtre par campus
  if (filters.campus_id) {
    result = result.filter(n => n.campus_id === filters.campus_id)
  }

  // Filtre par département
  if (filters.department_id) {
    result = result.filter(n => n.department_id === filters.department_id)
  }

  // Filtre par date
  if (filters.date_from) {
    const fromDate = new Date(filters.date_from)
    result = result.filter(n => {
      const date = n.published_at ? new Date(n.published_at) : new Date(n.created_at)
      return date >= fromDate
    })
  }

  if (filters.date_to) {
    const toDate = new Date(filters.date_to)
    result = result.filter(n => {
      const date = n.published_at ? new Date(n.published_at) : new Date(n.created_at)
      return date <= toDate
    })
  }

  return result
}

// Récupérer une actualité par ID
export function getNewsById(id: string): News | undefined {
  return mockNews.find(n => n.id === id)
}

// Récupérer une actualité par slug
export function getNewsBySlug(slug: string): News | undefined {
  return mockNews.find(n => n.slug === slug)
}
