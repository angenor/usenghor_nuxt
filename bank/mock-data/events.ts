/**
 * Mock Data: Événements (Admin)
 * Gestion complète des événements pour le back-office
 */

import type { EditorJSContent } from './news'

export type EventType = 'conference' | 'workshop' | 'ceremony' | 'seminar' | 'symposium' | 'other'
export type EventStatus = 'draft' | 'published' | 'archived'

export interface EventPartner {
  id: string
  event_id: string
  partner_id: string
  partner_name: string
  partner_logo?: string
  display_order: number
}

export interface Event {
  id: string
  external_id: string
  title: string
  slug: string
  type: EventType
  type_other?: string
  description?: string
  /** Contenu riche FR (EditorJS format) */
  content?: EditorJSContent
  /** Contenu riche EN (EditorJS format) */
  content_en?: EditorJSContent
  /** Contenu riche AR (EditorJS format) */
  content_ar?: EditorJSContent
  /** Contenu HTML legacy (pour migration) */
  content_html?: string
  cover_image?: string

  // Dates
  start_date: string
  end_date?: string

  // Lieu
  is_online: boolean
  video_conference_link?: string
  venue?: string
  address?: string
  city?: string
  country?: string
  country_external_id?: string
  latitude?: number
  longitude?: number

  // Inscriptions
  registration_required: boolean
  registration_link?: string
  max_attendees?: number
  registrations_count: number

  // Associations
  campus_id?: string
  campus_name?: string
  sector_id?: string
  sector_name?: string
  service_id?: string
  service_name?: string
  project_id?: string
  project_name?: string
  organizer_id?: string
  organizer_name?: string
  album_id?: string
  album_name?: string

  // Partenaires
  partners?: EventPartner[]

  // Publication
  status: EventStatus

  // Métadonnées
  created_at: string
  updated_at: string
  created_by?: string
}

export interface EventStats {
  total: number
  published: number
  draft: number
  archived: number
  upcoming: number
  past: number
  online: number
  registrations_total: number
}

// Labels pour les types
export const eventTypeLabels: Record<EventType, string> = {
  conference: 'Conférence',
  workshop: 'Atelier',
  ceremony: 'Cérémonie',
  seminar: 'Séminaire',
  symposium: 'Colloque',
  other: 'Autre'
}

// Couleurs pour les types
export const eventTypeColors: Record<EventType, string> = {
  conference: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  workshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  ceremony: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  seminar: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  symposium: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// Labels pour les statuts
export const eventStatusLabels: Record<EventStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé'
}

