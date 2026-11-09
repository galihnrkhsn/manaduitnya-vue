<template>
  <div class="space-y-5">
    <div class="flex items-center gap-3">
      <button @click="router.back()" class="p-2 rounded-xl hover:bg-card text-ink/60 ios-active-scale">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <h1 class="text-2xl font-extrabold text-ink tracking-tight">Profil</h1>
    </div>

    <!-- Avatar & Name -->
    <div class="bg-surface rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center gap-3 text-center">
      <div class="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
        <span class="text-2xl font-bold text-brand-dark">{{ userInitial }}</span>
      </div>
      <div>
        <p class="text-base font-bold text-ink">{{ profile?.name || authStore.user?.name || '-' }}</p>
        <p class="text-xs text-ink/50 mt-0.5">{{ profile?.email || authStore.user?.email || '-' }}</p>
      </div>
      <div v-if="loading" class="text-xs text-ink/40">Memuat profil...</div>
    </div>

    <!-- Info Detail -->
    <div class="bg-surface rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
      <div class="flex items-center justify-between px-4 py-3.5">
        <span class="text-xs font-semibold text-ink/50">Nama</span>
        <span class="text-sm font-semibold text-ink">{{ profile?.name || authStore.user?.name || '-' }}</span>
      </div>
      <div class="flex items-center justify-between px-4 py-3.5">
        <span class="text-xs font-semibold text-ink/50">Email</span>
        <span class="text-sm text-ink">{{ profile?.email || authStore.user?.email || '-' }}</span>
      </div>
      <div v-if="profile?.createdAt" class="flex items-center justify-between px-4 py-3.5">
        <span class="text-xs font-semibold text-ink/50">Bergabung</span>
        <span class="text-sm text-ink">{{ formatDate(profile.createdAt) }}</span>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
      <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
      <span>{{ error }}</span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, LogOut, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const profile = ref(null)
const loading = ref(false)
const error = ref(null)
const isLoggingOut = ref(false)

const userInitial = computed(() => {
  const name = profile.value?.name || authStore.user?.name || ''
  return name.charAt(0).toUpperCase() || 'U'
})

const formatDate = (val) => {
  if (!val) return '-'
  return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(async () => {
  loading.value = true
  error.value = null
  const result = await authStore.fetchMe()
  if (result.success) {
    profile.value = result.data
  } else {
    error.value = result.error
  }
  loading.value = false
})

const handleLogout = async () => {
  isLoggingOut.value = true
  await authStore.logoutApi()
  router.push('/login')
}
</script>
