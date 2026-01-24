// ============================================================================
// MOCK DATA - CHIFFRES CLÉS (EDITORIAL STATISTICS)
// ============================================================================
// Basé sur le schéma SQL: 12_editorial.sql
// Tables: editorial_categories, editorial_contents, editorial_contents_history
// ============================================================================

// Types de valeur pour les contenus éditoriaux
export type EditorialValueType = 'text' | 'number' | 'json' | 'html' | 'markdown'

// Catégorie de contenu éditorial
export interface EditorialCategory {
  id: string
  code: string
  name: string
  description: string | null
  created_at: string
}

// Contenu éditorial (chiffre clé)
export interface EditorialStatistic {
  id: string
  key: string
  value: string
  value_type: EditorialValueType
  category_id: string | null
  year: number | null
  description: string | null
  admin_editable: boolean
  created_at: string
  updated_at: string
}

// Historique des modifications
export interface EditorialStatisticHistory {
  id: string
  content_id: string
  old_value: string
  new_value: string
  modified_by_external_id: string | null
  modified_by_name?: string
  modified_at: string
}

// Filtres pour la liste
export interface StatisticFilters {
  search?: string
  category?: string
  year?: number
  sort_by?: 'key' | 'updated_at' | 'year'
  sort_order?: 'asc' | 'desc'
}

// Labels pour les types de valeur
export const valueTypeLabels: Record<EditorialValueType, string> = {
  text: 'Texte',
  number: 'Nombre',
  json: 'JSON',
  html: 'HTML',
  markdown: 'Markdown'
}

// Couleurs pour les types de valeur
export const valueTypeColors: Record<EditorialValueType, string> = {
  text: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  number: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  json: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  html: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  markdown: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
}

// ============================================================================
// DONNÉES MOCK - CATÉGORIES
// ============================================================================

export const mockEditorialCategories: EditorialCategory[] = [
  {
    id: 'cat_001',
    code: 'statistics',
    name: 'Chiffres clés',
    description: 'Statistiques principales affichées sur le site',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_002',
    code: 'rates',
    name: 'Taux et pourcentages',
    description: 'Taux de réussite, d\'insertion, etc.',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_003',
    code: 'history',
    name: 'Historique',
    description: 'Données historiques de l\'université',
    created_at: '2024-01-01T00:00:00Z'
  }
]

// ============================================================================
// DONNÉES MOCK - CHIFFRES CLÉS
// ============================================================================

export const mockEditorialStatistics: EditorialStatistic[] = [
  // Chiffres clés principaux
  {
    id: 'stat_001',
    key: 'graduates_count',
    value: '5200',
    value_type: 'number',
    category_id: 'cat_001',
    year: 2024,
    description: 'Nombre total de diplômés depuis la création',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-15T10:00:00Z'
  },
  {
    id: 'stat_002',
    key: 'countries_count',
    value: '54',
    value_type: 'number',
    category_id: 'cat_001',
    year: null,
    description: 'Nombre de pays africains représentés',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-20T14:30:00Z'
  },
  {
    id: 'stat_003',
    key: 'years_existence',
    value: '35',
    value_type: 'number',
    category_id: 'cat_003',
    year: 2025,
    description: 'Années d\'existence de l\'université (depuis 1990)',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'stat_004',
    key: 'programs_count',
    value: '12',
    value_type: 'number',
    category_id: 'cat_001',
    year: 2024,
    description: 'Nombre de formations proposées',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-01T09:00:00Z'
  },
  {
    id: 'stat_005',
    key: 'partners_count',
    value: '150',
    value_type: 'number',
    category_id: 'cat_001',
    year: 2024,
    description: 'Nombre de partenaires internationaux',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-10T16:45:00Z'
  },
  // Taux et pourcentages
  {
    id: 'stat_006',
    key: 'success_rate',
    value: '92',
    value_type: 'number',
    category_id: 'cat_002',
    year: 2024,
    description: 'Taux de réussite aux examens (%)',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-07-15T11:20:00Z'
  },
  {
    id: 'stat_007',
    key: 'employment_rate',
    value: '87',
    value_type: 'number',
    category_id: 'cat_002',
    year: 2024,
    description: 'Taux d\'insertion professionnelle à 6 mois (%)',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-10-01T08:30:00Z'
  },
  {
    id: 'stat_008',
    key: 'satisfaction_rate',
    value: '94',
    value_type: 'number',
    category_id: 'cat_002',
    year: 2024,
    description: 'Taux de satisfaction des étudiants (%)',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-08-20T13:15:00Z'
  },
  // Autres données
  {
    id: 'stat_009',
    key: 'library_books',
    value: '25000',
    value_type: 'number',
    category_id: 'cat_001',
    year: 2024,
    description: 'Nombre d\'ouvrages en bibliothèque',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-10T10:00:00Z'
  },
  {
    id: 'stat_010',
    key: 'campus_area',
    value: '15000',
    value_type: 'number',
    category_id: 'cat_001',
    year: null,
    description: 'Surface du campus en m²',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'stat_011',
    key: 'foundation_year',
    value: '1990',
    value_type: 'number',
    category_id: 'cat_003',
    year: null,
    description: 'Année de fondation de l\'université',
    admin_editable: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'stat_012',
    key: 'faculty_count',
    value: '85',
    value_type: 'number',
    category_id: 'cat_001',
    year: 2024,
    description: 'Nombre d\'enseignants et chercheurs',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-15T14:00:00Z'
  }
]

