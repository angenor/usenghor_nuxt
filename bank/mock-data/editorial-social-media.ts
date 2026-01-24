// ============================================================================
// MOCK DATA - RÉSEAUX SOCIAUX (EDITORIAL SOCIAL MEDIA)
// ============================================================================
// Basé sur le schéma SQL: 12_editorial.sql
// Tables: editorial_categories, editorial_contents
// Stockage en JSON pour la liste des réseaux sociaux
// ============================================================================

// Type de plateforme de réseau social
export type SocialMediaPlatform =
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'whatsapp'
  | 'telegram'
  | 'other'

// Structure d'un réseau social
export interface SocialMediaLink {
  id: string
  platform: SocialMediaPlatform
  url: string
  active: boolean
  display_order: number
  custom_label?: string // Pour le type "other"
  created_at: string
  updated_at: string
}

// Labels des plateformes
export const platformLabels: Record<SocialMediaPlatform, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  other: 'Autre'
}

// Icônes des plateformes (FontAwesome brands)
export const platformIcons: Record<SocialMediaPlatform, string> = {
  facebook: 'facebook',
  twitter: 'x-twitter',
  linkedin: 'linkedin',
  instagram: 'instagram',
  youtube: 'youtube',
  tiktok: 'tiktok',
  whatsapp: 'whatsapp',
  telegram: 'telegram',
  other: 'link'
}

// Couleurs des plateformes
export const platformColors: Record<SocialMediaPlatform, string> = {
  facebook: 'bg-blue-600 text-white',
  twitter: 'bg-black text-white',
  linkedin: 'bg-blue-700 text-white',
  instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white',
  youtube: 'bg-red-600 text-white',
  tiktok: 'bg-black text-white',
  whatsapp: 'bg-green-500 text-white',
  telegram: 'bg-sky-500 text-white',
  other: 'bg-gray-600 text-white'
}

