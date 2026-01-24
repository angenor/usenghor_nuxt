// ============================================================================
// MOCK DATA - JOURNAL D'AUDIT (AUDIT LOGS)
// ============================================================================
// Basé sur le schéma SQL: 02_identity.sql
// Table: audit_logs
// Trace des actions effectuées dans le back-office
// ============================================================================

// Types d'actions d'audit
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout'

// Structure d'un log d'audit (aligné sur le schéma SQL)
export interface AuditLog {
  id: string
  user_id: string | null  // Pas de FK pour permettre la suppression d'utilisateurs
  action: AuditAction
  table_name: string | null
  record_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  // Champs enrichis pour l'affichage (joins)
  user?: {
    id: string
    name: string
    email: string
  }
  summary?: string  // Résumé de l'action pour l'affichage
}

// Structure d'un changement détaillé
export interface AuditChange {
  field: string
  old: unknown
  new: unknown
}

// Structure du détail d'un événement
export interface AuditLogDetail extends AuditLog {
  changes: AuditChange[]
}

// Filtres pour la liste des logs
export interface AuditLogFilters {
  user_id?: string
  action?: AuditAction
  table_name?: string
  date_from?: string
  date_to?: string
  ip_address?: string
  search?: string
}

// Statistiques d'audit
export interface AuditStats {
  total_events: number
  by_action: Record<AuditAction, number>
  by_table: { table: string; count: number }[]
  by_user: { user_id: string; user_name: string; count: number }[]
  by_day: { date: string; count: number }[]
}

// Labels des actions
export const auditActionLabels: Record<AuditAction, string> = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  login: 'Connexion',
  logout: 'Déconnexion'
}

// Couleurs des actions
export const auditActionColors: Record<AuditAction, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  login: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  logout: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
}

// Icônes des actions
export const auditActionIcons: Record<AuditAction, string> = {
  create: 'plus',
  update: 'pen',
  delete: 'trash',
  login: 'right-to-bracket',
  logout: 'right-from-bracket'
}

// Labels des tables
export const tableLabels: Record<string, string> = {
  news: 'Actualités',
  events: 'Événements',
  formations: 'Formations',
  applications: 'Candidatures',
  partners: 'Partenaires',
  users: 'Utilisateurs',
  roles: 'Rôles',
  media: 'Médias',
  calls: 'Appels à candidatures',
  projects: 'Projets',
  departments: 'Départements',
  services: 'Services',
  campus: 'Campus',
  editorial: 'Contenus éditoriaux',
  newsletter: 'Newsletter',
  albums: 'Albums',
  tags: 'Étiquettes'
}

// User agents mock pour diversité
const userAgents: string[] = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

// Utilisateurs mock
const mockUsers = [
  { id: 'user-001', name: 'Marie Dupont', email: 'marie.dupont@usenghor.org' },
  { id: 'user-002', name: 'Jean Martin', email: 'jean.martin@usenghor.org' },
  { id: 'user-003', name: 'Sophie Bernard', email: 'sophie.bernard@usenghor.org' },
  { id: 'user-004', name: 'Pierre Durand', email: 'pierre.durand@usenghor.org' },
  { id: 'user-005', name: 'Aminata Koné', email: 'aminata.kone@usenghor.org' },
  { id: 'user-006', name: 'Ibrahim Touré', email: 'ibrahim.toure@usenghor.org' },
  { id: 'user-007', name: 'Alice Mbeki', email: 'alice.mbeki@usenghor.org' }
]

// ============================================================================
// DONNÉES MOCK
// ============================================================================

