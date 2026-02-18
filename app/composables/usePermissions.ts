/**
 * Composable centralisé pour la gestion des permissions utilisateur
 * Utilisé par le sidebar, le middleware et les pages admin
 */

import type { SidebarSection } from './useAdminSidebar'

/**
 * Mapping route → permissions requises
 * Construit à partir de la structure du sidebar + routes supplémentaires
 */
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Formations
  '/admin/formations': ['programs.view'],
  '/admin/formations/programmes': ['programs.view'],
  '/admin/formations/semestres': ['programs.view'],
  '/admin/formations/competences': ['programs.view'],
  '/admin/formations/debouches': ['programs.view'],
  '/admin/formations/champs': ['programs.view'],
  // Candidatures
  '/admin/candidatures': ['applications.view'],
  '/admin/candidatures/appels': ['applications.view'],
  '/admin/candidatures/dossiers': ['applications.view'],
  '/admin/candidatures/statistiques': ['applications.view'],
  // Contenus
  '/admin/contenus': ['news.view', 'events.view'],
  '/admin/contenus/actualites': ['news.view'],
  '/admin/contenus/evenements': ['events.view'],
  '/admin/contenus/inscriptions': ['events.view'],
  '/admin/contenus/etiquettes': ['news.edit'],
  // Projets
  '/admin/projets': ['projects.view'],
  '/admin/projets/liste': ['projects.view'],
  '/admin/projets/categories': ['projects.view'],
  '/admin/projets/appels': ['projects.view'],
  // Organisation
  '/admin/organisation': ['organization.view'],
  '/admin/organisation/secteurs': ['organization.view'],
  '/admin/organisation/services': ['organization.view'],
  '/admin/organisation/objectifs': ['organization.view'],
  // Campus
  '/admin/campus': ['campuses.view'],
  '/admin/campus/liste': ['campuses.view'],
  '/admin/campus/equipes': ['campuses.view'],
  '/admin/campus/carte': ['campuses.view'],
  // Partenaires
  '/admin/partenaires': ['partners.view'],
  // Médiathèque
  '/admin/mediatheque': ['media.view'],
  // Newsletter
  '/admin/newsletter': ['newsletter.view'],
  '/admin/newsletter/campagnes': ['newsletter.view'],
  '/admin/newsletter/abonnes': ['newsletter.view'],
  '/admin/newsletter/statistiques': ['newsletter.view'],
  // Éditorial
  '/admin/editorial': ['editorial.view'],
  '/admin/editorial/chiffres-cles': ['editorial.edit'],
  '/admin/editorial/valeurs': ['editorial.edit'],
  '/admin/editorial/contact': ['editorial.edit'],
  '/admin/editorial/reseaux-sociaux': ['editorial.edit'],
  '/admin/editorial/mentions-legales': ['editorial.edit'],
  // Données de référence
  '/admin/references': ['admin.settings'],
  '/admin/references/pays': ['admin.settings'],
  // Administration
  '/admin/administration': ['users.view'],
  '/admin/administration/utilisateurs': ['users.view'],
  '/admin/administration/roles': ['users.roles'],
  '/admin/administration/permissions': ['users.roles'],
  '/admin/administration/audit': ['admin.audit'],
}

/**
 * Trouve les permissions requises pour un chemin donné.
 * Cherche la correspondance la plus spécifique (plus long préfixe).
 */
export function getRequiredPermissions(path: string): string[] {
  // Nettoyage du trailing slash
  const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path

  // Correspondance exacte
  if (ROUTE_PERMISSIONS[cleanPath]) {
    return ROUTE_PERMISSIONS[cleanPath]
  }

  // Chercher le préfixe le plus long qui correspond
  let bestMatch = ''
  for (const route of Object.keys(ROUTE_PERMISSIONS)) {
    if (cleanPath.startsWith(route + '/') && route.length > bestMatch.length) {
      bestMatch = route
    }
  }

  return bestMatch ? ROUTE_PERMISSIONS[bestMatch] : []
}

export function usePermissions() {
  const authStore = useAuthStore()

  /**
   * Liste plate des codes de permissions de l'utilisateur.
   * Retourne ['*'] pour les super admins (accès total).
   */
  const userPermissions = computed<string[]>(() => {
    if (!authStore.user?.roles) return []
    const perms = new Set<string>()
    for (const role of authStore.user.roles) {
      if (role.code === 'super_admin') return ['*']
      if (!role.permissions) continue
      for (const perm of role.permissions) {
        perms.add(perm.code)
      }
    }
    return [...perms]
  })

  const isSuperAdmin = computed(() =>
    authStore.user?.roles?.some(r => r.code === 'super_admin') ?? false
  )

  /**
   * Vérifie si l'utilisateur a AU MOINS UNE des permissions données.
   * Retourne true si aucune permission n'est requise (tableau vide).
   */
  function hasPermission(...codes: string[]): boolean {
    if (codes.length === 0) return true
    if (isSuperAdmin.value) return true
    return codes.some(code => userPermissions.value.includes(code))
  }

  /**
   * Vérifie si l'utilisateur a TOUTES les permissions données.
   */
  function hasAllPermissions(...codes: string[]): boolean {
    if (codes.length === 0) return true
    if (isSuperAdmin.value) return true
    return codes.every(code => userPermissions.value.includes(code))
  }

  return {
    userPermissions,
    isSuperAdmin,
    hasPermission,
    hasAllPermissions,
  }
}
