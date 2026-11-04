<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <!-- Backdrop with blur -->
    <div
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Modal Box (iOS Bottom Sheet style on mobile, centered card on desktop) -->
    <div class="relative bg-surface w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all pb-safe sm:pb-0 max-h-[90vh] flex flex-col">
      <!-- iOS Pull / Grab Bar on Mobile -->
      <div class="sm:hidden w-full pt-3 pb-1 flex justify-center">
        <div class="w-12 h-1.5 bg-slate-300 rounded-full"></div>
      </div>

      <div class="px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-base sm:text-lg font-bold text-ink">Catat Transaksi</h3>
        <button
          @click="$emit('close')"
          class="text-ink/40 hover:text-ink rounded-full p-1.5 hover:bg-card transition-colors ios-active-scale"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-5 space-y-4 overflow-y-auto">
        <!-- Type Selection (Pemasukan / Pengeluaran) iOS Segmented Control style -->
        <div class="grid grid-cols-2 gap-1.5 p-1 bg-card rounded-2xl">
          <button
            type="button"
            @click="form.type = 'EXPENSE'"
            :class="[
              'py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ios-active-scale',
              form.type === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-ink/60 hover:text-ink'
            ]"
          >
            <ArrowDownLeft class="w-4 h-4" />
            Pengeluaran
          </button>
          <button
            type="button"
            @click="form.type = 'INCOME'"
            :class="[
              'py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ios-active-scale',
              form.type === 'INCOME'
                ? 'bg-brand text-white shadow-sm'
                : 'text-ink/60 hover:text-ink'
            ]"
          >
            <ArrowUpRight class="w-4 h-4" />
            Pemasukan
          </button>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-xs font-semibold text-ink/70 mb-1">Judul Transaksi</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Contoh: Makan siang, Gaji, Kopi..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm bg-card focus:bg-surface text-ink transition-colors"
          />
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-xs font-semibold text-ink/70 mb-1">Jumlah Nominal (Rp)</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 font-bold text-sm">Rp</span>
            <input
              v-model.number="form.amount"
              type="number"
              min="1"
              required
              placeholder="0"
              class="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-base font-bold bg-card focus:bg-surface text-ink transition-colors"
            />
          </div>
        </div>

        <!-- Category & Wallet Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-ink/70 mb-1">Kategori</label>
            <select
              v-model="form.category"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-xs sm:text-sm bg-surface text-ink"
            >
              <option v-for="cat in financeStore.categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-ink/70 mb-1">Sumber Rekening</label>
            <select
              v-model="form.wallet"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-xs sm:text-sm bg-surface text-ink"
            >
              <option v-for="w in financeStore.wallets" :key="w.id" :value="w.name">
                {{ w.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Date -->
        <div>
          <label class="block text-xs font-semibold text-ink/70 mb-1">Tanggal</label>
          <input
            v-model="form.date"
            type="date"
            required
            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-xs sm:text-sm bg-surface text-ink"
          />
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-xs font-semibold text-ink/70 mb-1">Catatan Tambahan</label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="Keterangan opsional..."
            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-xs sm:text-sm bg-card focus:bg-surface text-ink transition-colors"
          ></textarea>
        </div>

        <!-- Submit Buttons -->
        <div class="flex items-center justify-end gap-2 pt-2 pb-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink/60 hover:bg-card rounded-xl transition-colors ios-active-scale"
          >
            Batal
          </button>
          <button
            type="submit"
            class="flex-1 sm:flex-none px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-md shadow-brand/20 transition-all ios-active-scale"
          >
            Simpan Transaksi
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { X, ArrowUpRight, ArrowDownLeft } from 'lucide-vue-next'
import { useFinanceStore } from '@/stores/finance'

const props = defineProps({
  isOpen: Boolean,
})
const emit = defineEmits(['close'])

const financeStore = useFinanceStore()
const today = new Date().toISOString().split('T')[0]

const form = reactive({
  title: '',
  amount: '',
  type: 'EXPENSE',
  category: financeStore.categories[0] || 'Kebutuhan',
  wallet: financeStore.wallets[0]?.name || 'BCA Utama',
  date: today,
  notes: '',
})

watch(() => props.isOpen, (open) => {
  if (open) {
    form.title = ''
    form.amount = ''
    form.notes = ''
    form.date = new Date().toISOString().split('T')[0]
  }
})

const handleSubmit = async () => {
  if (navigator.vibrate) navigator.vibrate(15)
  await financeStore.addTransaction({
    title: form.title,
    amount: Number(form.amount),
    type: form.type,
    category: form.category,
    wallet: form.wallet,
    date: form.date,
    notes: form.notes,
  })
  emit('close')
}
</script>
