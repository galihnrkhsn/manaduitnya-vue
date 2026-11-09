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

  const rawTransactions = ref([])
  const transactions = computed(() => {
    if (rawTransactions.value.length > 0) {
      return rawTransactions.value
    }
    return summary.value?.recentTransactions ?? []
  })
  const wallets      = computed(() => summary.value?.wallets ?? [])
  const totalBalance = computed(() => Number(summary.value?.totalBalance ?? 0))
  const totalIncome  = computed(() => Number(summary.value?.income ?? 0))
  const totalExpense = computed(() => Number(summary.value?.expense ?? 0))
  const netAmount    = computed(() => Number(summary.value?.net ?? 0))
  const quotes       = computed(() => summary.value?.quotes ?? [])

  const fetchTransactions = async (from, to) => {
    loading.value = true
    error.value = null
    try {
      const params = {}
      if (from) {
        params.from = from
        params.startDate = from
      }
      if (to) {
        params.to = to
        params.endDate = to
      }
      const response = await apiClient.get('/transactions', { params })
      const data = response.data?.data || response.data
      if (Array.isArray(data)) {
        rawTransactions.value = data
      }
    } catch (err) {
      // Fallback ke fetchSummary jika /transactions butuh query atau fallback
      const now = new Date()
      const fallbackFrom = from || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const fallbackTo = to || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`
      await fetchSummary(fallbackFrom, fallbackTo)
      error.value = err.response?.data?.message || null
    } finally {
      loading.value = false
    }
  }

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
      if (Array.isArray(rawTransactions.value)) {
        rawTransactions.value.unshift(newTx)
      }
      if (summary.value?.recentTransactions && Array.isArray(summary.value.recentTransactions)) {
        summary.value.recentTransactions.unshift(newTx)
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal menyimpan transaksi.' }
    }
  }

  const updateTransaction = async (id, txData) => {
    try {
      const response = await apiClient.put(`/transactions/${id}`, txData)
      const updatedTx = response.data?.data || response.data || { id, ...txData }
      const idx = rawTransactions.value.findIndex((t) => (t.id === id || t.transactionId === id))
      if (idx !== -1) {
        rawTransactions.value[idx] = { ...rawTransactions.value[idx], ...updatedTx }
      }
      if (summary.value?.recentTransactions) {
        const sIdx = summary.value.recentTransactions.findIndex((t) => (t.id === id || t.transactionId === id))
        if (sIdx !== -1) {
          summary.value.recentTransactions[sIdx] = { ...summary.value.recentTransactions[sIdx], ...updatedTx }
        }
      }
      return { success: true, data: updatedTx }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal memperbarui transaksi.' }
    }
  }

  const deleteTransaction = async (id) => {
    try {
      await apiClient.delete(`/transactions/${id}`)
      rawTransactions.value = rawTransactions.value.filter((t) => t.id !== id)
      if (summary.value?.recentTransactions) {
        summary.value.recentTransactions = summary.value.recentTransactions.filter((t) => t.id !== id)
      }
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
    rawTransactions.value = []
    wallets.value = []
    categories.value = []
    error.value = null
    initialized.value = false
    budgets.value = []
    summary.value = null
    masterLoaded.value = false
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

  const fetchBudgets = async (month) => {
    try {
      const params = month !== undefined ? { month } : {}
      const response = await apiClient.get('/budgets', { params })
      const data = response.data?.data || response.data
      if (Array.isArray(data)) {
        budgets.value = data
      }
      return { success: true, data: budgets.value }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal memuat anggaran.' }
    }
  }

  const getBudget = async (id) => {
    try {
      const response = await apiClient.get(`/budgets/${id}`)
      return { success: true, data: response.data?.data || response.data }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal memuat detail anggaran.' }
    }
  }

  const saveBudget = async (payload) => {
    try {
      // PUT /budgets (create & edit) {categoryId, Month, Amount}
      const body = {
        categoryId: payload.categoryId,
        Month: Number(payload.month),
        month: Number(payload.month),
        Amount: Number(payload.amount),
        amount: Number(payload.amount),
      }
      if (payload.id) {
        body.id = payload.id
        body.uuid = payload.id
      }
      const response = await apiClient.put('/budgets', body)
      const data = response.data?.data || response.data

      // Refresh / update local budgets
      await fetchBudgets(payload.month)
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal menyimpan anggaran.' }
    }
  }

  const deleteBudget = async (id, currentMonth) => {
    try {
      await apiClient.delete(`/budgets/${id}`)
      budgets.value = budgets.value.filter((b) => (b.id !== id && b.uuid !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal menghapus anggaran.' }
    }
  }

  const copyBudgets = async ({ fromMonth, toMonth }) => {
    try {
      const body = {
        fromMonth: Number(fromMonth),
        toMonth: Number(toMonth),
        FromMonth: Number(fromMonth),
        ToMonth: Number(toMonth),
      }
      const response = await apiClient.post('/budgets/copy', body)
      await fetchBudgets(toMonth)
      return { success: true, data: response.data?.data || response.data }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal menyalin anggaran.' }
    }
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
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    budgets,
    fetchBudgets,
    getBudget,
    saveBudget,
    deleteBudget,
    copyBudgets,
    reset,
    loadInitialData,
    fetchSummary,
    loadMasterData,
  }
})
