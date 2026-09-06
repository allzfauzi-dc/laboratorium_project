<template>
  <nav v-if="$route.path !== '/login'" class="bg-slate-900 text-white shadow-md sticky top-0 z-40 no-print">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand / Hospital Title -->
        <div class="flex items-center space-x-3">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center font-black text-slate-950 text-xl tracking-tighter shadow">
              LAB
            </div>
            <div>
              <div class="font-bold text-sm tracking-wide text-white leading-tight">SIMRS LABORATORIUM</div>
              <div class="text-[11px] text-teal-400 font-medium">RSUD Lubuk Sikaping - Patologi Klinik</div>
            </div>
          </router-link>
        </div>

        <!-- Navigation Links Filtered by Role Access -->
        <div class="hidden md:flex items-center space-x-1 text-xs font-semibold">
          <router-link 
            to="/" 
            class="px-3 py-2 rounded-md hover:bg-slate-800 transition"
            :class="{'bg-teal-600 text-white': $route.path === '/'}"
          >
            Dashboard
          </router-link>

          <!-- Tahap 1 -->
          <router-link 
            v-if="authState.canAccess('/tahap-1')"
            to="/tahap-1" 
            class="px-3 py-2 rounded-md hover:bg-slate-800 transition flex items-center gap-1.5"
            :class="{'bg-teal-600 text-white': $route.path === '/tahap-1'}"
          >
            <span class="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            Pendaftaran &amp; Rujukan
          </router-link>

          <!-- Tahap 2 -->
          <router-link 
            v-if="authState.canAccess('/tahap-2')"
            to="/tahap-2" 
            class="px-3 py-2 rounded-md hover:bg-slate-800 transition flex items-center gap-1.5"
            :class="{'bg-teal-600 text-white': $route.path === '/tahap-2'}"
          >
            <span class="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            Administrasi &amp; Kasir
          </router-link>

          <!-- Tahap 3 -->
          <router-link 
            v-if="authState.canAccess('/tahap-3')"
            to="/tahap-3" 
            class="px-3 py-2 rounded-md hover:bg-slate-800 transition flex items-center gap-1.5"
            :class="{'bg-teal-600 text-white': $route.path === '/tahap-3'}"
          >
            <span class="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            Bilik Sampling
          </router-link>

          <!-- Tahap 4 (Khusus Analis / Admin) -->
          <router-link 
            v-if="authState.canAccess('/tahap-4')"
            to="/tahap-4" 
            class="px-3 py-2 rounded-md hover:bg-slate-800 transition flex items-center gap-1.5"
            :class="{'bg-teal-600 text-white': $route.path === '/tahap-4'}"
          >
            <span class="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">4</span>
            Ruang Analitik (Input Hasil)
          </router-link>

          <!-- Tahap 5 (Khusus Dokter Sp.PK / Admin) -->
          <router-link 
            v-if="authState.canAccess('/tahap-5')"
            to="/tahap-5" 
            class="px-3 py-2 rounded-md hover:bg-slate-800 transition flex items-center gap-1.5"
            :class="{'bg-teal-600 text-white': $route.path === '/tahap-5'}"
          >
            <span class="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">5</span>
            Validasi dr. Sp.PK
          </router-link>

          <!-- Pengaturan Tarif & Layanan (Khusus Admin) -->
          <router-link 
            v-if="authState.canAccess('/pengaturan-tarif')"
            to="/pengaturan-tarif" 
            class="px-3 py-2 rounded-md hover:bg-slate-800 transition flex items-center gap-1.5 border border-slate-700 ml-1 text-teal-300"
            :class="{'bg-teal-600 text-white border-teal-500': $route.path === '/pengaturan-tarif'}"
          >
            <span>⚙️</span>
            Tarif &amp; Layanan
          </router-link>

          <!-- Manajemen Pengguna & Role (Khusus Admin) -->
          <router-link 
            v-if="authState.canAccess('/manajemen-pengguna')"
            to="/manajemen-pengguna" 
            class="px-3 py-2 rounded-md hover:bg-slate-800 transition flex items-center gap-1.5 border border-slate-700 ml-1 text-indigo-300"
            :class="{'bg-indigo-600 text-white border-indigo-500': $route.path === '/manajemen-pengguna'}"
          >
            <span>👥</span>
            Pengguna &amp; Role
          </router-link>
        </div>

        <!-- Right Side: User Role Info & Logout -->
        <div class="flex items-center space-x-3">
          <div v-if="authState.isAuthenticated.value" class="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <div class="text-right">
              <div class="font-bold text-white leading-tight truncate max-w-[140px]">{{ authState.userName.value }}</div>
              <div class="text-[10px] text-teal-400 font-semibold">{{ authState.roleTitle.value }}</div>
            </div>
            <button 
              @click="handleLogout"
              class="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-[11px] font-bold transition ml-1"
              title="Keluar / Ganti Akun"
            >
              🚪 Keluar
            </button>
          </div>

          <router-link 
            v-else 
            to="/login"
            class="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
          >
            Login Portal
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { authState } from '../services/auth';

const router = useRouter();

const handleLogout = () => {
  if (confirm('Apakah Anda ingin keluar dari sistem?')) {
    authState.logout();
    router.push('/login');
  }
};
</script>
