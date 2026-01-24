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
