declare global {
  interface Window {
    env?: {
      VITE_API_BASE_URL: string;
    };
  }
}

const API_BASE_URL = window.env?.VITE_API_BASE_URL || 'http://localhost:3000/api';
console.log('API_BASE_URL from runtime:', API_BASE_URL);

export const ENDPOINTS = {
  calculatePension: `${API_BASE_URL}/calculate_pension`,
  getSession: (sessionId: string) => `${API_BASE_URL}/get_session/${sessionId}`,
  sendEmail: `${API_BASE_URL}/send_email`
};

// Debug log para ver las URLs finales
console.log('Endpoints configurados:', {
  calculatePension: ENDPOINTS.calculatePension,
  getSession: ENDPOINTS.getSession('test'),
  sendEmail: ENDPOINTS.sendEmail
}); 