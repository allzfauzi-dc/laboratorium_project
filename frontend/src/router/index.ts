import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import Step1RegistrationView from '../views/Step1RegistrationView.vue';
import Step2BillingView from '../views/Step2BillingView.vue';
import Step3SamplingView from '../views/Step3SamplingView.vue';
import Step4AnalyzerView from '../views/Step4AnalyzerView.vue';
import Step5ValidationView from '../views/Step5ValidationView.vue';
import LabReportPrintView from '../views/LabReportPrintView.vue';
import MasterSettingsView from '../views/MasterSettingsView.vue';
import UserManagementView from '../views/UserManagementView.vue';
import LoginView from '../views/LoginView.vue';
import { authState } from '../services/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { title: 'Login Petugas Portal LIS' }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard Alur Laboratorium' }
  },
  {
    path: '/pengaturan-tarif',
    name: 'PengaturanTarif',
    component: MasterSettingsView,
    meta: { title: 'Pengaturan Pelayanan & Tarif Laboratorium' }
  },
  {
    path: '/manajemen-pengguna',
    name: 'ManajemenPengguna',
    component: UserManagementView,
    meta: { title: 'Master Manajemen Pengguna & Role' }
  },
  {
    path: '/tahap-1',
    name: 'Pendaftaran',
    component: Step1RegistrationView,
    meta: { title: 'Tahap 1: Pendaftaran & Penerimaan Rujukan' }
  },
  {
    path: '/tahap-2',
    name: 'Administrasi',
    component: Step2BillingView,
    meta: { title: 'Tahap 2: Proses Administrasi & Kasir' }
  },
  {
    path: '/tahap-3',
    name: 'Sampling',
    component: Step3SamplingView,
    meta: { title: 'Tahap 3: Pengambilan Spesimen & Barcode' }
  },
  {
    path: '/tahap-4',
    name: 'Analisis',
    component: Step4AnalyzerView,
    meta: { title: 'Tahap 4: Pengolahan dan Analisis Sampel' }
  },
  {
    path: '/tahap-5',
    name: 'Validasi',
    component: Step5ValidationView,
    meta: { title: 'Tahap 5: Validasi Hasil Dokter Sp.PK' }
  },
  {
    path: '/cetak-hasil/:id',
    name: 'CetakHasil',
    component: LabReportPrintView,
    meta: { title: 'Cetak Lembar Resmi Hasil Laboratorium' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Laboratorium RS'} | SIMRS LIS`;

  // 1. Cek autentikasi: jika belum login dan bukan ke /login -> arahkan ke /login
  if (!authState.isAuthenticated.value && to.path !== '/login') {
    return next('/login');
  }

  // 2. Jika sudah login dan membuka /login -> arahkan ke dashboard/halaman utama role
  if (authState.isAuthenticated.value && to.path === '/login') {
    if (authState.userRole.value === 'ANALIS') return next('/tahap-4');
    if (authState.userRole.value === 'DOKTER_SPPK') return next('/tahap-5');
    if (authState.userRole.value === 'FLEBOTOMIS') return next('/tahap-3');
    if (authState.userRole.value === 'KASIR') return next('/tahap-2');
    if (authState.userRole.value === 'RESEPSIONIS') return next('/tahap-1');
    return next('/');
  }

  // 3. Cek Hak Akses (Role-Based Access Control)
  if (authState.isAuthenticated.value && to.path !== '/login') {
    if (!authState.canAccess(to.path)) {
      alert(`⚠️ Akses Dibatasi: Akun Anda (${authState.roleTitle.value}) hanya memiliki izin akses untuk alurnya sendiri. Anda dialihkan ke halaman yang diizinkan.`);
      
      if (authState.userRole.value === 'ANALIS') return next('/tahap-4');
      if (authState.userRole.value === 'DOKTER_SPPK') return next('/tahap-5');
      if (authState.userRole.value === 'FLEBOTOMIS') return next('/tahap-3');
      if (authState.userRole.value === 'KASIR') return next('/tahap-2');
      if (authState.userRole.value === 'RESEPSIONIS') return next('/tahap-1');
      return next('/');
    }
  }

  next();
});

export default router;
