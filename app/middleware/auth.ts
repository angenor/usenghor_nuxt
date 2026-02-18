import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/admin/login')
  }

  // Charger les données utilisateur complètes (avec rôles/permissions)
  // Le cache cookie ne contient que les données minimales (sans rôles)
  if (!authStore.user?.roles?.length) {
    await authStore.fetchCurrentUser()
  }
})