// Couleurs des plateformes (variante badge)
export const platformBadgeColors: Record<SocialMediaPlatform, string> = {
  facebook: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  twitter: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  linkedin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  instagram: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  youtube: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  tiktok: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  whatsapp: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  telegram: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  other: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

// Patterns de validation des URLs par plateforme
export const platformUrlPatterns: Record<SocialMediaPlatform, RegExp> = {
  facebook: /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+$/i,
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+$/i,
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(company|school|in)\/.+$/i,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/.+$/i,
  youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/i,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@?.+$/i,
  whatsapp: /^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\/.+$/i,
  telegram: /^https?:\/\/(t\.me|telegram\.me)\/.+$/i,
  other: /^https?:\/\/.+$/i
}

// Exemples d'URLs par plateforme
export const platformUrlExamples: Record<SocialMediaPlatform, string> = {
  facebook: 'https://facebook.com/votre-page',
  twitter: 'https://x.com/votre-compte',
  linkedin: 'https://linkedin.com/school/votre-etablissement',
  instagram: 'https://instagram.com/votre-compte',
  youtube: 'https://youtube.com/@votre-chaine',
  tiktok: 'https://tiktok.com/@votre-compte',
  whatsapp: 'https://wa.me/20123456789',
  telegram: 'https://t.me/votre-canal',
  other: 'https://exemple.com/profil'
}

// ============================================================================
// DONNÉES MOCK
// ============================================================================

export const mockSocialMediaLinks: SocialMediaLink[] = [
  {
    id: 'social_001',
    platform: 'facebook',
    url: 'https://www.facebook.com/UniversiteSenghor',
    active: true,
    display_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-15T10:00:00Z'
  },
  {
    id: 'social_002',
    platform: 'linkedin',
    url: 'https://www.linkedin.com/school/universite-senghor/',
    active: true,
    display_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-15T10:00:00Z'
  },
  {
    id: 'social_003',
    platform: 'youtube',
    url: 'https://www.youtube.com/@UniversiteSenghor',
    active: true,
    display_order: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-08-22T11:30:00Z'
  },
  {
    id: 'social_004',
    platform: 'twitter',
    url: 'https://x.com/USenghor',
    active: true,
    display_order: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-10T14:00:00Z'
  },
  {
    id: 'social_005',
    platform: 'instagram',
    url: 'https://www.instagram.com/universenghor',
    active: false,
    display_order: 5,
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-12-01T09:00:00Z'
  },
  {
    id: 'social_006',
    platform: 'whatsapp',
    url: 'https://wa.me/20348435625',
    active: true,
    display_order: 6,
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-01T00:00:00Z'
  }
]

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Générer un ID unique
export const generateSocialMediaId = (): string => {
  return `social_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Récupérer tous les réseaux sociaux (triés par ordre d'affichage)
export const getAllSocialMedia = (): SocialMediaLink[] => {
  return [...mockSocialMediaLinks].sort((a, b) => a.display_order - b.display_order)
}

// Récupérer uniquement les réseaux actifs (pour le site public)
export const getActiveSocialMedia = (): SocialMediaLink[] => {
  return mockSocialMediaLinks
    .filter(s => s.active)
    .sort((a, b) => a.display_order - b.display_order)
}

// Récupérer un réseau par ID
export const getSocialMediaById = (id: string): SocialMediaLink | undefined => {
  return mockSocialMediaLinks.find(s => s.id === id)
}

// Récupérer un réseau par plateforme
export const getSocialMediaByPlatform = (platform: SocialMediaPlatform): SocialMediaLink | undefined => {
  return mockSocialMediaLinks.find(s => s.platform === platform)
}

// Vérifier si une plateforme est déjà utilisée
export const isPlatformUsed = (platform: SocialMediaPlatform, excludeId?: string): boolean => {
  if (platform === 'other') return false // On peut avoir plusieurs "autres"
  return mockSocialMediaLinks.some(s => s.platform === platform && s.id !== excludeId)
}

// Valider une URL selon la plateforme
export const validateSocialMediaUrl = (url: string, platform: SocialMediaPlatform): boolean => {
  if (!url) return false
  return platformUrlPatterns[platform].test(url)
}

// Obtenir le prochain ordre d'affichage
export const getNextDisplayOrder = (): number => {
  if (mockSocialMediaLinks.length === 0) return 1
  const maxOrder = Math.max(...mockSocialMediaLinks.map(s => s.display_order))
  return maxOrder + 1
}

// Statistiques des réseaux sociaux
export interface SocialMediaStats {
  total_count: number
  active_count: number
  inactive_count: number
  platforms_used: SocialMediaPlatform[]
  last_updated: string | null
}

export const getSocialMediaStats = (): SocialMediaStats => {
  const active = mockSocialMediaLinks.filter(s => s.active)
  const inactive = mockSocialMediaLinks.filter(s => !s.active)
  const platforms = [...new Set(mockSocialMediaLinks.map(s => s.platform))]

  const lastUpdated = mockSocialMediaLinks.length > 0
    ? mockSocialMediaLinks.reduce((latest, s) =>
        new Date(s.updated_at) > new Date(latest.updated_at) ? s : latest
      ).updated_at
    : null

  return {
    total_count: mockSocialMediaLinks.length,
    active_count: active.length,
    inactive_count: inactive.length,
    platforms_used: platforms,
    last_updated: lastUpdated
  }
}

// Obtenir les plateformes disponibles (non encore utilisées)
export const getAvailablePlatforms = (excludeId?: string): SocialMediaPlatform[] => {
  const allPlatforms: SocialMediaPlatform[] = [
    'facebook', 'twitter', 'linkedin', 'instagram', 'youtube',
    'tiktok', 'whatsapp', 'telegram', 'other'
  ]

  return allPlatforms.filter(platform => {
    if (platform === 'other') return true // Toujours disponible
    return !isPlatformUsed(platform, excludeId)
  })
}

// Formater l'URL pour l'affichage (version courte)
export const formatSocialMediaUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname + urlObj.pathname.substring(0, 20) + (urlObj.pathname.length > 20 ? '...' : '')
  } catch {
    return url.substring(0, 30) + (url.length > 30 ? '...' : '')
  }
}

// Obtenir l'icône FontAwesome pour une plateforme
export const getPlatformIcon = (platform: SocialMediaPlatform): [string, string] => {
  // Retourne [préfixe, nom de l'icône]
  if (platform === 'other') {
    return ['fas', 'link']
  }
  return ['fab', platformIcons[platform]]
}