// Couleurs pour les statuts
export const eventStatusColors: Record<EventStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// Génération d'ID
export const generateEventId = () => `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
export const generateEventPartnerId = () => `event-partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Mock data
export const mockEvents: Event[] = [
  {
    id: 'event-admin-1',
    external_id: 'ext-event-1',
    title: 'Conférence inaugurale : L\'avenir de la Francophonie en Afrique',
    slug: 'conference-inaugurale-francophonie-afrique-2026',
    type: 'conference',
    description: 'Grande conférence réunissant des experts internationaux pour discuter des enjeux et perspectives de la Francophonie africaine.',
    content: '<p>Cette conférence exceptionnelle réunira des experts internationaux, des décideurs politiques et des acteurs du développement pour discuter des enjeux majeurs de la Francophonie en Afrique.</p><h3>Thèmes abordés</h3><ul><li>L\'avenir de la langue française en Afrique</li><li>Les défis de l\'éducation francophone</li><li>La coopération universitaire</li></ul>',
    cover_image: null,
    start_date: '2026-01-25T09:00:00Z',
    end_date: '2026-01-25T17:00:00Z',
    is_online: false,
    venue: 'Amphithéâtre Léopold Sédar Senghor',
    address: '1 Place Ahmed Orabi',
    city: 'Alexandrie',
    country: 'Égypte',
    country_external_id: 'country-eg',
    latitude: 31.2001,
    longitude: 29.9187,
    registration_required: true,
    max_attendees: 300,
    registrations_count: 187,
    campus_id: 'siege',
    campus_name: 'Siège - Alexandrie',
    service_id: 'dept-francophonie',
    service_name: 'Francophonie et Mondialisation',
    organizer_id: 'user-1',
    organizer_name: 'Dr. Amadou Diallo',
    status: 'published',
    partners: [
      { id: 'ep-1', event_id: 'event-admin-1', partner_id: 'oif', partner_name: 'Organisation Internationale de la Francophonie', display_order: 1 },
      { id: 'ep-2', event_id: 'event-admin-1', partner_id: 'auf', partner_name: 'Agence Universitaire de la Francophonie', display_order: 2 }
    ],
    created_at: '2025-11-15T10:00:00Z',
    updated_at: '2025-12-20T14:30:00Z'
  },
  {
    id: 'event-admin-2',
    external_id: 'ext-event-2',
    title: 'Atelier de formation en leadership',
    slug: 'atelier-formation-leadership-2026',
    type: 'workshop',
    description: 'Atelier intensif de trois jours sur le développement du leadership pour les futurs décideurs africains.',
    content: '<p>Cet atelier intensif permettra aux participants de développer leurs compétences en leadership et management.</p>',
    cover_image: null,
    start_date: '2026-02-10T09:00:00Z',
    end_date: '2026-02-12T17:00:00Z',
    is_online: false,
    venue: 'Salle de conférence A',
    address: 'Bâtiment A, Université Senghor',
    city: 'Alexandrie',
    country: 'Égypte',
    registration_required: true,
    max_attendees: 30,
    registrations_count: 28,
    campus_id: 'siege',
    campus_name: 'Siège - Alexandrie',
    organizer_id: 'user-2',
    organizer_name: 'Prof. Fatou Ndiaye',
    status: 'published',
    created_at: '2025-12-01T09:00:00Z',
    updated_at: '2025-12-15T11:00:00Z'
  },
  {
    id: 'event-admin-3',
    external_id: 'ext-event-3',
    title: 'Cérémonie de remise des diplômes 2025',
    slug: 'ceremonie-remise-diplomes-2025',
    type: 'ceremony',
    description: 'Cérémonie officielle de remise des diplômes pour la promotion 2025 en présence des autorités académiques et des partenaires.',
    cover_image: null,
    start_date: '2026-02-28T14:00:00Z',
    end_date: '2026-02-28T18:00:00Z',
    is_online: true,
    video_conference_link: 'https://meet.usenghor.org/graduation-2025',
    venue: 'Bibliotheca Alexandrina',
    address: 'El Shatby',
    city: 'Alexandrie',
    country: 'Égypte',
    registration_required: true,
    max_attendees: 500,
    registrations_count: 423,
    campus_id: 'siege',
    campus_name: 'Siège - Alexandrie',
    organizer_id: 'user-1',
    organizer_name: 'Dr. Amadou Diallo',
    status: 'published',
    created_at: '2025-10-01T08:00:00Z',
    updated_at: '2026-01-10T16:00:00Z'
  },
  {
    id: 'event-admin-4',
    external_id: 'ext-event-4',
    title: 'Séminaire international sur la gouvernance',
    slug: 'seminaire-international-gouvernance-2026',
    type: 'seminar',
    description: 'Séminaire réunissant chercheurs et praticiens autour des questions de gouvernance en Afrique francophone.',
    cover_image: null,
    start_date: '2026-03-15T09:00:00Z',
    end_date: '2026-03-16T17:00:00Z',
    is_online: false,
    venue: 'Amphithéâtre Léopold Sédar Senghor',
    city: 'Alexandrie',
    country: 'Égypte',
    registration_required: true,
    max_attendees: 150,
    registrations_count: 67,
    campus_id: 'siege',
    campus_name: 'Siège - Alexandrie',
    service_id: 'dept-gouvernance',
    service_name: 'Gouvernance et Management Public',
    status: 'published',
    created_at: '2025-12-10T10:00:00Z',
    updated_at: '2026-01-05T09:00:00Z'
  },
  {
    id: 'event-admin-5',
    external_id: 'ext-event-5',
    title: 'Journée portes ouvertes',
    slug: 'journee-portes-ouvertes-avril-2026',
    type: 'other',
    type_other: 'Portes ouvertes',
    description: 'Découvrez nos formations et rencontrez nos équipes pédagogiques lors de cette journée exceptionnelle.',
    cover_image: null,
    start_date: '2026-04-05T10:00:00Z',
    end_date: '2026-04-05T16:00:00Z',
    is_online: true,
    video_conference_link: 'https://meet.usenghor.org/open-day',
    venue: 'Université Senghor',
    city: 'Alexandrie',
    country: 'Égypte',
    registration_required: false,
    registrations_count: 0,
    campus_id: 'siege',
    campus_name: 'Siège - Alexandrie',
    status: 'draft',
    created_at: '2026-01-15T14:00:00Z',
    updated_at: '2026-01-20T10:00:00Z'
  },
  {
    id: 'event-admin-6',
    external_id: 'ext-event-6',
    title: 'Colloque : Politiques culturelles et développement durable',
    slug: 'colloque-politiques-culturelles-2026',
    type: 'symposium',
    description: 'Colloque interdisciplinaire explorant le rôle des politiques culturelles dans l\'atteinte des objectifs de développement durable.',
    cover_image: null,
    start_date: '2026-05-20T09:00:00Z',
    end_date: '2026-05-22T17:00:00Z',
    is_online: false,
    venue: 'Centre de conférences',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    registration_required: true,
    max_attendees: 200,
    registrations_count: 45,
    campus_id: 'campus-abidjan',
    campus_name: 'Campus Abidjan',
    service_id: 'dept-culture',
    service_name: 'Culture et Patrimoine',
    status: 'published',
    created_at: '2026-01-05T11:00:00Z',
    updated_at: '2026-01-18T15:00:00Z'
  },
  {
    id: 'event-admin-7',
    external_id: 'ext-event-7',
    title: 'Webinaire : Intelligence artificielle et éducation en Afrique',
    slug: 'webinaire-ia-education-afrique',
    type: 'conference',
    description: 'Webinaire sur les applications de l\'IA dans l\'enseignement supérieur en Afrique.',
    cover_image: null,
    start_date: '2026-02-15T14:00:00Z',
    end_date: '2026-02-15T16:00:00Z',
    is_online: true,
    video_conference_link: 'https://zoom.us/j/123456789',
    registration_required: true,
    max_attendees: 500,
    registrations_count: 312,
    campus_id: 'siege',
    campus_name: 'Siège - Alexandrie',
    status: 'published',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-01-22T11:00:00Z'
  },
  {
    id: 'event-admin-8',
    external_id: 'ext-event-8',
    title: 'Forum des alumni 2026',
    slug: 'forum-alumni-2026',
    type: 'other',
    type_other: 'Forum',
    description: 'Rencontre annuelle des anciens étudiants pour échanger et renforcer le réseau Senghor.',
    cover_image: null,
    start_date: '2026-06-15T09:00:00Z',
    end_date: '2026-06-15T18:00:00Z',
    is_online: false,
    venue: 'Hôtel Sofitel',
    city: 'Alexandrie',
    country: 'Égypte',
    registration_required: true,
    max_attendees: 250,
    registrations_count: 0,
    campus_id: 'siege',
    campus_name: 'Siège - Alexandrie',
    status: 'draft',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z'
  },
  // Événement passé
  {
    id: 'event-admin-9',
    external_id: 'ext-event-9',
    title: 'Conférence sur l\'intelligence artificielle et l\'éducation',
    slug: 'conference-ia-education-dec-2025',
    type: 'conference',
    description: 'Conférence sur les applications de l\'IA dans l\'enseignement supérieur en Afrique.',
    cover_image: null,
    start_date: '2025-12-05T09:00:00Z',
    end_date: '2025-12-05T17:00:00Z',
    is_online: false,
    venue: 'Amphithéâtre Léopold Sédar Senghor',
    city: 'Alexandrie',
    country: 'Égypte',
    registration_required: true,
    max_attendees: 200,
    registrations_count: 178,
    campus_id: 'siege',
    campus_name: 'Siège - Alexandrie',
    status: 'archived',
    created_at: '2025-10-01T08:00:00Z',
    updated_at: '2025-12-10T09:00:00Z'
  },
  {
    id: 'event-admin-10',
    external_id: 'ext-event-10',
    title: 'Atelier entrepreneuriat africain',
    slug: 'atelier-entrepreneuriat-nov-2025',
    type: 'workshop',
    description: 'Atelier pratique sur l\'entrepreneuriat et l\'innovation en Afrique.',
    cover_image: null,
    start_date: '2025-11-18T09:00:00Z',
    end_date: '2025-11-19T17:00:00Z',
    is_online: false,
    venue: 'Salle de conférence B',
    city: 'Alexandrie',
    country: 'Égypte',
    registration_required: true,
    max_attendees: 40,
    registrations_count: 38,
    campus_id: 'siege',
    campus_name: 'Siège - Alexandrie',
    status: 'archived',
    created_at: '2025-09-15T10:00:00Z',
    updated_at: '2025-11-25T14:00:00Z'
  }
]

