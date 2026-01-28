/**
 * Composable API - Logs d'audit
 * =============================
 *
 * Gestion des logs d'audit via l'API backend FastAPI.
 */

import type {
  AuditAction,
  AuditChange,
  AuditLogDetail,
  AuditLogFilters,
  AuditLogPurgePayload,
  AuditLogRead,
  AuditLogStatistics,
  AuditLogStatsUI,
  AuditLogWithUser,
  MessageResponse,
  PaginatedResponse,
} from '~/types/api'

// ============================================================================
// Labels et couleurs UI
// ============================================================================

export const auditActionLabels: Record<AuditAction, string> = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  login: 'Connexion',
  logout: 'Déconnexion',
}

export const auditActionColors: Record<AuditAction, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  login: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  logout: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export const auditActionIcons: Record<AuditAction, string> = {
  create: 'plus',
  update: 'pen',
  delete: 'trash',
  login: 'right-to-bracket',
  logout: 'right-from-bracket',
}

// Labels français pour les tables
export const auditTableLabels: Record<string, string> = {
  users: 'Utilisateurs',
  roles: 'Rôles',
  permissions: 'Permissions',
  news: 'Actualités',
  events: 'Événements',
  partners: 'Partenaires',
  programs: 'Formations',
  departments: 'Départements',
  campuses: 'Campus',
  projects: 'Projets',
  application_calls: 'Appels à candidatures',
  applications: 'Candidatures',
  media_files: 'Fichiers médias',
  editorial_contents: 'Contenus éditoriaux',
  services: 'Services',
  newsletters: 'Newsletters',
  contacts: 'Contacts',
  testimonials: 'Témoignages',
}

// ============================================================================
// Composable
// ============================================================================

