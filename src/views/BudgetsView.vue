<template>
  <div class="space-y-5 sm:space-y-6">
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Anggaran Bulanan</h1>
        <p class="text-xs sm:text-sm text-ink/60 mt-1">
          Pantau batasan pengeluaran per kategori agar keuangan tetap terkendali.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <!-- Button Copy Anggaran -->
        <button
          @click="openCopyModal"
          class="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-card hover:bg-slate-200/80 text-ink rounded-xl font-bold text-xs sm:text-sm border border-slate-200/80 transition-all ios-active-scale"
          title="Salin Anggaran dari Bulan Lain"
        >
          <Copy class="w-4 h-4 text-brand" />
          <span>Salin Anggaran</span>
        </button>

        <!-- Button Add Anggaran -->
        <button
          @click="openAddModal"
          class="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-brand/20 transition-all ios-active-scale"
        >
          <Plus class="w-4 h-4" />
          <span>Buat Anggaran</span>
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

        <div class="flex items-center gap-2 px-3 py-1.5 bg-card/60 rounded-xl border border-slate-200/60">
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
          @click="resetToCurrentMonth"
          class="px-2.5 py-1.5 text-xs font-semibold text-brand hover:bg-brand/10 rounded-lg transition-colors border border-brand/20 ios-active-scale"
        >
          Bulan Ini
        </button>
      </div>

      <!-- Refresh Button -->
      <button
        @click="refreshData"
        class="flex items-center gap-1.5 text-xs font-medium text-ink/50 hover:text-brand px-2.5 py-1.5 rounded-lg hover:bg-card transition-colors ios-active-scale ml-auto"
      >
        <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
        <span class="hidden sm:inline">Muat Ulang</span>
      </button>
    </div>

    <!-- Overbudget Alert Banner (If Any Category Exceeds Limit) -->
    <div
      v-if="overbudgetCategories.length > 0"
      class="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse"
    >
      <div class="flex items-start gap-3">
        <div class="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5 sm:mt-0">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-rose-800">
            Peringatan: {{ overbudgetCategories.length }} Kategori Melebihi Anggaran!
          </h4>
          <p class="text-xs text-rose-700/90 mt-0.5">
            Pengeluaran untuk
            <span class="font-semibold">{{ overbudgetCategories.map(c => c.categoryName).join(', ') }}</span>
            telah melampaui batas yang ditentukan untuk bulan ini.
          </p>
        </div>
      </div>
    </div>

    <!-- Overview Metrics Summary Strip -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Anggaran -->
      <div class="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-medium text-ink/60 block">Total Anggaran</span>
        <p class="text-base sm:text-xl font-bold font-mono text-ink mt-1">
          {{ formatCurrency(totalBudgetAmount) }}
        </p>
        <span class="text-[11px] text-ink/40 mt-0.5 block">
          {{ currentMonthBudgets.length }} kategori aktif
        </span>
      </div>

      <!-- Total Terpakai -->
      <div class="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-medium text-ink/60 block">Total Terpakai</span>
        <p class="text-base sm:text-xl font-bold font-mono text-rose-600 mt-1">
          {{ formatCurrency(totalSpentAmount) }}
        </p>
        <span class="text-[11px] text-ink/40 mt-0.5 block">
          {{ overallPercentage }}% dari total anggaran
        </span>
      </div>

      <!-- Sisa Anggaran -->
      <div class="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-medium text-ink/60 block">Sisa Anggaran</span>
        <p
          :class="[
            'text-base sm:text-xl font-bold font-mono mt-1',
            totalRemainingAmount >= 0 ? 'text-brand' : 'text-rose-600'
          ]"
        >
          {{ totalRemainingAmount >= 0 ? '' : '-' }}{{ formatCurrency(Math.abs(totalRemainingAmount)) }}
        </p>
        <span class="text-[11px] text-ink/40 mt-0.5 block">
          {{ totalRemainingAmount >= 0 ? 'Saldo alokasi aman' : 'Melebihi total target!' }}
        </span>
      </div>

      <!-- Rata-rata Pemakaian -->
      <div class="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-ink/60">Status Alokasi</span>
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                overallPercentage >= 100
                  ? 'bg-rose-100 text-rose-700'
                  : overallPercentage >= 75
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-brand/10 text-brand-dark'
              ]"
            >
              {{ overallPercentage >= 100 ? 'Overbudget' : overallPercentage >= 75 ? 'Waspada' : 'Terkendali' }}
            </span>
          </div>
          <p class="text-base sm:text-xl font-bold font-mono text-ink mt-1">
            {{ overallPercentage }}%
          </p>
        </div>

        <!-- Overall Mini Progress Bar -->
        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="[
              overallPercentage >= 100
                ? 'bg-rose-500'
                : overallPercentage >= 75
                ? 'bg-amber-500'
                : 'bg-brand'
            ]"
            :style="{ width: `${Math.min(overallPercentage, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <SkeletonLoader v-if="isLoading" type="card" :count="3" cols="3" />

        <!-- Empty State -->
    <div
      v-else-if="currentMonthBudgets.length === 0"
      class="bg-surface rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs space-y-4"
    >
      <div class="w-16 h-16 mx-auto rounded-3xl bg-brand/10 flex items-center justify-center text-brand">
        <WalletCards class="w-8 h-8" />
      </div>
      <div class="max-w-md mx-auto space-y-1">
        <h3 class="text-base sm:text-lg font-bold text-ink">Belum Ada Anggaran untuk {{ monthName }}</h3>
        <p class="text-xs sm:text-sm text-ink/60">
          Buat batas anggaran baru per kategori atau salin alokasi anggaran dari bulan sebelumnya secara instan.
        </p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          @click="openAddModal"
          class="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-brand/20 transition-all ios-active-scale"
        >
          + Buat Anggaran Pertama
        </button>
        <button
          @click="openCopyModal"
          class="px-4 py-2.5 bg-card hover:bg-slate-200 text-ink rounded-xl font-bold text-xs sm:text-sm border border-slate-200 transition-all ios-active-scale"
        >
          Salin dari Bulan Lain
        </button>
      </div>
    </div>

    <!-- Budgets Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <div
        v-for="budget in currentMonthBudgets"
        :key="budget.id || budget.uuid || budget.categoryId"
        class="group relative bg-surface hover:bg-card/30 rounded-3xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-xs transition-all flex flex-col justify-between"
      >
        <!-- Card Header: Category & Actions -->
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <!-- Category Badge with Dot & Custom Color -->
            <div
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors"
              :style="getCategoryBadgeStyle(budget)"
            >
              <span
                v-if="budget.categoryColor"
                class="w-2 h-2 rounded-full shrink-0"
                :style="{ backgroundColor: budget.categoryColor }"
              ></span>
              <span class="truncate max-w-[130px] sm:max-w-[160px]">{{ budget.categoryName }}</span>
            </div>

            <!-- Action Buttons: Edit & Delete -->
            <div class="flex items-center gap-1">
              <button
                @click="openEditModal(budget)"
                class="p-1.5 text-ink/40 hover:text-brand hover:bg-card rounded-lg transition-colors ios-active-scale"
                title="Edit Anggaran"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                @click="handleDelete(budget)"
                class="p-1.5 text-ink/40 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ios-active-scale"
                title="Hapus Anggaran"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Budget Amount & Percentage Badge -->
          <div class="flex items-baseline justify-between gap-2 mt-2">
            <div>
              <span class="text-[11px] font-medium text-ink/50 block">Target Anggaran</span>
              <p class="text-xl sm:text-2xl font-extrabold font-mono text-ink tracking-tight">
                {{ formatCurrency(budget.amount) }}
              </p>
            </div>

            <div class="text-right">
              <span
                :class="[
                  'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full',
                  budget.percentage >= 100
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : budget.percentage >= 75
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-brand/10 text-brand-dark'
                ]"
              >
                <AlertTriangle v-if="budget.percentage >= 100" class="w-3 h-3" />
                <span>{{ budget.percentage }}%</span>
              </span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="[
                  budget.percentage >= 100
                    ? 'bg-rose-500'
                    : budget.percentage >= 75
                    ? 'bg-amber-500'
                    : 'bg-brand'
                ]"
                :style="{ width: `${Math.min(budget.percentage, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Card Footer: Details (Spent & Remaining) -->
        <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span class="text-ink/40 block text-[11px]">Terpakai</span>
            <span class="font-bold font-mono text-rose-600">
              {{ formatCurrency(budget.spent) }}
            </span>
          </div>

          <div class="text-right">
            <span class="text-ink/40 block text-[11px]">
              {{ budget.remaining >= 0 ? 'Sisa Batas' : 'Melebihi' }}
            </span>
            <span
              :class="[
                'font-bold font-mono',
                budget.remaining >= 0 ? 'text-brand' : 'text-rose-600 font-extrabold'
              ]"
            >
              {{ budget.remaining >= 0 ? '' : '+' }}{{ formatCurrency(Math.abs(budget.remaining)) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Create / Edit Budget -->
    <div v-if="showBudgetModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" @click="showBudgetModal = false"></div>
      <div class="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden pb-safe sm:pb-0 z-10">
        <!-- Grab handle on mobile -->
        <div class="sm:hidden w-full pt-3 pb-1 flex justify-center">
          <div class="w-12 h-1.5 bg-slate-300 rounded-full"></div>
        </div>

        <div class="px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-base sm:text-lg font-bold text-ink">
            {{ isEditing ? 'Edit Anggaran Kategori' : 'Buat Anggaran Baru' }}
          </h3>
          <button @click="showBudgetModal = false" class="text-ink/40 hover:text-ink p-1 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveBudgetForm" class="p-5 space-y-4">
          <!-- Category -->
          <div>
            <label class="block text-xs font-semibold text-ink/70 mb-1">Pilih Kategori</label>
            <select
              v-model="budgetForm.categoryId"
              :disabled="isEditing"
              required
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand bg-white text-ink disabled:bg-slate-100"
            >
              <option disabled value="">-- Pilih Kategori Pengeluaran --</option>
              <option
                v-for="cat in expenseCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Target Month -->
          <div>
            <label class="block text-xs font-semibold text-ink/70 mb-1">Bulan Anggaran</label>
            <div class="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-ink flex items-center justify-between">
              <span>{{ monthNames[budgetForm.month - 1] }} {{ selectedYear }}</span>
              <span class="text-ink/40 text-xs">Bulan ke-{{ budgetForm.month }}</span>
            </div>
          </div>

          <!-- Target Amount -->
          <div>
            <label class="block text-xs font-semibold text-ink/70 mb-1">Target Batas Anggaran (Rp)</label>
            <CurrencyInput
              v-model="budgetForm.amount"
              required
              placeholder="0"
              input-class="font-bold text-base sm:text-lg font-mono"
            />
          </div>

          <!-- Submit Buttons -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showBudgetModal = false"
              class="px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink/60 hover:bg-card rounded-xl transition-colors ios-active-scale"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-md shadow-brand/20 transition-all ios-active-scale disabled:opacity-50 flex items-center gap-1.5"
            >
              <span v-if="isSubmitting" class="animate-spin mr-1">?</span>
              <span>{{ isEditing ? 'Simpan Perubahan' : 'Buat Anggaran' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Copy Budgets -->
    <div v-if="showCopyModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" @click="showCopyModal = false"></div>
      <div class="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden pb-safe sm:pb-0 z-10">
        <!-- Grab handle on mobile -->
        <div class="sm:hidden w-full pt-3 pb-1 flex justify-center">
          <div class="w-12 h-1.5 bg-slate-300 rounded-full"></div>
        </div>

        <div class="px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Copy class="w-4 h-4 text-brand" />
            <h3 class="text-base sm:text-lg font-bold text-ink">Salin Anggaran Bulanan</h3>
          </div>
          <button @click="showCopyModal = false" class="text-ink/40 hover:text-ink p-1 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleCopyBudgets" class="p-5 space-y-4">
          <p class="text-xs text-ink/60 leading-relaxed">
            Salin seluruh nominal target kategori dari satu bulan ke bulan tujuan secara serentak tanpa perlu input ulang satu per satu.
          </p>

          <div class="grid grid-cols-2 gap-3">
            <!-- From Month -->
            <div>
              <label class="block text-xs font-semibold text-ink/70 mb-1">Dari Bulan (Sumber)</label>
              <select
                v-model="copyForm.fromMonth"
                required
                class="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand bg-white text-ink"
              >
                <option v-for="(name, idx) in monthNames" :key="idx" :value="monthDateOptions[idx]">
                  {{ name }} (Bulan {{ idx + 1 }})
                </option>
              </select>
            </div>

            <!-- To Month -->
            <div>
              <label class="block text-xs font-semibold text-ink/70 mb-1">Ke Bulan (Tujuan)</label>
              <select
                v-model="copyForm.toMonth"
                required
                class="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand bg-white text-ink"
              >
                <option v-for="(name, idx) in monthNames" :key="idx" :value="monthDateOptions[idx]">
                  {{ name }} (Bulan {{ idx + 1 }})
                </option>
              </select>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="showCopyModal = false"
              class="px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink/60 hover:bg-card rounded-xl transition-colors ios-active-scale"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-md shadow-brand/20 transition-all ios-active-scale disabled:opacity-50 flex items-center gap-1.5"
            >
              <span v-if="isSubmitting" class="animate-spin mr-1">?</span>
              <span>Salin Sekarang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import {
  Plus,
  Copy,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  AlertTriangle,
  WalletCards,
  Pencil,
  Trash2,
  X,
} from 'lucide-vue-next'
import CurrencyInput from '@/components/CurrencyInput.vue'
import { useFinanceStore } from '@/stores/finance'

const financeStore = useFinanceStore()

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Current selected date state
const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth()) // 0 - 11

const monthNumber = computed(() => selectedMonth.value + 1) // 1 - 12
const monthName = computed(() => `${monthNames[selectedMonth.value]} ${selectedYear.value}`)
const isCurrentMonth = computed(
  () => selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth()
)

const isLoading = ref(false)
const isRefreshing = ref(false)
const isSubmitting = ref(false)

// Modals
const showBudgetModal = ref(false)
const isEditing = ref(false)
const budgetForm = reactive({
  id: null,
  categoryId: '',
  month: '',
  amount: 0,
})

const showCopyModal = ref(false)
const copyForm = reactive({
  fromMonth: '',
  toMonth: '',
})

// Options date string untuk select copyModal (pakai selectedYear)
const monthDateOptions = computed(() =>
  monthNames.map((_, i) => {
    const mm = String(i + 1).padStart(2, '0')
    return selectedYear.value + '-' + mm + '-01'
  })
)

// Categories
const expenseCategories = computed(() => {
  return financeStore.categories.filter((c) => {
    const t = String(c.type || '').toUpperCase()
    return t === 'EXPENSE' || t === '2' || !t
  })
})

// Load Data for Selected Month
const loadBudgetData = async () => {
  isLoading.value = true
  try {
    const y = selectedYear.value
    const m = selectedMonth.value
    const from = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const lastDay = new Date(y, m + 1, 0).getDate()
    const to = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    await Promise.all([
      financeStore.fetchBudgets(from),
      financeStore.fetchTransactions(from, to),
      financeStore.fetchCategories(),
    ])
  } finally {
    isLoading.value = false
  }
}

const changeMonth = async (delta) => {
  let m = selectedMonth.value + delta
  let y = selectedYear.value

  if (m < 0) {
    m = 11
    y -= 1
  } else if (m > 11) {
    m = 0
    y += 1
  }

  selectedMonth.value = m
  selectedYear.value = y
  await loadBudgetData()
}

const resetToCurrentMonth = async () => {
  selectedYear.value = now.getFullYear()
  selectedMonth.value = now.getMonth()
  await loadBudgetData()
}

const refreshData = async () => {
  isRefreshing.value = true
  await loadBudgetData()
  isRefreshing.value = false
}

// Normalisasi field response BE ke format seragam
const currentMonthBudgets = computed(() => {
  const yymm = selectedYear.value + '-' + String(monthNumber.value).padStart(2, '0')

  const list = financeStore.budgets.filter((b) => {
    if (!b.month) return true
    return b.month.startsWith(yymm)
  })

  return list.map((b) => {
    const catId = b.categoryId
    const catName = b.category_name || b.categoryName || ''
    const color = b.category_color || b.categoryColor || ''
    const id = b.uuid || b.id

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
    const remaining = amount - spent
    const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0

    return {
      ...b,
      id,
      categoryId: catId,
      categoryName: catName || 'Kategori',
      categoryColor: color,
      amount,
      spent,
      remaining,
      percentage,
      month: b.month || (yymm + '-01'),
    }
  })
})
// Metrics Overview
const totalBudgetAmount = computed(() =>
  currentMonthBudgets.value.reduce((sum, b) => sum + b.amount, 0)
)

const totalSpentAmount = computed(() =>
  currentMonthBudgets.value.reduce((sum, b) => sum + b.spent, 0)
)

const totalRemainingAmount = computed(() =>
  totalBudgetAmount.value - totalSpentAmount.value
)

const overallPercentage = computed(() => {
  if (totalBudgetAmount.value <= 0) return 0
  return Math.round((totalSpentAmount.value / totalBudgetAmount.value) * 100)
})

// Overbudget alerts
const overbudgetCategories = computed(() =>
  currentMonthBudgets.value.filter((b) => b.percentage >= 100)
)

// Modal Add / Edit
const openAddModal = () => {
  isEditing.value = false
  budgetForm.id = null
  budgetForm.categoryId = expenseCategories.value[0]?.id || ''
  budgetForm.month = `${selectedYear.value}-${String(monthNumber.value).padStart(2, '0')}-01`
  budgetForm.amount = 0
  showBudgetModal.value = true
}

const openEditModal = (budget) => {
  isEditing.value = true
  budgetForm.id = budget.id
  budgetForm.categoryId = budget.categoryId
  budgetForm.month = budget.month || `${selectedYear.value}-${String(monthNumber.value).padStart(2, '0')}-01`
  budgetForm.amount = budget.amount
  showBudgetModal.value = true
}

const saveBudgetForm = async () => {
  if (navigator.vibrate) navigator.vibrate(15)
  isSubmitting.value = true

  const result = await financeStore.saveBudget({
    id: budgetForm.id,
    categoryId: budgetForm.categoryId,
    month: budgetForm.month,
    amount: Number(budgetForm.amount),
  })

  isSubmitting.value = false

  if (result.success) {
    showBudgetModal.value = false
    await loadBudgetData()
  } else {
    alert(result.error || 'Gagal menyimpan anggaran.')
  }
}

const handleDelete = async (budget) => {
  const name = budget.categoryName || 'anggaran ini'
  if (!window.confirm(`Hapus anggaran untuk ${name}? Batas pengeluaran ini akan dihapus.`)) {
    return
  }

  if (navigator.vibrate) navigator.vibrate(15)
  const result = await financeStore.deleteBudget(budget.id)
  if (result.success) {
    await loadBudgetData()
  } else {
    alert(result.error || 'Gagal menghapus anggaran.')
  }
}

// Modal Copy Budgets
const openCopyModal = () => {
  const y = selectedYear.value
  const m = monthNumber.value
  const prevM = m === 1 ? 12 : m - 1
  const prevY = m === 1 ? y - 1 : y
  copyForm.fromMonth = `${prevY}-${String(prevM).padStart(2, '0')}-01`
  copyForm.toMonth = `${y}-${String(m).padStart(2, '0')}-01`
  showCopyModal.value = true
}

const handleCopyBudgets = async () => {
  if (copyForm.fromMonth === copyForm.toMonth) {
    alert('Bulan sumber dan bulan tujuan tidak boleh sama.')
    return
  }

  if (navigator.vibrate) navigator.vibrate(15)
  isSubmitting.value = true

  const result = await financeStore.copyBudgets({
    fromMonth: copyForm.fromMonth,
    toMonth: copyForm.toMonth,
  })

  isSubmitting.value = false

  if (result.success) {
    showCopyModal.value = false
    const toMonthIdx = Number(copyForm.toMonth.split('-')[1]) - 1
    alert(`Berhasil menyalin anggaran ke bulan ${monthNames[toMonthIdx]}!`)
    const currentDateStr = `${selectedYear.value}-${String(monthNumber.value).padStart(2, '0')}-01`
    if (copyForm.toMonth === currentDateStr) {
      await loadBudgetData()
    }
  } else {
    alert(result.error || 'Gagal menyalin anggaran.')
  }
}

const getCategoryBadgeStyle = (budget) => {
  if (budget.categoryColor) {
    return {
      backgroundColor: budget.categoryColor + '18',
      color: budget.categoryColor,
      borderColor: budget.categoryColor + '40',
    }
  }
  return {
    backgroundColor: '#F1F5F9',
    color: '#334155',
    borderColor: '#E2E8F0',
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val || 0))
}

onMounted(async () => {
  await loadBudgetData()
})
</script>
