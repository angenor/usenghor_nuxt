/**
 * Composable API - Inscriptions aux événements
 * =============================================
 *
 * Gestion des inscriptions aux événements via l'API backend FastAPI.
 */

import type {
  EventRegistrationBulkAction,
  EventRegistrationCreate,
  EventRegistrationRead,
  EventRegistrationStats,
  EventRegistrationUpdate,
  MessageResponse,
  RegistrationStatus,
} from '~/types/api'

// ============================================================================
// Labels et couleurs UI
// ============================================================================

export const registrationStatusLabels: Record<RegistrationStatus, string> = {
  registered: 'Inscrit',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  attended: 'Présent',
}

export const registrationStatusColors: Record<RegistrationStatus, string> = {
  registered: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  attended: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

// ============================================================================
// Composable
// ============================================================================

export function useEventRegistrationsApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // CRUD Inscriptions
  // =========================================================================

  /**
   * Liste les inscriptions avec filtres optionnels.
   */
  async function listRegistrations(params: {
    event_id?: string | null
    status?: RegistrationStatus | null
  } = {}): Promise<EventRegistrationRead[]> {
    return apiFetch<EventRegistrationRead[]>('/api/admin/event-registrations', {
      query: {
        event_id: params.event_id || undefined,
        status: params.status || undefined,
      },
    })
  }

  /**
   * Récupère une inscription par son ID.
   */
  async function getRegistrationById(id: string): Promise<EventRegistrationRead> {
    return apiFetch<EventRegistrationRead>(`/api/admin/event-registrations/${id}`)
  }

  /**
   * Crée une nouvelle inscription à un événement.
   */
  async function createRegistration(
    eventId: string,
    data: EventRegistrationCreate,
  ): Promise<EventRegistrationRead> {
    return apiFetch<EventRegistrationRead>('/api/admin/event-registrations', {
      method: 'POST',
      query: { event_id: eventId },
      body: data,
    })
  }

  /**
   * Met à jour une inscription.
   */
  async function updateRegistration(
    id: string,
    data: EventRegistrationUpdate,
  ): Promise<EventRegistrationRead> {
    return apiFetch<EventRegistrationRead>(`/api/admin/event-registrations/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime une inscription.
   */
  async function deleteRegistration(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/event-registrations/${id}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Actions sur le statut
  // =========================================================================

  /**
   * Confirme une inscription.
   */
  async function confirmRegistration(id: string): Promise<EventRegistrationRead> {
    return apiFetch<EventRegistrationRead>(`/api/admin/event-registrations/${id}/confirm`, {
      method: 'POST',
    })
  }

  /**
   * Annule une inscription.
   */
  async function cancelRegistration(id: string): Promise<EventRegistrationRead> {
    return apiFetch<EventRegistrationRead>(`/api/admin/event-registrations/${id}/cancel`, {
      method: 'POST',
    })
  }

  /**
   * Effectue une action en masse sur les inscriptions.
   */
  async function bulkAction(data: EventRegistrationBulkAction): Promise<MessageResponse> {
    return apiFetch<MessageResponse>('/api/admin/event-registrations/bulk-action', {
      method: 'POST',
      body: data,
    })
  }

  // =========================================================================
  // Helpers / Statistiques
  // =========================================================================

  /**
   * Calcule les statistiques à partir d'une liste d'inscriptions.
   */
  function computeStats(
    registrations: EventRegistrationRead[],
    capacity?: number,
  ): EventRegistrationStats {
    const stats: EventRegistrationStats = {
      total: registrations.length,
      registered: registrations.filter(r => r.status === 'registered').length,
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      cancelled: registrations.filter(r => r.status === 'cancelled').length,
      attended: registrations.filter(r => r.status === 'attended').length,
      capacity,
      available_spots: undefined,
    }

    if (capacity) {
      const activeCount = stats.total - stats.cancelled
      stats.available_spots = Math.max(0, capacity - activeCount)
    }

    return stats
  }

  /**
   * Formate la date d'inscription pour l'affichage.
   */
  function formatRegistrationDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Génère un nom complet à partir du prénom et nom.
   */
  function getFullName(registration: EventRegistrationRead): string {
    const parts = [registration.first_name, registration.last_name].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : registration.email
  }

  return {
    // CRUD
    listRegistrations,
    getRegistrationById,
    createRegistration,
    updateRegistration,
    deleteRegistration,

    // Actions statut
    confirmRegistration,
    cancelRegistration,
    bulkAction,

    // Helpers
    computeStats,
    formatRegistrationDate,
    getFullName,

    // Labels & Colors
    registrationStatusLabels,
    registrationStatusColors,
  }
}
