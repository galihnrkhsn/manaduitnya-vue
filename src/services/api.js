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

// ── Response Interceptor ──
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isAuthEndpoint = error.config?.url?.includes('/auth/')
    const hasToken = !!localStorage.getItem('manaduitnya_token')

    // Hanya paksa logout jika: ada token tersimpan, dapat 401, dan bukan dari auth endpoint
    // Ini artinya token benar-benar ditolak BE (expired/invalid), bukan salah password
    if (status === 401 && !isAuthEndpoint && hasToken) {
      localStorage.removeItem('manaduitnya_token')
      localStorage.removeItem('manaduitnya_user')
      window.location.href = '/login'
    }

    // Angkat message dari ApiResponse standar ke error.message
    const apiBody = error.response?.data
    if (apiBody && typeof apiBody === 'object' && 'success' in apiBody) {
      const msg = apiBody.message || apiBody.error?.code || 'Terjadi kesalahan.'
      error.message = msg
    }

    return Promise.reject(error)
  }
)

export default apiClient
