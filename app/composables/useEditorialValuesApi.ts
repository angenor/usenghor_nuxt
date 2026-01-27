/**
 * Composable pour la gestion des valeurs éditoriales (mission, vision, valeurs fondamentales)
 * Aligné sur le backend: app/routers/admin/editorial.py
 */

import type {
  CoreValue,
  CoreValueData,
  EditorialCategoryRead,
  EditorialCategoryWithCount,
  EditorialContentCreate,
  EditorialContentRead,
  EditorialContentUpdate,
  EditorialContentWithCategory,
  EditorialHistoryRead,
  EditorialValuesStats,
  EditorialValueType,
  MessageResponse,
  PaginatedResponse,
  ValueSection,
  ValueSectionKey,
} from '~/types/api'

// Catégorie code pour les valeurs
const VALUES_CATEGORY_CODE = 'values'

// Préfixe pour les clés de valeurs fondamentales
const CORE_VALUE_KEY_PREFIX = 'core_value_'

// Labels pour les sections
export const valueSectionLabels: Record<ValueSectionKey, string> = {
  mission: 'Mission',
  vision: 'Vision',
  history: 'Historique / À propos',
  rector_message: 'Mot du recteur',
}

// Descriptions pour les sections
export const valueSectionDescriptions: Record<ValueSectionKey, string> = {
  mission: 'La mission de l\'Université Senghor et ses objectifs principaux',
  vision: 'La vision à long terme et les aspirations de l\'université',
  history: 'L\'histoire et le contexte de création de l\'université',
  rector_message: 'Le message du recteur aux étudiants et partenaires',
}

// Icônes pour les sections
export const valueSectionIcons: Record<ValueSectionKey, string> = {
  mission: 'bullseye',
  vision: 'eye',
  history: 'book-open',
  rector_message: 'user-tie',
}

