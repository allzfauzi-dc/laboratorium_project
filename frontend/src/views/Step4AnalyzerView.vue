<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <WorkflowStepper :activeStep="4" />

    <!-- Header -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
      <div>
        <div class="inline-flex items-center gap-2 bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
          Tahap 4 dari 5
        </div>
        <h1 class="text-xl font-black text-slate-900">Pengolahan & Analisis Sampel (Ruang Analitik)</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Distribusi sampel ke instrumen medis otomatis, pengujian reagen, input nilai parameter laboratorium, dan deteksi otomatis nilai kritis (Critical Alert).
        </p>
      </div>

      <div class="text-right">
        <span class="text-xs text-slate-400 block">Worklist Dalam Analisis:</span>
        <span class="text-xl font-mono font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200 inline-block">
          {{ worklist.length }} Sampel
        </span>
      </div>
    </div>

    <!-- Alert Notifications -->
    <div v-if="successMsg" class="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-lg">✅</span>
        <span>{{ successMsg }}</span>
      </div>
      <router-link to="/tahap-5" class="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg hover:bg-emerald-700 transition">
        Buka Tahap 5: Validasi Dokter Sp.PK →
      </router-link>
    </div>

    <div v-if="errorMsg" class="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
      <span class="text-lg">⚠️</span>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Worklist & Result Entry Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Worklist (4 cols) -->
      <div class="lg:col-span-4 space-y-3">
        <div class="flex justify-between items-center">
          <h2 class="font-bold text-xs uppercase tracking-wider text-slate-500">Daftar Sampel Siap Analisis</h2>
          <button @click="loadWorklist" class="text-xs text-purple-600 hover:text-purple-800 font-semibold">🔄 Refresh</button>
        </div>

        <div v-if="loading" class="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
          Memuat worklist analis...
        </div>

        <div v-else-if="worklist.length === 0" class="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
          Tidak ada sampel menunggu analisis saat ini.
        </div>

        <div 
          v-for="item in worklist" 
          :key="item._id"
          @click="selectItem(item)"
          class="bg-white p-4 rounded-xl border transition cursor-pointer shadow-sm"
          :class="{
            'border-purple-500 ring-2 ring-purple-300 bg-purple-50/30': selectedItem?._id === item._id,
            'border-slate-200 hover:border-purple-300': selectedItem?._id !== item._id
          }"
        >
          <div class="flex justify-between items-start">
            <span class="font-mono font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-xs">
              {{ item.queueNumber }}
            </span>
            <span class="font-mono text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-bold">
              {{ item.specimen?.barcode || 'SMP-BARCODE' }}
            </span>
          </div>

          <div class="font-bold text-sm text-slate-900 mt-2">{{ item.patient?.name }}</div>
          <div class="text-[11px] text-slate-500">
            RM: {{ item.patient?.mrNumber }} ({{ item.patient?.gender === 'L' ? 'L' : 'P' }})
          </div>

          <div class="text-[11px] text-slate-600 mt-2 flex justify-between items-center border-t border-slate-100 pt-2">
            <span>{{ item.orderTests?.length || 0 }} Parameter</span>
            <span class="text-purple-700 font-semibold">Input Hasil →</span>
          </div>
        </div>
      </div>

      <!-- Right: Result Entry Table (8 cols) -->
      <div class="lg:col-span-8">
        <div v-if="!selectedItem" class="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 text-xs">
          👈 Silakan pilih sampel pada daftar di sebelah kiri untuk mengisi hasil analisis laboratorium.
        </div>

        <div v-else class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <!-- Specimen & Patient Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-base text-slate-900">{{ selectedItem.patient?.name }}</span>
                <span class="bg-purple-100 text-purple-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  {{ selectedItem.queueNumber }}
                </span>
              </div>
              <div class="text-xs text-slate-500 mt-0.5">
                No RM: <span class="font-mono font-bold">{{ selectedItem.patient?.mrNumber }}</span> | 
                JK: {{ selectedItem.patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan' }} | 
                Barcode: <span class="font-mono font-bold text-slate-800">{{ selectedItem.specimen?.barcode }}</span>
              </div>
            </div>

            <div class="text-xs text-right bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div class="text-slate-500 text-[10px]">Kondisi Sampel:</div>
              <span class="font-bold text-emerald-700">{{ selectedItem.specimen?.sampleCondition || 'Baik' }}</span>
              <span class="text-slate-400 text-[10px] ml-1">({{ selectedItem.specimen?.volumeMl || 3 }} mL)</span>
            </div>
          </div>

          <!-- Parameters Result Input Form -->
          <form @submit.prevent="handleSubmitResults" class="space-y-4">
            <div class="overflow-x-auto border border-slate-200 rounded-xl">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-[10px] uppercase text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th class="py-2.5 px-3">Pemeriksaan</th>
                    <th class="py-2.5 px-3 w-36">Hasil Pengukuran</th>
                    <th class="py-2.5 px-3">Satuan</th>
                    <th class="py-2.5 px-3">Nilai Rujukan Normal</th>
                    <th class="py-2.5 px-3 text-center">Flag Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="paramItem in resultRows" :key="paramItem.parameterId" class="hover:bg-slate-50/50 transition">
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-slate-800">{{ paramItem.name }}</div>
                      <div class="text-[10px] text-slate-400">{{ paramItem.specimenType }}</div>
                    </td>
                    <td class="py-2.5 px-3">
                      <input 
                        type="text" 
                        v-model="paramItem.resultValue" 
                        @input="updateFlag(paramItem)"
                        required
                        placeholder="Ketik hasil..." 
                        class="w-full font-mono font-bold text-xs border rounded-lg px-2.5 py-1.5 outline-none transition"
                        :class="{
                          'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-400': paramItem.flag === 'CRITICAL',
                          'border-amber-400 bg-amber-50 text-amber-900': paramItem.flag === 'HIGH',
                          'border-blue-400 bg-blue-50 text-blue-900': paramItem.flag === 'LOW',
                          'border-slate-300 focus:border-purple-500': paramItem.flag === 'NORMAL'
                        }"
                      />
                    </td>
                    <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {{ paramItem.unit || '-' }}
                    </td>
                    <td class="py-2.5 px-3 text-slate-700 text-[11px]">
                      {{ selectedItem.patient?.gender === 'L' ? paramItem.refRangeMale : paramItem.refRangeFemale }}
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <span 
                        class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                        :class="{
                          'bg-emerald-100 text-emerald-800 border border-emerald-300': paramItem.flag === 'NORMAL',
                          'bg-blue-100 text-blue-800 border border-blue-300': paramItem.flag === 'LOW',
                          'bg-amber-100 text-amber-800 border border-amber-300': paramItem.flag === 'HIGH',
                          'bg-rose-600 text-white font-black animate-pulse border border-rose-800 shadow': paramItem.flag === 'CRITICAL'
                        }"
                      >
                        {{ paramItem.flag }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Critical Value Alert Banner if any -->
            <div v-if="hasCriticalFlag" class="bg-rose-50 border-2 border-rose-400 rounded-xl p-3 text-xs flex items-center gap-3">
              <span class="text-2xl animate-bounce">🚨</span>
              <div class="flex-1">
                <span class="font-bold text-rose-900 text-sm block">PERINGATAN NILAI KRITIS (CRITICAL VALUE DETECTED)!</span>
                <p class="text-rose-700 text-[11px]">
                  Terdapat hasil laboratorium melampaui batas kritis yang berpotensi mengancam jiwa. Sesuai SOP, hasil ini akan segera disorot khusus ke Dokter Spesialis Patologi Klinik (Sp.PK) untuk konfirmasi & pelaporan ke DPJP.
                </p>
              </div>
            </div>

            <!-- Instrument & Analyst Info -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Instrumen / Alat Medis</label>
                <input type="text" v-model="analystForm.instrumentName" class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 bg-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Nomor Lot Reagen</label>
                <input type="text" v-model="analystForm.reagentLot" class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 bg-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Nama Analis Kesehatan</label>
                <input type="text" v-model="analystForm.analystName" class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 bg-white" />
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end pt-2">
              <button 
                type="submit" 
                :disabled="submitting"
                class="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-xl shadow text-xs flex items-center gap-2 transition"
              >
                <span v-if="submitting">Menyimpan...</span>
                <span v-else>🔬 Simpan Hasil & Kirim ke Dokter Sp.PK untuk Validasi →</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import WorkflowStepper from '../components/WorkflowStepper.vue';

const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const worklist = ref([]);
const selectedItem = ref(null);
const resultRows = ref([]);
const successMsg = ref('');
const errorMsg = ref('');

const analystForm = ref({
  instrumentName: 'Sysmex XN-550 / Cobas c311',
  reagentLot: 'LOT-2026-A',
  analystName: 'Fitriani, S.Tr.Kes'
});

const hasCriticalFlag = computed(() => {
  return resultRows.value.some(r => r.flag === 'CRITICAL');
});

const loadWorklist = async () => {
  loading.value = true;
  try {
    const res = await api.getAnalyzerWorklist();
    worklist.value = res.data;
    if (worklist.value.length > 0 && !selectedItem.value) {
      selectItem(worklist.value[0]);
    } else if (worklist.value.length === 0) {
      selectedItem.value = null;
    }
  } catch (err) {
    console.error('Failed to load analyzer worklist:', err);
  } finally {
    loading.value = false;
  }
};

const selectItem = (item) => {
  selectedItem.value = item;
  // Initialize result rows from ordered parameters and existing results
  resultRows.value = (item.orderTests || []).map(order => {
    const param = order.parameter || {};
    const existing = (item.results || []).find(r => (r.parameter?._id || r.parameter) === param._id);

    const row = {
      parameterId: param._id,
      name: param.name,
      code: param.code,
      unit: param.unit,
      refRangeMale: param.refRangeMale,
      refRangeFemale: param.refRangeFemale,
      minNormal: param.minNormal,
      maxNormal: param.maxNormal,
      criticalLow: param.criticalLow,
      criticalHigh: param.criticalHigh,
      specimenType: param.specimenType,
      resultValue: existing?.resultValue || '',
      flag: existing?.flag || 'NORMAL'
    };

    updateFlag(row);
    return row;
  });
};

const updateFlag = (row) => {
  const valStr = row.resultValue ? String(row.resultValue).replace(',', '.').trim() : '';
  if (!valStr) {
    row.flag = 'NORMAL';
    return;
  }

  const num = parseFloat(valStr);
  if (!isNaN(num)) {
    if (row.criticalLow !== null && num <= row.criticalLow) {
      row.flag = 'CRITICAL';
      return;
    }
    if (row.criticalHigh !== null && num >= row.criticalHigh) {
      row.flag = 'CRITICAL';
      return;
    }
    if (row.minNormal !== null && num < row.minNormal) {
      row.flag = 'LOW';
      return;
    }
    if (row.maxNormal !== null && num > row.maxNormal) {
      row.flag = 'HIGH';
      return;
    }
    row.flag = 'NORMAL';
    return;
  }

  const lower = valStr.toLowerCase();
  if (lower.includes('positif') || lower.includes('reaktif') || lower.includes('1/320') || lower.includes('1/160')) {
    row.flag = 'HIGH';
  } else {
    row.flag = 'NORMAL';
  }
};

const handleSubmitResults = async () => {
  if (!selectedItem.value) return;
  submitting.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const payload = {
      results: resultRows.value.map(r => ({
        parameterId: r.parameterId,
        resultValue: r.resultValue
      })),
      instrumentName: analystForm.value.instrumentName,
      reagentLot: analystForm.value.reagentLot,
      analystName: analystForm.value.analystName
    };

    const res = await api.saveAnalyzerResults(selectedItem.value._id, payload);
    successMsg.value = res.message;
    await loadWorklist();

    setTimeout(() => {
      router.push('/tahap-5');
    }, 1500);
  } catch (err) {
    errorMsg.value = err.message || 'Gagal menyimpan hasil laboratorium';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadWorklist();
});
</script>
