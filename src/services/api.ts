import { FormData, ApiResponse } from '../types/pension';
import { ENDPOINTS } from '../config/endpoints';
import { sessionService } from './sessionService';

export const calculatePension = async (formData: FormData): Promise<ApiResponse> => {
  try {
    const sessionId = sessionService.getOrCreateSessionId();
    
    const payload = {
      sessionId,
      name: formData.nombre,
      current_age_years: Number(formData.edad.anos),
      current_age_months: Number(formData.edad.meses),
      retirement_age: Number(formData.edadRetiro),
      current_balance: Number(formData.capitalIndividual),
      monthly_salary: Number(formData.salarioBruto),
      gender: formData.genero === 'Femenino' ? 'F' : 'M',
      ideal_pension: Number(formData.pensionIdeal),
      nivel_estudios: formData.nivelEstudios
    };

    console.log('Payload enviado:', payload);

    const response = await fetch(ENDPOINTS.calculatePension, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response:', errorData);
      throw new Error(errorData?.message || 'Error al calcular la pensión');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error completo:', error);
    throw error;
  }
}; 