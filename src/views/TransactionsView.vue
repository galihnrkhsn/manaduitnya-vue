<template>
  <div class="space-y-6">
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-ink">Semua Transaksi</h1>
        <p class="text-xs text-ink/60 mt-1">Kelola dan telusuri riwayat keuangan Anda secara detail.</p>
      </div>

      <button
        @click="$emit('open-add-modal')"
        class="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-sm shadow-md shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus class="w-4 h-4" />
        Tambah Transaksi
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari transaksi berdasarkan judul..."
          class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand bg-card focus:bg-surface text-ink transition-colors"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Type Filter -->
        <select
          v-model="selectedType"
          class="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-surface focus:outline-none focus:ring-2 focus:ring-brand text-ink"
        >
          <option value="ALL">Semua Jenis</option>
          <option value="INCOME">Pemasukan Saja</option>
          <option value="EXPENSE">Pengeluaran Saja</option>
        </select>

        <!-- Category Filter -->
        <select
          v-model="selectedCategory"
          class="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-surface focus:outline-none focus:ring-2 focus:ring-brand text-ink"
        >
          <option value="ALL">Semua Kategori</option>
          <option v-for="cat in financeStore.categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
    </div>

    <!-- Transactions Table / List -->
    <div class="bg-surface rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
      <div v-if="filteredTransactions.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 bg-card/60 text-[11px] font-bold text-ink/60 uppercase tracking-wider">
              <th class="py-3 px-4 sm:px-6">Deskripsi</th>
              <th class="py-3 px-4">Kategori</th>
              <th class="py-3 px-4">Dompet / Akun</th>
              <th class="py-3 px-4">Tanggal</th>
              <th class="py-3 px-4 sm:px-6 text-right">Jumlah (Rp)</th>
              <th class="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr
              v-for="tx in filteredTransactions"
              :key="tx.id"
              class="hover:bg-card/50 transition-colors"
            >
              <td class="py-3.5 px-4 sm:px-6">
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      tx.type === 'INCOME' ? 'bg-brand/10 text-brand' : 'bg-rose-50 text-rose-500'
                    ]"
                  >
                    <ArrowUpRight v-if="tx.type === 'INCOME'" class="w-4 h-4" />
                    <ArrowDownLeft v-else class="w-4 h-4" />
                  </div>
                  <div>
                    <span class="font-semibold text-ink">{{ tx.title }}</span>
                    <p v-if="tx.notes" class="text-xs text-ink/40 mt-0.5">{{ tx.notes }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-card text-ink/80">
                  {{ tx.category }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-ink/70 font-medium">
                {{ tx.wallet }}
              </td>
              <td class="py-3.5 px-4 text-ink/50 text-xs">
                {{ formatDate(tx.date) }}
              </td>
              <td class="py-3.5 px-4 sm:px-6 text-right font-bold">
                <span :class="tx.type === 'INCOME' ? 'text-brand' : 'text-ink'">
                  {{ tx.type === 'INCOME' ? '+' : '-' }} {{ formatCurrency(tx.amount) }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <button
                  @click="financeStore.deleteTransaction(tx.id)"
                  title="Hapus Transaksi"
                  class="p-1.5 text-ink/40 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty Filter Result -->
      <div v-else class="text-center py-16">
        <Receipt class="w-12 h-12 text-ink/30 mx-auto mb-2" />
        <h3 class="text-sm font-bold text-ink/70">Tidak ada transaksi ditemukan</h3>
        <p class="text-xs text-ink/40 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Search, Trash2, ArrowUpRight, ArrowDownLeft, Receipt } from 'lucide-vue-next'
import { useFinanceStore } from '@/stores/finance'

defineEmits(['open-add-modal'])

const financeStore = useFinanceStore()
const searchQuery = ref('')
const selectedType = ref('ALL')
const selectedCategory = ref('ALL')

const filteredTransactions = computed(() => {
  return financeStore.transactions.filter((tx) => {
    // Type filter
    if (selectedType.value !== 'ALL' && tx.type !== selectedType.value) return false
    // Category filter
    if (selectedCategory.value !== 'ALL' && tx.category !== selectedCategory.value) return false
    // Search query
    if (searchQuery.value.trim() !== '') {
      const q = searchQuery.value.toLowerCase()
      const matchTitle = tx.title?.toLowerCase().includes(q)
      const matchNotes = tx.notes?.toLowerCase().includes(q)
      if (!matchTitle && !matchNotes) return false
    }
    return true
  })
})

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
    year: 'numeric',
  }).format(date)
}
</script>
