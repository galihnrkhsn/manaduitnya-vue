import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/api'

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref([])

  const wallets = ref([])

  const categories = ref([
    'Gaji',
    'Bonus',
    'Investasi',
    'Makanan & Minuman',
    'Kebutuhan',
    'Transportasi',
    'Tagihan',
    'Hiburan',
    'Kesehatan',
    'Lainnya',
  ])

  const loading = ref(false)
  const error = ref(null)

  // Computed statistics
  const totalBalance = computed(() => {
    return wallets.value.reduce((acc, w) => acc + Number(w.balance || 0), 0)
  })

  const totalIncome = computed(() => {
    return transactions.value
      .filter((t) => t.type === 'INCOME')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  })

  const totalExpense = computed(() => {
    return transactions.value
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  })

  const fetchTransactions = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/transactions')
      const data = response.data?.data || response.data
      if (Array.isArray(data)) {
        transactions.value = data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal memuat transaksi.'
    } finally {
      loading.value = false
    }
  }

  const fetchWallets = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/wallets')
      const data = response.data?.data || response.data
      if (Array.isArray(data)) {
        wallets.value = data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal memuat dompet.'
    } finally {
      loading.value = false
    }
  }

  const addTransaction = async (txData) => {
    try {
      const response = await apiClient.post('/transactions', txData)
      const newTx = response.data?.data || response.data
      transactions.value.unshift(newTx)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal menyimpan transaksi.' }
    }
  }

  const deleteTransaction = async (id) => {
    try {
      await apiClient.delete(`/transactions/${id}`)
      transactions.value = transactions.value.filter((t) => t.id !== id)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal menghapus transaksi.' }
    }
  }

  const reset = () => {
    transactions.value = []
    wallets.value = []
    error.value = null
  }

  return {
    transactions,
    wallets,
    categories,
    loading,
    error,
    totalBalance,
    totalIncome,
    totalExpense,
    fetchTransactions,
    fetchWallets,
    addTransaction,
    deleteTransaction,
    reset,
  }
})
