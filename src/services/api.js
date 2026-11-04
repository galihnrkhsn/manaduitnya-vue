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

// ── Response Interceptor: tangani 401 Unauthorized ──
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isAuthEndpoint = error.config?.url?.includes('/auth/')

    // Jika 401 dan bukan dari endpoint auth (login/register),
    // berarti token expired → paksa logout & redirect ke login
    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('manaduitnya_token')
      localStorage.removeItem('manaduitnya_user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default apiClient
