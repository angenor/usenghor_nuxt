// ============================================================================
// MOCK DATA - GESTION DES RÔLES (ADMINISTRATION)
// ============================================================================
// Basé sur le schéma SQL: 02_identity.sql
// Tables: roles, role_permissions, user_roles
// Complète admin-permissions.ts avec les fonctionnalités spécifiques aux rôles
// ============================================================================

import {
  mockRoles,
  mockPermissions,
  mockRolePermissions,
  permissionCategoryLabels,
  generateRoleId,
  getRoleById,
  getPermissionsByRole,
  type Role,
  type Permission,
  type RolePermission
} from './admin-permissions'

// ============================================================================
// INTERFACES
// ============================================================================

// Rôle avec informations étendues pour la liste
export interface RoleWithDetails extends Role {
  users_count: number
  permissions_count: number
  is_system: boolean
}

// Rôle avec ses permissions détaillées
export interface RoleWithPermissions extends Role {
  users_count: number
  permissions_count: number
  is_system: boolean
  permissions: Permission[]
  permission_ids: string[]
}

// Utilisateur simplifié pour la liste des utilisateurs d'un rôle
export interface RoleUser {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  assigned_at: string
  assigned_by_name?: string
}

// Filtres pour la liste des rôles
export interface RoleFilters {
  search?: string
  active?: boolean
  sort_by?: 'hierarchy_level' | 'name_fr' | 'code' | 'users_count'
  sort_order?: 'asc' | 'desc'
}

// Statistiques des rôles
export interface RoleStats {
  total: number
  active: number
  inactive: number
  system: number
  total_users_with_roles: number
}

// Permissions groupées par catégorie pour le formulaire
export interface PermissionCategoryGroup {
  code: string
  name: string
  permissions: Permission[]
  selected_count: number
  total_count: number
}

// ============================================================================
// DONNÉES MOCK - UTILISATEURS PAR RÔLE
// ============================================================================

