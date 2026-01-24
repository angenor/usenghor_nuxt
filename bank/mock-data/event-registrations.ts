/**
 * Mock Data: Inscriptions aux événements (Admin)
 * Gestion complète des inscriptions pour le back-office
 */

export type RegistrationStatus = 'registered' | 'confirmed' | 'cancelled' | 'attended'

export interface EventRegistration {
  id: string
  event_id: string
  event_title: string
  event_start_date: string
  user_external_id?: string // Si utilisateur inscrit
  first_name: string
  last_name: string
  email: string
  phone?: string
  organization?: string
  status: RegistrationStatus
  attended_at?: string
  created_at: string
  updated_at: string
}

export interface RegistrationStats {
  total: number
  registered: number
  confirmed: number
  cancelled: number
  attended: number
  capacity?: number
  available_spots?: number
}

// Labels pour les statuts
export const registrationStatusLabels: Record<RegistrationStatus, string> = {
  registered: 'Inscrit',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  attended: 'Présent'
}

// Couleurs pour les statuts
export const registrationStatusColors: Record<RegistrationStatus, string> = {
  registered: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  attended: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
}

// Génération d'ID
export const generateRegistrationId = () => `reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Données mock - inscriptions pour différents événements
export const mockRegistrations: EventRegistration[] = [
  // Inscriptions pour la conférence inaugurale (event-admin-1)
  {
    id: 'reg-1',
    event_id: 'event-admin-1',
    event_title: 'Conférence inaugurale : L\'avenir de la Francophonie en Afrique',
    event_start_date: '2026-01-25T09:00:00Z',
    user_external_id: 'user-ext-1',
    first_name: 'Fatou',
    last_name: 'Diallo',
    email: 'fatou.diallo@example.com',
    phone: '+221 77 123 45 67',
    organization: 'Ministère de l\'Éducation - Sénégal',
    status: 'confirmed',
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2025-12-05T14:00:00Z'
  },
  {
    id: 'reg-2',
    event_id: 'event-admin-1',
    event_title: 'Conférence inaugurale : L\'avenir de la Francophonie en Afrique',
    event_start_date: '2026-01-25T09:00:00Z',
    first_name: 'Amadou',
    last_name: 'Traoré',
    email: 'amadou.traore@example.com',
    phone: '+223 70 234 56 78',
    organization: 'Université de Bamako',
    status: 'confirmed',
    created_at: '2025-12-02T09:30:00Z',
    updated_at: '2025-12-06T10:00:00Z'
  },
  {
    id: 'reg-3',
    event_id: 'event-admin-1',
    event_title: 'Conférence inaugurale : L\'avenir de la Francophonie en Afrique',
    event_start_date: '2026-01-25T09:00:00Z',
    first_name: 'Marie',
    last_name: 'Kouassi',
    email: 'marie.kouassi@example.com',
    phone: '+225 07 345 67 89',
    organization: 'Centre de recherche CIRES',
    status: 'registered',
    created_at: '2025-12-10T11:00:00Z',
    updated_at: '2025-12-10T11:00:00Z'
  },
  {
    id: 'reg-4',
    event_id: 'event-admin-1',
    event_title: 'Conférence inaugurale : L\'avenir de la Francophonie en Afrique',
    event_start_date: '2026-01-25T09:00:00Z',
    first_name: 'Jean-Pierre',
    last_name: 'Nzamba',
    email: 'jp.nzamba@example.com',
    organization: 'ONG Développement Durable',
    status: 'cancelled',
    created_at: '2025-12-05T14:00:00Z',
    updated_at: '2025-12-20T09:00:00Z'
  },
  {
    id: 'reg-5',
    event_id: 'event-admin-1',
    event_title: 'Conférence inaugurale : L\'avenir de la Francophonie en Afrique',
    event_start_date: '2026-01-25T09:00:00Z',
    first_name: 'Aïcha',
    last_name: 'Ben Ali',
    email: 'aicha.benali@example.com',
    phone: '+216 20 456 78 90',
    organization: 'Institut supérieur de Tunis',
    status: 'confirmed',
    created_at: '2025-12-08T16:00:00Z',
    updated_at: '2025-12-12T11:00:00Z'
  },

  // Inscriptions pour l'atelier de leadership (event-admin-2)
  {
    id: 'reg-6',
    event_id: 'event-admin-2',
    event_title: 'Atelier de formation en leadership',
    event_start_date: '2026-02-10T09:00:00Z',
    first_name: 'Ibrahim',
    last_name: 'Konaté',
    email: 'ibrahim.konate@example.com',
    phone: '+226 70 567 89 01',
    organization: 'Ministère des Finances - Burkina Faso',
    status: 'confirmed',
    created_at: '2025-12-15T10:00:00Z',
    updated_at: '2025-12-18T14:00:00Z'
  },
  {
    id: 'reg-7',
    event_id: 'event-admin-2',
    event_title: 'Atelier de formation en leadership',
    event_start_date: '2026-02-10T09:00:00Z',
    first_name: 'Célestine',
    last_name: 'Moukoko',
    email: 'celestine.moukoko@example.com',
    phone: '+241 66 678 90 12',
    organization: 'Banque Centrale du Gabon',
    status: 'registered',
    created_at: '2025-12-20T09:00:00Z',
    updated_at: '2025-12-20T09:00:00Z'
  },
  {
    id: 'reg-8',
    event_id: 'event-admin-2',
    event_title: 'Atelier de formation en leadership',
    event_start_date: '2026-02-10T09:00:00Z',
    first_name: 'Moussa',
    last_name: 'Camara',
    email: 'moussa.camara@example.com',
    organization: 'Université Gaston Berger',
    status: 'confirmed',
    created_at: '2025-12-22T11:30:00Z',
    updated_at: '2025-12-28T10:00:00Z'
  },

  // Inscriptions pour la cérémonie de remise des diplômes (event-admin-3)
  {
    id: 'reg-9',
    event_id: 'event-admin-3',
    event_title: 'Cérémonie de remise des diplômes 2025',
    event_start_date: '2026-02-28T14:00:00Z',
    user_external_id: 'user-ext-2',
    first_name: 'Pascaline',
    last_name: 'Ouédraogo',
    email: 'pascaline.ouedraogo@example.com',
    phone: '+226 78 789 01 23',
    organization: 'Diplômée 2025 - Gouvernance',
    status: 'confirmed',
    created_at: '2025-11-01T08:00:00Z',
    updated_at: '2025-11-15T10:00:00Z'
  },
  {
    id: 'reg-10',
    event_id: 'event-admin-3',
    event_title: 'Cérémonie de remise des diplômes 2025',
    event_start_date: '2026-02-28T14:00:00Z',
    first_name: 'Abdoulaye',
    last_name: 'Sow',
    email: 'abdoulaye.sow@example.com',
    phone: '+221 76 890 12 34',
    organization: 'Famille du diplômé',
    status: 'confirmed',
    created_at: '2025-11-05T14:00:00Z',
    updated_at: '2025-11-10T09:00:00Z'
  },
  {
    id: 'reg-11',
    event_id: 'event-admin-3',
    event_title: 'Cérémonie de remise des diplômes 2025',
    event_start_date: '2026-02-28T14:00:00Z',
    first_name: 'Christelle',
    last_name: 'Mbarga',
    email: 'christelle.mbarga@example.com',
    organization: 'Diplômée 2025 - Culture',
    status: 'registered',
    created_at: '2026-01-10T11:00:00Z',
    updated_at: '2026-01-10T11:00:00Z'
  },

  // Inscriptions pour le webinaire IA (event-admin-7)
  {
    id: 'reg-12',
    event_id: 'event-admin-7',
    event_title: 'Webinaire : Intelligence artificielle et éducation en Afrique',
    event_start_date: '2026-02-15T14:00:00Z',
    first_name: 'Emmanuel',
    last_name: 'Ndongo',
    email: 'emmanuel.ndongo@example.com',
    phone: '+237 699 012 345',
    organization: 'Université de Yaoundé I',
    status: 'confirmed',
    created_at: '2026-01-12T10:00:00Z',
    updated_at: '2026-01-15T14:00:00Z'
  },
  {
    id: 'reg-13',
    event_id: 'event-admin-7',
    event_title: 'Webinaire : Intelligence artificielle et éducation en Afrique',
    event_start_date: '2026-02-15T14:00:00Z',
    first_name: 'Awa',
    last_name: 'Cissé',
    email: 'awa.cisse@example.com',
    organization: 'EdTech Sénégal',
    status: 'registered',
    created_at: '2026-01-18T09:00:00Z',
    updated_at: '2026-01-18T09:00:00Z'
  },
  {
    id: 'reg-14',
    event_id: 'event-admin-7',
    event_title: 'Webinaire : Intelligence artificielle et éducation en Afrique',
    event_start_date: '2026-02-15T14:00:00Z',
    first_name: 'Paul',
    last_name: 'Mensah',
    email: 'paul.mensah@example.com',
    phone: '+233 24 123 456',
    organization: 'Ghana Tech University',
    status: 'registered',
    created_at: '2026-01-20T15:00:00Z',
    updated_at: '2026-01-20T15:00:00Z'
  },

  // Inscriptions pour un événement passé avec présences (event-admin-9)
  {
    id: 'reg-15',
    event_id: 'event-admin-9',
    event_title: 'Conférence sur l\'intelligence artificielle et l\'éducation',
    event_start_date: '2025-12-05T09:00:00Z',
    first_name: 'Sophie',
    last_name: 'Ahounou',
    email: 'sophie.ahounou@example.com',
    phone: '+229 97 234 567',
    organization: 'Université d\'Abomey-Calavi',
    status: 'attended',
    attended_at: '2025-12-05T08:45:00Z',
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-12-05T08:45:00Z'
  },
  {
    id: 'reg-16',
    event_id: 'event-admin-9',
    event_title: 'Conférence sur l\'intelligence artificielle et l\'éducation',
    event_start_date: '2025-12-05T09:00:00Z',
    first_name: 'François',
    last_name: 'Kabore',
    email: 'francois.kabore@example.com',
    organization: 'Ministère de l\'Éducation - Burkina Faso',
    status: 'attended',
    attended_at: '2025-12-05T08:50:00Z',
    created_at: '2025-11-05T14:00:00Z',
    updated_at: '2025-12-05T08:50:00Z'
  },
  {
    id: 'reg-17',
    event_id: 'event-admin-9',
    event_title: 'Conférence sur l\'intelligence artificielle et l\'éducation',
    event_start_date: '2025-12-05T09:00:00Z',
    first_name: 'Mariam',
    last_name: 'Touré',
    email: 'mariam.toure@example.com',
    phone: '+223 76 345 678',
    organization: 'Institut Polytechnique Rural',
    status: 'cancelled',
    created_at: '2025-11-10T11:00:00Z',
    updated_at: '2025-12-01T09:00:00Z'
  },
  {
    id: 'reg-18',
    event_id: 'event-admin-9',
    event_title: 'Conférence sur l\'intelligence artificielle et l\'éducation',
    event_start_date: '2025-12-05T09:00:00Z',
    first_name: 'Koffi',
    last_name: 'Agbodjan',
    email: 'koffi.agbodjan@example.com',
    organization: 'Université de Lomé',
    status: 'attended',
    attended_at: '2025-12-05T08:55:00Z',
    created_at: '2025-11-08T16:00:00Z',
    updated_at: '2025-12-05T08:55:00Z'
  },

  // Inscriptions pour l'atelier entrepreneuriat passé (event-admin-10)
  {
    id: 'reg-19',
    event_id: 'event-admin-10',
    event_title: 'Atelier entrepreneuriat africain',
    event_start_date: '2025-11-18T09:00:00Z',
    first_name: 'Binta',
    last_name: 'Barry',
    email: 'binta.barry@example.com',
    phone: '+224 628 123 456',
    organization: 'Startup Conakry',
    status: 'attended',
    attended_at: '2025-11-18T08:45:00Z',
    created_at: '2025-10-15T10:00:00Z',
    updated_at: '2025-11-18T08:45:00Z'
  },
  {
    id: 'reg-20',
    event_id: 'event-admin-10',
    event_title: 'Atelier entrepreneuriat africain',
    event_start_date: '2025-11-18T09:00:00Z',
    first_name: 'Olivier',
    last_name: 'Tshimanga',
    email: 'olivier.tshimanga@example.com',
    organization: 'Congo Business Hub',
    status: 'attended',
    attended_at: '2025-11-18T08:50:00Z',
    created_at: '2025-10-20T14:00:00Z',
    updated_at: '2025-11-18T08:50:00Z'
  },

  // Quelques inscriptions supplémentaires pour le séminaire gouvernance (event-admin-4)
  {
    id: 'reg-21',
    event_id: 'event-admin-4',
    event_title: 'Séminaire international sur la gouvernance',
    event_start_date: '2026-03-15T09:00:00Z',
    first_name: 'Raoul',
    last_name: 'Mbemba',
    email: 'raoul.mbemba@example.com',
    phone: '+242 06 456 789',
    organization: 'ENA Congo',
    status: 'registered',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'reg-22',
    event_id: 'event-admin-4',
    event_title: 'Séminaire international sur la gouvernance',
    event_start_date: '2026-03-15T09:00:00Z',
    first_name: 'Aminata',
    last_name: 'Diop',
    email: 'aminata.diop@example.com',
    organization: 'Inspection Générale d\'État',
    status: 'confirmed',
    created_at: '2026-01-10T11:00:00Z',
    updated_at: '2026-01-18T14:00:00Z'
  }
]

// Fonctions utilitaires

// Récupérer toutes les inscriptions
export const getAllRegistrations = () =>
  [...mockRegistrations].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

// Récupérer une inscription par ID
export const getRegistrationById = (id: string) =>
  mockRegistrations.find(r => r.id === id)

// Récupérer les inscriptions pour un événement
export const getRegistrationsByEventId = (eventId: string) =>
  mockRegistrations
    .filter(r => r.event_id === eventId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

// Statistiques globales des inscriptions
export const getGlobalRegistrationStats = (): RegistrationStats => {
  return {
    total: mockRegistrations.length,
    registered: mockRegistrations.filter(r => r.status === 'registered').length,
    confirmed: mockRegistrations.filter(r => r.status === 'confirmed').length,
    cancelled: mockRegistrations.filter(r => r.status === 'cancelled').length,
    attended: mockRegistrations.filter(r => r.status === 'attended').length
  }
}

// Statistiques des inscriptions pour un événement
export const getEventRegistrationStats = (eventId: string, capacity?: number): RegistrationStats => {
  const eventRegistrations = mockRegistrations.filter(r => r.event_id === eventId)
  const activeCount = eventRegistrations.filter(r => r.status !== 'cancelled').length

  return {
    total: eventRegistrations.length,
    registered: eventRegistrations.filter(r => r.status === 'registered').length,
    confirmed: eventRegistrations.filter(r => r.status === 'confirmed').length,
    cancelled: eventRegistrations.filter(r => r.status === 'cancelled').length,
    attended: eventRegistrations.filter(r => r.status === 'attended').length,
    capacity,
    available_spots: capacity ? Math.max(0, capacity - activeCount) : undefined
  }
}

// Interface pour les filtres
export interface RegistrationFilters {
  event_id?: string
  status?: RegistrationStatus
  date_from?: string
  date_to?: string
  search?: string
}

// Récupérer les inscriptions filtrées
export const getFilteredRegistrations = (filters?: RegistrationFilters) => {
  let result = [...mockRegistrations]

  if (filters?.event_id) {
    result = result.filter(r => r.event_id === filters.event_id)
  }

  if (filters?.status) {
    result = result.filter(r => r.status === filters.status)
  }

  if (filters?.date_from) {
    const fromDate = new Date(filters.date_from)
    result = result.filter(r => new Date(r.created_at) >= fromDate)
  }

  if (filters?.date_to) {
    const toDate = new Date(filters.date_to)
    result = result.filter(r => new Date(r.created_at) <= toDate)
  }

  if (filters?.search) {
    const query = filters.search.toLowerCase()
    result = result.filter(r =>
      r.first_name.toLowerCase().includes(query) ||
      r.last_name.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      r.organization?.toLowerCase().includes(query) ||
      r.event_title.toLowerCase().includes(query)
    )
  }

  return result.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

// Liste des événements ayant des inscriptions (pour le select)
export const getEventsWithRegistrations = () => {
  const eventIds = [...new Set(mockRegistrations.map(r => r.event_id))]
  return eventIds.map(id => {
    const reg = mockRegistrations.find(r => r.event_id === id)
    return {
      id,
      title: reg?.event_title || '',
      start_date: reg?.event_start_date || ''
    }
  }).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
}