// Fonctions utilitaires
export const getAllEvents = () =>
  [...mockEvents].sort((a, b) =>
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )

export const getEventById = (id: string) =>
  mockEvents.find(e => e.id === id)

export const getEventBySlug = (slug: string) =>
  mockEvents.find(e => e.slug === slug)

export const getEventStats = (): EventStats => {
  const now = new Date()
  return {
    total: mockEvents.length,
    published: mockEvents.filter(e => e.status === 'published').length,
    draft: mockEvents.filter(e => e.status === 'draft').length,
    archived: mockEvents.filter(e => e.status === 'archived').length,
    upcoming: mockEvents.filter(e => new Date(e.start_date) > now).length,
    past: mockEvents.filter(e => new Date(e.start_date) <= now).length,
    online: mockEvents.filter(e => e.is_online).length,
    registrations_total: mockEvents.reduce((sum, e) => sum + e.registrations_count, 0)
  }
}

export interface EventFilters {
  type?: EventType
  status?: EventStatus
  period?: 'upcoming' | 'past' | 'all'
  campus_id?: string
  sector_id?: string
  service_id?: string
  project_id?: string
  search?: string
}

export const getFilteredEvents = (filters?: EventFilters) => {
  let result = [...mockEvents]
  const now = new Date()

  if (filters?.type) {
    result = result.filter(e => e.type === filters.type)
  }

  if (filters?.status) {
    result = result.filter(e => e.status === filters.status)
  }

  if (filters?.period === 'upcoming') {
    result = result.filter(e => new Date(e.start_date) > now)
  } else if (filters?.period === 'past') {
    result = result.filter(e => new Date(e.start_date) <= now)
  }

  if (filters?.campus_id) {
    result = result.filter(e => e.campus_id === filters.campus_id)
  }

  if (filters?.sector_id) {
    result = result.filter(e => e.sector_id === filters.sector_id)
  }

  if (filters?.service_id) {
    result = result.filter(e => e.service_id === filters.service_id)
  }

  if (filters?.project_id) {
    result = result.filter(e => e.project_id === filters.project_id)
  }

  if (filters?.search) {
    const query = filters.search.toLowerCase()
    result = result.filter(e =>
      e.title.toLowerCase().includes(query) ||
      e.slug.toLowerCase().includes(query) ||
      e.description?.toLowerCase().includes(query) ||
      e.venue?.toLowerCase().includes(query) ||
      e.city?.toLowerCase().includes(query)
    )
  }

  return result.sort((a, b) =>
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )
}

// Slugify
export const slugifyEvent = (title: string) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
