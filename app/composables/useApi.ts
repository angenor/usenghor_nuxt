import type { FetchOptions } from 'ofetch'
import { useAuthStore } from '~/stores/auth'

export function useApi() {
  const authStore = useAuthStore()

  async function apiFetch<T>(
    endpoint: string,
    options: FetchOptions & { query?: Record<string, unknown> } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    // Nettoyer les query params (retirer null, undefined, 'all', '')
    const cleanQuery: Record<string, string> = {}
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== null && value !== undefined && value !== 'all' && value !== '') {
          cleanQuery[key] = String(value)
        }
      }
    }

    try {
      return await $fetch<T>(endpoint, {
        ...options,
        headers,
        query: Object.keys(cleanQuery).length > 0 ? cleanQuery : undefined,
      })
    } catch (error: unknown) {
      const fetchError = error as { status?: number; data?: { detail?: string } }

      // Token expiré : tenter un refresh
      if (fetchError.status === 401 && authStore.refreshToken) {
        const refreshed = await authStore.refreshAccessToken()
        if (refreshed) {
          headers['Authorization'] = `Bearer ${authStore.token}`
          return await $fetch<T>(endpoint, {
            ...options,
            headers,
            query: Object.keys(cleanQuery).length > 0 ? cleanQuery : undefined,
          })
        }
        // Refresh échoué → rediriger vers login
        navigateTo('/admin/login')
      }

      throw error
    }
  }

  return { apiFetch }
}
