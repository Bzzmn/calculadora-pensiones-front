export interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface PensionData {
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

export interface ChatRequest {
  messageType: 'initial' | 'followup' | 'user';
  message: string;
  pensionData?: PensionData;
  agentName?: string;
}

export interface ChatData {
  messages: Message[];
  initialized: boolean;
} 