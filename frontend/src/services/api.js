const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, { ...options, headers });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server backend (port 5000) belum berjalan atau tidak merespons JSON. Pastikan server backend aktif.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Terjadi kesalahan pada server');
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Stats & Health
  getStats: () => request('/reports/stats'),
  getHealth: () => request('/health'),

  // Patients
  getPatients: (search = '') => request(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getPatientById: (id) => request(`/patients/${id}`),
  createPatient: (patientData) => request('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData)
  }),

  // Test Categories & Parameters (Pengaturan Layanan & Tarif)
  getCategories: () => request('/tests/categories'),
  createCategory: (payload) => request('/tests/categories', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateCategory: (id, payload) => request(`/tests/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteCategory: (id) => request(`/tests/categories/${id}`, {
    method: 'DELETE'
  }),

  getParameters: (categoryId = '', search = '') => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    return request(`/tests/parameters?${params.toString()}`);
  },
  createParameter: (payload) => request('/tests/parameters', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateParameter: (id, payload) => request(`/tests/parameters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteParameter: (id) => request(`/tests/parameters/${id}`, {
    method: 'DELETE'
  }),

  // Tahap 1: Registrations
  getRegistrations: (status = 'ALL', search = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return request(`/registrations?${params.toString()}`);
  },
  getRegistrationById: (id) => request(`/registrations/${id}`),
  createRegistration: (payload) => request('/registrations', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Tahap 2: Administrasi & Kasir
  getBillingQueue: () => request('/billing/queue'),
  verifyBilling: (regId, payload) => request(`/billing/${regId}/verify-pay`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  // Tahap 3: Pengambilan Spesimen & Flebotomi
  getSamplingQueue: () => request('/sampling/queue'),
  saveSpecimen: (regId, payload) => request(`/sampling/${regId}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Tahap 4: Pengolahan dan Analisis Sampel
  getAnalyzerWorklist: () => request('/analyzer/worklist'),
  saveAnalyzerResults: (regId, payload) => request(`/analyzer/${regId}/results`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Tahap 5: Validasi Dokter Sp.PK
  getValidationPending: () => request('/validation/pending'),
  validateResults: (regId, payload) => request(`/validation/${regId}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Laporan Hasil Lab Resmi
  getLabReport: (regId) => request(`/reports/lab-result/${regId}`),

  // Manajemen Pengguna & Role (Master Admin)
  getUsers: () => request('/auth/users'),
  getRoles: () => request('/auth/roles'),
  createUser: (payload) => request('/auth/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateUser: (id, payload) => request(`/auth/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteUser: (id) => request(`/auth/users/${id}`, {
    method: 'DELETE'
  })
};

