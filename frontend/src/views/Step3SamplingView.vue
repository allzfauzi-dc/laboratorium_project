<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <WorkflowStepper :activeStep="3" />

    <!-- Header -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
      <div>
        <div class="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
          Tahap 3 dari 5
        </div>
        <h1 class="text-xl font-black text-slate-900">Pengambilan Spesimen (Bilik Flebotomi & Barcoding)</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Pemanggilan pasien, proses pengambilan sampel biologis oleh analis/flebotomis, pencetakan label barcode wadah, dan evaluasi kualitas fisik spesimen.
        </p>
      </div>

      <div class="text-right">
        <span class="text-xs text-slate-400 block">Antrean Bilik Sampling:</span>
        <span class="text-xl font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 inline-block">
          {{ queue.length }} Pasien
        </span>
      </div>
    </div>

    <!-- Alert Notifications -->
    <div v-if="successMsg" class="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-lg">✅</span>
        <span>{{ successMsg }}</span>
      </div>
      <router-link to="/tahap-4" class="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg hover:bg-emerald-700 transition">
        Buka Tahap 4: Ruang Analitik →
      </router-link>
    </div>

    <div v-if="errorMsg" class="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
      <span class="text-lg">⚠️</span>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Main Sampling Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Queue list (5 cols) -->
      <div class="lg:col-span-5 space-y-3">
        <div class="flex justify-between items-center">
          <h2 class="font-bold text-xs uppercase tracking-wider text-slate-500">Antrean Bilik Flebotomi</h2>
          <button @click="loadQueue" class="text-xs text-blue-600 hover:text-blue-800 font-semibold">🔄 Refresh</button>
        </div>

        <div v-if="loading" class="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
          Memuat antrean sampling...
        </div>

        <div v-else-if="queue.length === 0" class="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
          Tidak ada pasien antre sampling saat ini.
        </div>

        <div 
          v-for="item in queue" 
          :key="item._id"
          @click="selectItem(item)"
          class="bg-white p-4 rounded-xl border transition cursor-pointer shadow-sm"
          :class="{
            'border-blue-500 ring-2 ring-blue-300 bg-blue-50/30': selectedItem?._id === item._id,
            'border-slate-200 hover:border-blue-300': selectedItem?._id !== item._id
          }"
        >
          <div class="flex justify-between items-start">
            <span class="font-mono font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-xs">
              {{ item.queueNumber }}
            </span>
            <span class="text-[10px] text-slate-400 font-mono">{{ item.regNumber }}</span>
          </div>

          <div class="font-bold text-sm text-slate-900 mt-2">{{ item.patient?.name }}</div>
          <div class="text-[11px] text-slate-500">
            {{ item.patient?.gender === 'L' ? 'L' : 'P' }} | RM: {{ item.patient?.mrNumber }} | Lahir: {{ item.patient?.birthDate }}
          </div>

          <div class="text-[11px] text-blue-700 mt-2 font-semibold flex justify-between items-center border-t border-slate-100 pt-2">
            <span>{{ item.orderTests?.length || 0 }} Parameter</span>
            <span>Panggil ke Bilik →</span>
          </div>
        </div>
      </div>

      <!-- Right: Phlebotomy Procedure & Barcode Generation (7 cols) -->
      <div class="lg:col-span-7">
        <div v-if="!selectedItem" class="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 text-xs">
          👈 Silakan pilih pasien pada antrean sampling di sebelah kiri untuk memulai prosedur pengambilan spesimen.
        </div>

        <div v-else class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <!-- Calling Banner -->
          <div class="bg-blue-600 text-white p-4 rounded-xl flex justify-between items-center">
            <div>
              <span class="text-[11px] text-blue-200 uppercase tracking-wider font-bold">Panggilan Pasien Masuk Bilik</span>
              <h2 class="text-xl font-black">{{ selectedItem.patient?.name }}</h2>
              <p class="text-xs text-blue-100">No Rekam Medis: {{ selectedItem.patient?.mrNumber }} ({{ selectedItem.patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan' }})</p>
            </div>
            <div class="text-3xl font-black font-mono bg-blue-800/80 px-4 py-2 rounded-xl border border-blue-400/40">
              {{ selectedItem.queueNumber }}
            </div>
          </div>

          <!-- Wadah yang Dibutuhkan Otomatis Berdasarkan Item Tes -->
          <div class="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h3 class="font-bold text-xs text-slate-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <span>🧪</span> Jenis Wadah & Spesimen yang Wajib Disiapkan:
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div v-for="(container, idx) in requiredContainers" :key="idx" class="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" :class="getContainerColor(container)"></span>
                <span class="font-semibold text-slate-800">{{ container }}</span>
              </div>
            </div>
          </div>

          <!-- Barcode Preview Section -->
          <div class="border border-slate-200 rounded-xl p-4 bg-white">
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-xs uppercase tracking-wide text-slate-800 flex items-center gap-1.5">
                <span>🏷️</span> Preview Label Barcode Tabung Spesimen:
              </span>
              <button 
                type="button" 
                @click="printBarcodeDemo" 
                class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-lg border border-slate-300 transition flex items-center gap-1"
              >
                <span>🖨️</span> Cetak Label Barcode
              </button>
            </div>

            <div class="flex justify-center p-2 bg-slate-100/50 rounded-lg">
              <BarcodeLabel 
                :patientName="selectedItem.patient?.name"
                :mrNumber="selectedItem.patient?.mrNumber"
                :gender="selectedItem.patient?.gender"
                :birthDate="selectedItem.patient?.birthDate"
                :barcode="generatedBarcode"
                :containerType="requiredContainers.join(', ') || 'Tabung Spesimen'"
                :samplingTime="currentDateTimeStr"
              />
            </div>
          </div>

          <!-- Form Pencatatan Flebotomis -->
          <form @submit.prevent="handleConfirmSampling" class="space-y-4 text-xs border-t border-slate-200 pt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Nama Flebotomis / Analis Pengambil Sampel <span class="text-rose-500">*</span></label>
                <input type="text" v-model="samplingForm.phlebotomistName" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Kondisi Fisik Sampel <span class="text-rose-500">*</span></label>
                <select v-model="samplingForm.sampleCondition" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white">
                  <option value="Baik">Baik & Memenuhi Syarat (Normal)</option>
                  <option value="Hemolisis">Hemolisis (Eritrosit pecah)</option>
                  <option value="Ikterik">Ikterik (Serum kuning kecokelatan)</option>
                  <option value="Lipemik">Lipemik (Serum keruh / lemak)</option>
                  <option value="Beku">Beku / Lisis</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Volume Spesimen Didapat (mL)</label>
                <input type="number" step="0.1" v-model="samplingForm.volumeMl" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Catatan Bilik Sampling</label>
                <input type="text" v-model="samplingForm.notes" placeholder="e.g. Pasien puasa 10 jam, penusukan vena mediana cubiti" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button 
                type="submit" 
                :disabled="saving"
                class="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-xl shadow text-xs flex items-center gap-2 transition"
              >
                <span v-if="saving">Memproses...</span>
                <span v-else>🧪 Konfirmasi Sampel Diambil & Kirim ke Ruang Analitik →</span>
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
import BarcodeLabel from '../components/BarcodeLabel.vue';

const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const queue = ref([]);
const selectedItem = ref(null);
const successMsg = ref('');
const errorMsg = ref('');

const samplingForm = ref({
  phlebotomistName: 'Ns. Rahmat Hidayat, A.Md.AK',
  sampleCondition: 'Baik',
  volumeMl: 3.0,
  notes: ''
});

const generatedBarcode = computed(() => {
  if (selectedItem.value?.specimen?.barcode) {
    return selectedItem.value.specimen.barcode;
  }
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = selectedItem.value?.queueNumber?.replace('LAB-', '') || '001';
  return `SMP-${dateStr}-${seq}`;
});

const currentDateTimeStr = computed(() => {
  const d = new Date();
  return `${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
});

const requiredContainers = computed(() => {
  if (!selectedItem.value?.orderTests) return [];
  const set = new Set();
  selectedItem.value.orderTests.forEach(item => {
    if (item.parameter?.containerType) {
      set.add(item.parameter.containerType);
    }
  });
  return Array.from(set);
});

const getContainerColor = (containerStr) => {
  const s = containerStr.toLowerCase();
  if (s.includes('ungu') || s.includes('edta')) return 'bg-purple-600';
  if (s.includes('kuning') || s.includes('gel')) return 'bg-yellow-400';
  if (s.includes('merah')) return 'bg-red-600';
  if (s.includes('pot') || s.includes('urine')) return 'bg-amber-500';
  return 'bg-blue-600';
};

const loadQueue = async () => {
  loading.value = true;
  try {
    const res = await api.getSamplingQueue();
    queue.value = res.data;
    if (queue.value.length > 0 && !selectedItem.value) {
      selectItem(queue.value[0]);
    } else if (queue.value.length === 0) {
      selectedItem.value = null;
    }
  } catch (err) {
    console.error('Failed to load sampling queue:', err);
  } finally {
    loading.value = false;
  }
};

const selectItem = (item) => {
  selectedItem.value = item;
  samplingForm.value.notes = '';
  samplingForm.value.sampleCondition = 'Baik';
};

const printBarcodeDemo = () => {
  window.print();
};

const handleConfirmSampling = async () => {
  if (!selectedItem.value) return;
  saving.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const payload = {
      phlebotomistName: samplingForm.value.phlebotomistName,
      sampleCondition: samplingForm.value.sampleCondition,
      volumeMl: samplingForm.value.volumeMl,
      notes: samplingForm.value.notes,
      containerType: requiredContainers.value.join(' & '),
      specimenType: selectedItem.value.orderTests?.map(o => o.parameter?.specimenType).join(', ')
    };

    const res = await api.saveSpecimen(selectedItem.value._id, payload);
    successMsg.value = res.message;
    await loadQueue();

    setTimeout(() => {
      router.push('/tahap-4');
    }, 1500);
  } catch (err) {
    errorMsg.value = err.message || 'Gagal menyimpan data spesimen';
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadQueue();
});
</script>
