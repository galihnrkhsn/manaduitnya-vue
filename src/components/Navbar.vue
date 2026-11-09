<template>
  <header class="bg-surface/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 pt-safe transition-transform duration-300 ease-in-out" :class="isNavHidden ? '-translate-y-full md:translate-y-0' : 'translate-y-0'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14 sm:h-16">
        <div class="flex items-center gap-6">
          <router-link to="/" class="flex items-center gap-2.5 ios-active-scale">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand flex items-center justify-center text-white shadow-md shadow-brand/25"><img src="/public/pwa-192x192.png" alt="_"></div>
            <span class="text-lg sm:text-xl font-bold text-ink">ManaDuitnya</span>
          </router-link>
          <nav class="hidden md:flex items-center gap-1">
            <router-link v-for="link in desktopLinks" :key="link.to" :to="link.to" class="px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2" :class="$route.path === link.to ? 'bg-brand/10 text-brand-dark' : 'text-ink/70 hover:text-ink hover:bg-card'">
              <component :is="link.icon" class="w-4 h-4" />{{ link.label }}
            </router-link>
          </nav>
        </div>
        <div class="flex items-center gap-2.5">
          <button @click="triggerAdd" class="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-xl shadow-sm shadow-brand/20 ios-active-scale transition-colors">
            <Plus class="w-4 h-4" /><span>Catat Transaksi</span>
          </button>
          <div class="hidden sm:block relative" ref="userMenuRef">
            <button @click="showUserMenu = !showUserMenu" class="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-card transition-colors ios-active-scale">
              <div class="w-7 h-7 rounded-xl bg-brand/10 flex items-center justify-center"><span class="text-xs font-bold text-brand-dark">{{ userInitial }}</span></div>
              <div class="text-left"><div class="text-xs font-bold text-ink leading-tight">{{ authStore.user?.name || 'Pengguna' }}</div><div class="text-[10px] text-ink/50">{{ authStore.user?.email || '' }}</div></div>
              <ChevronDown class="w-3.5 h-3.5 text-ink/40 transition-transform" :class="showUserMenu ? 'rotate-180' : ''" />
            </button>
            <div v-if="showUserMenu" class="absolute right-0 mt-1.5 w-44 bg-surface rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
              <router-link to="/profile" @click="showUserMenu = false" class="flex items-center gap-2.5 px-4 py-3 text-sm text-ink hover:bg-card transition-colors"><User class="w-4 h-4 text-ink/50" /> Profil</router-link>
              <router-link to="/categories" @click="showUserMenu = false" class="flex items-center gap-2.5 px-4 py-3 text-sm text-ink hover:bg-card transition-colors"><Tag class="w-4 h-4 text-ink/50" /> Kategori</router-link>
              <div class="border-t border-slate-100" />
              <button @click="handleLogout" class="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors"><LogOut class="w-4 h-4" /> Keluar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-slate-200/80 pb-safe">
    <div class="flex items-stretch h-14">
      <router-link to="/dashboard" class="flex flex-col items-center justify-center flex-1 h-full ios-active-scale" :class="$route.path === '/dashboard' ? 'text-brand-dark font-bold' : 'text-ink/40 font-medium'"><LayoutDashboard class="w-5 h-5 mb-0.5" /><span class="text-[10px]">Ringkasan</span></router-link>
      <router-link to="/transactions" class="flex flex-col items-center justify-center flex-1 h-full ios-active-scale" :class="$route.path === '/transactions' ? 'text-brand-dark font-bold' : 'text-ink/40 font-medium'"><Receipt class="w-5 h-5 mb-0.5" /><span class="text-[10px]">Transaksi</span></router-link>
      <button @click="triggerAdd" class="flex flex-col items-center justify-center flex-1 h-full -mt-4 ios-active-scale group"><div class="w-12 h-12 rounded-full bg-brand hover:bg-brand-dark text-white flex items-center justify-center shadow-lg shadow-brand/30 group-active:scale-95 transition-all"><Plus class="w-6 h-6 stroke-[2.5]" /></div><span class="text-[10px] font-bold text-brand-dark mt-0.5">Tambah</span></button>
      <router-link to="/budgets" class="flex flex-col items-center justify-center flex-1 h-full ios-active-scale" :class="$route.path === '/budgets' ? 'text-brand-dark font-bold' : 'text-ink/40 font-medium'"><WalletCards class="w-5 h-5 mb-0.5" /><span class="text-[10px]">Anggaran</span></router-link>
      <router-link to="/more" class="flex flex-col items-center justify-center flex-1 h-full ios-active-scale" :class="moreActive ? 'text-brand-dark font-bold' : 'text-ink/40 font-medium'"><MoreHorizontal class="w-5 h-5 mb-0.5" /><span class="text-[10px]">Lainnya</span></router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard, Receipt, Plus, WalletCards, MoreHorizontal,
  CreditCard, Tag, User, LogOut, ChevronDown,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['open-add-modal'])
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isNavHidden = ref(false)
const showUserMenu = ref(false)
const userMenuRef = ref(null)
let lastScrollY = 0
const SCROLL_THRESHOLD = 8

const desktopLinks = [
  { to: '/dashboard',    label: 'Ringkasan',        icon: LayoutDashboard },
  { to: '/transactions', label: 'Transaksi',         icon: Receipt },
  { to: '/wallets',      label: 'Dompet & Rekening', icon: CreditCard },
  { to: '/budgets',      label: 'Anggaran',          icon: WalletCards },
  { to: '/categories',   label: 'Kategori',          icon: Tag },
]

const moreActive = computed(() =>
  ['/more', '/wallets', '/categories', '/profile'].includes(route.path)
)

const userInitial = computed(() => {
  const name = authStore.user?.name || ''
  return name.charAt(0).toUpperCase() || 'U'
})

const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logoutApi()
  router.push('/login')
}

const handleClickOutside = (e) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    showUserMenu.value = false
  }
}

const handleScroll = () => {
  if (window.innerWidth >= 768) {
    if (isNavHidden.value) isNavHidden.value = false
    return
  }
  const currentScrollY = window.scrollY || window.pageYOffset
  if (currentScrollY <= 20) {
    isNavHidden.value = false
    lastScrollY = Math.max(0, currentScrollY)
    return
  }
  const delta = currentScrollY - lastScrollY
  if (Math.abs(delta) < SCROLL_THRESHOLD) return
  if (delta > 0 && currentScrollY > 60) {
    isNavHidden.value = true
  } else if (delta < 0) {
    isNavHidden.value = false
  }
  lastScrollY = currentScrollY
}

watch(() => route.fullPath, () => {
  isNavHidden.value = false
  lastScrollY = 0
  showUserMenu.value = false
})

onMounted(() => {
  lastScrollY = window.scrollY || 0
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})

const triggerAdd = () => {
  if (navigator.vibrate) navigator.vibrate(10)
  emit('open-add-modal')
}
</script>
