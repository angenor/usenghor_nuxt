/**
 * Composable pour la gestion des réseaux sociaux
 * Aligné sur le backend: app/routers/admin/editorial.py
 * Stockage en JSON dans editorial_contents avec catégorie "social_media"
 */

import type {
  EditorialCategoryRead,
  EditorialContentCreate,
  EditorialContentRead,
  EditorialContentUpdate,
  MessageResponse,
  PaginatedResponse,
  SocialMediaCreatePayload,
  SocialMediaData,
  SocialMediaLink,
  SocialMediaPlatform,
  SocialMediaStats,
  SocialMediaUpdatePayload,
} from '~/types/api'

// Catégorie code pour les réseaux sociaux
const SOCIAL_MEDIA_CATEGORY_CODE = 'social_media'

// Préfixe pour les clés de réseaux sociaux
const SOCIAL_MEDIA_KEY_PREFIX = 'social_media_'

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
  other: 'Autre',
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
  other: 'link',
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
  other: 'bg-gray-600 text-white',
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
  other: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
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
  other: /^https?:\/\/.+$/i,
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
  other: 'https://exemple.com/profil',
}

// Liste des plateformes
export const allPlatforms: SocialMediaPlatform[] = [
  'facebook',
  'twitter',
  'linkedin',
  'instagram',
  'youtube',
  'tiktok',
  'whatsapp',
  'telegram',
  'other',
]

