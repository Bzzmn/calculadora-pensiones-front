import { Message } from './chat';

export interface PensionFormData {
    nombre: string;
    edad: {
      anos: number;
      meses: number;
    };
    genero: 'Masculino' | 'Femenino' | '';
    edadRetiro: number;
    capitalIndividual: number;
    salarioBruto: number;
    pensionIdeal: number;
    nivelEstudios: string;
  }
  
export interface ReformaResponse {
    saldo_acumulado: number;
    aporte_sis: number;
    aporte_empleador: number;
    aporte_trabajador: number;
    pension_mensual: number;
    pension_total: number;
    rentabilidad_acumulada: number;
    aporte_compensacion_expectativa_vida?: number;
    aporte_fapp?: number;
    bono_seguridad_previsional?: number;
    pension_adicional?: number;
  }
  
export interface SaldoAcumulado {
  saldo_cuenta_individual: number;
  aporte_trabajador: number;
  aporte_empleador: number;
  rentabilidad_acumulada: number;
}

export interface PreReforma {
  saldo_acumulado: SaldoAcumulado;
  aporte_sis: number;
  pension_mensual_base: number;
  pension_total: number;
  pgu_aplicada: boolean;
}

export interface PostReforma {
  saldo_acumulado: SaldoAcumulado;
  aporte_sis: number;
  aporte_compensacion_expectativa_vida: number;
  balance_fapp: number;
  bono_seguridad_previsional: number;
  pension_mensual_base: number;
  pension_adicional_compensacion: number;
  pension_total: number;
  pgu_aplicada: boolean;
}

export interface PensionObjetivo {
  valor_presente: number;
  valor_futuro: number;
  tasa_inflacion_anual: number;
  brecha_mensual_post_reforma: number;
}

export interface Metadata {
  nombre: string;
  edad: number;
  genero: string;
  edad_jubilacion: number;
  balance_actual: number;
  salario_mensual: number;
  estudios: string;
  expectativa_vida: number;
}

interface ChatData {
  messages: Message[];
  initialized: boolean;
}

export interface ApiResponse {
  pre_reforma: PreReforma;
  post_reforma: PostReforma;
  pension_objetivo: PensionObjetivo;
  metadata: Metadata;
  chatData?: ChatData;
}