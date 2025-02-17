import { create } from 'zustand';
import { calculatePension } from '../services/api';
import { PensionFormData, ApiResponse } from '../types/pension';

interface SessionState {
  sessionId: string | null;
  sessionData: ApiResponse | null;
  isLoading: boolean;
  error: string | null;
  initializeSession: () => void;
  calculateAndSave: (formData: PensionFormData) => Promise<void>;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  sessionData: null,
  isLoading: false,
  error: null,

  initializeSession: () => {
    const sessionId = crypto.randomUUID();
    set({ sessionId });
  },

  calculateAndSave: async (formData: PensionFormData) => {
    try {
      set({ isLoading: true, error: null });
      
      const sessionId = get().sessionId;
      if (!sessionId) {
        throw new Error('No hay sesión activa');
      }

      const result = await calculatePension(formData, sessionId);
      
      set({
        sessionData: result,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Error in calculateAndSave:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false 
      });
      throw error;
    }
  },

  clearSession: () => {
    set({
      sessionId: null,
      sessionData: null,
      error: null
    });
  }
})); 