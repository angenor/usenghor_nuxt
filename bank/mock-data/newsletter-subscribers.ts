/**
 * Mock data pour les abonnés newsletter (admin)
 * Aligné avec le schéma SQL: newsletter_subscribers (11_newsletter.sql)
 */

// Types alignés avec le schéma SQL
export type SubscriberSource = 'website_form' | 'manual' | 'import' | 'registration' | 'event'

export interface NewsletterSubscriber {
  id: string
  email: string
  last_name: string | null
  first_name: string | null
  user_external_id: string | null
  active: boolean
  unsubscribe_token: string
  source: SubscriberSource
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
}

export interface SubscriberFilters {
  search?: string
  active?: boolean | 'all'
  source?: SubscriberSource | 'all'
  date_from?: string
  date_to?: string
  sort_by?: 'email' | 'last_name' | 'subscribed_at' | 'source'
  sort_order?: 'asc' | 'desc'
}

export interface SubscriberStats {
  total: number
  active: number
  unsubscribed: number
  by_source: Record<SubscriberSource, number>
  growth_last_month: number
}

export interface ImportResult {
  imported: number
  duplicates: number
  invalid: number
  errors: Array<{ line: number; email: string; error: string }>
}

// Labels pour les sources
export const sourceLabels: Record<SubscriberSource, string> = {
  website_form: 'Formulaire site',
  manual: 'Ajout manuel',
  import: 'Import CSV',
  registration: 'Inscription formation',
  event: 'Inscription événement'
}

// Couleurs pour les sources
export const sourceColors: Record<SubscriberSource, string> = {
  website_form: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  manual: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  import: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  registration: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  event: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300'
}

