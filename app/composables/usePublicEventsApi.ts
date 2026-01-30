/**
 * Composable API - Événements Publics
 * ====================================
 *
 * Récupère les événements publiés depuis l'API backend FastAPI.
 * Version publique (sans authentification).
 */

import type { PaginatedResponse } from '~/types/api'

// ============================================================================
// Types
// ============================================================================

export type EventType = 'conference' | 'workshop' | 'ceremony' | 'seminar' | 'symposium' | 'other'

export interface EventPublic {
  id: string
  title: string
  slug: string
  description: string | null
  type: EventType
  type_other: string | null
  start_date: string
  end_date: string | null
  venue: string | null
  city: string | null
  is_online: boolean
  registration_required: boolean
  max_attendees: number | null
  cover_image_external_id: string | null
  // Champs transformés pour l'affichage
  cover_image?: string | null
}

export interface EventRegistration {
  last_name?: string | null
  first_name?: string | null
  email: string
  phone?: string | null
  organization?: string | null
  user_external_id?: string | null
}

// ============================================================================
// Composable
// ============================================================================

export function usePublicEventsApi() {
  const baseURL = useApiBase()

  // =========================================================================
  // Transformations
  // =========================================================================

  /**
   * Transforme EventPublic (backend) en ajoutant des champs dérivés.
   */
  function transformEventForDisplay(event: EventPublic): EventPublic {
    return {
      ...event,
      cover_image: event.cover_image_external_id
        ? `https://picsum.photos/seed/${event.cover_image_external_id}/1200/600`
        : null,
    }
  }

  // =========================================================================
  // API Publique
  // =========================================================================

  /**
   * Liste les événements publiés avec pagination et filtres.
   */
  async function listPublishedEvents(params: {
    page?: number
    limit?: number
    from_date?: string
    to_date?: string
    campus_id?: string
    upcoming?: boolean
  } = {}): Promise<PaginatedResponse<EventPublic>> {
    const query: Record<string, string> = {
      page: String(params.page || 1),
      limit: String(params.limit || 20),
    }

    if (params.from_date) query.from_date = params.from_date
    if (params.to_date) query.to_date = params.to_date
    if (params.campus_id) query.campus_id = params.campus_id
    if (params.upcoming !== undefined) query.upcoming = String(params.upcoming)

    const response = await $fetch<PaginatedResponse<EventPublic>>(`${baseURL}/api/public/events`, {
      query,
    })

    return {
      ...response,
      items: response.items.map(transformEventForDisplay),
    }
  }

  /**
   * Récupère un événement publié par son slug.
   */
  async function getEventBySlug(slug: string): Promise<EventPublic | null> {
    try {
      const event = await $fetch<EventPublic>(`${baseURL}/api/public/events/${slug}`)
      return transformEventForDisplay(event)
    }
    catch (error) {
      console.error('Erreur lors de la récupération de l\'événement:', error)
      return null
    }
  }

  /**
   * Récupère les événements à venir.
   */
  async function getUpcomingEvents(limit: number = 20): Promise<EventPublic[]> {
    const response = await listPublishedEvents({ limit, upcoming: true })
    return response.items
  }

  /**
   * Récupère les événements passés.
   */
  async function getPastEvents(limit: number = 20): Promise<EventPublic[]> {
    const now = new Date()
    const response = await listPublishedEvents({
      limit,
      to_date: now.toISOString(),
      upcoming: false,
    })
    return response.items
  }

  /**
   * Récupère tous les événements publiés (sans pagination).
   */
  async function getAllPublishedEvents(maxLimit: number = 100): Promise<EventPublic[]> {
    const response = await listPublishedEvents({ limit: maxLimit })
    return response.items
  }

  /**
   * S'inscrit à un événement.
   */
  async function registerToEvent(eventId: string, registration: EventRegistration): Promise<any> {
    return await $fetch(`${baseURL}/api/public/events/${eventId}/register`, {
      method: 'POST',
      body: registration,
    })
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Formate une date pour l'affichage.
   */
  function formatEventDate(isoDate: string | null | undefined, locale: string = 'fr-FR'): string {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  /**
   * Formate une date courte pour l'affichage.
   */
  function formatShortDate(isoDate: string | null | undefined, locale: string = 'fr-FR'): string {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
    })
  }

  /**
   * Vérifie si un événement est à venir.
   */
  function isUpcoming(event: EventPublic): boolean {
    const now = new Date()
    const startDate = new Date(event.start_date)
    return startDate > now
  }

  /**
   * Vérifie si un événement est passé.
   */
  function isPast(event: EventPublic): boolean {
    const now = new Date()
    const endDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date)
    return endDate < now
  }

  return {
    // API Publique
    listPublishedEvents,
    getEventBySlug,
    getUpcomingEvents,
    getPastEvents,
    getAllPublishedEvents,
    registerToEvent,

    // Transformations
    transformEventForDisplay,

    // Helpers
    formatEventDate,
    formatShortDate,
    isUpcoming,
    isPast,
  }
}
