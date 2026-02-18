// ============================================================================
// MOCK DATA - UTILISATEURS (ADMINISTRATION)
// ============================================================================
// Basé sur le schéma SQL: 02_identity.sql
// Tables: users, user_roles, roles
// ============================================================================

import { mockRoles, getRoleById, type Role } from './admin-permissions'
import { mockCountriesRef, getCountryByIdRef, type Country } from './ref-countries'

// ============================================================================
// TYPES - ALIGNÉS AVEC LE SCHÉMA SQL
// ============================================================================

// Civilité (enum SQL)
export type UserSalutation = 'mr' | 'mrs' | 'ms' | 'dr' | 'pr'

// Interface User basée sur la table users SQL
export interface User {
  id: string
  email: string
  password_hash: string | null  // null = pas de mot de passe (compte désactivé)
  last_name: string
  first_name: string
  salutation: UserSalutation | null
  birth_date: string | null  // ISO date string
  phone: string | null
  phone_whatsapp: string | null
  linkedin: string | null
  photo_external_id: string | null  // → MEDIA.media.id
  nationality_external_id: string | null  // → CORE.countries.id
  residence_country_external_id: string | null  // → CORE.countries.id
  city: string | null
  address: string | null
  active: boolean
  email_verified: boolean
  last_login_at: string | null  // ISO datetime
  created_at: string  // ISO datetime
  updated_at: string  // ISO datetime
}

// Interface pour la relation user_roles SQL
export interface UserRole {
  user_id: string
  role_id: string
  campus_external_id: string | null  // → CAMPUS.campuses.id
  assigned_at: string  // ISO datetime
  assigned_by: string | null  // user_id
}

// Utilisateur enrichi avec relations (pour l'affichage)
export interface UserWithRelations extends User {
  // Relations enrichies pour l'affichage
  roles: Array<{
    id: string
    code: string
    name_fr: string
    campus?: {
      id: string
      name: string
    }
  }>
  nationality?: {
    id: string
    name_fr: string
    iso_code: string
  }
  residence_country?: {
    id: string
    name_fr: string
    iso_code: string
  }
  photo_url?: string
  full_name: string
}

// Filtres pour la liste des utilisateurs
export interface UserFilters {
  search?: string
  role_id?: string
  campus_id?: string
  active?: boolean
  email_verified?: boolean
  nationality_id?: string
  sort_by?: 'last_name' | 'email' | 'created_at' | 'last_login_at'
  sort_order?: 'asc' | 'desc'
}

// Statistiques des utilisateurs
export interface UserStats {
  total: number
  active: number
  inactive: number
  email_verified: number
  email_not_verified: number
  by_role: Array<{ role_id: string; role_name: string; count: number }>
  by_nationality: Array<{ country_id: string; country_name: string; count: number }>
  last_registrations: number  // 30 derniers jours
  last_logins: number  // 7 derniers jours
}

// Formulaire de création/modification
export interface UserFormData {
  email: string
  password?: string
  salutation: UserSalutation | null
  last_name: string
  first_name: string
  birth_date: string | null
  phone: string | null
  phone_whatsapp: string | null
  linkedin: string | null
  nationality_external_id: string | null
  residence_country_external_id: string | null
  city: string | null
  address: string | null
  photo_external_id: string | null
  role_ids: string[]
  campus_external_id: string | null
  active: boolean
  send_welcome_email?: boolean
}

// Action en masse
export type BulkAction = 'activate' | 'deactivate' | 'add_role' | 'remove_role'

export interface BulkActionRequest {
  ids: string[]
  action: BulkAction
  role_id?: string
}

// ============================================================================
// LABELS ET COULEURS
// ============================================================================

export const salutationLabels: Record<UserSalutation, string> = {
  mr: 'M.',
  mrs: 'Mme',
  ms: 'Mlle',
  dr: 'Dr',
  pr: 'Pr'
}

export const salutationOptions: Array<{ value: UserSalutation; label: string }> = [
  { value: 'mr', label: 'Monsieur' },
  { value: 'mrs', label: 'Madame' },
  { value: 'ms', label: 'Mademoiselle' },
  { value: 'dr', label: 'Docteur' },
  { value: 'pr', label: 'Professeur' }
]

