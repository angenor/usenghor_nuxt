/**
 * Types pour les logs d'audit
 */

// ============================================================================
// Enums
// ============================================================================

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout'

// ============================================================================
// Audit Log Read
// ============================================================================

export interface AuditLogRead {
  id: string
  user_id: string | null
  action: AuditAction
  table_name: string | null
  record_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// Log d'audit avec infos utilisateur (enrichi côté frontend)
export interface AuditLogWithUser extends AuditLogRead {
  user?: {
    id: string
    name: string
    email: string
  }
  summary?: string
}

// Détail d'un log d'audit avec les changements
export interface AuditLogDetail extends AuditLogWithUser {
  changes: AuditChange[]
}

// Changement individuel pour l'affichage diff
export interface AuditChange {
  field: string
  old: unknown
  new: unknown
}

// ============================================================================
// Filters
// ============================================================================

export interface AuditLogFilters {
  user_id?: string
  action?: AuditAction
  table_name?: string
  date_from?: string
  date_to?: string
  ip_address?: string
  search?: string
}

// ============================================================================
// Statistics
// ============================================================================

export interface AuditLogStatistics {
  total: number
  by_action: Record<AuditAction, number>
  by_table: Record<string, number>
  by_user?: { user_id: string; count: number }[]
  by_day?: { date: string; count: number }[]
}

// Statistiques enrichies pour l'affichage UI
export interface AuditLogStatsUI {
  total_events: number
  by_action: Record<AuditAction, number>
  by_table: { table: string; count: number }[]
  by_user: { user_id: string; user_name: string; count: number }[]
  by_day: { date: string; count: number }[]
}

// ============================================================================
// Purge
// ============================================================================

export interface AuditLogPurgePayload {
  before_date: string
}
