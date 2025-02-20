import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculatePension } from '../services/api';
import { PensionFormData, ApiResponse } from '../types/pension';
import { Message } from '../types/chat';
import { generateUUID } from '../utils/uuid';

interface SessionState {
  sessionId: string | null;
  sessionData: ApiResponse | null;
  isLoading: boolean;
  error: string | null;
  emailSent: boolean;
  chatInitialized: boolean;
  chatMessages: Message[];
  userData: {
    nombre: string;
    genero: 'Masculino' | 'Femenino';
    edad: {
      anos: number;
      meses: number;
    };
    nivelEstudios: string;
  } | null;
  initializeSession: () => void;
  calculateAndSave: (formData: PensionFormData) => Promise<void>;
  setEmailSent: (sent: boolean) => void;
  setChatInitialized: (initialized: boolean) => void;
  addChatMessage: (message: Message) => void;
  addChatMessages: (messages: Message[]) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      sessionData: null,
      isLoading: false,
      error: null,
      emailSent: false,
      chatInitialized: false,
      chatMessages: [],
      userData: null,

      initializeSession: () => {
        const currentSession = get().sessionId;
        if (!currentSession) {
          const newSessionId = generateUUID();
          set({ sessionId: newSessionId });
        }
      },

      calculateAndSave: async (formData: PensionFormData) => {
        try {
          set({ isLoading: true, error: null });
          
          let sessionId = get().sessionId;
          if (!sessionId) {
            sessionId = generateUUID();
            set({ sessionId });
          }

          const result = await calculatePension(formData, sessionId);
          
          set({
            sessionData: result,
            userData: formData.genero ? {
              nombre: formData.nombre,
              genero: formData.genero as 'Masculino' | 'Femenino',
              edad: {
                anos: formData.edad.anos,
                meses: formData.edad.meses
              },
              nivelEstudios: formData.nivelEstudios
            } : null,
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

      setEmailSent: (sent) => set({ 
        emailSent: sent 
      }),

      setChatInitialized: (initialized) => set({ 
        chatInitialized: initialized 
      }),

      addChatMessage: (message: Message) => set(state => ({
        chatMessages: [...state.chatMessages, message]
      })),

      addChatMessages: (messages: Message[]) => set(state => ({
        chatMessages: [...state.chatMessages, ...messages]
      })),

      clearSession: () => {
        const newSessionId = generateUUID();
        set({
          sessionId: newSessionId,
          sessionData: null,
          error: null,
          emailSent: false,
          chatInitialized: false,
          chatMessages: [],
          userData: null
        });
      }
    }),
    {
      name: 'pension-session-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        sessionData: state.sessionData,
        emailSent: state.emailSent,
        chatInitialized: state.chatInitialized,
        chatMessages: state.chatMessages,
        userData: state.userData,
      }),
    }
  )
); 