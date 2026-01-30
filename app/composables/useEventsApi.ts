/**
 * Composable API - Événements
 * ===========================
 *
 * Gestion des événements via l'API backend FastAPI.
 */

import type {
  EventCreatePayload,
  EventRead,
  EventType,
  EventUpdatePayload,
  EventWithRegistrations,
  IdResponse,
  MessageResponse,
  PaginatedResponse,
  PublicationStatus,
} from '~/types/api'

// ============================================================================
// Labels et couleurs UI
// ============================================================================

export const eventTypeLabels: Record<EventType, string> = {
  conference: 'Conférence',
  workshop: 'Atelier',
  ceremony: 'Cérémonie',
  seminar: 'Séminaire',
  symposium: 'Colloque',
  other: 'Autre',
}

export const eventTypeColors: Record<EventType, string> = {
  conference: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  workshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  ceremony: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  seminar: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  symposium: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export const eventStatusLabels: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

export const eventStatusColors: Record<PublicationStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

// ============================================================================
// Composable
// ============================================================================

export function useEventsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // CRUD Événements
  // =========================================================================

  /**
   * Liste les événements avec pagination et filtres.
   */
  async function listEvents(params: {
    page?: number
    limit?: number
    search?: string
    status?: PublicationStatus | 'all'
    event_type?: EventType | 'all'
    from_date?: string
    to_date?: string
    campus_id?: string | 'all'
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  } = {}): Promise<PaginatedResponse<EventRead>> {
    return apiFetch<PaginatedResponse<EventRead>>('/api/admin/events', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search,
        status: params.status !== 'all' ? params.status : undefined,
        event_type: params.event_type !== 'all' ? params.event_type : undefined,
        from_date: params.from_date,
        to_date: params.to_date,
        campus_id: params.campus_id !== 'all' ? params.campus_id : undefined,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      },
    })
  }

  /**
   * Récupère un événement par son ID avec ses inscriptions.
   */
  async function getEventById(id: string): Promise<EventWithRegistrations> {
    return apiFetch<EventWithRegistrations>(`/api/admin/events/${id}`)
  }

  /**
   * Crée un nouvel événement.
   */
  async function createEvent(data: EventCreatePayload): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/events', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un événement.
   */
  async function updateEvent(id: string, data: EventUpdatePayload): Promise<EventRead> {
    return apiFetch<EventRead>(`/api/admin/events/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un événement.
   */
  async function deleteEvent(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/events/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Publie un événement.
   */
  async function publishEvent(id: string): Promise<EventRead> {
    return apiFetch<EventRead>(`/api/admin/events/${id}/publish`, {
      method: 'POST',
    })
  }

  /**
   * Annule/archive un événement.
   */
  async function cancelEvent(id: string): Promise<EventRead> {
    return apiFetch<EventRead>(`/api/admin/events/${id}/cancel`, {
      method: 'POST',
    })
  }

  /**
   * Duplique un événement avec un nouveau slug.
   */
  async function duplicateEvent(id: string, newSlug: string): Promise<IdResponse> {
    return apiFetch<IdResponse>(`/api/admin/events/${id}/duplicate`, {
      method: 'POST',
      query: { new_slug: newSlug },
    })
  }

  // =========================================================================
  // Media Library
  // =========================================================================

  /**
   * Liste les albums d'un événement.
   */
  async function getEventAlbums(eventId: string): Promise<string[]> {
    return apiFetch<string[]>(`/api/admin/events/${eventId}/media-library`)
  }

  /**
   * Ajoute un album à la médiathèque d'un événement.
   */
  async function addEventAlbum(eventId: string, albumId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/events/${eventId}/media-library`, {
      method: 'POST',
      body: { album_external_id: albumId },
    })
  }

  /**
   * Retire un album de la médiathèque d'un événement.
   */
  async function removeEventAlbum(eventId: string, albumId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/events/${eventId}/media-library/${albumId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Génère un slug à partir du titre.
   */
  function slugifyEvent(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  /**
   * Formate une date ISO en format datetime-local pour les inputs.
   */
  function toDatetimeLocal(isoDate: string | null | undefined): string {
    if (!isoDate) return ''
    return isoDate.slice(0, 16)
  }

  /**
   * Formate une date pour l'affichage.
   */
  function formatEventDate(isoDate: string | null | undefined): string {
    if (!isoDate) return ''
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Vérifie si un événement est passé.
   */
  function isEventPast(startDate: string): boolean {
    return new Date(startDate) < new Date()
  }

  /**
   * Vérifie si un événement est proche (dans les 7 prochains jours).
   */
  function isEventSoon(startDate: string): boolean {
    const eventDate = new Date(startDate)
    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return eventDate > now && eventDate <= sevenDaysLater
  }

  return {
    // CRUD
    listEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    publishEvent,
    cancelEvent,
    duplicateEvent,

    // Media Library
    getEventAlbums,
    addEventAlbum,
    removeEventAlbum,

    // Helpers
    slugifyEvent,
    toDatetimeLocal,
    formatEventDate,
    isEventPast,
    isEventSoon,

    // Labels & Colors
    eventTypeLabels,
    eventTypeColors,
    eventStatusLabels,
    eventStatusColors,
  }
}
