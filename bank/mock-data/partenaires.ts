/**
 * Mock Data: Partenaires
 * Table SQL: partenaires
 */

export type PartnerType = 'academique' | 'institutionnel' | 'entreprise' | 'ong'

export interface Partenaire {
  id: string
  slug: string
  partner_type: PartnerType
  name_fr: string
  name_en?: string
  description_fr?: string
  logo: string
  website?: string
  country?: string
  partnership_type_fr?: string
  is_strategic: boolean
  sort_order: number
  is_active: boolean
}

export const mockPartenaires: Partenaire[] = [
  // === PARTENAIRES ACADÉMIQUES ===
  {
    id: 'part-auf',
    slug: 'auf',
    partner_type: 'academique',
    name_fr: 'Agence Universitaire de la Francophonie',
    name_en: 'Francophone University Agency',
    description_fr: 'L\'AUF est un partenaire stratégique pour la mobilité et les projets de recherche.',
    logo: 'https://picsum.photos/seed/logo-auf/200/200',
    website: 'https://www.auf.org',
    is_strategic: true,
    sort_order: 1,
    is_active: true
  },
  {
    id: 'part-paris1',
    slug: 'paris1-pantheon-sorbonne',
    partner_type: 'academique',
    name_fr: 'Université Paris 1 Panthéon-Sorbonne',
    logo: 'https://picsum.photos/seed/logo-paris1/200/200',
    website: 'https://www.pantheonsorbonne.fr',
    country: 'FR',
    partnership_type_fr: 'Co-diplômation',
    is_strategic: true,
    sort_order: 2,
    is_active: true
  },
  {
    id: 'part-ucad',
    slug: 'ucad',
    partner_type: 'academique',
    name_fr: 'Université Cheikh Anta Diop de Dakar',
    logo: 'https://picsum.photos/seed/logo-ucad/200/200',
    website: 'https://www.ucad.sn',
    country: 'SN',
    partnership_type_fr: 'Campus externalisé',
    is_strategic: true,
    sort_order: 3,
    is_active: true
  },
  {
    id: 'part-bordeaux',
    slug: 'universite-bordeaux',
    partner_type: 'academique',
    name_fr: 'Université de Bordeaux',
    logo: 'https://picsum.photos/seed/logo-bordeaux/200/200',
    website: 'https://www.u-bordeaux.fr',
    country: 'FR',
    is_strategic: false,
    sort_order: 4,
    is_active: true
  },
  {
    id: 'part-uqam',
    slug: 'uqam',
    partner_type: 'academique',
    name_fr: 'Université du Québec à Montréal',
    logo: 'https://picsum.photos/seed/logo-uqam/200/200',
    website: 'https://www.uqam.ca',
    country: 'CA',
    is_strategic: false,
    sort_order: 5,
    is_active: true
  },

  // === PARTENAIRES INSTITUTIONNELS ===
  {
    id: 'part-oif',
    slug: 'oif',
    partner_type: 'institutionnel',
    name_fr: 'Organisation Internationale de la Francophonie',
    name_en: 'International Organisation of La Francophonie',
    logo: 'https://picsum.photos/seed/logo-oif/200/200',
    website: 'https://www.francophonie.org',
    is_strategic: true,
    sort_order: 10,
    is_active: true
  },
  {
    id: 'part-mae-france',
    slug: 'mae-france',
    partner_type: 'institutionnel',
    name_fr: 'Ministère de l\'Europe et des Affaires Étrangères (France)',
    logo: 'https://picsum.photos/seed/logo-mae-france/200/200',
    website: 'https://www.diplomatie.gouv.fr',
    country: 'FR',
    is_strategic: true,
    sort_order: 11,
    is_active: true
  },
  {
    id: 'part-ua',
    slug: 'union-africaine',
    partner_type: 'institutionnel',
    name_fr: 'Union Africaine',
    name_en: 'African Union',
    logo: 'https://picsum.photos/seed/logo-ua/200/200',
    website: 'https://au.int',
    is_strategic: true,
    sort_order: 12,
    is_active: true
  },
  {
    id: 'part-unesco',
    slug: 'unesco',
    partner_type: 'institutionnel',
    name_fr: 'UNESCO',
    logo: 'https://picsum.photos/seed/logo-unesco/200/200',
    website: 'https://www.unesco.org',
    is_strategic: true,
    sort_order: 13,
    is_active: true
  },
  {
    id: 'part-banque-mondiale',
    slug: 'banque-mondiale',
    partner_type: 'institutionnel',
    name_fr: 'Banque Mondiale',
    name_en: 'World Bank',
    logo: 'https://picsum.photos/seed/logo-world-bank/200/200',
    website: 'https://www.worldbank.org',
    is_strategic: false,
    sort_order: 14,
    is_active: true
  },

  // === ENTREPRISES ===
  {
    id: 'part-orange',
    slug: 'orange',
    partner_type: 'entreprise',
    name_fr: 'Orange',
    logo: 'https://picsum.photos/seed/logo-orange/200/200',
    website: 'https://www.orange.com',
    country: 'FR',
    partnership_type_fr: 'Mécénat et stages',
    is_strategic: false,
    sort_order: 20,
    is_active: true
  },
  {
    id: 'part-total',
    slug: 'totalenergies',
    partner_type: 'entreprise',
    name_fr: 'TotalEnergies',
    logo: 'https://picsum.photos/seed/logo-total/200/200',
    website: 'https://www.totalenergies.com',
    country: 'FR',
    partnership_type_fr: 'Bourses et projets environnement',
    is_strategic: false,
    sort_order: 21,
    is_active: true
  },

  // === ONG ===
  {
    id: 'part-oxfam',
    slug: 'oxfam',
    partner_type: 'ong',
    name_fr: 'Oxfam',
    logo: 'https://picsum.photos/seed/logo-oxfam/200/200',
    website: 'https://www.oxfam.org',
    is_strategic: false,
    sort_order: 30,
    is_active: true
  },
  {
    id: 'part-msf',
    slug: 'medecins-sans-frontieres',
    partner_type: 'ong',
    name_fr: 'Médecins Sans Frontières',
    name_en: 'Doctors Without Borders',
    logo: 'https://picsum.photos/seed/logo-msf/200/200',
    website: 'https://www.msf.org',
    partnership_type_fr: 'Stages Master Santé',
    is_strategic: false,
    sort_order: 31,
    is_active: true
  }
]
