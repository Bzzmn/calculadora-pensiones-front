import { ChatRequest, PensionData } from '../types/chat';
import { ENDPOINTS } from '../config/endpoints';
import { PensionFormData, ApiResponse } from '../types/pension';
import { useSessionStore } from '../stores/sessionStore';
import { TIMEOUTS } from '../config/timeouts';

const getAgentName = (gender: 'Masculino' | 'Femenino'): string => {
  return gender === 'Masculino' ? 'Alexandra' : 'Alejandro';
};

export const buildPensionData = (formData: PensionFormData, apiResponse: ApiResponse): PensionData => {
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
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.CHAT_REQUEST);

  try {
    const { sessionId } = useSessionStore.getState();
    
    if (!sessionId) {
      throw new Error('No session ID found');
    }

    const response = await fetch(ENDPOINTS.sendMessageToAgent, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        session_id: sessionId,
        user_message: request.message,
        message_type: request.messageType,
        agent_name: request.agentName
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Error de permisos CORS');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();
    return result.response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const elapsedTime = Date.now() - startTime;
        console.log(`Request abortada después de ${elapsedTime}ms`);
        
        return "Lo siento, la respuesta está tardando más de lo esperado. Por favor, intenta nuevamente.";
      }
    }
    return "Lo siento, hay un problema de conexión. Por favor, intenta nuevamente en unos momentos.";
  } finally {
    clearTimeout(timeoutId);
  }
};

export const chatService = {
  getAgentName,
  buildPensionData,
  sendMessageToAgent
};