export const statusColors = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
}

export const verificationColors = {
  verified: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  not_verified: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
}

export const roleColors: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  evaluator: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  campus_manager: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  newsletter_manager: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
}

// ============================================================================
// DONNÉES MOCK - RELATIONS USER_ROLES
// ============================================================================

export const mockUserRoles: UserRole[] = [
  // Super admin - Marie Dupont
  { user_id: 'user_001', role_id: 'role_001', campus_external_id: null, assigned_at: '2024-01-01T00:00:00Z', assigned_by: null },
  // Admin - Jean Martin
  { user_id: 'user_002', role_id: 'role_002', campus_external_id: null, assigned_at: '2024-01-15T00:00:00Z', assigned_by: 'user_001' },
  // Editor - Sophie Bernard
  { user_id: 'user_003', role_id: 'role_003', campus_external_id: null, assigned_at: '2024-02-01T00:00:00Z', assigned_by: 'user_001' },
  // Evaluator - Pierre Durand
  { user_id: 'user_004', role_id: 'role_004', campus_external_id: null, assigned_at: '2024-02-15T00:00:00Z', assigned_by: 'user_002' },
  // Campus manager - Aminata Koné (Alexandrie)
  { user_id: 'user_005', role_id: 'role_005', campus_external_id: 'campus_001', assigned_at: '2024-03-01T00:00:00Z', assigned_by: 'user_001' },
  // Campus manager - Ibrahim Touré (Dakar)
  { user_id: 'user_006', role_id: 'role_005', campus_external_id: 'campus_002', assigned_at: '2024-03-01T00:00:00Z', assigned_by: 'user_001' },
  // Viewer - Fatima Benali
  { user_id: 'user_007', role_id: 'role_006', campus_external_id: null, assigned_at: '2024-04-01T00:00:00Z', assigned_by: 'user_002' },
  // Newsletter manager - Ousmane Diallo
  { user_id: 'user_008', role_id: 'role_007', campus_external_id: null, assigned_at: '2024-04-15T00:00:00Z', assigned_by: 'user_002' },
  // Editor + Evaluator - Claire Moreau (multi-rôle)
  { user_id: 'user_009', role_id: 'role_003', campus_external_id: null, assigned_at: '2024-05-01T00:00:00Z', assigned_by: 'user_001' },
  { user_id: 'user_009', role_id: 'role_004', campus_external_id: null, assigned_at: '2024-05-01T00:00:00Z', assigned_by: 'user_001' },
  // Campus manager - Kofi Mensah (Abidjan)
  { user_id: 'user_010', role_id: 'role_005', campus_external_id: 'campus_003', assigned_at: '2024-05-15T00:00:00Z', assigned_by: 'user_001' },
  // Admin - Youssef El Fassi
  { user_id: 'user_011', role_id: 'role_002', campus_external_id: null, assigned_at: '2024-06-01T00:00:00Z', assigned_by: 'user_001' },
  // Viewer - Amara Traoré
  { user_id: 'user_012', role_id: 'role_006', campus_external_id: null, assigned_at: '2024-06-15T00:00:00Z', assigned_by: 'user_002' },
  // Newsletter manager + Viewer - Nadia Koffi
  { user_id: 'user_013', role_id: 'role_007', campus_external_id: null, assigned_at: '2024-07-01T00:00:00Z', assigned_by: 'user_002' },
  { user_id: 'user_013', role_id: 'role_006', campus_external_id: null, assigned_at: '2024-07-01T00:00:00Z', assigned_by: 'user_002' },
  // Evaluator - Hassan Diop
  { user_id: 'user_014', role_id: 'role_004', campus_external_id: null, assigned_at: '2024-07-15T00:00:00Z', assigned_by: 'user_002' },
  // Viewer (inactif) - Paul Ndong
  { user_id: 'user_015', role_id: 'role_006', campus_external_id: null, assigned_at: '2024-01-01T00:00:00Z', assigned_by: 'user_002' }
]

// ============================================================================
// DONNÉES MOCK - UTILISATEURS
// ============================================================================