export function useSocialNetworksApi() {
  const { apiFetch } = useApi()

  // ============================================================================
  // INTERNAL HELPERS
  // ============================================================================

  /**
   * Convertit un EditorialContent en SocialMediaLink
   */
  function contentToSocialMedia(content: EditorialContentRead): SocialMediaLink | null {
    if (!content.value) return null

    try {
      const data = JSON.parse(content.value) as SocialMediaData
      return {
        id: content.id,
        platform: data.platform,
        url: data.url,
        active: data.active,
        display_order: data.display_order,
        custom_label: data.custom_label,
        created_at: content.created_at,
        updated_at: content.updated_at,
      }
    }
    catch {
      console.error('Erreur de parsing JSON pour social media:', content.key)
      return null
    }
  }

  // ============================================================================
  // CATEGORY
  // ============================================================================

  /**
   * Récupère la catégorie "social_media"
   */
  async function getSocialMediaCategory(): Promise<EditorialCategoryRead | null> {
    try {
      const response = await apiFetch<PaginatedResponse<EditorialCategoryRead>>('/api/admin/editorial/categories', {
        query: { search: SOCIAL_MEDIA_CATEGORY_CODE, limit: 1 },
      })
      return response.items.find(c => c.code === SOCIAL_MEDIA_CATEGORY_CODE) || null
    }
    catch {
      return null
    }
  }

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Liste tous les réseaux sociaux
   */
  async function getAllSocialMedia(): Promise<SocialMediaLink[]> {
    const response = await apiFetch<PaginatedResponse<EditorialContentRead>>('/api/admin/editorial/contents', {
      query: {
        category_code: SOCIAL_MEDIA_CATEGORY_CODE,
        value_type: 'json',
        limit: 50,
      },
    })

    const socialMediaLinks: SocialMediaLink[] = []
    for (const content of response.items) {
      if (content.key.startsWith(SOCIAL_MEDIA_KEY_PREFIX)) {
        const link = contentToSocialMedia(content)
        if (link) {
          socialMediaLinks.push(link)
        }
      }
    }

    return socialMediaLinks.sort((a, b) => a.display_order - b.display_order)
  }

  /**
   * Récupère uniquement les réseaux actifs (pour le site public)
   */
  async function getActiveSocialMedia(): Promise<SocialMediaLink[]> {
    const all = await getAllSocialMedia()
    return all.filter(s => s.active)
  }

  /**
   * Récupère un réseau social par ID
   */
  async function getSocialMediaById(id: string): Promise<SocialMediaLink | null> {
    try {
      const content = await apiFetch<EditorialContentRead>(`/api/admin/editorial/contents/${id}`)
      return contentToSocialMedia(content)
    }
    catch {
      return null
    }
  }

  /**
   * Crée un nouveau réseau social
   */
  async function createSocialMedia(data: SocialMediaCreatePayload, categoryId: string): Promise<SocialMediaLink> {
    const key = `${SOCIAL_MEDIA_KEY_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Déterminer l'ordre d'affichage si non fourni
    let displayOrder = data.display_order
    if (displayOrder === undefined) {
      displayOrder = await getNextDisplayOrder()
    }

    const socialMediaData: SocialMediaData = {
      platform: data.platform,
      url: data.url,
      active: data.active ?? true,
      display_order: displayOrder,
      custom_label: data.custom_label,
    }

    const response = await apiFetch<{ id: string }>('/api/admin/editorial/contents', {
      method: 'POST',
      body: {
        key,
        value: JSON.stringify(socialMediaData),
        value_type: 'json',
        category_id: categoryId,
        description: data.custom_label || platformLabels[data.platform],
        admin_editable: true,
      } satisfies EditorialContentCreate,
    })

    // Récupérer le contenu créé pour avoir toutes les infos
    const created = await getSocialMediaById(response.id)
    if (!created) {
      throw new Error('Erreur lors de la création du réseau social')
    }
    return created
  }

  /**
   * Met à jour un réseau social
   */
  async function updateSocialMedia(id: string, data: SocialMediaUpdatePayload): Promise<SocialMediaLink> {
    // Récupérer les données actuelles
    const current = await getSocialMediaById(id)
    if (!current) {
      throw new Error('Réseau social non trouvé')
    }

    // Fusionner avec les nouvelles données
    const newData: SocialMediaData = {
      platform: data.platform ?? current.platform,
      url: data.url ?? current.url,
      active: data.active ?? current.active,
      display_order: data.display_order ?? current.display_order,
      custom_label: data.custom_label ?? current.custom_label,
    }

    await apiFetch<EditorialContentRead>(`/api/admin/editorial/contents/${id}`, {
      method: 'PUT',
      body: {
        value: JSON.stringify(newData),
        description: newData.custom_label || platformLabels[newData.platform],
      } satisfies EditorialContentUpdate,
    })

    // Récupérer le contenu mis à jour
    const updated = await getSocialMediaById(id)
    if (!updated) {
      throw new Error('Erreur lors de la mise à jour du réseau social')
    }
    return updated
  }

  /**
   * Supprime un réseau social
   */
  async function deleteSocialMedia(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/editorial/contents/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Active/désactive un réseau social
   */
  async function toggleSocialMediaActive(id: string): Promise<SocialMediaLink> {
    const current = await getSocialMediaById(id)
    if (!current) {
      throw new Error('Réseau social non trouvé')
    }
    return updateSocialMedia(id, { active: !current.active })
  }

  // ============================================================================
  // STATISTICS & HELPERS
  // ============================================================================

  /**
   * Calcule les statistiques des réseaux sociaux
   */
  async function getSocialMediaStats(): Promise<SocialMediaStats> {
    const all = await getAllSocialMedia()
    const active = all.filter(s => s.active)
    const platforms = [...new Set(all.map(s => s.platform))]

    const lastUpdated = all.length > 0
      ? all.reduce((latest, s) =>
          new Date(s.updated_at) > new Date(latest.updated_at) ? s : latest,
        ).updated_at
      : null

    return {
      total_count: all.length,
      active_count: active.length,
      inactive_count: all.length - active.length,
      platforms_used: platforms,
      last_updated: lastUpdated,
    }
  }

  /**
   * Obtient le prochain ordre d'affichage
   */
  async function getNextDisplayOrder(): Promise<number> {
    const all = await getAllSocialMedia()
    if (all.length === 0) return 1
    const maxOrder = Math.max(...all.map(s => s.display_order))
    return maxOrder + 1
  }

  /**
   * Vérifie si une plateforme est déjà utilisée
   */
  async function isPlatformUsed(platform: SocialMediaPlatform, excludeId?: string): Promise<boolean> {
    if (platform === 'other') return false // On peut avoir plusieurs "autres"
    const all = await getAllSocialMedia()
    return all.some(s => s.platform === platform && s.id !== excludeId)
  }

  /**
   * Obtient les plateformes disponibles (non encore utilisées)
   */
  async function getAvailablePlatforms(excludeId?: string): Promise<SocialMediaPlatform[]> {
    const usedPlatforms: SocialMediaPlatform[] = []
    const all = await getAllSocialMedia()

    for (const link of all) {
      if (link.id !== excludeId && link.platform !== 'other') {
        usedPlatforms.push(link.platform)
      }
    }

    return allPlatforms.filter(p => p === 'other' || !usedPlatforms.includes(p))
  }

  /**
   * Valide une URL selon la plateforme
   */
  function validateSocialMediaUrl(url: string, platform: SocialMediaPlatform): boolean {
    if (!url) return false
    return platformUrlPatterns[platform].test(url)
  }

  /**
   * Formate l'URL pour l'affichage (version courte)
   */
  function formatSocialMediaUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname.substring(0, 20) + (urlObj.pathname.length > 20 ? '...' : '')
      return urlObj.hostname + path
    }
    catch {
      return url.substring(0, 30) + (url.length > 30 ? '...' : '')
    }
  }

  /**
   * Obtient l'icône FontAwesome pour une plateforme
   */
  function getPlatformIcon(platform: SocialMediaPlatform): [string, string] {
    if (platform === 'other') {
      return ['fas', 'link']
    }
    return ['fab', platformIcons[platform]]
  }

  return {
    // Category
    getSocialMediaCategory,

    // CRUD
    getAllSocialMedia,
    getActiveSocialMedia,
    getSocialMediaById,
    createSocialMedia,
    updateSocialMedia,
    deleteSocialMedia,
    toggleSocialMediaActive,

    // Statistics & helpers
    getSocialMediaStats,
    getNextDisplayOrder,
    isPlatformUsed,
    getAvailablePlatforms,
    validateSocialMediaUrl,
    formatSocialMediaUrl,
    getPlatformIcon,

    // Labels & UI helpers
    platformLabels,
    platformIcons,
    platformColors,
    platformBadgeColors,
    platformUrlPatterns,
    platformUrlExamples,
    allPlatforms,
  }
}
