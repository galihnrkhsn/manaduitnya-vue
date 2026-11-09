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

      <!-- Modal Header -->
      <div class="px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-800">Detail & Edit Transaksi</h3>
          <p class="text-xs text-slate-400">Perbarui rincian atau hapus catatan transaksi</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 rounded-full p-1.5 hover:bg-slate-100 transition-colors ios-active-scale"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Form -->
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

        <!-- Title -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Judul / Keterangan Singkat</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Contoh: Makan siang, Gaji, Top-up e-wallet..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm bg-slate-50/50 focus:bg-white transition-colors"
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
            <option v-for="cat in availableCategories" :key="cat.id || cat.name || cat" :value="cat.id || cat.name">
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
          <label class="block text-xs font-semibold text-slate-600 mb-1">Catatan Tambahan (Opsional)</label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="Tulis catatan kecil jika diperlukan..."
            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand text-xs sm:text-sm bg-slate-50/50 focus:bg-white transition-colors"
          ></textarea>
        </div>

        <!-- Actions Bar: Delete on left, Cancel & Save on right -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
          <!-- Delete button with confirmation -->
          <button
            type="button"
            @click="handleDelete"
            :disabled="isSubmitting"
            class="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200/80 transition-colors ios-active-scale disabled:opacity-50"
            title="Hapus Transaksi"
          >
            <Trash2 class="w-4 h-4" />
            <span>Hapus</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="$emit('close')"
              :disabled="isSubmitting"
              class="px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors ios-active-scale"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-md shadow-brand/20 transition-all ios-active-scale disabled:opacity-50 flex items-center gap-1.5"
            >
              <span v-if="isSubmitting" class="animate-spin mr-1">⌛</span>
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed, ref } from 'vue'
import { X, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Trash2 } from 'lucide-vue-next'
import CurrencyInput from '@/components/CurrencyInput.vue'
import { useFinanceStore } from '@/stores/finance'

const props = defineProps({
  isOpen: Boolean,
  transaction: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'updated', 'deleted'])

const financeStore = useFinanceStore()
const isSubmitting = ref(false)

const getNowDatetimeLocal = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  const local = new Date(now.getTime() - offset)
  return local.toISOString().slice(0, 16)
}

const formatDatetimeLocal = (raw) => {
  if (!raw) return getNowDatetimeLocal()
  const d = new Date(raw)
  if (isNaN(d.getTime())) return getNowDatetimeLocal()
  const offset = d.getTimezoneOffset() * 60000
  const local = new Date(d.getTime() - offset)
  return local.toISOString().slice(0, 16)
}

const form = reactive({
  id: null,
  title: '',
  amount: 0,
  type: 'EXPENSE',
  categoryId: '',
  walletId: '',
  toWalletId: '',
  datetime: getNowDatetimeLocal(),
  notes: '',
})

const getTxType = (tx) => {
  if (!tx) return 'EXPENSE'
  if (tx.isTransfer || tx.destinationWalletId || (tx.fromWallet && tx.toWallet) || (tx.fromWalletName && tx.toWalletName)) {
    return 'TRANSFER'
  }
  const val = tx.type
  if (val === 1 || val === 'INCOME' || String(val).toUpperCase() === 'INCOME') return 'INCOME'
  if (val === 3 || val === 'TRANSFER' || String(val).toUpperCase() === 'TRANSFER') return 'TRANSFER'
  if (val === 2 || val === 'EXPENSE' || String(val).toUpperCase() === 'EXPENSE') return 'EXPENSE'
  return 'EXPENSE'
}

const setType = (newType) => {
  form.type = newType
  // Sesuaikan categoryId jika kategori saat ini tidak cocok dengan tipe baru
  if (newType !== 'TRANSFER' && availableCategories.value.length > 0) {
    if (!availableCategories.value.some((c) => (c.id || c.name) === form.categoryId)) {
      form.categoryId = availableCategories.value[0]?.id || availableCategories.value[0]?.name || ''
    }
  }
}

// Available categories filtered by current type
const availableCategories = computed(() => {
  const list = financeStore.categories
  if (!list.length) return [{ id: 1, name: 'Umum' }]
  const matching = list.filter((c) => c.type?.toUpperCase() === form.type)
  return matching.length > 0 ? matching : list
})