export function useAuditApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // CRUD Logs d'audit
  // =========================================================================

  /**
   * Liste les logs d'audit avec pagination et filtres.
   */
  async function listAuditLogs(params: {
    page?: number
    limit?: number
    user_id?: string
    table_name?: string
    action?: AuditAction
    date_from?: string
    date_to?: string
    ip_address?: string
    search?: string
  } = {}): Promise<PaginatedResponse<AuditLogRead>> {
    return apiFetch<PaginatedResponse<AuditLogRead>>('/api/admin/audit-logs', {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
        user_id: params.user_id,
        table_name: params.table_name,
        action: params.action,
        date_from: params.date_from,
        date_to: params.date_to,
        ip_address: params.ip_address,
        search: params.search,
      },
    })
  }

  /**
   * Récupère les statistiques des logs d'audit.
   */
  async function getAuditStatistics(): Promise<AuditLogStatistics> {
    return apiFetch<AuditLogStatistics>('/api/admin/audit-logs/statistics')
  }

  /**
   * Récupère un log d'audit par son ID.
   */
  async function getAuditLogById(id: string): Promise<AuditLogRead> {
    return apiFetch<AuditLogRead>(`/api/admin/audit-logs/${id}`)
  }

  /**
   * Récupère les logs d'audit d'un utilisateur.
   */
  async function getAuditLogsByUser(
    userId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<AuditLogRead>> {
    return apiFetch<PaginatedResponse<AuditLogRead>>(`/api/admin/audit-logs/user/${userId}`, {
      query: {
        page: params.page || 1,
        limit: params.limit || 20,
      },
    })
  }

  /**
   * Récupère les logs d'audit d'un enregistrement spécifique.
   */
  async function getAuditLogsByRecord(
    tableName: string,
    recordId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<AuditLogRead>> {
    return apiFetch<PaginatedResponse<AuditLogRead>>(
      `/api/admin/audit-logs/record/${tableName}/${recordId}`,
      {
        query: {
          page: params.page || 1,
          limit: params.limit || 20,
        },
      }
    )
  }

  /**
   * Exporte les logs d'audit en CSV.
   * Retourne l'URL de téléchargement.
   */
  function getExportUrl(params: {
    user_id?: string
    table_name?: string
    action?: AuditAction
    date_from?: string
    date_to?: string
    ip_address?: string
  } = {}): string {
    const baseUrl = '/api/admin/audit-logs/export'
    const queryParams = new URLSearchParams()

    if (params.user_id) queryParams.set('user_id', params.user_id)
    if (params.table_name) queryParams.set('table_name', params.table_name)
    if (params.action) queryParams.set('action', params.action)
    if (params.date_from) queryParams.set('date_from', params.date_from)
    if (params.date_to) queryParams.set('date_to', params.date_to)
    if (params.ip_address) queryParams.set('ip_address', params.ip_address)
    queryParams.set('format', 'csv')

    const queryString = queryParams.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  /**
   * Purge les logs d'audit avant une date.
   */
  async function purgeAuditLogs(beforeDate: string): Promise<MessageResponse> {
    const payload: AuditLogPurgePayload = { before_date: beforeDate }
    return apiFetch<MessageResponse>('/api/admin/audit-logs/purge', {
      method: 'POST',
      body: payload,
    })
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Obtient le label français d'une table.
   */
  function getTableLabel(tableName: string | null | undefined): string {
    if (!tableName) return '-'
    return auditTableLabels[tableName] || tableName
  }

  /**
   * Formate une adresse IP pour l'affichage.
   */
  function formatIpAddress(ip: string | null | undefined): string {
    if (!ip) return '-'
    return ip
  }

  /**
   * Parse et formate un user agent.
   */
  function formatUserAgent(
    userAgent: string | null | undefined
  ): { browser: string; os: string; full: string } {
    if (!userAgent) {
      return { browser: 'Inconnu', os: 'Inconnu', full: '-' }
    }

    let browser = 'Navigateur inconnu'
    let os = 'OS inconnu'

    // Détection navigateur
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      const match = userAgent.match(/Chrome\/([\d.]+)/)
      browser = match ? `Chrome ${match[1].split('.')[0]}` : 'Chrome'
    } else if (userAgent.includes('Firefox')) {
      const match = userAgent.match(/Firefox\/([\d.]+)/)
      browser = match ? `Firefox ${match[1].split('.')[0]}` : 'Firefox'
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const match = userAgent.match(/Version\/([\d.]+)/)
      browser = match ? `Safari ${match[1].split('.')[0]}` : 'Safari'
    } else if (userAgent.includes('Edg')) {
      const match = userAgent.match(/Edg\/([\d.]+)/)
      browser = match ? `Edge ${match[1].split('.')[0]}` : 'Edge'
    }

    // Détection OS
    if (userAgent.includes('Windows NT 10')) {
      os = 'Windows 10/11'
    } else if (userAgent.includes('Windows')) {
      os = 'Windows'
    } else if (userAgent.includes('Mac OS X')) {
      const match = userAgent.match(/Mac OS X ([\d_]+)/)
      os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS'
    } else if (userAgent.includes('Linux')) {
      os = 'Linux'
    } else if (userAgent.includes('Android')) {
      os = 'Android'
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) {
      os = 'iOS'
    }

    return { browser, os, full: userAgent }
  }

  /**
   * Formate une date ISO en format français.
   */
  function formatDateTime(isoDate: string | null | undefined): string {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  /**
   * Extrait les changements entre old_values et new_values.
   */
  function extractChanges(log: AuditLogRead): AuditChange[] {
    const changes: AuditChange[] = []
    const oldValues = log.old_values || {}
    const newValues = log.new_values || {}

    // Pour une création, on liste les nouvelles valeurs
    if (log.action === 'create') {
      for (const [key, value] of Object.entries(newValues)) {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          changes.push({ field: key, old: null, new: value })
        }
      }
      return changes
    }

    // Pour une suppression, on liste les anciennes valeurs
    if (log.action === 'delete') {
      for (const [key, value] of Object.entries(oldValues)) {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          changes.push({ field: key, old: value, new: null })
        }
      }
      return changes
    }

    // Pour une mise à jour, on compare les valeurs
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])
    for (const key of allKeys) {
      if (key === 'id' || key === 'created_at' || key === 'updated_at') continue

      const oldVal = oldValues[key]
      const newVal = newValues[key]

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({ field: key, old: oldVal, new: newVal })
      }
    }

    return changes
  }

  /**
   * Génère un résumé textuel pour un log.
   */
  function generateSummary(log: AuditLogRead): string {
    const tableLabel = getTableLabel(log.table_name)

    switch (log.action) {
      case 'create':
        return `Création dans ${tableLabel}`
      case 'update': {
        const changes = extractChanges(log)
        if (changes.length === 0) return `Modification dans ${tableLabel}`
        if (changes.length === 1) return `Modification de "${changes[0].field}" dans ${tableLabel}`
        return `Modification de ${changes.length} champs dans ${tableLabel}`
      }
      case 'delete':
        return `Suppression dans ${tableLabel}`
      case 'login':
        return 'Connexion au système'
      case 'logout':
        return 'Déconnexion du système'
      default:
        return '-'
    }
  }

  /**
   * Enrichit un log avec les infos utilisateur et le résumé.
   */
  function enrichLog(log: AuditLogRead): AuditLogWithUser {
    return {
      ...log,
      summary: generateSummary(log),
    }
  }

  /**
   * Enrichit un log avec les détails complets (changements).
   */
  function enrichLogDetail(log: AuditLogRead): AuditLogDetail {
    return {
      ...log,
      summary: generateSummary(log),
      changes: extractChanges(log),
    }
  }

  /**
   * Convertit les statistiques du backend vers le format UI.
   */
  function statsToUI(stats: AuditLogStatistics): AuditLogStatsUI {
    // Convertir by_table de Record vers array trié
    const byTableArray = Object.entries(stats.by_table)
      .map(([table, count]) => ({ table, count }))
      .sort((a, b) => b.count - a.count)

    // S'assurer que toutes les actions sont présentes
    const byAction: Record<AuditAction, number> = {
      create: stats.by_action.create || 0,
      update: stats.by_action.update || 0,
      delete: stats.by_action.delete || 0,
      login: stats.by_action.login || 0,
      logout: stats.by_action.logout || 0,
    }

    return {
      total_events: stats.total,
      by_action: byAction,
      by_table: byTableArray,
      by_user: stats.by_user?.map(u => ({
        user_id: u.user_id,
        user_name: u.user_id, // Peut être enrichi avec le nom réel plus tard
        count: u.count,
      })) || [],
      by_day: stats.by_day?.map(d => ({
        date: d.date,
        count: d.count,
      })) || [],
    }
  }

  /**
   * Retourne la liste des tables distinctes (pour les filtres).
   */
  function getDistinctTablesList(): string[] {
    return Object.keys(auditTableLabels)
  }

  return {
    // CRUD
    listAuditLogs,
    getAuditStatistics,
    getAuditLogById,
    getAuditLogsByUser,
    getAuditLogsByRecord,
    getExportUrl,
    purgeAuditLogs,

    // Helpers
    getTableLabel,
    formatIpAddress,
    formatUserAgent,
    formatDateTime,
    extractChanges,
    generateSummary,
    enrichLog,
    enrichLogDetail,
    statsToUI,
    getDistinctTablesList,

    // Labels & Colors
    auditActionLabels,
    auditActionColors,
    auditActionIcons,
    auditTableLabels,
  }
}