// Simulation d'utilisateurs ayant des rôles
export const mockUserRoles: { user_id: string; role_id: string; user_name: string; user_email: string; assigned_at: string }[] = [
  // Super admins
  { user_id: 'user_001', role_id: 'role_001', user_name: 'Jean Dupont', user_email: 'jean.dupont@usenghor.org', assigned_at: '2024-01-01T00:00:00Z' },
  { user_id: 'user_002', role_id: 'role_001', user_name: 'Marie Martin', user_email: 'marie.martin@usenghor.org', assigned_at: '2024-01-15T00:00:00Z' },

  // Admins
  { user_id: 'user_003', role_id: 'role_002', user_name: 'Pierre Bernard', user_email: 'pierre.bernard@usenghor.org', assigned_at: '2024-02-01T00:00:00Z' },
  { user_id: 'user_004', role_id: 'role_002', user_name: 'Sophie Petit', user_email: 'sophie.petit@usenghor.org', assigned_at: '2024-02-15T00:00:00Z' },
  { user_id: 'user_005', role_id: 'role_002', user_name: 'Lucas Moreau', user_email: 'lucas.moreau@usenghor.org', assigned_at: '2024-03-01T00:00:00Z' },

  // Editors
  { user_id: 'user_006', role_id: 'role_003', user_name: 'Emma Durand', user_email: 'emma.durand@usenghor.org', assigned_at: '2024-03-15T00:00:00Z' },
  { user_id: 'user_007', role_id: 'role_003', user_name: 'Hugo Leroy', user_email: 'hugo.leroy@usenghor.org', assigned_at: '2024-04-01T00:00:00Z' },
  { user_id: 'user_008', role_id: 'role_003', user_name: 'Chloé Simon', user_email: 'chloe.simon@usenghor.org', assigned_at: '2024-04-15T00:00:00Z' },
  { user_id: 'user_009', role_id: 'role_003', user_name: 'Nathan Michel', user_email: 'nathan.michel@usenghor.org', assigned_at: '2024-05-01T00:00:00Z' },
  { user_id: 'user_010', role_id: 'role_003', user_name: 'Léa Garcia', user_email: 'lea.garcia@usenghor.org', assigned_at: '2024-05-15T00:00:00Z' },

  // Evaluators
  { user_id: 'user_011', role_id: 'role_004', user_name: 'Prof. Ahmed Diallo', user_email: 'ahmed.diallo@usenghor.org', assigned_at: '2024-06-01T00:00:00Z' },
  { user_id: 'user_012', role_id: 'role_004', user_name: 'Prof. Fatou Sow', user_email: 'fatou.sow@usenghor.org', assigned_at: '2024-06-15T00:00:00Z' },
  { user_id: 'user_013', role_id: 'role_004', user_name: 'Dr. Kouamé Koffi', user_email: 'kouame.koffi@usenghor.org', assigned_at: '2024-07-01T00:00:00Z' },

  // Campus managers
  { user_id: 'user_014', role_id: 'role_005', user_name: 'Amadou Bâ', user_email: 'amadou.ba@usenghor.org', assigned_at: '2024-07-15T00:00:00Z' },
  { user_id: 'user_015', role_id: 'role_005', user_name: 'Mariama Touré', user_email: 'mariama.toure@usenghor.org', assigned_at: '2024-08-01T00:00:00Z' },

  // Viewers
  { user_id: 'user_016', role_id: 'role_006', user_name: 'Paul Roux', user_email: 'paul.roux@usenghor.org', assigned_at: '2024-08-15T00:00:00Z' },
  { user_id: 'user_017', role_id: 'role_006', user_name: 'Julie Blanc', user_email: 'julie.blanc@usenghor.org', assigned_at: '2024-09-01T00:00:00Z' },
  { user_id: 'user_018', role_id: 'role_006', user_name: 'Thomas Noir', user_email: 'thomas.noir@usenghor.org', assigned_at: '2024-09-15T00:00:00Z' },
  { user_id: 'user_019', role_id: 'role_006', user_name: 'Camille Vert', user_email: 'camille.vert@usenghor.org', assigned_at: '2024-10-01T00:00:00Z' },

  // Newsletter managers
  { user_id: 'user_020', role_id: 'role_007', user_name: 'Alice Mercier', user_email: 'alice.mercier@usenghor.org', assigned_at: '2024-10-15T00:00:00Z' },
  { user_id: 'user_021', role_id: 'role_007', user_name: 'Bob Lambert', user_email: 'bob.lambert@usenghor.org', assigned_at: '2024-11-01T00:00:00Z' }
]

// Rôles système qui ne peuvent pas être supprimés
export const systemRoleCodes = ['super_admin', 'admin', 'editor', 'viewer']

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Compter les utilisateurs d'un rôle
export const getUserCountByRole = (roleId: string): number => {
  return mockUserRoles.filter(ur => ur.role_id === roleId).length
}

// Compter les permissions d'un rôle
export const getPermissionCountByRole = (roleId: string): number => {
  const role = getRoleById(roleId)
  if (!role) return 0
  if (role.code === 'super_admin') return mockPermissions.length
  return mockRolePermissions.filter(rp => rp.role_id === roleId).length
}

// Vérifier si un rôle est système
export const isSystemRole = (roleCode: string): boolean => {
  return systemRoleCodes.includes(roleCode)
}