export const mockUsers: User[] = [
  {
    id: 'user_001',
    email: 'marie.dupont@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Dupont',
    first_name: 'Marie',
    salutation: 'mrs',
    birth_date: '1980-05-15',
    phone: '+33 6 12 34 56 78',
    phone_whatsapp: '+33 6 12 34 56 78',
    linkedin: 'https://linkedin.com/in/marie-dupont',
    photo_external_id: 'media_001',
    nationality_external_id: 'country_055', // France
    residence_country_external_id: 'country_002', // Égypte
    city: 'Alexandrie',
    address: '1 rue de l\'Université',
    active: true,
    email_verified: true,
    last_login_at: '2025-01-24T08:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-24T08:30:00Z'
  },
  {
    id: 'user_002',
    email: 'jean.martin@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Martin',
    first_name: 'Jean',
    salutation: 'mr',
    birth_date: '1975-08-22',
    phone: '+33 6 98 76 54 32',
    phone_whatsapp: null,
    linkedin: 'https://linkedin.com/in/jean-martin',
    photo_external_id: 'media_002',
    nationality_external_id: 'country_055', // France
    residence_country_external_id: 'country_055', // France
    city: 'Paris',
    address: '15 avenue des Champs-Élysées',
    active: true,
    email_verified: true,
    last_login_at: '2025-01-23T16:45:00Z',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-01-23T16:45:00Z'
  },
  {
    id: 'user_003',
    email: 'sophie.bernard@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Bernard',
    first_name: 'Sophie',
    salutation: 'mrs',
    birth_date: '1985-03-10',
    phone: '+33 6 55 44 33 22',
    phone_whatsapp: '+33 6 55 44 33 22',
    linkedin: null,
    photo_external_id: 'media_003',
    nationality_external_id: 'country_056', // Belgique
    residence_country_external_id: 'country_002', // Égypte
    city: 'Alexandrie',
    address: null,
    active: true,
    email_verified: true,
    last_login_at: '2025-01-24T09:15:00Z',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2025-01-24T09:15:00Z'
  },
  {
    id: 'user_004',
    email: 'pierre.durand@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Durand',
    first_name: 'Pierre',
    salutation: 'dr',
    birth_date: '1970-11-05',
    phone: '+33 6 11 22 33 44',
    phone_whatsapp: null,
    linkedin: 'https://linkedin.com/in/pierre-durand',
    photo_external_id: null,
    nationality_external_id: 'country_055', // France
    residence_country_external_id: 'country_055', // France
    city: 'Lyon',
    address: '8 place Bellecour',
    active: true,
    email_verified: true,
    last_login_at: '2025-01-20T14:00:00Z',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2025-01-20T14:00:00Z'
  },
  {
    id: 'user_005',
    email: 'aminata.kone@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Koné',
    first_name: 'Aminata',
    salutation: 'mrs',
    birth_date: '1988-07-20',
    phone: '+225 07 12 34 56 78',
    phone_whatsapp: '+225 07 12 34 56 78',
    linkedin: 'https://linkedin.com/in/aminata-kone',
    photo_external_id: 'media_005',
    nationality_external_id: 'country_003', // Côte d'Ivoire
    residence_country_external_id: 'country_002', // Égypte
    city: 'Alexandrie',
    address: '5 rue du Nil',
    active: true,
    email_verified: true,
    last_login_at: '2025-01-24T07:00:00Z',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2025-01-24T07:00:00Z'
  },
  {
    id: 'user_006',
    email: 'ibrahim.toure@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Touré',
    first_name: 'Ibrahim',
    salutation: 'mr',
    birth_date: '1982-12-01',
    phone: '+221 77 123 45 67',
    phone_whatsapp: '+221 77 123 45 67',
    linkedin: null,
    photo_external_id: 'media_006',
    nationality_external_id: 'country_001', // Sénégal
    residence_country_external_id: 'country_001', // Sénégal
    city: 'Dakar',
    address: '25 avenue Léopold Sédar Senghor',
    active: true,
    email_verified: true,
    last_login_at: '2025-01-23T11:30:00Z',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2025-01-23T11:30:00Z'
  },
  {
    id: 'user_007',
    email: 'fatima.benali@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Benali',
    first_name: 'Fatima',
    salutation: 'mrs',
    birth_date: '1992-04-18',
    phone: '+212 6 61 23 45 67',
    phone_whatsapp: '+212 6 61 23 45 67',
    linkedin: null,
    photo_external_id: null,
    nationality_external_id: 'country_005', // Maroc
    residence_country_external_id: 'country_005', // Maroc
    city: 'Casablanca',
    address: null,
    active: true,
    email_verified: true,
    last_login_at: '2025-01-22T09:00:00Z',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2025-01-22T09:00:00Z'
  },
  {
    id: 'user_008',
    email: 'ousmane.diallo@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Diallo',
    first_name: 'Ousmane',
    salutation: 'mr',
    birth_date: '1990-09-25',
    phone: '+224 622 12 34 56',
    phone_whatsapp: '+224 622 12 34 56',
    linkedin: 'https://linkedin.com/in/ousmane-diallo',
    photo_external_id: 'media_008',
    nationality_external_id: 'country_014', // Guinée
    residence_country_external_id: 'country_002', // Égypte
    city: 'Alexandrie',
    address: '12 rue des Pharaons',
    active: true,
    email_verified: true,
    last_login_at: '2025-01-24T10:00:00Z',
    created_at: '2024-04-15T00:00:00Z',
    updated_at: '2025-01-24T10:00:00Z'
  },
  {
    id: 'user_009',
    email: 'claire.moreau@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Moreau',
    first_name: 'Claire',
    salutation: 'mrs',
    birth_date: '1987-01-30',
    phone: '+33 6 77 88 99 00',
    phone_whatsapp: null,
    linkedin: 'https://linkedin.com/in/claire-moreau',
    photo_external_id: 'media_009',
    nationality_external_id: 'country_055', // France
    residence_country_external_id: 'country_002', // Égypte
    city: 'Alexandrie',
    address: null,
    active: true,
    email_verified: true,
    last_login_at: '2025-01-21T15:30:00Z',
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2025-01-21T15:30:00Z'
  },
  {
    id: 'user_010',
    email: 'kofi.mensah@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Mensah',
    first_name: 'Kofi',
    salutation: 'mr',
    birth_date: '1984-06-12',
    phone: '+233 24 123 4567',
    phone_whatsapp: '+233 24 123 4567',
    linkedin: null,
    photo_external_id: 'media_010',
    nationality_external_id: 'country_028', // Ghana
    residence_country_external_id: 'country_003', // Côte d'Ivoire
    city: 'Abidjan',
    address: '7 boulevard de la République',
    active: true,
    email_verified: true,
    last_login_at: '2025-01-23T08:00:00Z',
    created_at: '2024-05-15T00:00:00Z',
    updated_at: '2025-01-23T08:00:00Z'
  },
  {
    id: 'user_011',
    email: 'youssef.elfassi@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'El Fassi',
    first_name: 'Youssef',
    salutation: 'dr',
    birth_date: '1978-02-14',
    phone: '+20 10 1234 5678',
    phone_whatsapp: '+20 10 1234 5678',
    linkedin: 'https://linkedin.com/in/youssef-elfassi',
    photo_external_id: 'media_011',
    nationality_external_id: 'country_002', // Égypte
    residence_country_external_id: 'country_002', // Égypte
    city: 'Alexandrie',
    address: '30 corniche',
    active: true,
    email_verified: true,
    last_login_at: '2025-01-24T06:45:00Z',
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2025-01-24T06:45:00Z'
  },
  {
    id: 'user_012',
    email: 'amara.traore@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Traoré',
    first_name: 'Amara',
    salutation: 'mr',
    birth_date: '1995-10-08',
    phone: '+223 76 12 34 56',
    phone_whatsapp: '+223 76 12 34 56',
    linkedin: null,
    photo_external_id: null,
    nationality_external_id: 'country_008', // Mali
    residence_country_external_id: 'country_008', // Mali
    city: 'Bamako',
    address: null,
    active: true,
    email_verified: false, // Email non vérifié
    last_login_at: null, // Jamais connecté
    created_at: '2024-06-15T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z'
  },
  {
    id: 'user_013',
    email: 'nadia.koffi@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Koffi',
    first_name: 'Nadia',
    salutation: 'ms',
    birth_date: '1993-08-03',
    phone: '+229 97 12 34 56',
    phone_whatsapp: '+229 97 12 34 56',
    linkedin: 'https://linkedin.com/in/nadia-koffi',
    photo_external_id: 'media_013',
    nationality_external_id: 'country_012', // Bénin
    residence_country_external_id: 'country_012', // Bénin
    city: 'Cotonou',
    address: '45 avenue de la Marina',
    active: true,
    email_verified: true,
    last_login_at: '2025-01-19T12:00:00Z',
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2025-01-19T12:00:00Z'
  },
  {
    id: 'user_014',
    email: 'hassan.diop@usenghor.org',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4HoNPAKYIzYB...',
    last_name: 'Diop',
    first_name: 'Hassan',
    salutation: 'pr',
    birth_date: '1965-04-22',
    phone: '+221 77 987 65 43',
    phone_whatsapp: null,
    linkedin: 'https://linkedin.com/in/hassan-diop',
    photo_external_id: 'media_014',
    nationality_external_id: 'country_001', // Sénégal
    residence_country_external_id: 'country_001', // Sénégal
    city: 'Saint-Louis',
    address: '100 rue Blaise Diagne',
    active: true,
    email_verified: true,
    last_login_at: '2025-01-18T10:30:00Z',
    created_at: '2024-07-15T00:00:00Z',
    updated_at: '2025-01-18T10:30:00Z'
  },
  {
    id: 'user_015',
    email: 'paul.ndong@usenghor.org',
    password_hash: null, // Compte désactivé, pas de mot de passe
    last_name: 'Ndong',
    first_name: 'Paul',
    salutation: 'mr',
    birth_date: '1991-12-25',
    phone: '+241 07 12 34 56',
    phone_whatsapp: null,
    linkedin: null,
    photo_external_id: null,
    nationality_external_id: 'country_016', // Gabon
    residence_country_external_id: 'country_016', // Gabon
    city: 'Libreville',
    address: null,
    active: false, // Compte inactif
    email_verified: false,
    last_login_at: '2024-06-01T09:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z'
  }
]

