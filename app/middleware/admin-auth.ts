import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
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
