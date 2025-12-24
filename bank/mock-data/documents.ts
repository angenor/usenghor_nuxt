/**
 * Mock Data: Documents
 * Table SQL: documents
 */

export type DocumentCategory = 'texte_fondateur' | 'charte' | 'rapport' | 'guide' | 'formulaire' | 'autre'
export type LanguageCode = 'fr' | 'en' | 'ar' | 'multi'

export interface Document {
  id: string
  document_category: DocumentCategory
  title_fr: string
  title_en?: string
  title_ar?: string
  description_fr?: string
  file_url: string
  file_type: string
  file_size: number // bytes
  language: LanguageCode
  year?: number
  is_public: boolean
  sort_order: number
}

export const mockDocuments: Document[] = [
  // === TEXTES FONDATEURS ===
  {
    id: 'doc-convention',
    document_category: 'texte_fondateur',
    title_fr: 'Convention portant création de l\'Université Senghor',
    title_en: 'Convention establishing Senghor University',
    description_fr: 'Convention signée à Dakar le 14 novembre 1989 par les chefs d\'État et de gouvernement.',
    file_url: '/documents/convention-creation-1989.pdf',
    file_type: 'pdf',
    file_size: 2500000,
    language: 'fr',
    year: 1989,
    is_public: true,
    sort_order: 1
  },
  {
    id: 'doc-statuts',
    document_category: 'texte_fondateur',
    title_fr: 'Statuts de l\'Université Senghor',
    title_en: 'Statutes of Senghor University',
    description_fr: 'Statuts en vigueur définissant l\'organisation et le fonctionnement de l\'Université.',
    file_url: '/documents/statuts-universite.pdf',
    file_type: 'pdf',
    file_size: 1800000,
    language: 'fr',
    year: 2020,
    is_public: true,
    sort_order: 2
  },
  {
    id: 'doc-reglement',
    document_category: 'texte_fondateur',
    title_fr: 'Règlement intérieur',
    title_en: 'Internal Regulations',
    description_fr: 'Règlement intérieur régissant la vie universitaire.',
    file_url: '/documents/reglement-interieur.pdf',
    file_type: 'pdf',
    file_size: 1200000,
    language: 'fr',
    year: 2022,
    is_public: true,
    sort_order: 3
  },

  // === CHARTES ===
  {
    id: 'doc-charte-ethique',
    document_category: 'charte',
    title_fr: 'Charte éthique',
    title_en: 'Ethics Charter',
    title_ar: 'ميثاق الأخلاقيات',
    description_fr: 'Charte définissant les valeurs et engagements éthiques de l\'Université.',
    file_url: '/documents/charte-ethique.pdf',
    file_type: 'pdf',
    file_size: 950000,
    language: 'multi',
    year: 2021,
    is_public: true,
    sort_order: 1
  },
  {
    id: 'doc-charte-etudiant',
    document_category: 'charte',
    title_fr: 'Charte de l\'étudiant',
    title_en: 'Student Charter',
    description_fr: 'Droits et devoirs des étudiants de l\'Université Senghor.',
    file_url: '/documents/charte-etudiant.pdf',
    file_type: 'pdf',
    file_size: 750000,
    language: 'fr',
    year: 2022,
    is_public: true,
    sort_order: 2
  },

  // === RAPPORTS ===
  {
    id: 'doc-rapport-2023',
    document_category: 'rapport',
    title_fr: 'Rapport d\'activité 2023',
    title_en: 'Annual Report 2023',
    description_fr: 'Rapport annuel présentant les réalisations de l\'année 2023.',
    file_url: '/documents/rapport-activite-2023.pdf',
    file_type: 'pdf',
    file_size: 5200000,
    language: 'fr',
    year: 2023,
    is_public: true,
    sort_order: 1
  },
  {
    id: 'doc-plan-strategique',
    document_category: 'rapport',
    title_fr: 'Plan stratégique 2024-2030',
    title_en: 'Strategic Plan 2024-2030',
    description_fr: 'Document définissant les orientations stratégiques de l\'Université pour les six prochaines années.',
    file_url: '/documents/plan-strategique-2024-2030.pdf',
    file_type: 'pdf',
    file_size: 3800000,
    language: 'fr',
    year: 2024,
    is_public: true,
    sort_order: 2
  },

  // === GUIDES ===
  {
    id: 'doc-guide-etudiant',
    document_category: 'guide',
    title_fr: 'Guide de l\'étudiant 2024-2025',
    title_en: 'Student Guide 2024-2025',
    description_fr: 'Guide pratique pour les étudiants : vie sur le campus, services, procédures.',
    file_url: '/documents/guide-etudiant-2024.pdf',
    file_type: 'pdf',
    file_size: 4500000,
    language: 'fr',
    year: 2024,
    is_public: true,
    sort_order: 1
  },

  // === FORMULAIRES ===
  {
    id: 'doc-form-candidature',
    document_category: 'formulaire',
    title_fr: 'Formulaire de candidature Master',
    title_en: 'Master Application Form',
    description_fr: 'Formulaire à remplir pour candidater aux programmes de Master.',
    file_url: '/documents/formulaire-candidature-master.pdf',
    file_type: 'pdf',
    file_size: 350000,
    language: 'fr',
    year: 2024,
    is_public: true,
    sort_order: 1
  },
  {
    id: 'doc-form-bourse',
    document_category: 'formulaire',
    title_fr: 'Demande de bourse',
    title_en: 'Scholarship Application',
    description_fr: 'Formulaire de demande de bourse d\'études.',
    file_url: '/documents/formulaire-bourse.pdf',
    file_type: 'pdf',
    file_size: 280000,
    language: 'fr',
    year: 2024,
    is_public: true,
    sort_order: 2
  }
]
