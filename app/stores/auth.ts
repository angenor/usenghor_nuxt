import { defineStore } from 'pinia'
import type { TokenResponse, UserMe } from '~/types/api'

// Type minimal pour le cache cookie (évite les problèmes de taille)
interface UserCacheData {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
}

export const useAuthStore = defineStore('auth', () => {
  // Utiliser useCookie pour la persistance SSR-compatible
  const tokenCookie = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    sameSite: 'lax',
  })
  const refreshTokenCookie = useCookie<string | null>('auth_refresh_token', {
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    sameSite: 'lax',
  })
  // Cache minimal utilisateur SSR-compatible (seulement les données essentielles)
  const userCacheCookie = useCookie<UserCacheData | null>('auth_user_min', {
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    sameSite: 'lax',
  })
  // Nettoyer l'ancien cookie volumineux qui causait des problèmes
  const oldUserCache = useCookie('auth_user_cache')
  if (oldUserCache.value) {
    oldUserCache.value = null
  }

  // Utilisateur connecté
  const user = ref<UserMe | null>(null)

  // Initialiser depuis le cache minimal si disponible (pour l'affichage immédiat)
  if (userCacheCookie.value && !user.value) {
    user.value = userCacheCookie.value as UserMe
  }

  // Refs réactives synchronisées avec les cookies
  const token = computed({
    get: () => tokenCookie.value,
    set: (val) => { tokenCookie.value = val },
  })

  const refreshToken = computed({
    get: () => refreshTokenCookie.value,
    set: (val) => { refreshTokenCookie.value = val },
  })

  const isAuthenticated = computed(() => !!token.value)

  async function fetchCurrentUser() {
    if (!token.value) return null
    try {
      const userData = await $fetch<UserMe>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      user.value = userData
      // Sauvegarder seulement les données minimales dans le cookie (évite les problèmes de taille)
      userCacheCookie.value = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
      }
      return userData
    }
    catch {
      // Fallback: utiliser le cache minimal si disponible
      if (userCacheCookie.value) {
        user.value = userCacheCookie.value as UserMe
        return user.value
      }
      user.value = null
      return null
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch<TokenResponse>('/api/auth/login/json', {
      method: 'POST',
      body: { email, password },
    })
    tokenCookie.value = data.access_token
    refreshTokenCookie.value = data.refresh_token
    // Récupérer les infos de l'utilisateur après connexion
    await fetchCurrentUser()
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (!refreshToken.value) return false
    try {
      const data = await $fetch<TokenResponse>('/api/auth/refresh', {
        method: 'POST',
        body: { refresh_token: refreshToken.value },
      })
      tokenCookie.value = data.access_token
      refreshTokenCookie.value = data.refresh_token
      return true
    }
    catch (error: unknown) {
      // Ne logout que si le serveur répond avec une erreur d'auth (401/403)
      // Pas de logout sur erreur réseau (backend indisponible)
      const fetchError = error as { status?: number }
      if (fetchError.status === 401 || fetchError.status === 403) {
        logout()
      }
      return false
    }
  }

  function logout() {
    tokenCookie.value = null
    refreshTokenCookie.value = null
    user.value = null
    // Nettoyer le cache utilisateur (cookie SSR-compatible)
    userCacheCookie.value = null
  }

  return {
    token,
    refreshToken,
    user,
    isAuthenticated,
    login,
    fetchCurrentUser,
    refreshAccessToken,
    logout,
  }
})
