<template>
  <div :class="wrapperClass">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse"
      :class="itemClass"
    >
      <!-- card: untuk budget, wallet -->
      <template v-if="type === 'card'">
        <div class="p-5 bg-surface rounded-3xl border border-slate-200/80 space-y-4">
          <div class="flex justify-between items-center">
            <div class="h-4 bg-slate-200 rounded w-24" />
            <div class="h-5 bg-slate-200 rounded-full w-14" />
          </div>
          <div class="h-5 bg-slate-200 rounded w-36" />
          <div class="h-2.5 bg-slate-200 rounded-full w-full" />
          <div class="flex justify-between">
            <div class="h-3 bg-slate-200 rounded w-20" />
            <div class="h-3 bg-slate-200 rounded w-20" />
          </div>
        </div>
      </template>

      <!-- wallet-card: kartu dompet -->
      <template v-else-if="type === 'wallet-card'">
        <div class="h-40 bg-slate-200 rounded-3xl" />
      </template>

      <!-- list: untuk kategori, transaksi list row -->
      <template v-else-if="type === 'list'">
        <div class="flex items-center gap-3.5 px-4 py-3.5 bg-surface border-b border-slate-100">
          <div class="w-3 h-3 rounded-full bg-slate-200 shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3.5 bg-slate-200 rounded w-32" />
            <div class="h-2.5 bg-slate-200 rounded w-16" />
          </div>
          <div class="w-16 h-3 bg-slate-200 rounded" />
        </div>
      </template>

      <!-- transaction: row transaksi -->
      <template v-else-if="type === 'transaction'">
        <div class="flex items-center gap-3 px-4 py-3.5 bg-surface border-b border-slate-100">
          <div class="w-9 h-9 rounded-2xl bg-slate-200 shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3.5 bg-slate-200 rounded w-28" />
            <div class="h-2.5 bg-slate-200 rounded w-20" />
          </div>
          <div class="w-20 h-4 bg-slate-200 rounded" />
        </div>
      </template>

      <!-- stat: stat card di dashboard -->
      <template v-else-if="type === 'stat'">
        <div class="p-4 bg-surface rounded-2xl border border-slate-200/80 space-y-2">
          <div class="h-3 bg-slate-200 rounded w-20" />
          <div class="h-6 bg-slate-200 rounded w-32" />
          <div class="h-2.5 bg-slate-200 rounded w-16" />
        </div>
      </template>

      <!-- row: baris info sederhana -->
      <template v-else>
        <div class="h-12 bg-slate-200 rounded-2xl" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'row' },
  count: { type: Number, default: 3 },
  cols: { type: String, default: '1' },
})

const wrapperClass = computed(() => {
  const base = 'gap-3'
  if (props.cols === '2') return `grid grid-cols-1 md:grid-cols-2 ${base}`
  if (props.cols === '3') return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${base}`
  if (props.type === 'list' || props.type === 'transaction') return `bg-surface rounded-2xl border border-slate-200/80 overflow-hidden`
  return `grid grid-cols-1 ${base}`
})

const itemClass = computed(() => '')
</script>
