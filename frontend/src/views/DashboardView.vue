<template>
  <div class="space-y-6">
    <!-- Hero Banner -->
    <div class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-teal-500/30">
          <span>🏥</span> Sistem Informasi Manajemen Laboratorium Rumah Sakit
        </div>
        <h1 class="text-2xl font-black tracking-tight text-white">Monitoring Alur Pelayanan Laboratorium</h1>
        <p class="text-slate-300 text-xs mt-1 max-w-2xl">
          Standar operasional alur 5 tahap terintegrasi: Pendaftaran & Rujukan → Verifikasi Administrasi/Kasir → Pengambilan Spesimen & Barcoding → Pengolahan Analitik → Validasi Dokter Spesialis Patologi Klinik (Sp.PK).
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <router-link 
          v-if="authState.canAccess('/manajemen-pengguna')"
          to="/manajemen-pengguna"
          class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2.5 rounded-xl shadow text-xs flex items-center gap-1.5 transition border border-indigo-400/30"
        >
          <span>👥</span> Kelola Pengguna &amp; Role
        </router-link>
        <router-link 
          v-if="authState.canAccess('/pengaturan-tarif')"
          to="/pengaturan-tarif"
          class="bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold px-3.5 py-2.5 rounded-xl shadow text-xs flex items-center gap-1.5 transition border border-slate-700"
        >
          <span>⚙️</span> Tarif &amp; Layanan
        </router-link>
        <router-link 
          v-if="authState.canAccess('/tahap-1')"
          to="/tahap-1" 
          class="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow text-xs flex items-center gap-2 transition"
        >
          <span>➕</span> Registrasi Pasien Baru
        </router-link>
      </div>
    </div>

    <!-- 5-Step KPI Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
      <!-- Step 1 Metric -->
      <router-link to="/tahap-1" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-500 transition group">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1. Pendaftaran</div>
        <div class="text-2xl font-black text-slate-900 mt-1">{{ stats.totalRegistrations }}</div>
        <div class="text-[10px] text-teal-600 font-semibold mt-1 flex items-center justify-between">
          <span>Total Order</span>
          <span class="group-hover:translate-x-1 transition">→</span>
        </div>
      </router-link>

      <!-- Step 2 Metric -->
      <router-link to="/tahap-2" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-amber-500 transition group">
        <div class="text-[11px] font-bold text-amber-600 uppercase tracking-wider">2. Administrasi</div>
        <div class="text-2xl font-black text-amber-700 mt-1">{{ stats.workflow?.administrasi || 0 }}</div>
        <div class="text-[10px] text-amber-600 font-semibold mt-1 flex items-center justify-between">
          <span>Antre Kasir / BPJS</span>
          <span class="group-hover:translate-x-1 transition">→</span>
        </div>
      </router-link>

      <!-- Step 3 Metric -->
      <router-link to="/tahap-3" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 transition group">
        <div class="text-[11px] font-bold text-blue-600 uppercase tracking-wider">3. Sampling</div>
        <div class="text-2xl font-black text-blue-700 mt-1">{{ stats.workflow?.sampling || 0 }}</div>
        <div class="text-[10px] text-blue-600 font-semibold mt-1 flex items-center justify-between">
          <span>Antre Flebotomi</span>
          <span class="group-hover:translate-x-1 transition">→</span>
        </div>
      </router-link>

      <!-- Step 4 Metric -->
      <router-link to="/tahap-4" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-purple-500 transition group">
        <div class="text-[11px] font-bold text-purple-600 uppercase tracking-wider">4. Analisis</div>
        <div class="text-2xl font-black text-purple-700 mt-1">{{ stats.workflow?.analisis || 0 }}</div>
        <div class="text-[10px] text-purple-600 font-semibold mt-1 flex items-center justify-between">
          <span>Worklist Mesin</span>
          <span class="group-hover:translate-x-1 transition">→</span>
        </div>
      </router-link>

      <!-- Step 5 Metric -->
      <router-link to="/tahap-5" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-rose-500 transition group">
        <div class="text-[11px] font-bold text-rose-600 uppercase tracking-wider">5. Validasi Sp.PK</div>
        <div class="text-2xl font-black text-rose-700 mt-1">{{ stats.workflow?.validasi || 0 }}</div>
        <div class="text-[10px] text-rose-600 font-semibold mt-1 flex items-center justify-between">
          <span>Menunggu Validasi</span>
          <span class="group-hover:translate-x-1 transition">→</span>
        </div>
      </router-link>
    </div>

    <!-- Active Workflow Stepper Overview -->
    <WorkflowStepper :activeStep="currentActiveWorkflowStep" />

    <!-- Table of Registrations & Status -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 class="font-bold text-sm text-slate-900">Daftar Pasien & Status Pelayanan Terkini</h2>
          <p class="text-xs text-slate-500">Pantau pergerakan sampel dari loket awal hingga hasil divalidasi</p>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Filter status -->
          <select 
            v-model="filterStatus" 
            @change="loadRegistrations"
            class="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 outline-none focus:border-teal-500 font-medium"
          >
            <option value="ALL">Semua Status ({{ allRegistrations.length }})</option>
            <option value="ADMINISTRASI">Tahap 2: Administrasi</option>
            <option value="SAMPLING">Tahap 3: Sampling</option>
            <option value="ANALISIS">Tahap 4: Analisis</option>
            <option value="VALIDASI">Tahap 5: Validasi Sp.PK</option>
            <option value="SELESAI">Selesai / Cetak Hasil</option>
          </select>

          <!-- Search -->
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="loadRegistrations"
            placeholder="Cari No RM / Nama / Antrean..." 
            class="text-xs border border-slate-300 rounded-lg px-3 py-1.5 w-full sm:w-64 outline-none focus:border-teal-500"
          />

          <button 
            @click="loadData" 
            class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            title="Muat ulang data"
          >
            🔄
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <th class="py-3 px-4">No Antrean</th>
              <th class="py-3 px-4">No Registrasi & RM</th>
              <th class="py-3 px-4">Nama Pasien</th>
              <th class="py-3 px-4">Penjamin</th>
              <th class="py-3 px-4">Asal Rujukan</th>
              <th class="py-3 px-4">Pemeriksaan</th>
              <th class="py-3 px-4 text-center">Status Alur</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="text-center">
              <td colspan="8" class="py-8 text-slate-400">Memuat data laboratorium...</td>
            </tr>
            <tr v-else-if="allRegistrations.length === 0" class="text-center">
              <td colspan="8" class="py-8 text-slate-400">Belum ada pasien terdaftar. Silakan lakukan registrasi.</td>
            </tr>
            <tr 
              v-for="reg in allRegistrations" 
              :key="reg._id" 
              class="hover:bg-slate-50 transition"
            >
              <td class="py-3 px-4 font-black text-teal-700">
                <span class="bg-teal-50 text-teal-800 px-2 py-1 rounded border border-teal-200 font-mono">
                  {{ reg.queueNumber }}
                </span>
              </td>
              <td class="py-3 px-4 font-mono text-[11px]">
                <div class="font-bold text-slate-900">{{ reg.regNumber }}</div>
                <div class="text-slate-500">{{ reg.patient?.mrNumber }}</div>
              </td>
              <td class="py-3 px-4">
                <div class="font-bold text-slate-900">{{ reg.patient?.name }}</div>
                <div class="text-[11px] text-slate-500">
                  {{ reg.patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan' }}, {{ reg.patient?.birthDate }}
                </div>
              </td>
              <td class="py-3 px-4">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="{
                    'bg-emerald-100 text-emerald-800 border border-emerald-200': reg.patientType === 'BPJS',
                    'bg-blue-100 text-blue-800 border border-blue-200': reg.patientType === 'ASURANSI',
                    'bg-slate-100 text-slate-800 border border-slate-200': reg.patientType === 'UMUM'
                  }"
                >
                  {{ reg.patientType }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="font-semibold text-slate-800">{{ reg.referralSource }}</div>
                <div class="text-[10px] text-slate-500">{{ reg.referringDoctor }}</div>
              </td>
              <td class="py-3 px-4">
                <div class="text-[11px] text-slate-700 max-w-xs truncate font-medium">
                  {{ reg.orderTests?.map(o => o.parameter?.name).join(', ') || '-' }}
                </div>
              </td>
              <td class="py-3 px-4 text-center">
                <span 
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                  :class="getStatusBadgeClass(reg.status)"
                >
                  {{ formatStatusLabel(reg.status) }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <button 
                  @click="handleStepAction(reg)"
                  class="text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                  :class="getActionBtnClass(reg.status)"
                >
                  {{ getActionBtnLabel(reg.status) }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import { authState } from '../services/auth';
import WorkflowStepper from '../components/WorkflowStepper.vue';

const router = useRouter();
const loading = ref(false);
const stats = ref({ totalRegistrations: 0, workflow: {} });
const allRegistrations = ref([]);
const filterStatus = ref('ALL');
const searchQuery = ref('');

const currentActiveWorkflowStep = computed(() => {
  if (stats.value.workflow?.validasi > 0) return 5;
  if (stats.value.workflow?.analisis > 0) return 4;
  if (stats.value.workflow?.sampling > 0) return 3;
  if (stats.value.workflow?.administrasi > 0) return 2;
  return 1;
});

const loadData = async () => {
  loading.value = true;
  try {
    const [statsRes, regRes] = await Promise.all([
      api.getStats(),
      api.getRegistrations(filterStatus.value, searchQuery.value)
    ]);
    stats.value = statsRes.data;
    allRegistrations.value = regRes.data;
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  } finally {
    loading.value = false;
  }
};

const loadRegistrations = async () => {
  try {
    const res = await api.getRegistrations(filterStatus.value, searchQuery.value);
    allRegistrations.value = res.data;
  } catch (err) {
    console.error('Failed to filter registrations:', err);
  }
};

const formatStatusLabel = (status) => {
  const map = {
    PENDAFTARAN: '1. Pendaftaran',
    ADMINISTRASI: '2. Administrasi',
    SAMPLING: '3. Sampling',
    ANALISIS: '4. Analisis',
    VALIDASI: '5. Validasi Sp.PK',
    SELESAI: 'Selesai'
  };
  return map[status] || status;
};

const getStatusBadgeClass = (status) => {
  const map = {
    PENDAFTARAN: 'bg-slate-100 text-slate-800 border border-slate-300',
    ADMINISTRASI: 'bg-amber-100 text-amber-800 border border-amber-300',
    SAMPLING: 'bg-blue-100 text-blue-800 border border-blue-300',
    ANALISIS: 'bg-purple-100 text-purple-800 border border-purple-300',
    VALIDASI: 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse',
    SELESAI: 'bg-emerald-100 text-emerald-800 border border-emerald-300'
  };
  return map[status] || 'bg-slate-100 text-slate-800';
};

const getActionBtnLabel = (status) => {
  switch (status) {
    case 'ADMINISTRASI': return 'Verifikasi / Bayar →';
    case 'SAMPLING': return 'Ambil Spesimen →';
    case 'ANALISIS': return 'Input Hasil Lab →';
    case 'VALIDASI': return 'Review Sp.PK →';
    case 'SELESAI': return '🖨️ Cetak Hasil';
    default: return 'Detail';
  }
};

const getActionBtnClass = (status) => {
  switch (status) {
    case 'ADMINISTRASI': return 'bg-amber-600 hover:bg-amber-500 text-white';
    case 'SAMPLING': return 'bg-blue-600 hover:bg-blue-500 text-white';
    case 'ANALISIS': return 'bg-purple-600 hover:bg-purple-500 text-white';
    case 'VALIDASI': return 'bg-rose-600 hover:bg-rose-500 text-white';
    case 'SELESAI': return 'bg-emerald-600 hover:bg-emerald-500 text-white';
    default: return 'bg-slate-700 hover:bg-slate-600 text-white';
  }
};

const handleStepAction = (reg) => {
  switch (reg.status) {
    case 'ADMINISTRASI':
      router.push('/tahap-2');
      break;
    case 'SAMPLING':
      router.push('/tahap-3');
      break;
    case 'ANALISIS':
      router.push('/tahap-4');
      break;
    case 'VALIDASI':
      router.push('/tahap-5');
      break;
    case 'SELESAI':
      router.push(`/cetak-hasil/${reg._id}`);
      break;
    default:
      router.push('/tahap-1');
  }
};

onMounted(() => {
  loadData();
});
</script>
