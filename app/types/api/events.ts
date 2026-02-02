/**
 * Types pour les événements et inscriptions
 */

import type { PublicationStatus } from './common'

// ============================================================================
// Enums
// ============================================================================

export type EventType = 'conference' | 'workshop' | 'ceremony' | 'seminar' | 'symposium' | 'other'
export type RegistrationStatus = 'registered' | 'confirmed' | 'cancelled' | 'attended'

// ============================================================================
// Event Registration
// ============================================================================

export interface EventRegistrationRead {
  id: string
  event_id: string
  user_external_id: string | null
  last_name: string | null
  first_name: string | null
  email: string
  phone: string | null
  organization: string | null
  status: RegistrationStatus
  registered_at: string
}

export interface EventRegistrationCreate {
  last_name?: string | null
  first_name?: string | null
  email: string
  phone?: string | null
  organization?: string | null
  user_external_id?: string | null
}

export interface EventRegistrationUpdate {
  last_name?: string | null
  first_name?: string | null
  phone?: string | null
  organization?: string | null
  status?: RegistrationStatus
}

export interface EventRegistrationBulkAction {
  registration_ids: string[]
  action: 'confirm' | 'cancel'
}

export interface EventRegistrationStats {
  total: number
  registered: number
  confirmed: number
  cancelled: number
  attended: number
  capacity?: number
  available_spots?: number
}

// ============================================================================
// Event Read
// ============================================================================

export interface EventRead {
  id: string
  title: string
  slug: string
  description: string | null
  content: string | null
  cover_image_external_id: string | null
  country_external_id: string | null
  campus_external_id: string | null
  service_external_id: string | null
  project_external_id: string | null
  organizer_external_id: string | null
  album_external_id: string | null
  type: EventType
  type_other: string | null
  start_date: string
  end_date: string | null
  venue: string | null
  address: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  is_online: boolean
  video_conference_link: string | null
  registration_required: boolean
  registration_link: string | null
  max_attendees: number | null
  status: PublicationStatus
  created_at: string
  updated_at: string
}

export interface EventWithRegistrations extends EventRead {
  registrations: EventRegistrationRead[]
  registrations_count: number
}

// ============================================================================
// Event Create / Update
// ============================================================================

export interface EventCreatePayload {
  title: string
  slug: string
  description?: string | null
  content?: string | null
  cover_image_external_id?: string | null
  country_external_id?: string | null
  campus_external_id?: string | null
  service_external_id?: string | null
  project_external_id?: string | null
  organizer_external_id?: string | null
  album_external_id?: string | null
  type: EventType
  type_other?: string | null
  start_date: string
  end_date?: string | null
  venue?: string | null
  address?: string | null
  city?: string | null
  latitude?: number | null
  longitude?: number | null
  is_online?: boolean
  video_conference_link?: string | null
  registration_required?: boolean
  registration_link?: string | null
  max_attendees?: number | null
  status?: PublicationStatus
}

export interface EventUpdatePayload {
  title?: string
  slug?: string
  description?: string | null
  content?: string | null
  cover_image_external_id?: string | null
  country_external_id?: string | null
  campus_external_id?: string | null
  service_external_id?: string | null
  project_external_id?: string | null
  organizer_external_id?: string | null
  album_external_id?: string | null
  type?: EventType
  type_other?: string | null
  start_date?: string
  end_date?: string | null
  venue?: string | null
  address?: string | null
  city?: string | null
  latitude?: number | null
  longitude?: number | null
  is_online?: boolean
  video_conference_link?: string | null
  registration_required?: boolean
  registration_link?: string | null
  max_attendees?: number | null
  status?: PublicationStatus
}

// ============================================================================
// Event Statistics
// ============================================================================

export interface EventTimelineDataPoint {
  period: string
  count: number
}

export interface EventStatistics {
  total: number
  published: number
  draft: number
  archived: number
  upcoming: number
  past: number
  by_type: Record<EventType, number>
  timeline: EventTimelineDataPoint[]
}
