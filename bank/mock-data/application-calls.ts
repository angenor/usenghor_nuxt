/**
 * Mock Data: Appels à candidatures (Back-office)
 * Basé sur le schéma SQL 08_application.sql
 */

// Types d'appels
export type CallType = 'application' | 'scholarship' | 'project' | 'recruitment' | 'training'

// Statuts d'un appel
export type CallStatus = 'ongoing' | 'closed' | 'upcoming'

// Statuts de publication
export type PublicationStatus = 'draft' | 'published' | 'archived'

// Critère d'éligibilité
export interface EligibilityCriteria {
  id: string
  call_id: string
  criterion: string
  is_mandatory: boolean
  display_order: number
}

// Prise en charge
export interface CallCoverage {
  id: string
  call_id: string
  item: string
  description?: string
  display_order: number
}

// Document requis
export interface RequiredDocument {
  id: string
  call_id: string
  document_name: string
  description?: string
  is_mandatory: boolean
  accepted_formats?: string
  max_size_mb?: number
  display_order: number
}

// Étape du calendrier
export interface CallScheduleItem {
  id: string
  call_id: string
  step: string
  start_date?: string
  end_date?: string
  description?: string
  display_order: number
}

// Appel à candidatures complet
export interface ApplicationCall {
  id: string
  title: string
  slug: string
  description?: string
  cover_image_external_id?: string
  program_external_id?: string
  campus_external_id?: string
  created_by_external_id?: string
  type: CallType
  status: CallStatus
  opening_date?: string
  deadline?: string
  program_start_date?: string
  program_end_date?: string
  target_audience?: string
  registration_fee?: number
  currency: string
  external_form_url?: string
  use_internal_form: boolean
  publication_status: PublicationStatus
  created_at: string
  updated_at: string
  // Relations (loaded separately or embedded)
  eligibility_criteria?: EligibilityCriteria[]
  coverage?: CallCoverage[]
  required_documents?: RequiredDocument[]
  schedule?: CallScheduleItem[]
  // Computed/stats
  applications_count?: number
}

// Générateurs d'ID
export const generateCallId = () => `call-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
export const generateCriteriaId = () => `crit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
export const generateCoverageId = () => `cov-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
export const generateDocumentId = () => `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
export const generateScheduleId = () => `sched-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

// Données mock des appels à candidatures
export const mockApplicationCalls: ApplicationCall[] = [
  // === APPEL 1: Master Développement ===
  {
    id: 'call-master-dev-2025',
    title: 'Appel à candidatures Master Développement 2025-2026',
    slug: 'master-developpement-2025-2026',
    description: `L'Université Senghor ouvre ses candidatures pour le Master en Développement, formation phare destinée aux futurs cadres africains souhaitant contribuer au développement durable du continent.

