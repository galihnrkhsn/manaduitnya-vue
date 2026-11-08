import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/api'

export const useFinanceStore = defineStore('finance', () => {
  const categories    = ref([])
  const summary       = ref(null)
  const budgets       = ref([])
  const masterLoaded  = ref(false)
  let masterPromise   = null
  
  const loading = ref(false)
  const error = ref(null)

  const transactions = computed(() => summary.value?.recentTransactions ?? [])
  const wallets      = computed(() => summary.value?.wallets ?? [])
  const totalBalance = computed(() => Number(summary.value?.totalBalance ?? 0))
  const totalIncome  = computed(() => Number(summary.value?.income ?? 0))
  const totalExpense = computed(() => Number(summary.value?.expense ?? 0))
  const netAmount    = computed(() => Number(summary.value?.net ?? 0))
  const quotes       = computed(() => summary.value?.quotes ?? [])

  // const fetchTransactions = async () => {
  //   loading.value = true
  //   error.value = null
  //   try {
  //     const response = await apiClient.get('/transactions')
  //     const data = response.data?.data || response.data
  //     if (Array.isArray(data)) {
  //       transactions.value = data
  //     }
  //   } catch (err) {
  //     error.value = err.response?.data?.message || 'Gagal memuat transaksi.'
  //   } finally {
  //     loading.value = false
  //   }
  // }

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/categories')
      const data = response.data?.data || response.data
      if (Array.isArray(data)) {
        categories.value = data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal memuat kategori.'
    } finally {
      loading.value = false
    }
  }

  // const fetchWallets = async () => {
  //   loading.value = true
  //   error.value = null
  //   try {
  //     const response = await apiClient.get('/wallets')
  //     const data = response.data?.data || response.data
  //     if (Array.isArray(data)) {
  //       wallets.value = data
  //     }
  //   } catch (err) {
  //     error.value = err.response?.data?.message || 'Gagal memuat dompet.'
  //   } finally {
  //     loading.value = false
  //   }
  // }

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

  const initialized = ref(false)
  const loadInitialData = async () => {
    if (initialized.value) return
    initialized.value = true
    await Promise.all([fetchCategories()])
    if (error.value) initialized.value = false
  }

  const reset = () => {
    transactions.value = []
    wallets.value = []
    categories.value = []
    error.value = null
    initialized.value = false
    budgets.value = []
    summary.value = null
    masterLoaded.value = false
    error.value = null
  }

  const fetchSummary = async (from, to) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/reports/summary', {
        params: { from, to },
      })
      const data = response.data?.data || response.data
      if (data && typeof data === 'object') {
        summary.value = data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal memuat summary.'
    } finally {
      loading.value = false
    }
  }

  const fetchBudgets = async () => {
    const response = await apiClient.get('budgets')
    const data = response.data?.data || response.data
    if (Array.isArray(data)) budgets.value = data
  }

  const loadMasterData = async ({force = false} = {}) => {
    if (masterLoaded.value && !force) return
    if (masterPromise) return masterPromise

    masterPromise = Promise.all([fetchCategories(), fetchBudgets()])
      .then(() => {masterLoaded.value = !error.value})
      .finally(() => {masterPromise = null})

      return masterPromise
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
    netAmount,
    quotes,
    fetchCategories,
    addTransaction,
    deleteTransaction,
    reset,
    loadInitialData,
    fetchSummary,
    loadMasterData,
  }
})
