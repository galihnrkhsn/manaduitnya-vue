<template>
  <!-- Top Navigation Bar (with iOS Safe Area Top padding) -->
  <header class="bg-surface/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 pt-safe">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14 sm:h-16">
        <!-- Logo & Brand -->
        <div class="flex items-center gap-6">
          <router-link to="/" class="flex items-center gap-2.5 ios-active-scale">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand flex items-center justify-center text-white shadow-md shadow-brand/25">
              <Wallet class="w-5 h-5" />
            </div>
            <div>
              <span class="text-lg sm:text-xl font-bold text-ink">ManaDuitnya</span>
            </div>
          </router-link>

          <!-- Desktop Nav Links -->
          <nav class="hidden md:flex items-center gap-1">
            <router-link
              to="/dashboard"
              class="px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              :class="$route.path === '/dashboard' ? 'bg-brand/10 text-brand-dark' : 'text-ink/70 hover:text-ink hover:bg-card'"
            >
              <LayoutDashboard class="w-4 h-4" />
              Ringkasan
            </router-link>
            <router-link
              to="/transactions"
              class="px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              :class="$route.path === '/transactions' ? 'bg-brand/10 text-brand-dark' : 'text-ink/70 hover:text-ink hover:bg-card'"
            >
              <Receipt class="w-4 h-4" />
              Transaksi
            </router-link>
            <router-link
              to="/wallets"
              class="px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              :class="$route.path === '/wallets' ? 'bg-brand/10 text-brand-dark' : 'text-ink/70 hover:text-ink hover:bg-card'"
            >
              <CreditCard class="w-4 h-4" />
              Dompet & Rekening
            </router-link>
          </nav>
        </div>

        <!-- Right Side: Quick Add & User Profile -->
        <div class="flex items-center gap-2.5">
          <button
            @click="triggerAdd"
            class="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-xl shadow-sm shadow-brand/20 ios-active-scale transition-colors"
          >
            <Plus class="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>

          <!-- User Menu / Status -->
          <div v-if="authStore.isAuthenticated" class="flex items-center gap-2 pl-2 sm:border-l sm:border-slate-200">
            <div class="hidden sm:block text-right">
              <div class="text-xs font-bold text-ink">{{ authStore.user?.name || 'Pengguna' }}</div>
              <div class="text-[10px] text-ink/60">{{ authStore.user?.email || 'Aktif' }}</div>
            </div>
            <button
              @click="authStore.logout"
              title="Logout"
              class="p-2 text-ink/60 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ios-active-scale"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
          <div v-else class="flex items-center gap-2">
            <router-link
              to="/login"
              class="px-3 py-1.5 text-xs font-semibold text-ink/80 hover:bg-card rounded-xl transition-colors"
            >
              Masuk
            </router-link>
            <button
              @click="authStore.demoLogin('John Doe')"
              class="px-2.5 py-1 text-[11px] font-bold text-brand-dark bg-brand/10 border border-brand/20 rounded-xl transition-colors ios-active-scale"
            >
              Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- iOS Native Bottom Tab Bar (Fixed bottom with Safe Area Inset) -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-slate-200/80 pb-safe">
    <div class="flex items-center justify-around h-14">
      <router-link
        to="/dashboard"
        class="flex flex-col items-center justify-center flex-1 h-full ios-active-scale"
        :class="$route.path === '/dashboard' ? 'text-brand-dark font-bold' : 'text-ink/40 font-medium'"
      >
        <LayoutDashboard class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">Ringkasan</span>
      </router-link>

      <button
        @click="triggerAdd"
        class="flex flex-col items-center justify-center flex-1 h-full -mt-4 ios-active-scale group"
      >
        <div class="w-12 h-12 rounded-full bg-brand hover:bg-brand-dark text-white flex items-center justify-center shadow-lg shadow-brand/30 group-active:scale-95 transition-all">
          <Plus class="w-6 h-6 stroke-[2.5]" />
        </div>
        <span class="text-[10px] font-bold text-brand-dark mt-0.5">Tambah</span>
      </button>

      <router-link
        to="/transactions"
        class="flex flex-col items-center justify-center flex-1 h-full ios-active-scale"
        :class="$route.path === '/transactions' ? 'text-brand-dark font-bold' : 'text-ink/40 font-medium'"
      >
        <Receipt class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">Transaksi</span>
      </router-link>

      <router-link
        to="/wallets"
        class="flex flex-col items-center justify-center flex-1 h-full ios-active-scale"
        :class="$route.path === '/wallets' ? 'text-brand-dark font-bold' : 'text-ink/40 font-medium'"
      >
        <CreditCard class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">Dompet</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { Wallet, LayoutDashboard, Receipt, CreditCard, Plus, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['open-add-modal'])
const authStore = useAuthStore()

const triggerAdd = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }
  emit('open-add-modal')
}
</script>
