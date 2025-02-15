import { ENDPOINTS } from '../config/endpoints';
import { sessionService } from './sessionService';

interface EmailRequestData {
  email: string;
  optIn: boolean;
}

interface EmailResponseSuccess {
  message: string;
  details: {
    email: string;
    sent_date: string;
    optin_comercial: boolean;
  };
}

export const sendEmailReport = async (data: EmailRequestData): Promise<EmailResponseSuccess> => {
  try {
    const sessionId = sessionService.getOrCreateSessionId();
    
    const payload = {
      session_id: sessionId,
      email: data.email,
      optin_comercial: data.optIn
    };

    const response = await fetch(`${ENDPOINTS.sendEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (responseData.detail === "Session not found") {
        throw new Error("No se encontró la sesión. Por favor, vuelve a calcular tu pensión.");
      }
      throw new Error(responseData.detail || 'Error al enviar el email');
    }

    return responseData;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
}; 