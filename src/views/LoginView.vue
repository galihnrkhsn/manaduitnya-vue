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

      <!-- Tab switcher Login / Register -->
      <div class="grid grid-cols-2 p-1.5 bg-card m-4 rounded-2xl">
        <button
          @click="goToRegister"
          class="py-2.5 text-sm font-semibold rounded-xl transition-all text-ink/50 ios-active-scale"
        >
          Daftar
        </button>
        <button
          class="py-2.5 text-sm font-bold rounded-xl bg-surface shadow-sm text-ink ios-active-scale"
        >
          Masuk
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="px-5 pb-6 space-y-3.5" novalidate>

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
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-ink/70">Password</label>
            <!-- <a href="#" class="text-xs text-brand-dark font-semibold hover:underline">Lupa password?</a> -->
          </div>
          <div class="relative">
            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
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
          <p v-if="errors.password" class="text-xs text-rose-500 pl-1">{{ errors.password }}</p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full mt-1 py-3 bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-md shadow-brand/20 transition-all ios-active-scale flex items-center justify-center gap-2"
        >
          <Loader2 v-if="authStore.loading" class="w-4 h-4 animate-spin" />
          <span>{{ authStore.loading ? 'Memproses...' : 'Masuk' }}</span>
        </button>
      </form>
    </div>

    <!-- Footer note -->
    <p class="mt-6 text-center text-xs text-ink/40">
      Belum punya akun?
      <button @click="goToRegister" class="text-brand-dark font-semibold hover:underline ml-0.5">Daftar gratis</button>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Wallet, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router  = useRouter()
const route   = useRoute()
const authStore = useAuthStore()

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

// Bersihkan error store saat halaman ini ditinggal
onUnmounted(() => authStore.clearError())

const inputClass = (hasError) => [
  'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-ink bg-card focus:bg-surface transition-colors focus:outline-none focus:ring-2',
  hasError
    ? 'border-rose-300 focus:ring-rose-400'
    : 'border-slate-200 focus:ring-brand',
]

const validate = () => {
  let valid = true
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
  }
  return valid
}

const handleLogin = async () => {
  authStore.clearError()
  if (!validate()) return

  const result = await authStore.login({ email: form.email, password: form.password })
  if (result.success) {
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  }
}

const goToRegister = () => router.push('/register')
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
