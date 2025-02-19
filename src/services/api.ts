import { PensionFormData, ApiResponse } from '../types/pension';
import { ENDPOINTS } from '../config/endpoints';
import { TIMEOUTS } from '../config/timeouts'

export const calculatePension = async (formData: PensionFormData, sessionId: string): Promise<ApiResponse> => {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.API_REQUEST);

  try {
    console.log('URL de cálculo:', ENDPOINTS.calculatePension);

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

    console.log('Endpoint usado:', ENDPOINTS.calculatePension);
    console.log('Payload enviado:', payload);

    const response = await fetch(ENDPOINTS.calculatePension, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response:', errorData);
      console.error('URL usada:', ENDPOINTS.calculatePension);
      throw new Error(errorData?.message || 'Error al calcular la pensión');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const elapsedTime = Date.now() - startTime;
        console.log(`Cálculo abortado después de ${elapsedTime}ms`);
        throw new Error('El cálculo excedió el tiempo límite de espera');
      }
    }
    console.error('Error completo:', error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}; 