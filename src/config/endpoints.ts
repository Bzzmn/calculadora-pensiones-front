const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8020/api';
const CHAT_AGENT_URL = import.meta.env.VITE_CHAT_AGENT_URL;

export const ENDPOINTS = {
  calculatePension: `${API_BASE_URL}/calculate_pension`,
  getSession: (sessionId: string) => `${API_BASE_URL}/get_session/${sessionId}`,
  sendEmail: `${API_BASE_URL}/send_email`,
  sendMessageToAgent: `${CHAT_AGENT_URL}`,
  // Nuevos endpoints para el chat
  saveSession: (sessionId: string) => `${API_BASE_URL}/save_session/${sessionId}`,
  getChat: (sessionId: string) => `${API_BASE_URL}/chat/${sessionId}`,
  saveChat: (sessionId: string) => `${API_BASE_URL}/chat/${sessionId}/save`
};