/**
 * Composable API - Abonnés Newsletter (Admin)
 * =============================================
 *
 * Gestion des abonnés newsletter via l'API backend FastAPI.
 */

import type {
  IdResponse,
  MessageResponse,
  PaginatedResponse,
} from '~/types/api'

// ============================================================================
// Types
// ============================================================================

export type SubscriberSource = 'website_form' | 'manual' | 'import' | 'registration' | 'event'

export interface SubscriberRead {
  id: string
  email: string
  last_name: string | null
  first_name: string | null
  source: SubscriberSource | string
  user_external_id: string | null
  active: boolean
  unsubscribe_token: string | null
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
}

export interface SubscriberCreate {
  email: string
  first_name?: string | null
  last_name?: string | null
  source?: string
}

export interface SubscriberUpdate {
  first_name?: string | null
  last_name?: string | null
  active?: boolean
}

export interface SubscriberFilters {
  search?: string
  active?: boolean
  source?: SubscriberSource | string
  page?: number
  limit?: number
  sort_by?: 'email' | 'last_name' | 'subscribed_at' | 'source'
  sort_order?: 'asc' | 'desc'
}

export interface NewsletterStats {
  total_subscribers: number
  active_subscribers: number
  total_campaigns: number
  sent_campaigns: number
  total_sends: number
  average_open_rate: number
  average_click_rate: number
}

// ============================================================================
// Labels et couleurs
// ============================================================================

export const sourceLabels: Record<string, string> = {
  website_form: 'Site web',
  manual: 'Ajout manuel',
  import: 'Import',
  registration: 'Inscription',
  event: 'Événement',
}

export const sourceColors: Record<string, string> = {
  website_form: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  manual: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  import: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  registration: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  event: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
}

// ============================================================================
// Composable
// ============================================================================

export function useSubscribersApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // CRUD Subscribers
  // =========================================================================

  /**
   * Liste les abonnés avec pagination et filtres.
   */
  async function listSubscribers(params: SubscriberFilters = {}): Promise<PaginatedResponse<SubscriberRead>> {
    return apiFetch<PaginatedResponse<SubscriberRead>>('/api/admin/subscribers', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search,
        active: params.active,
        source: params.source,
        sort_by: params.sort_by || 'subscribed_at',
        sort_order: params.sort_order || 'desc',
      },
    })
  }

  /**
   * Récupère un abonné par son ID.
   */
  async function getSubscriber(id: string): Promise<SubscriberRead> {
    return apiFetch<SubscriberRead>(`/api/admin/subscribers/${id}`)
  }

  /**
   * Crée un nouvel abonné.
   */
  async function createSubscriber(data: SubscriberCreate): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/subscribers', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un abonné.
   */
  async function updateSubscriber(id: string, data: SubscriberUpdate): Promise<SubscriberRead> {
    return apiFetch<SubscriberRead>(`/api/admin/subscribers/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un abonné.
   */
  async function deleteSubscriber(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/subscribers/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Désabonne un abonné (le marque comme inactif).
   */
  async function unsubscribeSubscriber(id: string): Promise<SubscriberRead> {
    return apiFetch<SubscriberRead>(`/api/admin/subscribers/${id}/unsubscribe`, {
      method: 'POST',
    })
  }

  // =========================================================================
  // Statistiques
  // =========================================================================

  /**
   * Récupère les statistiques globales de la newsletter.
   */
  async function getNewsletterStats(): Promise<NewsletterStats> {
    return apiFetch<NewsletterStats>('/api/admin/campaigns/statistics')
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Formate une date pour l'affichage.
   */
  function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  /**
   * Nom complet d'un abonné.
   */
  function getFullName(subscriber: SubscriberRead): string {
    if (subscriber.first_name && subscriber.last_name) {
      return `${subscriber.first_name} ${subscriber.last_name}`
    }
    if (subscriber.first_name) return subscriber.first_name
    if (subscriber.last_name) return subscriber.last_name
    return '-'
  }

  /**
   * Exporte une liste d'abonnés en CSV.
   */
  function exportSubscribersToCSV(subscribers: SubscriberRead[]): string {
    const headers = ['Email', 'Prénom', 'Nom', 'Source', 'Statut', 'Inscrit le']
    const rows = subscribers.map(s => [
      s.email,
      s.first_name || '',
      s.last_name || '',
      sourceLabels[s.source] || s.source,
      s.active ? 'Actif' : 'Désabonné',
      formatDate(s.subscribed_at),
    ])

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  return {
    // CRUD
    listSubscribers,
    getSubscriber,
    createSubscriber,
    updateSubscriber,
    deleteSubscriber,
    unsubscribeSubscriber,

    // Stats
    getNewsletterStats,

    // Helpers
    formatDate,
    getFullName,
    exportSubscribersToCSV,

    // Labels et couleurs
    sourceLabels,
    sourceColors,
  }
}
