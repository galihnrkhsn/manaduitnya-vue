<template>
  <div class="space-y-5 sm:space-y-6">
    <!-- Header / Welcome Banner -->
    <div class="bg-gradient-to-tr from-brand-dark via-brand to-teal-500 rounded-3xl p-5 sm:p-7 text-white shadow-lg shadow-brand/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight">
            Halo, {{ authStore.user?.name || 'Pengguna' }}!
          </h1>
          <button
            @click="toggleBalanceVisibility"
            class="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white/90 transition-colors ios-active-scale"
            :title="isBalanceHidden ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'"
          >
            <EyeOff v-if="isBalanceHidden" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>
        <p class="text-white/80 text-xs sm:text-sm max-w-xl">
          Pantau arus kas dan alokasi dompetmu langsung dari genggaman.
        </p>
        <p v-if="currentQuote" class="text-white/70 text-[11px] italic pt-0.5 flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>"{{ currentQuote }}"</span>
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          @click="$emit('open-add-modal')"
          class="flex items-center gap-2 px-5 py-2.5 bg-surface text-brand-dark hover:bg-card rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all ios-active-scale"
        >
          <Plus class="w-4 h-4" />
          <span>Catat Transaksi</span>
        </button>
      </div>
    </div>

    <!-- Overbudget Alert Notification Banner -->
    <div
      v-if="overbudgetCategories.length > 0"
      class="p-4 sm:p-5 bg-rose-50 border-l-4 border-rose-500 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse"
    >
      <div class="flex items-start gap-3">
        <div class="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5 sm:mt-0">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-sm sm:text-base font-bold text-rose-900">
              Peringatan Anggaran Bulan Ini
            </h4>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
              {{ overbudgetCategories.length }} Kategori Melebihi Batas
            </span>
          </div>
          <p class="text-xs sm:text-sm text-rose-700/90 mt-1">
            Pengeluaran untuk
            <span class="font-bold underline">{{ overbudgetCategories.map(c => c.categoryName).join(', ') }}</span>
            telah melebihi target anggaran yang ditentukan.
          </p>
        </div>
      </div>

      <router-link
        to="/budgets"
        class="self-stretch sm:self-auto text-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors ios-active-scale shrink-0"
      >
        Kelola Anggaran
      </router-link>
    </div>

    <SkeletonLoader v-if="financeStore.loading && !financeStore.totalBalance" type="stat" :count="3" cols="3" />

    <!-- Stats Cards Row -->
    <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
      <StatCard
        class="col-span-2 sm:col-span-1"
        title="Saldo Saat Ini"
        :amount="financeStore.totalBalance"
        :is-masked="isBalanceHidden"
      >
        <template #action>
          <button
            @click="toggleBalanceVisibility"
            class="p-1 text-ink/40 hover:text-ink/80 transition-colors rounded-md"
            :title="isBalanceHidden ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'"
          >
            <EyeOff v-if="isBalanceHidden" class="w-3.5 h-3.5" />
            <Eye v-else class="w-3.5 h-3.5" />
          </button>
        </template>
        <template #icon>
          <Wallet class="w-5 h-5 sm:w-6 sm:h-6 text-brand-dark" />
        </template>
      </StatCard>

      <StatCard
        title="Pemasukan"
        :amount="financeStore.totalIncome"
        :is-masked="isBalanceHidden"
        color-class="bg-brand/10 text-brand"
        subtitle="Bulan ini"
      >
        <template #icon>
          <TrendingUp class="w-5 h-5 text-brand" />
        </template>
      </StatCard>

      <StatCard
        title="Pengeluaran"
        :amount="financeStore.totalExpense"
        :is-masked="isBalanceHidden"
        color-class="bg-rose-50 text-rose-500"
        subtitle="Bulan ini"
      >
        <template #icon>
          <TrendingDown class="w-5 h-5 text-rose-500" />
        </template>
      </StatCard>
    </div>

    <!-- Wallets Physical Card Slider Row -->
    <div class="space-y-3">
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-2">
          <CreditCard class="w-4 h-4 text-brand" />
          <h2 class="text-sm sm:text-base font-bold text-ink">Dompet & Rekening</h2>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand-dark">
            {{ financeStore.wallets.length }} Akun
          </span>
        </div>
        <router-link to="/wallets" class="text-xs font-semibold text-brand-dark hover:underline">
          Kelola Semua &rarr;
        </router-link>
      </div>

      <!-- Horizontal Scrollable Cards -->
      <div class="flex gap-4 overflow-x-auto pb-4 pt-1.5 px-2 sm:px-3 scrollbar-none snap-x snap-mandatory">
        <!-- Physical Card Item -->
        <div
          v-for="(wallet, idx) in financeStore.wallets"
          :key="wallet.id"
          class="w-64 sm:w-72 h-40 sm:h-44 shrink-0 rounded-3xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl snap-start bg-gradient-to-br"
          :class="getCardGradient(wallet, idx)"
        >
          <!-- Watermark decoration -->
          <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <!-- Card Top: Name & Contactless / Chip simulation -->
          <div class="flex items-start justify-between relative z-10">
            <div>
              <p class="text-[10px] text-white/70 uppercase tracking-widest font-semibold">
                {{ wallet.type || 'Akun' }}
              </p>
              <h3 class="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-xs">
                {{ wallet.name }}
              </h3>
            </div>
            <!-- EMV Chip & NFC icon -->
            <div class="flex items-center gap-2">
              <div class="w-8 h-6 rounded-md bg-amber-300/30 border border-amber-300/60 flex items-center justify-center p-1">
                <div class="w-full h-full border border-amber-200/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-80">
                  <div class="border-b border-r border-amber-200/40"></div>
                  <div class="border-b border-amber-200/40"></div>
                  <div class="border-r border-amber-200/40"></div>
                  <div></div>
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
                {{ isBalanceHidden ? 'Rp ********' : formatCurrency(wallet.balance) }}
              </p>
            </div>
            <CreditCard class="w-4 h-4 text-white/60 mb-1" />
          </div>
        </div>

        <!-- Add Wallet Quick Card -->
        <router-link
          to="/wallets"
          class="w-48 sm:w-56 h-40 sm:h-44 shrink-0 rounded-3xl border-2 border-dashed border-slate-300 hover:border-brand bg-surface/60 hover:bg-surface p-4 flex flex-col items-center justify-center text-center transition-all snap-start group"
        >
          <div class="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
            <Plus class="w-5 h-5" />
          </div>
          <span class="text-xs font-bold text-ink">Tambah Dompet</span>
          <span class="text-[10px] text-ink/50 mt-0.5">Rekening baru</span>
        </router-link>
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
          v-for="tx in financeStore.transactions.slice(0, 5)"
          :key="tx.id"
          class="flex items-center justify-between py-3.5 hover:bg-card/50 px-2 -mx-2 rounded-xl transition-colors"
        >
          <div class="flex items-center gap-3 truncate min-w-0">
            <div
              :class="[
                'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0',
                getBadgeClass(tx)
              ]"
            >
              <ArrowUpRight v-if="getTxType(tx) === 'INCOME'" class="w-4 h-4 sm:w-5 sm:h-5" />
              <ArrowLeftRight v-else-if="getTxType(tx) === 'TRANSFER'" class="w-4 h-4 sm:w-5 sm:h-5" />
              <ArrowDownLeft v-else class="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div class="truncate">
              <p class="text-xs sm:text-sm font-semibold text-ink truncate">
                {{ tx.title || (getTxType(tx) === 'TRANSFER' ? 'Transfer Saldo' : tx.categoryName || 'Transaksi') }}
              </p>
              <div class="flex items-center gap-1.5 text-[11px] text-ink/50 mt-0.5">
                <span v-if="getTxType(tx) === 'TRANSFER'" class="font-semibold text-indigo-600">Transfer</span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 font-medium text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md border transition-colors"
                  :style="getCategoryBadgeStyle(tx)"
                >
                  <span
                    v-if="tx.categoryColor"
                    class="w-1.5 h-1.5 rounded-full shrink-0"
                    :style="{ backgroundColor: tx.categoryColor }"
                  ></span>
                  <span>{{ tx.categoryName || tx.category || 'Umum' }}</span>
                </span>
              </div>
              <div class="flex items-center gap-1.5 text-[11px] text-ink/50 mt-0.5">
                <span v-if="getTxType(tx) === 'TRANSFER' && (tx.toWalletName || tx.destinationWalletName)">
                  {{ tx.walletName || tx.wallet }} ⇄ {{ tx.toWalletName || tx.destinationWalletName }}
                </span>
                <span v-else>{{ tx.walletName || 'Dompet' }}</span>
              </div>
            </div>
          </div>

          <div class="text-right shrink-0 ml-3">
            <p
              :class="[
                'text-xs sm:text-sm font-bold font-mono',
                getAmountClass(tx)
              ]"
            >
              {{ getAmountPrefix(tx) }}
              {{ isBalanceHidden ? 'Rp ******' : formatCurrency(tx.amount) }}
            </p>
            <p class="text-[10px] text-ink/40 mt-0.5">
              {{ formatDate(tx.transactionDate) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-10 px-4">
        <div class="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-ink/40 mx-auto mb-3">
          <Receipt class="w-6 h-6" />
        </div>
        <h3 class="text-sm font-bold text-ink">Belum Ada Transaksi</h3>
        <p class="text-xs text-ink/50 mt-1 max-w-sm mx-auto">
          Mulai catat pemasukan dan pengeluaran harianmu untuk memantau arus kas langsung.
        </p>
        <button
          @click="$emit('open-add-modal')"
          class="mt-4 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold shadow-sm shadow-brand/20 transition-all ios-active-scale"
        >
          <Plus class="w-4 h-4 inline mr-1" />
          Catat Transaksi Pertama
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
  ArrowLeftRight,
  Eye,
  EyeOff,
  Wifi,
  AlertTriangle,
} from 'lucide-vue-next'
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import StatCard from '@/components/StatCard.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'

const now = new Date()
const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const from = toDateStr(new Date(now.getFullYear(), now.getMonth(), 1))
const to   = toDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0))

