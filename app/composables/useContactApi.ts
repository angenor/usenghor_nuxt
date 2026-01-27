/**
 * Composable API - Informations de Contact (Editorial)
 * =====================================================
 *
 * Gestion des informations de contact via le système éditorial.
 * Les données sont stockées comme contenus JSON dans editorial_contents.
 */

// ============================================================================
// Types - Structures de Contact
// ============================================================================

export interface ContactAddress {
  street: string
  postal_code: string
  city: string
  country: string
  latitude: number
  longitude: number
}

export interface ContactPhones {
  main: string
  secondary: string | null
  fax: string | null
}

export interface ContactEmails {
  general: string
  admissions: string
  partnerships: string
  press: string | null
}

export interface ContactHours {
  days: string
  hours: string
  timezone: string
  closures: string
}

export interface ContactFormConfig {
  default_recipients: string[]
  subjects: string[]
  confirmation_message: string
}

export interface DepartmentContact {
  id: string
  department_name: string
  email: string
  phone: string | null
  responsible_name: string | null
  order: number
}

export interface SocialMediaLinks {
  facebook: string | null
  twitter: string | null
  linkedin: string | null
  youtube: string | null
  instagram: string | null
}

export interface ContactInfo {
  address: ContactAddress
  phones: ContactPhones
  emails: ContactEmails
  hours: ContactHours
  contact_form: ContactFormConfig
  department_contacts: DepartmentContact[]
  social_media: SocialMediaLinks
}

export interface ContactStats {
  sections_count: number
  department_contacts_count: number
  social_media_count: number
  last_updated: string
  form_subjects_count: number
}

export interface ContactHistory {
  id: string
  content_id: string
  content_key?: string
  section?: string
  old_value: string | null
  new_value: string | null
  modified_by_external_id: string | null
  modified_by_name?: string
  modified_at: string
}

// ============================================================================
// Types Backend (Editorial)
// ============================================================================

interface EditorialContentRead {
  id: string
  key: string
  value: string | null
  value_type: 'text' | 'number' | 'json' | 'html' | 'markdown'
  category_id: string | null
  year: number | null
  description: string | null
  admin_editable: boolean
  created_at: string
  updated_at: string
  category?: {
    id: string
    code: string
    name: string
  } | null
}

interface EditorialHistoryRead {
  id: string
  content_id: string
  old_value: string | null
  new_value: string | null
  modified_by_external_id: string | null
  modified_at: string
}

interface BulkUpdateResult {
  total: number
  updated: number
  errors: number
  not_found: number
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

// ============================================================================
// Labels et constantes
// ============================================================================

export const contactSectionLabels: Record<string, string> = {
  address: 'Adresse',
  phones: 'Téléphones',
  emails: 'Emails',
  hours: 'Horaires',
  contact_form: 'Formulaire de contact',
  department_contacts: 'Contacts par service',
  social_media: 'Réseaux sociaux',
}

export const contactSectionIcons: Record<string, string> = {
  address: 'map-marker-alt',
  phones: 'phone',
  emails: 'envelope',
  hours: 'clock',
  contact_form: 'paper-plane',
  department_contacts: 'users',
  social_media: 'share-alt',
}

export const socialMediaLabels: Record<keyof SocialMediaLinks, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  instagram: 'Instagram',
}

export const socialMediaIcons: Record<keyof SocialMediaLinks, string> = {
  facebook: 'facebook',
  twitter: 'twitter',
  linkedin: 'linkedin',
  youtube: 'youtube',
  instagram: 'instagram',
}

export const socialMediaColors: Record<keyof SocialMediaLinks, string> = {
  facebook: 'bg-blue-600 hover:bg-blue-700 text-white',
  twitter: 'bg-black hover:bg-gray-800 text-white',
  linkedin: 'bg-blue-700 hover:bg-blue-800 text-white',
  youtube: 'bg-red-600 hover:bg-red-700 text-white',
  instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white',
}

// Clés utilisées dans l'API
const CONTENT_KEYS = {
  address: 'contact_address',
  phones: 'contact_phones',
  emails: 'contact_emails',
  hours: 'contact_hours',
  contact_form: 'contact_form_config',
  department_contacts: 'contact_department_contacts',
  social_media: 'contact_social_media',
} as const

// Mapping section → key
const sectionToKeyMap: Record<string, string> = {
  address: CONTENT_KEYS.address,
  phones: CONTENT_KEYS.phones,
  emails: CONTENT_KEYS.emails,
  hours: CONTENT_KEYS.hours,
  contact_form: CONTENT_KEYS.contact_form,
}

// ============================================================================
// Composable
// ============================================================================

