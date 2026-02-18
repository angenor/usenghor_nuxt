/**
 * Mock Data: Personnel
 * Table SQL: staff
 */

export type StaffType = 'direction' | 'enseignant' | 'administratif' | 'technique'
export type Civility = 'M.' | 'Mme' | 'Dr' | 'Pr' | 'S.E.'

export interface Staff {
  id: string
  slug: string
  staff_type: StaffType
  civility: Civility
  first_name: string
  last_name: string
  title_fr: string
  title_en?: string
  title_ar?: string
  bio_fr?: string
  photo?: string
  email?: string
  phone?: string
  office?: string
  department_id?: string
  service_id?: string
  linkedin?: string
  is_published: boolean
  sort_order: number
}

export const mockStaff: Staff[] = [
  // === DIRECTION ===
  {
    id: 'staff-recteur',
    slug: 'thierry-verdel',
    staff_type: 'direction',
    civility: 'Pr',
    first_name: 'Thierry',
    last_name: 'Verdel',
    title_fr: 'Recteur',
    title_en: 'Rector',
    bio_fr: 'Professeur Thierry Verdel est Recteur de l\'Université Senghor depuis 2020. Spécialiste en génie civil et gestion des risques.',
    photo: null,
    email: 'recteur@usenghor.org',
    service_id: 'srv-cabinet',
    is_published: true,
    sort_order: 1
  },
  {
    id: 'staff-sg',
    slug: 'secretaire-general',
    staff_type: 'direction',
    civility: 'M.',
    first_name: 'Ahmed',
    last_name: 'Hassan',
    title_fr: 'Secrétaire Général',
    title_en: 'Secretary General',
    photo: null,
    email: 'sg@usenghor.org',
    service_id: 'srv-cabinet',
    is_published: true,
    sort_order: 2
  },

  // === CHEFS DE DÉPARTEMENT ===
  {
    id: 'staff-001',
    slug: 'marie-dupont',
    staff_type: 'enseignant',
    civility: 'Pr',
    first_name: 'Marie',
    last_name: 'Dupont',
    title_fr: 'Cheffe du Département Culture',
    title_en: 'Head of Culture Department',
    bio_fr: 'Professeure en politiques culturelles et patrimoine. Docteure de l\'Université Paris 1 Panthéon-Sorbonne.',
    photo: null,
    email: 'm.dupont@usenghor.org',
    department_id: 'dept-culture',
    linkedin: 'https://linkedin.com/in/mariedupont',
    is_published: true,
    sort_order: 10
  },
  {
    id: 'staff-002',
    slug: 'abdoulaye-diallo',
    staff_type: 'enseignant',
    civility: 'Dr',
    first_name: 'Abdoulaye',
    last_name: 'Diallo',
    title_fr: 'Chef du Département Environnement',
    title_en: 'Head of Environment Department',
    bio_fr: 'Docteur en sciences de l\'environnement. Expert en développement durable et changement climatique.',
    photo: null,
    email: 'a.diallo@usenghor.org',
    department_id: 'dept-environnement',
    is_published: true,
    sort_order: 11
  },
  {
    id: 'staff-003',
    slug: 'fatou-ndiaye',
    staff_type: 'enseignant',
    civility: 'Pr',
    first_name: 'Fatou',
    last_name: 'Ndiaye',
    title_fr: 'Cheffe du Département Management',
    title_en: 'Head of Management Department',
    bio_fr: 'Professeure en management des organisations. Spécialiste du leadership en Afrique.',
    photo: null,
    email: 'f.ndiaye@usenghor.org',
    department_id: 'dept-management',
    is_published: true,
    sort_order: 12
  },
  {
    id: 'staff-004',
    slug: 'mohamed-ben-ali',
    staff_type: 'enseignant',
    civility: 'Dr',
    first_name: 'Mohamed',
    last_name: 'Ben Ali',
    title_fr: 'Chef du Département Santé',
    title_en: 'Head of Health Department',
    bio_fr: 'Docteur en santé publique. Expert en systèmes de santé africains.',
    photo: null,
    email: 'm.benali@usenghor.org',
    department_id: 'dept-sante',
    is_published: true,
    sort_order: 13
  },
  {
    id: 'staff-005',
    slug: 'jean-baptiste-kouassi',
    staff_type: 'enseignant',
    civility: 'Pr',
    first_name: 'Jean-Baptiste',
    last_name: 'Kouassi',
    title_fr: 'Directeur de l\'École Doctorale',
    title_en: 'Director of Doctoral School',
    bio_fr: 'Professeur titulaire. Spécialiste en recherche et méthodologie.',
    photo: null,
    email: 'jb.kouassi@usenghor.org',
    department_id: 'dept-doctoral',
    is_published: true,
    sort_order: 14
  },

  // === ENSEIGNANTS ===
  {
    id: 'staff-ens-001',
    slug: 'amina-toure',
    staff_type: 'enseignant',
    civility: 'Dr',
    first_name: 'Amina',
    last_name: 'Touré',
    title_fr: 'Maître de conférences',
    photo: null,
    email: 'a.toure@usenghor.org',
    department_id: 'dept-culture',
    is_published: true,
    sort_order: 20
  },
  {
    id: 'staff-ens-002',
    slug: 'oumar-sy',
    staff_type: 'enseignant',
    civility: 'Dr',
    first_name: 'Oumar',
    last_name: 'Sy',
    title_fr: 'Maître de conférences',
    photo: null,
    email: 'o.sy@usenghor.org',
    department_id: 'dept-environnement',
    is_published: true,
    sort_order: 21
  },
  {
    id: 'staff-ens-003',
    slug: 'awa-fall',
    staff_type: 'enseignant',
    civility: 'Dr',
    first_name: 'Awa',
    last_name: 'Fall',
    title_fr: 'Enseignante-chercheure',
    photo: null,
    email: 'a.fall@usenghor.org',
    department_id: 'dept-management',
    is_published: true,
    sort_order: 22
  },

  // === ADMINISTRATIFS ===
  {
    id: 'staff-adm-001',
    slug: 'sarah-martin',
    staff_type: 'administratif',
    civility: 'Mme',
    first_name: 'Sarah',
    last_name: 'Martin',
    title_fr: 'Responsable de la Scolarité',
    email: 'scolarite@usenghor.org',
    service_id: 'srv-scolarite',
    is_published: true,
    sort_order: 30
  },
  {
    id: 'staff-adm-002',
    slug: 'karim-el-fassi',
    staff_type: 'administratif',
    civility: 'M.',
    first_name: 'Karim',
    last_name: 'El Fassi',
    title_fr: 'Responsable Informatique',
    email: 'it@usenghor.org',
    service_id: 'srv-informatique',
    is_published: true,
    sort_order: 31
  },
  {
    id: 'staff-adm-003',
    slug: 'nadia-bensaid',
    staff_type: 'administratif',
    civility: 'Mme',
    first_name: 'Nadia',
    last_name: 'Bensaïd',
    title_fr: 'Bibliothécaire en chef',
    email: 'bibliotheque@usenghor.org',
    service_id: 'srv-bibliotheque',
    is_published: true,
    sort_order: 32
  },
  {
    id: 'staff-adm-004',
    slug: 'philippe-roger',
    staff_type: 'administratif',
    civility: 'M.',
    first_name: 'Philippe',
    last_name: 'Roger',
    title_fr: 'Responsable Communication',
    email: 'communication@usenghor.org',
    service_id: 'srv-communication',
    is_published: true,
    sort_order: 33
  }
]
