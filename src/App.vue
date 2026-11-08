<template>
  <div class="min-h-screen flex flex-col bg-card selection:bg-brand selection:text-white">

    <!-- Navbar hanya tampil di halaman protected (bukan di login/register) -->
    <Navbar v-if="isAppLayout" @open-add-modal="isAddModalOpen = true" />

    <main :class="isAppLayout
      ? 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8'
      : 'flex-1'
    ">
      <router-view @open-add-modal="isAddModalOpen = true" />
    </main>

    <!-- Footer hanya di halaman protected, desktop only -->
    <footer
      v-if="isAppLayout"
      class="hidden md:block border-t border-slate-200/80 bg-surface py-5 text-center text-xs text-ink/40"
    >
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <p>© 2026 ManaDuitnya.</p>
        <p class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
          <span class="font-mono">{{ apiBaseUrl }}</span>
        </p>
      </div>
    </footer>

    <!-- Modal transaksi global -->
    <TransactionModal v-if="isAppLayout" :is-open="isAddModalOpen" @close="isAddModalOpen = false" />

    <!-- iOS install prompt -->
    <IOSInstallPrompt />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import TransactionModal from '@/components/TransactionModal.vue'
import IOSInstallPrompt from '@/components/IOSInstallPrompt.vue'

const route          = useRoute()
const isAddModalOpen = ref(false)
const apiBaseUrl     = import.meta.env.VITE_API_BASE_URL || 'http://manaduitnya.runsap.net/api'

// Halaman guest (login/register) → tanpa navbar & footer
const guestRoutes = ['Login', 'Register']
const isAppLayout = computed(() => !guestRoutes.includes(route.name))
</script>
