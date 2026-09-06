<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <WorkflowStepper :activeStep="2" />

    <!-- Header -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
      <div>
        <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
          Tahap 2 dari 5
        </div>
        <h1 class="text-xl font-black text-slate-900">Proses Administrasi & Penjaminan Kasir</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Verifikasi kesesuaian identitas pasien, cek kesesuaian tindakan lab, pelunasan kasir (Pasien Umum) atau verifikasi klaim BPJS / Asuransi.
        </p>
      </div>

      <div class="text-right">
        <span class="text-xs text-slate-400 block">Antrean Menunggu Administrasi:</span>
        <span class="text-xl font-mono font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 inline-block">
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
      <router-link to="/tahap-3" class="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg hover:bg-emerald-700 transition">
        Buka Tahap 3: Bilik Sampling →
      </router-link>
    </div>

    <div v-if="errorMsg" class="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
      <span class="text-lg">⚠️</span>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Queue List & Verification Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Queue list (5 cols) -->
      <div class="lg:col-span-5 space-y-3">
        <div class="flex justify-between items-center">
          <h2 class="font-bold text-xs uppercase tracking-wider text-slate-500">Antrean Loket Administrasi</h2>
          <button @click="loadQueue" class="text-xs text-amber-600 hover:text-amber-800 font-semibold">🔄 Refresh</button>
        </div>

        <div v-if="loading" class="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
          Memuat antrean...
        </div>

        <div v-else-if="queue.length === 0" class="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
          Tidak ada antrean administrasi saat ini. Semua pasien telah diverifikasi atau belum ada pendaftaran baru.
        </div>

        <div 
          v-for="item in queue" 
          :key="item._id"
          @click="selectItem(item)"
          class="bg-white p-4 rounded-xl border transition cursor-pointer shadow-sm"
          :class="{
            'border-amber-500 ring-2 ring-amber-300 bg-amber-50/30': selectedItem?._id === item._id,
            'border-slate-200 hover:border-amber-300': selectedItem?._id !== item._id
          }"
        >
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-2">
              <span class="font-mono font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-xs">
                {{ item.queueNumber }}
              </span>
              <span 
                class="px-2 py-0.5 rounded text-[10px] font-bold"
                :class="{
                  'bg-emerald-100 text-emerald-800': item.patientType === 'BPJS',
                  'bg-blue-100 text-blue-800': item.patientType === 'ASURANSI',
                  'bg-slate-100 text-slate-800': item.patientType === 'UMUM'
                }"
              >
                {{ item.patientType }}
              </span>
            </div>
            <span class="font-mono text-xs font-black text-slate-800">
              Rp {{ (item.totalAmount || 0).toLocaleString('id-ID') }}
            </span>
          </div>

          <div class="font-bold text-sm text-slate-900 mt-2">{{ item.patient?.name }}</div>
          <div class="text-[11px] text-slate-500 font-mono">RM: {{ item.patient?.mrNumber }}</div>

          <div class="text-[11px] text-slate-600 mt-2 flex justify-between items-center border-t border-slate-100 pt-2">
            <span>{{ item.orderTests?.length || 0 }} Item Pemeriksaan</span>
            <span class="text-amber-700 font-semibold">Pilih untuk Proses →</span>
          </div>
        </div>
      </div>

      <!-- Right: Verification & Payment Form (7 cols) -->
      <div class="lg:col-span-7">
        <div v-if="!selectedItem" class="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 text-xs">
          👈 Silakan pilih pasien pada daftar antrean di sebelah kiri untuk memverifikasi administrasi & pembayaran.
        </div>

        <div v-else class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <div class="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <span class="text-[11px] text-slate-400 font-mono">No. Registrasi: {{ selectedItem.regNumber }}</span>
              <h2 class="text-lg font-black text-slate-900">{{ selectedItem.patient?.name }}</h2>
              <div class="text-xs text-slate-600">
                No RM: <span class="font-mono font-bold">{{ selectedItem.patient?.mrNumber }}</span> | 
                NIK: <span class="font-mono">{{ selectedItem.patient?.nik || '-' }}</span> | 
                Tgl Lahir: {{ selectedItem.patient?.birthDate }}
              </div>
            </div>

            <div class="text-right">
              <span class="font-mono font-black text-lg text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg inline-block">
                {{ selectedItem.queueNumber }}
              </span>
            </div>
          </div>

          <!-- Rujukan Dokter Info -->
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs grid grid-cols-2 gap-2">
            <div>
              <span class="text-slate-400 block text-[10px]">Asal Rujukan:</span>
              <span class="font-semibold text-slate-800">{{ selectedItem.referralSource }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">Dokter Pengirim:</span>
              <span class="font-semibold text-slate-800">{{ selectedItem.referringDoctor }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-slate-400 block text-[10px]">Indikasi / Diagnosa Klinis:</span>
              <span class="text-slate-700">{{ selectedItem.clinicalDiagnosis || '-' }}</span>
            </div>
          </div>

          <!-- Rincian Item Pemeriksaan yang Diminta -->
          <div>
            <h3 class="font-bold text-xs text-slate-800 mb-2 uppercase tracking-wide">Pemeriksaan yang Diminta:</h3>
            <div class="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table class="w-full text-left">
                <thead class="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th class="py-2 px-3">Nama Pemeriksaan</th>
                    <th class="py-2 px-3">Jenis Sampel</th>
                    <th class="py-2 px-3 text-right">Tarif</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="order in selectedItem.orderTests" :key="order._id">
                    <td class="py-2 px-3 font-semibold text-slate-800">{{ order.parameter?.name }}</td>
                    <td class="py-2 px-3 text-slate-500 text-[11px]">{{ order.parameter?.specimenType }}</td>
                    <td class="py-2 px-3 text-right font-mono font-bold text-slate-800">
                      Rp {{ (order.price || 0).toLocaleString('id-ID') }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-amber-50 font-bold border-t border-amber-200 text-amber-900">
                  <tr>
                    <td colspan="2" class="py-2.5 px-3">Total Tagihan</td>
                    <td class="py-2.5 px-3 text-right font-mono text-sm">
                      Rp {{ (selectedItem.totalAmount || 0).toLocaleString('id-ID') }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Form Penyelesaian Pembayaran / Penjaminan -->
          <form @submit.prevent="handleProcessBilling" class="border-t border-slate-200 pt-4 space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Status Penjaminan Pasien:</label>
                <div class="p-2 bg-slate-100 rounded-lg font-bold text-slate-800">
                  {{ selectedItem.patientType }}
                  <span v-if="selectedItem.guarantorCardNo" class="text-xs font-normal text-slate-600 block mt-0.5">
                    No: {{ selectedItem.guarantorCardNo }}
                  </span>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Metode Pembayaran / Verifikasi <span class="text-rose-500">*</span></label>
                <select v-model="paymentForm.paymentMethod" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 bg-white">
                  <option v-if="selectedItem.patientType === 'UMUM'" value="TUNAI">Tunai (Kasir)</option>
                  <option v-if="selectedItem.patientType === 'UMUM'" value="QRIS">QRIS / E-Wallet</option>
                  <option v-if="selectedItem.patientType === 'UMUM'" value="TRANSFER_BANK">Transfer Bank</option>
                  <option v-if="selectedItem.patientType === 'UMUM'" value="KARTU_DEBIT_KREDIT">Kartu Debit / Kredit EDC</option>
                  <option v-if="selectedItem.patientType === 'BPJS'" value="BPJS_KESEHATAN">Verifikasi Klaim BPJS (SEP)</option>
                  <option v-if="selectedItem.patientType === 'ASURANSI'" value="ASURANSI_SWASTA">Verifikasi Polis Asuransi</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Nama Petugas Kasir / Administrasi</label>
                <input type="text" v-model="paymentForm.cashierName" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Catatan Verifikasi / No Bukti</label>
                <input type="text" v-model="paymentForm.notes" placeholder="No Kwitansi / Catatan kelayakan penjaminan" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500" />
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button 
                type="submit" 
                :disabled="processing"
                class="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-xl shadow text-xs flex items-center gap-2 transition"
              >
                <span v-if="processing">Memverifikasi...</span>
                <span v-else-if="selectedItem.patientType === 'UMUM'">💰 Selesaikan Pembayaran Kasir & Masuk Sampling →</span>
                <span v-else>🛡️ Verifikasi Penjaminan & Masuk Sampling →</span>
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
const processing = ref(false);
const queue = ref([]);
const selectedItem = ref(null);
const successMsg = ref('');
const errorMsg = ref('');

const paymentForm = ref({
  paymentMethod: 'TUNAI',
  cashierName: 'Budi Santoso (Kasir)',
  notes: ''
});

const loadQueue = async () => {
  loading.value = true;
  try {
    const res = await api.getBillingQueue();
    queue.value = res.data;
    if (queue.value.length > 0 && !selectedItem.value) {
      selectItem(queue.value[0]);
    } else if (queue.value.length === 0) {
      selectedItem.value = null;
    }
  } catch (err) {
    console.error('Failed to load billing queue:', err);
  } finally {
    loading.value = false;
  }
};

const selectItem = (item) => {
  selectedItem.value = item;
  if (item.patientType === 'BPJS') {
    paymentForm.value.paymentMethod = 'BPJS_KESEHATAN';
    paymentForm.value.cashierName = 'Dewi Lestari (Loket BPJS)';
  } else if (item.patientType === 'ASURANSI') {
    paymentForm.value.paymentMethod = 'ASURANSI_SWASTA';
    paymentForm.value.cashierName = 'Dewi Lestari (Loket Asuransi)';
  } else {
    paymentForm.value.paymentMethod = 'TUNAI';
    paymentForm.value.cashierName = 'Budi Santoso (Kasir)';
  }
  paymentForm.value.notes = '';
};

const handleProcessBilling = async () => {
  if (!selectedItem.value) return;
  processing.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const res = await api.verifyBilling(selectedItem.value._id, paymentForm.value);
    successMsg.value = res.message;
    await loadQueue();

    setTimeout(() => {
      router.push('/tahap-3');
    }, 1500);
  } catch (err) {
    errorMsg.value = err.message || 'Gagal memproses verifikasi administrasi';
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  loadQueue();
});
</script>
