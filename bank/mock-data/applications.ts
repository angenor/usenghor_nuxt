/**
 * Mock Data: Candidatures (Back-office)
 * Basé sur le schéma SQL 08_application.sql
 */

// Statuts d'une candidature
export type ApplicationStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted' | 'incomplete'

// Statut matrimonial
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'other'

// Statut professionnel
export type EmploymentStatus = 'student' | 'teacher' | 'civil_servant' | 'private_employee' | 'ngo_employee' | 'unemployed' | 'other'

// Durée d'expérience
export type ExperienceDuration = 'less_than_1_year' | 'between_1_3_years' | 'between_3_5_years' | 'between_5_10_years' | 'more_than_10_years'

// Civilité
export type Salutation = 'mr' | 'mrs' | 'ms' | 'dr' | 'prof'

// Diplôme du candidat
export interface ApplicationDegree {
  id: string
  application_id: string
  title: string
  year?: number
  institution?: string
  city?: string
  country?: string
  country_external_id?: string
  specialization?: string
  honors?: string
  display_order: number
}

// Document soumis
export interface ApplicationDocument {
  id: string
  application_id: string
  required_document_id?: string
  document_name: string
  file_url?: string
  media_external_id?: string
  is_valid?: boolean
  validation_comment?: string
  created_at: string
}

// Évaluateur (simplifié)
export interface Reviewer {
  id: string
  name: string
  email: string
}

// Programme (simplifié pour affichage)
export interface ProgramRef {
  id: string
  title: string
  department?: string
}

// Appel (simplifié pour affichage)
export interface CallRef {
  id: string
  title: string
  type: string
}

// Candidature complète
export interface Application {
  id: string
  reference_number: string
  call_id?: string
  call?: CallRef
  program_external_id?: string
  program?: ProgramRef
  user_external_id?: string
  reviewer_external_id?: string
  reviewer?: Reviewer

  // Informations personnelles
  salutation?: Salutation
  last_name: string
  first_name: string
  birth_date?: string
  birth_city?: string
  birth_country?: string
  birth_country_external_id?: string
  nationality?: string
  nationality_external_id?: string
  country?: string
  country_external_id?: string
  marital_status?: MaritalStatus
  employment_status?: EmploymentStatus
  employment_status_other?: string

  // Coordonnées
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  phone_whatsapp?: string
  email: string

  // Informations professionnelles
  has_work_experience: boolean
  current_job?: string
  job_title?: string
  employer_name?: string
  employer_address?: string
  employer_city?: string
  employer_country?: string
  employer_country_external_id?: string
  employer_phone?: string
  employer_email?: string
  experience_duration?: ExperienceDuration

  // Formation académique
  highest_degree_level?: string
  highest_degree_title?: string
  degree_date?: string
  degree_location?: string

  // Statut
  status: ApplicationStatus
  submitted_at: string
  reviewed_at?: string
  review_notes?: string
  review_score?: number

  created_at: string
  updated_at: string

  // Relations
  degrees?: ApplicationDegree[]
  documents?: ApplicationDocument[]

  // Computed
  documents_validated?: number
  documents_total?: number
  is_complete?: boolean
}

// Labels des statuts
export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  submitted: 'Soumise',
  under_review: 'En cours d\'évaluation',
  accepted: 'Acceptée',
  rejected: 'Rejetée',
  waitlisted: 'Liste d\'attente',
  incomplete: 'Incomplète',
}

// Couleurs des statuts
export const applicationStatusColors: Record<ApplicationStatus, string> = {
  submitted: 'blue',
  under_review: 'yellow',
  accepted: 'green',
  rejected: 'red',
  waitlisted: 'orange',
  incomplete: 'gray',
}

// Labels des civilités
export const salutationLabels: Record<Salutation, string> = {
  mr: 'M.',
  mrs: 'Mme',
  ms: 'Mlle',
  dr: 'Dr',
  prof: 'Pr',
}

// Labels des statuts matrimoniaux
export const maritalStatusLabels: Record<MaritalStatus, string> = {
  single: 'Célibataire',
  married: 'Marié(e)',
  divorced: 'Divorcé(e)',
  widowed: 'Veuf/Veuve',
  other: 'Autre',
}

// Labels des statuts professionnels
export const employmentStatusLabels: Record<EmploymentStatus, string> = {
  student: 'Étudiant(e)',
  teacher: 'Enseignant(e)',
  civil_servant: 'Fonctionnaire',
  private_employee: 'Salarié(e) du privé',
  ngo_employee: 'Employé(e) ONG',
  unemployed: 'Sans emploi',
  other: 'Autre',
}

// Labels des durées d'expérience
export const experienceDurationLabels: Record<ExperienceDuration, string> = {
  less_than_1_year: 'Moins d\'1 an',
  between_1_3_years: '1 à 3 ans',
  between_3_5_years: '3 à 5 ans',
  between_5_10_years: '5 à 10 ans',
  more_than_10_years: 'Plus de 10 ans',
}

