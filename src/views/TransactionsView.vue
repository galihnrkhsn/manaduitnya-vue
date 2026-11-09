<template>
  <div class="space-y-5 sm:space-y-6">
    <!-- Top Action Bar & Month Selector -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-ink">Semua Transaksi</h1>
        <p class="text-xs text-ink/60 mt-0.5">Kelola dan telusuri riwayat seluruh arus kas keuangan Anda.</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="refreshData"
          :disabled="financeStore.loading"
          class="p-2.5 bg-surface text-ink/70 hover:text-ink hover:bg-card border border-slate-200/80 rounded-xl transition-all ios-active-scale disabled:opacity-50"
          title="Muat Ulang Transaksi"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': financeStore.loading }" />
        </button>

        <button
          @click="$emit('open-add-modal')"
          class="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm shadow-brand/20 transition-all ios-active-scale"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Transaksi</span>
        </button>
      </div>
    </div>

    <!-- Month Navigation Bar -->
    <div class="bg-surface rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <button
          @click="changeMonth(-1)"
          class="p-2 text-ink/60 hover:text-ink hover:bg-card rounded-xl border border-slate-200/70 transition-colors ios-active-scale"
          title="Bulan Sebelumnya"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-2 px-2">
          <Calendar class="w-4 h-4 text-brand" />
          <span class="text-sm sm:text-base font-bold text-ink">
            {{ monthName }}
          </span>
        </div>

        <button
          @click="changeMonth(1)"
          class="p-2 text-ink/60 hover:text-ink hover:bg-card rounded-xl border border-slate-200/70 transition-colors ios-active-scale"
          title="Bulan Berikutnya"
        >
          <ChevronRight class="w-4 h-4" />
        </button>

        <button
          v-if="!isCurrentMonth"
          @click="goToCurrentMonth"
          class="ml-2 px-2.5 py-1 text-xs font-semibold text-brand-dark bg-brand/10 hover:bg-brand/20 rounded-lg transition-colors ios-active-scale"
        >
          Bulan Ini
        </button>
      </div>

      <!-- Quick Month / Year picker helper -->
      <div class="text-xs text-ink/50 font-medium">
        <span>Periode: </span>
        <span class="font-bold text-ink">{{ periodDateRange }}</span>
      </div>
    </div>

    <!-- Filter & Search Panel -->
    <div class="bg-surface rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5">
      <!-- Search Input -->
      <div class="relative">
        <Search class="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari transaksi berdasarkan judul, catatan, dompet..."
          class="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand bg-card focus:bg-surface text-ink transition-colors"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Filter Tipe Transaksi (Button Group) -->
      <div class="space-y-1.5">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
          Jenis Transaksi
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            @click="selectedType = 'ALL'"
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ios-active-scale border"
            :class="selectedType === 'ALL'
              ? 'bg-ink text-white border-ink shadow-xs'
              : 'bg-surface text-ink/70 border-slate-200/80 hover:bg-card hover:text-ink'"
          >
            Semua Jenis
            <span class="ml-1 text-[10px] opacity-75">({{ monthTransactions.length }})</span>
          </button>

          <button
            @click="selectedType = 'INCOME'"
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ios-active-scale flex items-center gap-1.5 border"
            :class="selectedType === 'INCOME'
              ? 'bg-brand text-white border-brand shadow-xs'
              : 'bg-surface text-ink/70 border-slate-200/80 hover:bg-brand/5 hover:text-brand-dark'"
          >
            <ArrowUpRight class="w-3.5 h-3.5" />
            <span>Pemasukan</span>
            <span class="text-[10px] opacity-80">({{ countIncome }})</span>
          </button>

          <button
            @click="selectedType = 'EXPENSE'"
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ios-active-scale flex items-center gap-1.5 border"
            :class="selectedType === 'EXPENSE'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-surface text-ink/70 border-slate-200/80 hover:bg-rose-50 hover:text-rose-600'"
          >
            <ArrowDownLeft class="w-3.5 h-3.5" />
            <span>Pengeluaran</span>
            <span class="text-[10px] opacity-80">({{ countExpense }})</span>
          </button>

          <button
            @click="selectedType = 'TRANSFER'"
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ios-active-scale flex items-center gap-1.5 border"
            :class="selectedType === 'TRANSFER'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-surface text-ink/70 border-slate-200/80 hover:bg-indigo-50 hover:text-indigo-600'"
          >
            <ArrowLeftRight class="w-3.5 h-3.5" />
            <span>Transfer</span>
            <span class="text-[10px] opacity-80">({{ countTransfer }})</span>
          </button>
        </div>
      </div>

      <!-- Filter Kategori (Pill Chips) -->
      <div v-if="categoryOptions.length > 0" class="space-y-1.5 pt-1 border-t border-slate-100">
        <div class="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-ink/50">
          <span>Kategori</span>
          <button
            v-if="selectedCategory !== 'ALL'"
            @click="selectedCategory = 'ALL'"
            class="text-[10px] text-brand-dark hover:underline capitalize font-normal"
          >
            Reset Kategori
          </button>
        </div>
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            @click="selectedCategory = 'ALL'"
            type="button"
            class="px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ios-active-scale border"
            :class="selectedCategory === 'ALL'
              ? 'bg-brand/10 text-brand-dark border-brand/30 font-semibold'
              : 'bg-surface text-ink/65 border-slate-200/80 hover:bg-card'"
          >
            Semua
          </button>

          <button
            v-for="cat in categoryOptions"
            :key="cat"
            @click="selectedCategory = cat"
            type="button"
            class="px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ios-active-scale border"
            :class="selectedCategory === cat
              ? 'bg-brand/10 text-brand-dark border-brand/30 font-semibold'
              : 'bg-surface text-ink/65 border-slate-200/80 hover:bg-card hover:text-ink'"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filtered Summary Indicator Bar (Responsive & No Overflow) -->
    <div class="bg-card/70 border border-slate-200/80 rounded-2xl p-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
      <div class="text-ink/60">
        Menampilkan <span class="font-bold text-ink">{{ totalFilteredCount }}</span> transaksi di bulan ini
      </div>

      <div class="flex flex-wrap items-center gap-1.5 sm:gap-3 font-mono font-bold text-[11px] sm:text-xs">
        <div v-if="totalIncomeFiltered > 0" class="text-brand flex items-center gap-1 bg-brand/10 px-2 py-0.5 rounded-lg border border-brand/20">
          <span class="text-[10px] font-sans font-medium text-brand-dark">Masuk:</span>
          <span>+{{ formatCurrency(totalIncomeFiltered) }}</span>
        </div>
        <div v-if="totalExpenseFiltered > 0" class="text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
          <span class="text-[10px] font-sans font-medium text-rose-500">Keluar:</span>
          <span>-{{ formatCurrency(totalExpenseFiltered) }}</span>
        </div>
        <div v-if="totalTransferFiltered > 0" class="text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
          <span class="text-[10px] font-sans font-medium text-indigo-500">Transfer:</span>
          <span>? {{ formatCurrency(totalTransferFiltered) }}</span>
        </div>
      </div>
    </div>

    <!-- Transactions List & Table Container -->
    <div class="bg-surface rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
      <SkeletonLoader v-if="financeStore.loading && totalFilteredCount === 0" type="transaction" :count="6" />

            <!-- Main Content (Both Desktop Table & Mobile List) -->
      <div v-else-if="groupedTransactions.length > 0">
        <!-- Desktop Table View (>= 768px) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200/80 bg-card/60 text-[11px] font-bold text-ink/60 uppercase tracking-wider">
                <th class="py-3 px-5">Deskripsi</th>
                <th class="py-3 px-4">Kategori</th>
                <th class="py-3 px-4">Dompet / Rekening</th>
                <th class="py-3 px-4">Waktu</th>
                <th class="py-3 px-5 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <!-- Group per hari -->
              <template v-for="group in groupedTransactions" :key="group.dateKey">
                <!-- Day Header Row -->
                <tr class="bg-slate-100/70 border-y border-slate-200/60 text-xs font-bold text-ink/75">
                  <td colspan="3" class="py-2.5 px-5">
                    <span class="inline-flex items-center gap-1.5">
                      <span class="text-brand font-black">•</span>
                      <span>{{ group.dayTitle }}</span>
                    </span>
                  </td>
                  <td colspan="2" class="py-2.5 px-5 text-right font-mono text-[11px] text-ink/60">
                    <span v-if="group.dayIncome > 0" class="text-brand mr-2">
                      +{{ formatCurrency(group.dayIncome) }}
                    </span>
                    <span v-if="group.dayExpense > 0" class="text-rose-500 mr-2">
                      -{{ formatCurrency(group.dayExpense) }}
                    </span>
                    <span v-if="group.dayTransfer > 0" class="text-indigo-600">
                      ? {{ formatCurrency(group.dayTransfer) }}
                    </span>
                  </td>
                </tr>

                <!-- Transactions in Day (Clickable to Edit/Delete) -->
                <tr
                  v-for="tx in group.items"
                  :key="tx.id"
                  @click="openEditModal(tx)"
                  class="border-b border-slate-100 hover:bg-card/70 transition-colors cursor-pointer group"
                >
                  <td class="py-3 px-5">
                    <div class="flex items-center gap-3">
                      <div
                        :class="[
                          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                          getBadgeClass(tx)
                        ]"
                      >
                        <ArrowUpRight v-if="getTxType(tx) === 'INCOME'" class="w-4 h-4" />
                        <ArrowLeftRight v-else-if="getTxType(tx) === 'TRANSFER'" class="w-4 h-4" />
                        <ArrowDownLeft v-else class="w-4 h-4" />
                      </div>
                      <div class="truncate">
                        <span class="font-semibold text-ink group-hover:text-brand-dark transition-colors truncate block text-sm">
                          {{ tx.title || (getTxType(tx) === 'TRANSFER' ? 'Transfer Saldo' : tx.categoryName || 'Transaksi') }}
                        </span>
                        <p v-if="tx.notes || tx.description" class="text-xs text-ink/40 mt-0.5 truncate">
                          {{ tx.notes || tx.description }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span
                      v-if="getTxType(tx) === 'TRANSFER'"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100"
                    >
                      Transfer
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
                      :style="getCategoryBadgeStyle(tx)"
                    >
                      <span
                        v-if="tx.categoryColor"
                        class="w-1.5 h-1.5 rounded-full shrink-0"
                        :style="{ backgroundColor: tx.categoryColor }"
                      ></span>
                      <span>{{ tx.categoryName || tx.category || 'Umum' }}</span>
                    </span>
                  </td>
                  <td class="py-3 px-4 text-ink/70 font-medium text-xs">
                    <span v-if="getTxType(tx) === 'TRANSFER' && (tx.toWalletName || tx.destinationWalletName)">
                      {{ tx.walletName || tx.wallet }} ? {{ tx.toWalletName || tx.destinationWalletName }}
                    </span>
                    <span v-else>
                      {{ tx.walletName || tx.wallet || '-' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-ink/50 text-xs">
                    {{ formatTime(tx.transactionDate || tx.date) || '-' }}
                  </td>
                  <td class="py-3 px-5 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <span :class="['font-bold font-mono', getAmountClass(tx)]">
                        {{ getAmountPrefix(tx) }}{{ formatCurrency(tx.amount) }}
                      </span>
                      <ChevronRight class="w-4 h-4 text-ink/20 group-hover:text-ink/60 transition-colors" />
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Mobile List View (< 768px) Grouped Per Day (Clickable to Edit/Delete) -->
        <div class="md:hidden space-y-4 p-3.5">
          <div
            v-for="group in groupedTransactions"
            :key="group.dateKey"
            class="space-y-1.5"
          >
            <!-- Day Section Header (Sticky Style & No Overflow) -->
            <div class="flex flex-wrap items-center justify-between gap-1 px-1 py-1 text-xs font-bold text-ink/75">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="w-1.5 h-1.5 rounded-full bg-brand shrink-0"></span>
                <span class="truncate">{{ group.dayTitle }}</span>
              </div>
              <div class="font-mono text-[11px] text-ink/50 flex flex-wrap items-center gap-1.5 shrink-0 ml-auto">
                <span v-if="group.dayIncome > 0" class="text-brand">
                  +{{ formatCurrency(group.dayIncome) }}
                </span>
                <span v-if="group.dayExpense > 0" class="text-rose-500">
                  -{{ formatCurrency(group.dayExpense) }}
                </span>
                <span v-if="group.dayTransfer > 0" class="text-indigo-600">
                  ? {{ formatCurrency(group.dayTransfer) }}
                </span>
              </div>
            </div>

            <!-- Day's Transaction Items Container -->
            <div class="bg-card/40 rounded-2xl border border-slate-200/70 divide-y divide-slate-100 overflow-hidden">
              <div
                v-for="tx in group.items"
                :key="tx.id"
                @click="openEditModal(tx)"
                class="p-3 flex items-center justify-between hover:bg-surface active:bg-slate-100/80 transition-colors cursor-pointer ios-active-scale"
              >
                <div class="flex items-center gap-3 truncate min-w-0 pr-2">
                  <div
                    :class="[
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                      getBadgeClass(tx)
                    ]"
                  >
                    <ArrowUpRight v-if="getTxType(tx) === 'INCOME'" class="w-4 h-4" />
                    <ArrowLeftRight v-else-if="getTxType(tx) === 'TRANSFER'" class="w-4 h-4" />
                    <ArrowDownLeft v-else class="w-4 h-4" />
                  </div>

                  <div class="truncate">
                    <span class="font-semibold text-xs sm:text-sm text-ink truncate block">
                      {{ tx.title || (getTxType(tx) === 'TRANSFER' ? 'Transfer Saldo' : tx.categoryName || 'Transaksi') }}
                    </span>
                    <div class="flex items-center gap-1.5 text-[11px] text-ink/50 mt-0.5">
                      <span
                        v-if="getTxType(tx) === 'TRANSFER'"
                        class="font-semibold text-indigo-600"
                      >
                        Transfer
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center gap-1 font-medium text-[11px] px-1.5 py-0.5 rounded-md border transition-colors"
                        :style="getCategoryBadgeStyle(tx)"
                      >
                        <span
                          v-if="tx.categoryColor"
                          class="w-1.5 h-1.5 rounded-full shrink-0"
                          :style="{ backgroundColor: tx.categoryColor }"
                        ></span>
                        <span>{{ tx.categoryName || tx.category || 'Umum' }}</span>
                      </span>
                      <span>•</span>
                      <span v-if="getTxType(tx) === 'TRANSFER' && (tx.toWalletName || tx.destinationWalletName)">
                        {{ tx.walletName || tx.wallet }} ? {{ tx.toWalletName || tx.destinationWalletName }}
                      </span>
                      <span v-else>
                        {{ tx.walletName || tx.wallet || '-' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <div class="text-right">
                    <p
                      :class="[
                        'text-xs sm:text-sm font-bold font-mono',
                        getAmountClass(tx)
                      ]"
                    >
                      {{ getAmountPrefix(tx) }}{{ formatCurrency(tx.amount) }}
                    </p>
                    <p v-if="formatTime(tx.transactionDate || tx.date)" class="text-[10px] text-ink/40">
                      {{ formatTime(tx.transactionDate || tx.date) }}
                    </p>
                  </div>
                  <ChevronRight class="w-4 h-4 text-ink/30 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 px-4">
        <div class="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-ink/30 mx-auto mb-3">
          <Receipt class="w-6 h-6" />
        </div>
        <h3 class="text-sm font-bold text-ink">Tidak ada transaksi ditemukan</h3>
        <p class="text-xs text-ink/50 mt-1 max-w-sm mx-auto">
          {{
            searchQuery || selectedType !== 'ALL' || selectedCategory !== 'ALL'
              ? 'Coba sesuaikan kata kunci pencarian atau ubah tombol filter Anda.'
              : `Belum ada catatan arus kas pada ${monthName}. Mulai catat transaksi Anda.`
          }}
        </p>
        <div class="mt-4 flex items-center justify-center gap-2">
          <button
            v-if="searchQuery || selectedType !== 'ALL' || selectedCategory !== 'ALL'"
            @click="resetFilters"
            class="px-4 py-2 text-xs font-semibold text-ink/70 bg-card hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            Reset Semua Filter
          </button>
          <button
            @click="$emit('open-add-modal')"
            class="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-xs transition-colors ios-active-scale"
          >
            + Tambah Transaksi
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Edit & Delete Transaksi -->
    <TransactionEditModal
      :is-open="isEditModalOpen"
      :transaction="selectedTransaction"
      @close="isEditModalOpen = false"
      @updated="handleTransactionUpdated"
      @deleted="handleTransactionDeleted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Receipt,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-vue-next'
import { useFinanceStore } from '@/stores/finance'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import TransactionEditModal from '@/components/TransactionEditModal.vue'

defineEmits(['open-add-modal'])

const financeStore = useFinanceStore()
const searchQuery = ref('')
const selectedType = ref('ALL')
const selectedCategory = ref('ALL')

// State Modal Edit/Delete
const isEditModalOpen = ref(false)
const selectedTransaction = ref(null)

const openEditModal = (tx) => {
  if (navigator.vibrate) navigator.vibrate(10)
  selectedTransaction.value = { ...tx }
  isEditModalOpen.value = true
}

const handleTransactionUpdated = async () => {
  await loadTransactionsForSelectedMonth()
}

const handleTransactionDeleted = async () => {
  await loadTransactionsForSelectedMonth()
}

// Date state for month filter
const currentDate = new Date()
const selectedYear = ref(currentDate.getFullYear())
const selectedMonth = ref(currentDate.getMonth()) // 0 - 11

const monthName = computed(() => {
  const d = new Date(selectedYear.value, selectedMonth.value, 1)
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(d)
})

const isCurrentMonth = computed(() => {
  const now = new Date()
  return selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth()
})

const periodDateRange = computed(() => {
  const start = new Date(selectedYear.value, selectedMonth.value, 1)
  const end = new Date(selectedYear.value, selectedMonth.value + 1, 0)
  return `1 - ${end.getDate()} ${new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(start)}`
})

const changeMonth = async (offset) => {
  const nextDate = new Date(selectedYear.value, selectedMonth.value + offset, 1)
  selectedYear.value = nextDate.getFullYear()
  selectedMonth.value = nextDate.getMonth()
  await loadTransactionsForSelectedMonth()
}

const goToCurrentMonth = async () => {
  const now = new Date()
  selectedYear.value = now.getFullYear()
  selectedMonth.value = now.getMonth()
  await loadTransactionsForSelectedMonth()
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
    if (val === 2 || val === 'EXPENSE' || String(val).toUpperCase() === 'EXPENSE') return 'EXPENSE'
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

// Filter seluruh transaksi bulan yang dipilih (tanpa limit 5)
const monthTransactions = computed(() => {
  return financeStore.transactions.filter((tx) => {
    const rawDate = tx.transactionDate || tx.date
    if (!rawDate) return true
    const d = new Date(rawDate)
    if (isNaN(d.getTime())) return true
    return d.getFullYear() === selectedYear.value && d.getMonth() === selectedMonth.value
  })
})

const countIncome = computed(() => {
  return monthTransactions.value.filter((t) => getTxType(t) === 'INCOME').length
})

const countExpense = computed(() => {
  return monthTransactions.value.filter((t) => getTxType(t) === 'EXPENSE').length
})

const countTransfer = computed(() => {
  return monthTransactions.value.filter((t) => getTxType(t) === 'TRANSFER').length
})

// Kategori dinamis dari categories store atau dari data transaksi bulan aktif
const categoryOptions = computed(() => {
  const set = new Set()
  if (Array.isArray(financeStore.categories)) {
    financeStore.categories.forEach((c) => {
      const name = typeof c === 'object' ? c.name : c
      if (name) set.add(name)
    })
  }
  monthTransactions.value.forEach((tx) => {
    const name = tx.categoryName || tx.category
    if (name) set.add(name)
  })
  return Array.from(set)
})

const filteredTransactions = computed(() => {
  return monthTransactions.value.filter((tx) => {
    const type = getTxType(tx)
    // Filter Type
    if (selectedType.value === 'INCOME' && type !== 'INCOME') return false
    if (selectedType.value === 'EXPENSE' && type !== 'EXPENSE') return false
    if (selectedType.value === 'TRANSFER' && type !== 'TRANSFER') return false

    // Filter Category
    if (selectedCategory.value !== 'ALL') {
      const cat = tx.categoryName || tx.category
      if (cat !== selectedCategory.value) return false
    }

    // Filter Search Query
    if (searchQuery.value.trim() !== '') {
      const q = searchQuery.value.toLowerCase()
      const title = (tx.title || '').toLowerCase()
      const notes = (tx.notes || tx.description || '').toLowerCase()
      const wallet = (tx.walletName || tx.wallet || '').toLowerCase()
      const destWallet = (tx.toWalletName || tx.destinationWalletName || '').toLowerCase()
      const cat = (tx.categoryName || tx.category || '').toLowerCase()
      if (
        !title.includes(q) &&
        !notes.includes(q) &&
        !wallet.includes(q) &&
        !destWallet.includes(q) &&
        !cat.includes(q)
      ) {
        return false
      }
    }

    return true
  })
})

const totalFilteredCount = computed(() => filteredTransactions.value.length)

const totalIncomeFiltered = computed(() => {
  return filteredTransactions.value
    .filter((tx) => getTxType(tx) === 'INCOME')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
})

const totalExpenseFiltered = computed(() => {
  return filteredTransactions.value
    .filter((tx) => getTxType(tx) === 'EXPENSE')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
})

const totalTransferFiltered = computed(() => {
  return filteredTransactions.value
    .filter((tx) => getTxType(tx) === 'TRANSFER')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
})

// Grouping per hari
const groupedTransactions = computed(() => {
  const groups = {}
  
  // Urutkan transaksi dari yang paling baru
  const sorted = [...filteredTransactions.value].sort((a, b) => {
    const dateA = new Date(a.transactionDate || a.date || 0).getTime()
    const dateB = new Date(b.transactionDate || b.date || 0).getTime()
    return dateB - dateA
  })

  sorted.forEach((tx) => {
    const rawDate = tx.transactionDate || tx.date
    let key = 'tanpa-tanggal'
    if (rawDate) {
      const d = new Date(rawDate)
      if (!isNaN(d.getTime())) {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      }
    }

    if (!groups[key]) {
      groups[key] = {
        dateKey: key,
        rawDate,
        dayTitle: formatDayHeader(rawDate),
        items: [],
        dayIncome: 0,
        dayExpense: 0,
        dayTransfer: 0,
      }
    }

    groups[key].items.push(tx)
    const type = getTxType(tx)
    const amount = Number(tx.amount || 0)
    if (type === 'INCOME') groups[key].dayIncome += amount
    else if (type === 'TRANSFER') groups[key].dayTransfer += amount
    else groups[key].dayExpense += amount
  })

  return Object.values(groups)
})

const formatDayHeader = (dateStr) => {
  if (!dateStr) return 'Lainnya'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Lainnya'
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86400000
  const txDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

  const fullDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)

  if (txDay === today) return `Hari ini • ${fullDate}`
  if (txDay === yesterday) return `Kemarin • ${fullDate}`
  return fullDate
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  if (String(dateStr).includes('T') || String(dateStr).includes(':')) {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }
  return ''
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedType.value = 'ALL'
  selectedCategory.value = 'ALL'
}

const loadTransactionsForSelectedMonth = async () => {
  const y = selectedYear.value
  const m = selectedMonth.value
  const from = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const lastDay = new Date(y, m + 1, 0).getDate()
  const to = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  await financeStore.fetchTransactions(from, to)
}

const refreshData = async () => {
  await Promise.all([
    loadTransactionsForSelectedMonth(),
    financeStore.loadMasterData({ force: true }),
  ])
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val || 0))
}

onMounted(async () => {
  await loadTransactionsForSelectedMonth()
  if (financeStore.categories.length === 0) {
    await financeStore.loadMasterData()
  }
})
</script>
