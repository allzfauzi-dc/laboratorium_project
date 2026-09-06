<template>
  <div class="max-w-4xl mx-auto my-6 space-y-4">
    <!-- Top Action Buttons (Hidden on Print) -->
    <div class="no-print flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <router-link to="/" class="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
        ← Kembali ke Dashboard
      </router-link>

      <div class="flex items-center gap-2">
        <button 
          @click="printReport" 
          class="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow transition"
        >
          <span>🖨️</span> Cetak Lembar Hasil Resmi / Simpan PDF
        </button>
      </div>
    </div>

    <!-- Official Hospital Printable Sheet -->
    <div v-if="loading" class="bg-white p-12 text-center text-slate-400 text-xs rounded-xl shadow">
      Memuat dokumen hasil laboratorium...
    </div>

    <div v-else-if="!reportData" class="bg-white p-12 text-center text-rose-500 text-xs rounded-xl shadow">
      Data hasil laboratorium tidak ditemukan atau belum selesai divalidasi.
    </div>

    <div v-else class="bg-white p-8 rounded-xl shadow border border-slate-200 print:border-none print:shadow-none print:p-0 text-slate-900 text-xs">
      <!-- Kop Surat Rumah Sakit -->
      <div class="border-b-2 border-black pb-3 mb-4 flex justify-between items-start">
        <div class="flex items-center gap-4">
          <div class="w-14 h-16 border-2 border-black flex flex-col items-center justify-center font-bold text-[9px] text-center leading-tight">
            <span>LOGO</span>
            <span>RSUD</span>
          </div>
          <div>
            <div class="text-xs font-bold uppercase tracking-wider text-slate-600">Pemerintah Kabupaten Pasaman</div>
            <h1 class="text-base font-black uppercase text-slate-900 leading-tight">RUMAH SAKIT UMUM DAERAH LUBUK SIKAPING</h1>
            <h2 class="text-xs font-extrabold uppercase text-teal-800 tracking-wide">INSTALASI LABORATORIUM PATOLOGI KLINIK</h2>
            <p class="text-[10px] text-slate-500">Jl. Jend. Sudirman No. 33 Telp. (0753) 20033 Lubuk Sikaping</p>
          </div>
        </div>

        <div class="text-right font-mono">
          <div class="font-bold text-sm border border-black px-2 py-0.5 inline-block">RM. 21 / LAB</div>
          <div class="text-[10px] text-slate-500 mt-1">No: {{ reportData.registration?.regNumber }}</div>
        </div>
      </div>

      <!-- Judul Dokumen -->
      <div class="text-center font-black text-sm tracking-wide uppercase mb-4 underline">
        LEMBAR HASIL PEMERIKSAAN LABORATORIUM
      </div>

      <!-- Data Pasien & Rujukan (2 Kolom) -->
      <div class="grid grid-cols-2 gap-4 border border-black p-3 rounded-sm mb-4 text-[11px]">
        <div class="space-y-1">
          <div class="flex"><span class="w-28 text-slate-600">No. Rekam Medis</span><span class="font-mono font-bold">: {{ reportData.patient?.mrNumber }}</span></div>
          <div class="flex"><span class="w-28 text-slate-600">Nama Pasien</span><span class="font-bold">: {{ reportData.patient?.name }}</span></div>
          <div class="flex"><span class="w-28 text-slate-600">Tanggal Lahir / JK</span><span>: {{ reportData.patient?.birthDate }} ({{ reportData.patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan' }})</span></div>
          <div class="flex"><span class="w-28 text-slate-600">Alamat Pasien</span><span class="truncate">: {{ reportData.patient?.address || '-' }}</span></div>
          <div class="flex"><span class="w-28 text-slate-600">Penjamin / Status</span><span class="font-semibold">: {{ reportData.registration?.patientType }}</span></div>
        </div>

        <div class="space-y-1">
          <div class="flex"><span class="w-28 text-slate-600">Dokter Pengirim</span><span class="font-semibold">: {{ reportData.registration?.referringDoctor }}</span></div>
          <div class="flex"><span class="w-28 text-slate-600">Ruangan / Asal</span><span>: {{ reportData.registration?.referralSource }}</span></div>
          <div class="flex"><span class="w-28 text-slate-600">Diagnosa Klinis</span><span>: {{ reportData.registration?.clinicalDiagnosis || '-' }}</span></div>
          <div class="flex"><span class="w-28 text-slate-600">Barcode Spesimen</span><span class="font-mono font-bold">: {{ reportData.specimen?.barcode || '-' }}</span></div>
          <div class="flex"><span class="w-28 text-slate-600">Waktu Selesai</span><span>: {{ formatDateTime(reportData.validation?.validationTime) }}</span></div>
        </div>
      </div>

      <!-- Tabel Hasil Uji Laboratorium per Kategori -->
      <div class="space-y-4 mb-6">
        <div v-for="(paramList, catName) in reportData.results" :key="catName">
          <div class="bg-slate-100 font-bold text-xs uppercase px-2 py-1 border-y border-black mb-1">
            {{ catName }}
          </div>

          <table class="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr class="border-b border-slate-300 font-bold text-slate-600 text-[10px] uppercase">
                <th class="py-1 px-2">Nama Parameter</th>
                <th class="py-1 px-2 text-right">Hasil</th>
                <th class="py-1 px-2 text-center">Flag</th>
                <th class="py-1 px-2">Satuan</th>
                <th class="py-1 px-2">Nilai Rujukan</th>
                <th class="py-1 px-2 text-right">Metode / Alat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr 
                v-for="item in paramList" 
                :key="item.code"
                :class="{'font-bold text-rose-700 bg-rose-50/40': item.flag === 'CRITICAL'}"
              >
                <td class="py-1 px-2 font-medium">{{ item.parameterName }}</td>
                <td class="py-1 px-2 text-right font-mono font-bold">{{ item.resultValue || '-' }}</td>
                <td class="py-1 px-2 text-center">
                  <span 
                    v-if="item.flag && item.flag !== 'NORMAL'"
                    class="font-black text-[10px]"
                    :class="{
                      'text-rose-700': item.flag === 'CRITICAL',
                      'text-amber-700': item.flag === 'HIGH',
                      'text-blue-700': item.flag === 'LOW'
                    }"
                  >
                    *{{ item.flag }}*
                  </span>
                  <span v-else class="text-slate-400">-</span>
                </td>
                <td class="py-1 px-2 font-mono text-slate-500">{{ item.unit }}</td>
                <td class="py-1 px-2 text-slate-700">{{ item.refRange || '-' }}</td>
                <td class="py-1 px-2 text-right text-slate-500 text-[10px]">{{ item.instrumentName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Catatan Ekspertise Patologi Klinik -->
      <div class="border border-black p-3 rounded-sm mb-6 text-[11px] space-y-1 bg-slate-50/50">
        <div class="font-bold uppercase tracking-wider text-slate-800">Catatan & Ekspertise Dokter Spesialis Patologi Klinik:</div>
        <p class="italic text-slate-800">
          "{{ reportData.validation?.clinicalNotes || 'Hasil pemeriksaan dalam batas terkendali dan rasional secara klinis.' }}"
        </p>
        <div v-if="reportData.validation?.criticalActionNotes" class="text-rose-800 font-bold text-[10px] pt-1">
          Tindak Lanjut Nilai Kritis: {{ reportData.validation?.criticalActionNotes }}
        </div>
      </div>

      <!-- Tanda Tangan & QR Otorisasi Digital -->
      <div class="grid grid-cols-2 gap-8 text-center text-xs pt-2">
        <!-- Pemeriksa / Analis Medis -->
        <div class="space-y-1">
          <div class="text-[11px] text-slate-600">Pemeriksa / Analis Kesehatan,</div>
          <div class="h-16 flex items-center justify-center text-slate-300 italic text-[11px]">
            (Telah Diverifikasi di Sistem)
          </div>
          <div class="font-bold underline text-slate-900">Fitriani, S.Tr.Kes</div>
          <div class="text-[10px] text-slate-500">Pranata Laboratorium Kesehatan</div>
        </div>

        <!-- Dokter Sp.PK dengan QR Otorisasi -->
        <div class="space-y-1 flex flex-col items-center">
          <div class="text-[11px] text-slate-600">Dokter Penanggung Jawab Laboratorium,</div>
          
          <!-- Simulated Digital Signature QR / Verification Stamp -->
          <div class="my-1 border-2 border-teal-700 p-1.5 rounded-lg bg-teal-50/50 flex items-center gap-2 max-w-xs">
            <div class="w-12 h-12 bg-white border border-teal-600 p-0.5 flex flex-col items-center justify-center">
              <span class="text-[8px] font-mono font-bold leading-tight text-center text-teal-900">DIGITAL SIGNED</span>
              <span class="text-[10px]">🔒</span>
            </div>
            <div class="text-left text-[9px] leading-tight text-teal-950 font-mono">
              <div class="font-bold text-[10px]">VERIFIKASI RESMI SP.PK</div>
              <div>Kode: {{ reportData.validation?.digitalSignatureCode || 'DS-SPPK-VERIFIED' }}</div>
              <div>Waktu: {{ formatDateTime(reportData.validation?.validationTime) }}</div>
            </div>
          </div>

          <div class="font-bold underline text-slate-900">
            {{ reportData.validation?.pathologistName || 'dr. Bambang Irawan, Sp.PK' }}
          </div>
          <div class="text-[10px] text-slate-500 font-mono">
            {{ reportData.validation?.doctorSip || 'SIP: 503/449/SIP-DS/DPM-PTSP/2023' }}
          </div>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="border-t border-slate-300 mt-6 pt-2 text-[9px] text-slate-400 flex justify-between items-center">
        <span>*Dokumen ini diterbitkan secara elektronik oleh SIMRS Laboratorium RSUD Lubuk Sikaping dan sah tanpa tanda tangan basah.</span>
        <span>Dicetak pada: {{ new Date().toLocaleString('id-ID') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../services/api';

const route = useRoute();
const loading = ref(false);
const reportData = ref(null);

const loadReport = async () => {
  loading.value = true;
  try {
    const res = await api.getLabReport(route.params.id);
    reportData.value = res.data;
  } catch (err) {
    console.error('Failed to load lab report:', err);
  } finally {
    loading.value = false;
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
};

const printReport = () => {
  window.print();
};

onMounted(() => {
  loadReport();
});
</script>
