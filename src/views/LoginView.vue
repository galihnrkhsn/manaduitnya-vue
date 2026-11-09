<template>
  <div class="min-h-screen bg-card">

    <!-- MOBILE -->
    <div class="flex flex-col min-h-screen sm:hidden">
      <div class="relative flex-1 bg-brand overflow-hidden flex flex-col items-center justify-end">
        <img src="/splash/apple-splash-1125-2436.png" alt="" class="absolute inset-0 w-full h-full object-cover object-center" aria-hidden="true" />
        <div class="absolute inset-0 bg-brand/20" />
        <div class="relative z-10 text-center px-6 pb-10">
          <img src="/pwa-192x192.png" alt="ManaDuitnya" class="w-16 h-16 rounded-2xl mx-auto mb-3 shadow-xl" />
          <h1 class="text-2xl font-extrabold text-white tracking-tight">ManaDuitnya</h1>
          <p class="text-sm text-white/70 mt-1">Kelola keuanganmu dengan mudah</p>
        </div>
      </div>
      <div class="relative bg-surface rounded-t-3xl shadow-2xl px-5 pt-5 -mt-6 z-10" style="padding-bottom: max(1.5rem, env(safe-area-inset-bottom))">
        <div class="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-5" />
        <div class="grid grid-cols-2 p-1.5 bg-card rounded-2xl mb-5">
          <button @click="goToRegister" class="py-2.5 text-sm font-semibold rounded-xl transition-all text-ink/50 ios-active-scale">Daftar</button>
          <button class="py-2.5 text-sm font-bold rounded-xl bg-surface shadow-sm text-ink ios-active-scale">Masuk</button>
        </div>
        <form @submit.prevent="handleLogin" class="space-y-3.5" novalidate>
          <transition name="fade">
            <div v-if="authStore.error" class="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" /><span>{{ authStore.error }}</span>
            </div>
          </transition>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Email</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              <input v-model="form.email" type="email" autocomplete="email" placeholder="kamu@email.com" required :class="inputClass(errors.email)" @input="errors.email = &quot;&quot;" />
            </div>
            <p v-if="errors.email" class="text-xs text-rose-500 pl-1">{{ errors.email }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Password</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              <input v-model="form.password" :type="showPassword ? &apos;text&apos; : &apos;password&apos;" autocomplete="current-password" placeholder="&#xB7;&#xB7;&#xB7;&#xB7;&#xB7;&#xB7;&#xB7;&#xB7;" required :class="inputClass(errors.password)" @input="errors.password = &quot;&quot;" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors">
                <Eye v-if="!showPassword" class="w-4 h-4" /><EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-rose-500 pl-1">{{ errors.password }}</p>
          </div>
          <button type="submit" :disabled="authStore.loading" class="w-full mt-1 py-3 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand/20 transition-all ios-active-scale flex items-center justify-center gap-2">
            <Loader2 v-if="authStore.loading" class="w-4 h-4 animate-spin" />
            <span>{{ authStore.loading ? &apos;Memproses...&apos; : &apos;Masuk&apos; }}</span>
          </button>
          <p class="text-center text-xs text-ink/40 pt-1">Belum punya akun? <button type="button" @click="goToRegister" class="text-brand-dark font-semibold hover:underline">Daftar gratis</button></p>
        </form>
      </div>
    </div>

    <!-- DESKTOP -->
    <div class="hidden sm:flex flex-col items-center justify-center min-h-screen p-4">
      <div class="mb-8 flex flex-col items-center gap-3">
        <div class="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/25">
          <img src="/pwa-192x192.png" alt="ManaDuitnya" class="w-10 h-10 rounded-xl" />
        </div>
        <div class="text-center">
          <h1 class="text-xl font-extrabold text-ink tracking-tight">ManaDuitnya</h1>
          <p class="text-xs text-ink/50 mt-0.5">Kelola keuanganmu dengan mudah</p>
        </div>
      </div>
      <div class="w-full max-w-sm bg-surface rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        <div class="grid grid-cols-2 p-1.5 bg-card m-4 rounded-2xl">
          <button @click="goToRegister" class="py-2.5 text-sm font-semibold rounded-xl transition-all text-ink/50 ios-active-scale">Daftar</button>
          <button class="py-2.5 text-sm font-bold rounded-xl bg-surface shadow-sm text-ink ios-active-scale">Masuk</button>
        </div>
        <form @submit.prevent="handleLogin" class="px-5 pb-6 space-y-3.5" novalidate>
          <transition name="fade">
            <div v-if="authStore.error" class="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" /><span>{{ authStore.error }}</span>
            </div>
          </transition>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Email</label>
            <div class="relative"><Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" /><input v-model="form.email" type="email" autocomplete="email" placeholder="kamu@email.com" required :class="inputClass(errors.email)" @input="errors.email = &quot;&quot;" /></div>
            <p v-if="errors.email" class="text-xs text-rose-500 pl-1">{{ errors.email }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Password</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              <input v-model="form.password" :type="showPassword ? &apos;text&apos; : &apos;password&apos;" autocomplete="current-password" placeholder="&#xB7;&#xB7;&#xB7;&#xB7;&#xB7;&#xB7;&#xB7;&#xB7;" required :class="inputClass(errors.password)" @input="errors.password = &quot;&quot;" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"><Eye v-if="!showPassword" class="w-4 h-4" /><EyeOff v-else class="w-4 h-4" /></button>
            </div>
            <p v-if="errors.password" class="text-xs text-rose-500 pl-1">{{ errors.password }}</p>
          </div>
          <button type="submit" :disabled="authStore.loading" class="w-full mt-1 py-3 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand/20 transition-all ios-active-scale flex items-center justify-center gap-2">
            <Loader2 v-if="authStore.loading" class="w-4 h-4 animate-spin" /><span>{{ authStore.loading ? 'Memproses...' : 'Masuk' }}</span>
          </button>
        </form>
      </div>
      <p class="mt-6 text-center text-xs text-ink/40">Belum punya akun? <button @click="goToRegister" class="text-brand-dark font-semibold hover:underline">Daftar gratis</button></p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const showPassword = ref(false)
const form   = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

onUnmounted(() => authStore.clearError())

const inputClass = (hasError) => [
  'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-ink bg-card focus:bg-surface transition-colors focus:outline-none focus:ring-2',
  hasError ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-brand',
]

const validate = () => {
  let valid = true
  if (!form.email) { errors.email = 'Email wajib diisi.'; valid = false }
  else if (!/\S+@\S+\.\S+/.test(form.email)) { errors.email = 'Format email tidak valid.'; valid = false }
  if (!form.password) { errors.password = 'Password wajib diisi.'; valid = false }
  return valid
}

const handleLogin = async () => {
  authStore.clearError()
  if (!validate()) return
  const result = await authStore.login({ email: form.email, password: form.password })
  if (result.success) {
    await useFinanceStore().loadMasterData()
    router.push(route.query.redirect || '/dashboard')
  }
}

const goToRegister = () => router.push('/register')
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>