// ============================================================================
// DONNÉES DE RÉFÉRENCE - CAMPUS (pour les assignations de rôle)
// ============================================================================

export const mockCampuses = [
  { id: 'campus_001', name: 'Campus Alexandrie', code: 'ALEX' },
  { id: 'campus_002', name: 'Campus Dakar', code: 'DKR' },
  { id: 'campus_003', name: 'Campus Abidjan', code: 'ABJ' },
  { id: 'campus_004', name: 'Campus Libreville', code: 'LBV' }
]

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Générer un ID unique
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// Obtenir le nom complet d'un utilisateur
export const getFullName = (user: User): string => {
  const salutation = user.salutation ? `${salutationLabels[user.salutation]} ` : ''
  return `${salutation}${user.first_name} ${user.last_name}`
}

// Obtenir les rôles d'un utilisateur
export const getUserRoles = (userId: string): Array<{ role: Role; campus?: { id: string; name: string } }> => {
  const userRoleRelations = mockUserRoles.filter(ur => ur.user_id === userId)
  return userRoleRelations.map(ur => {
    const role = getRoleById(ur.role_id)
    const campus = ur.campus_external_id ? mockCampuses.find(c => c.id === ur.campus_external_id) : undefined
    return {
      role: role!,
      campus: campus ? { id: campus.id, name: campus.name } : undefined
    }
  }).filter(r => r.role)
}

