/**
 * Store Pinia - Footer Data
 * =========================
 *
 * Cache global pour les données du footer (réseaux sociaux, contact).
 * Charge les données depuis l'API publique éditoriale (sans authentification).
 */

import { defineStore } from 'pinia'
import type { SocialMediaPlatform, SocialMediaData } from '~/types/api'
import type { ContactAddress, ContactPhones, ContactEmails } from '~/composables/useContactApi'
import { platformIcons } from '~/composables/useSocialNetworksApi'

// TTL du cache en millisecondes (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

export interface FooterSocialLink {
  platform: SocialMediaPlatform
  url: string
  icon: string
  label: string
  display_order: number
}

export const useFooterDataStore = defineStore('footerData', () => {
  // State
  const socialLinks = ref<FooterSocialLink[]>([])
  const contactAddress = ref<ContactAddress | null>(null)
  const contactPhones = ref<ContactPhones | null>(null)
  const contactEmails = ref<ContactEmails | null>(null)

  const isLoaded = ref(false)
  const isLoading = ref(false)
  const lastFetchTime = ref<number | null>(null)

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  function isCacheValid(): boolean {
    if (!lastFetchTime.value) return false
    return Date.now() - lastFetchTime.value < CACHE_TTL
  }

  function getPlatformFaIcon(platform: SocialMediaPlatform): string {
    const iconName = platformIcons[platform] || 'link'
    if (platform === 'other') return `fa-solid fa-${iconName}`
    return `fa-brands fa-${iconName}`
  }

  function getPlatformLabel(platform: SocialMediaPlatform, customLabel?: string): string {
    if (platform === 'other' && customLabel) return customLabel
    const labels: Record<SocialMediaPlatform, string> = {
      facebook: 'Facebook',
      twitter: 'X (Twitter)',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
      youtube: 'YouTube',
      tiktok: 'TikTok',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      other: 'Autre',
    }
    return labels[platform]
  }

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  async function fetchData(): Promise<void> {
    if (isLoading.value) return
    if (isLoaded.value && isCacheValid()) return

    isLoading.value = true

    try {
      const { getContentsByCategory, getContentsByKeys } = usePublicEditorialApi()

      // Charger réseaux sociaux et contact en parallèle
      const [socialContents, contactContents] = await Promise.all([
        getContentsByCategory('social_media'),
        getContentsByKeys(['contact_address', 'contact_phones', 'contact_emails']),
      ])

      // Parser les réseaux sociaux
      const links: FooterSocialLink[] = []
      for (const content of socialContents) {
        if (!content.value || content.value_type !== 'json') continue
        try {
          const data = JSON.parse(content.value) as SocialMediaData
          if (!data.active) continue
          links.push({
            platform: data.platform,
            url: data.url,
            icon: getPlatformFaIcon(data.platform),
            label: getPlatformLabel(data.platform, data.custom_label),
            display_order: data.display_order,
          })
        }
        catch {
          // Ignorer les entrées mal formatées
        }
      }
      socialLinks.value = links.sort((a, b) => a.display_order - b.display_order)

      // Parser le contact
      for (const content of contactContents) {
        if (!content.value) continue
        try {
          if (content.key === 'contact_address') {
            contactAddress.value = JSON.parse(content.value)
          }
          else if (content.key === 'contact_phones') {
            contactPhones.value = JSON.parse(content.value)
          }
          else if (content.key === 'contact_emails') {
            contactEmails.value = JSON.parse(content.value)
          }
        }
        catch {
          // Ignorer les entrées mal formatées
        }
      }

      isLoaded.value = true
      lastFetchTime.value = Date.now()
    }
    catch (err) {
      console.warn('Données footer non disponibles:', err)
    }
    finally {
      isLoading.value = false
    }
  }

  function invalidateCache(): void {
    isLoaded.value = false
    lastFetchTime.value = null
  }

  return {
    socialLinks,
    contactAddress,
    contactPhones,
    contactEmails,
    isLoaded,
    isLoading,
    fetchData,
    invalidateCache,
  }
})
