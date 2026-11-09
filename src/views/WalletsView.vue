<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-ink">Dompet & Rekening</h1>
        <p class="text-xs text-ink/60 mt-1">Kelola seluruh sumber dana, rekening bank, dan dompet digital Anda.</p>
      </div>

      <button
        @click="showAddWalletModal = true"
        class="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-sm shadow-md shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus class="w-4 h-4" />
        Tambah Dompet
      </button>
    </div>

    <!-- Wallets Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="wallet in financeStore.wallets"
        :key="wallet.id"
        class="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg transition-transform hover:-translate-y-1 bg-gradient-to-br"
        :class="wallet.color || 'from-slate-700 to-slate-900'"
      >
        <!-- Background decorative pattern -->
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <div class="flex items-center justify-between relative z-10 mb-6">
          <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs">
            {{ wallet.type }}
          </span>
          <CreditCard class="w-6 h-6 text-white/80" />
        </div>

        <div class="relative z-10 mb-4">
          <p class="text-xs text-white/70 font-medium">Nama Akun</p>
          <h3 class="text-lg font-bold">{{ wallet.name }}</h3>
        </div>

        <div class="relative z-10 pt-2 border-t border-white/15 flex items-baseline justify-between">
          <div>
            <p class="text-[11px] text-white/70 font-medium">Saldo Tersedia</p>
            <p class="text-xl font-extrabold">{{ formatCurrency(wallet.balance) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Modal to add Wallet -->
    <div v-if="showAddWalletModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" @click="showAddWalletModal = false"></div>
      <div class="relative bg-surface w-full max-w-sm rounded-3xl shadow-xl border border-slate-200 p-6 z-10">
        <h3 class="text-lg font-bold text-ink mb-4">Tambah Dompet / Rekening</h3>
        <form @submit.prevent="saveWallet" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-ink/70 mb-1">Nama Dompet / Bank</label>
            <input
              v-model="newWallet.name"
              type="text"
              required
              placeholder="Contoh: SeaBank, Blu, OVO"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand bg-card focus:bg-surface text-ink transition-colors"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-ink/70 mb-1">Jenis</label>
            <select
              v-model="newWallet.type"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand bg-surface text-ink"
            >
              <option value="Bank">Bank</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Cash">Uang Tunai (Cash)</option>
              <option value="Investasi">Investasi</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-ink/70 mb-1">Saldo Awal (Rp)</label>
            <CurrencyInput
              v-model="newWallet.balance"
              required
              placeholder="0"
            />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showAddWalletModal = false"
              class="px-4 py-2 text-xs font-semibold text-ink/60 hover:bg-card rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus, CreditCard } from 'lucide-vue-next'
import CurrencyInput from '@/components/CurrencyInput.vue'
import { useFinanceStore } from '@/stores/finance'

const financeStore = useFinanceStore()
const showAddWalletModal = ref(false)

const newWallet = reactive({
  name: '',
  type: 'Bank',
  balance: 0,
})

const colors = [
  'from-teal-600 to-emerald-700',
  'from-slate-700 to-slate-900',
  'from-sky-600 to-blue-700',
  'from-amber-600 to-orange-700',
  'from-rose-500 to-pink-600',
]

const saveWallet = () => {
  financeStore.wallets.push({
    id: Date.now(),
    name: newWallet.name,
    type: newWallet.type,
    balance: Number(newWallet.balance),
    color: colors[financeStore.wallets.length % colors.length],
  })
  showAddWalletModal.value = false
  newWallet.name = ''
  newWallet.balance = 0
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val || 0))
}
</script>