// Enrichir un utilisateur avec ses relations
export const enrichUser = (user: User): UserWithRelations => {
  const userRoles = getUserRoles(user.id)
  const nationality = user.nationality_external_id ? getCountryByIdRef(user.nationality_external_id) : undefined
  const residence = user.residence_country_external_id ? getCountryByIdRef(user.residence_country_external_id) : undefined

  return {
    ...user,
    roles: userRoles.map(ur => ({
      id: ur.role.id,
      code: ur.role.code,
      name_fr: ur.role.name_fr,
      campus: ur.campus
    })),
    nationality: nationality ? {
      id: nationality.id,
      name_fr: nationality.name_fr,
      iso_code: nationality.iso_code
    } : undefined,
    residence_country: residence ? {
      id: residence.id,
      name_fr: residence.name_fr,
      iso_code: residence.iso_code
    } : undefined,
    photo_url: undefined,
    full_name: getFullName(user)
  }
}

// Récupérer tous les utilisateurs avec filtres
export const getAllUsersAdmin = (filters?: UserFilters): UserWithRelations[] => {
  let result = mockUsers.map(enrichUser)

  if (filters) {
    // Filtre par recherche (nom, prénom, email)
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(u =>
        u.last_name.toLowerCase().includes(search) ||
        u.first_name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.full_name.toLowerCase().includes(search)
      )
    }

    // Filtre par rôle
    if (filters.role_id) {
      result = result.filter(u => u.roles.some(r => r.id === filters.role_id))
    }

    // Filtre par campus
    if (filters.campus_id) {
      result = result.filter(u => u.roles.some(r => r.campus?.id === filters.campus_id))
    }

    // Filtre par statut actif
    if (filters.active !== undefined) {
      result = result.filter(u => u.active === filters.active)
    }

    // Filtre par email vérifié
    if (filters.email_verified !== undefined) {
      result = result.filter(u => u.email_verified === filters.email_verified)
    }

    // Filtre par nationalité
    if (filters.nationality_id) {
      result = result.filter(u => u.nationality_external_id === filters.nationality_id)
    }

    // Tri
    const sortBy = filters.sort_by || 'last_name'
    const sortOrder = filters.sort_order || 'asc'
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'last_login_at':
          const aLogin = a.last_login_at ? new Date(a.last_login_at).getTime() : 0
          const bLogin = b.last_login_at ? new Date(b.last_login_at).getTime() : 0
          comparison = aLogin - bLogin
          break
        case 'last_name':
        default:
          comparison = a.last_name.localeCompare(b.last_name, 'fr')
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })
  } else {
    // Tri par défaut : nom alphabétique
    result.sort((a, b) => a.last_name.localeCompare(b.last_name, 'fr'))
  }

  return result
}

