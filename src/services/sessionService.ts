import { ApiResponse } from '../types/pension';
import { v4 as uuidv4 } from 'uuid';
import { ENDPOINTS } from '../config/endpoints';

const SESSION_KEY = 'pension_session_id';

export const sessionService = {
  getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  },

  async getSessionData(): Promise<ApiResponse | null> {
    try {
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        return null;
      }

      const response = await fetch(ENDPOINTS.getSession(sessionId));
      if (!response.ok) {
        if (response.status === 404) {
          this.clearSession();
          return null;
        }
        throw new Error('Error fetching session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error recuperando datos de sesión:', error);
      this.clearSession();
      return null;
    }
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }
}; 