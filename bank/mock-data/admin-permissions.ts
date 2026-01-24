// ============================================================================
// MOCK DATA - PERMISSIONS ET RÔLES (ADMINISTRATION)
// ============================================================================
// Basé sur le schéma SQL: 02_identity.sql
// Tables: permissions, roles, role_permissions
// ============================================================================

// Interface Permission basée sur le schéma SQL
export interface Permission {
  id: string
  code: string           // Code unique (format: category.action)
  name_fr: string        // Nom français
  description: string | null
  category: string       // Catégorie (users, programs, etc.)
  created_at: string
}

// Interface Role basée sur le schéma SQL
export interface Role {
  id: string
  code: string           // Code unique (admin, editor, etc.)
  name_fr: string        // Nom français
  description: string | null
  hierarchy_level: number  // Niveau hiérarchique (plus élevé = plus de droits)
  active: boolean
  created_at: string
  updated_at: string
}

// Interface pour la relation role_permissions
export interface RolePermission {
  role_id: string
  permission_id: string
}

// Filtres pour la liste des permissions
export interface PermissionFilters {
  search?: string
  category?: string
}

// Catégorie de permissions avec ses permissions
export interface PermissionCategory {
  code: string
  name: string
  permissions: PermissionWithRoles[]
}

// Permission avec comptage des rôles
export interface PermissionWithRoles {
  id: string
  code: string
  name_fr: string
  description: string | null
  roles_count: number
}

// Statistiques des permissions
export interface PermissionStats {
  total: number
  categories_count: number
  roles_count: number
  active_roles: number
}

// Matrice permissions/rôles
export interface PermissionMatrix {
  roles: { id: string; code: string; name_fr: string }[]
  categories: PermissionMatrixCategory[]
}

export interface PermissionMatrixCategory {
  code: string
  name: string
  permissions: PermissionMatrixItem[]
}

export interface PermissionMatrixItem {
  id: string
  code: string
  name_fr: string
  roles: string[]  // Liste des role_id ayant cette permission
}

// Changement pour la mise à jour de la matrice
export interface PermissionMatrixChange {
  role_id: string
  permission_id: string
  granted: boolean
}

// ============================================================================
// DONNÉES MOCK - CATÉGORIES DE PERMISSIONS
// ============================================================================

export const permissionCategoryLabels: Record<string, string> = {
  users: 'Gestion des utilisateurs',
  programs: 'Gestion des formations',
  applications: 'Gestion des candidatures',
  events: 'Gestion des événements',
  news: 'Gestion des actualités',
  campuses: 'Gestion des campus',
  partners: 'Gestion des partenaires',
  editorial: 'Contenu éditorial',
  newsletter: 'Newsletter',
  admin: 'Administration système'
}

// ============================================================================
// DONNÉES MOCK - PERMISSIONS
// ============================================================================

