<template>
  <transition
    enter-active-class="transform transition ease-out duration-300"
    enter-from-class="translate-y-8 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showPrompt"
      class="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-md mx-auto z-40 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60"
    >
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
          <Smartphone class="w-5 h-5" />
        </div>
        <div class="flex-1">
          <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
            Jadikan Aplikasi di iPhone
            <span class="text-[10px] px-1.5 py-0.2 rounded-sm bg-emerald-500/20 text-emerald-300 font-semibold">PWA</span>
          </h4>
          <p class="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Dapatkan sensasi native tanpa browser bar: Ketuk ikon 
            <span class="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-800 text-sky-400 font-semibold border border-slate-700">
              <Share class="w-3 h-3 inline" /> Bagikan
            </span>
            di Safari, lalu pilih 
            <span class="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold border border-slate-700">
              <PlusSquare class="w-3 h-3 inline" /> Tambah ke Layar Utama
            </span>.
          </p>
        </div>
        <button
          @click="dismissPrompt"
          class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Smartphone, Share, PlusSquare, X } from 'lucide-vue-next'

const showPrompt = ref(false)

onMounted(() => {
  // Check if iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  
  // Check if already running as standalone PWA
  const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches
  
  // Check if user previously dismissed
  const dismissed = localStorage.getItem('manaduitnya_pwa_dismissed')
  
  if (isIOS && !isStandalone && !dismissed) {
    // Show after slight delay for polite onboarding
    setTimeout(() => {
      showPrompt.value = true
    }, 1500)
  }
})

const dismissPrompt = () => {
  showPrompt.value = false
  localStorage.setItem('manaduitnya_pwa_dismissed', 'true')
}
</script>