const currentMonthNumber = now.getMonth() + 1

const overbudgetCategories = computed(() => {
  const yymm = from.substring(0, 7)
  const list = financeStore.budgets.filter((b) => {
    if (!b.month) return true
    return b.month.startsWith(yymm)
  })

  return list.map((b) => {
    const catId = b.categoryId
    const catName = b.category_name || b.categoryName || ''

    let spent = b.spent !== undefined ? Number(b.spent) : null
    if (spent === null || isNaN(spent)) {
      spent = financeStore.transactions
        .filter((tx) => {
          const type = tx.type === 2 || String(tx.type).toUpperCase() === 'EXPENSE'
          if (!type) return false
          const matchId = catId && (tx.categoryId === catId || tx.category?.id === catId)
          const matchName = catName && (tx.categoryName === catName || tx.category === catName)
          return matchId || matchName
        })
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
    }

    const amount = Number(b.amount || 0)
    const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0
    return {
      categoryName: catName || 'Kategori',
      amount,
      spent,
      excess: spent - amount,
      percentage,
    }
  }).filter((b) => b.percentage >= 100)
})

onMounted(() => {
  financeStore.fetchSummary(from, to)
  financeStore.fetchBudgets(from)
  financeStore.fetchTransactions(from, to)
  financeStore.fetchWallets()
  timer = setInterval(pickQuote, 15000)
})