Cette formation de deux ans permet aux étudiants d'acquérir des compétences approfondies en gestion de projets, politiques publiques et développement territorial.`,
    program_external_id: 'prog-master-dev',
    campus_external_id: 'campus-alexandrie',
    type: 'application',
    status: 'ongoing',
    opening_date: '2025-01-15',
    deadline: '2025-06-30T23:59:00Z',
    program_start_date: '2025-09-15',
    program_end_date: '2027-06-30',
    target_audience: 'Cadres africains titulaires d\'un Bac+4 minimum',
    registration_fee: 50,
    currency: 'EUR',
    use_internal_form: true,
    publication_status: 'published',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-15T14:30:00Z',
    applications_count: 156,
    eligibility_criteria: [
      {
        id: 'crit-dev-1',
        call_id: 'call-master-dev-2025',
        criterion: 'Être titulaire d\'un diplôme de niveau Bac+4 minimum (licence, maîtrise ou équivalent)',
        is_mandatory: true,
        display_order: 1
      },
      {
        id: 'crit-dev-2',
        call_id: 'call-master-dev-2025',
        criterion: 'Être ressortissant d\'un pays membre de la Francophonie',
        is_mandatory: true,
        display_order: 2
      },
      {
        id: 'crit-dev-3',
        call_id: 'call-master-dev-2025',
        criterion: 'Avoir une expérience professionnelle d\'au moins 2 ans',
        is_mandatory: false,
        display_order: 3
      },
      {
        id: 'crit-dev-4',
        call_id: 'call-master-dev-2025',
        criterion: 'Maîtriser le français à l\'oral et à l\'écrit',
        is_mandatory: true,
        display_order: 4
      }
    ],
    coverage: [
      {
        id: 'cov-dev-1',
        call_id: 'call-master-dev-2025',
        item: 'Frais de scolarité',
        description: 'Exonération totale des frais de scolarité pour les boursiers',
        display_order: 1
      },
      {
        id: 'cov-dev-2',
        call_id: 'call-master-dev-2025',
        item: 'Allocation mensuelle',
        description: '400€/mois pour les étudiants boursiers',
        display_order: 2
      },
      {
        id: 'cov-dev-3',
        call_id: 'call-master-dev-2025',
        item: 'Hébergement',
        description: 'Logement en résidence universitaire',
        display_order: 3
      },
      {
        id: 'cov-dev-4',
        call_id: 'call-master-dev-2025',
        item: 'Assurance maladie',
        description: 'Couverture santé pendant toute la durée de la formation',
        display_order: 4
      }
    ],
    required_documents: [
      {
        id: 'doc-dev-1',
        call_id: 'call-master-dev-2025',
        document_name: 'Curriculum Vitae',
        description: 'CV détaillé incluant parcours académique et professionnel',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 2,
        display_order: 1
      },
      {
        id: 'doc-dev-2',
        call_id: 'call-master-dev-2025',
        document_name: 'Lettre de motivation',
        description: 'Maximum 2 pages, expliquant votre projet professionnel',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 2,
        display_order: 2
      },
      {
        id: 'doc-dev-3',
        call_id: 'call-master-dev-2025',
        document_name: 'Copie des diplômes',
        description: 'Copies certifiées conformes de tous les diplômes obtenus',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 10,
        display_order: 3
      },
      {
        id: 'doc-dev-4',
        call_id: 'call-master-dev-2025',
        document_name: 'Relevés de notes',
        description: 'Relevés de notes des 4 dernières années universitaires',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 10,
        display_order: 4
      },
      {
        id: 'doc-dev-5',
        call_id: 'call-master-dev-2025',
        document_name: 'Copie du passeport',
        description: 'Pages d\'identité du passeport valide',
        is_mandatory: true,
        accepted_formats: 'pdf,jpg,png',
        max_size_mb: 5,
        display_order: 5
      },
      {
        id: 'doc-dev-6',
        call_id: 'call-master-dev-2025',
        document_name: 'Lettre de recommandation',
        description: 'Au moins une lettre de recommandation académique ou professionnelle',
        is_mandatory: false,
        accepted_formats: 'pdf',
        max_size_mb: 2,
        display_order: 6
      }
    ],
    schedule: [
      {
        id: 'sched-dev-1',
        call_id: 'call-master-dev-2025',
        step: 'Ouverture des candidatures',
        start_date: '2025-01-15',
        description: 'Début de la période de dépôt des dossiers',
        display_order: 1
      },
      {
        id: 'sched-dev-2',
        call_id: 'call-master-dev-2025',
        step: 'Clôture des candidatures',
        end_date: '2025-06-30',
        description: 'Date limite de soumission des dossiers',
        display_order: 2
      },
      {
        id: 'sched-dev-3',
        call_id: 'call-master-dev-2025',
        step: 'Évaluation des dossiers',
        start_date: '2025-07-01',
        end_date: '2025-07-31',
        description: 'Examen des candidatures par le comité de sélection',
        display_order: 3
      },
      {
        id: 'sched-dev-4',
        call_id: 'call-master-dev-2025',
        step: 'Publication des résultats',
        start_date: '2025-08-15',
        description: 'Annonce des candidats retenus',
        display_order: 4
      },
      {
        id: 'sched-dev-5',
        call_id: 'call-master-dev-2025',
        step: 'Rentrée académique',
        start_date: '2025-09-15',
        description: 'Début des cours à Alexandrie',
        display_order: 5
      }
    ]
  },

  // === APPEL 2: Bourses OIF ===
  {
    id: 'call-bourses-oif-2025',
    title: 'Bourses d\'excellence OIF 2025',
    slug: 'bourses-excellence-oif-2025',
    description: `L'Organisation Internationale de la Francophonie (OIF) et l'Université Senghor offrent 30 bourses complètes pour les étudiants méritants souhaitant intégrer les programmes de Master.

Ces bourses couvrent l'intégralité des frais de formation et offrent une allocation mensuelle de subsistance.`,
    type: 'scholarship',
    status: 'ongoing',
    opening_date: '2025-02-01',
    deadline: '2025-05-31T23:59:00Z',
    target_audience: 'Étudiants africains francophones à fort potentiel',
    use_internal_form: true,
    publication_status: 'published',
    created_at: '2025-01-20T09:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
    applications_count: 89,
    currency: 'EUR',
    eligibility_criteria: [
      {
        id: 'crit-oif-1',
        call_id: 'call-bourses-oif-2025',
        criterion: 'Être admis dans un programme de Master de l\'Université Senghor',
        is_mandatory: true,
        display_order: 1
      },
      {
        id: 'crit-oif-2',
        call_id: 'call-bourses-oif-2025',
        criterion: 'Avoir obtenu une moyenne générale d\'au moins 14/20 lors des études précédentes',
        is_mandatory: true,
        display_order: 2
      },
      {
        id: 'crit-oif-3',
        call_id: 'call-bourses-oif-2025',
        criterion: 'Ne pas avoir plus de 35 ans au 1er janvier 2025',
        is_mandatory: true,
        display_order: 3
      }
    ],
    coverage: [
      {
        id: 'cov-oif-1',
        call_id: 'call-bourses-oif-2025',
        item: 'Frais de scolarité',
        description: 'Exonération totale',
        display_order: 1
      },
      {
        id: 'cov-oif-2',
        call_id: 'call-bourses-oif-2025',
        item: 'Allocation mensuelle',
        description: '500€/mois',
        display_order: 2
      },
      {
        id: 'cov-oif-3',
        call_id: 'call-bourses-oif-2025',
        item: 'Billet d\'avion',
        description: 'Aller-retour depuis le pays d\'origine',
        display_order: 3
      }
    ],
    required_documents: [
      {
        id: 'doc-oif-1',
        call_id: 'call-bourses-oif-2025',
        document_name: 'Dossier de candidature Master',
        description: 'Dossier complet de candidature au Master',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 20,
        display_order: 1
      },
      {
        id: 'doc-oif-2',
        call_id: 'call-bourses-oif-2025',
        document_name: 'Lettre de motivation pour la bourse',
        description: 'Expliquez pourquoi vous méritez cette bourse',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 2,
        display_order: 2
      },
      {
        id: 'doc-oif-3',
        call_id: 'call-bourses-oif-2025',
        document_name: 'Justificatif de revenus familiaux',
        description: 'Documents attestant de la situation financière',
        is_mandatory: false,
        accepted_formats: 'pdf',
        max_size_mb: 5,
        display_order: 3
      }
    ],
    schedule: [
      {
        id: 'sched-oif-1',
        call_id: 'call-bourses-oif-2025',
        step: 'Ouverture des candidatures',
        start_date: '2025-02-01',
        display_order: 1
      },
      {
        id: 'sched-oif-2',
        call_id: 'call-bourses-oif-2025',
        step: 'Clôture des candidatures',
        end_date: '2025-05-31',
        display_order: 2
      },
      {
        id: 'sched-oif-3',
        call_id: 'call-bourses-oif-2025',
        step: 'Annonce des lauréats',
        start_date: '2025-07-15',
        display_order: 3
      }
    ]
  },

  // === APPEL 3: Recrutement enseignant ===
  {
    id: 'call-recruit-enseignant-2025',
    title: 'Recrutement Enseignant-chercheur en Économie',
    slug: 'recrutement-enseignant-economie-2025',
    description: `L'Université Senghor recrute un enseignant-chercheur spécialisé en économie du développement pour renforcer son équipe pédagogique.

Le poste est ouvert aux docteurs en économie ayant une expérience significative de l'enseignement supérieur et de la recherche.`,
    type: 'recruitment',
    status: 'ongoing',
    opening_date: '2025-01-20',
    deadline: '2025-04-15T23:59:00Z',
    target_audience: 'Docteurs en économie avec expérience d\'enseignement',
    use_internal_form: false,
    external_form_url: 'https://usenghor.org/recrutements/formulaire',
    publication_status: 'published',
    created_at: '2025-01-18T11:00:00Z',
    updated_at: '2025-01-20T09:00:00Z',
    applications_count: 23,
    currency: 'EUR',
    eligibility_criteria: [
      {
        id: 'crit-rec-1',
        call_id: 'call-recruit-enseignant-2025',
        criterion: 'Être titulaire d\'un doctorat en économie ou discipline connexe',
        is_mandatory: true,
        display_order: 1
      },
      {
        id: 'crit-rec-2',
        call_id: 'call-recruit-enseignant-2025',
        criterion: 'Avoir au moins 3 ans d\'expérience d\'enseignement universitaire',
        is_mandatory: true,
        display_order: 2
      },
      {
        id: 'crit-rec-3',
        call_id: 'call-recruit-enseignant-2025',
        criterion: 'Publications dans des revues à comité de lecture',
        is_mandatory: true,
        display_order: 3
      }
    ],
    required_documents: [
      {
        id: 'doc-rec-1',
        call_id: 'call-recruit-enseignant-2025',
        document_name: 'CV académique',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 5,
        display_order: 1
      },
      {
        id: 'doc-rec-2',
        call_id: 'call-recruit-enseignant-2025',
        document_name: 'Liste des publications',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 5,
        display_order: 2
      },
      {
        id: 'doc-rec-3',
        call_id: 'call-recruit-enseignant-2025',
        document_name: 'Projet de recherche',
        description: '5 pages maximum',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 2,
        display_order: 3
      }
    ],
    schedule: [
      {
        id: 'sched-rec-1',
        call_id: 'call-recruit-enseignant-2025',
        step: 'Dépôt des candidatures',
        start_date: '2025-01-20',
        end_date: '2025-04-15',
        display_order: 1
      },
      {
        id: 'sched-rec-2',
        call_id: 'call-recruit-enseignant-2025',
        step: 'Auditions',
        start_date: '2025-05-01',
        end_date: '2025-05-15',
        display_order: 2
      },
      {
        id: 'sched-rec-3',
        call_id: 'call-recruit-enseignant-2025',
        step: 'Prise de poste',
        start_date: '2025-09-01',
        display_order: 3
      }
    ]
  },

  // === APPEL 4: Formation courte ===
  {
    id: 'call-formation-management-2025',
    title: 'Formation courte en Management de Projet',
    slug: 'formation-management-projet-2025',
    description: `Formation intensive de 3 semaines destinée aux professionnels souhaitant acquérir des compétences en gestion de projet dans le contexte du développement africain.`,
    type: 'training',
    status: 'upcoming',
    opening_date: '2025-03-01',
    deadline: '2025-05-15T23:59:00Z',
    program_start_date: '2025-06-15',
    program_end_date: '2025-07-05',
    registration_fee: 1500,
    currency: 'EUR',
    target_audience: 'Cadres du secteur public et privé',
    use_internal_form: true,
    publication_status: 'published',
    created_at: '2025-01-25T14:00:00Z',
    updated_at: '2025-01-25T14:00:00Z',
    applications_count: 0,
    eligibility_criteria: [
      {
        id: 'crit-form-1',
        call_id: 'call-formation-management-2025',
        criterion: 'Bac+3 minimum',
        is_mandatory: true,
        display_order: 1
      },
      {
        id: 'crit-form-2',
        call_id: 'call-formation-management-2025',
        criterion: 'Expérience professionnelle d\'au moins 2 ans',
        is_mandatory: true,
        display_order: 2
      }
    ],
    coverage: [
      {
        id: 'cov-form-1',
        call_id: 'call-formation-management-2025',
        item: 'Formation',
        description: 'Cours, ateliers pratiques et documentation',
        display_order: 1
      },
      {
        id: 'cov-form-2',
        call_id: 'call-formation-management-2025',
        item: 'Certificat',
        description: 'Certificat universitaire délivré à l\'issue de la formation',
        display_order: 2
      }
    ],
    required_documents: [
      {
        id: 'doc-form-1',
        call_id: 'call-formation-management-2025',
        document_name: 'CV',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 2,
        display_order: 1
      },
      {
        id: 'doc-form-2',
        call_id: 'call-formation-management-2025',
        document_name: 'Copie du diplôme le plus élevé',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 5,
        display_order: 2
      }
    ],
    schedule: [
      {
        id: 'sched-form-1',
        call_id: 'call-formation-management-2025',
        step: 'Candidatures',
        start_date: '2025-03-01',
        end_date: '2025-05-15',
        display_order: 1
      },
      {
        id: 'sched-form-2',
        call_id: 'call-formation-management-2025',
        step: 'Formation',
        start_date: '2025-06-15',
        end_date: '2025-07-05',
        display_order: 2
      }
    ]
  },

  // === APPEL 5: Appel à projets ===
  {
    id: 'call-projets-recherche-2025',
    title: 'Appel à projets de recherche 2025',
    slug: 'appel-projets-recherche-2025',
    description: `L'Université Senghor lance un appel à projets pour financer des recherches sur les thématiques du développement durable, de la gouvernance et de la santé en Afrique.

Dotation maximale : 15 000 EUR par projet.`,
    type: 'project',
    status: 'ongoing',
    opening_date: '2025-01-10',
    deadline: '2025-08-15T23:59:00Z',
    target_audience: 'Chercheurs et enseignants-chercheurs',
    use_internal_form: true,
    publication_status: 'published',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-10T08:00:00Z',
    applications_count: 42,
    currency: 'EUR',
    eligibility_criteria: [
      {
        id: 'crit-proj-1',
        call_id: 'call-projets-recherche-2025',
        criterion: 'Être enseignant-chercheur ou chercheur affilié à une institution reconnue',
        is_mandatory: true,
        display_order: 1
      },
      {
        id: 'crit-proj-2',
        call_id: 'call-projets-recherche-2025',
        criterion: 'Le projet doit porter sur une thématique liée au développement africain',
        is_mandatory: true,
        display_order: 2
      }
    ],
    required_documents: [
      {
        id: 'doc-proj-1',
        call_id: 'call-projets-recherche-2025',
        document_name: 'Descriptif du projet',
        description: '10 pages maximum',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 5,
        display_order: 1
      },
      {
        id: 'doc-proj-2',
        call_id: 'call-projets-recherche-2025',
        document_name: 'Budget prévisionnel',
        is_mandatory: true,
        accepted_formats: 'pdf,xlsx',
        max_size_mb: 2,
        display_order: 2
      },
      {
        id: 'doc-proj-3',
        call_id: 'call-projets-recherche-2025',
        document_name: 'CV du porteur de projet',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 2,
        display_order: 3
      }
    ],
    schedule: [
      {
        id: 'sched-proj-1',
        call_id: 'call-projets-recherche-2025',
        step: 'Dépôt des projets',
        start_date: '2025-01-10',
        end_date: '2025-08-15',
        display_order: 1
      },
      {
        id: 'sched-proj-2',
        call_id: 'call-projets-recherche-2025',
        step: 'Évaluation',
        start_date: '2025-08-16',
        end_date: '2025-09-30',
        display_order: 2
      },
      {
        id: 'sched-proj-3',
        call_id: 'call-projets-recherche-2025',
        step: 'Annonce des projets retenus',
        start_date: '2025-10-15',
        display_order: 3
      }
    ]
  },

  // === APPEL 6: Brouillon ===
  {
    id: 'call-master-sante-2025-draft',
    title: 'Master Santé Internationale 2025-2026',
    slug: 'master-sante-internationale-2025-2026',
    description: `Formation spécialisée en santé publique internationale pour les professionnels de santé francophones.`,
    type: 'application',
    status: 'upcoming',
    deadline: '2025-07-31T23:59:00Z',
    program_start_date: '2025-10-01',
    program_end_date: '2027-06-30',
    use_internal_form: true,
    publication_status: 'draft',
    created_at: '2025-01-24T16:00:00Z',
    updated_at: '2025-01-24T16:00:00Z',
    applications_count: 0,
    currency: 'EUR',
    eligibility_criteria: [],
    coverage: [],
    required_documents: [],
    schedule: []
  },

  // === APPEL 7: Clos ===
  {
    id: 'call-master-admin-2024',
    title: 'Master Administration et Gestion 2024-2025',
    slug: 'master-administration-gestion-2024-2025',
    description: `Formation d'excellence en administration et gestion des entreprises.`,
    type: 'application',
    status: 'closed',
    opening_date: '2024-01-15',
    deadline: '2024-06-30T23:59:00Z',
    program_start_date: '2024-09-15',
    program_end_date: '2026-06-30',
    use_internal_form: true,
    publication_status: 'archived',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-06-30T23:59:00Z',
    applications_count: 178,
    currency: 'EUR',
    eligibility_criteria: [
      {
        id: 'crit-admin-1',
        call_id: 'call-master-admin-2024',
        criterion: 'Bac+4 minimum',
        is_mandatory: true,
        display_order: 1
      }
    ],
    required_documents: [
      {
        id: 'doc-admin-1',
        call_id: 'call-master-admin-2024',
        document_name: 'CV',
        is_mandatory: true,
        accepted_formats: 'pdf',
        max_size_mb: 2,
        display_order: 1
      }
    ],
    schedule: []
  }
]

// Labels pour les types
export const callTypeLabels: Record<CallType, string> = {
  application: 'Candidature',
  scholarship: 'Bourse',
  project: 'Projet',
  recruitment: 'Recrutement',
  training: 'Formation'
}

// Couleurs pour les types
export const callTypeColors: Record<CallType, string> = {
  application: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  scholarship: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  project: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  recruitment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  training: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
}

// Labels pour les statuts
export const callStatusLabels: Record<CallStatus, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  closed: 'Fermé'
}

// Couleurs pour les statuts
export const callStatusColors: Record<CallStatus, string> = {
  upcoming: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

// Labels pour les statuts de publication
export const publicationStatusLabels: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé'
}

// Couleurs pour les statuts de publication
export const publicationStatusColors: Record<PublicationStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}
