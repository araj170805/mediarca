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

// Surface real backend errors instead of fabricating offline responses
const handleApiError = (err, fallbackMessage) => {
  const serverMsg = err?.response?.data?.message;
  if (serverMsg) throw new Error(serverMsg);
  if (err?.response) {
    throw new Error(`Request failed with status ${err.response.status}.`);
  }
  throw new Error(fallbackMessage);
};

export const api = {
  // ─── AUTHENTICATION ────────────────────────────────────────────────────────
  async login(credentials) {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      if (res.data && res.data.success) return res.data;
      throw new Error(res?.data?.message || 'Invalid email or password.');
    } catch (err) {
      if (err instanceof Error && err.message && !err.message.includes('status')) throw err;
      handleApiError(err, 'Unable to connect to authentication server. Please check your network.');
    }
  },

  async registerPatient(payload) {
    try {
      const res = await apiClient.post('/auth/signup/patient', payload);
      if (res.data && res.data.success) return res.data;
      throw new Error(res?.data?.message || 'Registration failed.');
    } catch (err) {
      if (err instanceof Error && err.message && !err.message.includes('status') && !err.message.startsWith('Network Error')) throw err;
      handleApiError(err, 'Unable to connect to the server. Please check your network.');
    }
  },

  async registerReceptionist(payload) {
    try {
      const res = await apiClient.post('/auth/signup/receptionist', payload);
      if (res.data && res.data.success) return res.data;
      throw new Error(res?.data?.message || 'Registration failed.');
    } catch (err) {
      if (err instanceof Error && err.message && !err.message.includes('status') && !err.message.startsWith('Network Error')) throw err;
      handleApiError(err, 'Unable to connect to the server. Please check your network.');
    }
  },

  async googleAuthPatient(idToken) {
    try {
      const res = await apiClient.post('/auth/google/patient', { idToken });
      if (res.data && res.data.success) return res.data;
      throw new Error(res?.data?.message || 'Google sign-in failed.');
    } catch (err) {
      if (err instanceof Error && err.message && !err.message.includes('status') && !err.message.startsWith('Network Error')) throw err;
      handleApiError(err, 'Unable to reach the authentication server for Google sign-in.');
    }
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
      handleApiError(err, 'Unable to load doctors. Please check your connection.');
    }
  },

  async getDoctorProfile(id) {
    const res = await apiClient.get(`/doctors/${id}`);
    return res.data;
  },

  // ─── APPOINTMENT WINDOWS ──────────────────────────────────────────────────
  async getDoctorWindows(doctorId) {
    const res = await apiClient.get(`/appointment-windows/doctor/${doctorId}`);
    return res.data;
  },

  async createAppointmentWindow(payload) {
    const res = await apiClient.post('/appointment-windows', payload);
    return res.data;
  },

  async getClinicWindows() {
    const res = await apiClient.get('/appointment-windows/clinic');
    return res.data;
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
      handleApiError(err, 'Booking failed. Please check your connection and try again.');
    }
  },

  async getPatientAppointments(params = {}) {
    const res = await apiClient.get('/appointments/my-appointments', { params });
    return res.data;
  },

  async cancelAppointment(appointmentId) {
    try {
      const res = await apiClient.put(`/appointments/${appointmentId}/cancel`);
      return res.data;
    } catch (err) {
      handleApiError(err, 'Failed to cancel appointment.');
    }
  },

  async getClinicAppointments(params = {}) {
    const res = await apiClient.get('/appointments/clinic', { params });
    return res.data;
  },

  async confirmAppointment(appointmentId) {
    try {
      const res = await apiClient.put(`/appointments/${appointmentId}/confirm`);
      return res.data;
    } catch (err) {
      handleApiError(err, 'Failed to confirm appointment.');
    }
  },

  async rejectAppointment(appointmentId) {
    try {
      const res = await apiClient.put(`/appointments/${appointmentId}/reject`);
      return res.data;
    } catch (err) {
      handleApiError(err, 'Failed to reject appointment.');
    }
  },

  async completeAppointment(appointmentId) {
    try {
      const res = await apiClient.put(`/appointments/${appointmentId}/complete`);
      return res.data;
    } catch (err) {
      handleApiError(err, 'Failed to complete appointment.');
    }
  },

  // ─── RECEPTIONIST DOCTOR MANAGEMENT ─────────────────────────────────────
  async addDoctor(payload) {
    try {
      const res = await apiClient.post('/doctors', payload);
      return res.data;
    } catch (err) {
      handleApiError(err, 'Failed to add doctor.');
    }
  },

  async getReceptionistDoctors() {
    const res = await apiClient.get('/doctors/clinic/my-doctors');
    return res.data;
  },

  async toggleDoctorStatus(doctorId, isActive) {
    try {
      const res = await apiClient.patch(`/doctors/${doctorId}/status`, { isActive });
      return res.data;
    } catch (err) {
      handleApiError(err, 'Failed to update doctor status.');
    }
  },

  // ─── USER PROFILE & FAMILY MEMBERS ───────────────────────────────────────
  async updatePatientProfile(payload) {
    try {
      const res = await apiClient.put('/users/profile', payload);
      return res.data;
    } catch (err) {
      handleApiError(err, 'Failed to update profile.');
    }
  },

  async addFamilyMember(payload) {
    try {
      const res = await apiClient.post('/users/family-members', payload);
      return res.data;
    } catch (err) {
      handleApiError(err, 'Failed to add family member.');
    }
  },

  async getFamilyMembers() {
    const res = await apiClient.get('/users/family-members');
    return res.data;
  },

  async updateFamilyMember(memberId, payload) {
    try {
      const res = await apiClient.put(`/users/family-members/${memberId}`, payload);
      return res.data;
    } catch (err) {
      handleApiError(err, 'Failed to update family member.');
    }
  },

  async deleteFamilyMember(memberId) {
    try {
      const res = await apiClient.delete(`/users/family-members/${memberId}`);
      return res.data;
    } catch (err) {
      handleApiError(err, 'Failed to delete family member.');
    }
  },

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
  async getNotifications() {
    const res = await apiClient.get('/notifications');
    return res.data;
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
