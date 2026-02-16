import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/admin/login')
  }

  // Charger les données utilisateur si pas encore chargées
  if (!authStore.user) {
    await authStore.fetchCurrentUser()
  }
})
