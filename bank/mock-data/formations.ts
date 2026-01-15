/**
 * Mock Data: Formations
 * Table SQL: formations
 * Basé sur les programmes réels de l'Université Senghor (BrochureMaquettes.pdf)
 */

export type FormationType = 'doctorat' | 'master' | 'du' | 'certifiante'
export type CampusType = 'alexandrie' | 'externalise' | 'en_ligne'

export interface ProgramModule {
  name: string
  credits?: number
}

export interface ProgramSemester {
  number: number
  title: string
  modules: ProgramModule[]
}

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
  program?: ProgramSemester[]
}

// Modules communs Semestre 7 (tous les masters)
const commonSemester7Base: ProgramModule[] = [
  { name: 'Anglais et Arabe dialectal' },
  { name: 'Techniques de rédaction et de présentation personnelle' },
  { name: 'Informatique et Internet' },
  { name: 'Conduite des affaires (certificat IBDL)' },
  { name: 'Méthodes et outils de montage de projets' },
  { name: 'Francophonie et mondialisation' }
]

// Modules communs Semestre 8 (tous les masters)
const commonSemester8Base: ProgramModule[] = [
  { name: 'État de droit, démocratie et développement' },
  { name: 'Leadership' },
  { name: 'Économie du développement' },
  { name: 'Veille informationnelle et recherche documentaire' }
]

// Modules communs Semestre 9 (tous les masters)
const commonSemester9Base: ProgramModule[] = [
  { name: 'Gestion budgétaire des projets de coopération au développement' },
  { name: 'Initiation à la prospective' }
]

// Semestre 10 commun (tous les masters)
const commonSemester10: ProgramSemester = {
  number: 10,
  title: 'Semestre 10 - Stage et Mémoire',
  modules: [
    { name: 'Méthodologie de rédaction d\'un mémoire' },
    { name: 'Stage', credits: 10 },
    { name: 'Mémoire', credits: 12 },
    { name: 'Soutenance', credits: 6 }
  ]
}

