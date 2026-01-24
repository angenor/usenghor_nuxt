/**
 * Mock Data: Albums (Admin)
 * Tables SQL: media, albums, album_media
 */

import { mockCampusMedia, type CampusMedia } from './campus-media'

// === TYPES ===

export type MediaType = 'image' | 'video' | 'audio' | 'document'
export type PublicationStatus = 'draft' | 'published'

export interface MediaAdmin {
  id: string
  name: string
  description?: string
  type: MediaType
  url: string
  thumbnail?: string
  is_external_url: boolean
  size_bytes?: number
  mime_type?: string
  width?: number
  height?: number
  duration_seconds?: number
  alt_text?: string
  credits?: string
  created_at: string
  updated_at: string
}

export interface AlbumAdmin {
  id: string
  title: string
  description?: string
  status: PublicationStatus
  cover_media_id?: string
  cover_media?: MediaAdmin
  media_count: number
  created_at: string
  updated_at: string
}

export interface AlbumMediaAdmin {
  album_id: string
  media_id: string
  display_order: number
}

export interface AlbumStats {
  total: number
  published: number
  draft: number
  totalMedia: number
}

export interface AlbumFilters {
  search?: string
  status?: PublicationStatus | 'all'
}

export interface AlbumUsage {
  events: number
  services: number
  campus: number
  projects: number
}

// === DONNÉES MOCK ===