// Couleurs pour les sections
export const valueSectionColors: Record<ValueSectionKey, string> = {
  mission: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  vision: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  history: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  rector_message: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

// Clés des sections (ordre d'affichage)
export const sectionKeys: ValueSectionKey[] = ['mission', 'vision', 'history', 'rector_message']

// Icônes disponibles pour les valeurs fondamentales
export const coreValueAvailableIcons: Array<{ value: string, label: string }> = [
  { value: 'star', label: 'Étoile' },
  { value: 'award', label: 'Récompense' },
  { value: 'heart', label: 'Cœur' },
  { value: 'lightbulb', label: 'Ampoule' },
  { value: 'users', label: 'Utilisateurs' },
  { value: 'globe', label: 'Globe' },
  { value: 'handshake', label: 'Poignée de main' },
  { value: 'graduation-cap', label: 'Chapeau diplômé' },
  { value: 'book', label: 'Livre' },
  { value: 'shield-alt', label: 'Bouclier' },
  { value: 'balance-scale', label: 'Balance' },
  { value: 'seedling', label: 'Pousse' },
  { value: 'rocket', label: 'Fusée' },
  { value: 'compass', label: 'Boussole' },
  { value: 'gem', label: 'Diamant' },
  { value: 'flag', label: 'Drapeau' },
]

export function useEditorialValuesApi() {
  const { apiFetch } = useApi()

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  /**
   * Liste les catégories avec le nombre de contenus
   */
  async function listCategoriesWithCount(): Promise<EditorialCategoryWithCount[]> {
    return apiFetch<EditorialCategoryWithCount[]>('/api/admin/editorial/categories/with-count')
  }

  /**
   * Récupère la catégorie "values"
   */
  async function getValuesCategory(): Promise<EditorialCategoryRead | null> {
    try {
      const response = await apiFetch<PaginatedResponse<EditorialCategoryRead>>('/api/admin/editorial/categories', {
        query: { search: VALUES_CATEGORY_CODE, limit: 1 },
      })
      return response.items.find(c => c.code === VALUES_CATEGORY_CODE) || null
    }
    catch {
      return null
    }
  }

  // ============================================================================
  // CONTENTS (Generic)
  // ============================================================================

  /**
   * Liste les contenus avec filtres
   */
  async function listContents(params: {
    page?: number
    limit?: number
    search?: string | null
    category_code?: string | null
    value_type?: EditorialValueType | null
  } = {}): Promise<PaginatedResponse<EditorialContentRead>> {
    return apiFetch<PaginatedResponse<EditorialContentRead>>('/api/admin/editorial/contents', {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 100,
        search: params.search,
        category_code: params.category_code,
        value_type: params.value_type,
      },
    })
  }

  /**
   * Récupère un contenu par ID
   */
  async function getContentById(id: string): Promise<EditorialContentWithCategory> {
    return apiFetch<EditorialContentWithCategory>(`/api/admin/editorial/contents/${id}`)
  }

  /**
   * Récupère un contenu par clé
   */
  async function getContentByKey(key: string): Promise<EditorialContentWithCategory> {
    return apiFetch<EditorialContentWithCategory>(`/api/admin/editorial/contents/by-key/${key}`)
  }

  /**
   * Crée un nouveau contenu
   */
  async function createContent(data: EditorialContentCreate): Promise<{ id: string }> {
    return apiFetch<{ id: string }>('/api/admin/editorial/contents', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un contenu
   */
  async function updateContent(id: string, data: EditorialContentUpdate): Promise<EditorialContentRead> {
    return apiFetch<EditorialContentRead>(`/api/admin/editorial/contents/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un contenu
   */
  async function deleteContent(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/editorial/contents/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Récupère l'historique d'un contenu
   */
  async function getContentHistory(contentId: string, limit = 50): Promise<EditorialHistoryRead[]> {
    return apiFetch<EditorialHistoryRead[]>(`/api/admin/editorial/contents/${contentId}/history`, {
      query: { limit },
    })
  }

  // ============================================================================
  // VALUE SECTIONS (Mission, Vision, etc.)
  // ============================================================================

  /**
   * Récupère toutes les sections de valeurs
   * Note: Les sections utilisent maintenant le format EditorJS (JSON)
   */
  async function getValueSections(): Promise<ValueSection[]> {
    const response = await listContents({
      category_code: VALUES_CATEGORY_CODE,
      limit: 20,
    })

    // Filtrer pour garder uniquement les sections connues (par clé, pas par type)
    const sections: ValueSection[] = []
    for (const key of sectionKeys) {
      const content = response.items.find(c => c.key === key)
      if (content) {
        sections.push(contentToValueSection(content))
      }
    }

    return sections.sort((a, b) => a.display_order - b.display_order)
  }

  /**
   * Récupère une section par sa clé
   */
  async function getValueSectionByKey(key: ValueSectionKey): Promise<ValueSection | null> {
    try {
      const content = await getContentByKey(key)
      return contentToValueSection(content)
    }
    catch {
      return null
    }
  }

  /**
   * Met à jour une section
   * @param id - ID du contenu
   * @param data - Données à mettre à jour (title et/ou content)
   * @param data.content - Peut être une string JSON ou un objet OutputData EditorJS
   */
  async function updateValueSection(id: string, data: { title?: string, content?: string | object }): Promise<ValueSection> {
    // Le titre est stocké dans la description, le contenu dans value
    const updateData: EditorialContentUpdate = {}
    if (data.title !== undefined) {
      updateData.description = data.title
    }
    if (data.content !== undefined) {
      // Si c'est un objet (OutputData EditorJS), le sérialiser en JSON
      updateData.value = typeof data.content === 'string'
        ? data.content
        : JSON.stringify(data.content)
    }

    const updated = await updateContent(id, updateData)
    return contentToValueSection(updated)
  }

  // ============================================================================
  // CORE VALUES (Valeurs fondamentales)
  // ============================================================================

  /**
   * Récupère toutes les valeurs fondamentales
   */
  async function getCoreValues(includeInactive = true): Promise<CoreValue[]> {
    const response = await listContents({
      category_code: VALUES_CATEGORY_CODE,
      value_type: 'json',
      limit: 50,
    })

    // Filtrer pour garder uniquement les core values
    const coreValues: CoreValue[] = []
    for (const content of response.items) {
      if (content.key.startsWith(CORE_VALUE_KEY_PREFIX)) {
        const coreValue = contentToCoreValue(content)
        if (coreValue && (includeInactive || coreValue.is_active)) {
          coreValues.push(coreValue)
        }
      }
    }

    return coreValues.sort((a, b) => a.display_order - b.display_order)
  }

  /**
   * Récupère une valeur fondamentale par ID
   */
  async function getCoreValueById(id: string): Promise<CoreValue | null> {
    try {
      const content = await getContentById(id)
      return contentToCoreValue(content)
    }
    catch {
      return null
    }
  }

  /**
   * Crée une nouvelle valeur fondamentale
   */
  async function createCoreValue(data: CoreValueData, categoryId: string): Promise<CoreValue> {
    const key = `${CORE_VALUE_KEY_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const response = await createContent({
      key,
      value: JSON.stringify(data),
      value_type: 'json',
      category_id: categoryId,
      description: data.title,
      admin_editable: true,
    })

    // Récupérer le contenu créé pour avoir toutes les infos
    const content = await getContentById(response.id)
    return contentToCoreValue(content)!
  }

  /**
   * Met à jour une valeur fondamentale
   */
  async function updateCoreValue(id: string, data: Partial<CoreValueData>): Promise<CoreValue> {
    // Récupérer les données actuelles
    const current = await getCoreValueById(id)
    if (!current) {
      throw new Error('Valeur non trouvée')
    }

    // Fusionner avec les nouvelles données
    const newData: CoreValueData = {
      title: data.title ?? current.title,
      description: data.description ?? current.description,
      icon: data.icon ?? current.icon,
      display_order: data.display_order ?? current.display_order,
      is_active: data.is_active ?? current.is_active,
    }

    const updated = await updateContent(id, {
      value: JSON.stringify(newData),
      description: newData.title,
    })

    return contentToCoreValue(updated)!
  }

  /**
   * Supprime une valeur fondamentale
   */
  async function deleteCoreValue(id: string): Promise<MessageResponse> {
    return deleteContent(id)
  }

  /**
   * Réordonne les valeurs fondamentales
   */
  async function reorderCoreValues(orderedIds: string[]): Promise<void> {
    // Mettre à jour chaque valeur avec son nouvel ordre
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i]
      const current = await getCoreValueById(id)
      if (current && current.display_order !== i + 1) {
        await updateCoreValue(id, { display_order: i + 1 })
      }
    }
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Calcule les statistiques des valeurs
   */
  async function getValuesStats(): Promise<EditorialValuesStats> {
    const [sections, coreValues] = await Promise.all([
      getValueSections(),
      getCoreValues(true),
    ])

    const activeCoreValues = coreValues.filter(v => v.is_active).length

    // Trouver la dernière mise à jour
    const allDates = [
      ...sections.map(s => s.updated_at),
      ...coreValues.map(v => v.updated_at),
    ]
    const lastUpdated = allDates.length > 0
      ? allDates.reduce((latest, current) =>
          new Date(current) > new Date(latest) ? current : latest,
        )
      : null

    return {
      sections_count: sections.length,
      core_values_count: coreValues.length,
      active_core_values: activeCoreValues,
      last_updated: lastUpdated,
    }
  }

  // ============================================================================
  // HISTORY
  // ============================================================================

  /**
   * Récupère l'historique d'une section ou valeur
   */
  async function getValueHistory(contentId: string): Promise<EditorialHistoryRead[]> {
    return getContentHistory(contentId, 50)
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  /**
   * Vérifie si un titre de valeur est déjà utilisé
   */
  async function isCoreValueTitleTaken(title: string, excludeId?: string): Promise<boolean> {
    const coreValues = await getCoreValues(true)
    return coreValues.some(
      v => v.title.toLowerCase() === title.toLowerCase() && v.id !== excludeId,
    )
  }

  /**
   * Valide le titre d'une valeur fondamentale
   */
  function validateCoreValueTitle(title: string): boolean {
    return title.trim().length >= 2 && title.trim().length <= 50
  }

  /**
   * Valide la description d'une valeur fondamentale
   */
  function validateCoreValueDescription(description: string): boolean {
    return description.trim().length >= 10 && description.trim().length <= 500
  }

  /**
   * Vérifie si une section peut être modifiée
   */
  function canEditValueSection(section: ValueSection): boolean {
    return section.admin_editable
  }

  /**
   * Obtient le prochain ordre d'affichage pour les valeurs
   */
  async function getNextCoreValueOrder(): Promise<number> {
    const coreValues = await getCoreValues(true)
    const maxOrder = Math.max(...coreValues.map(v => v.display_order), 0)
    return maxOrder + 1
  }

  // ============================================================================
  // INTERNAL HELPERS
  // ============================================================================

  /**
   * Convertit un EditorialContent en ValueSection
   */
  function contentToValueSection(content: EditorialContentRead): ValueSection {
    const key = content.key as ValueSectionKey
    return {
      id: content.id,
      key,
      title: content.description || valueSectionLabels[key] || content.key,
      content: content.value || '',
      value_type: content.value_type,
      category_id: content.category_id,
      display_order: sectionKeys.indexOf(key) + 1,
      admin_editable: content.admin_editable,
      created_at: content.created_at,
      updated_at: content.updated_at,
    }
  }

  /**
   * Convertit un EditorialContent en CoreValue
   */
  function contentToCoreValue(content: EditorialContentRead): CoreValue | null {
    if (!content.value) return null

    try {
      const data = JSON.parse(content.value) as CoreValueData
      return {
        id: content.id,
        title: data.title,
        description: data.description,
        icon: data.icon,
        display_order: data.display_order,
        is_active: data.is_active,
        created_at: content.created_at,
        updated_at: content.updated_at,
      }
    }
    catch {
      console.error('Erreur de parsing JSON pour core value:', content.key)
      return null
    }
  }

  return {
    // Categories
    listCategoriesWithCount,
    getValuesCategory,

    // Generic contents
    listContents,
    getContentById,
    getContentByKey,
    createContent,
    updateContent,
    deleteContent,
    getContentHistory,

    // Value sections
    getValueSections,
    getValueSectionByKey,
    updateValueSection,

    // Core values
    getCoreValues,
    getCoreValueById,
    createCoreValue,
    updateCoreValue,
    deleteCoreValue,
    reorderCoreValues,

    // Statistics
    getValuesStats,

    // History
    getValueHistory,

    // Validation
    isCoreValueTitleTaken,
    validateCoreValueTitle,
    validateCoreValueDescription,
    canEditValueSection,
    getNextCoreValueOrder,

    // Labels & UI helpers
    valueSectionLabels,
    valueSectionDescriptions,
    valueSectionIcons,
    valueSectionColors,
    sectionKeys,
    coreValueAvailableIcons,
  }
}