// ============================================================================
// DONNÉES MOCK - HISTORIQUE DES MODIFICATIONS
// ============================================================================

export const mockEditorialStatisticsHistory: EditorialStatisticHistory[] = [
  // Historique pour graduates_count
  {
    id: 'hist_001',
    content_id: 'stat_001',
    old_value: '5000',
    new_value: '5200',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-12-15T10:00:00Z'
  },
  {
    id: 'hist_002',
    content_id: 'stat_001',
    old_value: '4800',
    new_value: '5000',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-06-01T09:30:00Z'
  },
  {
    id: 'hist_003',
    content_id: 'stat_001',
    old_value: '4500',
    new_value: '4800',
    modified_by_external_id: 'user_admin_002',
    modified_by_name: 'Marie Martin',
    modified_at: '2023-12-20T14:00:00Z'
  },
  // Historique pour success_rate
  {
    id: 'hist_004',
    content_id: 'stat_006',
    old_value: '90',
    new_value: '92',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-07-15T11:20:00Z'
  },
  // Historique pour employment_rate
  {
    id: 'hist_005',
    content_id: 'stat_007',
    old_value: '85',
    new_value: '87',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-10-01T08:30:00Z'
  },
  // Historique pour partners_count
  {
    id: 'hist_006',
    content_id: 'stat_005',
    old_value: '140',
    new_value: '150',
    modified_by_external_id: 'user_admin_002',
    modified_by_name: 'Marie Martin',
    modified_at: '2024-11-10T16:45:00Z'
  },
  {
    id: 'hist_007',
    content_id: 'stat_005',
    old_value: '130',
    new_value: '140',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-05-15T10:00:00Z'
  }
]

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Générer un ID unique
export const generateStatisticId = (): string => {
  return `stat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateHistoryId = (): string => {
  return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Récupérer toutes les statistiques avec filtres
export const getAllStatistics = (filters?: StatisticFilters): EditorialStatistic[] => {
  let result = [...mockEditorialStatistics]

  if (filters) {
    // Filtre par recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(s =>
        s.key.toLowerCase().includes(search) ||
        s.value.toLowerCase().includes(search) ||
        (s.description?.toLowerCase().includes(search) ?? false)
      )
    }

    // Filtre par catégorie
    if (filters.category) {
      result = result.filter(s => s.category_id === filters.category)
    }

    // Filtre par année
    if (filters.year) {
      result = result.filter(s => s.year === filters.year)
    }

    // Tri
    const sortBy = filters.sort_by || 'updated_at'
    const sortOrder = filters.sort_order || 'desc'
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'key':
          comparison = a.key.localeCompare(b.key)
          break
        case 'year':
          comparison = (a.year || 0) - (b.year || 0)
          break
        case 'updated_at':
        default:
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })
  } else {
    // Tri par défaut : dernière modification
    result.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  }

  return result
}

// Récupérer une statistique par ID
export const getStatisticById = (id: string): EditorialStatistic | undefined => {
  return mockEditorialStatistics.find(s => s.id === id)
}

// Récupérer une statistique par clé
export const getStatisticByKey = (key: string): EditorialStatistic | undefined => {
  return mockEditorialStatistics.find(s => s.key === key)
}

// Vérifier si une clé est déjà utilisée
export const isKeyTaken = (key: string, excludeId?: string): boolean => {
  return mockEditorialStatistics.some(s => s.key === key && s.id !== excludeId)
}

// Récupérer l'historique d'une statistique
export const getStatisticHistory = (contentId: string): EditorialStatisticHistory[] => {
  return mockEditorialStatisticsHistory
    .filter(h => h.content_id === contentId)
    .sort((a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime())
}

// Récupérer les catégories
export const getAllCategories = (): EditorialCategory[] => {
  return [...mockEditorialCategories]
}

// Récupérer une catégorie par ID
export const getCategoryById = (id: string): EditorialCategory | undefined => {
  return mockEditorialCategories.find(c => c.id === id)
}

// Récupérer une catégorie par code
export const getCategoryByCode = (code: string): EditorialCategory | undefined => {
  return mockEditorialCategories.find(c => c.code === code)
}

// Obtenir les années disponibles
export const getAvailableYears = (): number[] => {
  const years = new Set<number>()
  mockEditorialStatistics.forEach(s => {
    if (s.year) years.add(s.year)
  })
  return Array.from(years).sort((a, b) => b - a)
}

// Statistiques globales
export interface EditorialGlobalStats {
  total_count: number
  by_category: Array<{ category_id: string; category_name: string; count: number }>
  by_year: Array<{ year: number | null; count: number }>
  last_updated: string | null
  editable_count: number
}

export const getEditorialGlobalStats = (): EditorialGlobalStats => {
  const stats = mockEditorialStatistics

  // Par catégorie
  const categoryMap = new Map<string, number>()
  stats.forEach(s => {
    const catId = s.category_id || 'none'
    categoryMap.set(catId, (categoryMap.get(catId) || 0) + 1)
  })

  const byCategory = Array.from(categoryMap.entries()).map(([catId, count]) => {
    const category = getCategoryById(catId)
    return {
      category_id: catId,
      category_name: category?.name || 'Sans catégorie',
      count
    }
  }).sort((a, b) => b.count - a.count)

  // Par année
  const yearMap = new Map<number | null, number>()
  stats.forEach(s => {
    yearMap.set(s.year, (yearMap.get(s.year) || 0) + 1)
  })

  const byYear = Array.from(yearMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => (b.year || 0) - (a.year || 0))

  // Dernière mise à jour
  const lastUpdated = stats.length > 0
    ? stats.reduce((latest, s) =>
        new Date(s.updated_at) > new Date(latest.updated_at) ? s : latest
      ).updated_at
    : null

  return {
    total_count: stats.length,
    by_category: byCategory,
    by_year: byYear,
    last_updated: lastUpdated,
    editable_count: stats.filter(s => s.admin_editable).length
  }
}

// Formater une valeur selon son type
export const formatStatisticValue = (value: string, valueType: EditorialValueType): string => {
  switch (valueType) {
    case 'number':
      const num = parseFloat(value)
      if (!isNaN(num)) {
        return num.toLocaleString('fr-FR')
      }
      return value
    default:
      return value
  }
}

// Vérifier si une statistique peut être modifiée
export const canEditStatistic = (statistic: EditorialStatistic): boolean => {
  return statistic.admin_editable
}

// Vérifier si une statistique peut être supprimée
export const canDeleteStatistic = (statistic: EditorialStatistic): boolean => {
  return statistic.admin_editable
}