// Convertir les médias campus existants en format MediaAdmin
export const mockMediaAdmin: MediaAdmin[] = [
  // Médias génériques pour la médiathèque
  {
    id: 'media-001',
    name: 'Vue aérienne campus Alexandrie',
    description: 'Photo drone du campus principal',
    type: 'image',
    url: 'https://picsum.photos/seed/media001/1200/800',
    thumbnail: 'https://picsum.photos/seed/media001/400/300',
    is_external_url: false,
    size_bytes: 2450000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Vue aérienne du campus d\'Alexandrie',
    credits: 'Service Communication USenghor',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'media-002',
    name: 'Bibliothèque universitaire',
    description: 'Intérieur de la bibliothèque centrale',
    type: 'image',
    url: 'https://picsum.photos/seed/media002/1200/800',
    thumbnail: 'https://picsum.photos/seed/media002/400/300',
    is_external_url: false,
    size_bytes: 1850000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Bibliothèque universitaire',
    credits: 'USenghor',
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-02-20T14:30:00Z'
  },
  {
    id: 'media-003',
    name: 'Amphithéâtre principal',
    description: 'Grand amphithéâtre lors d\'une conférence',
    type: 'image',
    url: 'https://picsum.photos/seed/media003/1200/800',
    thumbnail: 'https://picsum.photos/seed/media003/400/300',
    is_external_url: false,
    size_bytes: 2100000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Amphithéâtre principal',
    created_at: '2024-03-10T09:00:00Z',
    updated_at: '2024-03-10T09:00:00Z'
  },
  {
    id: 'media-004',
    name: 'Cérémonie de remise des diplômes 2024',
    description: 'Photos de la cérémonie officielle',
    type: 'image',
    url: 'https://picsum.photos/seed/media004/1200/800',
    thumbnail: 'https://picsum.photos/seed/media004/400/300',
    is_external_url: false,
    size_bytes: 3200000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Remise des diplômes 2024',
    credits: 'Photo officielle USenghor',
    created_at: '2024-12-15T16:00:00Z',
    updated_at: '2024-12-15T16:00:00Z'
  },
  {
    id: 'media-005',
    name: 'Diplômés promotion 2024 - groupe',
    type: 'image',
    url: 'https://picsum.photos/seed/media005/1200/800',
    thumbnail: 'https://picsum.photos/seed/media005/400/300',
    is_external_url: false,
    size_bytes: 2800000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Photo de groupe des diplômés 2024',
    created_at: '2024-12-15T17:00:00Z',
    updated_at: '2024-12-15T17:00:00Z'
  },
  {
    id: 'media-006',
    name: 'Discours du Recteur',
    type: 'image',
    url: 'https://picsum.photos/seed/media006/1200/800',
    thumbnail: 'https://picsum.photos/seed/media006/400/300',
    is_external_url: false,
    size_bytes: 1950000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Discours du Recteur lors de la cérémonie',
    created_at: '2024-12-15T15:30:00Z',
    updated_at: '2024-12-15T15:30:00Z'
  },
  {
    id: 'media-007',
    name: 'Atelier design thinking',
    type: 'image',
    url: 'https://picsum.photos/seed/media007/1200/800',
    thumbnail: 'https://picsum.photos/seed/media007/400/300',
    is_external_url: false,
    size_bytes: 1700000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Étudiants en atelier design thinking',
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-11-20T10:00:00Z'
  },
  {
    id: 'media-008',
    name: 'Travaux de groupe',
    type: 'image',
    url: 'https://picsum.photos/seed/media008/1200/800',
    thumbnail: 'https://picsum.photos/seed/media008/400/300',
    is_external_url: false,
    size_bytes: 1600000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Étudiants en travaux de groupe',
    created_at: '2024-11-20T11:30:00Z',
    updated_at: '2024-11-20T11:30:00Z'
  },
  {
    id: 'media-009',
    name: 'Présentation projet étudiant',
    type: 'image',
    url: 'https://picsum.photos/seed/media009/1200/800',
    thumbnail: 'https://picsum.photos/seed/media009/400/300',
    is_external_url: false,
    size_bytes: 1550000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Présentation de projet par un étudiant',
    created_at: '2024-11-21T14:00:00Z',
    updated_at: '2024-11-21T14:00:00Z'
  },
  {
    id: 'media-010',
    name: 'Jardins du campus',
    type: 'image',
    url: 'https://picsum.photos/seed/media010/1200/800',
    thumbnail: 'https://picsum.photos/seed/media010/400/300',
    is_external_url: false,
    size_bytes: 2300000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Jardins du campus d\'Alexandrie',
    created_at: '2024-04-05T08:00:00Z',
    updated_at: '2024-04-05T08:00:00Z'
  },
  {
    id: 'media-011',
    name: 'Salle informatique',
    type: 'image',
    url: 'https://picsum.photos/seed/media011/1200/800',
    thumbnail: 'https://picsum.photos/seed/media011/400/300',
    is_external_url: false,
    size_bytes: 1450000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Salle informatique du campus',
    created_at: '2024-05-10T09:00:00Z',
    updated_at: '2024-05-10T09:00:00Z'
  },
  {
    id: 'media-012',
    name: 'Conférence internationale 2024',
    type: 'image',
    url: 'https://picsum.photos/seed/media012/1200/800',
    thumbnail: 'https://picsum.photos/seed/media012/400/300',
    is_external_url: false,
    size_bytes: 2650000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Conférence internationale sur le développement durable',
    credits: 'USenghor Communications',
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-10-15T10:00:00Z'
  },
  {
    id: 'media-013',
    name: 'Panel d\'experts',
    type: 'image',
    url: 'https://picsum.photos/seed/media013/1200/800',
    thumbnail: 'https://picsum.photos/seed/media013/400/300',
    is_external_url: false,
    size_bytes: 1900000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Panel d\'experts lors de la conférence',
    created_at: '2024-10-15T14:00:00Z',
    updated_at: '2024-10-15T14:00:00Z'
  },
  {
    id: 'media-014',
    name: 'Questions du public',
    type: 'image',
    url: 'https://picsum.photos/seed/media014/1200/800',
    thumbnail: 'https://picsum.photos/seed/media014/400/300',
    is_external_url: false,
    size_bytes: 1750000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Session de questions-réponses',
    created_at: '2024-10-15T16:00:00Z',
    updated_at: '2024-10-15T16:00:00Z'
  },
  {
    id: 'media-015',
    name: 'Signature de partenariat',
    type: 'image',
    url: 'https://picsum.photos/seed/media015/1200/800',
    thumbnail: 'https://picsum.photos/seed/media015/400/300',
    is_external_url: false,
    size_bytes: 2100000,
    mime_type: 'image/jpeg',
    width: 1200,
    height: 800,
    alt_text: 'Signature d\'un accord de partenariat',
    credits: 'USenghor',
    created_at: '2024-09-20T11:00:00Z',
    updated_at: '2024-09-20T11:00:00Z'
  },
  // Vidéos
  {
    id: 'media-v001',
    name: 'Présentation de l\'Université Senghor',
    description: 'Vidéo institutionnelle présentant l\'université',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/mediav001/400/225',
    is_external_url: true,
    duration_seconds: 245,
    alt_text: 'Vidéo de présentation USenghor',
    credits: 'Service Communication',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'media-v002',
    name: 'Témoignages des diplômés 2024',
    description: 'Compilation de témoignages d\'anciens étudiants',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/mediav002/400/225',
    is_external_url: true,
    duration_seconds: 480,
    alt_text: 'Témoignages diplômés',
    created_at: '2024-12-20T14:00:00Z',
    updated_at: '2024-12-20T14:00:00Z'
  },
  {
    id: 'media-v003',
    name: 'Visite virtuelle du campus',
    description: 'Tour virtuel à 360° du campus d\'Alexandrie',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/mediav003/400/225',
    is_external_url: true,
    duration_seconds: 360,
    alt_text: 'Visite virtuelle campus',
    created_at: '2024-06-15T09:00:00Z',
    updated_at: '2024-06-15T09:00:00Z'
  },
  {
    id: 'media-v004',
    name: 'Conférence sur le développement durable',
    description: 'Enregistrement de la conférence plénière',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/mediav004/400/225',
    is_external_url: true,
    duration_seconds: 3600,
    alt_text: 'Conférence développement durable',
    created_at: '2024-10-16T10:00:00Z',
    updated_at: '2024-10-16T10:00:00Z'
  },
  // Documents
  {
    id: 'media-d001',
    name: 'Brochure institutionnelle 2024-2025',
    description: 'Brochure de présentation de l\'université',
    type: 'document',
    url: '/documents/brochure-usenghor-2024-2025.pdf',
    is_external_url: false,
    size_bytes: 5200000,
    mime_type: 'application/pdf',
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z'
  },
  {
    id: 'media-d002',
    name: 'Guide de l\'étudiant 2024-2025',
    description: 'Guide complet pour les étudiants',
    type: 'document',
    url: '/documents/guide-etudiant-2024-2025.pdf',
    is_external_url: false,
    size_bytes: 3800000,
    mime_type: 'application/pdf',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z'
  }
]

