import { defineStore } from 'pinia'
import type { TokenResponse } from '~/types/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function _loadFromStorage() {
    if (import.meta.client) {
      token.value = localStorage.getItem('auth_token')
      refreshToken.value = localStorage.getItem('auth_refresh_token')
    }
  }

  function _saveToStorage() {
    if (import.meta.client) {
      if (token.value) {
        localStorage.setItem('auth_token', token.value)
      } else {
        localStorage.removeItem('auth_token')
      }
      if (refreshToken.value) {
        localStorage.setItem('auth_refresh_token', refreshToken.value)
      } else {
        localStorage.removeItem('auth_refresh_token')
      }
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch<TokenResponse>('/api/auth/login/json', {
      method: 'POST',
      body: { email, password },
    })
    token.value = data.access_token
    refreshToken.value = data.refresh_token
    _saveToStorage()
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (!refreshToken.value) return false
    try {
      const data = await $fetch<TokenResponse>('/api/auth/refresh', {
        method: 'POST',
        body: { refresh_token: refreshToken.value },
      })
      token.value = data.access_token
      refreshToken.value = data.refresh_token
      _saveToStorage()
      return true
    } catch {
      logout()
      return false
    }
  }

  function logout() {
    token.value = null
    refreshToken.value = null
    _saveToStorage()
  }

  // Charger les tokens au démarrage côté client
  _loadFromStorage()

  return {
    token,
    refreshToken,
    isAuthenticated,
    login,
    refreshAccessToken,
    logout,
  }
})
