import { ChatRequest, PensionData } from '../types/chat';
import { ENDPOINTS } from '../config/endpoints';
import { FormData } from '../types/pension';
import { ApiResponse } from '../types/pension';
import { useSessionStore } from '../stores/sessionStore';

const getAgentName = (gender: 'Masculino' | 'Femenino'): string => {
  return gender === 'Masculino' ? 'Alexandra' : 'Alejandro';
};

export const buildPensionData = (formData: FormData, apiResponse: ApiResponse): PensionData => {
  const generoFormatted = formData.genero === 'Masculino' ? 'M' : 'F';
  
  return {
    pre_reforma: apiResponse.pre_reforma,
    post_reforma: apiResponse.post_reforma,
    pension_objetivo: {
      valor_presente: formData.pensionIdeal,
      valor_futuro: formData.pensionIdeal * Math.pow(1.03, formData.edadRetiro - formData.edad.anos),
      tasa_inflacion_anual: 0.03,
      brecha_mensual_post_reforma: formData.pensionIdeal - apiResponse.post_reforma.pension_total
    },
    metadata: {
      nombre: formData.nombre,
      edad: formData.edad.anos + (formData.edad.meses / 12),
      genero: generoFormatted,
      edad_jubilacion: formData.edadRetiro,
      balance_actual: formData.capitalIndividual,
      salario_mensual: formData.salarioBruto,
      estudios: formData.nivelEstudios,
      expectativa_vida: formData.genero === 'Masculino' ? 85.5 : 90.8
    }
  };
};

export const sendMessageToAgent = async (request: ChatRequest): Promise<string> => {
  try {
    const { sessionId } = useSessionStore.getState();
    
    if (!sessionId) {
      throw new Error('No session ID found');
    }

    const response = await fetch(ENDPOINTS.sendMessageToAgent, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: request.message,
        messageType: request.messageType,
        pensionData: request.pensionData
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    return result.message;
  } catch (error) {
    console.error('Error en chat service:', error);
    throw error;
  }
};

export const chatService = {
  getAgentName,
  buildPensionData,
  sendMessageToAgent
};