import { useAuthStore } from '~/stores/auth'
import { getRequiredPermissions, usePermissions } from '~/composables/usePermissions'

export default defineNuxtRouteMiddleware(async (to) => {
  // Routes publiques de l'admin (pas besoin d'authentification)
  const publicAdminRoutes = ['/admin/login', '/admin/register']

  if (!to.path.startsWith('/admin') || publicAdminRoutes.includes(to.path)) {
    return
  }

  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/admin/login')
  }

  // Charger les données utilisateur si pas encore chargées
  if (!authStore.user) {
    await authStore.fetchCurrentUser()
  }

  // Routes toujours accessibles à tout utilisateur authentifié
  const alwaysAllowed = ['/admin', '/admin/profil', '/admin/parametres', '/admin/acces-refuse']
  const cleanPath = to.path.endsWith('/') ? to.path.slice(0, -1) : to.path
  if (alwaysAllowed.includes(cleanPath)) {
    return
  }

  // Vérification des permissions
  const { hasPermission } = usePermissions()
  const requiredPermissions = getRequiredPermissions(to.path)

  if (requiredPermissions.length > 0 && !hasPermission(...requiredPermissions)) {
    return navigateTo('/admin/acces-refuse')
  }
})
