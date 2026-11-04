import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy-load semua halaman (lebih ringan — hanya di-load saat dibutuhkan)
const LoginView      = () => import('@/views/LoginView.vue')
const RegisterView   = () => import('@/views/RegisterView.vue')
const DashboardView  = () => import('@/views/DashboardView.vue')
const TransactionsView = () => import('@/views/TransactionsView.vue')
const WalletsView    = () => import('@/views/WalletsView.vue')

const routes = [
  // ── Guest-only routes ────────────────────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { guestOnly: true },
  },

  // ── Protected routes ─────────────────────────────────────────
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: TransactionsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/wallets',
    name: 'Wallets',
    component: WalletsView,
    meta: { requiresAuth: true },
  },

  // ── Fallback ──────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
})

// ── Navigation Guard ──────────────────────────────────────────
router.beforeEach((to) => {
  // Pinia store baru bisa diakses setelah app mount,
  // tapi di sini aman karena guard dipanggil setelah router.install
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // Belum login → lempar ke login, simpan tujuan asal
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    // Sudah login tapi akses /login atau /register → lempar ke dashboard
    return { name: 'Dashboard' }
  }
})

export default router