// Récupérer tous les rôles avec détails
export const getAllRolesWithDetails = (filters?: RoleFilters): RoleWithDetails[] => {
  let result = mockRoles.map(role => ({
    ...role,
    users_count: getUserCountByRole(role.id),
    permissions_count: getPermissionCountByRole(role.id),
    is_system: isSystemRole(role.code)
  }))

  // Appliquer les filtres
  if (filters) {
    // Filtre par recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(r =>
        r.code.toLowerCase().includes(search) ||
        r.name_fr.toLowerCase().includes(search) ||
        (r.description?.toLowerCase().includes(search) ?? false)
      )
    }

    // Filtre par statut actif
    if (filters.active !== undefined) {
      result = result.filter(r => r.active === filters.active)
    }

    // Tri
    const sortBy = filters.sort_by || 'hierarchy_level'
    const sortOrder = filters.sort_order || 'desc'

    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'hierarchy_level':
          comparison = a.hierarchy_level - b.hierarchy_level
          break
        case 'name_fr':
          comparison = a.name_fr.localeCompare(b.name_fr, 'fr')
          break
        case 'code':
          comparison = a.code.localeCompare(b.code)
          break
        case 'users_count':
          comparison = a.users_count - b.users_count
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  } else {
    // Tri par défaut: niveau hiérarchique décroissant
    result.sort((a, b) => b.hierarchy_level - a.hierarchy_level)
  }

  return result
}

// Récupérer un rôle avec ses permissions
export const getRoleWithPermissions = (roleId: string): RoleWithPermissions | undefined => {
  const role = getRoleById(roleId)
  if (!role) return undefined

  const permissions = getPermissionsByRole(roleId)
  const permissionIds = role.code === 'super_admin'
    ? mockPermissions.map(p => p.id)
    : mockRolePermissions.filter(rp => rp.role_id === roleId).map(rp => rp.permission_id)

  return {
    ...role,
    users_count: getUserCountByRole(roleId),
    permissions_count: permissions.length,
    is_system: isSystemRole(role.code),
    permissions,
    permission_ids: permissionIds
  }
}

// Récupérer les utilisateurs d'un rôle
export const getUsersByRole = (roleId: string, page: number = 1, limit: number = 10): { users: RoleUser[]; total: number } => {
  const roleUsers = mockUserRoles.filter(ur => ur.role_id === roleId)

  const users: RoleUser[] = roleUsers.map(ur => ({
    id: ur.user_id,
    email: ur.user_email,
    first_name: ur.user_name.split(' ')[0],
    last_name: ur.user_name.split(' ').slice(1).join(' '),
    full_name: ur.user_name,
    assigned_at: ur.assigned_at
  }))

  // Pagination
  const start = (page - 1) * limit
  const paginatedUsers = users.slice(start, start + limit)

  return {
    users: paginatedUsers,
    total: users.length
  }
}