// Albums
export const mockAlbumsAdmin: AlbumAdmin[] = [
  {
    id: 'album-001',
    title: 'Cérémonie de remise des diplômes 2024',
    description: 'Photos officielles de la cérémonie de remise des diplômes de la promotion 2024',
    status: 'published',
    cover_media_id: 'media-004',
    media_count: 6,
    created_at: '2024-12-15T18:00:00Z',
    updated_at: '2024-12-16T10:00:00Z'
  },
  {
    id: 'album-002',
    title: 'Campus d\'Alexandrie - Visite guidée',
    description: 'Découverte des installations et espaces du campus principal',
    status: 'published',
    cover_media_id: 'media-001',
    media_count: 5,
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-05T14:30:00Z'
  },
  {
    id: 'album-003',
    title: 'Ateliers pédagogiques Novembre 2024',
    description: 'Sessions de design thinking et travaux collaboratifs',
    status: 'published',
    cover_media_id: 'media-007',
    media_count: 3,
    created_at: '2024-11-22T09:00:00Z',
    updated_at: '2024-11-22T16:00:00Z'
  },
  {
    id: 'album-004',
    title: 'Conférence internationale Développement Durable 2024',
    description: 'Moments forts de la conférence internationale sur les ODD en Afrique',
    status: 'published',
    cover_media_id: 'media-012',
    media_count: 4,
    created_at: '2024-10-16T18:00:00Z',
    updated_at: '2024-10-18T10:00:00Z'
  },
  {
    id: 'album-005',
    title: 'Partenariats et conventions 2024',
    description: 'Signatures de partenariats et accords institutionnels',
    status: 'draft',
    cover_media_id: 'media-015',
    media_count: 1,
    created_at: '2024-09-20T12:00:00Z',
    updated_at: '2024-09-20T12:00:00Z'
  },
  {
    id: 'album-006',
    title: 'Vidéos institutionnelles',
    description: 'Collection de vidéos de présentation de l\'université',
    status: 'published',
    cover_media_id: 'media-v001',
    media_count: 4,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-20T15:00:00Z'
  },
  {
    id: 'album-007',
    title: 'Vie étudiante 2024',
    description: 'Moments de vie quotidienne sur le campus',
    status: 'draft',
    cover_media_id: undefined,
    media_count: 0,
    created_at: '2025-01-10T09:00:00Z',
    updated_at: '2025-01-10T09:00:00Z'
  }
]

