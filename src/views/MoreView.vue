<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-2xl font-extrabold text-ink tracking-tight">Lainnya</h1>
      <p class="text-xs text-ink/60 mt-1">Kelola akun, kategori, dan dompet kamu.</p>
    </div>

    <!-- Profile Card -->
    <div class="bg-surface rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4">
      <div class="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
        <span class="text-lg font-bold text-brand-dark">{{ userInitial }}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-ink truncate">{{ authStore.user?.name || 'Pengguna' }}</p>
        <p class="text-xs text-ink/50 truncate">{{ authStore.user?.email || '' }}</p>
      </div>
      <router-link
        to="/profile"
        class="text-xs font-semibold text-brand-dark hover:underline ios-active-scale shrink-0"
      >
        Lihat Profil
      </router-link>
    </div>

    <!-- Menu List -->
    <div class="bg-surface rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
      <router-link
        to="/wallets"
        class="flex items-center gap-3.5 px-4 py-3.5 hover:bg-card transition-colors ios-active-scale"
      >
        <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <CreditCard class="w-4.5 h-4.5 text-indigo-600" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-ink">Dompet & Rekening</p>
          <p class="text-xs text-ink/50">Kelola sumber dana kamu</p>
        </div>
        <ChevronRight class="w-4 h-4 text-ink/30" />
      </router-link>

      <router-link
        to="/categories"
        class="flex items-center gap-3.5 px-4 py-3.5 hover:bg-card transition-colors ios-active-scale"
      >
        <div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <Tag class="w-4.5 h-4.5 text-amber-600" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-ink">Kategori</p>
          <p class="text-xs text-ink/50">Atur label transaksi kamu</p>
        </div>
        <ChevronRight class="w-4 h-4 text-ink/30" />
      </router-link>

      <router-link
        to="/profile"
        class="flex items-center gap-3.5 px-4 py-3.5 hover:bg-card transition-colors ios-active-scale"
      >
        <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <User class="w-4.5 h-4.5 text-slate-600" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-ink">Profil</p>
          <p class="text-xs text-ink/50">Informasi akun kamu</p>
        </div>
        <ChevronRight class="w-4 h-4 text-ink/30" />
      </router-link>
    </div>

    <!-- Logout -->
    <button
      @click="handleLogout"
      :disabled="isLoggingOut"
      class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-50 transition-colors ios-active-scale disabled:opacity-50"
    >
      <LogOut class="w-4 h-4" />
      <span>{{ isLoggingOut ? 'Keluar...' : 'Keluar' }}</span>
    </button>

    <p class="text-center text-[11px] text-ink/30">ManaDuitnya</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, Tag, User, ChevronRight, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const isLoggingOut = ref(false)
const userInitial = computed(() => {
  const name = authStore.user?.name || ''
  return name.charAt(0).toUpperCase() || 'U'
})

const handleLogout = async () => {
  isLoggingOut.value = true
  await authStore.logout()
  router.push('/login')
}
</script>
