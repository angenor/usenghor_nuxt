/**
 * Types pour les utilisateurs, rôles et permissions
 */

// ============================================================================
// Permissions
// ============================================================================

export interface PermissionRead {
  id: string
  code: string
  name_fr: string
  description: string | null
  category: string | null
  created_at: string
}

// ============================================================================
// Roles
// ============================================================================

export interface RoleRead {
  id: string
  code: string
  name_fr: string
  description: string | null
  hierarchy_level: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface RoleWithPermissions extends RoleRead {
  permissions: PermissionRead[]
}

// ============================================================================
// Users
// ============================================================================

export interface UserMe {
  id: string
  email: string
  last_name: string
  first_name: string
  salutation: string | null
  birth_date: string | null
  phone: string | null
  phone_whatsapp: string | null
  linkedin: string | null
  facebook: string | null
  biography: string | null
  city: string | null
  address: string | null
  active: boolean
  email_verified: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
  photo_external_id: string | null
  nationality_external_id: string | null
  residence_country_external_id: string | null
  roles: RoleWithPermissions[]
}