// Évaluateurs mock
export const mockReviewers: Reviewer[] = [
  { id: 'reviewer-1', name: 'Dr. Jean Dupont', email: 'jean.dupont@usenghor.org' },
  { id: 'reviewer-2', name: 'Pr. Marie Koné', email: 'marie.kone@usenghor.org' },
  { id: 'reviewer-3', name: 'Dr. Ahmed Hassan', email: 'ahmed.hassan@usenghor.org' },
  { id: 'reviewer-4', name: 'Pr. Fatou Diallo', email: 'fatou.diallo@usenghor.org' },
]

// Générateurs d'ID
export const generateApplicationId = () => `app-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
export const generateDegreeId = () => `deg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
export const generateDocId = () => `adoc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

// Données mock des candidatures
export const mockApplications: Application[] = [
  // === CANDIDATURE 1: Acceptée ===
  {
    id: 'app-001',
    reference_number: 'APP-2025-000001',
    call_id: 'call-master-dev-2025',
    call: {
      id: 'call-master-dev-2025',
      title: 'Master Développement 2025-2027',
      type: 'application',
    },
    program_external_id: 'prog-master-dev',
    program: {
      id: 'prog-master-dev',
      title: 'Master en Développement',
      department: 'Département Développement',
    },
    reviewer_external_id: 'reviewer-1',
    reviewer: mockReviewers[0],

    salutation: 'mr',
    last_name: 'Diallo',
    first_name: 'Amadou',
    birth_date: '1995-03-15',
    birth_city: 'Dakar',
    birth_country: 'Sénégal',
    nationality: 'Sénégal',
    marital_status: 'single',
    employment_status: 'civil_servant',

    address: '123 Avenue Cheikh Anta Diop',
    city: 'Dakar',
    postal_code: '10000',
    phone: '+221 77 123 45 67',
    phone_whatsapp: '+221 77 123 45 67',
    email: 'amadou.diallo@example.com',

    has_work_experience: true,
    current_job: 'Chargé de projets',
    job_title: 'Chargé de projets',
    employer_name: 'Ministère du Plan',
    employer_city: 'Dakar',
    employer_country: 'Sénégal',
    experience_duration: 'between_3_5_years',

    highest_degree_level: 'Master 1',
    highest_degree_title: 'Master en Économie',
    degree_date: '2020-07-15',
    degree_location: 'Université Cheikh Anta Diop, Dakar',

    status: 'accepted',
    submitted_at: '2025-01-10T14:30:00Z',
    reviewed_at: '2025-01-20T10:00:00Z',
    review_notes: 'Excellent dossier. Profil très solide avec une expérience pertinente dans le développement.',
    review_score: 92.5,

    created_at: '2025-01-10T14:30:00Z',
    updated_at: '2025-01-20T10:00:00Z',

    degrees: [
      {
        id: 'deg-001-1',
        application_id: 'app-001',
        title: 'Master 1 en Économie du Développement',
        year: 2020,
        institution: 'Université Cheikh Anta Diop',
        city: 'Dakar',
        country: 'Sénégal',
        specialization: 'Économie du développement',
        honors: 'Bien',
        display_order: 1,
      },
      {
        id: 'deg-001-2',
        application_id: 'app-001',
        title: 'Licence en Sciences Économiques',
        year: 2018,
        institution: 'Université Cheikh Anta Diop',
        city: 'Dakar',
        country: 'Sénégal',
        specialization: 'Analyse économique',
        honors: 'Assez Bien',
        display_order: 2,
      },
    ],

    documents: [
      {
        id: 'adoc-001-1',
        application_id: 'app-001',
        document_name: 'CV',
        file_url: '/uploads/cv-diallo.pdf',
        is_valid: true,
        validation_comment: 'Document conforme',
        created_at: '2025-01-10T14:30:00Z',
      },
      {
        id: 'adoc-001-2',
        application_id: 'app-001',
        document_name: 'Lettre de motivation',
        file_url: '/uploads/lm-diallo.pdf',
        is_valid: true,
        validation_comment: 'Très bonne lettre de motivation',
        created_at: '2025-01-10T14:30:00Z',
      },
      {
        id: 'adoc-001-3',
        application_id: 'app-001',
        document_name: 'Diplôme Master 1',
        file_url: '/uploads/diplome-diallo.pdf',
        is_valid: true,
        created_at: '2025-01-10T14:30:00Z',
      },
      {
        id: 'adoc-001-4',
        application_id: 'app-001',
        document_name: 'Passeport',
        file_url: '/uploads/passeport-diallo.pdf',
        is_valid: true,
        created_at: '2025-01-10T14:30:00Z',
      },
    ],

    documents_validated: 4,
    documents_total: 4,
    is_complete: true,
  },

  // === CANDIDATURE 2: En cours d'évaluation ===
  {
    id: 'app-002',
    reference_number: 'APP-2025-000002',
    call_id: 'call-master-dev-2025',
    call: {
      id: 'call-master-dev-2025',
      title: 'Master Développement 2025-2027',
      type: 'application',
    },
    program_external_id: 'prog-master-dev',
    program: {
      id: 'prog-master-dev',
      title: 'Master en Développement',
      department: 'Département Développement',
    },
    reviewer_external_id: 'reviewer-2',
    reviewer: mockReviewers[1],

    salutation: 'mrs',
    last_name: 'Konaté',
    first_name: 'Aminata',
    birth_date: '1993-08-22',
    birth_city: 'Bamako',
    birth_country: 'Mali',
    nationality: 'Mali',
    marital_status: 'married',
    employment_status: 'ngo_employee',

    address: '45 Rue de l\'Indépendance',
    city: 'Bamako',
    postal_code: 'BP 123',
    phone: '+223 76 987 65 43',
    phone_whatsapp: '+223 76 987 65 43',
    email: 'aminata.konate@example.com',

    has_work_experience: true,
    current_job: 'Coordinatrice de programmes',
    job_title: 'Coordinatrice de programmes',
    employer_name: 'ONG Développement Durable',
    employer_city: 'Bamako',
    employer_country: 'Mali',
    experience_duration: 'between_5_10_years',

    highest_degree_level: 'Licence',
    highest_degree_title: 'Licence en Gestion de Projets',
    degree_date: '2016-06-30',
    degree_location: 'Université de Bamako',

    status: 'under_review',
    submitted_at: '2025-01-12T09:15:00Z',

    created_at: '2025-01-12T09:15:00Z',
    updated_at: '2025-01-15T16:45:00Z',

    degrees: [
      {
        id: 'deg-002-1',
        application_id: 'app-002',
        title: 'Licence en Gestion de Projets',
        year: 2016,
        institution: 'Université de Bamako',
        city: 'Bamako',
        country: 'Mali',
        specialization: 'Gestion de projets de développement',
        honors: 'Bien',
        display_order: 1,
      },
    ],

    documents: [
      {
        id: 'adoc-002-1',
        application_id: 'app-002',
        document_name: 'CV',
        file_url: '/uploads/cv-konate.pdf',
        is_valid: true,
        created_at: '2025-01-12T09:15:00Z',
      },
      {
        id: 'adoc-002-2',
        application_id: 'app-002',
        document_name: 'Lettre de motivation',
        file_url: '/uploads/lm-konate.pdf',
        is_valid: undefined,
        created_at: '2025-01-12T09:15:00Z',
      },
      {
        id: 'adoc-002-3',
        application_id: 'app-002',
        document_name: 'Diplôme Licence',
        file_url: '/uploads/diplome-konate.pdf',
        is_valid: true,
        created_at: '2025-01-12T09:15:00Z',
      },
      {
        id: 'adoc-002-4',
        application_id: 'app-002',
        document_name: 'Passeport',
        file_url: '/uploads/passeport-konate.pdf',
        is_valid: undefined,
        created_at: '2025-01-12T09:15:00Z',
      },
    ],

    documents_validated: 2,
    documents_total: 4,
    is_complete: true,
  },

  // === CANDIDATURE 3: Soumise (non assignée) ===
  {
    id: 'app-003',
    reference_number: 'APP-2025-000003',
    call_id: 'call-bourse-oif-2025',
    call: {
      id: 'call-bourse-oif-2025',
      title: 'Bourses OIF 2025',
      type: 'scholarship',
    },
    program_external_id: 'prog-patrimoine',
    program: {
      id: 'prog-patrimoine',
      title: 'Master en Gestion du Patrimoine Culturel',
      department: 'Département Patrimoine',
    },

    salutation: 'mr',
    last_name: 'Ndiaye',
    first_name: 'Moussa',
    birth_date: '1997-11-05',
    birth_city: 'Saint-Louis',
    birth_country: 'Sénégal',
    nationality: 'Sénégal',
    marital_status: 'single',
    employment_status: 'student',

    address: '78 Rue Blanchot',
    city: 'Saint-Louis',
    postal_code: '32000',
    phone: '+221 78 456 78 90',
    email: 'moussa.ndiaye@example.com',

    has_work_experience: false,

    highest_degree_level: 'Licence',
    highest_degree_title: 'Licence en Histoire de l\'Art',
    degree_date: '2024-07-10',
    degree_location: 'Université Gaston Berger, Saint-Louis',

    status: 'submitted',
    submitted_at: '2025-01-18T11:20:00Z',

    created_at: '2025-01-18T11:20:00Z',
    updated_at: '2025-01-18T11:20:00Z',

    degrees: [
      {
        id: 'deg-003-1',
        application_id: 'app-003',
        title: 'Licence en Histoire de l\'Art',
        year: 2024,
        institution: 'Université Gaston Berger',
        city: 'Saint-Louis',
        country: 'Sénégal',
        specialization: 'Patrimoine africain',
        honors: 'Très Bien',
        display_order: 1,
      },
    ],

    documents: [
      {
        id: 'adoc-003-1',
        application_id: 'app-003',
        document_name: 'CV',
        file_url: '/uploads/cv-ndiaye.pdf',
        is_valid: undefined,
        created_at: '2025-01-18T11:20:00Z',
      },
      {
        id: 'adoc-003-2',
        application_id: 'app-003',
        document_name: 'Lettre de motivation',
        file_url: '/uploads/lm-ndiaye.pdf',
        is_valid: undefined,
        created_at: '2025-01-18T11:20:00Z',
      },
      {
        id: 'adoc-003-3',
        application_id: 'app-003',
        document_name: 'Relevés de notes',
        file_url: '/uploads/notes-ndiaye.pdf',
        is_valid: undefined,
        created_at: '2025-01-18T11:20:00Z',
      },
    ],

    documents_validated: 0,
    documents_total: 3,
    is_complete: true,
  },

  // === CANDIDATURE 4: Rejetée ===
  {
    id: 'app-004',
    reference_number: 'APP-2025-000004',
    call_id: 'call-master-dev-2025',
    call: {
      id: 'call-master-dev-2025',
      title: 'Master Développement 2025-2027',
      type: 'application',
    },
    program_external_id: 'prog-master-dev',
    program: {
      id: 'prog-master-dev',
      title: 'Master en Développement',
      department: 'Département Développement',
    },
    reviewer_external_id: 'reviewer-3',
    reviewer: mockReviewers[2],

    salutation: 'mr',
    last_name: 'Traoré',
    first_name: 'Ibrahim',
    birth_date: '1990-02-14',
    birth_city: 'Ouagadougou',
    birth_country: 'Burkina Faso',
    nationality: 'Burkina Faso',
    marital_status: 'married',
    employment_status: 'private_employee',

    address: '234 Avenue de la Liberté',
    city: 'Ouagadougou',
    phone: '+226 70 123 45 67',
    email: 'ibrahim.traore@example.com',

    has_work_experience: true,
    current_job: 'Commercial',
    employer_name: 'Société de Commerce',
    employer_city: 'Ouagadougou',
    employer_country: 'Burkina Faso',
    experience_duration: 'between_1_3_years',

    highest_degree_level: 'BTS',
    highest_degree_title: 'BTS Commerce International',
    degree_date: '2012-06-30',
    degree_location: 'Institut Supérieur de Commerce, Ouagadougou',

    status: 'rejected',
    submitted_at: '2025-01-08T16:45:00Z',
    reviewed_at: '2025-01-18T09:30:00Z',
    review_notes: 'Niveau académique insuffisant pour le programme Master. Le candidat devrait d\'abord valider une Licence.',
    review_score: 45.0,

    created_at: '2025-01-08T16:45:00Z',
    updated_at: '2025-01-18T09:30:00Z',

    degrees: [
      {
        id: 'deg-004-1',
        application_id: 'app-004',
        title: 'BTS Commerce International',
        year: 2012,
        institution: 'Institut Supérieur de Commerce',
        city: 'Ouagadougou',
        country: 'Burkina Faso',
        display_order: 1,
      },
    ],

    documents: [
      {
        id: 'adoc-004-1',
        application_id: 'app-004',
        document_name: 'CV',
        file_url: '/uploads/cv-traore.pdf',
        is_valid: true,
        created_at: '2025-01-08T16:45:00Z',
      },
      {
        id: 'adoc-004-2',
        application_id: 'app-004',
        document_name: 'Lettre de motivation',
        file_url: '/uploads/lm-traore.pdf',
        is_valid: true,
        created_at: '2025-01-08T16:45:00Z',
      },
      {
        id: 'adoc-004-3',
        application_id: 'app-004',
        document_name: 'Diplôme BTS',
        file_url: '/uploads/diplome-traore.pdf',
        is_valid: true,
        created_at: '2025-01-08T16:45:00Z',
      },
    ],

    documents_validated: 3,
    documents_total: 3,
    is_complete: true,
  },

  // === CANDIDATURE 5: Liste d'attente ===
  {
    id: 'app-005',
    reference_number: 'APP-2025-000005',
    call_id: 'call-master-dev-2025',
    call: {
      id: 'call-master-dev-2025',
      title: 'Master Développement 2025-2027',
      type: 'application',
    },
    program_external_id: 'prog-master-dev',
    program: {
      id: 'prog-master-dev',
      title: 'Master en Développement',
      department: 'Département Développement',
    },
    reviewer_external_id: 'reviewer-1',
    reviewer: mockReviewers[0],

    salutation: 'mrs',
    last_name: 'Camara',
    first_name: 'Fatoumata',
    birth_date: '1994-06-20',
    birth_city: 'Conakry',
    birth_country: 'Guinée',
    nationality: 'Guinée',
    marital_status: 'single',
    employment_status: 'teacher',

    address: '56 Boulevard du Commerce',
    city: 'Conakry',
    phone: '+224 622 11 22 33',
    phone_whatsapp: '+224 622 11 22 33',
    email: 'fatoumata.camara@example.com',

    has_work_experience: true,
    current_job: 'Enseignante',
    job_title: 'Professeure de Français',
    employer_name: 'Lycée National',
    employer_city: 'Conakry',
    employer_country: 'Guinée',
    experience_duration: 'between_3_5_years',

    highest_degree_level: 'Master 1',
    highest_degree_title: 'Master en Lettres Modernes',
    degree_date: '2019-07-15',
    degree_location: 'Université de Conakry',

    status: 'waitlisted',
    submitted_at: '2025-01-11T08:00:00Z',
    reviewed_at: '2025-01-21T14:00:00Z',
    review_notes: 'Bon dossier mais pas de place disponible cette année. Priorité pour la prochaine session.',
    review_score: 78.5,

    created_at: '2025-01-11T08:00:00Z',
    updated_at: '2025-01-21T14:00:00Z',

    degrees: [
      {
        id: 'deg-005-1',
        application_id: 'app-005',
        title: 'Master 1 en Lettres Modernes',
        year: 2019,
        institution: 'Université de Conakry',
        city: 'Conakry',
        country: 'Guinée',
        specialization: 'Littérature francophone',
        honors: 'Bien',
        display_order: 1,
      },
      {
        id: 'deg-005-2',
        application_id: 'app-005',
        title: 'Licence en Lettres',
        year: 2017,
        institution: 'Université de Conakry',
        city: 'Conakry',
        country: 'Guinée',
        honors: 'Assez Bien',
        display_order: 2,
      },
    ],

    documents: [
      {
        id: 'adoc-005-1',
        application_id: 'app-005',
        document_name: 'CV',
        file_url: '/uploads/cv-camara.pdf',
        is_valid: true,
        created_at: '2025-01-11T08:00:00Z',
      },
      {
        id: 'adoc-005-2',
        application_id: 'app-005',
        document_name: 'Lettre de motivation',
        file_url: '/uploads/lm-camara.pdf',
        is_valid: true,
        created_at: '2025-01-11T08:00:00Z',
      },
      {
        id: 'adoc-005-3',
        application_id: 'app-005',
        document_name: 'Diplômes',
        file_url: '/uploads/diplomes-camara.pdf',
        is_valid: true,
        created_at: '2025-01-11T08:00:00Z',
      },
      {
        id: 'adoc-005-4',
        application_id: 'app-005',
        document_name: 'Attestation employeur',
        file_url: '/uploads/attestation-camara.pdf',
        is_valid: true,
        created_at: '2025-01-11T08:00:00Z',
      },
    ],

    documents_validated: 4,
    documents_total: 4,
    is_complete: true,
  },

  // === CANDIDATURE 6: Incomplète (documents manquants) ===
  {
    id: 'app-006',
    reference_number: 'APP-2025-000006',
    call_id: 'call-bourse-oif-2025',
    call: {
      id: 'call-bourse-oif-2025',
      title: 'Bourses OIF 2025',
      type: 'scholarship',
    },
    program_external_id: 'prog-admin-publique',
    program: {
      id: 'prog-admin-publique',
      title: 'Master en Administration Publique',
      department: 'Département Administration',
    },
    reviewer_external_id: 'reviewer-4',
    reviewer: mockReviewers[3],

    salutation: 'mr',
    last_name: 'Mensah',
    first_name: 'Kwame',
    birth_date: '1996-09-10',
    birth_city: 'Accra',
    birth_country: 'Ghana',
    nationality: 'Ghana',
    marital_status: 'single',
    employment_status: 'civil_servant',

    address: '12 Independence Avenue',
    city: 'Accra',
    phone: '+233 24 567 8901',
    email: 'kwame.mensah@example.com',

    has_work_experience: true,
    current_job: 'Assistant administratif',
    employer_name: 'Ministry of Finance',
    employer_city: 'Accra',
    employer_country: 'Ghana',
    experience_duration: 'between_1_3_years',

    highest_degree_level: 'Licence',
    highest_degree_title: 'Bachelor in Public Administration',
    degree_date: '2021-06-15',
    degree_location: 'University of Ghana',

    status: 'incomplete',
    submitted_at: '2025-01-15T10:30:00Z',
    review_notes: 'Documents manquants: attestation employeur et copie passeport non fournis.',

    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-17T11:00:00Z',

    degrees: [
      {
        id: 'deg-006-1',
        application_id: 'app-006',
        title: 'Bachelor in Public Administration',
        year: 2021,
        institution: 'University of Ghana',
        city: 'Accra',
        country: 'Ghana',
        honors: 'Second Class Upper',
        display_order: 1,
      },
    ],

    documents: [
      {
        id: 'adoc-006-1',
        application_id: 'app-006',
        document_name: 'CV',
        file_url: '/uploads/cv-mensah.pdf',
        is_valid: true,
        created_at: '2025-01-15T10:30:00Z',
      },
      {
        id: 'adoc-006-2',
        application_id: 'app-006',
        document_name: 'Lettre de motivation',
        file_url: '/uploads/lm-mensah.pdf',
        is_valid: false,
        validation_comment: 'Lettre trop courte, manque de détails sur les motivations',
        created_at: '2025-01-15T10:30:00Z',
      },
    ],

    documents_validated: 1,
    documents_total: 4,
    is_complete: false,
  },

  // === CANDIDATURE 7: En cours d'évaluation ===
  {
    id: 'app-007',
    reference_number: 'APP-2025-000007',
    call_id: 'call-master-sante-2025',
    call: {
      id: 'call-master-sante-2025',
      title: 'Master Santé Publique 2025',
      type: 'application',
    },
    program_external_id: 'prog-sante-publique',
    program: {
      id: 'prog-sante-publique',
      title: 'Master en Santé Publique',
      department: 'Département Santé',
    },
    reviewer_external_id: 'reviewer-2',
    reviewer: mockReviewers[1],

    salutation: 'dr',
    last_name: 'Ouédraogo',
    first_name: 'Mariam',
    birth_date: '1988-12-03',
    birth_city: 'Bobo-Dioulasso',
    birth_country: 'Burkina Faso',
    nationality: 'Burkina Faso',
    marital_status: 'married',
    employment_status: 'civil_servant',

    address: '89 Rue de la Santé',
    city: 'Ouagadougou',
    phone: '+226 71 234 56 78',
    phone_whatsapp: '+226 71 234 56 78',
    email: 'mariam.ouedraogo@example.com',

    has_work_experience: true,
    current_job: 'Médecin généraliste',
    job_title: 'Médecin',
    employer_name: 'CHU Yalgado Ouédraogo',
    employer_city: 'Ouagadougou',
    employer_country: 'Burkina Faso',
    experience_duration: 'between_5_10_years',

    highest_degree_level: 'Doctorat en Médecine',
    highest_degree_title: 'Doctorat en Médecine',
    degree_date: '2015-11-20',
    degree_location: 'Université de Ouagadougou',

    status: 'under_review',
    submitted_at: '2025-01-14T15:45:00Z',

    created_at: '2025-01-14T15:45:00Z',
    updated_at: '2025-01-19T09:00:00Z',

    degrees: [
      {
        id: 'deg-007-1',
        application_id: 'app-007',
        title: 'Doctorat en Médecine',
        year: 2015,
        institution: 'Université de Ouagadougou',
        city: 'Ouagadougou',
        country: 'Burkina Faso',
        specialization: 'Médecine générale',
        honors: 'Très Honorable',
        display_order: 1,
      },
    ],

    documents: [
      {
        id: 'adoc-007-1',
        application_id: 'app-007',
        document_name: 'CV',
        file_url: '/uploads/cv-ouedraogo.pdf',
        is_valid: true,
        created_at: '2025-01-14T15:45:00Z',
      },
      {
        id: 'adoc-007-2',
        application_id: 'app-007',
        document_name: 'Lettre de motivation',
        file_url: '/uploads/lm-ouedraogo.pdf',
        is_valid: true,
        created_at: '2025-01-14T15:45:00Z',
      },
      {
        id: 'adoc-007-3',
        application_id: 'app-007',
        document_name: 'Diplôme de médecine',
        file_url: '/uploads/diplome-ouedraogo.pdf',
        is_valid: true,
        created_at: '2025-01-14T15:45:00Z',
      },
      {
        id: 'adoc-007-4',
        application_id: 'app-007',
        document_name: 'Attestation CHU',
        file_url: '/uploads/attestation-ouedraogo.pdf',
        is_valid: undefined,
        created_at: '2025-01-14T15:45:00Z',
      },
    ],

    documents_validated: 3,
    documents_total: 4,
    is_complete: true,
  },

  // === CANDIDATURE 8: Soumise ===
  {
    id: 'app-008',
    reference_number: 'APP-2025-000008',
    call_id: 'call-formation-continue-2025',
    call: {
      id: 'call-formation-continue-2025',
      title: 'Formation Continue Management 2025',
      type: 'training',
    },
    program_external_id: 'prog-management',
    program: {
      id: 'prog-management',
      title: 'Certificat en Management',
      department: 'Département Management',
    },

    salutation: 'mr',
    last_name: 'Bah',
    first_name: 'Oumar',
    birth_date: '1985-04-18',
    birth_city: 'Labé',
    birth_country: 'Guinée',
    nationality: 'Guinée',
    marital_status: 'married',
    employment_status: 'private_employee',

    address: '23 Avenue du Port',
    city: 'Conakry',
    phone: '+224 628 99 88 77',
    email: 'oumar.bah@example.com',

    has_work_experience: true,
    current_job: 'Directeur des opérations',
    job_title: 'Directeur',
    employer_name: 'Entreprise Mining SA',
    employer_city: 'Conakry',
    employer_country: 'Guinée',
    experience_duration: 'more_than_10_years',

    highest_degree_level: 'Master',
    highest_degree_title: 'MBA',
    degree_date: '2010-06-30',
    degree_location: 'IAE Paris',

    status: 'submitted',
    submitted_at: '2025-01-20T17:30:00Z',

    created_at: '2025-01-20T17:30:00Z',
    updated_at: '2025-01-20T17:30:00Z',

    degrees: [
      {
        id: 'deg-008-1',
        application_id: 'app-008',
        title: 'MBA',
        year: 2010,
        institution: 'IAE Paris',
        city: 'Paris',
        country: 'France',
        specialization: 'Management international',
        display_order: 1,
      },
      {
        id: 'deg-008-2',
        application_id: 'app-008',
        title: 'Maîtrise en Économie',
        year: 2007,
        institution: 'Université de Conakry',
        city: 'Conakry',
        country: 'Guinée',
        display_order: 2,
      },
    ],

    documents: [
      {
        id: 'adoc-008-1',
        application_id: 'app-008',
        document_name: 'CV',
        file_url: '/uploads/cv-bah.pdf',
        is_valid: undefined,
        created_at: '2025-01-20T17:30:00Z',
      },
      {
        id: 'adoc-008-2',
        application_id: 'app-008',
        document_name: 'Lettre de recommandation',
        file_url: '/uploads/recommandation-bah.pdf',
        is_valid: undefined,
        created_at: '2025-01-20T17:30:00Z',
      },
    ],

    documents_validated: 0,
    documents_total: 2,
    is_complete: true,
  },

  // === CANDIDATURE 9: Acceptée ===
  {
    id: 'app-009',
    reference_number: 'APP-2025-000009',
    call_id: 'call-bourse-oif-2025',
    call: {
      id: 'call-bourse-oif-2025',
      title: 'Bourses OIF 2025',
      type: 'scholarship',
    },
    program_external_id: 'prog-environnement',
    program: {
      id: 'prog-environnement',
      title: 'Master en Environnement',
      department: 'Département Environnement',
    },
    reviewer_external_id: 'reviewer-3',
    reviewer: mockReviewers[2],

    salutation: 'mrs',
    last_name: 'Cissé',
    first_name: 'Aïssatou',
    birth_date: '1992-07-25',
    birth_city: 'Niamey',
    birth_country: 'Niger',
    nationality: 'Niger',
    marital_status: 'single',
    employment_status: 'ngo_employee',

    address: '67 Boulevard de l\'Environnement',
    city: 'Niamey',
    phone: '+227 96 12 34 56',
    phone_whatsapp: '+227 96 12 34 56',
    email: 'aissatou.cisse@example.com',

    has_work_experience: true,
    current_job: 'Chargée de projets environnementaux',
    job_title: 'Chargée de projets',
    employer_name: 'WWF Niger',
    employer_city: 'Niamey',
    employer_country: 'Niger',
    experience_duration: 'between_3_5_years',

    highest_degree_level: 'Master 1',
    highest_degree_title: 'Master en Sciences de l\'Environnement',
    degree_date: '2018-06-30',
    degree_location: 'Université Abdou Moumouni',

    status: 'accepted',
    submitted_at: '2025-01-09T13:00:00Z',
    reviewed_at: '2025-01-19T16:30:00Z',
    review_notes: 'Excellente candidate. Profil parfait pour le programme avec expérience terrain significative.',
    review_score: 95.0,

    created_at: '2025-01-09T13:00:00Z',
    updated_at: '2025-01-19T16:30:00Z',

    degrees: [
      {
        id: 'deg-009-1',
        application_id: 'app-009',
        title: 'Master 1 en Sciences de l\'Environnement',
        year: 2018,
        institution: 'Université Abdou Moumouni',
        city: 'Niamey',
        country: 'Niger',
        specialization: 'Gestion des ressources naturelles',
        honors: 'Très Bien',
        display_order: 1,
      },
      {
        id: 'deg-009-2',
        application_id: 'app-009',
        title: 'Licence en Biologie',
        year: 2016,
        institution: 'Université Abdou Moumouni',
        city: 'Niamey',
        country: 'Niger',
        honors: 'Bien',
        display_order: 2,
      },
    ],

    documents: [
      {
        id: 'adoc-009-1',
        application_id: 'app-009',
        document_name: 'CV',
        file_url: '/uploads/cv-cisse.pdf',
        is_valid: true,
        created_at: '2025-01-09T13:00:00Z',
      },
      {
        id: 'adoc-009-2',
        application_id: 'app-009',
        document_name: 'Lettre de motivation',
        file_url: '/uploads/lm-cisse.pdf',
        is_valid: true,
        validation_comment: 'Lettre très bien rédigée avec motivations claires',
        created_at: '2025-01-09T13:00:00Z',
      },
      {
        id: 'adoc-009-3',
        application_id: 'app-009',
        document_name: 'Diplômes',
        file_url: '/uploads/diplomes-cisse.pdf',
        is_valid: true,
        created_at: '2025-01-09T13:00:00Z',
      },
      {
        id: 'adoc-009-4',
        application_id: 'app-009',
        document_name: 'Attestation WWF',
        file_url: '/uploads/attestation-cisse.pdf',
        is_valid: true,
        created_at: '2025-01-09T13:00:00Z',
      },
      {
        id: 'adoc-009-5',
        application_id: 'app-009',
        document_name: 'Projet de recherche',
        file_url: '/uploads/projet-cisse.pdf',
        is_valid: true,
        validation_comment: 'Projet pertinent et bien structuré',
        created_at: '2025-01-09T13:00:00Z',
      },
    ],

    documents_validated: 5,
    documents_total: 5,
    is_complete: true,
  },

  // === CANDIDATURE 10: Soumise ===
  {
    id: 'app-010',
    reference_number: 'APP-2025-000010',
    call_id: 'call-master-dev-2025',
    call: {
      id: 'call-master-dev-2025',
      title: 'Master Développement 2025-2027',
      type: 'application',
    },
    program_external_id: 'prog-master-dev',
    program: {
      id: 'prog-master-dev',
      title: 'Master en Développement',
      department: 'Département Développement',
    },

    salutation: 'mr',
    last_name: 'Sow',
    first_name: 'Abdoulaye',
    birth_date: '1991-01-08',
    birth_city: 'Thiès',
    birth_country: 'Sénégal',
    nationality: 'Sénégal',
    marital_status: 'married',
    employment_status: 'civil_servant',

    address: '45 Rue des Baobabs',
    city: 'Thiès',
    phone: '+221 77 888 99 00',
    email: 'abdoulaye.sow@example.com',

    has_work_experience: true,
    current_job: 'Inspecteur des finances',
    employer_name: 'Inspection Générale des Finances',
    employer_city: 'Dakar',
    employer_country: 'Sénégal',
    experience_duration: 'between_5_10_years',

    highest_degree_level: 'Master',
    highest_degree_title: 'Master en Finance Publique',
    degree_date: '2016-07-15',
    degree_location: 'ENA Dakar',

    status: 'submitted',
    submitted_at: '2025-01-21T09:00:00Z',

    created_at: '2025-01-21T09:00:00Z',
    updated_at: '2025-01-21T09:00:00Z',

    degrees: [
      {
        id: 'deg-010-1',
        application_id: 'app-010',
        title: 'Master en Finance Publique',
        year: 2016,
        institution: 'École Nationale d\'Administration',
        city: 'Dakar',
        country: 'Sénégal',
        specialization: 'Gestion budgétaire',
        honors: 'Bien',
        display_order: 1,
      },
    ],

    documents: [
      {
        id: 'adoc-010-1',
        application_id: 'app-010',
        document_name: 'CV',
        file_url: '/uploads/cv-sow.pdf',
        is_valid: undefined,
        created_at: '2025-01-21T09:00:00Z',
      },
      {
        id: 'adoc-010-2',
        application_id: 'app-010',
        document_name: 'Lettre de motivation',
        file_url: '/uploads/lm-sow.pdf',
        is_valid: undefined,
        created_at: '2025-01-21T09:00:00Z',
      },
      {
        id: 'adoc-010-3',
        application_id: 'app-010',
        document_name: 'Diplômes',
        file_url: '/uploads/diplomes-sow.pdf',
        is_valid: undefined,
        created_at: '2025-01-21T09:00:00Z',
      },
    ],

    documents_validated: 0,
    documents_total: 3,
    is_complete: true,
  },
]

// Fonction pour obtenir les statistiques
export function getApplicationsStats() {
  const stats = {
    total: mockApplications.length,
    submitted: 0,
    under_review: 0,
    accepted: 0,
    rejected: 0,
    waitlisted: 0,
    incomplete: 0,
  }

  mockApplications.forEach((app) => {
    stats[app.status]++
  })

  return stats
}

// Fonction pour obtenir les statistiques par évaluateur
export function getReviewerStats() {
  const stats: Record<string, { reviewer: Reviewer; assigned: number; reviewed: number; pending: number }> = {}

  mockApplications.forEach((app) => {
    if (app.reviewer) {
      if (!stats[app.reviewer.id]) {
        stats[app.reviewer.id] = {
          reviewer: app.reviewer,
          assigned: 0,
          reviewed: 0,
          pending: 0,
        }
      }
      stats[app.reviewer.id].assigned++
      if (app.reviewed_at) {
        stats[app.reviewer.id].reviewed++
      }
      else {
        stats[app.reviewer.id].pending++
      }
    }
  })

  return Object.values(stats)
}
