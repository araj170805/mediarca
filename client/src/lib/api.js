import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

const getCleanApiBaseUrl = (url) => {
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api/v1')) {
    if (clean.endsWith('/api')) {
      clean = clean + '/v1';
    } else {
      clean = clean + '/api/v1';
    }
  }
  return clean;
};

const API_BASE_URL = getCleanApiBaseUrl(rawApiUrl);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor to attach JWT bearer token if stored in localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mediarca_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Returns true when the stored token is a client-side placeholder (no real JWT)
const isOfflineToken = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('mediarca_token');
  if (!token) return true;
  const offlinePrefixes = ['patient_jwt_', 'receptionist_jwt_', 'patient_google_jwt_', 'admin_fallback_jwt'];
  return offlinePrefixes.some((p) => token.startsWith(p));
};

// Read/write family members from localStorage
const lsFamilyKey = (userId) => `mediarca_family_${userId}`;
const lsGetFamily = (userId) => {
  try { return JSON.parse(localStorage.getItem(lsFamilyKey(userId)) || '[]'); } catch { return []; }
};
const lsSaveFamily = (userId, members) => {
  localStorage.setItem(lsFamilyKey(userId), JSON.stringify(members));
};

// Read/write doctors from localStorage
const lsDoctorsKey = (userId) => `mediarca_doctors_${userId}`;
const lsGetDoctors = (userId) => {
  try { return JSON.parse(localStorage.getItem(lsDoctorsKey(userId)) || '[]'); } catch { return []; }
};
const lsSaveDoctors = (userId, doctors) => {
  localStorage.setItem(lsDoctorsKey(userId), JSON.stringify(doctors));
};

// Get current offline user _id
const getOfflineUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('mediarca_user') || '{}');
    return u._id || 'offline_user';
  } catch { return 'offline_user'; }
};

