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
  Testimonial,
  TestimonialData,
  ValueSection,
  ValueSectionKey,
} from '~/types/api'

// Imports internes pour le composable
import {
  VALUES_CATEGORY_CODE,
  CORE_VALUE_KEY_PREFIX,
  TESTIMONIAL_KEY_PREFIX,
  valueSectionLabels,
  valueSectionDescriptions,
  valueSectionIcons,
  valueSectionColors,
  sectionKeys,
  coreValueAvailableIcons,
  testimonialCivilities,
  testimonialDepartments,
} from '~/composables/editorial-values-config'

import {
  frontOfficePages,
  homepageSections,
  aboutPageSections,
  strategyPageSections,
  organizationPageSections,
  teamPageSections,
  partnersPageSections,
  careersPageSections,
  projectsPageSections,
  alumniPageSections,
  sitePageSections,
  historyPageSections,
} from '~/composables/editorial-pages-config'

export function useEditorialValuesApi() {
  const { apiFetch } = useApi()

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  async function listCategoriesWithCount(): Promise<EditorialCategoryWithCount[]> {
    return apiFetch<EditorialCategoryWithCount[]>('/api/admin/editorial/categories/with-count')
  }

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

  async function listContents(params: {
    page?: number
    limit?: number
    search?: string | null
    category_code?: string | null
    value_type?: EditorialValueType | null
  } = {}): Promise<PaginatedResponse<EditorialContentRead>> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
    }

    if (params.search) {
      query.search = params.search
    }
    if (params.category_code) {
      query.category_code = params.category_code
    }
    if (params.value_type) {
      query.value_type = params.value_type
    }

    return apiFetch<PaginatedResponse<EditorialContentRead>>('/api/admin/editorial/contents', {
      query,
    })
  }

  async function getContentById(id: string): Promise<EditorialContentWithCategory> {
    return apiFetch<EditorialContentWithCategory>(`/api/admin/editorial/contents/${id}`)
  }

  async function getContentByKey(key: string): Promise<EditorialContentWithCategory> {
    return apiFetch<EditorialContentWithCategory>(`/api/admin/editorial/contents/by-key/${key}`)
  }

  async function createContent(data: EditorialContentCreate): Promise<{ id: string }> {
    return apiFetch<{ id: string }>('/api/admin/editorial/contents', {
      method: 'POST',
      body: data,
    })
  }

  async function updateContent(id: string, data: EditorialContentUpdate): Promise<EditorialContentRead> {
    return apiFetch<EditorialContentRead>(`/api/admin/editorial/contents/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteContent(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/editorial/contents/${id}`, {
      method: 'DELETE',
    })
  }

  async function getContentHistory(contentId: string, limit = 50): Promise<EditorialHistoryRead[]> {
    return apiFetch<EditorialHistoryRead[]>(`/api/admin/editorial/contents/${contentId}/history`, {
      query: { limit },
    })
  }

  // ============================================================================
  // VALUE SECTIONS (Mission, Vision, etc.)
  // ============================================================================

  async function getValueSections(): Promise<ValueSection[]> {
    const response = await listContents({
      category_code: VALUES_CATEGORY_CODE,
      limit: 20,
    })

    const sections: ValueSection[] = []
    for (const key of sectionKeys) {
      const content = response.items.find(c => c.key === key)
      if (content) {
        sections.push(contentToValueSection(content))
      }
    }

    return sections.sort((a, b) => a.display_order - b.display_order)
  }

  async function getValueSectionByKey(key: ValueSectionKey): Promise<ValueSection | null> {
    try {
      const content = await getContentByKey(key)
      return contentToValueSection(content)
    }
    catch {
      return null
    }
  }

  async function updateValueSection(id: string, data: { title?: string, content?: string | object }): Promise<ValueSection> {
    const updateData: EditorialContentUpdate = {}
    if (data.title !== undefined) {
      updateData.description = data.title
    }
    if (data.content !== undefined) {
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

  async function getCoreValues(includeInactive = true): Promise<CoreValue[]> {
    const response = await listContents({
      category_code: VALUES_CATEGORY_CODE,
      value_type: 'json',
      limit: 50,
    })

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

  async function getCoreValueById(id: string): Promise<CoreValue | null> {
    try {
      const content = await getContentById(id)
      return contentToCoreValue(content)
    }
    catch {
      return null
    }
  }

  async function createCoreValue(data: CoreValueData, categoryId: string): Promise<CoreValue> {
    const key = `${CORE_VALUE_KEY_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    const response = await createContent({
      key,
      value: JSON.stringify(data),
      value_type: 'json',
      category_id: categoryId,
      description: data.title,
      admin_editable: true,
    })

    const content = await getContentById(response.id)
    return contentToCoreValue(content)!
  }

  async function updateCoreValue(id: string, data: Partial<CoreValueData>): Promise<CoreValue> {
    const current = await getCoreValueById(id)
    if (!current) {
      throw new Error('Valeur non trouvée')
    }

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

  async function deleteCoreValue(id: string): Promise<MessageResponse> {
    return deleteContent(id)
  }

  async function reorderCoreValues(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i]
      if (!id) continue
      const current = await getCoreValueById(id)
      if (current && current.display_order !== i + 1) {
        await updateCoreValue(id, { display_order: i + 1 })
      }
    }
  }

  // ============================================================================
  // TESTIMONIALS (Témoignages alumni)
  // ============================================================================

  async function getTestimonials(includeInactive = true): Promise<Testimonial[]> {
    const response = await listContents({
      category_code: VALUES_CATEGORY_CODE,
      value_type: 'json',
      limit: 100,
    })

    const testimonials: Testimonial[] = []
    for (const content of response.items) {
      if (content.key.startsWith(TESTIMONIAL_KEY_PREFIX)) {
        const testimonial = contentToTestimonial(content)
        if (testimonial && (includeInactive || testimonial.is_active)) {
          testimonials.push(testimonial)
        }
      }
    }

    return testimonials.sort((a, b) => a.display_order - b.display_order)
  }

  async function getTestimonialById(id: string): Promise<Testimonial | null> {
    try {
      const content = await getContentById(id)
      return contentToTestimonial(content)
    }
    catch {
      return null
    }
  }

  async function createTestimonial(data: TestimonialData, categoryId: string): Promise<Testimonial> {
    const key = `${TESTIMONIAL_KEY_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    const response = await createContent({
      key,
      value: JSON.stringify(data),
      value_type: 'json',
      category_id: categoryId,
      description: `${data.first_name} ${data.last_name}`,
      admin_editable: true,
    })

    const content = await getContentById(response.id)
    return contentToTestimonial(content)!
  }

  async function updateTestimonial(id: string, data: Partial<TestimonialData>): Promise<Testimonial> {
    const current = await getTestimonialById(id)
    if (!current) {
      throw new Error('Témoignage non trouvé')
    }

    const newData: TestimonialData = {
      civility: data.civility ?? current.civility,
      first_name: data.first_name ?? current.first_name,
      last_name: data.last_name ?? current.last_name,
      photo: data.photo ?? current.photo,
      graduation_year: data.graduation_year ?? current.graduation_year,
      promotion: data.promotion ?? current.promotion,
      department: data.department ?? current.department,
      current_position_fr: data.current_position_fr ?? current.current_position_fr,
      current_position_en: data.current_position_en ?? current.current_position_en,
      current_position_ar: data.current_position_ar ?? current.current_position_ar,
      organization: data.organization ?? current.organization,
      country: data.country ?? current.country,
      testimonial_fr: data.testimonial_fr ?? current.testimonial_fr,
      testimonial_en: data.testimonial_en ?? current.testimonial_en,
      testimonial_ar: data.testimonial_ar ?? current.testimonial_ar,
      is_featured: data.is_featured ?? current.is_featured,
      is_active: data.is_active ?? current.is_active,
      linkedin: data.linkedin ?? current.linkedin,
      display_order: data.display_order ?? current.display_order,
    }

    const updated = await updateContent(id, {
      value: JSON.stringify(newData),
      description: `${newData.first_name} ${newData.last_name}`,
    })

    return contentToTestimonial(updated)!
  }

  async function deleteTestimonial(id: string): Promise<MessageResponse> {
    return deleteContent(id)
  }

  async function reorderTestimonials(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i]
      if (!id) continue
      const current = await getTestimonialById(id)
      if (current && current.display_order !== i + 1) {
        await updateTestimonial(id, { display_order: i + 1 })
      }
    }
  }

  async function getNextTestimonialOrder(): Promise<number> {
    const testimonials = await getTestimonials(true)
    const maxOrder = Math.max(...testimonials.map(t => t.display_order), 0)
    return maxOrder + 1
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  async function getValuesStats(): Promise<EditorialValuesStats> {
    const [sections, coreValues, testimonials] = await Promise.all([
      getValueSections(),
      getCoreValues(true),
      getTestimonials(true),
    ])

    const activeCoreValues = coreValues.filter(v => v.is_active).length
    const featuredTestimonials = testimonials.filter(t => t.is_featured && t.is_active).length

    const allDates = [
      ...sections.map(s => s.updated_at),
      ...coreValues.map(v => v.updated_at),
      ...testimonials.map(t => t.updated_at),
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
      testimonials_count: testimonials.length,
      featured_testimonials: featuredTestimonials,
      last_updated: lastUpdated,
    }
  }

  // ============================================================================
  // HISTORY
  // ============================================================================

  async function getValueHistory(contentId: string): Promise<EditorialHistoryRead[]> {
    return getContentHistory(contentId, 50)
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  async function isCoreValueTitleTaken(title: string, excludeId?: string): Promise<boolean> {
    const coreValues = await getCoreValues(true)
    return coreValues.some(
      v => v.title.toLowerCase() === title.toLowerCase() && v.id !== excludeId,
    )
  }

  function validateCoreValueTitle(title: string): boolean {
    return title.trim().length >= 2 && title.trim().length <= 50
  }

  function validateCoreValueDescription(description: string): boolean {
    return description.trim().length >= 10 && description.trim().length <= 500
  }

  function canEditValueSection(section: ValueSection): boolean {
    return section.admin_editable
  }

  async function getNextCoreValueOrder(): Promise<number> {
    const coreValues = await getCoreValues(true)
    const maxOrder = Math.max(...coreValues.map(v => v.display_order), 0)
    return maxOrder + 1
  }

  // ============================================================================
  // INTERNAL HELPERS
  // ============================================================================

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

  function contentToTestimonial(content: EditorialContentRead): Testimonial | null {
    if (!content.value) return null

    try {
      const data = JSON.parse(content.value) as TestimonialData
      return {
        id: content.id,
        ...data,
        created_at: content.created_at,
        updated_at: content.updated_at,
      }
    }
    catch {
      console.error('Erreur de parsing JSON pour témoignage:', content.key)
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

    // Testimonials
    getTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    reorderTestimonials,
    getNextTestimonialOrder,

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
    testimonialCivilities,
    testimonialDepartments,

    // Structure par pages (front-office)
    frontOfficePages,
    homepageSections,
    aboutPageSections,
    strategyPageSections,
    organizationPageSections,
    teamPageSections,
    partnersPageSections,
    historyPageSections,
    careersPageSections,
    projectsPageSections,
    alumniPageSections,
    sitePageSections,
  }
}
