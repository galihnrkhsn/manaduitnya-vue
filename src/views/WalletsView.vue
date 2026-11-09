<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-ink tracking-tight">Dompet & Rekening</h1>
        <p class="text-xs text-ink/60 mt-1">Kelola sumber dana dan rekening kamu.</p>
      </div>
      <button @click="openAddModal" class="flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-sm shadow-md shadow-brand/20 transition-all ios-active-scale">
        <Plus class="w-4 h-4" />
        Tambah Dompet
      </button>
    </div>

    <SkeletonLoader v-if="loading" type="wallet-card" :count="3" cols="3" />

        <!-- Error -->
    <div v-else-if="error" class="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
      <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
      <span>{{ error }}</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!wallets.length" class="py-16 text-center">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <CreditCard class="w-7 h-7 text-ink/30" />
      </div>
      <p class="text-sm text-ink/40">Belum ada dompet. Tambahkan untuk mulai mencatat.</p>
    </div>

    <!-- Wallets Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(wallet, idx) in wallets"
        :key="wallet.id"
        class="relative overflow-hidden rounded-3xl p-5 text-white shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
        :class="cardGradient(idx)"
        @click="openEditModal(wallet)"
      >
        <!-- Decorative circle -->
        <div class="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div class="absolute right-8 -bottom-10 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <!-- Top row: icon + type badge -->
        <div class="relative z-10 flex items-center justify-between mb-6">
          <div class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <component :is="walletIcon(wallet.type)" class="w-5 h-5 text-white" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/20">
            {{ wallet.type || 'Dompet' }}
          </span>
        </div>

        <!-- Name -->
        <div class="relative z-10 mb-4">
          <h3 class="text-base font-bold truncate">{{ wallet.name }}</h3>
        </div>

        <!-- Balance -->
        <div class="relative z-10 pt-3 border-t border-white/20 flex items-end justify-between">
          <div>
            <p class="text-[11px] text-white/60 mb-0.5">Saldo</p>
            <p class="text-xl font-extrabold tracking-tight">{{ formatCurrency(wallet.balance ?? wallet.initialBalance) }}</p>
          </div>
          <Pencil class="w-3.5 h-3.5 text-white/40 mb-1" />
        </div>
      </div>
    </div>

    <!-- Modal Add / Edit -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" @click="showModal = false" />
      <div class="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden pb-safe sm:pb-0 z-10">
        <div class="sm:hidden w-full pt-3 pb-1 flex justify-center">
          <div class="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>
        <div class="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-base font-bold text-ink">{{ isEditing ? 'Edit Dompet' : 'Tambah Dompet' }}</h3>
          <button @click="showModal = false" class="text-ink/40 hover:text-ink p-1 rounded-full ios-active-scale">
            <X class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="saveWallet" class="p-5 space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Nama Dompet / Bank</label>
            <input v-model="form.name" type="text" required placeholder="cth. BCA, OVO, GoPay" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-ink bg-card focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Saldo Awal (Rp)</label>
            <CurrencyInput v-model="form.initialBalance" required placeholder="0" input-class="font-bold text-base sm:text-lg font-mono" />
          </div>
          <div v-if="formError" class="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
            <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{{ formError }}</span>
          </div>
          <div class="flex items-center justify-between gap-2 pt-1">
            <button v-if="isEditing" type="button" @click="confirmDelete" class="px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ios-active-scale">Hapus</button>
            <div class="flex items-center gap-2 ml-auto">
              <button type="button" @click="showModal = false" class="px-4 py-2.5 text-sm font-semibold text-ink/60 hover:bg-card rounded-xl transition-colors ios-active-scale">Batal</button>
              <button type="submit" :disabled="isSubmitting" class="px-5 py-2.5 text-sm font-bold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-sm shadow-brand/20 transition-all ios-active-scale disabled:opacity-50 flex items-center gap-1.5">
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, CreditCard, X, Loader2, AlertCircle, Pencil, Banknote, Wallet, TrendingUp, Smartphone } from 'lucide-vue-next'
import CurrencyInput from '@/components/CurrencyInput.vue'
import { useFinanceStore } from '@/stores/finance'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const financeStore = useFinanceStore()

const loading = ref(false)
const error = ref(null)
const formError = ref(null)
const isSubmitting = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const form = reactive({ id: null, name: '', initialBalance: 0 })

const wallets = computed(() => financeStore.wallets)

const gradients = [
  'bg-gradient-to-br from-teal-600 to-emerald-700',
  'bg-gradient-to-br from-slate-600 to-slate-800',
  'bg-gradient-to-br from-sky-600 to-blue-700',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-violet-600 to-purple-700',
  'bg-gradient-to-br from-rose-500 to-pink-600',
]

const cardGradient = (idx) => gradients[idx % gradients.length]

const walletIcon = (type) => {
  const t = String(type || '').toLowerCase()
  if (t.includes('bank') || t.includes('rekening')) return Banknote
  if (t.includes('cash') || t.includes('tunai')) return Wallet
  if (t.includes('invest')) return TrendingUp
  if (t.includes('wallet') || t.includes('e-wallet') || t.includes('digital')) return Smartphone
  return CreditCard
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val || 0))
}

onMounted(async () => {
  loading.value = true
  error.value = null
  const result = await financeStore.fetchWallets()
  if (!result.success) error.value = result.error
  loading.value = false
})

const openAddModal = () => {
  isEditing.value = false
  form.id = null
  form.name = ''
  form.initialBalance = 0
  formError.value = null
  showModal.value = true
}

const openEditModal = (wallet) => {
  isEditing.value = true
  form.id = wallet.id
  form.name = wallet.name
  form.initialBalance = wallet.balance ?? wallet.initialBalance ?? 0
  formError.value = null
  showModal.value = true
}

const saveWallet = async () => {
  isSubmitting.value = true
  formError.value = null
  const payload = { name: form.name, initialBalance: form.initialBalance }
  const result = isEditing.value
    ? await financeStore.updateWallet(form.id, payload)
    : await financeStore.addWallet(payload)
  isSubmitting.value = false
  if (result.success) {
    showModal.value = false
  } else {
    formError.value = result.error
  }
}

const confirmDelete = async () => {
  if (!window.confirm(`Hapus dompet "${form.name}"?`)) return
  isSubmitting.value = true
  formError.value = null
  const result = await financeStore.deleteWallet(form.id)
  isSubmitting.value = false
  if (result.success) {
    showModal.value = false
  } else {
    formError.value = result.error
  }
}
</script>

