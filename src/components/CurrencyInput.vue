<template>
  <div class="relative w-full">
    <!-- Static Currency Prefix (Rp) -->
    <span
      v-if="prefix"
      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 font-bold text-sm pointer-events-none select-none"
    >
      {{ prefix }}
    </span>

    <!-- Formatted Text Input -->
    <input
      ref="inputRef"
      type="text"
      inputmode="numeric"
      :id="id"
      :name="name"
      :value="displayValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      :class="[
        'w-full py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand font-mono text-ink transition-colors',
        prefix ? 'pl-11 pr-3.5' : 'px-3.5',
        disabled ? 'bg-slate-100 text-ink/40 cursor-not-allowed' : 'bg-card focus:bg-surface',
        inputClass
      ]"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: '',
  },
  placeholder: {
    type: String,
    default: '0',
  },
  prefix: {
    type: String,
    default: 'Rp',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: Infinity,
  },
  inputClass: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputRef = ref(null)

const formatNumber = (val) => {
  if (val === '' || val === null || val === undefined) return ''
  const num = Number(val)
  if (isNaN(num)) return ''
  if (num === 0) return '0'
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(num)
}

const displayValue = ref(formatNumber(props.modelValue))

watch(
  () => props.modelValue,
  (newVal) => {
    const rawInputDigits = (inputRef.value?.value || '').replace(/\D/g, '')
    const currentNum = rawInputDigits ? Number(rawInputDigits) : 0
    const propNum = (newVal === '' || newVal === null || newVal === undefined) ? '' : Number(newVal)

    // Hanya perbarui displayValue jika nilainya benar-benar berbeda dari yang sedang diketik
    if (propNum === '' || propNum !== currentNum) {
      displayValue.value = formatNumber(newVal)
    }
  },
  { immediate: true }
)

const handleInput = (event) => {
  const target = event.target
  const rawDigits = target.value.replace(/\D/g, '')

  if (!rawDigits) {
    displayValue.value = ''
    emit('update:modelValue', '')
    return
  }

  let num = Number(rawDigits)
  if (props.max !== Infinity && num > props.max) {
    num = props.max
  }

  const formatted = formatNumber(num)
  displayValue.value = formatted

  // Jaga posisi kursor setelah format titik disisipkan
  const cursorPos = target.selectionStart || 0
  const prevLen = target.value.length

  emit('update:modelValue', num)

  requestAnimationFrame(() => {
    if (inputRef.value) {
      inputRef.value.value = formatted
      const newLen = formatted.length
      const diff = newLen - prevLen
      const newPos = Math.max(0, cursorPos + diff)
      inputRef.value.setSelectionRange(newPos, newPos)
    }
  })
}

const handleBlur = (e) => {
  if (props.modelValue !== '' && props.modelValue !== null) {
    displayValue.value = formatNumber(props.modelValue)
  }
  emit('blur', e)
}

const handleFocus = (e) => {
  emit('focus', e)
}
</script>
