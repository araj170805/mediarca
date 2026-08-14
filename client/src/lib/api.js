import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

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

export const api = {
  // ─── AUTHENTICATION ────────────────────────────────────────────────────────
  async login(credentials) {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      // Master Admin fallback — works even when DB is completely offline
      if (
        credentials.email?.toLowerCase() === 'araj172007@gmail.com' &&
        credentials.password === 'mediarca@26'
      ) {
        return {
          success: true,
          data: {
            token: 'admin_fallback_jwt_token_2026',
            user: {
              _id: 'admin_super_user',
              name: 'MediArca Admin',
              email: 'araj172007@gmail.com',
              role: 'admin',
              isApproved: true,
              isActive: true,
            },
          },
        };
      }

      const serverMsg = err?.response?.data?.message;
      if (serverMsg) throw new Error(serverMsg);
      if (err?.code === 'ERR_NETWORK' || !err?.response) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw new Error(err?.message || 'Login failed. Please check your credentials.');
    }
  },

  async registerPatient(payload) {
    try {
      const res = await apiClient.post('/auth/signup/patient', payload);
      return res.data;
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      if (serverMsg) throw new Error(serverMsg);
      throw new Error(err?.message || 'Patient registration failed');
    }
  },

  async registerReceptionist(payload) {
    try {
      const res = await apiClient.post('/auth/signup/receptionist', payload);
      return res.data;
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      if (serverMsg) throw new Error(serverMsg);
      throw new Error(err?.message || 'Receptionist registration failed');
    }
  },

  async googleAuthPatient(idToken) {
    const res = await apiClient.post('/auth/google/patient', { idToken });
    return res.data;
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
    const res = await apiClient.post('/appointments', payload);
    return res.data;
  },

  async getPatientAppointments(params = {}) {
    const res = await apiClient.get('/appointments/my-appointments', { params });
    return res.data;
  },

  async cancelAppointment(appointmentId) {
    const res = await apiClient.put(`/appointments/${appointmentId}/cancel`);
    return res.data;
  },

  async getClinicAppointments(params = {}) {
    const res = await apiClient.get('/appointments/clinic', { params });
    return res.data;
  },

  async confirmAppointment(appointmentId) {
    const res = await apiClient.put(`/appointments/${appointmentId}/confirm`);
    return res.data;
  },

  async rejectAppointment(appointmentId) {
    const res = await apiClient.put(`/appointments/${appointmentId}/reject`);
    return res.data;
  },

  async completeAppointment(appointmentId) {
    const res = await apiClient.put(`/appointments/${appointmentId}/complete`);
    return res.data;
  },

  // ─── RECEPTIONIST DOCTOR MANAGEMENT ─────────────────────────────────────
  async addDoctor(payload) {
    const res = await apiClient.post('/doctors', payload);
    return res.data;
  },

  async getReceptionistDoctors() {
    try {
      const res = await apiClient.get('/doctors/clinic/my-doctors');
      return res.data;
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  async toggleDoctorStatus(doctorId, isActive) {
    const res = await apiClient.patch(`/doctors/${doctorId}/status`, { isActive });
    return res.data;
  },

  // ─── USER PROFILE & FAMILY MEMBERS ───────────────────────────────────────
  async updatePatientProfile(payload) {
    const res = await apiClient.put('/users/profile', payload);
    return res.data;
  },

  async addFamilyMember(payload) {
    const res = await apiClient.post('/users/family-members', payload);
    return res.data;
  },

  async updateFamilyMember(memberId, payload) {
    const res = await apiClient.put(`/users/family-members/${memberId}`, payload);
    return res.data;
  },

  async deleteFamilyMember(memberId) {
    const res = await apiClient.delete(`/users/family-members/${memberId}`);
    return res.data;
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
