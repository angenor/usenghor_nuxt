/**
 * Données mock pour le module Fundraising
 */

import type {
  AllContributorsItem,
  ContributorPublic,
  EditorialSectionPublic,
  FundraiserDisplay,
  FundraiserMediaItem,
  FundraiserNewsPublic,
  FundraiserPublic,
  FundraiserPublicDetail,
  FundraiserStatistics,
  GlobalStats,
} from '~/types/fundraising'

// ── Contributeurs ───────────────────────────────────────────────────

export const mockContributors: ContributorPublic[] = [
  {
    id: 'c1',
    name: 'Organisation Internationale de la Francophonie',
    name_en: 'International Organization of the Francophonie',
    name_ar: 'المنظمة الدولية للفرنكوفونية',
    category: 'state_organization',
    amount: 150000,
    logo_url: null,
    display_order: 0,
  },
  {
    id: 'c2',
    name: 'Fondation Senghor',
    name_en: 'Senghor Foundation',
    name_ar: 'مؤسسة سنغور',
    category: 'foundation_philanthropist',
    amount: 75000,
    logo_url: null,
    display_order: 1,
  },
  {
    id: 'c3',
    name: 'Agence Universitaire de la Francophonie',
    name_en: 'Francophone University Agency',
    name_ar: 'الوكالة الجامعية للفرنكوفونية',
    category: 'state_organization',
    amount: null,
    logo_url: null,
    display_order: 2,
  },
  {
    id: 'c4',
    name: 'Total Energies Foundation',
    name_en: 'Total Energies Foundation',
    name_ar: 'مؤسسة توتال إنرجيز',
    category: 'company',
    amount: 50000,
    logo_url: null,
    display_order: 3,
  },
]

// ── Campagnes ───────────────────────────────────────────────────────

export const mockFundraisers: FundraiserPublic[] = [
  {
    id: 'f1',
    title: 'Campagne pour les bourses 2026',
    slug: 'bourses-2026',
    cover_image_url: null,
    goal_amount: 500000,
    total_raised: 275000,
    progress_percentage: 55,
    contributor_count: 12,
    status: 'active',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'f4',
    title: 'Bibliothèque numérique francophone',
    slug: 'bibliotheque-numerique-francophone',
    cover_image_url: null,
    goal_amount: 180000,
    total_raised: 42000,
    progress_percentage: 23,
    contributor_count: 6,
    status: 'active',
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'f5',
    title: 'Laboratoire de recherche en développement durable',
    slug: 'labo-recherche-dd',
    cover_image_url: null,
    goal_amount: 350000,
    total_raised: 120000,
    progress_percentage: 34,
    contributor_count: 9,
    status: 'active',
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'f2',
    title: 'Rénovation du Campus d\'Alexandrie',
    slug: 'renovation-campus-alexandrie',
    cover_image_url: null,
    goal_amount: 300000,
    total_raised: 300000,
    progress_percentage: 100,
    contributor_count: 8,
    status: 'completed',
    created_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'f3',
    title: 'Programme d\'échange international',
    slug: 'programme-echange-international',
    cover_image_url: null,
    goal_amount: 200000,
    total_raised: 210000,
    progress_percentage: 105,
    contributor_count: 15,
    status: 'completed',
    created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'f6',
    title: 'Équipement informatique des salles de cours',
    slug: 'equipement-informatique-salles',
    cover_image_url: null,
    goal_amount: 120000,
    total_raised: 120000,
    progress_percentage: 100,
    contributor_count: 10,
    status: 'completed',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'f7',
    title: 'Fonds d\'aide aux étudiants en situation de crise',
    slug: 'fonds-aide-etudiants-crise',
    cover_image_url: null,
    goal_amount: 80000,
    total_raised: 95000,
    progress_percentage: 119,
    contributor_count: 22,
    status: 'completed',
    created_at: '2024-03-01T10:00:00Z',
  },
]

// ── Détail campagne ─────────────────────────────────────────────────

export const mockFundraiserDetail: FundraiserPublicDetail = {
  id: 'f1',
  title: 'Campagne pour les bourses 2026',
  slug: 'bourses-2026',
  description_html: '<p>Cette campagne vise à financer des bourses d\'études pour des étudiants méritants de toute l\'Afrique francophone et de la région MENA.</p>',
  description_en_html: '<p>This campaign aims to fund scholarships for deserving students from across Francophone Africa and the MENA region.</p>',
  description_ar_html: '<p>تهدف هذه الحملة إلى تمويل منح دراسية للطلاب المستحقين من أنحاء أفريقيا الناطقة بالفرنسية ومنطقة الشرق الأوسط وشمال أفريقيا.</p>',
  reason_html: '<p>L\'éducation est le pilier du développement durable. Chaque bourse offerte transforme une vie et contribue au rayonnement de la Francophonie.</p>',
  reason_en_html: '<p>Education is the pillar of sustainable development. Every scholarship offered transforms a life and contributes to the influence of the Francophonie.</p>',
  reason_ar_html: '<p>التعليم هو ركيزة التنمية المستدامة. كل منحة مقدمة تغيّر حياة وتساهم في إشعاع الفرنكوفونية.</p>',
  cover_image_url: null,
  goal_amount: 500000,
  total_raised: 275000,
  progress_percentage: 55,
  contributor_count: 12,
  status: 'active',
  contributors: mockContributors,
  media: [],
  news: [
    {
      id: 'n1',
      title: 'Lancement de la campagne bourses 2026',
      slug: 'lancement-campagne-bourses-2026',
      cover_image_url: null,
      published_at: '2026-01-20T10:00:00Z',
    },
  ],
}