export const mockAuditLogs: AuditLog[] = [
  // Connexions récentes
  {
    id: 'audit-001',
    user_id: 'user-001',
    action: 'login',
    table_name: null,
    record_id: null,
    old_values: null,
    new_values: { success: true },
    ip_address: '192.168.1.100',
    user_agent: userAgents[0],
    created_at: '2025-01-24T08:30:00Z',
    user: mockUsers[0],
    summary: 'Connexion réussie'
  },
  {
    id: 'audit-002',
    user_id: 'user-002',
    action: 'login',
    table_name: null,
    record_id: null,
    old_values: null,
    new_values: { success: true },
    ip_address: '192.168.1.101',
    user_agent: userAgents[1],
    created_at: '2025-01-24T08:15:00Z',
    user: mockUsers[1],
    summary: 'Connexion réussie'
  },
  // Création d'actualité
  {
    id: 'audit-003',
    user_id: 'user-001',
    action: 'create',
    table_name: 'news',
    record_id: 'news-siege-1',
    old_values: null,
    new_values: {
      title_fr: "L'Université Senghor célèbre ses 35 ans",
      status: 'draft',
      author_id: 'user-001'
    },
    ip_address: '192.168.1.100',
    user_agent: userAgents[0],
    created_at: '2025-01-23T09:15:00Z',
    user: mockUsers[0],
    summary: "Création de l'actualité 'L'Université Senghor célèbre ses 35 ans'"
  },
  // Modification de formation
  {
    id: 'audit-004',
    user_id: 'user-002',
    action: 'update',
    table_name: 'formations',
    record_id: 'formation-mae',
    old_values: {
      application_open: false,
      updated_at: '2025-01-20T10:00:00Z'
    },
    new_values: {
      application_open: true,
      updated_at: '2025-01-23T08:45:00Z'
    },
    ip_address: '192.168.1.101',
    user_agent: userAgents[1],
    created_at: '2025-01-23T08:45:00Z',
    user: mockUsers[1],
    summary: "Ouverture des candidatures pour 'Master Administration des Entreprises'"
  },
  // Validation de candidature
  {
    id: 'audit-005',
    user_id: 'user-003',
    action: 'update',
    table_name: 'applications',
    record_id: 'app-2025-1234',
    old_values: {
      status: 'submitted',
      reviewer_id: null
    },
    new_values: {
      status: 'validated',
      reviewer_id: 'user-003',
      validated_at: '2025-01-23T08:30:00Z'
    },
    ip_address: '10.0.0.50',
    user_agent: userAgents[2],
    created_at: '2025-01-23T08:30:00Z',
    user: mockUsers[2],
    summary: "Validation du dossier #2025-1234 (Amadou Diallo)"
  },
  // Création de partenaire
  {
    id: 'audit-006',
    user_id: 'user-004',
    action: 'create',
    table_name: 'partners',
    record_id: 'partner-ucad',
    old_values: null,
    new_values: {
      name: 'Université Cheikh Anta Diop de Dakar',
      country: 'SN',
      partner_type: 'academic',
      active: true
    },
    ip_address: '41.223.120.88',
    user_agent: userAgents[3],
    created_at: '2025-01-23T07:00:00Z',
    user: mockUsers[3],
    summary: "Ajout du partenaire 'Université Cheikh Anta Diop de Dakar'"
  },
  // Modification d'événement
  {
    id: 'audit-007',
    user_id: 'user-001',
    action: 'update',
    table_name: 'events',
    record_id: 'event-001',
    old_values: {
      location_fr: 'Salle principale',
      capacity: 100
    },
    new_values: {
      location_fr: 'Amphithéâtre Senghor',
      capacity: 250
    },
    ip_address: '192.168.1.100',
    user_agent: userAgents[0],
    created_at: '2025-01-22T16:30:00Z',
    user: mockUsers[0],
    summary: "Modification du lieu de 'Conférence internationale 2025'"
  },
  // Création d'événement
  {
    id: 'audit-008',
    user_id: 'user-005',
    action: 'create',
    table_name: 'events',
    record_id: 'event-002',
    old_values: null,
    new_values: {
      title_fr: 'Atelier Design Thinking',
      date: '2025-02-15',
      type: 'workshop'
    },
    ip_address: '197.159.2.45',
    user_agent: userAgents[4],
    created_at: '2025-01-22T14:00:00Z',
    user: mockUsers[4],
    summary: "Création de l'événement 'Atelier Design Thinking'"
  },
  // Suppression de brouillon
  {
    id: 'audit-009',
    user_id: 'user-002',
    action: 'delete',
    table_name: 'news',
    record_id: 'news-draft-001',
    old_values: {
      title_fr: 'Brouillon - Événement annulé',
      status: 'draft',
      created_at: '2025-01-15T10:00:00Z'
    },
    new_values: null,
    ip_address: '192.168.1.101',
    user_agent: userAgents[1],
    created_at: '2025-01-22T11:20:00Z',
    user: mockUsers[1],
    summary: "Suppression du brouillon 'Événement annulé'"
  },
  // Rejet de candidature
  {
    id: 'audit-010',
    user_id: 'user-003',
    action: 'update',
    table_name: 'applications',
    record_id: 'app-2025-1235',
    old_values: {
      status: 'submitted',
      rejection_reason: null
    },
    new_values: {
      status: 'rejected',
      rejection_reason: 'Dossier incomplet - pièces manquantes',
      rejected_at: '2025-01-22T10:45:00Z'
    },
    ip_address: '10.0.0.50',
    user_agent: userAgents[2],
    created_at: '2025-01-22T10:45:00Z',
    user: mockUsers[2],
    summary: "Rejet du dossier #2025-1235 (Fatou Sow)"
  },
  // Création d'utilisateur
  {
    id: 'audit-011',
    user_id: 'user-006',
    action: 'create',
    table_name: 'users',
    record_id: 'user-007',
    old_values: null,
    new_values: {
      email: 'alice.mbeki@usenghor.org',
      first_name: 'Alice',
      last_name: 'Mbeki',
      role: 'editor'
    },
    ip_address: '10.0.0.51',
    user_agent: userAgents[0],
    created_at: '2025-01-22T09:00:00Z',
    user: mockUsers[5],
    summary: "Création du compte utilisateur 'Alice Mbeki'"
  },
  // Mise à la une d'actualité
  {
    id: 'audit-012',
    user_id: 'user-001',
    action: 'update',
    table_name: 'news',
    record_id: 'news-siege-2',
    old_values: {
      is_featured: false,
      highlight_status: 'none'
    },
    new_values: {
      is_featured: true,
      highlight_status: 'featured',
      featured_at: '2025-01-21T17:30:00Z'
    },
    ip_address: '192.168.1.100',
    user_agent: userAgents[0],
    created_at: '2025-01-21T17:30:00Z',
    user: mockUsers[0],
    summary: "Mise à la une de l'actualité 'Nouveau partenariat stratégique avec l'OIF'"
  },
  // Modification de partenaire
  {
    id: 'audit-013',
    user_id: 'user-004',
    action: 'update',
    table_name: 'partners',
    record_id: 'partner-oif',
    old_values: {
      partner_type: 'academic'
    },
    new_values: {
      partner_type: 'institutional'
    },
    ip_address: '41.223.120.88',
    user_agent: userAgents[3],
    created_at: '2025-01-21T15:00:00Z',
    user: mockUsers[3],
    summary: "Modification du type de partenaire 'OIF'"
  },
  // Création d'appel
  {
    id: 'audit-014',
    user_id: 'user-005',
    action: 'create',
    table_name: 'calls',
    record_id: 'call-2025-001',
    old_values: null,
    new_values: {
      title_fr: 'Appel à candidatures - Master Management 2025',
      type: 'master',
      deadline: '2025-03-31'
    },
    ip_address: '197.159.2.45',
    user_agent: userAgents[4],
    created_at: '2025-01-21T10:30:00Z',
    user: mockUsers[4],
    summary: "Création de l'appel 'Master Management 2025'"
  },
  // Publication de formation
  {
    id: 'audit-015',
    user_id: 'user-002',
    action: 'update',
    table_name: 'formations',
    record_id: 'formation-msp',
    old_values: {
      is_published: false,
      status: 'draft'
    },
    new_values: {
      is_published: true,
      status: 'published',
      published_at: '2025-01-20T14:20:00Z'
    },
    ip_address: '192.168.1.101',
    user_agent: userAgents[1],
    created_at: '2025-01-20T14:20:00Z',
    user: mockUsers[1],
    summary: "Publication de la formation 'Master Santé Publique'"
  },
  // Validation de candidature
  {
    id: 'audit-016',
    user_id: 'user-003',
    action: 'update',
    table_name: 'applications',
    record_id: 'app-2025-1230',
    old_values: {
      status: 'submitted'
    },
    new_values: {
      status: 'validated',
      validated_at: '2025-01-20T11:00:00Z'
    },
    ip_address: '10.0.0.50',
    user_agent: userAgents[2],
    created_at: '2025-01-20T11:00:00Z',
    user: mockUsers[2],
    summary: "Validation du dossier #2025-1230 (Ousmane Ba)"
  },
  // Changement de rôle utilisateur
  {
    id: 'audit-017',
    user_id: 'user-006',
    action: 'update',
    table_name: 'users',
    record_id: 'user-003',
    old_values: {
      role: 'editor'
    },
    new_values: {
      role: 'admin',
      promoted_at: '2025-01-20T09:15:00Z'
    },
    ip_address: '10.0.0.51',
    user_agent: userAgents[0],
    created_at: '2025-01-20T09:15:00Z',
    user: mockUsers[5],
    summary: "Promotion de 'Sophie Bernard' au rôle administrateur"
  },
  // Déconnexion
  {
    id: 'audit-018',
    user_id: 'user-001',
    action: 'logout',
    table_name: null,
    record_id: null,
    old_values: null,
    new_values: { session_duration: '8h30m' },
    ip_address: '192.168.1.100',
    user_agent: userAgents[0],
    created_at: '2025-01-19T18:00:00Z',
    user: mockUsers[0],
    summary: 'Déconnexion (session: 8h30m)'
  },
  // Suppression de média
  {
    id: 'audit-019',
    user_id: 'user-001',
    action: 'delete',
    table_name: 'media',
    record_id: 'media-old-001',
    old_values: {
      filename: 'photo-event-2020.jpg',
      type: 'image',
      size: 2456789
    },
    new_values: null,
    ip_address: '192.168.1.100',
    user_agent: userAgents[0],
    created_at: '2025-01-19T16:45:00Z',
    user: mockUsers[0],
    summary: "Suppression du média 'photo-event-2020.jpg'"
  },
  // Création de partenaire
  {
    id: 'audit-020',
    user_id: 'user-004',
    action: 'create',
    table_name: 'partners',
    record_id: 'partner-auf',
    old_values: null,
    new_values: {
      name: 'Agence Universitaire de la Francophonie',
      country: 'FR',
      partner_type: 'institutional'
    },
    ip_address: '41.223.120.88',
    user_agent: userAgents[3],
    created_at: '2025-01-19T14:00:00Z',
    user: mockUsers[3],
    summary: "Ajout du partenaire 'Agence Universitaire de la Francophonie'"
  },
  // Modification date événement
  {
    id: 'audit-021',
    user_id: 'user-005',
    action: 'update',
    table_name: 'events',
    record_id: 'event-003',
    old_values: {
      date: '2025-02-15'
    },
    new_values: {
      date: '2025-02-20',
      reason: 'Report pour disponibilité salle'
    },
    ip_address: '197.159.2.45',
    user_agent: userAgents[4],
    created_at: '2025-01-19T10:30:00Z',
    user: mockUsers[4],
    summary: "Report de la 'Cérémonie de remise des diplômes' au 20/02/2025"
  },
  // Création de formation
  {
    id: 'audit-022',
    user_id: 'user-002',
    action: 'create',
    table_name: 'formations',
    record_id: 'formation-du-ia',
    old_values: null,
    new_values: {
      name_fr: 'DU Intelligence Artificielle et Développement',
      type: 'du',
      duration_months: 6
    },
    ip_address: '192.168.1.101',
    user_agent: userAgents[1],
    created_at: '2025-01-18T15:30:00Z',
    user: mockUsers[1],
    summary: "Création de la formation 'DU Intelligence Artificielle et Développement'"
  },
  // Validation de candidature
  {
    id: 'audit-023',
    user_id: 'user-003',
    action: 'update',
    table_name: 'applications',
    record_id: 'app-2025-1228',
    old_values: {
      status: 'submitted'
    },
    new_values: {
      status: 'validated'
    },
    ip_address: '10.0.0.50',
    user_agent: userAgents[2],
    created_at: '2025-01-18T11:15:00Z',
    user: mockUsers[2],
    summary: "Validation du dossier #2025-1228 (Mariam Cissé)"
  },
  // Connexion échouée
  {
    id: 'audit-024',
    user_id: null,
    action: 'login',
    table_name: null,
    record_id: null,
    old_values: null,
    new_values: {
      success: false,
      attempted_email: 'hacker@test.com',
      reason: 'Invalid credentials'
    },
    ip_address: '203.0.113.42',
    user_agent: 'Mozilla/5.0 (compatible; bot)',
    created_at: '2025-01-18T03:45:00Z',
    user: undefined,
    summary: 'Tentative de connexion échouée (hacker@test.com)'
  },
  // Création newsletter
  {
    id: 'audit-025',
    user_id: 'user-001',
    action: 'create',
    table_name: 'newsletter',
    record_id: 'campaign-001',
    old_values: null,
    new_values: {
      subject: 'Newsletter de janvier 2025',
      status: 'draft'
    },
    ip_address: '192.168.1.100',
    user_agent: userAgents[0],
    created_at: '2025-01-17T14:00:00Z',
    user: mockUsers[0],
    summary: "Création de la campagne 'Newsletter de janvier 2025'"
  },
  // Modification contenu éditorial
  {
    id: 'audit-026',
    user_id: 'user-002',
    action: 'update',
    table_name: 'editorial',
    record_id: 'stat-diplomes',
    old_values: {
      value: '4800'
    },
    new_values: {
      value: '5000'
    },
    ip_address: '192.168.1.101',
    user_agent: userAgents[1],
    created_at: '2025-01-17T10:30:00Z',
    user: mockUsers[1],
    summary: "Mise à jour du chiffre 'Diplômés' (4800 → 5000)"
  },
  // Création album
  {
    id: 'audit-027',
    user_id: 'user-005',
    action: 'create',
    table_name: 'albums',
    record_id: 'album-rentree-2025',
    old_values: null,
    new_values: {
      title: 'Rentrée universitaire 2025',
      status: 'draft'
    },
    ip_address: '197.159.2.45',
    user_agent: userAgents[4],
    created_at: '2025-01-16T16:00:00Z',
    user: mockUsers[4],
    summary: "Création de l'album 'Rentrée universitaire 2025'"
  },
  // Modification de département
  {
    id: 'audit-028',
    user_id: 'user-006',
    action: 'update',
    table_name: 'departments',
    record_id: 'dept-admin',
    old_values: {
      head_id: 'user-010'
    },
    new_values: {
      head_id: 'user-015'
    },
    ip_address: '10.0.0.51',
    user_agent: userAgents[0],
    created_at: '2025-01-16T09:00:00Z',
    user: mockUsers[5],
    summary: "Changement de responsable du département 'Administration'"
  },
  // Création de tag
  {
    id: 'audit-029',
    user_id: 'user-001',
    action: 'create',
    table_name: 'tags',
    record_id: 'tag-ia',
    old_values: null,
    new_values: {
      name_fr: 'Intelligence Artificielle',
      slug: 'intelligence-artificielle',
      color: 'purple'
    },
    ip_address: '192.168.1.100',
    user_agent: userAgents[0],
    created_at: '2025-01-15T14:30:00Z',
    user: mockUsers[0],
    summary: "Création de l'étiquette 'Intelligence Artificielle'"
  },
  // Suppression de projet
  {
    id: 'audit-030',
    user_id: 'user-004',
    action: 'delete',
    table_name: 'projects',
    record_id: 'project-old',
    old_values: {
      name: 'Projet pilote 2020',
      status: 'completed'
    },
    new_values: null,
    ip_address: '41.223.120.88',
    user_agent: userAgents[3],
    created_at: '2025-01-15T11:00:00Z',
    user: mockUsers[3],
    summary: "Archivage du projet 'Projet pilote 2020'"
  }
]

