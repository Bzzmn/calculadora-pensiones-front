const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log('API_BASE_URL from env:', import.meta.env.VITE_API_BASE_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL not found, using default URL');
  throw new Error('VITE_API_BASE_URL is required');
}

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