export function useContactApi() {
  const { apiFetch } = useApi()

  // Cache pour les contenus
  const contentsCache = ref<Map<string, EditorialContentRead>>(new Map())

  // Cache pour les utilisateurs (pour enrichir l'historique)
  const usersCache = ref<Map<string, { first_name: string, last_name: string }>>(new Map())

  // =========================================================================
  // Helpers - Chargement des données
  // =========================================================================

  /**
   * Charge tous les contenus de contact depuis l'API.
   */
  async function loadContents(): Promise<Map<string, EditorialContentRead>> {
    try {
      const response = await apiFetch<PaginatedResponse<EditorialContentRead>>(
        '/api/admin/editorial/contents',
        {
          query: { category_code: 'contact', limit: 50 },
        },
      )

      contentsCache.value.clear()
      if (response?.items) {
        for (const content of response.items) {
          contentsCache.value.set(content.key, content)
        }
      }
    }
    catch (error) {
      console.error('Erreur lors du chargement des contenus de contact:', error)
    }

    return contentsCache.value
  }

  /**
   * Charge les utilisateurs pour enrichir l'historique.
   */
  async function loadUsers(): Promise<void> {
    if (usersCache.value.size > 0) return

    try {
      const response = await apiFetch<PaginatedResponse<{
        id: string
        first_name: string
        last_name: string
      }>>('/api/admin/users', {
        query: { limit: 100 },
      })

      if (response?.items) {
        for (const user of response.items) {
          usersCache.value.set(user.id, {
            first_name: user.first_name,
            last_name: user.last_name,
          })
        }
      }
    }
    catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    }
  }

  /**
   * Récupère un contenu par sa clé.
   */
  async function getContentByKey(key: string): Promise<EditorialContentRead | null> {
    // Vérifier le cache d'abord
    if (contentsCache.value.has(key)) {
      return contentsCache.value.get(key) || null
    }

    try {
      const content = await apiFetch<EditorialContentRead>(
        `/api/admin/editorial/contents/by-key/${key}`,
      )
      contentsCache.value.set(key, content)
      return content
    }
    catch (error) {
      console.error(`Erreur lors du chargement du contenu ${key}:`, error)
      return null
    }
  }

  /**
   * Parse une valeur JSON d'un contenu.
   */
  function parseContentValue<T>(content: EditorialContentRead | null, defaultValue: T): T {
    if (!content?.value) return defaultValue
    try {
      return JSON.parse(content.value) as T
    }
    catch {
      return defaultValue
    }
  }

  // =========================================================================
  // Récupération des données de contact
  // =========================================================================

  /**
   * Récupère toutes les informations de contact.
   */
  async function getContactInfo(): Promise<ContactInfo> {
    await loadContents()

    return {
      address: parseContentValue(
        contentsCache.value.get(CONTENT_KEYS.address) || null,
        { street: '', postal_code: '', city: '', country: '', latitude: 0, longitude: 0 },
      ),
      phones: parseContentValue(
        contentsCache.value.get(CONTENT_KEYS.phones) || null,
        { main: '', secondary: null, fax: null },
      ),
      emails: parseContentValue(
        contentsCache.value.get(CONTENT_KEYS.emails) || null,
        { general: '', admissions: '', partnerships: '', press: null },
      ),
      hours: parseContentValue(
        contentsCache.value.get(CONTENT_KEYS.hours) || null,
        { days: '', hours: '', timezone: '', closures: '' },
      ),
      contact_form: parseContentValue(
        contentsCache.value.get(CONTENT_KEYS.contact_form) || null,
        { default_recipients: [], subjects: [], confirmation_message: '' },
      ),
      department_contacts: parseContentValue(
        contentsCache.value.get(CONTENT_KEYS.department_contacts) || null,
        [],
      ),
      social_media: parseContentValue(
        contentsCache.value.get(CONTENT_KEYS.social_media) || null,
        { facebook: null, twitter: null, linkedin: null, youtube: null, instagram: null },
      ),
    }
  }

  /**
   * Récupère l'adresse.
   */
  async function getContactAddress(): Promise<ContactAddress> {
    const content = await getContentByKey(CONTENT_KEYS.address)
    return parseContentValue(content, {
      street: '',
      postal_code: '',
      city: '',
      country: '',
      latitude: 0,
      longitude: 0,
    })
  }

  /**
   * Récupère les contacts par département.
   */
  async function getDepartmentContacts(): Promise<DepartmentContact[]> {
    const content = await getContentByKey(CONTENT_KEYS.department_contacts)
    const contacts = parseContentValue<DepartmentContact[]>(content, [])
    return contacts.sort((a, b) => a.order - b.order)
  }

  // =========================================================================
  // Sauvegarde des données de contact
  // =========================================================================

  /**
   * Met à jour un contenu de contact.
   */
  async function updateContent(key: string, value: unknown): Promise<boolean> {
    const content = contentsCache.value.get(key)
    if (!content) {
      console.error(`Contenu ${key} non trouvé`)
      return false
    }

    try {
      await apiFetch<EditorialContentRead>(
        `/api/admin/editorial/contents/${content.id}`,
        {
          method: 'PUT',
          body: {
            value: JSON.stringify(value),
          },
        },
      )

      // Mettre à jour le cache
      content.value = JSON.stringify(value)
      content.updated_at = new Date().toISOString()
      contentsCache.value.set(key, content)

      return true
    }
    catch (error) {
      console.error(`Erreur lors de la mise à jour de ${key}:`, error)
      throw error
    }
  }

  /**
   * Sauvegarde une section de contact.
   */
  async function saveSection(
    section: 'address' | 'phones' | 'emails' | 'hours' | 'contact_form',
    data: ContactAddress | ContactPhones | ContactEmails | ContactHours | ContactFormConfig,
  ): Promise<boolean> {
    const key = sectionToKeyMap[section]
    if (!key) {
      console.error(`Section inconnue: ${section}`)
      return false
    }
    return updateContent(key, data)
  }

  /**
   * Sauvegarde l'adresse.
   */
  async function saveAddress(address: ContactAddress): Promise<boolean> {
    return updateContent(CONTENT_KEYS.address, address)
  }

  /**
   * Sauvegarde les téléphones.
   */
  async function savePhones(phones: ContactPhones): Promise<boolean> {
    return updateContent(CONTENT_KEYS.phones, phones)
  }

  /**
   * Sauvegarde les emails.
   */
  async function saveEmails(emails: ContactEmails): Promise<boolean> {
    return updateContent(CONTENT_KEYS.emails, emails)
  }

  /**
   * Sauvegarde les horaires.
   */
  async function saveHours(hours: ContactHours): Promise<boolean> {
    return updateContent(CONTENT_KEYS.hours, hours)
  }

  /**
   * Sauvegarde la configuration du formulaire.
   */
  async function saveFormConfig(config: ContactFormConfig): Promise<boolean> {
    return updateContent(CONTENT_KEYS.contact_form, config)
  }

  /**
   * Sauvegarde les contacts par département.
   */
  async function saveDepartmentContacts(contacts: DepartmentContact[]): Promise<boolean> {
    return updateContent(CONTENT_KEYS.department_contacts, contacts)
  }

  /**
   * Sauvegarde les réseaux sociaux.
   */
  async function saveSocialMedia(links: SocialMediaLinks): Promise<boolean> {
    return updateContent(CONTENT_KEYS.social_media, links)
  }

  // =========================================================================
  // Gestion des contacts par département (CRUD)
  // =========================================================================

  /**
   * Ajoute un contact de département.
   */
  async function addDepartmentContact(contact: Omit<DepartmentContact, 'id' | 'order'>): Promise<DepartmentContact> {
    const contacts = await getDepartmentContacts()

    const newContact: DepartmentContact = {
      ...contact,
      id: `dept_contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: contacts.length + 1,
    }

    contacts.push(newContact)
    await saveDepartmentContacts(contacts)

    return newContact
  }

  /**
   * Met à jour un contact de département.
   */
  async function updateDepartmentContact(
    id: string,
    data: Partial<Omit<DepartmentContact, 'id'>>,
  ): Promise<DepartmentContact | null> {
    const contacts = await getDepartmentContacts()
    const index = contacts.findIndex(c => c.id === id)

    if (index === -1) return null

    contacts[index] = { ...contacts[index], ...data }
    await saveDepartmentContacts(contacts)

    return contacts[index]
  }

  /**
   * Supprime un contact de département.
   */
  async function deleteDepartmentContact(id: string): Promise<boolean> {
    const contacts = await getDepartmentContacts()
    const filtered = contacts.filter(c => c.id !== id)

    if (filtered.length === contacts.length) return false

    // Réindexer l'ordre
    filtered.forEach((c, i) => {
      c.order = i + 1
    })

    await saveDepartmentContacts(filtered)
    return true
  }

  /**
   * Réordonne les contacts de département.
   */
  async function reorderDepartmentContacts(ids: string[]): Promise<DepartmentContact[]> {
    const contacts = await getDepartmentContacts()
    const contactsMap = new Map(contacts.map(c => [c.id, c]))

    const reordered: DepartmentContact[] = []
    ids.forEach((id, index) => {
      const contact = contactsMap.get(id)
      if (contact) {
        contact.order = index + 1
        reordered.push(contact)
      }
    })

    await saveDepartmentContacts(reordered)
    return reordered
  }

  // =========================================================================
  // Historique
  // =========================================================================

  /**
   * Récupère l'historique des modifications pour tous les contenus de contact.
   */
  async function getContactHistory(limit = 20): Promise<ContactHistory[]> {
    await loadContents()
    await loadUsers()

    const allHistory: ContactHistory[] = []

    // Récupérer l'historique pour chaque contenu de contact
    for (const [key, content] of contentsCache.value) {
      try {
        const history = await apiFetch<EditorialHistoryRead[]>(
          `/api/admin/editorial/contents/${content.id}/history`,
          { query: { limit: 10 } },
        )

        // Enrichir avec le nom de la section et de l'utilisateur
        const sectionLabel = Object.entries(CONTENT_KEYS).find(([, v]) => v === key)?.[0]
        const enrichedHistory = history.map((h) => {
          const user = h.modified_by_external_id
            ? usersCache.value.get(h.modified_by_external_id)
            : null

          return {
            ...h,
            content_key: key,
            section: sectionLabel ? contactSectionLabels[sectionLabel] : key,
            modified_by_name: user
              ? `${user.first_name} ${user.last_name}`
              : 'Système',
          }
        })

        allHistory.push(...enrichedHistory)
      }
      catch (error) {
        console.error(`Erreur lors du chargement de l'historique pour ${key}:`, error)
      }
    }

    // Trier par date décroissante et limiter
    return allHistory
      .sort((a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime())
      .slice(0, limit)
  }

  // =========================================================================
  // Statistiques
  // =========================================================================

  /**
   * Calcule les statistiques de contact.
   */
  async function getContactStats(): Promise<ContactStats> {
    await loadContents()

    const info = await getContactInfo()

    // Compter les réseaux sociaux actifs
    const activeSocialMedia = Object.values(info.social_media).filter(v => v !== null).length

    // Trouver la dernière mise à jour
    let lastUpdated = new Date(0).toISOString()
    for (const content of contentsCache.value.values()) {
      if (new Date(content.updated_at) > new Date(lastUpdated)) {
        lastUpdated = content.updated_at
      }
    }

    return {
      sections_count: Object.keys(contactSectionLabels).length,
      department_contacts_count: info.department_contacts.length,
      social_media_count: activeSocialMedia,
      last_updated: lastUpdated,
      form_subjects_count: info.contact_form.subjects.length,
    }
  }

  // =========================================================================
  // Validation
  // =========================================================================

  /**
   * Valide une adresse email.
   */
  function validateContactEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valide un numéro de téléphone.
   */
  function validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-]{8,20}$/
    return phoneRegex.test(phone)
  }

  /**
   * Valide les coordonnées GPS.
   */
  function validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  }

  // =========================================================================
  // Helpers d'affichage
  // =========================================================================

  /**
   * Génère l'URL Google Maps pour une adresse.
   */
  function getGoogleMapsUrl(address: ContactAddress): string {
    const query = encodeURIComponent(
      `${address.street}, ${address.postal_code} ${address.city}, ${address.country}`,
    )
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  /**
   * Génère l'URL Google Maps avec coordonnées.
   */
  function getGoogleMapsUrlWithCoords(address: ContactAddress): string {
    return `https://www.google.com/maps?q=${address.latitude},${address.longitude}`
  }

  /**
   * Génère un lien mailto.
   */
  function getMailtoLink(email: string, subject?: string): string {
    let link = `mailto:${email}`
    if (subject) {
      link += `?subject=${encodeURIComponent(subject)}`
    }
    return link
  }

  /**
   * Génère un lien tel.
   */
  function getTelLink(phone: string): string {
    return `tel:${phone.replace(/\s/g, '')}`
  }

  /**
   * Formate une date en français.
   */
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Génère un ID pour un contact de département.
   */
  function generateDepartmentContactId(): string {
    return `dept_contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Invalide le cache pour forcer un rechargement.
   */
  function invalidateCache(): void {
    contentsCache.value.clear()
    usersCache.value.clear()
  }

  // =========================================================================
  // Export
  // =========================================================================

  return {
    // Chargement
    loadContents,
    getContactInfo,
    getContactAddress,
    getDepartmentContacts,

    // Sauvegarde
    saveSection,
    saveAddress,
    savePhones,
    saveEmails,
    saveHours,
    saveFormConfig,
    saveDepartmentContacts,
    saveSocialMedia,

    // CRUD département contacts
    addDepartmentContact,
    updateDepartmentContact,
    deleteDepartmentContact,
    reorderDepartmentContacts,

    // Historique & stats
    getContactHistory,
    getContactStats,

    // Validation
    validateContactEmail,
    validatePhoneNumber,
    validateCoordinates,

    // Helpers
    getGoogleMapsUrl,
    getGoogleMapsUrlWithCoords,
    getMailtoLink,
    getTelLink,
    formatDate,
    generateDepartmentContactId,
    invalidateCache,

    // Constantes
    contactSectionLabels,
    contactSectionIcons,
    socialMediaLabels,
    socialMediaIcons,
    socialMediaColors,

    // Cache (pour debug)
    contentsCache,
  }
}
