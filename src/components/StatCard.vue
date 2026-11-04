<template>
  <div class="bg-surface rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-ink/60">{{ title }}</p>
        <p class="text-2xl font-extrabold text-ink mt-1">
          {{ formattedAmount }}
        </p>
      </div>
      <div :class="['w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm', colorClass]">
        <slot name="icon"></slot>
      </div>
    </div>
    <div v-if="subtitle" class="mt-3 flex items-center text-xs text-ink/60">
      <span class="font-medium text-ink/80">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: [Number, String],
    default: 0,
  },
  colorClass: {
    type: String,
    default: 'bg-brand',
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(props.amount || 0))
})
</script>