// Générer un ID unique
export const generateSubscriberId = (): string => {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Générer un token de désinscription
export const generateUnsubscribeToken = (): string => {
  return `unsub_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
}

// Mock data - abonnés newsletter
export const mockNewsletterSubscribers: NewsletterSubscriber[] = [
  // Abonnés actifs via formulaire site
  {
    id: 'sub_001',
    email: 'amadou.diallo@gmail.com',
    last_name: 'Diallo',
    first_name: 'Amadou',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_abc123def456',
    source: 'website_form',
    subscribed_at: '2024-01-15T10:30:00Z',
    unsubscribed_at: null,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'sub_002',
    email: 'fatou.ndiaye@yahoo.fr',
    last_name: 'Ndiaye',
    first_name: 'Fatou',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_ghi789jkl012',
    source: 'website_form',
    subscribed_at: '2024-02-20T14:15:00Z',
    unsubscribed_at: null,
    created_at: '2024-02-20T14:15:00Z'
  },
  {
    id: 'sub_003',
    email: 'jean.kouassi@outlook.com',
    last_name: 'Kouassi',
    first_name: 'Jean',
    user_external_id: 'user_ext_001',
    active: true,
    unsubscribe_token: 'unsub_mno345pqr678',
    source: 'registration',
    subscribed_at: '2024-03-10T09:00:00Z',
    unsubscribed_at: null,
    created_at: '2024-03-10T09:00:00Z'
  },
  {
    id: 'sub_004',
    email: 'marie.toure@hotmail.com',
    last_name: 'Touré',
    first_name: 'Marie',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_stu901vwx234',
    source: 'website_form',
    subscribed_at: '2024-03-25T16:45:00Z',
    unsubscribed_at: null,
    created_at: '2024-03-25T16:45:00Z'
  },
  {
    id: 'sub_005',
    email: 'paul.mensah@gmail.com',
    last_name: 'Mensah',
    first_name: 'Paul',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_yza567bcd890',
    source: 'event',
    subscribed_at: '2024-04-05T11:20:00Z',
    unsubscribed_at: null,
    created_at: '2024-04-05T11:20:00Z'
  },
  // Abonnés importés
  {
    id: 'sub_006',
    email: 'aissatou.ba@edu.sn',
    last_name: 'Ba',
    first_name: 'Aissatou',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_efg123hij456',
    source: 'import',
    subscribed_at: '2024-04-15T08:00:00Z',
    unsubscribed_at: null,
    created_at: '2024-04-15T08:00:00Z'
  },
  {
    id: 'sub_007',
    email: 'moussa.camara@univ-dakar.sn',
    last_name: 'Camara',
    first_name: 'Moussa',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_klm789nop012',
    source: 'import',
    subscribed_at: '2024-04-15T08:00:00Z',
    unsubscribed_at: null,
    created_at: '2024-04-15T08:00:00Z'
  },
  {
    id: 'sub_008',
    email: 'kofi.asante@ghana.edu',
    last_name: 'Asante',
    first_name: 'Kofi',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_qrs345tuv678',
    source: 'import',
    subscribed_at: '2024-04-15T08:00:00Z',
    unsubscribed_at: null,
    created_at: '2024-04-15T08:00:00Z'
  },
  // Ajoutés manuellement
  {
    id: 'sub_009',
    email: 'directeur@partenaire-ong.org',
    last_name: 'Dubois',
    first_name: 'Pierre',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_wxy901zab234',
    source: 'manual',
    subscribed_at: '2024-05-01T10:00:00Z',
    unsubscribed_at: null,
    created_at: '2024-05-01T10:00:00Z'
  },
  {
    id: 'sub_010',
    email: 'presse@afrique-media.com',
    last_name: null,
    first_name: null,
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_cde567fgh890',
    source: 'manual',
    subscribed_at: '2024-05-10T14:30:00Z',
    unsubscribed_at: null,
    created_at: '2024-05-10T14:30:00Z'
  },
  // Inscrits via événements
  {
    id: 'sub_011',
    email: 'sarah.johnson@afridev.org',
    last_name: 'Johnson',
    first_name: 'Sarah',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_ijk123lmn456',
    source: 'event',
    subscribed_at: '2024-06-15T09:30:00Z',
    unsubscribed_at: null,
    created_at: '2024-06-15T09:30:00Z'
  },
  {
    id: 'sub_012',
    email: 'ibrahim.sow@gmail.com',
    last_name: 'Sow',
    first_name: 'Ibrahim',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_opq789rst012',
    source: 'event',
    subscribed_at: '2024-06-20T15:45:00Z',
    unsubscribed_at: null,
    created_at: '2024-06-20T15:45:00Z'
  },
  // Inscrits via formations
  {
    id: 'sub_013',
    email: 'adama.traore@student.usenghor.org',
    last_name: 'Traoré',
    first_name: 'Adama',
    user_external_id: 'user_ext_002',
    active: true,
    unsubscribe_token: 'unsub_uvw345xyz678',
    source: 'registration',
    subscribed_at: '2024-07-01T08:00:00Z',
    unsubscribed_at: null,
    created_at: '2024-07-01T08:00:00Z'
  },
  {
    id: 'sub_014',
    email: 'aminata.kone@edu.ml',
    last_name: 'Koné',
    first_name: 'Aminata',
    user_external_id: 'user_ext_003',
    active: true,
    unsubscribe_token: 'unsub_abc901def234',
    source: 'registration',
    subscribed_at: '2024-07-15T10:30:00Z',
    unsubscribed_at: null,
    created_at: '2024-07-15T10:30:00Z'
  },
  // Récents
  {
    id: 'sub_015',
    email: 'olivier.ndongo@cameroun.cm',
    last_name: 'Ndongo',
    first_name: 'Olivier',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_ghi567jkl890',
    source: 'website_form',
    subscribed_at: '2024-08-01T12:00:00Z',
    unsubscribed_at: null,
    created_at: '2024-08-01T12:00:00Z'
  },
  {
    id: 'sub_016',
    email: 'grace.okonkwo@nigeria.ng',
    last_name: 'Okonkwo',
    first_name: 'Grace',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_mno123pqr456',
    source: 'website_form',
    subscribed_at: '2024-08-10T09:15:00Z',
    unsubscribed_at: null,
    created_at: '2024-08-10T09:15:00Z'
  },
  {
    id: 'sub_017',
    email: 'youssef.benali@maroc.ma',
    last_name: 'Benali',
    first_name: 'Youssef',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_stu789vwx012',
    source: 'website_form',
    subscribed_at: '2024-09-05T14:20:00Z',
    unsubscribed_at: null,
    created_at: '2024-09-05T14:20:00Z'
  },
  {
    id: 'sub_018',
    email: 'awa.diop@senegal.sn',
    last_name: 'Diop',
    first_name: 'Awa',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_yza345bcd678',
    source: 'website_form',
    subscribed_at: '2024-10-01T11:00:00Z',
    unsubscribed_at: null,
    created_at: '2024-10-01T11:00:00Z'
  },
  {
    id: 'sub_019',
    email: 'pascal.hakizimana@rwanda.rw',
    last_name: 'Hakizimana',
    first_name: 'Pascal',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_efg901hij234',
    source: 'event',
    subscribed_at: '2024-10-15T16:30:00Z',
    unsubscribed_at: null,
    created_at: '2024-10-15T16:30:00Z'
  },
  {
    id: 'sub_020',
    email: 'celine.uwimana@burundi.bi',
    last_name: 'Uwimana',
    first_name: 'Céline',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_klm567nop890',
    source: 'website_form',
    subscribed_at: '2024-11-01T08:45:00Z',
    unsubscribed_at: null,
    created_at: '2024-11-01T08:45:00Z'
  },
  // Très récents (dernier mois)
  {
    id: 'sub_021',
    email: 'abdou.mbaye@gmail.com',
    last_name: 'Mbaye',
    first_name: 'Abdou',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_qrs123tuv456',
    source: 'website_form',
    subscribed_at: '2025-01-05T10:00:00Z',
    unsubscribed_at: null,
    created_at: '2025-01-05T10:00:00Z'
  },
  {
    id: 'sub_022',
    email: 'nadia.cherif@algerie.dz',
    last_name: 'Cherif',
    first_name: 'Nadia',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_wxy789zab012',
    source: 'registration',
    subscribed_at: '2025-01-10T14:30:00Z',
    unsubscribed_at: null,
    created_at: '2025-01-10T14:30:00Z'
  },
  {
    id: 'sub_023',
    email: 'benjamin.kotto@gabon.ga',
    last_name: 'Kotto',
    first_name: 'Benjamin',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_cde345fgh678',
    source: 'website_form',
    subscribed_at: '2025-01-15T09:20:00Z',
    unsubscribed_at: null,
    created_at: '2025-01-15T09:20:00Z'
  },
  {
    id: 'sub_024',
    email: 'mariama.barry@guinee.gn',
    last_name: 'Barry',
    first_name: 'Mariama',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_ijk901lmn234',
    source: 'manual',
    subscribed_at: '2025-01-20T11:45:00Z',
    unsubscribed_at: null,
    created_at: '2025-01-20T11:45:00Z'
  },
  // Désabonnés
  {
    id: 'sub_025',
    email: 'ancien.abonne@test.com',
    last_name: 'Ancien',
    first_name: 'Abonné',
    user_external_id: null,
    active: false,
    unsubscribe_token: 'unsub_opq567rst890',
    source: 'website_form',
    subscribed_at: '2023-06-01T10:00:00Z',
    unsubscribed_at: '2024-01-15T14:30:00Z',
    created_at: '2023-06-01T10:00:00Z'
  },
  {
    id: 'sub_026',
    email: 'desabo.user@example.org',
    last_name: 'Utilisateur',
    first_name: 'Désabonné',
    user_external_id: null,
    active: false,
    unsubscribe_token: 'unsub_uvw123xyz456',
    source: 'import',
    subscribed_at: '2023-08-15T08:00:00Z',
    unsubscribed_at: '2024-03-20T16:00:00Z',
    created_at: '2023-08-15T08:00:00Z'
  },
  {
    id: 'sub_027',
    email: 'parti.ailleurs@mail.com',
    last_name: 'Parti',
    first_name: 'Jean',
    user_external_id: null,
    active: false,
    unsubscribe_token: 'unsub_abc789def012',
    source: 'event',
    subscribed_at: '2023-10-01T12:00:00Z',
    unsubscribed_at: '2024-05-10T09:00:00Z',
    created_at: '2023-10-01T12:00:00Z'
  },
  {
    id: 'sub_028',
    email: 'plus.interesse@domain.net',
    last_name: null,
    first_name: null,
    user_external_id: null,
    active: false,
    unsubscribe_token: 'unsub_ghi345jkl678',
    source: 'website_form',
    subscribed_at: '2024-02-01T15:00:00Z',
    unsubscribed_at: '2024-08-01T10:30:00Z',
    created_at: '2024-02-01T15:00:00Z'
  },
  // Quelques abonnés supplémentaires pour plus de volume
  {
    id: 'sub_029',
    email: 'joseph.mobutu@congo.cd',
    last_name: 'Mobutu',
    first_name: 'Joseph',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_mno901pqr234',
    source: 'website_form',
    subscribed_at: '2024-12-01T10:00:00Z',
    unsubscribed_at: null,
    created_at: '2024-12-01T10:00:00Z'
  },
  {
    id: 'sub_030',
    email: 'aisha.mohamed@egypt.eg',
    last_name: 'Mohamed',
    first_name: 'Aisha',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_stu567vwx890',
    source: 'registration',
    subscribed_at: '2024-12-10T14:00:00Z',
    unsubscribed_at: null,
    created_at: '2024-12-10T14:00:00Z'
  },
  {
    id: 'sub_031',
    email: 'kwame.asiedu@togo.tg',
    last_name: 'Asiedu',
    first_name: 'Kwame',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_yza123bcd456',
    source: 'import',
    subscribed_at: '2024-12-15T09:30:00Z',
    unsubscribed_at: null,
    created_at: '2024-12-15T09:30:00Z'
  },
  {
    id: 'sub_032',
    email: 'fatima.zahra@tunisie.tn',
    last_name: 'Zahra',
    first_name: 'Fatima',
    user_external_id: null,
    active: true,
    unsubscribe_token: 'unsub_efg789hij012',
    source: 'website_form',
    subscribed_at: '2024-12-20T11:15:00Z',
    unsubscribed_at: null,
    created_at: '2024-12-20T11:15:00Z'
  }
]

// === FONCTIONS UTILITAIRES ===

// Récupérer tous les abonnés
export const getAllSubscribers = (filters?: SubscriberFilters): NewsletterSubscriber[] => {
  let result = [...mockNewsletterSubscribers]

  if (filters) {
    // Filtre par recherche
    if (filters.search) {
      const query = filters.search.toLowerCase()
      result = result.filter(s =>
        s.email.toLowerCase().includes(query) ||
        (s.first_name && s.first_name.toLowerCase().includes(query)) ||
        (s.last_name && s.last_name.toLowerCase().includes(query))
      )
    }

    // Filtre par statut actif
    if (filters.active !== undefined && filters.active !== 'all') {
      result = result.filter(s => s.active === filters.active)
    }

    // Filtre par source
    if (filters.source && filters.source !== 'all') {
      result = result.filter(s => s.source === filters.source)
    }

    // Filtre par date de début
    if (filters.date_from) {
      const fromDate = new Date(filters.date_from)
      result = result.filter(s => new Date(s.subscribed_at) >= fromDate)
    }

    // Filtre par date de fin
    if (filters.date_to) {
      const toDate = new Date(filters.date_to)
      toDate.setHours(23, 59, 59, 999)
      result = result.filter(s => new Date(s.subscribed_at) <= toDate)
    }

    // Tri
    if (filters.sort_by) {
      result.sort((a, b) => {
        let comparison = 0
        switch (filters.sort_by) {
          case 'email':
            comparison = a.email.localeCompare(b.email)
            break
          case 'last_name':
            comparison = (a.last_name || '').localeCompare(b.last_name || '')
            break
          case 'subscribed_at':
            comparison = new Date(a.subscribed_at).getTime() - new Date(b.subscribed_at).getTime()
            break
          case 'source':
            comparison = a.source.localeCompare(b.source)
            break
        }
        return filters.sort_order === 'desc' ? -comparison : comparison
      })
    } else {
      // Tri par défaut: date d'inscription décroissante
      result.sort((a, b) => new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime())
    }
  } else {
    // Tri par défaut
    result.sort((a, b) => new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime())
  }

  return result
}

// Récupérer un abonné par ID
export const getSubscriberById = (id: string): NewsletterSubscriber | undefined => {
  return mockNewsletterSubscribers.find(s => s.id === id)
}

// Récupérer un abonné par email
export const getSubscriberByEmail = (email: string): NewsletterSubscriber | undefined => {
  return mockNewsletterSubscribers.find(s => s.email.toLowerCase() === email.toLowerCase())
}

// Vérifier si un email existe déjà
export const isEmailTaken = (email: string, excludeId?: string): boolean => {
  return mockNewsletterSubscribers.some(
    s => s.email.toLowerCase() === email.toLowerCase() && s.id !== excludeId
  )
}

// Récupérer les statistiques
export const getSubscriberStats = (): SubscriberStats => {
  const total = mockNewsletterSubscribers.length
  const active = mockNewsletterSubscribers.filter(s => s.active).length
  const unsubscribed = total - active

  // Compter par source
  const by_source: Record<SubscriberSource, number> = {
    website_form: 0,
    manual: 0,
    import: 0,
    registration: 0,
    event: 0
  }

  mockNewsletterSubscribers.forEach(s => {
    by_source[s.source]++
  })

  // Croissance du dernier mois
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const growth_last_month = mockNewsletterSubscribers.filter(
    s => new Date(s.subscribed_at) >= oneMonthAgo && s.active
  ).length

  return {
    total,
    active,
    unsubscribed,
    by_source,
    growth_last_month
  }
}

// Valider un email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Simuler un import CSV
export const simulateImport = (emails: string[]): ImportResult => {
  const result: ImportResult = {
    imported: 0,
    duplicates: 0,
    invalid: 0,
    errors: []
  }

  emails.forEach((email, index) => {
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) {
      return // Ignorer les lignes vides
    }

    if (!validateEmail(trimmedEmail)) {
      result.invalid++
      result.errors.push({
        line: index + 1,
        email: trimmedEmail,
        error: 'Format email invalide'
      })
      return
    }

    if (isEmailTaken(trimmedEmail)) {
      result.duplicates++
      return
    }

    result.imported++
  })

  return result
}

// Export pour CSV
export const exportSubscribersToCSV = (subscribers: NewsletterSubscriber[]): string => {
  const headers = ['Email', 'Nom', 'Prénom', 'Source', 'Statut', 'Date inscription']
  const rows = subscribers.map(s => [
    s.email,
    s.last_name || '',
    s.first_name || '',
    sourceLabels[s.source],
    s.active ? 'Actif' : 'Désabonné',
    new Date(s.subscribed_at).toLocaleDateString('fr-FR')
  ])

  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}

// ============================================================================
// CAMPAGNES NEWSLETTER
// ============================================================================

export type CampaignStatus = 'draft' | 'scheduled' | 'sent'

export interface NewsletterCampaign {
  id: string
  title: string
  subject: string
  html_content: string | null
  text_content: string | null
  status: CampaignStatus
  scheduled_send_at: string | null
  sent_at: string | null
  recipient_count: number
  open_count: number
  click_count: number
  unsubscribe_count: number
  error_count: number
  created_by_external_id: string | null
  created_at: string
  updated_at: string
}

export interface NewsletterSend {
  id: string
  campaign_id: string
  subscriber_id: string
  email: string
  status: 'sent' | 'opened' | 'clicked' | 'error'
  sent_at: string
  opened_at: string | null
  clicked_at: string | null
  error_message: string | null
}

// Labels et couleurs pour les statuts de campagne
export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: 'Brouillon',
  scheduled: 'Programmée',
  sent: 'Envoyée'
}

export const campaignStatusColors: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
}

// Mock data - campagnes newsletter
export const mockNewsletterCampaigns: NewsletterCampaign[] = [
  {
    id: 'camp_001',
    title: 'Newsletter Janvier 2025',
    subject: 'Les actualités de l\'Université Senghor - Janvier 2025',
    html_content: '<h1>Newsletter</h1><p>Contenu...</p>',
    text_content: 'Newsletter - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2025-01-15T10:00:00Z',
    recipient_count: 3200,
    open_count: 1440,
    click_count: 256,
    unsubscribe_count: 8,
    error_count: 12,
    created_by_external_id: 'user_admin_001',
    created_at: '2025-01-10T14:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'camp_002',
    title: 'Newsletter Décembre 2024',
    subject: 'Bilan de l\'année 2024 - Université Senghor',
    html_content: '<h1>Bilan 2024</h1><p>Contenu...</p>',
    text_content: 'Bilan 2024 - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-12-20T09:00:00Z',
    recipient_count: 3150,
    open_count: 1512,
    click_count: 315,
    unsubscribe_count: 5,
    error_count: 8,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-20T09:00:00Z'
  },
  {
    id: 'camp_003',
    title: 'Newsletter Novembre 2024',
    subject: 'Nouvelles formations et partenariats - Novembre 2024',
    html_content: '<h1>Novembre</h1><p>Contenu...</p>',
    text_content: 'Novembre - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-11-18T10:30:00Z',
    recipient_count: 3100,
    open_count: 1333,
    click_count: 248,
    unsubscribe_count: 6,
    error_count: 5,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-11-12T11:00:00Z',
    updated_at: '2024-11-18T10:30:00Z'
  },
  {
    id: 'camp_004',
    title: 'Newsletter Octobre 2024',
    subject: 'Rentrée académique 2024-2025',
    html_content: '<h1>Rentrée</h1><p>Contenu...</p>',
    text_content: 'Rentrée - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-10-10T09:00:00Z',
    recipient_count: 3050,
    open_count: 1464,
    click_count: 305,
    unsubscribe_count: 4,
    error_count: 7,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-10-05T14:00:00Z',
    updated_at: '2024-10-10T09:00:00Z'
  },
  {
    id: 'camp_005',
    title: 'Newsletter Septembre 2024',
    subject: 'Préparez votre rentrée à l\'Université Senghor',
    html_content: '<h1>Septembre</h1><p>Contenu...</p>',
    text_content: 'Septembre - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-09-12T10:00:00Z',
    recipient_count: 3000,
    open_count: 1290,
    click_count: 240,
    unsubscribe_count: 7,
    error_count: 10,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-09-08T09:00:00Z',
    updated_at: '2024-09-12T10:00:00Z'
  },
  {
    id: 'camp_006',
    title: 'Newsletter Été 2024',
    subject: 'Actualités estivales - Juillet-Août 2024',
    html_content: '<h1>Été 2024</h1><p>Contenu...</p>',
    text_content: 'Été 2024 - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-08-01T10:00:00Z',
    recipient_count: 2950,
    open_count: 1180,
    click_count: 177,
    unsubscribe_count: 10,
    error_count: 15,
    created_by_external_id: 'user_admin_002',
    created_at: '2024-07-28T11:00:00Z',
    updated_at: '2024-08-01T10:00:00Z'
  },
  {
    id: 'camp_007',
    title: 'Newsletter Juin 2024',
    subject: 'Résultats des formations et cérémonies de remise de diplômes',
    html_content: '<h1>Juin 2024</h1><p>Contenu...</p>',
    text_content: 'Juin 2024 - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-06-20T09:30:00Z',
    recipient_count: 2900,
    open_count: 1392,
    click_count: 290,
    unsubscribe_count: 3,
    error_count: 6,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-06-15T14:00:00Z',
    updated_at: '2024-06-20T09:30:00Z'
  },
  {
    id: 'camp_008',
    title: 'Newsletter Mai 2024',
    subject: 'Conférences et événements - Mai 2024',
    html_content: '<h1>Mai 2024</h1><p>Contenu...</p>',
    text_content: 'Mai 2024 - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-05-15T10:00:00Z',
    recipient_count: 2850,
    open_count: 1197,
    click_count: 228,
    unsubscribe_count: 5,
    error_count: 8,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-05-10T10:00:00Z',
    updated_at: '2024-05-15T10:00:00Z'
  },
  {
    id: 'camp_009',
    title: 'Newsletter Avril 2024',
    subject: 'Nouveaux projets de développement - Avril 2024',
    html_content: '<h1>Avril 2024</h1><p>Contenu...</p>',
    text_content: 'Avril 2024 - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-04-18T10:00:00Z',
    recipient_count: 2800,
    open_count: 1232,
    click_count: 252,
    unsubscribe_count: 4,
    error_count: 5,
    created_by_external_id: 'user_admin_002',
    created_at: '2024-04-12T09:00:00Z',
    updated_at: '2024-04-18T10:00:00Z'
  },
  {
    id: 'camp_010',
    title: 'Newsletter Mars 2024',
    subject: 'Ouverture des inscriptions - Mars 2024',
    html_content: '<h1>Mars 2024</h1><p>Contenu...</p>',
    text_content: 'Mars 2024 - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-03-14T10:00:00Z',
    recipient_count: 2750,
    open_count: 1320,
    click_count: 302,
    unsubscribe_count: 6,
    error_count: 4,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-03-08T14:00:00Z',
    updated_at: '2024-03-14T10:00:00Z'
  },
  {
    id: 'camp_011',
    title: 'Newsletter Février 2024',
    subject: 'Partenariats internationaux - Février 2024',
    html_content: '<h1>Février 2024</h1><p>Contenu...</p>',
    text_content: 'Février 2024 - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-02-15T10:00:00Z',
    recipient_count: 2700,
    open_count: 1188,
    click_count: 243,
    unsubscribe_count: 5,
    error_count: 7,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-02-10T11:00:00Z',
    updated_at: '2024-02-15T10:00:00Z'
  },
  {
    id: 'camp_012',
    title: 'Newsletter Janvier 2024',
    subject: 'Bonne année 2024 - Université Senghor',
    html_content: '<h1>Janvier 2024</h1><p>Contenu...</p>',
    text_content: 'Janvier 2024 - Contenu...',
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-01-12T10:00:00Z',
    recipient_count: 2650,
    open_count: 1166,
    click_count: 239,
    unsubscribe_count: 8,
    error_count: 9,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-12T10:00:00Z'
  },
  // Campagnes en brouillon ou programmées
  {
    id: 'camp_013',
    title: 'Newsletter Février 2025',
    subject: 'Les actualités de Février 2025',
    html_content: '<h1>Février 2025</h1><p>En cours de rédaction...</p>',
    text_content: null,
    status: 'draft',
    scheduled_send_at: null,
    sent_at: null,
    recipient_count: 0,
    open_count: 0,
    click_count: 0,
    unsubscribe_count: 0,
    error_count: 0,
    created_by_external_id: 'user_admin_001',
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-01-22T14:30:00Z'
  },
  {
    id: 'camp_014',
    title: 'Annonce Conférence Internationale',
    subject: 'Invitation - Conférence sur le développement durable en Afrique',
    html_content: '<h1>Conférence</h1><p>Contenu...</p>',
    text_content: 'Conférence - Contenu...',
    status: 'scheduled',
    scheduled_send_at: '2025-02-01T09:00:00Z',
    sent_at: null,
    recipient_count: 3200,
    open_count: 0,
    click_count: 0,
    unsubscribe_count: 0,
    error_count: 0,
    created_by_external_id: 'user_admin_001',
    created_at: '2025-01-18T11:00:00Z',
    updated_at: '2025-01-23T15:00:00Z'
  }
]

// ============================================================================
// STATISTIQUES NEWSLETTER
// ============================================================================

export interface NewsletterGlobalStats {
  period: {
    from: string
    to: string
  }
  subscribers: {
    total_active: number
    new_this_period: number
    unsubscribed_this_period: number
    growth_rate: number
  }
  campaigns: {
    sent_count: number
    total_emails_sent: number
    avg_open_rate: number
    avg_click_rate: number
    avg_unsubscribe_rate: number
  }
}

export interface SubscriberEvolutionPoint {
  period: string
  new_subscribers: number
  unsubscribes: number
  net_growth: number
}

export interface CampaignPerformance {
  campaign_id: string
  title: string
  sent_at: string
  recipient_count: number
  open_rate: number
  click_rate: number
  unsubscribe_rate: number
}

export interface SourceDistribution {
  source: SubscriberSource
  count: number
  percentage: number
}

export interface BestSendTime {
  hour: number
  open_rate: number
}

export interface BestSendDay {
  day: string
  day_label: string
  open_rate: number
}

export interface SendTimeRecommendation {
  by_hour: BestSendTime[]
  by_day: BestSendDay[]
  recommendation: {
    best_day: string
    best_day_label: string
    best_hour: number
  }
}

export interface PeriodComparison {
  period1: NewsletterGlobalStats
  period2: NewsletterGlobalStats
  comparison: {
    subscribers_growth: string
    open_rate_change: string
    click_rate_change: string
  }
}

// Calculer les statistiques globales pour une période
export const getNewsletterGlobalStats = (dateFrom?: string, dateTo?: string): NewsletterGlobalStats => {
  const now = new Date()
  const from = dateFrom ? new Date(dateFrom) : new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const to = dateTo ? new Date(dateTo) : now

  // Filtrer les abonnés pour la période
  const activeSubscribers = mockNewsletterSubscribers.filter(s => s.active)
  const newSubscribers = mockNewsletterSubscribers.filter(s => {
    const subscribedDate = new Date(s.subscribed_at)
    return subscribedDate >= from && subscribedDate <= to && s.active
  })
  const unsubscribedThisPeriod = mockNewsletterSubscribers.filter(s => {
    if (!s.unsubscribed_at) return false
    const unsubDate = new Date(s.unsubscribed_at)
    return unsubDate >= from && unsubDate <= to
  })

  // Filtrer les campagnes envoyées dans la période
  const sentCampaigns = mockNewsletterCampaigns.filter(c => {
    if (c.status !== 'sent' || !c.sent_at) return false
    const sentDate = new Date(c.sent_at)
    return sentDate >= from && sentDate <= to
  })

  // Calculer les taux moyens
  const totalEmails = sentCampaigns.reduce((sum, c) => sum + c.recipient_count, 0)
  const totalOpens = sentCampaigns.reduce((sum, c) => sum + c.open_count, 0)
  const totalClicks = sentCampaigns.reduce((sum, c) => sum + c.click_count, 0)
  const totalUnsubs = sentCampaigns.reduce((sum, c) => sum + c.unsubscribe_count, 0)

  const avgOpenRate = totalEmails > 0 ? (totalOpens / totalEmails) * 100 : 0
  const avgClickRate = totalEmails > 0 ? (totalClicks / totalEmails) * 100 : 0
  const avgUnsubRate = totalEmails > 0 ? (totalUnsubs / totalEmails) * 100 : 0

  // Calcul du taux de croissance
  const previousPeriodStart = new Date(from)
  previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
  const previousActiveCount = mockNewsletterSubscribers.filter(s => {
    const subscribedDate = new Date(s.subscribed_at)
    return subscribedDate < from && s.active
  }).length
  const growthRate = previousActiveCount > 0
    ? ((activeSubscribers.length - previousActiveCount) / previousActiveCount) * 100
    : 0

  return {
    period: {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    },
    subscribers: {
      total_active: activeSubscribers.length,
      new_this_period: newSubscribers.length,
      unsubscribed_this_period: unsubscribedThisPeriod.length,
      growth_rate: Math.round(growthRate * 10) / 10
    },
    campaigns: {
      sent_count: sentCampaigns.length,
      total_emails_sent: totalEmails,
      avg_open_rate: Math.round(avgOpenRate * 10) / 10,
      avg_click_rate: Math.round(avgClickRate * 10) / 10,
      avg_unsubscribe_rate: Math.round(avgUnsubRate * 100) / 100
    }
  }
}

// Évolution des abonnés par mois
export const getSubscriberEvolution = (dateFrom?: string, dateTo?: string, granularity: 'day' | 'week' | 'month' = 'month'): SubscriberEvolutionPoint[] => {
  const now = new Date()
  const from = dateFrom ? new Date(dateFrom) : new Date(now.getFullYear() - 1, now.getMonth(), 1)
  const to = dateTo ? new Date(dateTo) : now

  const data: SubscriberEvolutionPoint[] = []

  if (granularity === 'month') {
    const current = new Date(from.getFullYear(), from.getMonth(), 1)
    while (current <= to) {
      const monthStart = new Date(current)
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59)

      const newSubs = mockNewsletterSubscribers.filter(s => {
        const date = new Date(s.subscribed_at)
        return date >= monthStart && date <= monthEnd
      }).length

      const unsubs = mockNewsletterSubscribers.filter(s => {
        if (!s.unsubscribed_at) return false
        const date = new Date(s.unsubscribed_at)
        return date >= monthStart && date <= monthEnd
      }).length

      data.push({
        period: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        new_subscribers: newSubs,
        unsubscribes: unsubs,
        net_growth: newSubs - unsubs
      })

      current.setMonth(current.getMonth() + 1)
    }
  }

  return data
}

// Performance des campagnes
export const getCampaignPerformance = (dateFrom?: string, dateTo?: string, sortBy: 'sent_at' | 'open_rate' | 'click_rate' = 'sent_at', sortOrder: 'asc' | 'desc' = 'desc'): CampaignPerformance[] => {
  const now = new Date()
  const from = dateFrom ? new Date(dateFrom) : new Date(now.getFullYear() - 1, now.getMonth(), 1)
  const to = dateTo ? new Date(dateTo) : now

  let campaigns = mockNewsletterCampaigns
    .filter(c => {
      if (c.status !== 'sent' || !c.sent_at) return false
      const sentDate = new Date(c.sent_at)
      return sentDate >= from && sentDate <= to
    })
    .map(c => ({
      campaign_id: c.id,
      title: c.title,
      sent_at: c.sent_at!,
      recipient_count: c.recipient_count,
      open_rate: c.recipient_count > 0 ? Math.round((c.open_count / c.recipient_count) * 1000) / 10 : 0,
      click_rate: c.recipient_count > 0 ? Math.round((c.click_count / c.recipient_count) * 1000) / 10 : 0,
      unsubscribe_rate: c.recipient_count > 0 ? Math.round((c.unsubscribe_count / c.recipient_count) * 1000) / 10 : 0
    }))

  // Tri
  campaigns.sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'sent_at':
        comparison = new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
        break
      case 'open_rate':
        comparison = a.open_rate - b.open_rate
        break
      case 'click_rate':
        comparison = a.click_rate - b.click_rate
        break
    }
    return sortOrder === 'desc' ? -comparison : comparison
  })

  return campaigns
}

// Répartition par source d'inscription
export const getSourceDistribution = (): SourceDistribution[] => {
  const activeSubscribers = mockNewsletterSubscribers.filter(s => s.active)
  const total = activeSubscribers.length

  const counts: Record<SubscriberSource, number> = {
    website_form: 0,
    manual: 0,
    import: 0,
    registration: 0,
    event: 0
  }

  activeSubscribers.forEach(s => {
    counts[s.source]++
  })

  return Object.entries(counts)
    .map(([source, count]) => ({
      source: source as SubscriberSource,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.count - a.count)
}

// Meilleures heures d'envoi (simulé)
export const getBestSendTimes = (): SendTimeRecommendation => {
  // Données simulées basées sur des patterns typiques
  const byHour: BestSendTime[] = [
    { hour: 9, open_rate: 48.5 },
    { hour: 10, open_rate: 46.2 },
    { hour: 11, open_rate: 42.8 },
    { hour: 14, open_rate: 44.1 },
    { hour: 15, open_rate: 41.5 },
    { hour: 16, open_rate: 38.2 },
    { hour: 17, open_rate: 35.0 },
    { hour: 8, open_rate: 40.5 }
  ].sort((a, b) => b.open_rate - a.open_rate)

  const dayLabels: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  }

  const byDay: BestSendDay[] = [
    { day: 'tuesday', day_label: 'Mardi', open_rate: 46.5 },
    { day: 'wednesday', day_label: 'Mercredi', open_rate: 45.2 },
    { day: 'thursday', day_label: 'Jeudi', open_rate: 44.8 },
    { day: 'monday', day_label: 'Lundi', open_rate: 42.1 },
    { day: 'friday', day_label: 'Vendredi', open_rate: 38.5 },
    { day: 'saturday', day_label: 'Samedi', open_rate: 32.0 },
    { day: 'sunday', day_label: 'Dimanche', open_rate: 28.5 }
  ].sort((a, b) => b.open_rate - a.open_rate)

  return {
    by_hour: byHour,
    by_day: byDay,
    recommendation: {
      best_day: byDay[0].day,
      best_day_label: byDay[0].day_label,
      best_hour: byHour[0].hour
    }
  }
}

// Comparaison de deux périodes
export const comparePeriods = (
  period1From: string, period1To: string,
  period2From: string, period2To: string
): PeriodComparison => {
  const stats1 = getNewsletterGlobalStats(period1From, period1To)
  const stats2 = getNewsletterGlobalStats(period2From, period2To)

  const subscribersChange = stats1.subscribers.total_active - stats2.subscribers.total_active
  const openRateChange = stats1.campaigns.avg_open_rate - stats2.campaigns.avg_open_rate
  const clickRateChange = stats1.campaigns.avg_click_rate - stats2.campaigns.avg_click_rate

  return {
    period1: stats1,
    period2: stats2,
    comparison: {
      subscribers_growth: `${subscribersChange >= 0 ? '+' : ''}${subscribersChange}`,
      open_rate_change: `${openRateChange >= 0 ? '+' : ''}${openRateChange.toFixed(1)}%`,
      click_rate_change: `${clickRateChange >= 0 ? '+' : ''}${clickRateChange.toFixed(1)}%`
    }
  }
}

// Récupérer toutes les campagnes
export const getAllCampaigns = (): NewsletterCampaign[] => {
  return [...mockNewsletterCampaigns].sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
}

// Récupérer une campagne par ID
export const getCampaignById = (id: string): NewsletterCampaign | undefined => {
  return mockNewsletterCampaigns.find(c => c.id === id)
}

// Statistiques des campagnes
export const getCampaignStats = () => {
  const sentCampaigns = mockNewsletterCampaigns.filter(c => c.status === 'sent')
  const totalEmails = sentCampaigns.reduce((sum, c) => sum + c.recipient_count, 0)
  const totalOpens = sentCampaigns.reduce((sum, c) => sum + c.open_count, 0)
  const totalClicks = sentCampaigns.reduce((sum, c) => sum + c.click_count, 0)

  return {
    total: mockNewsletterCampaigns.length,
    sent: sentCampaigns.length,
    draft: mockNewsletterCampaigns.filter(c => c.status === 'draft').length,
    scheduled: mockNewsletterCampaigns.filter(c => c.status === 'scheduled').length,
    avg_open_rate: totalEmails > 0 ? Math.round((totalOpens / totalEmails) * 1000) / 10 : 0,
    avg_click_rate: totalEmails > 0 ? Math.round((totalClicks / totalEmails) * 1000) / 10 : 0
  }
}
