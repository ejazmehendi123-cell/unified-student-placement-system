import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('usps_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('usps_token');
      localStorage.removeItem('usps_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (data: any) => api.post('/auth/login', data).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  getMe: () => api.get('/auth/me').then(r => r.data),
  changePassword: (data: any) => api.post('/auth/password/change', data).then(r => r.data),
  forgotPassword: (data: any) => api.post('/auth/password/forgot', data).then(r => r.data),
  enrollMfa: () => api.post('/auth/mfa/enroll').then(r => r.data),
  verifyMfa: (data: any) => api.post('/auth/mfa/verify', data).then(r => r.data),
};

export const studentApi = {
  getProfile: () => api.get('/students/me/profile').then(r => r.data),
  updateProfile: (data: any) => api.put('/students/me/profile', data).then(r => r.data),
  addSkill: (data: any) => api.post('/students/me/skills', data).then(r => r.data),
  removeSkill: (id: string) => api.delete(`/students/me/skills/${id}`).then(r => r.data),
  addProject: (data: any) => api.post('/students/me/projects', data).then(r => r.data),
  removeProject: (id: string) => api.delete(`/students/me/projects/${id}`).then(r => r.data),
  addCertification: (data: any) => api.post('/students/me/certifications', data).then(r => r.data),
  removeCertification: (id: string) => api.delete(`/students/me/certifications/${id}`).then(r => r.data),
  uploadResume: (formData: FormData) => api.post('/students/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  getDrives: () => api.get('/students/me/drives').then(r => r.data),
  getDriveEligibility: (id: string) => api.get(`/students/me/drives/${id}/eligibility`).then(r => r.data),
  getApplications: () => api.get('/students/me/applications').then(r => r.data),
  applyDrive: (driveId: string) => api.post('/students/me/applications', { driveId }).then(r => r.data),
  withdrawApplication: (id: string) => api.delete(`/students/me/applications/${id}`).then(r => r.data),
  getInterviews: () => api.get('/students/me/interviews').then(r => r.data),
  getOffers: () => api.get('/students/me/offers').then(r => r.data),
  acceptOffer: (id: string) => api.post(`/students/me/offers/${id}/accept`).then(r => r.data),
  declineOffer: (id: string, reason?: string) => api.post(`/students/me/offers/${id}/decline`, { reason }).then(r => r.data),
  downloadCertificate: () => api.get('/students/me/certificate', { responseType: 'blob' }).then(r => r.data),
};

export const recruiterApi = {
  getMyDrives: () => api.get('/recruiter/drives/mine').then(r => r.data),
  getDriveById: (id: string) => api.get(`/recruiter/drives/${id}`).then(r => r.data),
  createDrive: (data: any) => api.post('/recruiter/drives', data).then(r => r.data),
  updateDrive: (id: string, data: any) => api.put(`/recruiter/drives/${id}`, data).then(r => r.data),
  getApplicants: (driveId: string, params?: any) => api.get(`/recruiter/drives/${driveId}/applications`, { params }).then(r => r.data),
  shortlistCandidate: (driveId: string, appId: string, reason?: string) => api.post(`/recruiter/drives/${driveId}/applications/${appId}/shortlist`, { reason }).then(r => r.data),
  rejectCandidate: (driveId: string, appId: string, reason?: string) => api.post(`/recruiter/drives/${driveId}/applications/${appId}/reject`, { reason }).then(r => r.data),
  scheduleInterview: (driveId: string, data: any) => api.post(`/recruiter/drives/${driveId}/rounds`, data).then(r => r.data),
  issueOffer: (driveId: string, data: any) => api.post(`/recruiter/drives/${driveId}/offers`, data).then(r => r.data),
  getInterviews: () => api.get('/recruiter/interviews').then(r => r.data),
};

export const adminApi = {
  getAllDrives: () => api.get('/admin/drives').then(r => r.data),
  approveDrive: (id: string) => api.post(`/admin/drives/${id}/approve`).then(r => r.data),
  rejectDrive: (id: string, reason: string) => api.post(`/admin/drives/${id}/reject`, { reason }).then(r => r.data),
  overrideEligibility: (data: any) => api.post('/admin/eligibility-overrides', data).then(r => r.data),
  overridePolicy: (data: any) => api.post('/admin/offers/override-policy', data).then(r => r.data),
  getStudents: () => api.get('/admin/students').then(r => r.data),
  getUsers: () => api.get('/admin/users').then(r => r.data),
  updateUserStatus: (id: string, isActive: boolean) => api.patch(`/admin/users/${id}/status`, { isActive }).then(r => r.data),
  getAuditLogs: (params?: any) => api.get('/admin/audit-log', { params }).then(r => r.data),
  syncSIS: (students?: any[]) => api.post('/admin/sis/sync', { students }).then(r => r.data),
  getSampleSIS: () => api.get('/admin/sis/sample').then(r => r.data),
};

export const reportApi = {
  getSummary: () => api.get('/reports/summary').then(r => r.data),
  getDepartments: () => api.get('/reports/departments').then(r => r.data),
  getCompanies: () => api.get('/reports/companies').then(r => r.data),
  getPackages: () => api.get('/reports/packages').then(r => r.data),
};

export const notificationApi = {
  getMyNotifications: () => api.get('/notifications/me').then(r => r.data),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllAsRead: () => api.patch('/notifications/read-all').then(r => r.data),
};
