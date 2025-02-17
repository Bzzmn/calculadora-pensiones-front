const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
console.log('API_BASE_URL from runtime:', API_BASE_URL);

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
console.log('N8N_WEBHOOK_URL from runtime:', N8N_WEBHOOK_URL);

export const ENDPOINTS = {
  calculatePension: `${API_BASE_URL}/calculate_pension`,
  getSession: (sessionId: string) => `${API_BASE_URL}/get_session/${sessionId}`,
  sendEmail: `${API_BASE_URL}/send_email`,
  sendMessageToAgent: `${API_BASE_URL}/chat/send_message`,
  // Nuevos endpoints para el chat
  saveSession: (sessionId: string) => `${API_BASE_URL}/save_session/${sessionId}`,
  getChat: (sessionId: string) => `${API_BASE_URL}/chat/${sessionId}`,
  saveChat: (sessionId: string) => `${API_BASE_URL}/chat/${sessionId}/save`
};

// Debug log para ver las URLs finales
console.log('Endpoints configurados:', {
  calculatePension: ENDPOINTS.calculatePension,
  getSession: ENDPOINTS.getSession('test'),
  sendEmail: ENDPOINTS.sendEmail
}); 