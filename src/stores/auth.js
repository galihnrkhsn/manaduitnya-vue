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
   * BE response: ApiResponse<{ accessToken, refreshToken, userId, name, email }>
   */
  const login = async (credentials) => {
    loading.value = true
    error.value   = null
    try {
      const { data: apiResp } = await apiClient.post('/auth/login', credentials)

      const payload    = apiResp.data
      const accessToken = payload.accessToken
      const userData = {
        id:    payload.userId,
        name:  payload.name,
        email: payload.email,
      }

      persist(accessToken, userData)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message
        ?? err.message
        ?? 'Email atau password salah.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  /**
   * Register
   * BE response: ApiResponse<{ accessToken, refreshToken, userId, name, email }>
   * BE langsung balas token → auto login ke dashboard
   */
  const register = async (payload) => {
    loading.value = true
    error.value   = null
    try {
      const { data: apiResp } = await apiClient.post('/auth/register', payload)

      const tokenData   = apiResp.data
      const accessToken = tokenData.accessToken
      const userData = {
        id:    tokenData.userId,
        name:  tokenData.name,
        email: tokenData.email,
      }

      persist(accessToken, userData)
      return { success: true, autoLogin: true }
    } catch (err) {
      error.value = err.response?.data?.message
        ?? err.message
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

  const logoutApi = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // tetap logout lokal meski BE gagal
    } finally {
      logout()
    }
  }

  const fetchMe = async () => {
    try {
      const { data: apiResp } = await apiClient.get('/auth/me')
      const me = apiResp.data ?? apiResp
      if (me) {
        user.value = { id: me.userId ?? me.id, name: me.name, email: me.email }
        localStorage.setItem('manaduitnya_user', JSON.stringify(user.value))
      }
      return { success: true, data: me }
    } catch (err) {
      return { success: false, error: err.response?.data?.message ?? err.message ?? 'Gagal memuat profil.' }
    }
  }

  const isTokenExpire = (t) => {
    try {
      const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      return payload.exp * 1000 < (Date.now() - 60000)
    } catch {
      return false
    }
  }

  const checkSession = () => {
    if (!token.value) return false
    if (isTokenExpire(token.value)) {
      logout()
      return false
    }
    return true
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
    logoutApi,
    fetchMe,
    checkSession,
  }
})