defineEmits(['open-add-modal'])

const authStore = useAuthStore()
const financeStore = useFinanceStore()

// State sembunyikan/tampilkan saldo tersimpan di localStorage
const isBalanceHidden = ref(localStorage.getItem('hide_balance') === 'true')

const toggleBalanceVisibility = () => {
  isBalanceHidden.value = !isBalanceHidden.value
  localStorage.setItem('hide_balance', String(isBalanceHidden.value))
}

const currentQuote = ref('')
let timer = null

const pickQuote = () => {
  const list = financeStore.quotes
  if (!list.length) return
  currentQuote.value = list[Math.floor(Math.random() * list.length)]
}

// Gradient elegan kartu dompet/rekening
const cardGradients = [
  'from-teal-800 via-teal-900 to-emerald-950',
  'from-slate-800 via-slate-900 to-zinc-950',
  'from-blue-800 via-indigo-900 to-slate-950',
  'from-amber-800 via-stone-900 to-zinc-950',
  'from-rose-800 via-red-950 to-stone-950',
]

const getCardGradient = (wallet, idx) => {
  if (wallet.color && wallet.color.includes('from-')) {
    return wallet.color
  }
  return cardGradients[idx % cardGradients.length]
}

const getCardTail = (id, idx) => {
  if (id) {
    const s = String(id)
    return s.slice(-4).padStart(4, '0')
  }
  return String(1024 + idx)
}

const getTxType = (tx) => {
  if (!tx) return 'EXPENSE'
  if (typeof tx === 'object') {
    if (tx.isTransfer || tx.destinationWalletId || (tx.fromWallet && tx.toWallet) || (tx.fromWalletName && tx.toWalletName)) {
      return 'TRANSFER'
    }
    const val = tx.type
    if (val === 1 || val === 'INCOME' || String(val).toUpperCase() === 'INCOME') return 'INCOME'
    if (val === 3 || val === 'TRANSFER' || String(val).toUpperCase() === 'TRANSFER') return 'TRANSFER'
    return 'EXPENSE'
  }
  if (tx === 1 || tx === 'INCOME' || String(tx).toUpperCase() === 'INCOME') return 'INCOME'
  if (tx === 3 || tx === 'TRANSFER' || String(tx).toUpperCase() === 'TRANSFER') return 'TRANSFER'
  return 'EXPENSE'
}

const getCategoryBadgeStyle = (tx) => {
  if (tx && tx.categoryColor) {
    return {
      backgroundColor: tx.categoryColor + '18',
      color: tx.categoryColor,
      borderColor: tx.categoryColor + '40',
    }
  }
  return {
    backgroundColor: '#F1F5F9',
    color: '#334155',
    borderColor: '#E2E8F0',
  }
}

const getBadgeClass = (tx) => {
  const type = getTxType(tx)
  if (type === 'INCOME') return 'bg-brand/10 text-brand'
  if (type === 'TRANSFER') return 'bg-indigo-50 text-indigo-600'
  return 'bg-rose-50 text-rose-500'
}

const getAmountClass = (tx) => {
  const type = getTxType(tx)
  if (type === 'INCOME') return 'text-brand'
  if (type === 'TRANSFER') return 'text-indigo-600'
  return 'text-ink'
}

const getAmountPrefix = (tx) => {
  const type = getTxType(tx)
  if (type === 'INCOME') return '+ '
  if (type === 'TRANSFER') return '? '
  return '- '
}

const isIncome = (type) => {
  return getTxType(type) === 'INCOME'
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
  { immediate: true }
)

onUnmounted(() => clearInterval(timer))
</script>
