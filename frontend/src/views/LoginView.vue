<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <!-- Logo & Title -->
      <div class="w-14 h-14 rounded-2xl bg-teal-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg tracking-tighter">
        LAB
      </div>
      <h2 class="mt-4 text-2xl font-black tracking-tight text-white uppercase">
        SIMRS LABORATORIUM
      </h2>
      <p class="mt-1 text-xs text-teal-300 font-semibold">
        RSUD Lubuk Sikaping - Instalasi Patologi Klinik
      </p>
      <p class="text-[11px] text-slate-400 mt-1">
        Masuk dengan kredensial akun sesuai wewenang &amp; role pelayanan Anda
      </p>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
      <div class="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-200 sm:px-8 text-xs">
        <!-- Error Alert -->
        <div v-if="errorMsg" class="mb-4 bg-rose-50 border border-rose-300 text-rose-800 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ errorMsg }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Username Pengguna</label>
            <input 
              type="text" 
              v-model="username" 
              required 
              placeholder="Contoh: analis, doktersppk, kasir" 
              class="w-full border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Kata Sandi / Password</label>
            <input 
              type="password" 
              v-model="password" 
              required 
              placeholder="••••••••" 
              class="w-full border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <button 
            type="submit" 
            :disabled="loggingIn"
            class="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-xl shadow transition text-xs flex items-center justify-center gap-2"
          >
            <span v-if="loggingIn">Memverifikasi Akun...</span>
            <span v-else>Masuk ke Portal LIS &rarr;</span>
          </button>
        </form>

        <!-- Demo Quick Role Switcher -->
        <div class="mt-6 border-t border-slate-200 pt-4">
          <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
            ⚡ Akses Cepat Akun Demo Sesuai Role:
          </div>
          <div class="grid grid-cols-2 gap-2 text-[10px]">
            <button 
              type="button" 
              @click="setDemoAccount('analis', 'analis123')"
              class="p-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-left transition font-semibold"
            >
              <div class="font-bold text-purple-800">🔬 Analis Medis</div>
              <div class="text-[9px] text-purple-600">Khusus Input Hasil Saja</div>
            </button>

            <button 
              type="button" 
              @click="setDemoAccount('doktersppk', 'sppk123')"
              class="p-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-lg text-left transition font-semibold"
            >
              <div class="font-bold text-rose-800">🩺 Dokter Sp.PK</div>
              <div class="text-[9px] text-rose-600">Validasi &amp; Otorisasi Resmi</div>
            </button>

            <button 
              type="button" 
              @click="setDemoAccount('flebotomis', 'sampling123')"
              class="p-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-left transition font-semibold"
            >
              <div class="font-bold text-blue-800">🩸 Flebotomis</div>
              <div class="text-[9px] text-blue-600">Bilik Sampling &amp; Barcode</div>
            </button>

            <button 
              type="button" 
              @click="setDemoAccount('kasir', 'kasir123')"
              class="p-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-left transition font-semibold"
            >
              <div class="font-bold text-amber-800">💰 Kasir &amp; BPJS</div>
              <div class="text-[9px] text-amber-600">Administrasi &amp; Penjaminan</div>
            </button>

            <button 
              type="button" 
              @click="setDemoAccount('resepsionis', 'pendaftaran123')"
              class="p-2 border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-lg text-left transition font-semibold"
            >
              <div class="font-bold text-teal-800">📋 Resepsionis</div>
              <div class="text-[9px] text-teal-600">Pendaftaran &amp; Rujukan</div>
            </button>

            <button 
              type="button" 
              @click="setDemoAccount('admin', 'admin123')"
              class="p-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-left transition font-semibold"
            >
              <div class="font-bold text-slate-800">👑 Administrator</div>
              <div class="text-[9px] text-slate-600">Akses Penuh Semua Modul</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authState } from '../services/auth';

const router = useRouter();
const username = ref('');
const password = ref('');
const loggingIn = ref(false);
const errorMsg = ref('');

const setDemoAccount = (u, p) => {
  username.value = u;
  password.value = p;
  handleLogin();
};

const handleLogin = async () => {
  errorMsg.value = '';
  loggingIn.value = true;
  try {
    const user = await authState.login(username.value, password.value);
    
    // Redirect user to their designated view based on role!
    if (user.role === 'ANALIS') {
      router.push('/tahap-4'); // Langsung buka form input hasil!
    } else if (user.role === 'DOKTER_SPPK') {
      router.push('/tahap-5'); // Langsung buka ruang validasi!
    } else if (user.role === 'FLEBOTOMIS') {
      router.push('/tahap-3'); // Langsung buka bilik sampling!
    } else if (user.role === 'KASIR') {
      router.push('/tahap-2'); // Langsung buka loket administrasi!
    } else if (user.role === 'RESEPSIONIS') {
      router.push('/tahap-1'); // Langsung buka pendaftaran!
    } else {
      router.push('/'); // Admin ke Dashboard
    }
  } catch (err) {
    errorMsg.value = err.message || 'Login gagal, periksa username dan password Anda';
  } finally {
    loggingIn.value = false;
  }
};
</script>
