<template>
  <div class="bg-surface rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-1.5">
          <p class="text-xs font-semibold uppercase tracking-wider text-ink/60">{{ title }}</p>
          <slot name="action"></slot>
        </div>
        <p class="text-lg sm:text-xl font-bold text-ink mt-1 tracking-tight font-mono">
          {{ isMasked ? 'Rp ••••••••' : formattedAmount }}
        </p>
      </div>
      <div :class="['w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0', colorClass ? colorClass : 'bg-brand/10 text-brand']">
        <slot name="icon"></slot>
      </div>
    </div>
    <div v-if="subtitle" class="mt-2.5 flex items-center text-xs text-ink/60">
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
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  isMasked: {
    type: Boolean,
    default: false,
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
