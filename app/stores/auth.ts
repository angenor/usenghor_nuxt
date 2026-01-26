import { defineStore } from 'pinia'
import type { TokenResponse } from '~/types/api'

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

  async function login(email: string, password: string) {
    const data = await $fetch<TokenResponse>('/api/auth/login/json', {
      method: 'POST',
      body: { email, password },
    })
    tokenCookie.value = data.access_token
    refreshTokenCookie.value = data.refresh_token
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
  }

  return {
    token,
    refreshToken,
    isAuthenticated,
    login,
    refreshAccessToken,
    logout,
  }
})