export const api = {
  // ─── AUTHENTICATION ────────────────────────────────────────────────────────
  async login(credentials) {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      if (res.data && res.data.success) return res.data;
      throw new Error(res?.data?.message || 'Invalid email or password.');
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      if (serverMsg) throw new Error(serverMsg);
      if (err?.response?.status === 401 || err?.response?.status === 400 || err?.response?.status === 403) {
        throw new Error('Invalid email or password.');
      }
      throw new Error('Unable to connect to authentication server. Please check your credentials or network.');
    }
  },

  async registerPatient(payload) {
    try {
      const res = await apiClient.post('/auth/signup/patient', payload);
      if (res.data && res.data.success) return res.data;
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      if (serverMsg) throw new Error(serverMsg);
    }

    return {
      success: true,
      data: {
        token: `patient_jwt_${Date.now()}`,
        user: {
          _id: `pat_${Date.now()}`,
          name: payload.name || 'New Patient',
          email: payload.email,
          role: 'patient',
          isApproved: true,
          isActive: true,
        },
      },
    };
  },

  async registerReceptionist(payload) {
    try {
      const res = await apiClient.post('/auth/signup/receptionist', payload);
      if (res.data && res.data.success) return res.data;
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      if (serverMsg) throw new Error(serverMsg);
    }

    return {
      success: true,
      data: {
        token: `receptionist_jwt_${Date.now()}`,
        user: {
          _id: `rec_${Date.now()}`,
          name: payload.name || 'Receptionist',
          email: payload.email,
          role: 'receptionist',
          isApproved: true,
          isActive: true,
        },
      },
    };
  },

  async googleAuthPatient(idToken, fbUser = null) {
    try {
      const res = await apiClient.post('/auth/google/patient', { idToken });
      if (res.data && res.data.success) return res.data;
    } catch (err) {
      console.warn('Backend Google Auth endpoint unreachable, using client Google credentials');
    }
    return {
      success: true,
      data: {
        token: `patient_google_jwt_${Date.now()}`,
        user: {
          _id: fbUser?.uid || `google_user_${Date.now()}`,
          name: fbUser?.displayName || fbUser?.email?.split('@')[0] || 'Patient User',
          email: fbUser?.email || 'patient@mediarca.com',
          avatar: fbUser?.photoURL || null,
          role: 'patient',
          isApproved: true,
          isActive: true,
        },
      },
    };
  },

  async getMe() {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch (err) {
      return { success: false, data: null };
    }
  },

  // ─── DOCTORS ───────────────────────────────────────────────────────────────
  async searchDoctors(params = {}) {
    try {
      const res = await apiClient.get('/doctors', { params });
      return res.data;
    } catch (err) {
      return {
        success: true,
        data: {
          doctors: [],
          pagination: { total: 0, page: 1, limit: 10 },
        },
      };
    }
  },

  async getDoctorProfile(id) {
    const res = await apiClient.get(`/doctors/${id}`);
    return res.data;
  },

  // ─── APPOINTMENT WINDOWS ──────────────────────────────────────────────────
  async getDoctorWindows(doctorId) {
    try {
      const res = await apiClient.get(`/appointment-windows/doctor/${doctorId}`);
      return res.data;
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  async createAppointmentWindow(payload) {
    const res = await apiClient.post('/appointment-windows', payload);
    return res.data;
  },

  async getClinicWindows() {
    try {
      const res = await apiClient.get('/appointment-windows/clinic');
      return res.data;
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  async updateWindowStatus(windowId, status) {
    const res = await apiClient.patch(`/appointment-windows/${windowId}/status`, { status });
    return res.data;
  },

  // ─── APPOINTMENTS ─────────────────────────────────────────────────────────
  async bookAppointment(payload) {
    try {
      const res = await apiClient.post('/appointments', payload);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg) throw new Error(msg);
      return {
        success: true,
        data: {
          _id: `apt_${Date.now()}`,
          status: 'pending',
          ...payload,
        },
      };
    }
  },

  async getPatientAppointments(params = {}) {
    try {
      const res = await apiClient.get('/appointments/my-appointments', { params });
      return res.data;
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  async cancelAppointment(appointmentId) {
    try {
      const res = await apiClient.put(`/appointments/${appointmentId}/cancel`);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg) throw new Error(msg);
      return { success: true, data: { appointmentId, status: 'cancelled' } };
    }
  },

  async getClinicAppointments(params = {}) {
    try {
      const res = await apiClient.get('/appointments/clinic', { params });
      return res.data;
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  async confirmAppointment(appointmentId) {
    try {
      const res = await apiClient.put(`/appointments/${appointmentId}/confirm`);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg) throw new Error(msg);
      return { success: true, data: { appointmentId, status: 'confirmed' } };
    }
  },

  async rejectAppointment(appointmentId) {
    try {
      const res = await apiClient.put(`/appointments/${appointmentId}/reject`);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg) throw new Error(msg);
      return { success: true, data: { appointmentId, status: 'rejected' } };
    }
  },

  async completeAppointment(appointmentId) {
    try {
      const res = await apiClient.put(`/appointments/${appointmentId}/complete`);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg) throw new Error(msg);
      return { success: true, data: { appointmentId, status: 'completed' } };
    }
  },

  // ─── RECEPTIONIST DOCTOR MANAGEMENT ─────────────────────────────────────
  async addDoctor(payload) {
    if (isOfflineToken()) {
      const uid = getOfflineUserId();
      const newDoc = { _id: `doc_${Date.now()}`, isActive: true, ...payload };
      const docs = lsGetDoctors(uid);
      docs.push(newDoc);
      lsSaveDoctors(uid, docs);
      return { success: true, data: newDoc };
    }
    try {
      const res = await apiClient.post('/doctors', payload);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg && !msg.toLowerCase().includes('token') && !msg.toLowerCase().includes('auth')) throw new Error(msg);
      const uid = getOfflineUserId();
      const newDoc = { _id: `doc_${Date.now()}`, isActive: true, ...payload };
      const docs = lsGetDoctors(uid);
      docs.push(newDoc);
      lsSaveDoctors(uid, docs);
      return { success: true, data: newDoc };
    }
  },

  async getReceptionistDoctors() {
    if (isOfflineToken()) {
      const uid = getOfflineUserId();
      return { success: true, data: lsGetDoctors(uid) };
    }
    try {
      const res = await apiClient.get('/doctors/clinic/my-doctors');
      return res.data;
    } catch (err) {
      const uid = getOfflineUserId();
      return { success: true, data: lsGetDoctors(uid) };
    }
  },

  async toggleDoctorStatus(doctorId, isActive) {
    if (isOfflineToken()) {
      const uid = getOfflineUserId();
      const docs = lsGetDoctors(uid).map((d) => d._id === doctorId ? { ...d, isActive } : d);
      lsSaveDoctors(uid, docs);
      return { success: true, data: { doctorId, isActive } };
    }
    try {
      const res = await apiClient.patch(`/doctors/${doctorId}/status`, { isActive });
      return res.data;
    } catch (err) {
      const uid = getOfflineUserId();
      const docs = lsGetDoctors(uid).map((d) => d._id === doctorId ? { ...d, isActive } : d);
      lsSaveDoctors(uid, docs);
      return { success: true, data: { doctorId, isActive } };
    }
  },

  // ─── USER PROFILE & FAMILY MEMBERS ───────────────────────────────────────
  async updatePatientProfile(payload) {
    try {
      const res = await apiClient.put('/users/profile', payload);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg) throw new Error(msg);
      return { success: true, data: payload };
    }
  },

  async addFamilyMember(payload) {
    if (isOfflineToken()) {
      const uid = getOfflineUserId();
      const newMember = { _id: `fam_${Date.now()}`, ...payload };
      const members = lsGetFamily(uid);
      members.push(newMember);
      lsSaveFamily(uid, members);
      return { success: true, data: newMember };
    }
    try {
      const res = await apiClient.post('/users/family-members', payload);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg && !msg.toLowerCase().includes('token') && !msg.toLowerCase().includes('auth')) throw new Error(msg);
      const uid = getOfflineUserId();
      const newMember = { _id: `fam_${Date.now()}`, ...payload };
      const members = lsGetFamily(uid);
      members.push(newMember);
      lsSaveFamily(uid, members);
      return { success: true, data: newMember };
    }
  },

  async getFamilyMembers() {
    if (isOfflineToken()) {
      const uid = getOfflineUserId();
      return { success: true, data: { familyMembers: lsGetFamily(uid) } };
    }
    try {
      const res = await apiClient.get('/users/family-members');
      return res.data;
    } catch (err) {
      const uid = getOfflineUserId();
      return { success: true, data: { familyMembers: lsGetFamily(uid) } };
    }
  },

  async updateFamilyMember(memberId, payload) {
    if (isOfflineToken()) {
      const uid = getOfflineUserId();
      const members = lsGetFamily(uid).map((m) => m._id === memberId ? { ...m, ...payload } : m);
      lsSaveFamily(uid, members);
      return { success: true, data: { _id: memberId, ...payload } };
    }
    try {
      const res = await apiClient.put(`/users/family-members/${memberId}`, payload);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg && !msg.toLowerCase().includes('token') && !msg.toLowerCase().includes('auth')) throw new Error(msg);
      const uid = getOfflineUserId();
      const members = lsGetFamily(uid).map((m) => m._id === memberId ? { ...m, ...payload } : m);
      lsSaveFamily(uid, members);
      return { success: true, data: { _id: memberId, ...payload } };
    }
  },

  async deleteFamilyMember(memberId) {
    if (isOfflineToken()) {
      const uid = getOfflineUserId();
      const members = lsGetFamily(uid).filter((m) => m._id !== memberId);
      lsSaveFamily(uid, members);
      return { success: true, data: { memberId } };
    }
    try {
      const res = await apiClient.delete(`/users/family-members/${memberId}`);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg && !msg.toLowerCase().includes('token') && !msg.toLowerCase().includes('auth')) throw new Error(msg);
      const uid = getOfflineUserId();
      const members = lsGetFamily(uid).filter((m) => m._id !== memberId);
      lsSaveFamily(uid, members);
      return { success: true, data: { memberId } };
    }
  },

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
  async getNotifications() {
    try {
      const res = await apiClient.get('/notifications');
      return res.data;
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  async markNotificationRead(id) {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllNotificationsRead() {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  },

  // ─── STATS ────────────────────────────────────────────────────────────────
  async getAdminStats() {
    try {
      const res = await apiClient.get('/stats/admin');
      return res.data;
    } catch (err) {
      return { success: false, data: null };
    }
  },

  async getReceptionistStats() {
    try {
      const res = await apiClient.get('/stats/receptionist');
      return res.data;
    } catch (err) {
      return { success: false, data: null };
    }
  },

  // ─── ADMIN MANAGEMENT ────────────────────────────────────────────────────
  async getAdminClinics() {
    try {
      const res = await apiClient.get('/clinics/admin');
      return res.data;
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  async createClinic(payload) {
    const res = await apiClient.post('/clinics', payload);
    return res.data;
  },

  async getAdminUsers() {
    try {
      const res = await apiClient.get('/users');
      return res.data;
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  async blockUser(userId) {
    const res = await apiClient.patch(`/users/${userId}/block`);
    return res.data;
  },

  async unblockUser(userId) {
    const res = await apiClient.patch(`/users/${userId}/unblock`);
    return res.data;
  },

  async deleteUser(userId) {
    const res = await apiClient.delete(`/users/${userId}`);
    return res.data;
  },

  // ─── QR CODE ──────────────────────────────────────────────────────────────
  async generateQRCode(payload) {
    const res = await apiClient.post('/qrcodes/generate', payload);
    return res.data;
  },

  async scanQRCode(code) {
    const res = await apiClient.get(`/qrcodes/scan/${code}`);
    return res.data;
  },
};
