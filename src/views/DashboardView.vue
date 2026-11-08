<template>
  <div class="space-y-5 sm:space-y-6">
    <!-- Header / Welcome Banner -->
    <div class="bg-gradient-to-tr from-brand-dark to-brand rounded-3xl p-5 sm:p-7 text-white shadow-lg shadow-brand/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight">
          Halo, {{ authStore.user?.name || '-' }}!
        </h1>
        <p class="text-white/80 text-xs sm:text-sm mt-0.5 max-w-xl">
          Pantau arus kas dan alokasi dompetmu langsung dari genggaman.
        </p>
      </div>

      <div class="hidden sm:flex items-center gap-3">
        <button
          @click="$emit('open-add-modal')"
          class="flex items-center gap-2 px-5 py-2.5 bg-surface text-brand-dark hover:bg-card rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all ios-active-scale"
        >
          <Plus class="w-4 h-4" />
          Catat Transaksi
        </button>
      </div>
    </div>

    <!-- Stats Cards Row -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
      <StatCard
        class="col-span-2 sm:col-span-1"
        title="Saldo Saat Ini"
        :amount="financeStore.totalBalance"
      >
        <template #icon>
          <Wallet class="w-5 h-5 sm:w-6 sm:h-6 text-brand-dark"/>
        </template>
      </StatCard>

      <StatCard
        title="Pemasukan"
        :amount="financeStore.totalIncome"
        color-class="bg-brand"
        subtitle="Bulan ini"
      >
      </StatCard>

      <StatCard
        title="Pengeluaran"
        :amount="financeStore.totalExpense"
        color-class="bg-rose-500"
        subtitle="Bulan ini"
      >
      </StatCard>
    </div>

    <!-- Wallets Quick View Row -->
    <div>
      <div class="flex items-center justify-between mb-2.5 px-0.5">
        <h2 class="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
          <CreditCard class="w-4 h-4 text-brand" />
          Dompet & Rekening
        </h2>
        <router-link to="/wallets" class="text-xs font-semibold text-brand-dark hover:underline">
          Lihat Semua &rarr;
        </router-link>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div
          v-for="wallet in financeStore.wallets"
          :key="wallet.id"
          class="bg-surface p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand/40 transition-colors"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[11px] sm:text-xs font-medium text-ink/60 truncate mr-1">{{ wallet.name }}</span>
            <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-card text-ink/70 shrink-0">{{ wallet.type }}</span>
          </div>
          <p class="text-sm sm:text-base font-bold text-ink truncate tracking-tight">
            {{ formatCurrency(wallet.balance) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Recent Transactions Section -->
    <div class="bg-surface rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-ink">Transaksi Terbaru</h2>
          <p class="text-xs text-ink/50">Pencatatan arus kas terkini</p>
        </div>

        <router-link
          to="/transactions"
          class="px-3 py-1.5 text-xs font-semibold text-brand-dark bg-brand/10 hover:bg-brand/20 rounded-xl transition-colors"
        >
          Lihat Semua
        </router-link>
      </div>

      <!-- Transactions List -->
      <div v-if="financeStore.transactions.length > 0" class="divide-y divide-slate-100">
        <div
          v-for="tx in financeStore.transactions"
          :key="tx.id"
          class="py-3 flex items-center justify-between hover:bg-card/70 px-1 rounded-xl transition-colors group"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              :class="[
                'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0',
                tx.type === 1 ? 'bg-brand/10 text-brand' : 'bg-rose-50 text-rose-500'
              ]"
            >
              <ArrowUpRight v-if="tx.type === 2" class="w-4 h-4 sm:w-5 sm:h-5" />
              <ArrowDownLeft v-else class="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div class="truncate">
              <!-- <p class="text-xs sm:text-sm font-semibold text-ink truncate">{{ tx.title }}</p> -->
              <div class="flex items-center gap-1.5 text-[11px] text-ink/50 mt-0.5">
                <span class="font-medium text-ink/70">{{ tx.categoryName }}</span>
                <span>•</span>
                <span>{{ tx.walletName }}</span>
              </div>
            </div>
          </div>

          <div class="text-right shrink-0 ml-3">
            <p
              :class="[
                'text-xs sm:text-sm font-semibold',
                tx.type === 1 ? 'text-brand' : 'text-ink'
              ]"
            >
              {{ tx.type === 1 ? '+' : '-' }} {{ formatCurrency(tx.amount) }}
            </p>
            <p class="text-[10px] text-ink/50 mt-0.5">
              {{ formatDate(tx.transactionDate) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-10">
        <Receipt class="w-10 h-10 text-ink/30 mx-auto mb-2" />
        <h3 class="text-xs font-bold text-ink/70">Belum ada transaksi</h3>
        <button
          @click="$emit('open-add-modal')"
          class="mt-3 px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          + Tambah Sekarang
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Sparkles,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-vue-next'
import { ref, onMounted, watch, onUnmounted } from 'vue'
import StatCard from '@/components/StatCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'

const now = new Date()
const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const from = toDateStr(new Date(now.getFullYear(), now.getMonth(), 1))
const to   = toDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0))

onMounted(() => {
  console.log('Dashboard mounted')
  financeStore.fetchSummary(from, to)
  timer = setInterval(pickQuote, 15000)
})

defineEmits(['open-add-modal'])

const authStore = useAuthStore()
const financeStore = useFinanceStore()

const currentQuote = ref('')
let timer = null

const pickQuote = () => {
  const list = financeStore.quotes
  if (!list.length) return
  currentQuote.value = list[Math.floor(Math.random() * list.length)]
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val || 0))
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

watch(
  () => financeStore.quotes,
  () => {
    if (!currentQuote.value) pickQuote()
  },
  {immediate: true}
)

onUnmounted(() => clearInterval(timer))
</script>
