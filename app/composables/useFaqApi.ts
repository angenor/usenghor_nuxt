/**
 * Composable pour l'API admin FAQ.
 * Authentification JWT requise (préfixe /api/admin/faq).
 */

import type {
  CategoriesReorderRequest,
  EntriesReorderRequest,
  FaqCategoryAdmin,
  FaqCategoryCreatePayload,
  FaqCategoryUpdatePayload,
  FaqEntriesAdminPage,
  FaqEntryAdminFull,
  FaqEntryCreatePayload,
  FaqEntryUpdatePayload,
} from '~/types/api/faq'

interface CategoriesListResponse {
  categories: FaqCategoryAdmin[]
}

interface PublishResponse {
  id: string
  is_published: boolean
  published_at: string | null
  updated_at: string
}

interface ReorderResponseDto {
  updated: number
}

export function useFaqApi() {
  const { apiFetch } = useApi()

  // ── Catégories ────────────────────────────────────────────────

  async function listCategories(): Promise<FaqCategoryAdmin[]> {
    const response = await apiFetch<CategoriesListResponse>(
      '/api/admin/faq/categories',
    )
    return response.categories
  }

  async function createCategory(
    payload: FaqCategoryCreatePayload,
  ): Promise<FaqCategoryAdmin> {
    return await apiFetch<FaqCategoryAdmin>('/api/admin/faq/categories', {
      method: 'POST',
      body: payload,
    })
  }

  async function updateCategory(
    id: string,
    payload: FaqCategoryUpdatePayload,
  ): Promise<FaqCategoryAdmin> {
    return await apiFetch<FaqCategoryAdmin>(
      `/api/admin/faq/categories/${id}`,
      { method: 'PATCH', body: payload },
    )
  }

  async function deleteCategory(id: string): Promise<void> {
    await apiFetch(`/api/admin/faq/categories/${id}`, { method: 'DELETE' })
  }

  async function reorderCategories(
    payload: CategoriesReorderRequest,
  ): Promise<ReorderResponseDto> {
    return await apiFetch<ReorderResponseDto>(
      '/api/admin/faq/categories/reorder',
      { method: 'PATCH', body: payload },
    )
  }

  // ── Entrées ───────────────────────────────────────────────────

  async function listEntries(params?: {
    category_id?: string
    is_published?: boolean
    q?: string
    page?: number
    page_size?: number
  }): Promise<FaqEntriesAdminPage> {
    return await apiFetch<FaqEntriesAdminPage>('/api/admin/faq/entries', {
      query: params as Record<string, unknown>,
    })
  }

  async function getEntry(id: string): Promise<FaqEntryAdminFull> {
    return await apiFetch<FaqEntryAdminFull>(`/api/admin/faq/entries/${id}`)
  }

  async function createEntry(
    payload: FaqEntryCreatePayload,
  ): Promise<FaqEntryAdminFull> {
    return await apiFetch<FaqEntryAdminFull>('/api/admin/faq/entries', {
      method: 'POST',
      body: payload,
    })
  }

  async function updateEntry(
    id: string,
    payload: FaqEntryUpdatePayload,
  ): Promise<FaqEntryAdminFull> {
    return await apiFetch<FaqEntryAdminFull>(`/api/admin/faq/entries/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  async function deleteEntry(id: string): Promise<void> {
    await apiFetch(`/api/admin/faq/entries/${id}`, { method: 'DELETE' })
  }

  async function setPublished(
    id: string,
    isPublished: boolean,
  ): Promise<PublishResponse> {
    return await apiFetch<PublishResponse>(
      `/api/admin/faq/entries/${id}/publish`,
      { method: 'PATCH', body: { is_published: isPublished } },
    )
  }

  async function reorderEntries(
    payload: EntriesReorderRequest,
  ): Promise<ReorderResponseDto> {
    return await apiFetch<ReorderResponseDto>(
      '/api/admin/faq/entries/reorder',
      { method: 'PATCH', body: payload },
    )
  }

  // ── Helpers ───────────────────────────────────────────────────

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120)
  }

  return {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    listEntries,
    getEntry,
    createEntry,
    updateEntry,
    deleteEntry,
    setPublished,
    reorderEntries,
    slugify,
  }
}
