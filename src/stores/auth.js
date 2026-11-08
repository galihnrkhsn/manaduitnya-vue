import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/api'
import { useFinanceStore } from '@/stores/finance'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('manaduitnya_token') || '')
  const user  = ref(JSON.parse(localStorage.getItem('manaduitnya_user') || 'null'))
  const loading = ref(false)
  const error   = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  // ── Helpers ───────────────────────────────────────────────────
  const persist = (accessToken, userData) => {
    token.value = accessToken
    user.value  = userData
    localStorage.setItem('manaduitnya_token', accessToken)
    localStorage.setItem('manaduitnya_user', JSON.stringify(userData))
  }

  const clearError = () => { error.value = null }

  // ── Actions ───────────────────────────────────────────────────

  /**
   * Login
   * BE response: { accessToken, refreshToken, userId, name, email }
   */
  const login = async (credentials) => {
    loading.value = true
    error.value   = null
    try {
      const { data } = await apiClient.post('/auth/login', credentials)

      const accessToken = data.accessToken
      const userData = {
        id:    data.userId,
        name:  data.name,
        email: data.email,
      }

      persist(accessToken, userData)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message
        ?? err.response?.data?.title
        ?? 'Email atau password salah.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  /**
   * Register
   * BE response: { accessToken, refreshToken, userId, name, email }
   * BE langsung balas token → auto login ke dashboard
   */
  const register = async (payload) => {
    loading.value = true
    error.value   = null
    try {
      const { data } = await apiClient.post('/auth/register', payload)

      const accessToken = data.accessToken
      const userData = {
        id:    data.userId,
        name:  data.name,
        email: data.email,
      }

      persist(accessToken, userData)
      return { success: true, autoLogin: true }
    } catch (err) {
      error.value = err.response?.data?.message
        ?? err.response?.data?.title
        ?? 'Pendaftaran gagal. Coba lagi.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = ''
    user.value  = null
    localStorage.removeItem('manaduitnya_token')
    localStorage.removeItem('manaduitnya_user')
    useFinanceStore().reset()
  }

  const isTokenExpire = (t) => {
    try {
      const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  const checkSession = () => {
    if (!token.value) return false
    if (isTokenExpire(token.value)) {
      logout()
      return false
    }
    return false
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    clearError,
    login,
    register,
    logout,
    checkSession,
  }
})