export const mockPermissions: Permission[] = [
  // Catégorie: users
  {
    id: 'perm_001',
    code: 'users.view',
    name_fr: 'Voir les utilisateurs',
    description: 'Permet de consulter la liste et les détails des utilisateurs',
    category: 'users',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_002',
    code: 'users.create',
    name_fr: 'Créer des utilisateurs',
    description: 'Permet de créer de nouveaux comptes utilisateurs',
    category: 'users',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_003',
    code: 'users.edit',
    name_fr: 'Modifier les utilisateurs',
    description: 'Permet de modifier les informations des utilisateurs existants',
    category: 'users',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_004',
    code: 'users.delete',
    name_fr: 'Supprimer des utilisateurs',
    description: 'Permet de supprimer des comptes utilisateurs',
    category: 'users',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_005',
    code: 'users.roles',
    name_fr: 'Gérer les rôles des utilisateurs',
    description: 'Permet d\'attribuer ou retirer des rôles aux utilisateurs',
    category: 'users',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Catégorie: programs
  {
    id: 'perm_006',
    code: 'programs.view',
    name_fr: 'Voir les formations',
    description: 'Permet de consulter la liste et les détails des formations',
    category: 'programs',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_007',
    code: 'programs.create',
    name_fr: 'Créer des formations',
    description: 'Permet de créer de nouvelles formations',
    category: 'programs',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_008',
    code: 'programs.edit',
    name_fr: 'Modifier les formations',
    description: 'Permet de modifier les formations existantes',
    category: 'programs',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_009',
    code: 'programs.delete',
    name_fr: 'Supprimer des formations',
    description: 'Permet de supprimer des formations',
    category: 'programs',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Catégorie: applications
  {
    id: 'perm_010',
    code: 'applications.view',
    name_fr: 'Voir les candidatures',
    description: 'Permet de consulter les dossiers de candidature',
    category: 'applications',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_011',
    code: 'applications.evaluate',
    name_fr: 'Évaluer les candidatures',
    description: 'Permet d\'évaluer et noter les candidatures',
    category: 'applications',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_012',
    code: 'applications.export',
    name_fr: 'Exporter les candidatures',
    description: 'Permet d\'exporter les données des candidatures',
    category: 'applications',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Catégorie: events
  {
    id: 'perm_013',
    code: 'events.view',
    name_fr: 'Voir les événements',
    description: 'Permet de consulter la liste et les détails des événements',
    category: 'events',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_014',
    code: 'events.create',
    name_fr: 'Créer des événements',
    description: 'Permet de créer de nouveaux événements',
    category: 'events',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_015',
    code: 'events.edit',
    name_fr: 'Modifier les événements',
    description: 'Permet de modifier les événements existants',
    category: 'events',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_016',
    code: 'events.delete',
    name_fr: 'Supprimer des événements',
    description: 'Permet de supprimer des événements',
    category: 'events',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Catégorie: news
  {
    id: 'perm_017',
    code: 'news.view',
    name_fr: 'Voir les actualités',
    description: 'Permet de consulter la liste et les détails des actualités',
    category: 'news',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_018',
    code: 'news.create',
    name_fr: 'Créer des actualités',
    description: 'Permet de créer de nouvelles actualités',
    category: 'news',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_019',
    code: 'news.edit',
    name_fr: 'Modifier les actualités',
    description: 'Permet de modifier les actualités existantes',
    category: 'news',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_020',
    code: 'news.delete',
    name_fr: 'Supprimer des actualités',
    description: 'Permet de supprimer des actualités',
    category: 'news',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Catégorie: campuses
  {
    id: 'perm_021',
    code: 'campuses.view',
    name_fr: 'Voir les campus',
    description: 'Permet de consulter la liste et les détails des campus',
    category: 'campuses',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_022',
    code: 'campuses.create',
    name_fr: 'Créer des campus',
    description: 'Permet de créer de nouveaux campus',
    category: 'campuses',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_023',
    code: 'campuses.edit',
    name_fr: 'Modifier les campus',
    description: 'Permet de modifier les campus existants',
    category: 'campuses',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_024',
    code: 'campuses.delete',
    name_fr: 'Supprimer des campus',
    description: 'Permet de supprimer des campus',
    category: 'campuses',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Catégorie: partners
  {
    id: 'perm_025',
    code: 'partners.view',
    name_fr: 'Voir les partenaires',
    description: 'Permet de consulter la liste et les détails des partenaires',
    category: 'partners',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_026',
    code: 'partners.create',
    name_fr: 'Créer des partenaires',
    description: 'Permet de créer de nouveaux partenaires',
    category: 'partners',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_027',
    code: 'partners.edit',
    name_fr: 'Modifier les partenaires',
    description: 'Permet de modifier les partenaires existants',
    category: 'partners',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_028',
    code: 'partners.delete',
    name_fr: 'Supprimer des partenaires',
    description: 'Permet de supprimer des partenaires',
    category: 'partners',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Catégorie: editorial
  {
    id: 'perm_029',
    code: 'editorial.view',
    name_fr: 'Voir le contenu éditorial',
    description: 'Permet de consulter le contenu éditorial (pages, chiffres clés, etc.)',
    category: 'editorial',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_030',
    code: 'editorial.edit',
    name_fr: 'Modifier le contenu éditorial',
    description: 'Permet de modifier le contenu éditorial',
    category: 'editorial',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Catégorie: newsletter
  {
    id: 'perm_031',
    code: 'newsletter.view',
    name_fr: 'Voir la newsletter',
    description: 'Permet de consulter les campagnes et abonnés newsletter',
    category: 'newsletter',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_032',
    code: 'newsletter.create',
    name_fr: 'Créer des campagnes newsletter',
    description: 'Permet de créer de nouvelles campagnes newsletter',
    category: 'newsletter',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_033',
    code: 'newsletter.send',
    name_fr: 'Envoyer la newsletter',
    description: 'Permet d\'envoyer les campagnes newsletter aux abonnés',
    category: 'newsletter',
    created_at: '2024-01-01T00:00:00Z'
  },

  // Catégorie: admin
  {
    id: 'perm_034',
    code: 'admin.settings',
    name_fr: 'Gérer les paramètres',
    description: 'Permet de modifier les paramètres système',
    category: 'admin',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'perm_035',
    code: 'admin.audit',
    name_fr: 'Voir les logs d\'audit',
    description: 'Permet de consulter les journaux d\'audit système',
    category: 'admin',
    created_at: '2024-01-01T00:00:00Z'
  }
]

// ============================================================================
// DONNÉES MOCK - RÔLES
// ============================================================================

export const mockRoles: Role[] = [
  {
    id: 'role_001',
    code: 'super_admin',
    name_fr: 'Super administrateur',
    description: 'Accès complet à toutes les fonctionnalités. Ce rôle ne peut pas être modifié.',
    hierarchy_level: 100,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role_002',
    code: 'admin',
    name_fr: 'Administrateur',
    description: 'Gestion complète des utilisateurs, formations et contenus',
    hierarchy_level: 80,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role_003',
    code: 'editor',
    name_fr: 'Éditeur',
    description: 'Gestion des actualités, événements et contenu éditorial',
    hierarchy_level: 50,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role_004',
    code: 'evaluator',
    name_fr: 'Évaluateur',
    description: 'Consultation et évaluation des candidatures',
    hierarchy_level: 30,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role_005',
    code: 'campus_manager',
    name_fr: 'Gestionnaire de campus',
    description: 'Gestion d\'un campus spécifique',
    hierarchy_level: 40,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role_006',
    code: 'viewer',
    name_fr: 'Lecteur',
    description: 'Accès en lecture seule aux données',
    hierarchy_level: 10,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role_007',
    code: 'newsletter_manager',
    name_fr: 'Gestionnaire newsletter',
    description: 'Gestion des campagnes newsletter',
    hierarchy_level: 25,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role_008',
    code: 'deprecated_role',
    name_fr: 'Rôle obsolète',
    description: 'Ancien rôle désactivé',
    hierarchy_level: 0,
    active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z'
  }
]

// ============================================================================
// DONNÉES MOCK - RELATIONS ROLE_PERMISSIONS
// ============================================================================

export const mockRolePermissions: RolePermission[] = [
  // Super admin - toutes les permissions (implicite, mais listé pour la matrice)
  // Note: le super_admin a toutes les permissions implicitement, pas besoin de les lister

  // Admin - quasi toutes les permissions sauf admin.settings et admin.audit
  { role_id: 'role_002', permission_id: 'perm_001' }, // users.view
  { role_id: 'role_002', permission_id: 'perm_002' }, // users.create
  { role_id: 'role_002', permission_id: 'perm_003' }, // users.edit
  { role_id: 'role_002', permission_id: 'perm_004' }, // users.delete
  { role_id: 'role_002', permission_id: 'perm_005' }, // users.roles
  { role_id: 'role_002', permission_id: 'perm_006' }, // programs.view
  { role_id: 'role_002', permission_id: 'perm_007' }, // programs.create
  { role_id: 'role_002', permission_id: 'perm_008' }, // programs.edit
  { role_id: 'role_002', permission_id: 'perm_009' }, // programs.delete
  { role_id: 'role_002', permission_id: 'perm_010' }, // applications.view
  { role_id: 'role_002', permission_id: 'perm_011' }, // applications.evaluate
  { role_id: 'role_002', permission_id: 'perm_012' }, // applications.export
  { role_id: 'role_002', permission_id: 'perm_013' }, // events.view
  { role_id: 'role_002', permission_id: 'perm_014' }, // events.create
  { role_id: 'role_002', permission_id: 'perm_015' }, // events.edit
  { role_id: 'role_002', permission_id: 'perm_016' }, // events.delete
  { role_id: 'role_002', permission_id: 'perm_017' }, // news.view
  { role_id: 'role_002', permission_id: 'perm_018' }, // news.create
  { role_id: 'role_002', permission_id: 'perm_019' }, // news.edit
  { role_id: 'role_002', permission_id: 'perm_020' }, // news.delete
  { role_id: 'role_002', permission_id: 'perm_021' }, // campuses.view
  { role_id: 'role_002', permission_id: 'perm_022' }, // campuses.create
  { role_id: 'role_002', permission_id: 'perm_023' }, // campuses.edit
  { role_id: 'role_002', permission_id: 'perm_024' }, // campuses.delete
  { role_id: 'role_002', permission_id: 'perm_025' }, // partners.view
  { role_id: 'role_002', permission_id: 'perm_026' }, // partners.create
  { role_id: 'role_002', permission_id: 'perm_027' }, // partners.edit
  { role_id: 'role_002', permission_id: 'perm_028' }, // partners.delete
  { role_id: 'role_002', permission_id: 'perm_029' }, // editorial.view
  { role_id: 'role_002', permission_id: 'perm_030' }, // editorial.edit
  { role_id: 'role_002', permission_id: 'perm_031' }, // newsletter.view
  { role_id: 'role_002', permission_id: 'perm_032' }, // newsletter.create
  { role_id: 'role_002', permission_id: 'perm_033' }, // newsletter.send

  // Editor - actualités, événements, éditorial
  { role_id: 'role_003', permission_id: 'perm_013' }, // events.view
  { role_id: 'role_003', permission_id: 'perm_014' }, // events.create
  { role_id: 'role_003', permission_id: 'perm_015' }, // events.edit
  { role_id: 'role_003', permission_id: 'perm_017' }, // news.view
  { role_id: 'role_003', permission_id: 'perm_018' }, // news.create
  { role_id: 'role_003', permission_id: 'perm_019' }, // news.edit
  { role_id: 'role_003', permission_id: 'perm_029' }, // editorial.view
  { role_id: 'role_003', permission_id: 'perm_030' }, // editorial.edit

  // Evaluator - candidatures uniquement
  { role_id: 'role_004', permission_id: 'perm_010' }, // applications.view
  { role_id: 'role_004', permission_id: 'perm_011' }, // applications.evaluate

  // Campus manager - campus, événements, actualités, partenaires
  { role_id: 'role_005', permission_id: 'perm_013' }, // events.view
  { role_id: 'role_005', permission_id: 'perm_014' }, // events.create
  { role_id: 'role_005', permission_id: 'perm_015' }, // events.edit
  { role_id: 'role_005', permission_id: 'perm_017' }, // news.view
  { role_id: 'role_005', permission_id: 'perm_018' }, // news.create
  { role_id: 'role_005', permission_id: 'perm_019' }, // news.edit
  { role_id: 'role_005', permission_id: 'perm_021' }, // campuses.view
  { role_id: 'role_005', permission_id: 'perm_023' }, // campuses.edit
  { role_id: 'role_005', permission_id: 'perm_025' }, // partners.view

  // Viewer - lecture seule
  { role_id: 'role_006', permission_id: 'perm_001' }, // users.view
  { role_id: 'role_006', permission_id: 'perm_006' }, // programs.view
  { role_id: 'role_006', permission_id: 'perm_010' }, // applications.view
  { role_id: 'role_006', permission_id: 'perm_013' }, // events.view
  { role_id: 'role_006', permission_id: 'perm_017' }, // news.view
  { role_id: 'role_006', permission_id: 'perm_021' }, // campuses.view
  { role_id: 'role_006', permission_id: 'perm_025' }, // partners.view
  { role_id: 'role_006', permission_id: 'perm_029' }, // editorial.view
  { role_id: 'role_006', permission_id: 'perm_031' }, // newsletter.view

  // Newsletter manager
  { role_id: 'role_007', permission_id: 'perm_031' }, // newsletter.view
  { role_id: 'role_007', permission_id: 'perm_032' }, // newsletter.create
  { role_id: 'role_007', permission_id: 'perm_033' }  // newsletter.send
]

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Générer un ID unique pour permission
export const generatePermissionId = (): string => {
  return `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Générer un ID unique pour rôle
export const generateRoleId = (): string => {
  return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Récupérer toutes les permissions avec filtres
export const getAllPermissions = (filters?: PermissionFilters): Permission[] => {
  let result = [...mockPermissions]

  if (filters) {
    // Filtre par recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(p =>
        p.code.toLowerCase().includes(search) ||
        p.name_fr.toLowerCase().includes(search) ||
        (p.description?.toLowerCase().includes(search) ?? false)
      )
    }

    // Filtre par catégorie
    if (filters.category) {
      result = result.filter(p => p.category === filters.category)
    }
  }

  // Tri par code
  result.sort((a, b) => a.code.localeCompare(b.code))

  return result
}

// Récupérer une permission par ID
export const getPermissionById = (id: string): Permission | undefined => {
  return mockPermissions.find(p => p.id === id)
}

// Récupérer une permission par code
export const getPermissionByCode = (code: string): Permission | undefined => {
  return mockPermissions.find(p => p.code === code)
}

// Vérifier si un code de permission est déjà utilisé
export const isPermissionCodeTaken = (code: string, excludeId?: string): boolean => {
  return mockPermissions.some(p =>
    p.code.toLowerCase() === code.toLowerCase() && p.id !== excludeId
  )
}

// Récupérer les permissions groupées par catégorie
export const getPermissionsByCategory = (filters?: PermissionFilters): PermissionCategory[] => {
  const permissions = getAllPermissions(filters)
  const categories = new Map<string, PermissionWithRoles[]>()

  // Grouper par catégorie
  permissions.forEach(p => {
    const rolesCount = mockRolePermissions.filter(rp => rp.permission_id === p.id).length
    const permWithRoles: PermissionWithRoles = {
      id: p.id,
      code: p.code,
      name_fr: p.name_fr,
      description: p.description,
      roles_count: rolesCount
    }

    if (!categories.has(p.category)) {
      categories.set(p.category, [])
    }
    categories.get(p.category)!.push(permWithRoles)
  })

  // Convertir en tableau
  return Array.from(categories.entries()).map(([code, perms]) => ({
    code,
    name: permissionCategoryLabels[code] || code,
    permissions: perms.sort((a, b) => a.code.localeCompare(b.code))
  })).sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

// Récupérer les catégories disponibles
export const getPermissionCategories = (): string[] => {
  const categories = new Set(mockPermissions.map(p => p.category))
  return Array.from(categories).sort()
}

// Récupérer tous les rôles
export const getAllRoles = (activeOnly: boolean = false): Role[] => {
  let result = [...mockRoles]
  if (activeOnly) {
    result = result.filter(r => r.active)
  }
  return result.sort((a, b) => b.hierarchy_level - a.hierarchy_level)
}

// Récupérer un rôle par ID
export const getRoleById = (id: string): Role | undefined => {
  return mockRoles.find(r => r.id === id)
}

// Récupérer un rôle par code
export const getRoleByCode = (code: string): Role | undefined => {
  return mockRoles.find(r => r.code === code)
}

// Récupérer les rôles ayant une permission
export const getRolesByPermission = (permissionId: string): Role[] => {
  const roleIds = mockRolePermissions
    .filter(rp => rp.permission_id === permissionId)
    .map(rp => rp.role_id)

  return mockRoles.filter(r => roleIds.includes(r.id))
}

// Récupérer les permissions d'un rôle
export const getPermissionsByRole = (roleId: string): Permission[] => {
  const role = getRoleById(roleId)
  if (!role) return []

  // Super admin a toutes les permissions
  if (role.code === 'super_admin') {
    return [...mockPermissions]
  }

  const permissionIds = mockRolePermissions
    .filter(rp => rp.role_id === roleId)
    .map(rp => rp.permission_id)

  return mockPermissions.filter(p => permissionIds.includes(p.id))
}

// Vérifier si un rôle a une permission
export const roleHasPermission = (roleId: string, permissionId: string): boolean => {
  const role = getRoleById(roleId)
  if (!role) return false

  // Super admin a toutes les permissions
  if (role.code === 'super_admin') return true

  return mockRolePermissions.some(
    rp => rp.role_id === roleId && rp.permission_id === permissionId
  )
}

// Générer la matrice permissions/rôles
export const getPermissionMatrix = (): PermissionMatrix => {
  const roles = getAllRoles(true).map(r => ({
    id: r.id,
    code: r.code,
    name_fr: r.name_fr
  }))

  const categories = getPermissionCategories()
  const matrixCategories: PermissionMatrixCategory[] = categories.map(catCode => {
    const catPermissions = mockPermissions.filter(p => p.category === catCode)

    return {
      code: catCode,
      name: permissionCategoryLabels[catCode] || catCode,
      permissions: catPermissions.map(p => ({
        id: p.id,
        code: p.code,
        name_fr: p.name_fr,
        roles: roles
          .filter(r => roleHasPermission(r.id, p.id))
          .map(r => r.id)
      }))
    }
  })

  return {
    roles,
    categories: matrixCategories
  }
}

// Statistiques des permissions
export const getPermissionStats = (): PermissionStats => {
  return {
    total: mockPermissions.length,
    categories_count: getPermissionCategories().length,
    roles_count: mockRoles.length,
    active_roles: mockRoles.filter(r => r.active).length
  }
}

// Valider le format du code de permission
export const validatePermissionCode = (code: string): boolean => {
  // Format: category.action (ex: users.view)
  const pattern = /^[a-z]+\.[a-z_]+$/
  return pattern.test(code)
}

// Vérifier si une permission peut être supprimée
export const canDeletePermission = (permissionId: string): { canDelete: boolean; reason?: string } => {
  const permission = getPermissionById(permissionId)
  if (!permission) {
    return { canDelete: false, reason: 'Permission introuvable' }
  }

  // Vérifier si la permission est utilisée par des rôles
  const usedByRoles = mockRolePermissions.filter(rp => rp.permission_id === permissionId)
  if (usedByRoles.length > 0) {
    const roleNames = usedByRoles
      .map(rp => getRoleById(rp.role_id)?.name_fr || 'Inconnu')
      .join(', ')
    return {
      canDelete: false,
      reason: `Cette permission est utilisée par ${usedByRoles.length} rôle(s): ${roleNames}`
    }
  }

  return { canDelete: true }
}

// Vérifier si un rôle peut être modifié
export const canEditRole = (roleId: string): { canEdit: boolean; reason?: string } => {
  const role = getRoleById(roleId)
  if (!role) {
    return { canEdit: false, reason: 'Rôle introuvable' }
  }

  // Super admin ne peut pas être modifié
  if (role.code === 'super_admin') {
    return { canEdit: false, reason: 'Le super administrateur ne peut pas être modifié' }
  }

  return { canEdit: true }
}
