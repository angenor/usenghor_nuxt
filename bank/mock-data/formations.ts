/**
 * Mock Data: Formations
 * Table SQL: formations
 */

export type FormationType = 'doctorat' | 'master' | 'du' | 'certifiante'
export type CampusType = 'alexandrie' | 'externalise' | 'en_ligne'

export interface Formation {
  id: string
  slug: string
  formation_type: FormationType
  title_fr: string
  title_en?: string
  title_ar?: string
  short_description_fr: string
  short_description_en?: string
  department_id: string
  campus: CampusType
  campus_externalise_id?: string
  duration_fr: string
  duration_en?: string
  credits?: number
  diploma_fr?: string
  image?: string
  is_published: boolean
  is_featured: boolean
  application_open: boolean
  application_deadline?: string
  start_date?: string
}

export const mockFormations: Formation[] = [
  // === MASTERS ALEXANDRIE ===
  {
    id: 'form-master-pc',
    slug: 'master-politiques-culturelles',
    formation_type: 'master',
    title_fr: 'Master Politiques Culturelles et Gestion des Industries Créatives',
    title_en: 'Master in Cultural Policies and Creative Industries Management',
    short_description_fr: 'Former des professionnels capables de concevoir et mettre en œuvre des politiques culturelles adaptées aux contextes africains.',
    department_id: 'dept-culture',
    campus: 'alexandrie',
    duration_fr: '2 ans',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: 'https://picsum.photos/seed/master-culture/800/500',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15'
  },
  {
    id: 'form-master-env',
    slug: 'master-environnement-developpement-durable',
    formation_type: 'master',
    title_fr: 'Master Environnement et Développement Durable',
    title_en: 'Master in Environment and Sustainable Development',
    short_description_fr: 'Former des experts en gestion de l\'environnement et adaptation au changement climatique en Afrique.',
    department_id: 'dept-environnement',
    campus: 'alexandrie',
    duration_fr: '2 ans',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: 'https://picsum.photos/seed/master-env/800/500',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15'
  },
  {
    id: 'form-master-mgt',
    slug: 'master-management-organisations',
    formation_type: 'master',
    title_fr: 'Master Management des Organisations',
    title_en: 'Master in Organizational Management',
    short_description_fr: 'Former les futurs dirigeants et managers des organisations publiques et privées africaines.',
    department_id: 'dept-management',
    campus: 'alexandrie',
    duration_fr: '2 ans',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: 'https://picsum.photos/seed/master-mgt/800/500',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15'
  },
  {
    id: 'form-master-sante',
    slug: 'master-sante-publique',
    formation_type: 'master',
    title_fr: 'Master Santé Publique et Management des Systèmes de Santé',
    title_en: 'Master in Public Health and Health Systems Management',
    short_description_fr: 'Former des cadres de santé publique capables de piloter les systèmes de santé africains.',
    department_id: 'dept-sante',
    campus: 'alexandrie',
    duration_fr: '2 ans',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: 'https://picsum.photos/seed/master-sante/800/500',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15'
  },

  // === MASTERS CAMPUS EXTERNALISÉS ===
  {
    id: 'form-master-mgt-dakar',
    slug: 'master-management-dakar',
    formation_type: 'master',
    title_fr: 'Master Management des Organisations - Campus de Dakar',
    short_description_fr: 'Formation en management dispensée sur notre campus de Dakar en partenariat avec l\'UCAD.',
    department_id: 'dept-management',
    campus: 'externalise',
    campus_externalise_id: 'campus-dakar',
    duration_fr: '2 ans',
    credits: 120,
    image: 'https://picsum.photos/seed/master-mgt-dakar/800/500',
    is_published: true,
    is_featured: false,
    application_open: true
  },
  {
    id: 'form-master-env-yaounde',
    slug: 'master-environnement-yaounde',
    formation_type: 'master',
    title_fr: 'Master Environnement - Campus de Yaoundé',
    short_description_fr: 'Formation en environnement et développement durable pour l\'Afrique Centrale.',
    department_id: 'dept-environnement',
    campus: 'externalise',
    campus_externalise_id: 'campus-yaounde',
    duration_fr: '2 ans',
    credits: 120,
    image: 'https://picsum.photos/seed/master-env-yaounde/800/500',
    is_published: true,
    is_featured: false,
    application_open: false
  },

  // === DOCTORATS ===
  {
    id: 'form-doctorat-culture',
    slug: 'doctorat-culture-patrimoine',
    formation_type: 'doctorat',
    title_fr: 'Doctorat en Culture et Patrimoine',
    short_description_fr: 'Programme doctoral en politiques culturelles, industries créatives et patrimoine africain.',
    department_id: 'dept-doctoral',
    campus: 'alexandrie',
    duration_fr: '3-4 ans',
    diploma_fr: 'Doctorat',
    is_published: true,
    is_featured: false,
    application_open: true
  },
  {
    id: 'form-doctorat-env',
    slug: 'doctorat-environnement',
    formation_type: 'doctorat',
    title_fr: 'Doctorat en Sciences de l\'Environnement',
    short_description_fr: 'Programme doctoral axé sur les enjeux environnementaux africains.',
    department_id: 'dept-doctoral',
    campus: 'alexandrie',
    duration_fr: '3-4 ans',
    diploma_fr: 'Doctorat',
    is_published: true,
    is_featured: false,
    application_open: true
  },

  // === DIPLÔMES D'UNIVERSITÉ ===
  {
    id: 'form-du-entrepreneuriat',
    slug: 'du-entrepreneuriat-africain',
    formation_type: 'du',
    title_fr: 'DU Entrepreneuriat et Innovation en Afrique',
    short_description_fr: 'Formation courte pour développer les compétences entrepreneuriales.',
    department_id: 'dept-management',
    campus: 'alexandrie',
    duration_fr: '6 mois',
    diploma_fr: 'Diplôme d\'Université',
    is_published: true,
    is_featured: false,
    application_open: true
  },

  // === FORMATIONS CERTIFIANTES ===
  {
    id: 'form-cert-numerique',
    slug: 'certificat-transformation-numerique',
    formation_type: 'certifiante',
    title_fr: 'Certificat Transformation Numérique des Organisations',
    short_description_fr: 'Formation certifiante en ligne sur la transformation digitale.',
    department_id: 'dept-management',
    campus: 'en_ligne',
    duration_fr: '3 mois',
    diploma_fr: 'Certificat',
    is_published: true,
    is_featured: false,
    application_open: true
  },
  {
    id: 'form-cert-climat',
    slug: 'certificat-changement-climatique',
    formation_type: 'certifiante',
    title_fr: 'Certificat Adaptation au Changement Climatique',
    short_description_fr: 'Formation certifiante sur les stratégies d\'adaptation en Afrique.',
    department_id: 'dept-environnement',
    campus: 'en_ligne',
    duration_fr: '3 mois',
    diploma_fr: 'Certificat',
    is_published: true,
    is_featured: false,
    application_open: true
  }
]
