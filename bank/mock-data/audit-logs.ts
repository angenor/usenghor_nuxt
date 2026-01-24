/**
 * Mock Data: Journal d'audit (Audit Logs)
 * Trace des actions effectuées dans le back-office
 */

export type AuditAction = 'create' | 'update' | 'delete'

export interface AuditLog {
  id: string
  user_id: string
  user_name: string
  user_email: string
  action: AuditAction
  table_name: string
  record_id: string
  record_label: string
  changes?: Record<string, { old: unknown; new: unknown }>
  created_at: string
}

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    user_id: 'user-001',
    user_name: 'Marie Dupont',
    user_email: 'marie.dupont@usenghor.org',
    action: 'create',
    table_name: 'news',
    record_id: 'news-siege-1',
    record_label: 'L\'Université Senghor célèbre ses 35 ans',
    created_at: '2025-01-23T09:15:00Z'
  },
  {
    id: 'audit-002',
    user_id: 'user-002',
    user_name: 'Jean Martin',
    user_email: 'jean.martin@usenghor.org',
    action: 'update',
    table_name: 'formations',
    record_id: 'formation-mae',
    record_label: 'Master Administration des Entreprises',
    changes: {
      application_open: { old: false, new: true }
    },
    created_at: '2025-01-23T08:45:00Z'
  },
  {
    id: 'audit-003',
    user_id: 'user-003',
    user_name: 'Sophie Bernard',
    user_email: 'sophie.bernard@usenghor.org',
    action: 'update',
    table_name: 'applications',
    record_id: 'app-2025-1234',
    record_label: 'Dossier #2025-1234 - Amadou Diallo',
    changes: {
      status: { old: 'pending', new: 'validated' }
    },
    created_at: '2025-01-23T08:30:00Z'
  },
  {
    id: 'audit-004',
    user_id: 'user-004',
    user_name: 'Pierre Durand',
    user_email: 'pierre.durand@usenghor.org',
    action: 'create',
    table_name: 'partners',
    record_id: 'partner-ucad',
    record_label: 'Université Cheikh Anta Diop de Dakar',
    created_at: '2025-01-23T07:00:00Z'
  },
  {
    id: 'audit-005',
    user_id: 'user-001',
    user_name: 'Marie Dupont',
    user_email: 'marie.dupont@usenghor.org',
    action: 'update',
    table_name: 'events',
    record_id: 'event-001',
    record_label: 'Conférence internationale 2025',
    changes: {
      location_fr: { old: 'Salle principale', new: 'Amphithéâtre Senghor' }
    },
    created_at: '2025-01-22T16:30:00Z'
  },
  {
    id: 'audit-006',
    user_id: 'user-005',
    user_name: 'Aminata Koné',
    user_email: 'aminata.kone@usenghor.org',
    action: 'create',
    table_name: 'events',
    record_id: 'event-002',
    record_label: 'Atelier Design Thinking',
    created_at: '2025-01-22T14:00:00Z'
  },
  {
    id: 'audit-007',
    user_id: 'user-002',
    user_name: 'Jean Martin',
    user_email: 'jean.martin@usenghor.org',
    action: 'delete',
    table_name: 'news',
    record_id: 'news-draft-001',
    record_label: 'Brouillon - Événement annulé',
    created_at: '2025-01-22T11:20:00Z'
  },
  {
    id: 'audit-008',
    user_id: 'user-003',
    user_name: 'Sophie Bernard',
    user_email: 'sophie.bernard@usenghor.org',
    action: 'update',
    table_name: 'applications',
    record_id: 'app-2025-1235',
    record_label: 'Dossier #2025-1235 - Fatou Sow',
    changes: {
      status: { old: 'pending', new: 'rejected' },
      rejection_reason: { old: null, new: 'Dossier incomplet' }
    },
    created_at: '2025-01-22T10:45:00Z'
  },
  {
    id: 'audit-009',
    user_id: 'user-006',
    user_name: 'Ibrahim Touré',
    user_email: 'ibrahim.toure@usenghor.org',
    action: 'create',
    table_name: 'users',
    record_id: 'user-007',
    record_label: 'Nouveau compte - alice.mbeki@usenghor.org',
    created_at: '2025-01-22T09:00:00Z'
  },
  {
    id: 'audit-010',
    user_id: 'user-001',
    user_name: 'Marie Dupont',
    user_email: 'marie.dupont@usenghor.org',
    action: 'update',
    table_name: 'news',
    record_id: 'news-siege-2',
    record_label: 'Nouveau partenariat stratégique avec l\'OIF',
    changes: {
      is_featured: { old: false, new: true }
    },
    created_at: '2025-01-21T17:30:00Z'
  },
  {
    id: 'audit-011',
    user_id: 'user-004',
    user_name: 'Pierre Durand',
    user_email: 'pierre.durand@usenghor.org',
    action: 'update',
    table_name: 'partners',
    record_id: 'partner-oif',
    record_label: 'Organisation Internationale de la Francophonie',
    changes: {
      partner_type: { old: 'academic', new: 'institutional' }
    },
    created_at: '2025-01-21T15:00:00Z'
  },
  {
    id: 'audit-012',
    user_id: 'user-005',
    user_name: 'Aminata Koné',
    user_email: 'aminata.kone@usenghor.org',
    action: 'create',
    table_name: 'calls',
    record_id: 'call-2025-001',
    record_label: 'Appel à candidatures - Master Management 2025',
    created_at: '2025-01-21T10:30:00Z'
  },
  {
    id: 'audit-013',
    user_id: 'user-002',
    user_name: 'Jean Martin',
    user_email: 'jean.martin@usenghor.org',
    action: 'update',
    table_name: 'formations',
    record_id: 'formation-msp',
    record_label: 'Master Santé Publique',
    changes: {
      is_published: { old: false, new: true }
    },
    created_at: '2025-01-20T14:20:00Z'
  },
  {
    id: 'audit-014',
    user_id: 'user-003',
    user_name: 'Sophie Bernard',
    user_email: 'sophie.bernard@usenghor.org',
    action: 'update',
    table_name: 'applications',
    record_id: 'app-2025-1230',
    record_label: 'Dossier #2025-1230 - Ousmane Ba',
    changes: {
      status: { old: 'pending', new: 'validated' }
    },
    created_at: '2025-01-20T11:00:00Z'
  },
  {
    id: 'audit-015',
    user_id: 'user-006',
    user_name: 'Ibrahim Touré',
    user_email: 'ibrahim.toure@usenghor.org',
    action: 'update',
    table_name: 'users',
    record_id: 'user-003',
    record_label: 'Sophie Bernard',
    changes: {
      role: { old: 'editor', new: 'admin' }
    },
    created_at: '2025-01-20T09:15:00Z'
  },
  {
    id: 'audit-016',
    user_id: 'user-001',
    user_name: 'Marie Dupont',
    user_email: 'marie.dupont@usenghor.org',
    action: 'delete',
    table_name: 'media',
    record_id: 'media-old-001',
    record_label: 'Photo obsolète - événement 2020',
    created_at: '2025-01-19T16:45:00Z'
  },
  {
    id: 'audit-017',
    user_id: 'user-004',
    user_name: 'Pierre Durand',
    user_email: 'pierre.durand@usenghor.org',
    action: 'create',
    table_name: 'partners',
    record_id: 'partner-auf',
    record_label: 'Agence Universitaire de la Francophonie',
    created_at: '2025-01-19T14:00:00Z'
  },
  {
    id: 'audit-018',
    user_id: 'user-005',
    user_name: 'Aminata Koné',
    user_email: 'aminata.kone@usenghor.org',
    action: 'update',
    table_name: 'events',
    record_id: 'event-003',
    record_label: 'Cérémonie de remise des diplômes',
    changes: {
      date: { old: '2025-02-15', new: '2025-02-20' }
    },
    created_at: '2025-01-19T10:30:00Z'
  },
  {
    id: 'audit-019',
    user_id: 'user-002',
    user_name: 'Jean Martin',
    user_email: 'jean.martin@usenghor.org',
    action: 'create',
    table_name: 'formations',
    record_id: 'formation-du-ia',
    record_label: 'DU Intelligence Artificielle et Développement',
    created_at: '2025-01-18T15:30:00Z'
  },
  {
    id: 'audit-020',
    user_id: 'user-003',
    user_name: 'Sophie Bernard',
    user_email: 'sophie.bernard@usenghor.org',
    action: 'update',
    table_name: 'applications',
    record_id: 'app-2025-1228',
    record_label: 'Dossier #2025-1228 - Mariam Cissé',
    changes: {
      status: { old: 'pending', new: 'validated' }
    },
    created_at: '2025-01-18T11:15:00Z'
  }
]

// Statistiques mock pour les utilisateurs actifs
export const mockActiveUsersCount = 234
