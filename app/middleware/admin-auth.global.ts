import { useAuthStore } from '~/stores/auth'

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
})
