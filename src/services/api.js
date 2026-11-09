import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://manaduitnya.runasp.net/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

// ── Request Interceptor: sisipkan Bearer token di setiap request ──
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('manaduitnya_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Refresh token queue (hindari multiple refresh bersamaan) ──
let isRefreshing = false
let refreshPromise = null

const doRefresh = async () => {
  if (isRefreshing && refreshPromise) return refreshPromise
  isRefreshing = true
  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('manaduitnya_refresh_token')
    if (!refreshToken) return false
    try {
      const { data: apiResp } = await axios.post(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        { refreshToken }
      )
      const payload = apiResp.data
      if (payload?.accessToken) {
        localStorage.setItem('manaduitnya_token', payload.accessToken)
        if (payload.refreshToken) {
          localStorage.setItem('manaduitnya_refresh_token', payload.refreshToken)
        }
        return true
      }
      return false
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()
  return refreshPromise
}

const forceLogout = () => {
  localStorage.removeItem('manaduitnya_token')
  localStorage.removeItem('manaduitnya_refresh_token')
  localStorage.removeItem('manaduitnya_user')
  window.location.href = '/login'
}

// ── Response Interceptor ──
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const isAuthEndpoint = error.config?.url?.includes('/auth/')
    const hasToken = !!localStorage.getItem('manaduitnya_token')

    // Angkat message dari ApiResponse standar ke error.message
    const apiBody = error.response?.data
    if (apiBody && typeof apiBody === 'object' && 'success' in apiBody) {
      const msg = apiBody.message || apiBody.error?.code || 'Terjadi kesalahan.'
      error.message = msg
    }

    // 401 pada endpoint non-auth: coba refresh dulu
    if (status === 401 && !isAuthEndpoint && hasToken) {
      const refreshed = await doRefresh()
      if (refreshed) {
        // Retry request asli dengan token baru
        const newToken = localStorage.getItem('manaduitnya_token')
        error.config.headers.Authorization = `Bearer ${newToken}`
        return apiClient.request(error.config)
      }
      // Refresh gagal → logout
      forceLogout()
    }

    return Promise.reject(error)
  }
)

export default apiClient