// Relations album-média
export const mockAlbumMediaAdmin: AlbumMediaAdmin[] = [
  // Album 1 - Cérémonie diplômes
  { album_id: 'album-001', media_id: 'media-004', display_order: 1 },
  { album_id: 'album-001', media_id: 'media-005', display_order: 2 },
  { album_id: 'album-001', media_id: 'media-006', display_order: 3 },
  { album_id: 'album-001', media_id: 'media-003', display_order: 4 },
  { album_id: 'album-001', media_id: 'media-v002', display_order: 5 },
  { album_id: 'album-001', media_id: 'media-015', display_order: 6 },
  // Album 2 - Campus Alexandrie
  { album_id: 'album-002', media_id: 'media-001', display_order: 1 },
  { album_id: 'album-002', media_id: 'media-002', display_order: 2 },
  { album_id: 'album-002', media_id: 'media-003', display_order: 3 },
  { album_id: 'album-002', media_id: 'media-010', display_order: 4 },
  { album_id: 'album-002', media_id: 'media-011', display_order: 5 },
  // Album 3 - Ateliers pédagogiques
  { album_id: 'album-003', media_id: 'media-007', display_order: 1 },
  { album_id: 'album-003', media_id: 'media-008', display_order: 2 },
  { album_id: 'album-003', media_id: 'media-009', display_order: 3 },
  // Album 4 - Conférence
  { album_id: 'album-004', media_id: 'media-012', display_order: 1 },
  { album_id: 'album-004', media_id: 'media-013', display_order: 2 },
  { album_id: 'album-004', media_id: 'media-014', display_order: 3 },
  { album_id: 'album-004', media_id: 'media-v004', display_order: 4 },
  // Album 5 - Partenariats
  { album_id: 'album-005', media_id: 'media-015', display_order: 1 },
  // Album 6 - Vidéos institutionnelles
  { album_id: 'album-006', media_id: 'media-v001', display_order: 1 },
  { album_id: 'album-006', media_id: 'media-v002', display_order: 2 },
  { album_id: 'album-006', media_id: 'media-v003', display_order: 3 },
  { album_id: 'album-006', media_id: 'media-v004', display_order: 4 }
]

// Ajouter les références cover_media aux albums
mockAlbumsAdmin.forEach(album => {
  if (album.cover_media_id) {
    album.cover_media = mockMediaAdmin.find(m => m.id === album.cover_media_id)
  }
})

// === FONCTIONS HELPER ===

/**
 * Génère un ID unique pour un album
 */
export const generateAlbumId = () => `album-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

/**
 * Génère un ID unique pour un média
 */
export const generateMediaId = () => `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

/**
 * Récupère tous les albums (admin)
 */
export const getAllAlbumsAdmin = (): AlbumAdmin[] => {
  return [...mockAlbumsAdmin].sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
}

/**
 * Récupère un album par ID
 */