// Récupérer un utilisateur par ID
export const getUserByIdAdmin = (id: string): UserWithRelations | undefined => {
  const user = mockUsers.find(u => u.id === id)
  return user ? enrichUser(user) : undefined
}

// Récupérer un utilisateur par email
export const getUserByEmailAdmin = (email: string): UserWithRelations | undefined => {
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
  return user ? enrichUser(user) : undefined
}

// Vérifier si un email est déjà utilisé
export const isEmailTakenUser = (email: string, excludeId?: string): boolean => {
  return mockUsers.some(u =>
    u.email.toLowerCase() === email.toLowerCase() && u.id !== excludeId
  )
}

// Statistiques des utilisateurs
export const getUserStats = (): UserStats => {
  const users = mockUsers
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Comptage par rôle
  const byRole = mockRoles
    .filter(r => r.active)
    .map(role => ({
      role_id: role.id,
      role_name: role.name_fr,
      count: mockUserRoles.filter(ur => ur.role_id === role.id).length
    }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)

  // Comptage par nationalité
  const nationalityCounts = new Map<string, number>()
  users.forEach(u => {
    if (u.nationality_external_id) {
      nationalityCounts.set(
        u.nationality_external_id,
        (nationalityCounts.get(u.nationality_external_id) || 0) + 1
      )
    }
  })
  const byNationality = Array.from(nationalityCounts.entries())
    .map(([countryId, count]) => {
      const country = getCountryByIdRef(countryId)
      return {
        country_id: countryId,
        country_name: country?.name_fr || 'Inconnu',
        count
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    total: users.length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    email_verified: users.filter(u => u.email_verified).length,
    email_not_verified: users.filter(u => !u.email_verified).length,
    by_role: byRole,
    by_nationality: byNationality,
    last_registrations: users.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length,
    last_logins: users.filter(u => u.last_login_at && new Date(u.last_login_at) >= sevenDaysAgo).length
  }
}

// Récupérer les rôles pour le sélecteur
export const getRolesForSelect = (): Array<{ id: string; code: string; name: string }> => {
  return mockRoles
    .filter(r => r.active)
    .sort((a, b) => b.hierarchy_level - a.hierarchy_level)
    .map(r => ({
      id: r.id,
      code: r.code,
      name: r.name_fr
    }))
}

// Récupérer les campus pour le sélecteur
export const getCampusesForUserSelect = (): Array<{ id: string; name: string; code: string }> => {
  return mockCampuses.map(c => ({
    id: c.id,
    name: c.name,
    code: c.code
  }))
}

// Récupérer les pays pour le sélecteur
export const getCountriesForUserSelect = (): Array<{ id: string; name: string; iso_code: string }> => {
  return mockCountriesRef
    .filter(c => c.active)
    .sort((a, b) => a.name_fr.localeCompare(b.name_fr, 'fr'))
    .map(c => ({
      id: c.id,
      name: c.name_fr,
      iso_code: c.iso_code
    }))
}

// Valider un email
export const validateUserEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

// Valider un mot de passe (au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre)
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Formater une date de dernière connexion
export const formatLastLogin = (lastLogin: string | null): string => {
  if (!lastLogin) return 'Jamais connecté'

  const date = new Date(lastLogin)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 5) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Obtenir la couleur d'un rôle
export const getRoleColor = (roleCode: string): string => {
  return roleColors[roleCode] || roleColors.viewer
}

// Vérifier si un utilisateur peut être supprimé
export const canDeleteUser = (userId: string): { canDelete: boolean; reason?: string } => {
  const user = getUserByIdAdmin(userId)
  if (!user) {
    return { canDelete: false, reason: 'Utilisateur introuvable' }
  }

  // Super admin ne peut pas être supprimé
  if (user.roles.some(r => r.code === 'super_admin')) {
    return { canDelete: false, reason: 'Le super administrateur ne peut pas être supprimé' }
  }

  // Vérifier s'il reste au moins un admin actif
  const otherAdmins = mockUsers.filter(u =>
    u.id !== userId &&
    u.active &&
    mockUserRoles.some(ur => ur.user_id === u.id && (ur.role_id === 'role_001' || ur.role_id === 'role_002'))
  )

  if (user.roles.some(r => r.code === 'admin' || r.code === 'super_admin') && otherAdmins.length === 0) {
    return { canDelete: false, reason: 'Il doit rester au moins un administrateur actif' }
  }

  return { canDelete: true }
}

// Vérifier si un utilisateur peut être désactivé
export const canDeactivateUser = (userId: string): { canDeactivate: boolean; reason?: string } => {
  const user = getUserByIdAdmin(userId)
  if (!user) {
    return { canDeactivate: false, reason: 'Utilisateur introuvable' }
  }

  // Super admin ne peut pas être désactivé
  if (user.roles.some(r => r.code === 'super_admin')) {
    return { canDeactivate: false, reason: 'Le super administrateur ne peut pas être désactivé' }
  }

  return { canDeactivate: true }
}

// Historique d'activité d'un utilisateur (depuis audit_logs - simulé)
export const getUserActivityHistory = (userId: string): Array<{
  id: string
  action: string
  table_name: string
  created_at: string
  summary: string
}> => {
  // Simulé - en production, viendrait de la table audit_logs
  const activities = [
    { id: 'act_1', action: 'login', table_name: 'users', created_at: '2025-01-24T08:30:00Z', summary: 'Connexion réussie' },
    { id: 'act_2', action: 'update', table_name: 'news', created_at: '2025-01-23T15:00:00Z', summary: 'Modification article "Rentrée 2025"' },
    { id: 'act_3', action: 'create', table_name: 'events', created_at: '2025-01-22T10:30:00Z', summary: 'Création événement "Conférence"' },
    { id: 'act_4', action: 'login', table_name: 'users', created_at: '2025-01-22T09:00:00Z', summary: 'Connexion réussie' },
    { id: 'act_5', action: 'logout', table_name: 'users', created_at: '2025-01-21T18:00:00Z', summary: 'Déconnexion' }
  ]
  return activities
}
