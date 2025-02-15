const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

interface PensionData {
  pre_reforma: {
    saldo_acumulado: {
      saldo_cuenta_individual: number;
      aporte_trabajador: number;
      aporte_empleador: number;
      rentabilidad_acumulada: number;
    };
    aporte_sis: number;
    pension_mensual_base: number;
    pension_total: number;
    pgu_aplicada: boolean;
  };
  post_reforma: {
    saldo_acumulado: {
      saldo_cuenta_individual: number;
      aporte_trabajador: number;
      aporte_empleador: number;
      rentabilidad_acumulada: number;
    };
    aporte_sis: number;
    aporte_compensacion_expectativa_vida: number;
    balance_fapp: number;
    bono_seguridad_previsional: number;
    pension_mensual_base: number;
    pension_adicional_compensacion: number;
    pension_total: number;
    pgu_aplicada: boolean;
  };
  pension_objetivo: {
    valor_presente: number;
    valor_futuro: number;
    tasa_inflacion_anual: number;
    brecha_mensual_post_reforma: number;
  };
  metadata: {
    nombre: string;
    edad: number;
    genero: string;
    edad_jubilacion: number;
    balance_actual: number;
    salario_mensual: number;
    estudios: string;
    expectativa_vida: number;
  };
}

interface ChatRequest {
  messageType: 'initial' | 'followup';
  message: string;
  pensionData: PensionData;
}

export const sendMessageToAgent = async (data: ChatRequest) => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    return result.message;
  } catch (error) {
    console.error('Error sending message to agent:', error);
    throw error;
  }
};