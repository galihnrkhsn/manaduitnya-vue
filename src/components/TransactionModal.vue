<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <!-- Backdrop with blur -->
    <div
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Modal Box (iOS Bottom Sheet style on mobile, centered card on desktop) -->
    <div class="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all pb-safe sm:pb-0 max-h-[92vh] flex flex-col">
      <!-- iOS Pull Grab Bar on Mobile -->
      <div class="sm:hidden w-full pt-3 pb-1 flex justify-center">
        <div class="w-12 h-1.5 bg-slate-300 rounded-full"></div>
      </div>

      <div class="px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-800">Catat Transaksi</h3>
          <p class="text-xs text-slate-400">Tambahkan catatan arus kas atau transfer antar dompet</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 rounded-full p-1.5 hover:bg-slate-100 transition-colors ios-active-scale"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-5 space-y-4 overflow-y-auto">
        <!-- 3 Types Segmented Control -->
        <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            @click="setType('EXPENSE')"
            :class="[
              'py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1 transition-all ios-active-scale',
              form.type === 'EXPENSE'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            <ArrowDownLeft class="w-3.5 h-3.5" />
            <span>Pengeluaran</span>
          </button>

          <button
            type="button"
            @click="setType('INCOME')"
            :class="[
              'py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1 transition-all ios-active-scale',
              form.type === 'INCOME'
                ? 'bg-brand text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            <ArrowUpRight class="w-3.5 h-3.5" />
            <span>Pemasukan</span>
          </button>

          <button
            type="button"
            @click="setType('TRANSFER')"
            :class="[
              'py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1 transition-all ios-active-scale',
              form.type === 'TRANSFER'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            <ArrowLeftRight class="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Jumlah Nominal (Rp)</label>
          <CurrencyInput
            v-model="form.amount"
            required
            placeholder="0"
            input-class="font-bold text-base sm:text-lg font-mono"
          />
        </div>

        <!-- Category (Only for non-transfer) -->
        <div v-if="form.type !== 'TRANSFER'">
          <label class="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
          <select
            v-model="form.categoryId"
            required
            class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-xs sm:text-sm bg-white"
          >
            <option v-for="cat in filteredCategories" :key="cat.id || cat.name || cat" :value="cat.id || cat.name">
              {{ cat.name || cat }}
            </option>
          </select>
        </div>

        <!-- Wallets Grid (walletId & toWalletId) -->
        <div :class="form.type === 'TRANSFER' ? 'grid grid-cols-2 gap-3' : 'space-y-1'">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">
              {{ form.type === 'TRANSFER' ? 'Dompet Sumber (Asal)' : 'Dompet / Rekening' }}
            </label>
            <select
              v-model="form.walletId"
              required
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-xs sm:text-sm bg-white"
            >
              <option v-for="w in financeStore.wallets" :key="w.id" :value="w.id">
                {{ w.name }} ({{ formatCurrency(w.balance) }})
              </option>
            </select>
          </div>

          <div v-if="form.type === 'TRANSFER'">
            <label class="block text-xs font-semibold text-slate-600 mb-1">Dompet Tujuan</label>
            <select
              v-model="form.toWalletId"
              required
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-xs sm:text-sm bg-white"
            >
              <option v-for="w in financeStore.wallets" :key="w.id" :value="w.id">
                {{ w.name }} ({{ formatCurrency(w.balance) }})
              </option>
            </select>
          </div>
        </div>

        <!-- Datetime (Waktu & Tanggal) -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Waktu & Tanggal Transaksi</label>
          <input
            v-model="form.datetime"
            type="datetime-local"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-xs sm:text-sm bg-white"
          />
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Catatan (Opsional)</label>
          <input v-model="form.notes" type="text" placeholder="cth. Makan siang, Gaji bulan ini..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm bg-slate-50/50 focus:bg-white transition-colors" />
        </div>

                <!-- Submit Buttons -->
        <div class="flex items-center justify-end gap-2 pt-2 pb-2">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="isSubmitting"
            class="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors ios-active-scale"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 sm:flex-none px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-md shadow-brand/20 transition-all ios-active-scale disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span v-if="isSubmitting" class="animate-spin mr-1">?</span>
            <span>Simpan Transaksi</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed, ref } from 'vue'
