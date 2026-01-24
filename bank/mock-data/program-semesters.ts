/**
 * Mock Data: Semestres et Cours
 * Tables SQL: program_semesters, program_courses
 * Basé sur les programmes réels de l'Université Senghor
 */

// Interface pour un cours (UE - Unité d'Enseignement)
export interface ProgramCourse {
  id: string
  semester_id: string
  code?: string
  title: string
  description?: string
  credits?: number
  lecture_hours: number // Heures CM (cours magistraux)
  tutorial_hours: number // Heures TD (travaux dirigés)
  practical_hours: number // Heures TP (travaux pratiques)
  coefficient?: number
  display_order: number
}

// Interface pour un semestre
export interface ProgramSemesterData {
  id: string
  program_id: string
  number: number
  title?: string
  credits: number
  display_order: number
}

// Helper pour générer des IDs
const generateId = (prefix: string, programId: string, index: number) =>
  `${prefix}-${programId}-${index}`

// ============================================
// SEMESTRES
// ============================================

export const mockProgramSemesters: ProgramSemesterData[] = [
  // === Master Gestion du Patrimoine Culturel ===
  {
    id: 'sem-patrimoine-7',
    program_id: 'form-master-patrimoine-culturel',
    number: 7,
    title: 'Fondamentaux',
    credits: 30,
    display_order: 1
  },
  {
    id: 'sem-patrimoine-8',
    program_id: 'form-master-patrimoine-culturel',
    number: 8,
    title: 'Approfondissement',
    credits: 30,
    display_order: 2
  },
  {
    id: 'sem-patrimoine-9',
    program_id: 'form-master-patrimoine-culturel',
    number: 9,
    title: 'Gestion du patrimoine culturel',
    credits: 30,
    display_order: 3
  },
  {
    id: 'sem-patrimoine-10',
    program_id: 'form-master-patrimoine-culturel',
    number: 10,
    title: 'Stage et Mémoire',
    credits: 30,
    display_order: 4
  },

  // === Master Management des Entreprises Culturelles ===
  {
    id: 'sem-entreprises-7',
    program_id: 'form-master-entreprises-culturelles',
    number: 7,
    title: 'Fondamentaux',
    credits: 30,
    display_order: 1
  },
  {
    id: 'sem-entreprises-8',
    program_id: 'form-master-entreprises-culturelles',
    number: 8,
    title: 'Approfondissement',
    credits: 30,
    display_order: 2
  },
  {
    id: 'sem-entreprises-9',
    program_id: 'form-master-entreprises-culturelles',
    number: 9,
    title: 'Management des entreprises culturelles',
    credits: 30,
    display_order: 3
  },
  {
    id: 'sem-entreprises-10',
    program_id: 'form-master-entreprises-culturelles',
    number: 10,
    title: 'Stage et Mémoire',
    credits: 30,
    display_order: 4
  },

  // === Master Gestion des Aires Protégées et Biodiversité ===
  {
    id: 'sem-aires-7',
    program_id: 'form-master-aires-protegees',
    number: 7,
    title: 'Fondamentaux',
    credits: 30,
    display_order: 1
  },
  {
    id: 'sem-aires-8',
    program_id: 'form-master-aires-protegees',
    number: 8,
    title: 'Approfondissement',
    credits: 30,
    display_order: 2
  },
  {
    id: 'sem-aires-9',
    program_id: 'form-master-aires-protegees',
    number: 9,
    title: 'Gestion des aires protégées',
    credits: 30,
    display_order: 3
  },
  {
    id: 'sem-aires-10',
    program_id: 'form-master-aires-protegees',
    number: 10,
    title: 'Stage et Mémoire',
    credits: 30,
    display_order: 4
  },

  // === Master Gestion de l'Environnement ===
  {
    id: 'sem-env-7',
    program_id: 'form-master-gestion-environnement',
    number: 7,
    title: 'Fondamentaux',
    credits: 30,
    display_order: 1
  },
  {
    id: 'sem-env-8',
    program_id: 'form-master-gestion-environnement',
    number: 8,
    title: 'Approfondissement',
    credits: 30,
    display_order: 2
  },
  {
    id: 'sem-env-9',
    program_id: 'form-master-gestion-environnement',
    number: 9,
    title: 'Gestion de l\'environnement',
    credits: 30,
    display_order: 3
  },
  {
    id: 'sem-env-10',
    program_id: 'form-master-gestion-environnement',
    number: 10,
    title: 'Stage et Mémoire',
    credits: 30,
    display_order: 4
  },

  // === Master Gouvernance et Management Public ===
  {
    id: 'sem-gouv-7',
    program_id: 'form-master-gouvernance-public',
    number: 7,
    title: 'Fondamentaux',
    credits: 30,
    display_order: 1
  },
  {
    id: 'sem-gouv-8',
    program_id: 'form-master-gouvernance-public',
    number: 8,
    title: 'Approfondissement',
    credits: 30,
    display_order: 2
  },
  {
    id: 'sem-gouv-9',
    program_id: 'form-master-gouvernance-public',
    number: 9,
    title: 'Gouvernance et management public',
    credits: 30,
    display_order: 3
  },
  {
    id: 'sem-gouv-10',
    program_id: 'form-master-gouvernance-public',
    number: 10,
    title: 'Stage et Mémoire',
    credits: 30,
    display_order: 4
  },

  // === Master Management de Projets ===
  {
    id: 'sem-projets-7',
    program_id: 'form-master-management-projets',
    number: 7,
    title: 'Fondamentaux',
    credits: 30,
    display_order: 1
  },
  {
    id: 'sem-projets-8',
    program_id: 'form-master-management-projets',
    number: 8,
    title: 'Approfondissement',
    credits: 30,
    display_order: 2
  },
  {
    id: 'sem-projets-9',
    program_id: 'form-master-management-projets',
    number: 9,
    title: 'Management de projets',
    credits: 30,
    display_order: 3
  },
  {
    id: 'sem-projets-10',
    program_id: 'form-master-management-projets',
    number: 10,
    title: 'Stage et Mémoire',
    credits: 30,
    display_order: 4
  },

  // === Master Santé Publique Internationale ===
  {
    id: 'sem-sante-7',
    program_id: 'form-master-sante-publique',
    number: 7,
    title: 'Fondamentaux',
    credits: 30,
    display_order: 1
  },
  {
    id: 'sem-sante-8',
    program_id: 'form-master-sante-publique',
    number: 8,
    title: 'Approfondissement',
    credits: 30,
    display_order: 2
  },
  {
    id: 'sem-sante-9',
    program_id: 'form-master-sante-publique',
    number: 9,
    title: 'Santé publique internationale',
    credits: 30,
    display_order: 3
  },
  {
    id: 'sem-sante-10',
    program_id: 'form-master-sante-publique',
    number: 10,
    title: 'Stage et Mémoire',
    credits: 30,
    display_order: 4
  },

  // === Master Nutrition Internationale ===
  {
    id: 'sem-nutrition-7',
    program_id: 'form-master-nutrition',
    number: 7,
    title: 'Fondamentaux',
    credits: 30,
    display_order: 1
  },
  {
    id: 'sem-nutrition-8',
    program_id: 'form-master-nutrition',
    number: 8,
    title: 'Approfondissement',
    credits: 30,
    display_order: 2
  },
  {
    id: 'sem-nutrition-9',
    program_id: 'form-master-nutrition',
    number: 9,
    title: 'Nutrition internationale',
    credits: 30,
    display_order: 3
  },
  {
    id: 'sem-nutrition-10',
    program_id: 'form-master-nutrition',
    number: 10,
    title: 'Stage et Mémoire',
    credits: 30,
    display_order: 4
  },

  // === Master GGRC ===
  {
    id: 'sem-ggrc-7',
    program_id: 'form-master-ggrc',
    number: 7,
    title: 'Fondamentaux interdépartementaux',
    credits: 30,
    display_order: 1
  },
  {
    id: 'sem-ggrc-8',
    program_id: 'form-master-ggrc',
    number: 8,
    title: 'Approfondissement',
    credits: 30,
    display_order: 2
  },
  {
    id: 'sem-ggrc-9',
    program_id: 'form-master-ggrc',
    number: 9,
    title: 'Gestion des risques et crises',
    credits: 30,
    display_order: 3
  },
  {
    id: 'sem-ggrc-10',
    program_id: 'form-master-ggrc',
    number: 10,
    title: 'Stage et Mémoire',
    credits: 30,
    display_order: 4
  }
]