watch(
  () => props.isOpen,
  (open) => {
    if (!open || !props.transaction) return

    const tx = props.transaction
    form.id = tx.id || tx.transactionId || tx.uuid
    form.title = tx.title || (getTxType(tx) === 'TRANSFER' ? 'Transfer Saldo' : tx.categoryName || '')
    form.amount = Number(tx.amount || 0)
    form.type = getTxType(tx)

    // Wallet ID
    const foundWallet = financeStore.wallets.find((w) => w.id === tx.walletId || w.name === tx.walletName || w.name === tx.wallet)
    form.walletId = foundWallet ? foundWallet.id : (financeStore.wallets[0]?.id || '')

    // Destination Wallet ID (for Transfer)
    const foundToWallet = financeStore.wallets.find(
      (w) => w.id === tx.toWalletId || w.id === tx.destinationWalletId || w.name === tx.toWalletName || w.name === tx.destinationWalletName
    )
    form.toWalletId = foundToWallet ? foundToWallet.id : (financeStore.wallets[1]?.id || financeStore.wallets[0]?.id || '')

    // Category ID (for non-transfer)
    const foundCat = financeStore.categories.find((c) => c.id === tx.categoryId || c.name === tx.categoryName || c.name === tx.category)
    form.categoryId = foundCat ? (foundCat.id || foundCat.name) : (availableCategories.value[0]?.id || availableCategories.value[0]?.name || '')

    // Datetime
    const rawDate = tx.transactionDate || tx.date
    form.datetime = formatDatetimeLocal(rawDate)

    form.notes = tx.notes || tx.description || ''
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (navigator.vibrate) navigator.vibrate(15)
  isSubmitting.value = true

  const numericType = form.type === 'INCOME' ? 1 : form.type === 'TRANSFER' ? 3 : 2

  const selectedWalletObj = financeStore.wallets.find((w) => w.id === form.walletId)
  const selectedToWalletObj = financeStore.wallets.find((w) => w.id === form.toWalletId)
  const selectedCategoryObj = financeStore.categories.find((c) => (c.id || c.name) === form.categoryId)

  const payload = {
    id: form.id,
    title: form.title,
    amount: Number(form.amount),
    type: numericType,
    walletId: form.walletId,
    walletName: selectedWalletObj?.name || '',
    wallet: selectedWalletObj?.name || '',
    transactionDate: new Date(form.datetime).toISOString(),
    date: form.datetime,
    notes: form.notes,
    description: form.notes,
  }

  if (form.type === 'TRANSFER') {
    payload.toWalletId = form.toWalletId
    payload.destinationWalletId = form.toWalletId
    payload.toWalletName = selectedToWalletObj?.name || ''
    payload.destinationWalletName = selectedToWalletObj?.name || ''
    payload.toWallet = selectedToWalletObj?.name || ''
  } else {
    payload.categoryId = form.categoryId
    payload.categoryName = selectedCategoryObj?.name || (typeof form.categoryId === 'string' ? form.categoryId : '')
    payload.category = payload.categoryName
    if (selectedCategoryObj?.color || selectedCategoryObj?.categoryColor) {
      payload.categoryColor = selectedCategoryObj.color || selectedCategoryObj.categoryColor
    }
  }

  const result = await financeStore.updateTransaction(form.id, payload)
  isSubmitting.value = false

  if (result.success) {
    emit('updated', result.data || payload)
    emit('close')
  } else {
    alert(result.error || 'Gagal memperbarui transaksi.')
  }
}

const handleDelete = async () => {
  const title = form.title || 'transaksi ini'
  if (!window.confirm(`Yakin ingin menghapus ${title}? Tindakan ini tidak dapat dibatalkan.`)) {
    return
  }

  if (navigator.vibrate) navigator.vibrate(15)
  isSubmitting.value = true

  const result = await financeStore.deleteTransaction(form.id)
  isSubmitting.value = false

  if (result.success) {
    emit('deleted', form.id)
    emit('close')
  } else {
    alert(result.error || 'Gagal menghapus transaksi.')
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
