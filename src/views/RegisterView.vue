<template>
  <div class="min-h-screen bg-card flex flex-col items-center justify-center p-4">

    <!-- Brand Mark -->
    <div class="mb-8 flex flex-col items-center gap-3">
      <div class="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/25">
        <Wallet class="w-7 h-7 text-white" />
      </div>
      <div class="text-center">
        <h1 class="text-xl font-extrabold text-ink tracking-tight">ManaDuitnya</h1>
        <p class="text-xs text-ink/50 mt-0.5">Kelola keuanganmu dengan mudah</p>
      </div>
    </div>

    <!-- Card -->
    <div class="w-full max-w-sm bg-surface rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">

      <!-- Tab switcher -->
      <div class="grid grid-cols-2 p-1.5 bg-card m-4 rounded-2xl">
        <button
          class="py-2.5 text-sm font-bold rounded-xl bg-surface shadow-sm text-ink ios-active-scale"
        >
          Daftar
        </button>
        <button
          @click="goToLogin"
          class="py-2.5 text-sm font-semibold rounded-xl transition-all text-ink/50 ios-active-scale"
        >
          Masuk
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="px-5 pb-6 space-y-3.5" novalidate>

        <!-- Success Banner -->
        <transition name="fade">
          <div
            v-if="successMsg"
            class="flex items-start gap-2.5 p-3 bg-brand/10 border border-brand/20 text-brand-dark rounded-2xl text-xs"
          >
            <CheckCircle class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{{ successMsg }}</span>
          </div>
        </transition>

        <!-- Error Banner -->
        <transition name="fade">
          <div
            v-if="authStore.error"
            class="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs"
          >
            <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{{ authStore.error }}</span>
          </div>
        </transition>

        <!-- Full Name -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-ink/70">Nama Lengkap</label>
          <div class="relative">
            <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              v-model="form.name"
              type="text"
              autocomplete="name"
              placeholder="John Doe"
              required
              :class="inputClass(errors.name)"
              @input="errors.name = ''"
            />
          </div>
          <p v-if="errors.name" class="text-xs text-rose-500 pl-1">{{ errors.name }}</p>
        </div>

        <!-- Email -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-ink/70">Email</label>
          <div class="relative">
            <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="kamu@email.com"
              required
              :class="inputClass(errors.email)"
              @input="errors.email = ''"
            />
          </div>
          <p v-if="errors.email" class="text-xs text-rose-500 pl-1">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-ink/70">Password</label>
          <div class="relative">
            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Min. 8 karakter"
              required
              :class="inputClass(errors.password)"
              @input="errors.password = ''"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
            >
              <Eye v-if="!showPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
          <!-- Password strength bar -->
          <div class="flex gap-1 pt-1" v-if="form.password">
            <div
              v-for="i in 4"
              :key="i"
              class="h-1 flex-1 rounded-full transition-all duration-300"
              :class="passwordStrength >= i ? strengthColor : 'bg-slate-200'"
            />
          </div>
          <p v-if="errors.password" class="text-xs text-rose-500 pl-1">{{ errors.password }}</p>
        </div>

        <!-- Confirm Password -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-ink/70">Konfirmasi Password</label>
          <div class="relative">
            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Ulangi password"
              required
              :class="inputClass(errors.confirmPassword)"
              @input="errors.confirmPassword = ''"
            />
          </div>
          <p v-if="errors.confirmPassword" class="text-xs text-rose-500 pl-1">{{ errors.confirmPassword }}</p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full mt-1 py-3 bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-md shadow-brand/20 transition-all ios-active-scale flex items-center justify-center gap-2"
        >
          <Loader2 v-if="authStore.loading" class="w-4 h-4 animate-spin" />
          <span>{{ authStore.loading ? 'Mendaftarkan...' : 'Buat Akun' }}</span>
        </button>

      </form>
    </div>

    <!-- Footer note -->
    <p class="mt-6 text-center text-xs text-ink/40">
      Sudah punya akun?
      <button @click="goToLogin" class="text-brand-dark font-semibold hover:underline ml-0.5">Masuk di sini</button>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Wallet, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle, Loader2,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'

const router    = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const successMsg   = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

onUnmounted(() => authStore.clearError())

// ── Password strength ─────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────
const inputClass = (hasError) => [
  'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-ink bg-card focus:bg-surface transition-colors focus:outline-none focus:ring-2',
  hasError
    ? 'border-rose-300 focus:ring-rose-400'
    : 'border-slate-200 focus:ring-brand',
]

const validate = () => {
  let valid = true
  if (!form.name.trim()) {
    errors.name = 'Nama wajib diisi.'
    valid = false
  }
  if (!form.email) {
    errors.email = 'Email wajib diisi.'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Format email tidak valid.'
    valid = false
  }
  if (!form.password) {
    errors.password = 'Password wajib diisi.'
    valid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password minimal 8 karakter.'
    valid = false
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password wajib diisi.'
    valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Password tidak cocok.'
    valid = false
  }
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
    // confirmPassword: form.confirmPassword, // uncomment jika BE butuh ini
  })

  if (result.success) {
    await useFinanceStore().loadMasterData()
    if (result.autoLogin) {
      // BE langsung kasih token → langsung masuk ke dashboard
      router.push('/dashboard')
    } else {
      // BE hanya 201 Created → kasih tau user untuk login manual
      successMsg.value = 'Akun berhasil dibuat! Silakan masuk dengan email dan password Anda.'
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