import { X, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-vue-next'
import CurrencyInput from '@/components/CurrencyInput.vue'
import { useFinanceStore } from '@/stores/finance'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close'])

const financeStore = useFinanceStore()
const isSubmitting = ref(false)

const getNowDatetimeLocal = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  const local = new Date(now.getTime() - offset)
  return local.toISOString().slice(0, 16)
}

const form = reactive({
  amount: '',
  type: 'EXPENSE',
  categoryId: '',
  walletId: '',
  toWalletId: '',
  datetime: getNowDatetimeLocal(),
  notes: '',
})

// Kategori difilter sesuai tipe (Expense / Income)
const filteredCategories = computed(() => {
  const list = financeStore.categories
  if (!list.length) return [{ id: 1, name: 'Umum' }]
  const matching = list.filter((c) => c.type?.toUpperCase() === form.type)
  return matching.length > 0 ? matching : list
})

const setType = (newType) => {
  form.type = newType
  if (newType !== 'TRANSFER' && filteredCategories.value.length > 0) {
    if (!filteredCategories.value.some((c) => (c.id || c.name) === form.categoryId)) {
      form.categoryId = filteredCategories.value[0]?.id || filteredCategories.value[0]?.name || ''
    }
  }
}

// Reset form saat modal dibuka
watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return

    form.amount = ''
    form.type = 'EXPENSE'
    form.notes = ''
    form.datetime = getNowDatetimeLocal()

    if (financeStore.categories.length === 0) await financeStore.fetchCategories()

    // Default walletId & toWalletId
    if (financeStore.wallets.length > 0) {
      form.walletId = financeStore.wallets[0].id
      form.toWalletId = financeStore.wallets[1]?.id || financeStore.wallets[0].id
    }
    if (filteredCategories.value.length > 0) {
      form.categoryId = filteredCategories.value[0].id || filteredCategories.value[0].name
    }
  }
)

watch(
  [filteredCategories, () => financeStore.wallets],
  () => {
    if (form.type !== 'TRANSFER' && filteredCategories.value.length > 0) {
      if (!filteredCategories.value.some((c) => (c.id || c.name) === form.categoryId)) {
        form.categoryId = filteredCategories.value[0].id || filteredCategories.value[0].name
      }
    }
    if (financeStore.wallets.length > 0) {
      if (!financeStore.wallets.some((w) => w.id === form.walletId)) {
        form.walletId = financeStore.wallets[0].id
      }
      if (!financeStore.wallets.some((w) => w.id === form.toWalletId)) {
        form.toWalletId = financeStore.wallets[1]?.id || financeStore.wallets[0].id
      }
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (navigator.vibrate) navigator.vibrate(15)
  isSubmitting.value = true

  const numericType = form.type === 'INCOME' ? 1 : form.type === 'TRANSFER' ? 3 : 2
  const selectedWalletObj = financeStore.wallets.find((w) => w.id === form.walletId)
  const pad = (n) => String(n).padStart(2, '0')
  const dt = new Date(form.datetime)
  const transactionDate = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`

  const payload = {
    walletId: form.walletId,
    type: numericType,
    amount: Number(form.amount),
    note: form.notes || '',
    transactionDate,
  }

  if (form.type === 'TRANSFER') {
    payload.toWalletId = form.toWalletId
  } else {
    payload.categoryId = form.categoryId
  }

  const result = await financeStore.addTransaction(payload)
  isSubmitting.value = false

  if (result.success) {
    emit('close')
  } else {
    alert(result.error || 'Gagal menyimpan transaksi.')
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val || 0))
}
</script>
