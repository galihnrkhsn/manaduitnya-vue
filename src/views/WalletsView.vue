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
        class="w-full h-40 sm:h-44 rounded-3xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer bg-gradient-to-br"
        :class="cardGradient(idx)"
        @click="openEditModal(wallet)"
      >
        <!-- Watermark decoration -->
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <!-- Card Top: Name & Chip -->
        <div class="flex items-start justify-between relative z-10">
          <div>
            <p class="text-[10px] text-white/70 uppercase tracking-widest font-semibold">
              {{ wallet.type || 'Akun' }}
            </p>
            <h3 class="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-xs">
              {{ wallet.name }}
            </h3>
          </div>
          <!-- EMV Chip & NFC -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-6 rounded-md bg-amber-300/30 border border-amber-300/60 flex items-center justify-center p-1">
              <div class="w-full h-full border border-amber-200/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-80">
                <div class="border-b border-r border-amber-200/40" />
                <div class="border-b border-amber-200/40" />
                <div class="border-r border-amber-200/40" />
                <div />
              </div>
            </div>
            <Wifi class="w-4 h-4 text-white/70 rotate-90" />
          </div>
        </div>

        <!-- Card Bottom: Balance -->
        <div class="relative z-10 pt-2 border-t border-white/15 flex items-end justify-between">
          <div>
            <p class="text-[9px] sm:text-[10px] text-white/70 uppercase tracking-wider font-medium">Saldo Tersedia</p>
            <p class="text-base sm:text-lg font-bold font-mono tracking-tight text-white">
              {{ formatCurrency(wallet.balance ?? wallet.initialBalance) }}
            </p>
          </div>
          <CreditCard class="w-4 h-4 text-white/60 mb-1" />
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
import { Plus, CreditCard, X, Loader2, AlertCircle, Wifi } from 'lucide-vue-next'
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