export const mockFormations: Formation[] = [
  // =============================================
  // MASTERS EN CULTURE - Campus d'Alexandrie
  // =============================================
  {
    id: 'form-master-patrimoine-culturel',
    slug: 'master-gestion-patrimoine-culturel',
    formation_type: 'master',
    title_fr: 'Master Gestion du Patrimoine Culturel',
    title_en: 'Master in Cultural Heritage Management',
    title_ar: 'ماجستير إدارة التراث الثقافي',
    short_description_fr: 'Former des experts en conservation, inventaire et valorisation du patrimoine culturel africain, incluant les archives, bibliothèques, musées et monuments.',
    short_description_en: 'Train experts in conservation, inventory and enhancement of African cultural heritage, including archives, libraries, museums and monuments.',
    department_id: 'dept-culture',
    campus: 'alexandrie',
    duration_fr: '2 ans (4 semestres)',
    duration_en: '2 years (4 semesters)',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: 'https://picsum.photos/seed/patrimoine-culturel/800/500',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15',
    program: [
      {
        number: 7,
        title: 'Semestre 7 - Fondamentaux',
        modules: [
          ...commonSemester7Base,
          { name: 'Histoire de l\'Art africain' },
          { name: 'Culture et développement' },
          { name: 'Politiques publiques culturelles' },
          { name: 'Droit de la propriété intellectuelle' },
          { name: 'Innovation et entrepreneuriat culturel' },
          { name: 'Numérique : comprendre les nouvelles donnes' },
          { name: 'Projet de créativité', credits: 6 }
        ]
      },
      {
        number: 8,
        title: 'Semestre 8 - Approfondissement',
        modules: [
          ...commonSemester8Base,
          { name: 'Stratégies de communication' },
          { name: 'Leadership culturel' },
          { name: 'Marché des programmes audiovisuels' },
          { name: 'Marché de l\'art, circulation et restitutions des œuvres d\'art' },
          { name: 'Économie de la culture' },
          { name: 'Gestion des institutions culturelles' },
          { name: 'Négociation de partenariats' },
          { name: 'Semaine départementale' },
          { name: 'Projet de département', credits: 6 }
        ]
      },
      {
        number: 9,
        title: 'Semestre 9 - Gestion du patrimoine culturel',
        modules: [
          ...commonSemester9Base,
          { name: 'Protection et transmission du patrimoine immatériel' },
          { name: 'Vade Mecum de réponse à un appel d\'offre ou de consultance' },
          { name: 'Sponsoring et Mécénat' },
          { name: 'Inventaire, conservation et restauration' },
          { name: 'Gestion des archives' },
          { name: 'Gestion des bibliothèques' },
          { name: 'Gestion du patrimoine audiovisuel' },
          { name: 'Gestion des musées et monuments nationaux' },
          { name: 'Patrimoine culturel et nouvelles technologies' },
          { name: 'Tourisme et valorisation du patrimoine culturel' },
          { name: 'Projet de spécialité', credits: 6 }
        ]
      },
      commonSemester10
    ]
  },
  {
    id: 'form-master-entreprises-culturelles',
    slug: 'master-management-entreprises-culturelles',
    formation_type: 'master',
    title_fr: 'Master Management des Entreprises Culturelles',
    title_en: 'Master in Cultural Enterprises Management',
    title_ar: 'ماجستير إدارة المؤسسات الثقافية',
    short_description_fr: 'Former des managers culturels capables de gérer les industries créatives, festivals, médias et structures de diffusion culturelle.',
    short_description_en: 'Train cultural managers capable of managing creative industries, festivals, media and cultural distribution structures.',
    department_id: 'dept-culture',
    campus: 'alexandrie',
    duration_fr: '2 ans (4 semestres)',
    duration_en: '2 years (4 semesters)',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: 'https://picsum.photos/seed/entreprises-culturelles/800/500',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15',
    program: [
      {
        number: 7,
        title: 'Semestre 7 - Fondamentaux',
        modules: [
          ...commonSemester7Base,
          { name: 'Histoire de l\'Art africain' },
          { name: 'Culture et développement' },
          { name: 'Politiques publiques culturelles' },
          { name: 'Droit de la propriété intellectuelle' },
          { name: 'Innovation et entrepreneuriat culturel' },
          { name: 'Numérique : comprendre les nouvelles donnes' },
          { name: 'Projet de créativité', credits: 6 }
        ]
      },
      {
        number: 8,
        title: 'Semestre 8 - Approfondissement',
        modules: [
          ...commonSemester8Base,
          { name: 'Stratégies de communication' },
          { name: 'Leadership culturel' },
          { name: 'Marché des programmes audiovisuels' },
          { name: 'Marché de l\'art, circulation et restitutions des œuvres d\'art' },
          { name: 'Économie de la culture' },
          { name: 'Gestion des institutions culturelles' },
          { name: 'Négociation de partenariats' },
          { name: 'Semaine départementale' },
          { name: 'Projet de département', credits: 6 }
        ]
      },
      {
        number: 9,
        title: 'Semestre 9 - Management des entreprises culturelles',
        modules: [
          ...commonSemester9Base,
          { name: 'Protection et transmission du patrimoine immatériel' },
          { name: 'Vade Mecum de réponse à un appel d\'offre ou de consultance' },
          { name: 'Sponsoring et Mécénat' },
          { name: 'Statuts juridiques des expressions culturelles' },
          { name: 'Organisation des festivals et autres manifestations culturelles' },
          { name: 'Industries de création et de diffusion culturelle' },
          { name: 'Conception et financement de projets culturels' },
          { name: 'Médias et cultures digitales' },
          { name: 'Prévention des risques dans les activités à caractère culturel' },
          { name: 'Techniques de communication et de valorisation des activités culturelles' },
          { name: 'Projet de spécialité', credits: 6 }
        ]
      },
      commonSemester10
    ]
  },

  // =============================================
  // MASTERS EN ENVIRONNEMENT - Campus d'Alexandrie
  // =============================================
  {
    id: 'form-master-aires-protegees',
    slug: 'master-gestion-aires-protegees-biodiversite',
    formation_type: 'master',
    title_fr: 'Master Gestion des Aires Protégées et de la Biodiversité',
    title_en: 'Master in Protected Areas and Biodiversity Management',
    title_ar: 'ماجستير إدارة المناطق المحمية والتنوع البيولوجي',
    short_description_fr: 'Former des gestionnaires d\'aires protégées et d\'espaces naturels, experts en conservation de la biodiversité africaine.',
    short_description_en: 'Train managers of protected areas and natural spaces, experts in African biodiversity conservation.',
    department_id: 'dept-environnement',
    campus: 'alexandrie',
    duration_fr: '2 ans (4 semestres)',
    duration_en: '2 years (4 semesters)',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: '/images/formations/aires-protegees.jpg',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15',
    program: [
      {
        number: 7,
        title: 'Semestre 7 - Fondamentaux',
        modules: [
          ...commonSemester7Base,
          { name: 'Sociologie de l\'environnement' },
          { name: 'Économie de l\'environnement' },
          { name: 'Écologie générale' },
          { name: 'Droit de l\'environnement' },
          { name: 'Gouvernance environnementale et relations internationales' },
          { name: 'Changement climatique et développement' },
          { name: 'Projet de créativité', credits: 6 }
        ]
      },
      {
        number: 8,
        title: 'Semestre 8 - Approfondissement',
        modules: [
          ...commonSemester8Base,
          { name: 'Éducation environnementale et développement durable' },
          { name: 'Écologie appliquée et industrielle' },
          { name: 'Urbanisation et villes durables' },
          { name: 'Techniques d\'échantillonnage et de collecte de données' },
          { name: 'Analyse statistique multivariée' },
          { name: 'Géomatique appliquée à l\'environnement' },
          { name: 'Évaluation environnementale' },
          { name: 'Semaine départementale' },
          { name: 'Projet de département', credits: 6 }
        ]
      },
      {
        number: 9,
        title: 'Semestre 9 - Gestion des aires protégées et de la biodiversité',
        modules: [
          ...commonSemester9Base,
          { name: 'Agriculture durable et agroforesterie' },
          { name: 'Aires protégées et zones humides' },
          { name: 'Politiques économiques de gestion de l\'environnement' },
          { name: 'Politiques de conservation et efficacité de gestion des aires protégées en Afrique' },
          { name: 'Plan de gestion et suivi-évaluation des aires protégées' },
          { name: 'Instruments de sécurisation et conservation des aires protégées' },
          { name: 'Suivi écologique et techniques d\'inventaire et conservation d\'espèces' },
          { name: 'Financement et valorisation des aires protégées' },
          { name: 'Biodiversité, écologie et conservation des aires protégées' },
          { name: 'Projet de spécialité', credits: 6 }
        ]
      },
      commonSemester10
    ]
  },
  {
    id: 'form-master-gestion-environnement',
    slug: 'master-gestion-environnement',
    formation_type: 'master',
    title_fr: 'Master Gestion de l\'Environnement',
    title_en: 'Master in Environmental Management',
    title_ar: 'ماجستير إدارة البيئة',
    short_description_fr: 'Former des experts en gestion environnementale, études d\'impact, gestion des déchets, des eaux et des risques environnementaux.',
    short_description_en: 'Train experts in environmental management, impact studies, waste management, water and environmental risks.',
    department_id: 'dept-environnement',
    campus: 'alexandrie',
    duration_fr: '2 ans (4 semestres)',
    duration_en: '2 years (4 semesters)',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: '/images/formations/gestion-environnement.jpg',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15',
    program: [
      {
        number: 7,
        title: 'Semestre 7 - Fondamentaux',
        modules: [
          ...commonSemester7Base,
          { name: 'Sociologie de l\'environnement' },
          { name: 'Économie de l\'environnement' },
          { name: 'Écologie générale' },
          { name: 'Droit de l\'environnement' },
          { name: 'Gouvernance environnementale et relations internationales' },
          { name: 'Changement climatique et développement' },
          { name: 'Projet de créativité', credits: 6 }
        ]
      },
      {
        number: 8,
        title: 'Semestre 8 - Approfondissement',
        modules: [
          ...commonSemester8Base,
          { name: 'Éducation environnementale et développement durable' },
          { name: 'Écologie appliquée et industrielle' },
          { name: 'Urbanisation et villes durables' },
          { name: 'Techniques d\'échantillonnage et de collecte de données' },
          { name: 'Analyse statistique multivariée' },
          { name: 'Géomatique appliquée à l\'environnement' },
          { name: 'Évaluation environnementale' },
          { name: 'Semaine départementale' },
          { name: 'Projet de département', credits: 6 }
        ]
      },
      {
        number: 9,
        title: 'Semestre 9 - Gestion de l\'environnement',
        modules: [
          ...commonSemester9Base,
          { name: 'Agriculture durable et agroforesterie' },
          { name: 'Aires protégées et zones humides' },
          { name: 'Économie et politiques de gestion de l\'environnement' },
          { name: 'Étude d\'impact environnemental et social' },
          { name: 'Gestion des déchets ménagers' },
          { name: 'Assainissement, qualités et traitement des eaux' },
          { name: 'Énergie et développement durable' },
          { name: 'Décentralisation et gestion de l\'environnement' },
          { name: 'Concepts, méthodes et outils de la gestion des risques accidentels' },
          { name: 'Projet de spécialité', credits: 6 }
        ]
      },
      commonSemester10
    ]
  },

  // =============================================
  // MASTERS EN MANAGEMENT - Campus d'Alexandrie
  // =============================================
  {
    id: 'form-master-gouvernance-public',
    slug: 'master-gouvernance-management-public',
    formation_type: 'master',
    title_fr: 'Master Gouvernance et Management Public',
    title_en: 'Master in Governance and Public Management',
    title_ar: 'ماجستير الحوكمة والإدارة العامة',
    short_description_fr: 'Former des cadres supérieurs de l\'administration publique, experts en politiques publiques, e-gouvernance et modernisation de l\'État.',
    short_description_en: 'Train senior public administration executives, experts in public policy, e-governance and state modernization.',
    department_id: 'dept-management',
    campus: 'alexandrie',
    duration_fr: '2 ans (4 semestres)',
    duration_en: '2 years (4 semesters)',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: '/images/formations/gouvernance-public.jpg',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15',
    program: [
      {
        number: 7,
        title: 'Semestre 7 - Fondamentaux',
        modules: [
          ...commonSemester7Base,
          { name: 'Conception et gestion de projet' },
          { name: 'Rôle et action de l\'État' },
          { name: 'Décentralisation et développement local' },
          { name: 'Droit de l\'OHADA' },
          { name: 'Droit de l\'administration publique' },
          { name: 'Projet de créativité', credits: 6 }
        ]
      },
      {
        number: 8,
        title: 'Semestre 8 - Approfondissement',
        modules: [
          ...commonSemester8Base,
          { name: 'Modèles contemporains de management' },
          { name: 'Management de la qualité et de la performance' },
          { name: 'Management stratégique' },
          { name: 'Gouvernance et passation des marchés publics' },
          { name: 'Management de l\'innovation' },
          { name: 'Contrôle administratif' },
          { name: 'Semaine départementale' },
          { name: 'Projet de département', credits: 6 }
        ]
      },
      {
        number: 9,
        title: 'Semestre 9 - Gouvernance et management public',
        modules: [
          ...commonSemester9Base,
          { name: 'Gestion financière' },
          { name: 'Management interculturel' },
          { name: 'Économie et finances publiques' },
          { name: 'Gestion des risques de projets' },
          { name: 'Gestion des ressources humaines' },
          { name: 'Partenariat public-privé' },
          { name: 'Conception, pilotage et évaluation de politiques publiques' },
          { name: 'Pratiques de gouvernance et de management public' },
          { name: 'E-gouvernance et modernisation des administrations africaines' },
          { name: 'Projet de spécialité', credits: 6 }
        ]
      },
      commonSemester10
    ]
  },
  {
    id: 'form-master-management-projets',
    slug: 'master-management-projets',
    formation_type: 'master',
    title_fr: 'Master Management de Projets',
    title_en: 'Master in Project Management',
    title_ar: 'ماجستير إدارة المشاريع',
    short_description_fr: 'Former des chefs de projets capables de planifier, financer, exécuter et évaluer des projets de développement internationaux.',
    short_description_en: 'Train project managers capable of planning, financing, executing and evaluating international development projects.',
    department_id: 'dept-management',
    campus: 'alexandrie',
    duration_fr: '2 ans (4 semestres)',
    duration_en: '2 years (4 semesters)',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: '/images/formations/management-projets.jpg',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15',
    program: [
      {
        number: 7,
        title: 'Semestre 7 - Fondamentaux',
        modules: [
          ...commonSemester7Base,
          { name: 'Conception et gestion de projet' },
          { name: 'Rôle et action de l\'État' },
          { name: 'Décentralisation et développement local' },
          { name: 'Droit de l\'OHADA' },
          { name: 'Droit de l\'administration publique' },
          { name: 'Projet de créativité', credits: 6 }
        ]
      },
      {
        number: 8,
        title: 'Semestre 8 - Approfondissement',
        modules: [
          ...commonSemester8Base,
          { name: 'Modèles contemporains de management' },
          { name: 'Management de la qualité et de la performance' },
          { name: 'Management stratégique' },
          { name: 'Gouvernance et passation des marchés publics' },
          { name: 'Management de l\'innovation' },
          { name: 'Contrôle administratif' },
          { name: 'Semaine départementale' },
          { name: 'Projet de département', credits: 6 }
        ]
      },
      {
        number: 9,
        title: 'Semestre 9 - Management de projets',
        modules: [
          ...commonSemester9Base,
          { name: 'Gestion financière' },
          { name: 'Management interculturel' },
          { name: 'Management d\'équipes de projets' },
          { name: 'Gestion des risques de projets' },
          { name: 'Planification et suivi opérationnel de projets' },
          { name: 'Évaluation de projets' },
          { name: 'Financement de projets' },
          { name: 'Gestion de projets internationaux' },
          { name: 'Marketing de projets' },
          { name: 'Projet de spécialité', credits: 6 }
        ]
      },
      commonSemester10
    ]
  },

  // =============================================
  // MASTERS EN SANTÉ - Campus d'Alexandrie
  // =============================================
  {
    id: 'form-master-sante-publique',
    slug: 'master-sante-publique-internationale',
    formation_type: 'master',
    title_fr: 'Master Santé Publique Internationale',
    title_en: 'Master in International Public Health',
    title_ar: 'ماجستير الصحة العامة الدولية',
    short_description_fr: 'Former des experts en santé publique internationale, surveillance épidémiologique, santé maternelle et gestion hospitalière.',
    short_description_en: 'Train experts in international public health, epidemiological surveillance, maternal health and hospital management.',
    department_id: 'dept-sante',
    campus: 'alexandrie',
    duration_fr: '2 ans (4 semestres)',
    duration_en: '2 years (4 semesters)',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: '/images/formations/sante-publique.jpg',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15',
    program: [
      {
        number: 7,
        title: 'Semestre 7 - Fondamentaux',
        modules: [
          ...commonSemester7Base,
          { name: 'Santé publique nationale et internationale : histoire, anthropologie, sociologie, éthique, droit' },
          { name: 'Mondialisation, indicateurs, inégalités, déterminants de la santé' },
          { name: 'Politiques de santé - Systèmes de santé' },
          { name: 'Nutrition et équilibre alimentaire : les bases fondamentales' },
          { name: 'Épidémiologie et prévention des maladies infectieuses et tropicales' },
          { name: 'Vaccins - Global Health' },
          { name: 'Projet de créativité', credits: 6 }
        ]
      },
      {
        number: 8,
        title: 'Semestre 8 - Approfondissement',
        modules: [
          ...commonSemester8Base,
          { name: 'Épidémiologie' },
          { name: 'Analyse et traitement de données quantitatives' },
          { name: 'Analyse et traitement de données qualitatives' },
          { name: 'Méthodologie en Santé Publique' },
          { name: 'Médicaments dans les pays en développement' },
          { name: 'Essais cliniques' },
          { name: 'Semaine départementale' },
          { name: 'Projet de département', credits: 6 }
        ]
      },
      {
        number: 9,
        title: 'Semestre 9 - Santé publique internationale',
        modules: [
          ...commonSemester9Base,
          { name: 'Environnement et santé' },
          { name: 'Maladies non-transmissibles : épidémiologie et prévention' },
          { name: 'Institutions sanitaires internationales' },
          { name: 'Évaluation des stratégies de santé' },
          { name: 'Santé sexuelle et approche "genre" - Santé des adolescents' },
          { name: 'Santé de la reproduction' },
          { name: 'Santé maternelle' },
          { name: 'Gestion hospitalière dans les pays du Sud' },
          { name: 'Surveillance et veille épidémiologique' },
          { name: 'Projet de spécialité', credits: 6 }
        ]
      },
      commonSemester10
    ]
  },
  {
    id: 'form-master-nutrition',
    slug: 'master-nutrition-internationale',
    formation_type: 'master',
    title_fr: 'Master Nutrition Internationale',
    title_en: 'Master in International Nutrition',
    title_ar: 'ماجستير التغذية الدولية',
    short_description_fr: 'Former des spécialistes en nutrition publique, sécurité alimentaire et prévention des malnutritions dans les pays en développement.',
    short_description_en: 'Train specialists in public nutrition, food security and malnutrition prevention in developing countries.',
    department_id: 'dept-sante',
    campus: 'alexandrie',
    duration_fr: '2 ans (4 semestres)',
    duration_en: '2 years (4 semesters)',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: '/images/formations/nutrition.jpg',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15',
    program: [
      {
        number: 7,
        title: 'Semestre 7 - Fondamentaux',
        modules: [
          ...commonSemester7Base,
          { name: 'Santé publique nationale et internationale : histoire, anthropologie, sociologie, éthique, droit' },
          { name: 'Mondialisation, indicateurs, inégalités, déterminants de la santé' },
          { name: 'Politiques de santé - Systèmes de santé' },
          { name: 'Nutrition et équilibre alimentaire : les bases fondamentales' },
          { name: 'Épidémiologie et prévention des maladies infectieuses et tropicales' },
          { name: 'Vaccins - Global Health' },
          { name: 'Projet de créativité', credits: 6 }
        ]
      },
      {
        number: 8,
        title: 'Semestre 8 - Approfondissement',
        modules: [
          ...commonSemester8Base,
          { name: 'Épidémiologie' },
          { name: 'Analyse et traitement de données quantitatives' },
          { name: 'Analyse et traitement de données qualitatives' },
          { name: 'Méthodologie en Santé Publique' },
          { name: 'Médicaments dans les pays en développement' },
          { name: 'Essais cliniques' },
          { name: 'Semaine départementale' },
          { name: 'Projet de département', credits: 6 }
        ]
      },
      {
        number: 9,
        title: 'Semestre 9 - Nutrition internationale',
        modules: [
          ...commonSemester9Base,
          { name: 'Environnement et santé' },
          { name: 'Maladies non-transmissibles : épidémiologie et prévention' },
          { name: 'Institutions sanitaires internationales' },
          { name: 'Concepts et bases en nutrition et alimentation' },
          { name: 'Sécurité microbiologique de l\'alimentation et assurance qualité' },
          { name: 'Sécurité alimentaire' },
          { name: 'Malnutritions carentielles (épidémiologie et prévention)' },
          { name: 'Enquêtes en nutrition et alimentation' },
          { name: 'Projet de spécialité', credits: 6 }
        ]
      },
      commonSemester10
    ]
  },

  // =============================================
  // MASTER GGRC - Campus d'Alexandrie
  // =============================================
  {
    id: 'form-master-ggrc',
    slug: 'master-gestion-globale-risques-crises',
    formation_type: 'master',
    title_fr: 'Master Gestion Globale des Risques et des Crises (GGRC)',
    title_en: 'Master in Global Risk and Crisis Management',
    title_ar: 'ماجستير الإدارة الشاملة للمخاطر والأزمات',
    short_description_fr: 'Former des experts en gestion des risques, prévention des crises humanitaires, gestion de l\'urgence et résolution des conflits.',
    short_description_en: 'Train experts in risk management, humanitarian crisis prevention, emergency management and conflict resolution.',
    department_id: 'dept-management',
    campus: 'alexandrie',
    duration_fr: '2 ans (4 semestres)',
    duration_en: '2 years (4 semesters)',
    credits: 120,
    diploma_fr: 'Master professionnel',
    image: '/images/formations/ggrc.jpg',
    is_published: true,
    is_featured: true,
    application_open: true,
    application_deadline: '2025-05-31',
    start_date: '2025-09-15',
    program: [
      {
        number: 7,
        title: 'Semestre 7 - Fondamentaux (tronc commun interdépartemental)',
        modules: [
          ...commonSemester7Base,
          { name: 'Modules interdisciplinaires de base' },
          { name: 'Projet de créativité', credits: 6 }
        ]
      },
      {
        number: 8,
        title: 'Semestre 8 - Approfondissement (tronc commun)',
        modules: [
          ...commonSemester8Base,
          { name: 'Modules d\'approfondissement pluridisciplinaires' },
          { name: 'Semaine départementale' },
          { name: 'Projet de département', credits: 6 }
        ]
      },
      {
        number: 9,
        title: 'Semestre 9 - Gestion globale des risques et des crises',
        modules: [
          ...commonSemester9Base,
          { name: 'Concepts, méthodes et outils de la gestion des risques accidentels' },
          { name: 'Environnement et santé' },
          { name: 'Prévention des risques dans les activités à caractère culturel' },
          { name: 'Gestion des risques de projets' },
          { name: 'Action publique et gestion des risques' },
          { name: 'Management environnemental' },
          { name: 'Prévention des risques de corruption' },
          { name: 'Gestion de l\'urgence et des situations de crises' },
          { name: 'Gestion des crises humanitaires' },
          { name: 'Prévention des conflits, paix et sécurité' },
          { name: 'Projet de spécialité', credits: 6 }
        ]
      },
      commonSemester10
    ]
  },

  // =============================================
  // MASTERS CAMPUS EXTERNALISÉS
  // =============================================
  {
    id: 'form-master-mgt-dakar',
    slug: 'master-management-dakar',
    formation_type: 'master',
    title_fr: 'Master Management de Projets - Campus de Dakar',
    title_en: 'Master in Project Management - Dakar Campus',
    short_description_fr: 'Formation en management de projets dispensée sur notre campus de Dakar en partenariat avec l\'UCAD.',
    short_description_en: 'Project management training delivered at our Dakar campus in partnership with UCAD.',
    department_id: 'dept-management',
    campus: 'externalise',
    campus_externalise_id: 'campus-dakar',
    duration_fr: '2 ans',
    duration_en: '2 years',
    credits: 120,
    image: '/images/formations/campus-dakar.jpg',
    is_published: true,
    is_featured: false,
    application_open: true,
    application_deadline: '2025-06-15'
  },
  {
    id: 'form-master-env-yaounde',
    slug: 'master-environnement-yaounde',
    formation_type: 'master',
    title_fr: 'Master Gestion de l\'Environnement - Campus de Yaoundé',
    title_en: 'Master in Environmental Management - Yaoundé Campus',
    short_description_fr: 'Formation en environnement et développement durable pour l\'Afrique Centrale.',
    short_description_en: 'Environmental and sustainable development training for Central Africa.',
    department_id: 'dept-environnement',
    campus: 'externalise',
    campus_externalise_id: 'campus-yaounde',
    duration_fr: '2 ans',
    duration_en: '2 years',
    credits: 120,
    image: '/images/formations/campus-yaounde.jpg',
    is_published: true,
    is_featured: false,
    application_open: false
  },
  {
    id: 'form-master-sante-abidjan',
    slug: 'master-sante-publique-abidjan',
    formation_type: 'master',
    title_fr: 'Master Santé Publique Internationale - Campus d\'Abidjan',
    title_en: 'Master in International Public Health - Abidjan Campus',
    short_description_fr: 'Formation en santé publique dispensée en partenariat avec l\'Université Félix Houphouët-Boigny.',
    short_description_en: 'Public health training delivered in partnership with Félix Houphouët-Boigny University.',
    department_id: 'dept-sante',
    campus: 'externalise',
    campus_externalise_id: 'campus-abidjan',
    duration_fr: '2 ans',
    duration_en: '2 years',
    credits: 120,
    image: '/images/formations/campus-abidjan.jpg',
    is_published: true,
    is_featured: false,
    application_open: true,
    application_deadline: '2025-06-30'
  },

  // =============================================
  // DOCTORATS
  // =============================================
  {
    id: 'form-doctorat-culture',
    slug: 'doctorat-culture-patrimoine',
    formation_type: 'doctorat',
    title_fr: 'Doctorat en Culture et Patrimoine',
    title_en: 'PhD in Culture and Heritage',
    title_ar: 'دكتوراه في الثقافة والتراث',
    short_description_fr: 'Programme doctoral en politiques culturelles, industries créatives et patrimoine africain. Recherche approfondie sur les enjeux culturels du continent.',
    short_description_en: 'Doctoral program in cultural policies, creative industries and African heritage. In-depth research on cultural issues of the continent.',
    department_id: 'dept-doctoral',
    campus: 'alexandrie',
    duration_fr: '3-4 ans',
    duration_en: '3-4 years',
    diploma_fr: 'Doctorat',
    image: '/images/formations/doctorat-culture.jpg',
    is_published: true,
    is_featured: false,
    application_open: true,
    application_deadline: '2025-04-30'
  },
  {
    id: 'form-doctorat-env',
    slug: 'doctorat-environnement',
    formation_type: 'doctorat',
    title_fr: 'Doctorat en Sciences de l\'Environnement',
    title_en: 'PhD in Environmental Sciences',
    title_ar: 'دكتوراه في علوم البيئة',
    short_description_fr: 'Programme doctoral axé sur les enjeux environnementaux africains : biodiversité, changement climatique, gestion durable des ressources.',
    short_description_en: 'Doctoral program focused on African environmental issues: biodiversity, climate change, sustainable resource management.',
    department_id: 'dept-doctoral',
    campus: 'alexandrie',
    duration_fr: '3-4 ans',
    duration_en: '3-4 years',
    diploma_fr: 'Doctorat',
    image: '/images/formations/doctorat-environnement.jpg',
    is_published: true,
    is_featured: false,
    application_open: true,
    application_deadline: '2025-04-30'
  },
  {
    id: 'form-doctorat-management',
    slug: 'doctorat-management-developpement',
    formation_type: 'doctorat',
    title_fr: 'Doctorat en Management et Développement',
    title_en: 'PhD in Management and Development',
    title_ar: 'دكتوراه في الإدارة والتنمية',
    short_description_fr: 'Programme doctoral en sciences de gestion appliquées au développement africain : gouvernance, politiques publiques, innovation managériale.',
    short_description_en: 'Doctoral program in management sciences applied to African development: governance, public policies, managerial innovation.',
    department_id: 'dept-doctoral',
    campus: 'alexandrie',
    duration_fr: '3-4 ans',
    duration_en: '3-4 years',
    diploma_fr: 'Doctorat',
    image: '/images/formations/doctorat-management.jpg',
    is_published: true,
    is_featured: false,
    application_open: true,
    application_deadline: '2025-04-30'
  },
  {
    id: 'form-doctorat-sante',
    slug: 'doctorat-sante-publique',
    formation_type: 'doctorat',
    title_fr: 'Doctorat en Santé Publique',
    title_en: 'PhD in Public Health',
    title_ar: 'دكتوراه في الصحة العامة',
    short_description_fr: 'Programme doctoral en santé publique : épidémiologie, systèmes de santé, nutrition et politiques de santé en Afrique.',
    short_description_en: 'Doctoral program in public health: epidemiology, health systems, nutrition and health policies in Africa.',
    department_id: 'dept-doctoral',
    campus: 'alexandrie',
    duration_fr: '3-4 ans',
    duration_en: '3-4 years',
    diploma_fr: 'Doctorat',
    image: '/images/formations/doctorat-sante.jpg',
    is_published: true,
    is_featured: false,
    application_open: true,
    application_deadline: '2025-04-30'
  },

  // =============================================
  // DIPLÔMES D'UNIVERSITÉ (DU)
  // =============================================
  {
    id: 'form-du-entrepreneuriat',
    slug: 'du-entrepreneuriat-innovation-afrique',
    formation_type: 'du',
    title_fr: 'DU Entrepreneuriat et Innovation en Afrique',
    title_en: 'University Diploma in Entrepreneurship and Innovation in Africa',
    short_description_fr: 'Formation courte pour développer les compétences entrepreneuriales et accompagner la création d\'entreprises innovantes en Afrique.',
    short_description_en: 'Short training to develop entrepreneurial skills and support the creation of innovative businesses in Africa.',
    department_id: 'dept-management',
    campus: 'alexandrie',
    duration_fr: '6 mois',
    duration_en: '6 months',
    credits: 30,
    diploma_fr: 'Diplôme d\'Université',
    image: '/images/formations/du-entrepreneuriat.jpg',
    is_published: true,
    is_featured: false,
    application_open: true,
    application_deadline: '2025-03-31'
  },
  {
    id: 'form-du-conduite-affaires',
    slug: 'du-conduite-affaires-ibdl',
    formation_type: 'du',
    title_fr: 'DU Conduite des Affaires (Certificat IBDL)',
    title_en: 'University Diploma in Business Conduct (IBDL Certificate)',
    short_description_fr: 'Formation certifiante IBDL (International Business Driving Licence) pour maîtriser les fondamentaux de la gestion d\'entreprise.',
    short_description_en: 'IBDL (International Business Driving Licence) certification training to master business management fundamentals.',
    department_id: 'dept-management',
    campus: 'alexandrie',
    duration_fr: '3 mois',
    duration_en: '3 months',
    credits: 15,
    diploma_fr: 'Diplôme d\'Université + Certificat IBDL',
    image: '/images/formations/du-ibdl.jpg',
    is_published: true,
    is_featured: false,
    application_open: true
  },
  {
    id: 'form-du-gestion-projets',
    slug: 'du-gestion-projets-developpement',
    formation_type: 'du',
    title_fr: 'DU Gestion de Projets de Développement',
    title_en: 'University Diploma in Development Project Management',
    short_description_fr: 'Formation intensive aux méthodes et outils de montage, gestion et évaluation de projets de développement.',
    short_description_en: 'Intensive training in methods and tools for designing, managing and evaluating development projects.',
    department_id: 'dept-management',
    campus: 'alexandrie',
    duration_fr: '4 mois',
    duration_en: '4 months',
    credits: 20,
    diploma_fr: 'Diplôme d\'Université',
    image: '/images/formations/du-projets.jpg',
    is_published: true,
    is_featured: false,
    application_open: true,
    application_deadline: '2025-04-15'
  },

  // =============================================
  // FORMATIONS CERTIFIANTES (EN LIGNE)
  // =============================================
  {
    id: 'form-cert-numerique',
    slug: 'certificat-transformation-numerique',
    formation_type: 'certifiante',
    title_fr: 'Certificat Transformation Numérique des Organisations',
    title_en: 'Certificate in Digital Transformation of Organizations',
    short_description_fr: 'Formation certifiante en ligne sur la transformation digitale, l\'e-gouvernance et la modernisation des organisations.',
    short_description_en: 'Online certification training on digital transformation, e-governance and organizational modernization.',
    department_id: 'dept-management',
    campus: 'en_ligne',
    duration_fr: '3 mois',
    duration_en: '3 months',
    credits: 12,
    diploma_fr: 'Certificat',
    image: '/images/formations/cert-numerique.jpg',
    is_published: true,
    is_featured: false,
    application_open: true
  },
  {
    id: 'form-cert-climat',
    slug: 'certificat-adaptation-changement-climatique',
    formation_type: 'certifiante',
    title_fr: 'Certificat Adaptation au Changement Climatique',
    title_en: 'Certificate in Climate Change Adaptation',
    short_description_fr: 'Formation certifiante sur les stratégies d\'adaptation au changement climatique en Afrique et les outils de résilience.',
    short_description_en: 'Certification training on climate change adaptation strategies in Africa and resilience tools.',
    department_id: 'dept-environnement',
    campus: 'en_ligne',
    duration_fr: '3 mois',
    duration_en: '3 months',
    credits: 12,
    diploma_fr: 'Certificat',
    image: '/images/formations/cert-climat.jpg',
    is_published: true,
    is_featured: false,
    application_open: true
  },
  {
    id: 'form-cert-sante-communautaire',
    slug: 'certificat-sante-communautaire',
    formation_type: 'certifiante',
    title_fr: 'Certificat Santé Communautaire',
    title_en: 'Certificate in Community Health',
    short_description_fr: 'Formation en ligne sur les approches communautaires en santé publique et la promotion de la santé en milieu rural.',
    short_description_en: 'Online training on community approaches in public health and health promotion in rural areas.',
    department_id: 'dept-sante',
    campus: 'en_ligne',
    duration_fr: '2 mois',
    duration_en: '2 months',
    credits: 8,
    diploma_fr: 'Certificat',
    image: '/images/formations/cert-sante.jpg',
    is_published: true,
    is_featured: false,
    application_open: true
  },
  {
    id: 'form-cert-patrimoine-numerique',
    slug: 'certificat-patrimoine-numerique',
    formation_type: 'certifiante',
    title_fr: 'Certificat Patrimoine et Nouvelles Technologies',
    title_en: 'Certificate in Heritage and New Technologies',
    short_description_fr: 'Formation sur la numérisation du patrimoine, les archives numériques et la valorisation culturelle par le digital.',
    short_description_en: 'Training on heritage digitization, digital archives and cultural enhancement through digital technology.',
    department_id: 'dept-culture',
    campus: 'en_ligne',
    duration_fr: '2 mois',
    duration_en: '2 months',
    credits: 8,
    diploma_fr: 'Certificat',
    image: '/images/formations/cert-patrimoine.jpg',
    is_published: true,
    is_featured: false,
    application_open: true
  }
]