// Obtenir les permissions groupées par catégorie
export const getPermissionsByCategoryForRole = (roleId?: string): PermissionCategoryGroup[] => {
  const selectedPermissionIds = roleId
    ? (getRoleById(roleId)?.code === 'super_admin'
        ? mockPermissions.map(p => p.id)
        : mockRolePermissions.filter(rp => rp.role_id === roleId).map(rp => rp.permission_id))
    : []

  // Grouper par catégorie
  const categories = new Map<string, Permission[]>()
  mockPermissions.forEach(p => {
    if (!categories.has(p.category)) {
      categories.set(p.category, [])
    }
    categories.get(p.category)!.push(p)
  })

  // Convertir en tableau avec comptage
  return Array.from(categories.entries())
    .map(([code, permissions]) => ({
      code,
      name: permissionCategoryLabels[code] || code,
      permissions: permissions.sort((a, b) => a.code.localeCompare(b.code)),
      selected_count: permissions.filter(p => selectedPermissionIds.includes(p.id)).length,
      total_count: permissions.length
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

// Statistiques des rôles
export const getRoleStats = (): RoleStats => {
  const uniqueUsersWithRoles = new Set(mockUserRoles.map(ur => ur.user_id))

  return {
    total: mockRoles.length,
    active: mockRoles.filter(r => r.active).length,
    inactive: mockRoles.filter(r => !r.active).length,
    system: mockRoles.filter(r => isSystemRole(r.code)).length,
    total_users_with_roles: uniqueUsersWithRoles.size
  }
}

// Vérifier si un code de rôle est disponible
export const isRoleCodeAvailable = (code: string, excludeId?: string): boolean => {
  return !mockRoles.some(r =>
    r.code.toLowerCase() === code.toLowerCase() && r.id !== excludeId
  )
}

// Valider le format du code de rôle (snake_case)
export const validateRoleCode = (code: string): boolean => {
  const pattern = /^[a-z][a-z0-9_]*$/
  return pattern.test(code) && code.length >= 2 && code.length <= 50
}

// Valider le nom du rôle
export const validateRoleName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100
}

// Valider le niveau hiérarchique
export const validateHierarchyLevel = (level: number): boolean => {
  return Number.isInteger(level) && level >= 0 && level <= 100
}

// Vérifier si un rôle peut être supprimé
export const canDeleteRole = (roleId: string): { canDelete: boolean; reason?: string } => {
  const role = getRoleById(roleId)
  if (!role) {
    return { canDelete: false, reason: 'Rôle introuvable' }
  }

  // Vérifier si c'est un rôle système
  if (isSystemRole(role.code)) {
    return { canDelete: false, reason: 'Les rôles système ne peuvent pas être supprimés' }
  }

  // Vérifier si des utilisateurs ont ce rôle
  const usersCount = getUserCountByRole(roleId)
  if (usersCount > 0) {
    return {
      canDelete: false,
      reason: `Ce rôle est attribué à ${usersCount} utilisateur${usersCount > 1 ? 's' : ''}`
    }
  }

  return { canDelete: true }
}

// Vérifier si un rôle peut être modifié
export const canModifyRole = (roleId: string): { canModify: boolean; warning?: string } => {
  const role = getRoleById(roleId)
  if (!role) {
    return { canModify: false, warning: 'Rôle introuvable' }
  }

  // Super admin ne peut pas être modifié
  if (role.code === 'super_admin') {
    return { canModify: false, warning: 'Le super administrateur ne peut pas être modifié' }
  }

  // Avertissement pour les rôles système
  if (isSystemRole(role.code)) {
    return {
      canModify: true,
      warning: 'Attention : ce rôle système est utilisé par le système. Toute modification affectera tous les utilisateurs ayant ce rôle.'
    }
  }

  return { canModify: true }
}

// Dupliquer un rôle
export const duplicateRole = (roleId: string, newCode: string, newName: string): Role | undefined => {
  const sourceRole = getRoleById(roleId)
  if (!sourceRole) return undefined

  const newRole: Role = {
    id: generateRoleId(),
    code: newCode,
    name_fr: newName,
    description: `Copie de ${sourceRole.name_fr}`,
    hierarchy_level: Math.max(0, sourceRole.hierarchy_level - 5),
    active: false, // Désactivé par défaut
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return newRole
}

// Labels pour les niveaux hiérarchiques
export const hierarchyLevelLabels: Record<number, string> = {
  100: 'Super Admin',
  80: 'Administrateur',
  60: 'Manager',
  50: 'Éditeur',
  40: 'Coordinateur',
  30: 'Contributeur',
  20: 'Membre',
  10: 'Lecteur',
  0: 'Aucun'
}

// Obtenir le label du niveau hiérarchique le plus proche
export const getHierarchyLevelLabel = (level: number): string => {
  const levels = Object.keys(hierarchyLevelLabels).map(Number).sort((a, b) => b - a)
  for (const l of levels) {
    if (level >= l) {
      return hierarchyLevelLabels[l]
    }
  }
  return hierarchyLevelLabels[0]
}

// Couleurs pour les niveaux hiérarchiques
export const getHierarchyLevelColor = (level: number): string => {
  if (level >= 100) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  if (level >= 80) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  if (level >= 60) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  if (level >= 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  if (level >= 20) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

// Export des types et données de admin-permissions.ts pour centraliser
export {
  mockRoles,
  mockPermissions,
  mockRolePermissions,
  permissionCategoryLabels,
  generateRoleId,
  getRoleById,
  getPermissionsByRole,
  type Role,
  type Permission,
  type RolePermission
}
