<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="router.back()" class="p-2 rounded-xl hover:bg-card text-ink/60 ios-active-scale">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <h1 class="text-2xl font-extrabold text-ink tracking-tight">Kategori</h1>
      </div>
      <button
        @click="openAdd"
        class="flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-sm shadow-md shadow-brand/20 transition-all ios-active-scale"
      >
        <Plus class="w-4 h-4" />
        Tambah
      </button>
    </div>

    <!-- Filter Type -->
    <div class="flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ios-active-scale"
        :class="activeTab === tab.value ? 'bg-brand text-white shadow-sm shadow-brand/20' : 'bg-surface border border-slate-200 text-ink/60 hover:text-ink'"
      >
        {{ tab.label }}
      </button>
    </div>

    <SkeletonLoader v-if="loading" type="list" :count="5" />

        <!-- Error -->
    <div v-else-if="error" class="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
      <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
      <span>{{ error }}</span>
    </div>

    <!-- List -->
    <div v-else-if="filteredCategories.length" class="bg-surface rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
      <div v-for="cat in filteredCategories" :key="cat.id" class="flex items-center gap-3.5 px-4 py-3.5">
        <div class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: cat.color || '#94a3b8' }" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-ink truncate">{{ cat.name }}</p>
          <p class="text-[11px] text-ink/40">{{ typeLabel(cat.type) }}</p>
        </div>
        <div class="flex items-center gap-1">
          <button @click="openEdit(cat)" class="p-2 rounded-xl text-ink/40 hover:text-brand hover:bg-brand/10 transition-colors ios-active-scale">
            <Pencil class="w-3.5 h-3.5" />
          </button>
          <button @click="confirmDelete(cat)" class="p-2 rounded-xl text-ink/40 hover:text-rose-500 hover:bg-rose-50 transition-colors ios-active-scale">
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="py-12 text-center text-ink/40 text-sm">
      Belum ada kategori {{ activeTab === 'income' ? 'pemasukan' : 'pengeluaran' }}.
    </div>


    <!-- Modal Edit -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" @click="showModal = false" />
      <div class="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden pb-safe sm:pb-0 z-10">
        <div class="sm:hidden w-full pt-3 pb-1 flex justify-center">
          <div class="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>
        <div class="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-base font-bold text-ink">{{ isEditing ? 'Edit Kategori' : 'Tambah Kategori' }}</h3>
          <button @click="showModal = false" class="text-ink/40 hover:text-ink p-1 rounded-full ios-active-scale">
            <X class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="saveCategory" class="p-5 space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Nama Kategori</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="cth. Makan & Minum"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-ink bg-card focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div v-if="!isEditing" class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Tipe</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="form.type = 2"
                class="py-2.5 text-sm font-bold rounded-xl border transition-all ios-active-scale"
                :class="form.type === 2 ? 'bg-rose-500 text-white border-rose-500' : 'bg-surface border-slate-200 text-ink/60'"
              >
                Pengeluaran
              </button>
              <button
                type="button"
                @click="form.type = 1"
                class="py-2.5 text-sm font-bold rounded-xl border transition-all ios-active-scale"
                :class="form.type === 1 ? 'bg-brand text-white border-brand' : 'bg-surface border-slate-200 text-ink/60'"
              >
                Pemasukan
              </button>
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-ink/70">Warna</label>
            <div class="flex items-center gap-3">
              <input v-model="form.color" type="color" class="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5" />
              <span class="text-xs text-ink/50 font-mono">{{ form.color }}</span>
            </div>
          </div>
          <div v-if="formError" class="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
            <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{{ formError }}</span>
          </div>
          <div class="flex items-center justify-end gap-2 pt-1">
            <button type="button" @click="showModal = false" class="px-4 py-2.5 text-sm font-semibold text-ink/60 hover:bg-card rounded-xl transition-colors ios-active-scale">
              Batal
            </button>
            <button type="submit" :disabled="isSubmitting" class="px-5 py-2.5 text-sm font-bold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-sm shadow-brand/20 transition-all ios-active-scale disabled:opacity-50 flex items-center gap-1.5">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Pencil, Trash2, X, Loader2, AlertCircle, Plus } from 'lucide-vue-next'
import apiClient from '@/services/api'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import { useFinanceStore } from '@/stores/finance'


const router = useRouter()
const financeStore = useFinanceStore()

const loading = ref(false)
const error = ref(null)
const formError = ref(null)
const isSubmitting = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const activeTab = ref('expense')

const tabs = [
  { label: 'Pengeluaran', value: 'expense' },
  { label: 'Pemasukan', value: 'income' },
]

const form = reactive({ id: null, name: '', color: '#0D9488', type: 2 })

const typeLabel = (type) => {
  const t = String(type).toLowerCase()
  return t === '1' || t === 'income' ? 'Pemasukan' : 'Pengeluaran'
}

const filteredCategories = computed(() => {
  return financeStore.categories.filter((c) => {
    const t = String(c.type).toLowerCase()
    if (activeTab.value === 'income') return t === '1' || t === 'income'
    return t === '2' || t === 'expense'
  })
})

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    await financeStore.fetchCategories()
  } catch {
    error.value = 'Gagal memuat kategori.'
  } finally {
    loading.value = false
  }
})

const openAdd = () => {
  isEditing.value = false
  form.id = null
  form.name = ''
  form.color = '#0D9488'
  form.type = activeTab.value === 'income' ? 1 : 2
  formError.value = null
  showModal.value = true
}

const openEdit = (cat) => {
  isEditing.value = true
  form.id = cat.id
  form.name = cat.name
  form.color = cat.color || '#0D9488'
  form.type = cat.type
  formError.value = null
  showModal.value = true
}

const saveCategory = async () => {
  isSubmitting.value = true
  formError.value = null
  try {
    if (isEditing.value) {
      await apiClient.put(`/categories/${form.id}`, {
        name: form.name,
        type: Number(form.type),
        color: form.color,
      })
    } else {
      await apiClient.post('/categories', {
        name: form.name,
        type: Number(form.type),
        color: form.color,
      })
    }
    await financeStore.fetchCategories()
    showModal.value = false
  } catch (err) {
    formError.value = err.response?.data?.message ?? err.message ?? 'Gagal menyimpan kategori.'
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = async (cat) => {
  if (!window.confirm(`Hapus kategori "${cat.name}"?`)) return
  error.value = null
  try {
    await apiClient.delete(`/categories/${cat.id}`)
    await financeStore.fetchCategories()
  } catch (err) {
    error.value = err.response?.data?.message ?? err.message ?? 'Gagal menghapus kategori.'
  }
}
</script>