export const getAlbumByIdAdmin = (id: string): AlbumAdmin | undefined => {
  const album = mockAlbumsAdmin.find(a => a.id === id)
  if (album && album.cover_media_id && !album.cover_media) {
    album.cover_media = mockMediaAdmin.find(m => m.id === album.cover_media_id)
  }
  return album
}

/**
 * Filtre les albums selon les critères
 */
export const getFilteredAlbumsAdmin = (filters?: AlbumFilters): AlbumAdmin[] => {
  let result = [...mockAlbumsAdmin]

  if (filters?.search) {
    const query = filters.search.toLowerCase()
    result = result.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.description?.toLowerCase().includes(query)
    )
  }

  if (filters?.status && filters.status !== 'all') {
    result = result.filter(a => a.status === filters.status)
  }

  return result.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
}

/**
 * Statistiques des albums
 */
export const getAlbumStats = (): AlbumStats => {
  return {
    total: mockAlbumsAdmin.length,
    published: mockAlbumsAdmin.filter(a => a.status === 'published').length,
    draft: mockAlbumsAdmin.filter(a => a.status === 'draft').length,
    totalMedia: mockMediaAdmin.length
  }
}

/**
 * Vérifie l'utilisation d'un album
 */
export const checkAlbumUsage = (albumId: string): AlbumUsage => {
  // Simuler l'utilisation
  return {
    events: Math.floor(Math.random() * 3),
    services: Math.floor(Math.random() * 2),
    campus: Math.floor(Math.random() * 2),
    projects: Math.floor(Math.random() * 2)
  }
}

/**
 * Récupère les médias d'un album
 */
export const getAlbumMediaAdmin = (albumId: string): MediaAdmin[] => {
  const relations = mockAlbumMediaAdmin
    .filter(am => am.album_id === albumId)
    .sort((a, b) => a.display_order - b.display_order)

  return relations
    .map(rel => mockMediaAdmin.find(m => m.id === rel.media_id))
    .filter((m): m is MediaAdmin => m !== undefined)
}

/**
 * Récupère tous les médias (admin)
 */
export const getAllMediaAdmin = (): MediaAdmin[] => {
  return [...mockMediaAdmin].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

/**
 * Récupère un média par ID
 */
export const getMediaByIdAdmin = (id: string): MediaAdmin | undefined => {
  return mockMediaAdmin.find(m => m.id === id)
}

/**
 * Récupère les médias par type
 */
export const getMediaByTypeAdmin = (type: MediaType): MediaAdmin[] => {
  return mockMediaAdmin.filter(m => m.type === type)
}

/**
 * Liste des albums pour un select
 */
export const getAlbumsForSelect = (): Array<{ id: string; title: string; status: PublicationStatus }> => {
  return mockAlbumsAdmin.map(a => ({
    id: a.id,
    title: a.title,
    status: a.status
  }))
}

/**
 * Labels pour les statuts de publication
 */
export const albumStatusLabels: Record<PublicationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié'
}

/**
 * Couleurs pour les statuts de publication
 */
export const albumStatusColors: Record<PublicationStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
}

/**
 * Labels pour les types de média
 */
export const mediaTypeLabels: Record<MediaType, string> = {
  image: 'Image',
  video: 'Vidéo',
  audio: 'Audio',
  document: 'Document'
}

/**
 * Icônes pour les types de média (Font Awesome)
 */
export const mediaTypeIcons: Record<MediaType, string> = {
  image: 'fa-image',
  video: 'fa-video',
  audio: 'fa-music',
  document: 'fa-file-pdf'
}

