import { ApiResponse } from '../types/pension';
import { v4 as uuidv4 } from 'uuid';
import { ENDPOINTS } from '../config/endpoints';
import { ChatData } from '../types/chat';

export const SESSION_KEY = 'pension_calculator_session';
const CHAT_DATA_KEY = 'chat_data';

export const sessionService = {
  getSessionId(): string | null {
    return localStorage.getItem(SESSION_KEY);
  },

  createSessionId(): string {
    const sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
    return sessionId;
  },

  getChatData(): ChatData | null {
    const chatDataStr = localStorage.getItem(CHAT_DATA_KEY);
    return chatDataStr ? JSON.parse(chatDataStr) : null;
  },

  saveChatData(chatData: ChatData): void {
    localStorage.setItem(CHAT_DATA_KEY, JSON.stringify(chatData));
  },

  async getSessionData(): Promise<ApiResponse & { chatData?: ChatData } | null> {
    try {
      // Solo obtener el sessionId existente, no crear uno nuevo
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        return null;
      }
      console.log('Session ID obtenido:', sessionId);
      console.log('URL usada:', ENDPOINTS.getSession(sessionId));
      console.log('Fetching session data...');
      const response = await fetch(ENDPOINTS.getSession(sessionId));
      if (!response.ok) {
        if (response.status === 404) {
          this.clearSessionOnly();
          return null;
        }
        throw new Error('Error fetching session');
      }

      console.log('Respuesta recibida:', response);

      // Obtener los datos del chat del localStorage
      const chatData = localStorage.getItem(CHAT_DATA_KEY);
      const sessionData = await response.json();

      return {
        ...sessionData,
        chatData: chatData ? JSON.parse(chatData) : null
      };
    } catch (error) {
      console.error('Error recuperando datos de sesión:', error);
      return null;
    }
  },

  // async saveSessionData(data: ApiResponse & { chatData?: any }): Promise<void> {
  //   try {
  //     const sessionId = this.getSessionId();
  //     const { chatData } = data;
      
  //     // Guardar datos del chat en localStorage
  //     if (chatData) {
  //       localStorage.setItem(CHAT_DATA_KEY, JSON.stringify(chatData));
  //     }
  //   } catch (error) {
  //     console.error('Error guardando datos de sesión:', error);
  //     throw error;
  //   }
  // },

  clearSessionOnly(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  clearSession(): void {
    this.clearSessionOnly();
    localStorage.removeItem(CHAT_DATA_KEY);
  }
}; 