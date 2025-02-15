const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://calculadorapension.thefullstack.digital/api';

export const ENDPOINTS = {
  calculatePension: `${API_BASE_URL}/calculate_pension`,
  getSession: (sessionId: string) => `${API_BASE_URL}/get_session/${sessionId}`,
  sendEmail: `${API_BASE_URL}/send_email`
}; 