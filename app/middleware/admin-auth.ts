import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return
  }

  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/admin/login')
  }
})
