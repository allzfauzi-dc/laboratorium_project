<template>
  <div class="min-h-screen bg-slate-100 flex flex-col font-sans">
    <Navbar />
    
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <router-view />
    </main>

    <footer class="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 no-print">
      SIMRS LIS Laboratorium RSUD Lubuk Sikaping &copy; 2026. Alur Pelayanan 5 Tahap Terstandar.
    </footer>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
</script>