// ── Sections éditoriales ────────────────────────────────────────────

export const mockEditorialSections: EditorialSectionPublic[] = [
  {
    slug: 'contribution-reasons',
    title: 'Votre contribution sert à',
    items: [
      { icon: 'academic-cap', title: 'Former les leaders de demain', description: 'Votre soutien finance des bourses d\'études pour des étudiants méritants venus de toute l\'Afrique et de la Francophonie.' },
      { icon: 'building-library', title: 'Moderniser les infrastructures', description: 'Contribuez à la rénovation et l\'équipement des campus pour offrir un environnement d\'apprentissage de qualité.' },
      { icon: 'globe-alt', title: 'Renforcer la coopération internationale', description: 'Participez au développement de partenariats académiques et de programmes d\'échange à travers le monde.' },
    ],
  },
  {
    slug: 'engagement-examples',
    title: 'Exemples d\'engagement',
    items: [
      { icon: 'currency-euro', title: 'Don financier', description: 'Effectuez un don unique ou récurrent pour soutenir les activités de l\'université.' },
      { icon: 'users', title: 'Parrainage d\'étudiants', description: 'Parrainez un ou plusieurs étudiants en finançant leur parcours académique complet.' },
      { icon: 'briefcase', title: 'Partenariat institutionnel', description: 'Établissez un partenariat stratégique avec l\'université pour des projets de recherche ou de formation.' },
    ],
  },
  {
    slug: 'contribution-benefits',
    title: 'Bénéfices liés à votre contribution',
    items: [
      { icon: 'shield-check', title: 'Visibilité et reconnaissance', description: 'Bénéficiez d\'une visibilité sur nos supports de communication et lors de nos événements.' },
      { icon: 'document-text', title: 'Avantages fiscaux', description: 'Profitez de déductions fiscales conformément à la législation en vigueur dans votre pays.' },
      { icon: 'chart-bar', title: 'Rapports d\'impact', description: 'Recevez des rapports réguliers sur l\'utilisation de vos contributions et l\'impact généré.' },
    ],
  },
]

// ── Stats globales ──────────────────────────────────────────────────

export const mockGlobalStats: GlobalStats = {
  total_raised_all_campaigns: 1162000,
  total_contributors: 82,
  active_campaigns_count: 3,
  completed_campaigns_count: 4,
}

export const mockAdminStats: FundraiserStatistics = {
  total_campaigns: 3,
  active_campaigns: 1,
  completed_campaigns: 2,
  draft_campaigns: 0,
  total_raised: 785000,
  total_contributors: 35,
  total_interest_expressions: 12,
  new_interest_expressions: 5,
}

// ── All contributors (agrégé) ───────────────────────────────────────

export const mockAllContributors: AllContributorsItem[] = [
  {
    name: 'Organisation Internationale de la Francophonie',
    category: 'state_organization',
    total_amount: 200000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 2,
  },
  {
    name: 'Fondation Senghor',
    category: 'foundation_philanthropist',
    total_amount: 100000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 2,
  },
  {
    name: 'Agence Universitaire de la Francophonie',
    category: 'state_organization',
    total_amount: null,
    show_amount_publicly: false,
    logo_url: null,
    campaigns_count: 3,
  },
  {
    name: 'Total Energies Foundation',
    category: 'company',
    total_amount: 50000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 1,
  },
]

// ── Fonctions utilitaires ───────────────────────────────────────────

export function getFundraiserById(id: string): FundraiserPublic | undefined {
  return mockFundraisers.find(f => f.id === id)
}

export function getFundraiserBySlug(slug: string): FundraiserPublicDetail | undefined {
  if (slug === mockFundraiserDetail.slug) return mockFundraiserDetail
  return undefined
}

export function getGlobalStats(): GlobalStats {
  return mockGlobalStats
}

export function getAllContributors(): AllContributorsItem[] {
  return mockAllContributors
}

export function getEditorialSections(): EditorialSectionPublic[] {
  return mockEditorialSections
}
