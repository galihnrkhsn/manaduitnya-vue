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
          <button class="py-2.5 text-sm font-bold rounded-xl bg-surface shadow-sm text-ink ios-active-scale">Daftar</button>
          <button @click="goToLogin" class="py-2.5 text-sm font-semibold rounded-xl transition-all text-ink/50 ios-active-scale">Masuk</button>
        </div>
        <form @submit.prevent="handleRegister" class="space-y-3" novalidate>
          <transition name="fade">
            <div v-if="successMsg" class="flex items-start gap-2.5 p-3 bg-brand/10 border border-brand/20 text-brand-dark rounded-2xl text-xs">
              <CheckCircle class="w-4 h-4 shrink-0 mt-0.5" /><span>{{ successMsg }}</span>
            </div>
          </transition>
          <transition name="fade">
            <div v-if="authStore.error" class="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" /><span>{{ authStore.error }}</span>
            </div>
          </transition>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Nama Lengkap</label>
            <div class="relative"><User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" /><input v-model="form.name" type="text" autocomplete="name" placeholder="Nama kamu" required :class="inputClass(errors.name)" @input="errors.name = &quot;&quot;" /></div>
            <p v-if="errors.name" class="text-xs text-rose-500 pl-1">{{ errors.name }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Email</label>
            <div class="relative"><Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" /><input v-model="form.email" type="email" autocomplete="email" placeholder="kamu@email.com" required :class="inputClass(errors.email)" @input="errors.email = &quot;&quot;" /></div>
            <p v-if="errors.email" class="text-xs text-rose-500 pl-1">{{ errors.email }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Password</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              <input v-model="form.password" :type="showPassword ? &apos;text&apos; : &apos;password&apos;" autocomplete="new-password" placeholder="Min. 8 karakter" required :class="inputClass(errors.password)" @input="errors.password = &quot;&quot;" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"><Eye v-if="!showPassword" class="w-4 h-4" /><EyeOff v-else class="w-4 h-4" /></button>
            </div>
            <div v-if="form.password" class="flex gap-1 mt-1.5">
              <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-all" :class="i <= passwordStrength ? strengthColor : &apos;bg-slate-200&apos;" />
            </div>
            <p v-if="errors.password" class="text-xs text-rose-500 pl-1">{{ errors.password }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Konfirmasi Password</label>
            <div class="relative"><Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" /><input v-model="form.confirmPassword" :type="showPassword ? &apos;text&apos; : &apos;password&apos;" autocomplete="new-password" placeholder="Ulangi password" required :class="inputClass(errors.confirmPassword)" @input="errors.confirmPassword = &quot;&quot;" /></div>
            <p v-if="errors.confirmPassword" class="text-xs text-rose-500 pl-1">{{ errors.confirmPassword }}</p>
          </div>
          <button type="submit" :disabled="authStore.loading" class="w-full py-3 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand/20 transition-all ios-active-scale flex items-center justify-center gap-2">
            <Loader2 v-if="authStore.loading" class="w-4 h-4 animate-spin" /><span>{{ authStore.loading ? &apos;Memproses...&apos; : &apos;Daftar Sekarang&apos; }}</span>
          </button>
          <p class="text-center text-xs text-ink/40 pt-1">Sudah punya akun? <button type="button" @click="goToLogin" class="text-brand-dark font-semibold hover:underline">Masuk</button></p>
        </form>
      </div>
    </div>

    <!-- DESKTOP: split layout -->
    <div class="hidden sm:grid grid-cols-2 min-h-screen">
      <div class="relative bg-brand overflow-hidden flex flex-col items-center justify-center p-12">
        <img src="/splash/apple-splash-1125-2436.png" alt="" class="absolute inset-0 w-full h-full object-cover object-center opacity-30" aria-hidden="true" />
        <div class="relative z-10 text-center">
          <img src="/pwa-192x192.png" alt="ManaDuitnya" class="w-20 h-20 rounded-3xl mx-auto mb-6 shadow-2xl" />
          <h1 class="text-3xl font-extrabold text-white tracking-tight">ManaDuitnya</h1>
          <p class="text-sm text-white/70 mt-2 max-w-xs mx-auto leading-relaxed">Catat pemasukan dan pengeluaran dengan mudah. Pantau anggaran bulanan dalam genggaman.</p>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center p-10 bg-card overflow-y-auto">
        <div class="w-full max-w-sm">
          <div class="mb-6">
            <h2 class="text-2xl font-extrabold text-ink tracking-tight">Buat akun baru</h2>
            <p class="text-sm text-ink/50 mt-1">Gratis selamanya</p>
          </div>
          <div class="grid grid-cols-2 p-1.5 bg-surface rounded-2xl mb-6 border border-slate-200">
            <button class="py-2.5 text-sm font-bold rounded-xl bg-brand text-white shadow-sm ios-active-scale">Daftar</button>
            <button @click="goToLogin" class="py-2.5 text-sm font-semibold rounded-xl transition-all text-ink/50 ios-active-scale">Masuk</button>
          </div>
          <form @submit.prevent="handleRegister" class="space-y-3.5" novalidate>
            <transition name="fade">
              <div v-if="successMsg" class="flex items-start gap-2.5 p-3 bg-brand/10 border border-brand/20 text-brand-dark rounded-2xl text-xs">
                <CheckCircle class="w-4 h-4 shrink-0 mt-0.5" /><span>{{ successMsg }}</span>
              </div>
            </transition>
            <transition name="fade">
              <div v-if="authStore.error" class="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
                <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" /><span>{{ authStore.error }}</span>
              </div>
            </transition>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-ink/70">Nama Lengkap</label>
              <div class="relative"><User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" /><input v-model="form.name" type="text" autocomplete="name" placeholder="Nama kamu" required :class="inputClass(errors.name)" @input="errors.name = ''" /></div>
              <p v-if="errors.name" class="text-xs text-rose-500 pl-1">{{ errors.name }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-ink/70">Email</label>
              <div class="relative"><Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" /><input v-model="form.email" type="email" autocomplete="email" placeholder="kamu@email.com" required :class="inputClass(errors.email)" @input="errors.email = ''" /></div>
              <p v-if="errors.email" class="text-xs text-rose-500 pl-1">{{ errors.email }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-ink/70">Password</label>
              <div class="relative">
                <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Min. 8 karakter" required :class="inputClass(errors.password)" @input="errors.password = ''" />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"><Eye v-if="!showPassword" class="w-4 h-4" /><EyeOff v-else class="w-4 h-4" /></button>
              </div>
              <div v-if="form.password" class="flex gap-1 mt-1.5">
                <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-all" :class="i <= passwordStrength ? strengthColor : 'bg-slate-200'" />
              </div>
              <p v-if="errors.password" class="text-xs text-rose-500 pl-1">{{ errors.password }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-ink/70">Konfirmasi Password</label>
              <div class="relative"><Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" /><input v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Ulangi password" required :class="inputClass(errors.confirmPassword)" @input="errors.confirmPassword = ''" /></div>
              <p v-if="errors.confirmPassword" class="text-xs text-rose-500 pl-1">{{ errors.confirmPassword }}</p>
            </div>
            <button type="submit" :disabled="authStore.loading" class="w-full py-3 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand/20 transition-all ios-active-scale flex items-center justify-center gap-2">
              <Loader2 v-if="authStore.loading" class="w-4 h-4 animate-spin" /><span>{{ authStore.loading ? 'Memproses...' : 'Daftar Sekarang' }}</span>
            </button>
            <p class="text-center text-xs text-ink/40 pt-1">Sudah punya akun? <button type="button" @click="goToLogin" class="text-brand-dark font-semibold hover:underline">Masuk</button></p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'

const router    = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const successMsg   = ref('')

const form   = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const errors = reactive({ name: '', email: '', password: '', confirmPassword: '' })

onUnmounted(() => authStore.clearError())

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthColor = computed(() => {
  if (passwordStrength.value <= 1) return 'bg-rose-400'
  if (passwordStrength.value === 2) return 'bg-amber-400'
  if (passwordStrength.value === 3) return 'bg-brand'
  return 'bg-brand-dark'
})

const inputClass = (hasError) => [
  'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-ink bg-card focus:bg-surface transition-colors focus:outline-none focus:ring-2',
  hasError ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-brand',
]

const validate = () => {
  let valid = true
  if (!form.name.trim()) { errors.name = 'Nama wajib diisi.'; valid = false }
  if (!form.email) { errors.email = 'Email wajib diisi.'; valid = false }
  else if (!/\S+@\S+\.\S+/.test(form.email)) { errors.email = 'Format email tidak valid.'; valid = false }
  if (!form.password) { errors.password = 'Password wajib diisi.'; valid = false }
  else if (form.password.length < 8) { errors.password = 'Password minimal 8 karakter.'; valid = false }
  if (!form.confirmPassword) { errors.confirmPassword = 'Konfirmasi password wajib diisi.'; valid = false }
  else if (form.password !== form.confirmPassword) { errors.confirmPassword = 'Password tidak cocok.'; valid = false }
  return valid
}

const handleRegister = async () => {
  authStore.clearError()
  successMsg.value = ''
  if (!validate()) return
  const result = await authStore.register({
    name: form.name.trim(),
    email: form.email,
    password: form.password,
  })
  if (result.success) {
    await useFinanceStore().loadMasterData()
    if (result.autoLogin) {
      router.push('/dashboard')
    } else {
      successMsg.value = 'Akun berhasil dibuat! Silakan masuk.'
      setTimeout(() => router.push('/login'), 2000)
    }
  }
}

const goToLogin = () => router.push('/login')
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
