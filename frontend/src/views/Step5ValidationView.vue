<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <WorkflowStepper :activeStep="5" />

    <!-- Header -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
      <div>
        <div class="inline-flex items-center gap-2 bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
          Tahap 5 dari 5 (Final Otorisasi)
        </div>
        <h1 class="text-xl font-black text-slate-900">Validasi & Otorisasi Dokter Spesialis Patologi Klinik (Sp.PK)</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Peninjauan hasil analitik berlapis, deteksi nilai kritis (Critical Value confirmation), ekspertise klinis, dan pemberian tanda tangan digital / otorisasi resmi.
        </p>
      </div>

      <div class="text-right">
        <span class="text-xs text-slate-400 block">Menunggu Validasi Sp.PK:</span>
        <span class="text-xl font-mono font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200 inline-block">
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
      <router-link 
        v-if="validatedRegId" 
        :to="`/cetak-hasil/${validatedRegId}`" 
        class="bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5"
      >
        <span>🖨️</span> Cetak Lembar Hasil Lab Resmi →
      </router-link>
    </div>

    <div v-if="errorMsg" class="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
      <span class="text-lg">⚠️</span>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Validation Queue & Review Table -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Pending List (4 cols) -->
      <div class="lg:col-span-4 space-y-3">
        <div class="flex justify-between items-center">
          <h2 class="font-bold text-xs uppercase tracking-wider text-slate-500">Antrean Validasi Sp.PK</h2>
          <button @click="loadQueue" class="text-xs text-rose-600 hover:text-rose-800 font-semibold">🔄 Refresh</button>
        </div>

        <div v-if="loading" class="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
          Memuat antrean validasi...
        </div>

        <div v-else-if="queue.length === 0" class="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
          Tidak ada hasil lab yang menunggu validasi dokter Sp.PK saat ini.
        </div>

        <div 
          v-for="item in queue" 
          :key="item._id"
          @click="selectItem(item)"
          class="bg-white p-4 rounded-xl border transition cursor-pointer shadow-sm relative overflow-hidden"
          :class="{
            'border-rose-500 ring-2 ring-rose-300 bg-rose-50/30': selectedItem?._id === item._id,
            'border-slate-200 hover:border-rose-300': selectedItem?._id !== item._id
          }"
        >
          <!-- Critical Badge indicator if hasCritical -->
          <div v-if="item.hasCritical" class="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-bl uppercase tracking-widest animate-pulse">
            CRITICAL VALUE!
          </div>

          <div class="flex justify-between items-start">
            <span class="font-mono font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded text-xs">
              {{ item.queueNumber }}
            </span>
            <span class="font-mono text-[10px] text-slate-400">{{ item.specimen?.barcode }}</span>
          </div>

          <div class="font-bold text-sm text-slate-900 mt-2">{{ item.patient?.name }}</div>
          <div class="text-[11px] text-slate-500">
            RM: {{ item.patient?.mrNumber }} ({{ item.patient?.gender === 'L' ? 'L' : 'P' }})
          </div>

          <div class="text-[11px] text-rose-700 mt-2 font-semibold flex justify-between items-center border-t border-slate-100 pt-2">
            <span>{{ item.results?.length || 0 }} Hasil Parameter</span>
            <span>Tinjau & Otorisasi →</span>
          </div>
        </div>
      </div>

      <!-- Right: Doctor Review, Clinical Expertise, Authorization (8 cols) -->
      <div class="lg:col-span-8">
        <div v-if="!selectedItem" class="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 text-xs">
          👈 Silakan pilih pasien pada antrean di sebelah kiri untuk melakukan review klinis & otorisasi Sp.PK.
        </div>

        <div v-else class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <!-- Patient Summary & Referral Info -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-black text-lg text-slate-900">{{ selectedItem.patient?.name }}</span>
                <span class="bg-rose-100 text-rose-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  {{ selectedItem.queueNumber }}
                </span>
              </div>
              <div class="text-xs text-slate-500 mt-0.5">
                No RM: <span class="font-mono font-bold">{{ selectedItem.patient?.mrNumber }}</span> | 
                Tgl Lahir: {{ selectedItem.patient?.birthDate }} ({{ selectedItem.patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan' }})
              </div>
            </div>

            <div class="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span class="text-slate-400 block text-[10px]">Dokter Pengirim & Ruangan:</span>
              <span class="font-semibold text-slate-800">{{ selectedItem.referringDoctor }}</span> ({{ selectedItem.referralSource }})
            </div>
          </div>

          <!-- Clinical Indication -->
          <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs flex items-start gap-2">
            <span class="text-amber-700 font-bold">Diagnosa Klinis Awal:</span>
            <span class="text-amber-950 font-medium">{{ selectedItem.clinicalDiagnosis || 'Tidak ada catatan diagnosa' }}</span>
          </div>

          <!-- Test Results Review Table -->
          <div>
            <h3 class="font-bold text-xs uppercase tracking-wide text-slate-800 mb-2">Hasil Analisis Laboratorium:</h3>
            <div class="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table class="w-full text-left">
                <thead class="bg-slate-50 text-[10px] uppercase text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th class="py-2 px-3">Parameter Uji</th>
                    <th class="py-2 px-3 text-right">Nilai Hasil</th>
                    <th class="py-2 px-3">Satuan</th>
                    <th class="py-2 px-3">Nilai Rujukan</th>
                    <th class="py-2 px-3 text-center">Evaluasi Flag</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr 
                    v-for="res in selectedItem.results" 
                    :key="res._id"
                    :class="{'bg-rose-50/60 font-semibold': res.flag === 'CRITICAL'}"
                  >
                    <td class="py-2 px-3 font-semibold text-slate-800">{{ res.parameter?.name }}</td>
                    <td class="py-2 px-3 text-right font-mono font-bold text-sm" :class="getResultTextClass(res.flag)">
                      {{ res.resultValue || '-' }}
                    </td>
                    <td class="py-2 px-3 font-mono text-[11px] text-slate-500">{{ res.parameter?.unit || '-' }}</td>
                    <td class="py-2 px-3 text-slate-600 text-[11px]">
                      {{ selectedItem.patient?.gender === 'L' ? res.parameter?.refRangeMale : res.parameter?.refRangeFemale }}
                    </td>
                    <td class="py-2 px-3 text-center">
                      <span 
                        class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                        :class="getFlagBadgeClass(res.flag)"
                      >
                        {{ res.flag }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Critical Value Notice if present -->
          <div v-if="selectedItem.hasCritical" class="bg-rose-100 border-2 border-rose-500 rounded-xl p-3 text-xs text-rose-950 space-y-1">
            <div class="font-bold flex items-center gap-1.5 text-sm text-rose-800">
              <span>🚨</span> Konfirmasi Prosedur Nilai Kritis (Critical Value Alert)
            </div>
            <p class="text-[11px]">
              Terdapat nilai kritis yang berpotensi membahayakan pasien. Masukkan catatan tindak lanjut (waktu pelaporan dan nama perawat/DPJP yang menerima telepon darurat).
            </p>
            <input 
              type="text" 
              v-model="validationForm.criticalActionNotes" 
              placeholder="Contoh: Sudah dilaporkan via telp ke dr. Pengirim pkl 14:15 WIB, diterima Ns. Dina" 
              class="w-full text-xs border border-rose-400 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-rose-500 bg-white"
            />
          </div>

          <!-- Sp.PK Expertise & Digital Authorization Form -->
          <form @submit.prevent="handleApproveValidation" class="border-t border-slate-200 pt-4 space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">
                Catatan Ekspertise / Interpretasi Klinis Dokter Sp.PK <span class="text-rose-500">*</span>
              </label>
              <textarea 
                rows="3" 
                v-model="validationForm.clinicalNotes" 
                required
                placeholder="Tuliskan interpretasi patologi klinik, kesimpulan diagnostik, atau rekomendasi pemeriksaan penunjang lanjutan..."
                class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-rose-500"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Dokter Spesialis Patologi Klinik (Sp.PK)</label>
                <input type="text" v-model="validationForm.pathologistName" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-rose-500" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Nomor SIP Dokter Sp.PK</label>
                <input type="text" v-model="validationForm.doctorSip" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-rose-500" />
              </div>
            </div>

            <!-- Action Buttons: Approve or Request Revision -->
            <div class="flex justify-between items-center pt-2">
              <button 
                type="button" 
                @click="handleRequestRevision"
                :disabled="validating"
                class="border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                ↩️ Kembalikan ke Analis (Uji Ulang / Dilusi)
              </button>

              <button 
                type="submit" 
                :disabled="validating"
                class="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-xl shadow text-xs flex items-center gap-2 transition"
              >
                <span v-if="validating">Mengotorisasi...</span>
                <span v-else>✍️ Validasi & Otorisasi Digital Resmi (Selesai) →</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import WorkflowStepper from '../components/WorkflowStepper.vue';

const router = useRouter();
const loading = ref(false);
const validating = ref(false);
const queue = ref([]);
const selectedItem = ref(null);
const successMsg = ref('');
const errorMsg = ref('');
const validatedRegId = ref(null);

const validationForm = ref({
  pathologistName: 'dr. Bambang Irawan, Sp.PK',
  doctorSip: 'SIP: 503/449/SIP-DS/DPM-PTSP/2023',
  clinicalNotes: 'Hasil pemeriksaan laboratorium telah ditinjau dan divalidasi secara klinis sesuai indikasi rujukan.',
  criticalActionNotes: ''
});

const loadQueue = async () => {
  loading.value = true;
  try {
    const res = await api.getValidationPending();
    queue.value = res.data;
    if (queue.value.length > 0 && !selectedItem.value) {
      selectItem(queue.value[0]);
    } else if (queue.value.length === 0) {
      selectedItem.value = null;
    }
  } catch (err) {
    console.error('Failed to load validation queue:', err);
  } finally {
    loading.value = false;
  }
};

const selectItem = (item) => {
  selectedItem.value = item;
  if (item.hasCritical) {
    validationForm.value.clinicalNotes = 'Terdapat hasil nilai kritis. Harap konfirmasi segera dengan DPJP dan sesuaikan penatalaksanaan gawat darurat.';
  } else {
    validationForm.value.clinicalNotes = 'Hasil pemeriksaan laboratorium dalam batas evaluasi klinis yang rasional. Tidak ditemukan nilai kritis.';
  }
  validationForm.value.criticalActionNotes = '';
};

const getResultTextClass = (flag) => {
  switch (flag) {
    case 'CRITICAL': return 'text-rose-700';
    case 'HIGH': return 'text-amber-700';
    case 'LOW': return 'text-blue-700';
    default: return 'text-slate-900';
  }
};

const getFlagBadgeClass = (flag) => {
  switch (flag) {
    case 'CRITICAL': return 'bg-rose-600 text-white animate-pulse shadow';
    case 'HIGH': return 'bg-amber-100 text-amber-800 border border-amber-300';
    case 'LOW': return 'bg-blue-100 text-blue-800 border border-blue-300';
    default: return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
  }
};

const handleApproveValidation = async () => {
  if (!selectedItem.value) return;
  validating.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const payload = {
      pathologistName: validationForm.value.pathologistName,
      doctorSip: validationForm.value.doctorSip,
      clinicalNotes: validationForm.value.clinicalNotes,
      hasCriticalValue: selectedItem.value.hasCritical,
      criticalActionNotes: validationForm.value.criticalActionNotes,
      action: 'APPROVE'
    };

    const res = await api.validateResults(selectedItem.value._id, payload);
    successMsg.value = res.message;
    validatedRegId.value = selectedItem.value._id;
    await loadQueue();
  } catch (err) {
    errorMsg.value = err.message || 'Gagal memvalidasi hasil laboratorium';
  } finally {
    validating.value = false;
  }
};

const handleRequestRevision = async () => {
  if (!confirm('Apakah Anda yakin ingin mengembalikan sampel ini ke ruang analitik untuk pengujian ulang?')) return;
  if (!selectedItem.value) return;

  validating.value = true;
  try {
    const res = await api.validateResults(selectedItem.value._id, { action: 'REVISE' });
    alert(res.message);
    await loadQueue();
  } catch (err) {
    alert(err.message || 'Gagal mengembalikan sampel');
  } finally {
    validating.value = false;
  }
};

onMounted(() => {
  loadQueue();
});
</script>