// ============================================
// COURS
// ============================================

export const mockProgramCourses: ProgramCourse[] = [
  // ================================================
  // MASTER PATRIMOINE CULTUREL - SEMESTRE 7
  // ================================================
  {
    id: 'course-patr-7-01',
    semester_id: 'sem-patrimoine-7',
    code: 'CUL701',
    title: 'Anglais et Arabe dialectal',
    description: 'Perfectionnement linguistique pour la communication professionnelle internationale.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 1,
    display_order: 1
  },
  {
    id: 'course-patr-7-02',
    semester_id: 'sem-patrimoine-7',
    code: 'CUL702',
    title: 'Techniques de rédaction et de présentation personnelle',
    description: 'Méthodologie de rédaction scientifique et techniques de présentation orale.',
    credits: 2,
    lecture_hours: 10,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 2
  },
  {
    id: 'course-patr-7-03',
    semester_id: 'sem-patrimoine-7',
    code: 'CUL703',
    title: 'Informatique et Internet',
    description: 'Outils numériques pour la gestion documentaire et la recherche.',
    credits: 2,
    lecture_hours: 10,
    tutorial_hours: 5,
    practical_hours: 10,
    coefficient: 1,
    display_order: 3
  },
  {
    id: 'course-patr-7-04',
    semester_id: 'sem-patrimoine-7',
    code: 'CUL704',
    title: 'Conduite des affaires (certificat IBDL)',
    description: 'Formation certifiante aux fondamentaux de la gestion d\'entreprise.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 4
  },
  {
    id: 'course-patr-7-05',
    semester_id: 'sem-patrimoine-7',
    code: 'CUL705',
    title: 'Méthodes et outils de montage de projets',
    description: 'Conception, planification et financement de projets culturels.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 5
  },
  {
    id: 'course-patr-7-06',
    semester_id: 'sem-patrimoine-7',
    code: 'CUL706',
    title: 'Francophonie et mondialisation',
    description: 'Enjeux de la francophonie dans le contexte de la globalisation culturelle.',
    credits: 2,
    lecture_hours: 15,
    tutorial_hours: 5,
    practical_hours: 0,
    coefficient: 1,
    display_order: 6
  },
  {
    id: 'course-patr-7-07',
    semester_id: 'sem-patrimoine-7',
    code: 'CUL707',
    title: 'Histoire de l\'Art africain',
    description: 'Panorama de l\'art africain des origines à nos jours.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 7
  },
  {
    id: 'course-patr-7-08',
    semester_id: 'sem-patrimoine-7',
    code: 'CUL708',
    title: 'Culture et développement',
    description: 'Rôle de la culture dans les stratégies de développement durable.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 8
  },
  {
    id: 'course-patr-7-09',
    semester_id: 'sem-patrimoine-7',
    code: 'CUL709',
    title: 'Politiques publiques culturelles',
    description: 'Analyse des politiques culturelles nationales et internationales.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 9
  },
  {
    id: 'course-patr-7-10',
    semester_id: 'sem-patrimoine-7',
    code: 'CUL710',
    title: 'Projet de créativité',
    description: 'Projet collaboratif de création culturelle.',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 10,
    practical_hours: 40,
    coefficient: 2,
    display_order: 10
  },

  // ================================================
  // MASTER PATRIMOINE CULTUREL - SEMESTRE 8
  // ================================================
  {
    id: 'course-patr-8-01',
    semester_id: 'sem-patrimoine-8',
    code: 'CUL801',
    title: 'État de droit, démocratie et développement',
    description: 'Fondements juridiques et institutionnels du développement.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 1
  },
  {
    id: 'course-patr-8-02',
    semester_id: 'sem-patrimoine-8',
    code: 'CUL802',
    title: 'Leadership',
    description: 'Théories et pratiques du leadership dans les organisations culturelles.',
    credits: 2,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 2
  },
  {
    id: 'course-patr-8-03',
    semester_id: 'sem-patrimoine-8',
    code: 'CUL803',
    title: 'Économie du développement',
    description: 'Concepts économiques appliqués au contexte africain.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 3
  },
  {
    id: 'course-patr-8-04',
    semester_id: 'sem-patrimoine-8',
    code: 'CUL804',
    title: 'Stratégies de communication',
    description: 'Communication institutionnelle et médiatique pour le secteur culturel.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 4
  },
  {
    id: 'course-patr-8-05',
    semester_id: 'sem-patrimoine-8',
    code: 'CUL805',
    title: 'Marché de l\'art et restitutions',
    description: 'Enjeux du marché de l\'art africain et débats sur les restitutions.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 5
  },
  {
    id: 'course-patr-8-06',
    semester_id: 'sem-patrimoine-8',
    code: 'CUL806',
    title: 'Économie de la culture',
    description: 'Analyse économique des industries culturelles et créatives.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 6
  },
  {
    id: 'course-patr-8-07',
    semester_id: 'sem-patrimoine-8',
    code: 'CUL807',
    title: 'Gestion des institutions culturelles',
    description: 'Management des musées, bibliothèques et centres culturels.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 7
  },
  {
    id: 'course-patr-8-08',
    semester_id: 'sem-patrimoine-8',
    code: 'CUL808',
    title: 'Semaine départementale',
    description: 'Immersion thématique avec intervenants extérieurs.',
    credits: 2,
    lecture_hours: 30,
    tutorial_hours: 0,
    practical_hours: 10,
    coefficient: 1,
    display_order: 8
  },
  {
    id: 'course-patr-8-09',
    semester_id: 'sem-patrimoine-8',
    code: 'CUL809',
    title: 'Projet de département',
    description: 'Projet collaboratif interdisciplinaire.',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 10,
    practical_hours: 40,
    coefficient: 2,
    display_order: 9
  },

  // ================================================
  // MASTER PATRIMOINE CULTUREL - SEMESTRE 9
  // ================================================
  {
    id: 'course-patr-9-01',
    semester_id: 'sem-patrimoine-9',
    code: 'CUL901',
    title: 'Gestion budgétaire des projets de coopération',
    description: 'Techniques de gestion financière des projets internationaux.',
    credits: 2,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 1
  },
  {
    id: 'course-patr-9-02',
    semester_id: 'sem-patrimoine-9',
    code: 'CUL902',
    title: 'Initiation à la prospective',
    description: 'Méthodes d\'analyse prospective pour le secteur culturel.',
    credits: 2,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 2
  },
  {
    id: 'course-patr-9-03',
    semester_id: 'sem-patrimoine-9',
    code: 'CUL903',
    title: 'Protection du patrimoine immatériel',
    description: 'Cadre juridique et stratégies de sauvegarde du patrimoine immatériel.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 3
  },
  {
    id: 'course-patr-9-04',
    semester_id: 'sem-patrimoine-9',
    code: 'CUL904',
    title: 'Inventaire, conservation et restauration',
    description: 'Techniques d\'inventaire et de conservation préventive.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 10,
    coefficient: 1.5,
    display_order: 4
  },
  {
    id: 'course-patr-9-05',
    semester_id: 'sem-patrimoine-9',
    code: 'CUL905',
    title: 'Gestion des archives',
    description: 'Organisation et valorisation des fonds d\'archives.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 10,
    coefficient: 1.5,
    display_order: 5
  },
  {
    id: 'course-patr-9-06',
    semester_id: 'sem-patrimoine-9',
    code: 'CUL906',
    title: 'Gestion des bibliothèques',
    description: 'Management des bibliothèques et centres de documentation.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 10,
    coefficient: 1.5,
    display_order: 6
  },
  {
    id: 'course-patr-9-07',
    semester_id: 'sem-patrimoine-9',
    code: 'CUL907',
    title: 'Gestion des musées et monuments',
    description: 'Administration et mise en valeur des sites patrimoniaux.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 10,
    coefficient: 1.5,
    display_order: 7
  },
  {
    id: 'course-patr-9-08',
    semester_id: 'sem-patrimoine-9',
    code: 'CUL908',
    title: 'Patrimoine et nouvelles technologies',
    description: 'Numérisation et valorisation numérique du patrimoine.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 5,
    practical_hours: 15,
    coefficient: 1.5,
    display_order: 8
  },
  {
    id: 'course-patr-9-09',
    semester_id: 'sem-patrimoine-9',
    code: 'CUL909',
    title: 'Tourisme et valorisation du patrimoine',
    description: 'Développement touristique durable autour du patrimoine.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 9
  },
  {
    id: 'course-patr-9-10',
    semester_id: 'sem-patrimoine-9',
    code: 'CUL910',
    title: 'Projet de spécialité',
    description: 'Projet individuel de gestion patrimoniale.',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 10,
    practical_hours: 40,
    coefficient: 2,
    display_order: 10
  },

  // ================================================
  // MASTER PATRIMOINE CULTUREL - SEMESTRE 10
  // ================================================
  {
    id: 'course-patr-10-01',
    semester_id: 'sem-patrimoine-10',
    code: 'CUL1001',
    title: 'Méthodologie de rédaction d\'un mémoire',
    description: 'Accompagnement méthodologique pour la rédaction du mémoire.',
    credits: 2,
    lecture_hours: 10,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 1
  },
  {
    id: 'course-patr-10-02',
    semester_id: 'sem-patrimoine-10',
    code: 'CUL1002',
    title: 'Stage professionnel',
    description: 'Stage de 4 mois minimum dans une institution culturelle.',
    credits: 10,
    lecture_hours: 0,
    tutorial_hours: 0,
    practical_hours: 500,
    coefficient: 3,
    display_order: 2
  },
  {
    id: 'course-patr-10-03',
    semester_id: 'sem-patrimoine-10',
    code: 'CUL1003',
    title: 'Mémoire',
    description: 'Rédaction et présentation du mémoire de fin d\'études.',
    credits: 12,
    lecture_hours: 0,
    tutorial_hours: 20,
    practical_hours: 200,
    coefficient: 4,
    display_order: 3
  },
  {
    id: 'course-patr-10-04',
    semester_id: 'sem-patrimoine-10',
    code: 'CUL1004',
    title: 'Soutenance',
    description: 'Présentation et défense orale du mémoire.',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 5,
    practical_hours: 0,
    coefficient: 2,
    display_order: 4
  },

  // ================================================
  // MASTER MANAGEMENT DE PROJETS - SEMESTRE 7
  // ================================================
  {
    id: 'course-proj-7-01',
    semester_id: 'sem-projets-7',
    code: 'MGT701',
    title: 'Anglais et Arabe dialectal',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 1,
    display_order: 1
  },
  {
    id: 'course-proj-7-02',
    semester_id: 'sem-projets-7',
    code: 'MGT702',
    title: 'Techniques de rédaction et de présentation',
    credits: 2,
    lecture_hours: 10,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 2
  },
  {
    id: 'course-proj-7-03',
    semester_id: 'sem-projets-7',
    code: 'MGT703',
    title: 'Informatique et Internet',
    credits: 2,
    lecture_hours: 10,
    tutorial_hours: 5,
    practical_hours: 10,
    coefficient: 1,
    display_order: 3
  },
  {
    id: 'course-proj-7-04',
    semester_id: 'sem-projets-7',
    code: 'MGT704',
    title: 'Conduite des affaires (IBDL)',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 4
  },
  {
    id: 'course-proj-7-05',
    semester_id: 'sem-projets-7',
    code: 'MGT705',
    title: 'Méthodes et outils de montage de projets',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 5
  },
  {
    id: 'course-proj-7-06',
    semester_id: 'sem-projets-7',
    code: 'MGT706',
    title: 'Francophonie et mondialisation',
    credits: 2,
    lecture_hours: 15,
    tutorial_hours: 5,
    practical_hours: 0,
    coefficient: 1,
    display_order: 6
  },
  {
    id: 'course-proj-7-07',
    semester_id: 'sem-projets-7',
    code: 'MGT707',
    title: 'Conception et gestion de projet',
    description: 'Cycle de vie d\'un projet, cadre logique, planification.',
    credits: 4,
    lecture_hours: 25,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 2,
    display_order: 7
  },
  {
    id: 'course-proj-7-08',
    semester_id: 'sem-projets-7',
    code: 'MGT708',
    title: 'Rôle et action de l\'État',
    credits: 2,
    lecture_hours: 15,
    tutorial_hours: 5,
    practical_hours: 0,
    coefficient: 1,
    display_order: 8
  },
  {
    id: 'course-proj-7-09',
    semester_id: 'sem-projets-7',
    code: 'MGT709',
    title: 'Décentralisation et développement local',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 9
  },
  {
    id: 'course-proj-7-10',
    semester_id: 'sem-projets-7',
    code: 'MGT710',
    title: 'Projet de créativité',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 10,
    practical_hours: 40,
    coefficient: 2,
    display_order: 10
  },

  // ================================================
  // MASTER MANAGEMENT DE PROJETS - SEMESTRE 8
  // ================================================
  {
    id: 'course-proj-8-01',
    semester_id: 'sem-projets-8',
    code: 'MGT801',
    title: 'État de droit, démocratie et développement',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 1
  },
  {
    id: 'course-proj-8-02',
    semester_id: 'sem-projets-8',
    code: 'MGT802',
    title: 'Leadership',
    credits: 2,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 2
  },
  {
    id: 'course-proj-8-03',
    semester_id: 'sem-projets-8',
    code: 'MGT803',
    title: 'Économie du développement',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 3
  },
  {
    id: 'course-proj-8-04',
    semester_id: 'sem-projets-8',
    code: 'MGT804',
    title: 'Modèles contemporains de management',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 4
  },
  {
    id: 'course-proj-8-05',
    semester_id: 'sem-projets-8',
    code: 'MGT805',
    title: 'Management de la qualité et de la performance',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 5
  },
  {
    id: 'course-proj-8-06',
    semester_id: 'sem-projets-8',
    code: 'MGT806',
    title: 'Management stratégique',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 6
  },
  {
    id: 'course-proj-8-07',
    semester_id: 'sem-projets-8',
    code: 'MGT807',
    title: 'Gouvernance et passation des marchés publics',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 7
  },
  {
    id: 'course-proj-8-08',
    semester_id: 'sem-projets-8',
    code: 'MGT808',
    title: 'Semaine départementale',
    credits: 2,
    lecture_hours: 30,
    tutorial_hours: 0,
    practical_hours: 10,
    coefficient: 1,
    display_order: 8
  },
  {
    id: 'course-proj-8-09',
    semester_id: 'sem-projets-8',
    code: 'MGT809',
    title: 'Projet de département',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 10,
    practical_hours: 40,
    coefficient: 2,
    display_order: 9
  },

  // ================================================
  // MASTER MANAGEMENT DE PROJETS - SEMESTRE 9
  // ================================================
  {
    id: 'course-proj-9-01',
    semester_id: 'sem-projets-9',
    code: 'MGT901',
    title: 'Gestion budgétaire des projets de coopération',
    credits: 2,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 1
  },
  {
    id: 'course-proj-9-02',
    semester_id: 'sem-projets-9',
    code: 'MGT902',
    title: 'Initiation à la prospective',
    credits: 2,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 2
  },
  {
    id: 'course-proj-9-03',
    semester_id: 'sem-projets-9',
    code: 'MGT903',
    title: 'Gestion financière',
    description: 'Analyse financière et gestion budgétaire des projets.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 3
  },
  {
    id: 'course-proj-9-04',
    semester_id: 'sem-projets-9',
    code: 'MGT904',
    title: 'Management interculturel',
    description: 'Gestion de la diversité culturelle dans les projets internationaux.',
    credits: 2,
    lecture_hours: 15,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 4
  },
  {
    id: 'course-proj-9-05',
    semester_id: 'sem-projets-9',
    code: 'MGT905',
    title: 'Management d\'équipes de projets',
    description: 'Animation et coordination des équipes projet.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 5
  },
  {
    id: 'course-proj-9-06',
    semester_id: 'sem-projets-9',
    code: 'MGT906',
    title: 'Gestion des risques de projets',
    description: 'Identification, analyse et mitigation des risques projet.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 6
  },
  {
    id: 'course-proj-9-07',
    semester_id: 'sem-projets-9',
    code: 'MGT907',
    title: 'Planification et suivi opérationnel',
    description: 'Outils de planification (Gantt, PERT) et tableaux de bord.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 15,
    practical_hours: 5,
    coefficient: 1.5,
    display_order: 7
  },
  {
    id: 'course-proj-9-08',
    semester_id: 'sem-projets-9',
    code: 'MGT908',
    title: 'Évaluation de projets',
    description: 'Méthodes d\'évaluation ex-ante, à mi-parcours et ex-post.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 8
  },
  {
    id: 'course-proj-9-09',
    semester_id: 'sem-projets-9',
    code: 'MGT909',
    title: 'Financement de projets',
    description: 'Sources de financement et montage financier des projets.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 9
  },
  {
    id: 'course-proj-9-10',
    semester_id: 'sem-projets-9',
    code: 'MGT910',
    title: 'Projet de spécialité',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 10,
    practical_hours: 40,
    coefficient: 2,
    display_order: 10
  },

  // ================================================
  // MASTER MANAGEMENT DE PROJETS - SEMESTRE 10
  // ================================================
  {
    id: 'course-proj-10-01',
    semester_id: 'sem-projets-10',
    code: 'MGT1001',
    title: 'Méthodologie de rédaction d\'un mémoire',
    credits: 2,
    lecture_hours: 10,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 1
  },
  {
    id: 'course-proj-10-02',
    semester_id: 'sem-projets-10',
    code: 'MGT1002',
    title: 'Stage professionnel',
    credits: 10,
    lecture_hours: 0,
    tutorial_hours: 0,
    practical_hours: 500,
    coefficient: 3,
    display_order: 2
  },
  {
    id: 'course-proj-10-03',
    semester_id: 'sem-projets-10',
    code: 'MGT1003',
    title: 'Mémoire',
    credits: 12,
    lecture_hours: 0,
    tutorial_hours: 20,
    practical_hours: 200,
    coefficient: 4,
    display_order: 3
  },
  {
    id: 'course-proj-10-04',
    semester_id: 'sem-projets-10',
    code: 'MGT1004',
    title: 'Soutenance',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 5,
    practical_hours: 0,
    coefficient: 2,
    display_order: 4
  },

  // ================================================
  // MASTER SANTÉ PUBLIQUE - SEMESTRE 7
  // ================================================
  {
    id: 'course-sante-7-01',
    semester_id: 'sem-sante-7',
    code: 'SPI701',
    title: 'Anglais et Arabe dialectal',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 1,
    display_order: 1
  },
  {
    id: 'course-sante-7-02',
    semester_id: 'sem-sante-7',
    code: 'SPI702',
    title: 'Santé publique : histoire, anthropologie, éthique',
    description: 'Fondements historiques et éthiques de la santé publique internationale.',
    credits: 4,
    lecture_hours: 30,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 2,
    display_order: 2
  },
  {
    id: 'course-sante-7-03',
    semester_id: 'sem-sante-7',
    code: 'SPI703',
    title: 'Mondialisation et déterminants de la santé',
    description: 'Indicateurs de santé et facteurs socio-économiques.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 3
  },
  {
    id: 'course-sante-7-04',
    semester_id: 'sem-sante-7',
    code: 'SPI704',
    title: 'Politiques et systèmes de santé',
    description: 'Analyse comparée des systèmes de santé africains.',
    credits: 4,
    lecture_hours: 25,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 2,
    display_order: 4
  },
  {
    id: 'course-sante-7-05',
    semester_id: 'sem-sante-7',
    code: 'SPI705',
    title: 'Nutrition et équilibre alimentaire',
    description: 'Bases fondamentales de la nutrition en santé publique.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 5
  },
  {
    id: 'course-sante-7-06',
    semester_id: 'sem-sante-7',
    code: 'SPI706',
    title: 'Épidémiologie des maladies infectieuses',
    description: 'Prévention et contrôle des maladies transmissibles.',
    credits: 4,
    lecture_hours: 25,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 2,
    display_order: 6
  },
  {
    id: 'course-sante-7-07',
    semester_id: 'sem-sante-7',
    code: 'SPI707',
    title: 'Vaccins et Global Health',
    description: 'Programmes vaccinaux et santé mondiale.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 7
  },
  {
    id: 'course-sante-7-08',
    semester_id: 'sem-sante-7',
    code: 'SPI708',
    title: 'Projet de créativité',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 10,
    practical_hours: 40,
    coefficient: 2,
    display_order: 8
  },

  // ================================================
  // MASTER SANTÉ PUBLIQUE - SEMESTRE 8
  // ================================================
  {
    id: 'course-sante-8-01',
    semester_id: 'sem-sante-8',
    code: 'SPI801',
    title: 'Épidémiologie',
    description: 'Méthodes épidémiologiques quantitatives.',
    credits: 4,
    lecture_hours: 25,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 2,
    display_order: 1
  },
  {
    id: 'course-sante-8-02',
    semester_id: 'sem-sante-8',
    code: 'SPI802',
    title: 'Analyse de données quantitatives',
    description: 'Biostatistiques et logiciels d\'analyse (SPSS, R).',
    credits: 4,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 15,
    coefficient: 2,
    display_order: 2
  },
  {
    id: 'course-sante-8-03',
    semester_id: 'sem-sante-8',
    code: 'SPI803',
    title: 'Analyse de données qualitatives',
    description: 'Méthodologie qualitative en recherche en santé.',
    credits: 3,
    lecture_hours: 15,
    tutorial_hours: 15,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 3
  },
  {
    id: 'course-sante-8-04',
    semester_id: 'sem-sante-8',
    code: 'SPI804',
    title: 'Méthodologie en Santé Publique',
    description: 'Conception et mise en œuvre d\'études en santé publique.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 4
  },
  {
    id: 'course-sante-8-05',
    semester_id: 'sem-sante-8',
    code: 'SPI805',
    title: 'Médicaments dans les PED',
    description: 'Accès aux médicaments essentiels et pharmacovigilance.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 5
  },
  {
    id: 'course-sante-8-06',
    semester_id: 'sem-sante-8',
    code: 'SPI806',
    title: 'Essais cliniques',
    description: 'Méthodologie et éthique des essais cliniques.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 6
  },
  {
    id: 'course-sante-8-07',
    semester_id: 'sem-sante-8',
    code: 'SPI807',
    title: 'Semaine départementale',
    credits: 2,
    lecture_hours: 30,
    tutorial_hours: 0,
    practical_hours: 10,
    coefficient: 1,
    display_order: 7
  },
  {
    id: 'course-sante-8-08',
    semester_id: 'sem-sante-8',
    code: 'SPI808',
    title: 'Projet de département',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 10,
    practical_hours: 40,
    coefficient: 2,
    display_order: 8
  },

  // ================================================
  // MASTER SANTÉ PUBLIQUE - SEMESTRE 9
  // ================================================
  {
    id: 'course-sante-9-01',
    semester_id: 'sem-sante-9',
    code: 'SPI901',
    title: 'Environnement et santé',
    description: 'Impact environnemental sur la santé des populations.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 1
  },
  {
    id: 'course-sante-9-02',
    semester_id: 'sem-sante-9',
    code: 'SPI902',
    title: 'Maladies non-transmissibles',
    description: 'Épidémiologie et prévention des MNT.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 2
  },
  {
    id: 'course-sante-9-03',
    semester_id: 'sem-sante-9',
    code: 'SPI903',
    title: 'Institutions sanitaires internationales',
    description: 'OMS, UNICEF, Fonds mondial et coopération sanitaire.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 3
  },
  {
    id: 'course-sante-9-04',
    semester_id: 'sem-sante-9',
    code: 'SPI904',
    title: 'Évaluation des stratégies de santé',
    description: 'Méthodes d\'évaluation des programmes de santé.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 4
  },
  {
    id: 'course-sante-9-05',
    semester_id: 'sem-sante-9',
    code: 'SPI905',
    title: 'Santé sexuelle et genre',
    description: 'Approche genre et santé des adolescents.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 5
  },
  {
    id: 'course-sante-9-06',
    semester_id: 'sem-sante-9',
    code: 'SPI906',
    title: 'Santé de la reproduction',
    description: 'Planification familiale et santé reproductive.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 6
  },
  {
    id: 'course-sante-9-07',
    semester_id: 'sem-sante-9',
    code: 'SPI907',
    title: 'Santé maternelle',
    description: 'Réduction de la mortalité maternelle et néonatale.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 7
  },
  {
    id: 'course-sante-9-08',
    semester_id: 'sem-sante-9',
    code: 'SPI908',
    title: 'Gestion hospitalière',
    description: 'Management des établissements de santé dans les pays du Sud.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 8
  },
  {
    id: 'course-sante-9-09',
    semester_id: 'sem-sante-9',
    code: 'SPI909',
    title: 'Surveillance épidémiologique',
    description: 'Systèmes de veille et alerte sanitaire.',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1.5,
    display_order: 9
  },
  {
    id: 'course-sante-9-10',
    semester_id: 'sem-sante-9',
    code: 'SPI910',
    title: 'Projet de spécialité',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 10,
    practical_hours: 40,
    coefficient: 2,
    display_order: 10
  },

  // ================================================
  // MASTER SANTÉ PUBLIQUE - SEMESTRE 10
  // ================================================
  {
    id: 'course-sante-10-01',
    semester_id: 'sem-sante-10',
    code: 'SPI1001',
    title: 'Méthodologie de rédaction d\'un mémoire',
    credits: 2,
    lecture_hours: 10,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1,
    display_order: 1
  },
  {
    id: 'course-sante-10-02',
    semester_id: 'sem-sante-10',
    code: 'SPI1002',
    title: 'Stage professionnel',
    credits: 10,
    lecture_hours: 0,
    tutorial_hours: 0,
    practical_hours: 500,
    coefficient: 3,
    display_order: 2
  },
  {
    id: 'course-sante-10-03',
    semester_id: 'sem-sante-10',
    code: 'SPI1003',
    title: 'Mémoire',
    credits: 12,
    lecture_hours: 0,
    tutorial_hours: 20,
    practical_hours: 200,
    coefficient: 4,
    display_order: 3
  },
  {
    id: 'course-sante-10-04',
    semester_id: 'sem-sante-10',
    code: 'SPI1004',
    title: 'Soutenance',
    credits: 6,
    lecture_hours: 0,
    tutorial_hours: 5,
    practical_hours: 0,
    coefficient: 2,
    display_order: 4
  }
]

// Helper pour générer un ID de semestre
export const generateSemesterId = (programId: string, number: number) =>
  `sem-${programId}-${number}`

// Helper pour générer un ID de cours
export const generateCourseId = (semesterId: string, order: number) =>
  `course-${semesterId}-${order.toString().padStart(2, '0')}`