/**
 * Formater la taille d'un fichier
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Formater une durée en secondes
 */
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins >= 60) {
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h${remainingMins.toString().padStart(2, '0')}m`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// === FONCTIONS MÉDIATHÈQUE FICHIERS ===

export interface MediaFilters {
  search?: string
  type?: MediaType | 'all'
  date_from?: string
  date_to?: string
  sort_by?: 'created_at' | 'name' | 'size_bytes'
  sort_order?: 'asc' | 'desc'
}

export interface MediaStats {
  total: number
  images: number
  videos: number
  documents: number
  audio: number
  totalSize: number
}

export interface MediaUsageItem {
  type: 'news' | 'event' | 'album' | 'project' | 'campus'
  id: string
  title: string
}

export interface MediaUsageResult {
  is_used: boolean
  usage: MediaUsageItem[]
}

/**
 * Filtre les médias selon les critères
 */
export const getFilteredMediaAdmin = (filters?: MediaFilters): MediaAdmin[] => {
  let result = [...mockMediaAdmin]

  if (filters?.search) {
    const query = filters.search.toLowerCase()
    result = result.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.description?.toLowerCase().includes(query) ||
      m.alt_text?.toLowerCase().includes(query) ||
      m.credits?.toLowerCase().includes(query)
    )
  }

  if (filters?.type && filters.type !== 'all') {
    result = result.filter(m => m.type === filters.type)
  }

  if (filters?.date_from) {
    const dateFrom = new Date(filters.date_from)
    result = result.filter(m => new Date(m.created_at) >= dateFrom)
  }

  if (filters?.date_to) {
    const dateTo = new Date(filters.date_to)
    dateTo.setHours(23, 59, 59, 999) // Inclure toute la journée
    result = result.filter(m => new Date(m.created_at) <= dateTo)
  }

  // Tri
  const sortBy = filters?.sort_by || 'created_at'
  const sortOrder = filters?.sort_order || 'desc'

  result.sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'size_bytes':
        comparison = (a.size_bytes || 0) - (b.size_bytes || 0)
        break
      case 'created_at':
      default:
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return result
}

/**
 * Statistiques des médias
 */
export const getMediaStats = (): MediaStats => {
  const images = mockMediaAdmin.filter(m => m.type === 'image')
  const videos = mockMediaAdmin.filter(m => m.type === 'video')
  const documents = mockMediaAdmin.filter(m => m.type === 'document')
  const audio = mockMediaAdmin.filter(m => m.type === 'audio')

  const totalSize = mockMediaAdmin.reduce((acc, m) => acc + (m.size_bytes || 0), 0)

  return {
    total: mockMediaAdmin.length,
    images: images.length,
    videos: videos.length,
    documents: documents.length,
    audio: audio.length,
    totalSize
  }
}

/**
 * Vérifie l'utilisation d'un média
 */
export const checkMediaUsage = (mediaId: string): MediaUsageResult => {
  const usage: MediaUsageItem[] = []

  // Vérifier dans les albums
  const albumRelations = mockAlbumMediaAdmin.filter(am => am.media_id === mediaId)
  albumRelations.forEach(rel => {
    const album = mockAlbumsAdmin.find(a => a.id === rel.album_id)
    if (album) {
      usage.push({
        type: 'album',
        id: album.id,
        title: album.title
      })
    }
  })

  // Simuler d'autres utilisations (en production, on vérifierait dans les autres tables)
  // Pour le mock, on simule quelques utilisations aléatoires
  const media = mockMediaAdmin.find(m => m.id === mediaId)
  if (media && media.name.toLowerCase().includes('campus')) {
    usage.push({
      type: 'campus',
      id: 'campus-001',
      title: 'Campus Alexandrie'
    })
  }

  return {
    is_used: usage.length > 0,
    usage
  }
}

/**
 * Récupère les médias disponibles pour la sélection (non utilisés dans un album spécifique)
 */
export const getAvailableMediaForAlbum = (albumId?: string): MediaAdmin[] => {
  if (!albumId) return [...mockMediaAdmin]

  const usedMediaIds = mockAlbumMediaAdmin
    .filter(am => am.album_id === albumId)
    .map(am => am.media_id)

  return mockMediaAdmin.filter(m => !usedMediaIds.includes(m.id))
}

/**
 * Couleurs pour les types de média
 */
export const mediaTypeColors: Record<MediaType, string> = {
  image: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  audio: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  document: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
}
