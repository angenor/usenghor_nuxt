/**
 * Données mock pour les levées de fonds.
 */

import type {
  FundraiserPublic,
  FundraiserPublicDetail,
  ContributorPublic,
  FundraiserNewsDisplay,
  FundraiserStatistics,
} from '~/types/fundraising'

// =============================================================================
// DONNÉES MOCK
// =============================================================================

export const mockContributors: ContributorPublic[] = [
  {
    id: 'c001',
    name: 'République française',
    name_en: 'French Republic',
    name_ar: 'الجمهورية الفرنسية',
    category: 'state_organization',
    amount: 500000,
    logo_external_id: null,
  },
  {
    id: 'c002',
    name: 'Organisation internationale de la Francophonie',
    name_en: 'International Organisation of La Francophonie',
    name_ar: 'المنظمة الدولية للفرنكوفونية',
    category: 'state_organization',
    amount: 300000,
    logo_external_id: null,
  },
  {
    id: 'c003',
    name: 'Union européenne',
    name_en: 'European Union',
    name_ar: 'الاتحاد الأوروبي',
    category: 'state_organization',
    amount: 250000,
    logo_external_id: null,
  },
  {
    id: 'c004',
    name: 'Fondation pour l\'éducation en Afrique',
    name_en: 'Foundation for Education in Africa',
    name_ar: 'مؤسسة التعليم في أفريقيا',
    category: 'foundation_philanthropist',
    amount: 200000,
    logo_external_id: null,
  },
  {
    id: 'c005',
    name: 'Fondation Senghor',
    name_en: 'Senghor Foundation',
    name_ar: 'مؤسسة سنغور',
    category: 'foundation_philanthropist',
    amount: 150000,
    logo_external_id: null,
  },
  {
    id: 'c006',
    name: 'Orange Afrique',
    name_en: 'Orange Africa',
    name_ar: 'أورانج أفريقيا',
    category: 'company',
    amount: 100000,
    logo_external_id: null,
  },
  {
    id: 'c007',
    name: 'Total Energies',
    name_en: 'Total Energies',
    name_ar: 'توتال إنرجيز',
    category: 'company',
    amount: 75000,
    logo_external_id: null,
  },
]

export const mockFundraiserNews: FundraiserNewsDisplay[] = [
  {
    id: 'n001',
    title: 'Lancement de la campagne de levée de fonds 2026',
    slug: 'lancement-campagne-2026',
    summary: 'L\'Université Senghor lance sa grande campagne de levée de fonds pour financer la modernisation de ses campus.',
    cover_image_external_id: null,
    published_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'n002',
    title: 'La France renouvelle son soutien à l\'Université Senghor',
    slug: 'france-renouvelle-soutien',
    summary: 'Le gouvernement français annonce une contribution majeure pour soutenir les programmes de formation.',
    cover_image_external_id: null,
    published_at: '2026-02-01T14:30:00Z',
  },
]

export const mockFundraisers: FundraiserPublic[] = [
  {
    id: 'f001',
    title: 'Modernisation du campus d\'Alexandrie',
    slug: 'modernisation-campus-alexandrie',
    cover_image_external_id: null,
    goal_amount: 2000000,
    total_raised: 1575000,
    progress_percentage: 78.75,
    status: 'active',
    contributor_count: 7,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'f002',
    title: 'Bourses d\'excellence 2026-2027',
    slug: 'bourses-excellence-2026-2027',
    cover_image_external_id: null,
    goal_amount: 500000,
    total_raised: 500000,
    progress_percentage: 100,
    status: 'completed',
    contributor_count: 4,
    created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 'f003',
    title: 'Programme de recherche sur le développement durable',
    slug: 'recherche-developpement-durable',
    cover_image_external_id: null,
    goal_amount: 750000,
    total_raised: 120000,
    progress_percentage: 16,
    status: 'active',
    contributor_count: 2,
    created_at: '2026-03-01T00:00:00Z',
  },
]

export const mockFundraiserDetail: FundraiserPublicDetail = {
  id: 'f001',
  title: 'Modernisation du campus d\'Alexandrie',
  slug: 'modernisation-campus-alexandrie',
  description_html: '<h2>Un projet ambitieux pour l\'avenir</h2><p>L\'Université Senghor lance une campagne de modernisation de son campus principal à Alexandrie. Ce projet comprend la rénovation des salles de cours, la création d\'espaces numériques et la mise en place d\'un centre de recherche de pointe.</p><p>Cette modernisation permettra d\'accueillir plus d\'étudiants dans de meilleures conditions et de renforcer la position de l\'université comme pôle d\'excellence francophone en Afrique.</p>',
  description_en_html: '<h2>An ambitious project for the future</h2><p>Senghor University is launching a campaign to modernize its main campus in Alexandria. This project includes the renovation of classrooms, the creation of digital spaces and the establishment of a state-of-the-art research center.</p>',
  description_ar_html: '<h2>مشروع طموح للمستقبل</h2><p>تطلق جامعة سنغور حملة لتحديث حرمها الجامعي الرئيسي في الإسكندرية.</p>',
  cover_image_external_id: null,
  goal_amount: 2000000,
  total_raised: 1575000,
  progress_percentage: 78.75,
  status: 'active',
  contributors: mockContributors,
  news: mockFundraiserNews,
  created_at: '2026-01-01T00:00:00Z',
}

export const mockFundraiserStats: FundraiserStatistics = {
  total: 3,
  draft: 0,
  active: 2,
  completed: 1,
  total_goal: 3250000,
  total_raised: 2195000,
}

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

export function getFundraiserById(id: string): FundraiserPublic | undefined {
  return mockFundraisers.find(f => f.id === id)
}

export function getFundraiserBySlug(slug: string): FundraiserPublicDetail | undefined {
  if (slug === mockFundraiserDetail.slug) return mockFundraiserDetail
  return undefined
}