// Statistiques mock pour les utilisateurs actifs
export const mockActiveUsersCount = 234

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Générer un ID unique
export const generateAuditLogId = (): string => {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// Récupérer tous les logs d'audit (triés par date décroissante)
export const getAllAuditLogs = (filters?: AuditLogFilters): AuditLog[] => {
  let logs = [...mockAuditLogs]

  if (filters) {
    if (filters.user_id) {
      logs = logs.filter(l => l.user_id === filters.user_id)
    }
    if (filters.action) {
      logs = logs.filter(l => l.action === filters.action)
    }
    if (filters.table_name) {
      logs = logs.filter(l => l.table_name === filters.table_name)
    }
    if (filters.ip_address) {
      logs = logs.filter(l => l.ip_address?.includes(filters.ip_address!))
    }
    if (filters.date_from) {
      const from = new Date(filters.date_from)
      logs = logs.filter(l => new Date(l.created_at) >= from)
    }
    if (filters.date_to) {
      const to = new Date(filters.date_to)
      to.setHours(23, 59, 59, 999)
      logs = logs.filter(l => new Date(l.created_at) <= to)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      logs = logs.filter(l =>
        l.summary?.toLowerCase().includes(search) ||
        l.user?.name.toLowerCase().includes(search) ||
        l.user?.email.toLowerCase().includes(search) ||
        l.table_name?.toLowerCase().includes(search) ||
        l.record_id?.toLowerCase().includes(search)
      )
    }
  }

  return logs.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

// Récupérer un log par ID
export const getAuditLogById = (id: string): AuditLogDetail | undefined => {
  const log = mockAuditLogs.find(l => l.id === id)
  if (!log) return undefined

  // Calculer les changements détaillés
  const changes: AuditChange[] = []
  if (log.old_values && log.new_values) {
    const allKeys = new Set([
      ...Object.keys(log.old_values),
      ...Object.keys(log.new_values)
    ])
    allKeys.forEach(key => {
      const oldVal = log.old_values?.[key]
      const newVal = log.new_values?.[key]
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({ field: key, old: oldVal, new: newVal })
      }
    })
  } else if (log.new_values && !log.old_values) {
    // Création
    Object.entries(log.new_values).forEach(([key, value]) => {
      changes.push({ field: key, old: null, new: value })
    })
  } else if (log.old_values && !log.new_values) {
    // Suppression
    Object.entries(log.old_values).forEach(([key, value]) => {
      changes.push({ field: key, old: value, new: null })
    })
  }

  return { ...log, changes }
}

// Récupérer les logs d'un utilisateur
export const getAuditLogsByUserId = (userId: string): AuditLog[] => {
  return mockAuditLogs
    .filter(l => l.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Récupérer l'historique d'un enregistrement
export const getAuditLogsByRecord = (tableName: string, recordId: string): AuditLog[] => {
  return mockAuditLogs
    .filter(l => l.table_name === tableName && l.record_id === recordId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Récupérer les logs récents
export const getRecentAuditLogs = (limit = 10): AuditLog[] => {
  return [...mockAuditLogs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}

// Statistiques d'audit
export const getAuditStats = (dateFrom?: string, dateTo?: string): AuditStats => {
  let logs = [...mockAuditLogs]

  if (dateFrom) {
    const from = new Date(dateFrom)
    logs = logs.filter(l => new Date(l.created_at) >= from)
  }
  if (dateTo) {
    const to = new Date(dateTo)
    to.setHours(23, 59, 59, 999)
    logs = logs.filter(l => new Date(l.created_at) <= to)
  }

  // Par action
  const byAction: Record<AuditAction, number> = {
    create: 0,
    update: 0,
    delete: 0,
    login: 0,
    logout: 0
  }
  logs.forEach(l => {
    byAction[l.action]++
  })

  // Par table
  const tableMap = new Map<string, number>()
  logs.filter(l => l.table_name).forEach(l => {
    const count = tableMap.get(l.table_name!) || 0
    tableMap.set(l.table_name!, count + 1)
  })
  const byTable = Array.from(tableMap.entries())
    .map(([table, count]) => ({ table, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Par utilisateur
  const userMap = new Map<string, { name: string; count: number }>()
  logs.filter(l => l.user_id && l.user).forEach(l => {
    const existing = userMap.get(l.user_id!) || { name: l.user!.name, count: 0 }
    userMap.set(l.user_id!, { name: existing.name, count: existing.count + 1 })
  })
  const byUser = Array.from(userMap.entries())
    .map(([user_id, data]) => ({ user_id, user_name: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Par jour
  const dayMap = new Map<string, number>()
  logs.forEach(l => {
    const date = l.created_at.split('T')[0]
    const count = dayMap.get(date) || 0
    dayMap.set(date, count + 1)
  })
  const byDay = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)

  return {
    total_events: logs.length,
    by_action: byAction,
    by_table: byTable,
    by_user: byUser,
    by_day: byDay
  }
}

// Lister les tables distinctes
export const getDistinctTables = (): string[] => {
  const tables = new Set<string>()
  mockAuditLogs.forEach(l => {
    if (l.table_name) tables.add(l.table_name)
  })
  return Array.from(tables).sort()
}

// Lister les utilisateurs distincts
export const getDistinctUsers = (): { id: string; name: string; email: string }[] => {
  const users = new Map<string, { name: string; email: string }>()
  mockAuditLogs.forEach(l => {
    if (l.user_id && l.user) {
      users.set(l.user_id, { name: l.user.name, email: l.user.email })
    }
  })
  return Array.from(users.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Formater l'adresse IP pour l'affichage
export const formatIpAddress = (ip: string | null): string => {
  if (!ip) return '-'
  return ip
}

// Formater le user agent pour l'affichage
export const formatUserAgent = (ua: string | null): { browser: string; os: string } => {
  if (!ua) return { browser: 'Inconnu', os: 'Inconnu' }

  let browser = 'Inconnu'
  let os = 'Inconnu'

  // Détection navigateur
  if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'

  // Détection OS
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS')) os = 'iOS'

  return { browser, os }
}

// Obtenir le label d'une table
export const getTableLabel = (tableName: string | null): string => {
  if (!tableName) return '-'
  return tableLabels[tableName] || tableName
}
