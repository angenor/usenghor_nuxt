import { defineStore } from 'pinia'
import type { TokenResponse, UserMe } from '~/types/api'

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

  // Utilisateur connecté
  const user = ref<UserMe | null>(null)

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
      return userData
    } catch {
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
    } catch {
      logout()
      return false
    }
  }

  function logout() {
    tokenCookie.value = null
    refreshTokenCookie.value = null
    user.value = null
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
