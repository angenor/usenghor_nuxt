/**
 * Mock Data: Étiquettes (Tags)
 * Gestion des tags pour catégoriser les contenus (actualités, etc.)
 */

export interface Tag {
  id: string
  name: string
  slug: string
  icon?: string // Icône Lucide (ex: 'microscope', 'handshake')
  description?: string
  news_count: number
  created_at: string
  updated_at: string
}

// Couleurs des tags par nom pour l'affichage
export const tagColors: Record<string, string> = {
  academique: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  partenariat: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  evenement: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  recherche: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  international: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  alumni: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  formation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  innovation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  culture: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  gouvernance: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
}

// Données mock enrichies
export const mockTags: Tag[] = [
  {
    id: 'tag-1',
    name: 'Académique',
    slug: 'academique',
    icon: 'graduation-cap',
    description: 'Actualités liées à la vie académique, aux formations et aux programmes d\'études',
    news_count: 5,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-01-20T14:00:00Z'
  },
  {
    id: 'tag-2',
    name: 'Partenariat',
    slug: 'partenariat',
    icon: 'handshake',
    description: 'Accords et collaborations avec des institutions partenaires',
    news_count: 4,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-01-18T11:00:00Z'
  },
  {
    id: 'tag-3',
    name: 'Événement',
    slug: 'evenement',
    icon: 'calendar-days',
    description: 'Conférences, séminaires, cérémonies et autres événements',
    news_count: 3,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-01-15T09:00:00Z'
  },
  {
    id: 'tag-4',
    name: 'Recherche',
    slug: 'recherche',
    icon: 'microscope',
    description: 'Projets de recherche, publications scientifiques et travaux académiques',
    news_count: 2,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-12-01T09:00:00Z'
  },
  {
    id: 'tag-5',
    name: 'International',
    slug: 'international',
    icon: 'globe',
    description: 'Coopération internationale et relations avec l\'étranger',
    news_count: 6,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-01-20T14:30:00Z'
  },
  {
    id: 'tag-6',
    name: 'Alumni',
    slug: 'alumni',
    icon: 'users',
    description: 'Actualités concernant les anciens étudiants et le réseau alumni',
    news_count: 1,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-11-10T14:00:00Z'
  },
  {
    id: 'tag-7',
    name: 'Formation',
    slug: 'formation',
    icon: 'book-open',
    description: 'Nouveaux programmes, Masters et certifications',
    news_count: 5,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'tag-8',
    name: 'Innovation',
    slug: 'innovation',
    icon: 'lightbulb',
    description: 'Nouvelles technologies, transformation numérique et projets innovants',
    news_count: 3,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-01-08T10:00:00Z'
  },
  {
    id: 'tag-9',
    name: 'Culture',
    slug: 'culture',
    icon: 'palette',
    description: 'Arts, patrimoine et industries culturelles',
    news_count: 2,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-01-05T09:00:00Z'
  },
  {
    id: 'tag-10',
    name: 'Gouvernance',
    slug: 'gouvernance',
    icon: 'landmark',
    description: 'Administration publique, politiques et gestion institutionnelle',
    news_count: 2,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z'
  }
]

// Générer un nouvel ID de tag
export function generateTagId(): string {
  return `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Générer un slug à partir du nom
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '') // Supprime les tirets en début/fin
}

// Récupérer tous les tags
export function getAllTags(): Tag[] {
  return [...mockTags].sort((a, b) => a.name.localeCompare(b.name))
}

// Récupérer un tag par ID
export function getTagById(id: string): Tag | undefined {
  return mockTags.find(t => t.id === id)
}

// Récupérer un tag par slug
export function getTagBySlug(slug: string): Tag | undefined {
  return mockTags.find(t => t.slug === slug)
}

// Statistiques des tags
export interface TagStats {
  total: number
  totalNewsCount: number
  mostUsed: Tag | null
  leastUsed: Tag | null
}

export function getTagStats(): TagStats {
  const sortedByUsage = [...mockTags].sort((a, b) => b.news_count - a.news_count)

  return {
    total: mockTags.length,
    totalNewsCount: mockTags.reduce((sum, t) => sum + t.news_count, 0),
    mostUsed: sortedByUsage[0] || null,
    leastUsed: sortedByUsage[sortedByUsage.length - 1] || null
  }
}

// Vérifier si un tag est utilisé
export function isTagUsed(tagId: string): boolean {
  const tag = getTagById(tagId)
  return tag ? tag.news_count > 0 : false
}

// Liste des icônes disponibles (subset Lucide/FontAwesome)
export const availableIcons = [
  { value: 'graduation-cap', label: 'Graduation' },
  { value: 'handshake', label: 'Poignée de main' },
  { value: 'calendar-days', label: 'Calendrier' },
  { value: 'microscope', label: 'Microscope' },
  { value: 'globe', label: 'Globe' },
  { value: 'users', label: 'Utilisateurs' },
  { value: 'book-open', label: 'Livre ouvert' },
  { value: 'lightbulb', label: 'Ampoule' },
  { value: 'palette', label: 'Palette' },
  { value: 'landmark', label: 'Monument' },
  { value: 'briefcase', label: 'Mallette' },
  { value: 'heart-pulse', label: 'Santé' },
  { value: 'leaf', label: 'Feuille' },
  { value: 'building-2', label: 'Bâtiment' },
  { value: 'award', label: 'Récompense' },
  { value: 'megaphone', label: 'Mégaphone' },
  { value: 'newspaper', label: 'Journal' },
  { value: 'video', label: 'Vidéo' },
  { value: 'image', label: 'Image' },
  { value: 'star', label: 'Étoile' }
]
