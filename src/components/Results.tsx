import {  ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { ApiResponse } from '../types/pension';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { PieChartDisplay } from './PieChartDisplay';
import { useState } from 'react';
import { EmailReportModal } from './EmailReportModal';
import { ChatWidget } from './ChatWidget';

interface ResultsProps {
  response: ApiResponse & {
    genero: 'Masculino' | 'Femenino';
    pensionIdeal: number;
    pensionIdealFutura: number;
  };
  onRecalculate: () => void;
}

export const Results = ({ response, onRecalculate }: ResultsProps) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmitReport = (data: { email: string; optIn: boolean }) => {
    // Aquí iría la lógica para enviar el informe
    console.log('Enviando informe a:', data);
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pre-reforma column */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Sin Reforma</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-blue-700">Pensión Total</p>
                <p className="text-3xl font-bold text-blue-900">
                  {formatCurrency(response.pre_reforma.pension_total)}
                </p>
                <div className="mt-2 h-5"></div>
              </div>
            </div>
          </div>
          <PieChartDisplay 
            data={{
              aporte_trabajador: response.pre_reforma.saldo_acumulado.aporte_trabajador,
              aporte_empleador: response.pre_reforma.saldo_acumulado.aporte_empleador,
              rentabilidad_acumulada: response.pre_reforma.saldo_acumulado.rentabilidad_acumulada
            }}
            title="Distribución de Aportes"
          />
        </div>

        {/* Post-reforma column */}
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-green-900 mb-4">Con Reforma</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-green-700">Pensión Total</p>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency(response.post_reforma.pension_total)}
                </p>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="flex items-center gap-1 text-sm text-green-600 mt-2 hover:text-green-700"
                >
                  {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showBreakdown ? 'Ocultar desglose' : 'Ver desglose'}
                </button>
              </div>
              {showBreakdown && (
                <div className="pt-3 border-t border-green-200">
                  <div className="space-y-2">
                    <div className="group relative">
                      <p className="text-sm text-green-700">Pensión Mensual Base</p>
                      <p className="text-lg font-semibold text-green-900">
                        {formatCurrency(response.post_reforma.pension_mensual_base)}
                      </p>
                      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Pensión estimada por recibir desde el balance del fondo de capitalización individual
                      </div>
                    </div>
                    {response.genero === 'Femenino' && (
                      <div className="group relative">
                        <p className="text-sm text-green-700">Compensación por Expectativa de Vida</p>
                        <p className="text-lg font-semibold text-green-900">
                          {formatCurrency(response.post_reforma.pension_adicional_compensacion)}
                        </p>
                        <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          Monto estimado de compensación por mayor expectativa de vida de mujeres con respecto a hombres
                        </div>
                      </div>
                    )}
                    <div className="group relative">
                      <p className="text-sm text-green-700">Bono de Seguridad Previsional</p>
                      <p className="text-lg font-semibold text-green-900">
                        {formatCurrency(response.post_reforma.bono_seguridad_previsional)}
                      </p>
                      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Cuota estimada que proviene de los fondos aportados al Fondo Autónomo de Protección Previsional (FAPP)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <PieChartDisplay 
            data={{
              aporte_trabajador: response.post_reforma.saldo_acumulado.aporte_trabajador,
              aporte_empleador: response.post_reforma.saldo_acumulado.aporte_empleador,
              rentabilidad_acumulada: response.post_reforma.saldo_acumulado.rentabilidad_acumulada
            }}
            title="Distribución de Aportes"
          />
        </div>

        {/* Comparison section */}
        <div className="md:col-span-2">
          <div className="bg-indigo-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">Comparación de Resultados</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-indigo-700">Diferencia en Pensión</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-indigo-900">
                    {formatCurrency(response.post_reforma.pension_total - response.pre_reforma.pension_total)}
                  </p>
                  {response.post_reforma.pension_total > response.pre_reforma.pension_total && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-indigo-700">Mejora Porcentual</p>
                <p className="text-2xl font-bold text-indigo-900">
                  <span className="text-green-500">
                    {((response.post_reforma.pension_total - response.pre_reforma.pension_total) / response.pre_reforma.pension_total) > 0 ? '+' : ''}
                  </span>
                  {formatPercentage((response.post_reforma.pension_total - response.pre_reforma.pension_total) / response.pre_reforma.pension_total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison with Ideal Pension */}
        <div className="md:col-span-2">
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">Comparación con Pensión Ideal</h3>
            
            {/* Ideal Pension Display */}
            <div className="flex items-center justify-center gap-16 mb-6">
              <div className="group relative text-right">
                <p className="text-sm text-purple-700">Pensión Ideal Actual</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(response.pension_objetivo.valor_presente)}
                </p>
                <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity right-0">
                  Monto mensual que declaraste necesitar para mantener tu calidad de vida actual
                </div>
              </div>

              <div className="text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              <div className="group relative text-left">
                <p className="text-sm text-purple-700">Pensión Ideal Futura</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(response.pension_objetivo.valor_futuro)}
                </p>
                <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity left-0">
                  Proyección de tu pensión ideal considerando inflación y años hasta tu jubilación
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-purple-100 p-4 rounded-lg border-2 border-purple-300">
                <p className="text-sm text-purple-700 font-medium">Brecha con Pensión Ideal</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(response.pension_objetivo.brecha_mensual_post_reforma)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Diferencia entre tu pensión proyectada y tu pensión ideal
                </p>
              </div>
              <div className="text-left pl-16">
                <p className="text-sm text-purple-700">Tu expectativa de vida</p>
                <p className="text-2xl font-bold text-purple-900">
                  {response.metadata.expectativa_vida.toFixed(1)} años
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex justify-center mt-8">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FileText className="w-5 h-5 mr-2" />
            Obtener informe detallado
          </button>
        </div>

        {/* Disclaimer Section */}
        <div className="md:col-span-2 mt-8 space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600 mb-4">
            Las cifras presentadas son estimaciones basadas en supuestos. El monto real a recibir en la jubilación puede variar significativamente debido a diversos factores, tales como condiciones macroeconómicas (inflación, tasas de interés, crecimiento económico), variables microeconómicas, fluctuaciones en los ingresos, cambios en la normativa y otros elementos relevantes.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">
                Las estimaciones del presente informe están realizadas bajo los mismos supuestos que se utilizaron para realizar los estudios de la actual ley de pensiones que son los siguientes:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Crecimiento de salarios de 1,25% de acuerdo con proyección de la OCDE.</li>
                <li>Rentabilidad del fondo equivalente a 3,91%.</li>
                <li>Retornos de los fondos de pensiones en base al promedio histórico y que la tasa implícita de las rentas vitalicias es de 3,11%.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <EmailReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitReport}
      />

      <ChatWidget 
        formData={{
          nombre: response.metadata?.nombre || '',
          edad: {
            anos: Math.floor(response.metadata?.edad || 0),
            meses: Math.round(((response.metadata?.edad || 0) % 1) * 12)
          },
          genero: response.genero,
          edadRetiro: response.metadata?.edad_jubilacion || 65,
          capitalIndividual: response.metadata?.balance_actual || 0,
          salarioBruto: response.metadata?.salario_mensual || 0,
          pensionIdeal: response.pensionIdeal,
          nivelEstudios: response.metadata?.estudios || ''
        }}
        showInitialMessage={true}
        apiResponse={response}
      />
    </div>
  );
}; 