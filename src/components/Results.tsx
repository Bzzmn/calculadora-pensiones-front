import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { ApiResponse } from '../types/pension';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { PieChartDisplay } from './PieChartDisplay';
import { useState, useEffect } from 'react';
import { EmailReportModal } from './EmailReportModal';
import { ChatWidget } from './ChatWidget';
import { useSessionStore } from '../stores/sessionStore';

interface ResultsProps {
  response: ApiResponse;
  onRecalculate: () => void;
}

export const Results = ({ response, onRecalculate }: ResultsProps) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const clearSession = useSessionStore(state => state.clearSession);

  useEffect(() => {
    setResultsLoaded(true);
  }, []);

  const handleSubmitReport = (data: { email: string; optIn: boolean }) => {
    console.log('Enviando informe a:', data);
    setShowModal(false);
  };

  const handleRecalculate = () => {
    clearSession(); // Limpia la sesión actual
    onRecalculate(); // Vuelve al inicio
  };

  // Verificar que las propiedades existan
  if (!response?.pre_reforma || !response?.post_reforma) {
    return <div>Error: Datos de pensión no disponibles</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pre-reforma column */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">Sin Reforma</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs sm:text-sm text-blue-700">Pensión Total</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-900">
                  {formatCurrency(response.pre_reforma.pension_total)}
                </p>
              </div>
            </div>
          </div>
          <PieChartDisplay 
            data={response.pre_reforma.saldo_acumulado}
            title="Distribución de Aportes"
            className="text-xs sm:text-sm"
          />
        </div>

        {/* Post-reforma column */}
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-xl">
            <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-2">Con Reforma</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs sm:text-sm text-green-700">Pensión Total</p>
                <p className="text-xl sm:text-3xl font-bold text-green-900">
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
                      <p className="text-sm text-green-700 flex items-center">
                        Pensión Mensual Base
                        <span className="invisible group-hover:visible absolute left-0 -top-12 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg z-10">
                          Monto corresponde a la pensión proveniente del balance total de la cuenta de capitalización individual
                          <span className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></span>
                        </span>
                      </p>
                      <p className="text-lg font-semibold text-green-900">
                        {formatCurrency(response.post_reforma.pension_mensual_base)}
                      </p>
                    </div>
                    {response.metadata?.genero === 'F' && (
                      <div className="group relative">
                        <p className="text-sm text-green-700 flex items-center">
                          Compensación por Expectativa de Vida
                          <span className="invisible group-hover:visible absolute left-0 -top-12 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg z-10">
                            Monto corresponde al pago de la compensación por mayor expectativa de vida de mujeres con respecto a los hombres
                            <span className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></span>
                          </span>
                        </p>
                        <p className="text-lg font-semibold text-green-900">
                          {formatCurrency(response.post_reforma.pension_adicional_compensacion)}
                        </p>
                      </div>
                    )}
                    <div className="group relative">
                      <p className="text-sm text-green-700 flex items-center">
                        Bono de Seguridad Previsional
                        <span className="invisible group-hover:visible absolute left-0 -top-12 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg z-10">
                          Monto corresponde a los pagos derivados de los aportes al Fondo Autónomo de Protección Previsional (FAPP)
                          <span className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></span>
                        </span>
                      </p>
                      <p className="text-lg font-semibold text-green-900">
                        {formatCurrency(response.post_reforma.bono_seguridad_previsional)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <PieChartDisplay 
            data={response.post_reforma.saldo_acumulado}
            title="Distribución de Aportes"
            className="text-xs sm:text-sm"
          />
        </div>


           {/* Comparison section */}
           <div className="md:col-span-2">
          <div className="bg-indigo-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">Comparación de Resultados</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="group relative">
                <p className="text-sm text-indigo-700 flex items-center">
                  Diferencia en Pensión
                  <span className="invisible group-hover:visible absolute left-0 -top-12 w-80 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg z-10">
                    Corresponde a la diferencia entre la pensión obtenida sin la reforma con respecto a la pensión con reforma, bajo las mismas condiciones
                    <span className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></span>
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xl sm:text-2xl font-bold text-indigo-900">
                    {formatCurrency(response.post_reforma.pension_total - response.pre_reforma.pension_total)}
                  </p>
                  {response.post_reforma.pension_total > response.pre_reforma.pension_total && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="group relative">
                <p className="text-sm text-indigo-700 flex items-center">
                  Mejora Porcentual
                  <span className="invisible group-hover:visible absolute left-0 -top-12 w-80 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg z-10">
                    Aumento porcentual de la pensión con reforma con respecto a sin reforma
                    <span className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></span>
                  </span>
                </p>
                <p className="text-xl sm:text-2xl font-bold text-indigo-900">
                  <span className="text-green-500">
                    {((response.post_reforma.pension_total - response.pre_reforma.pension_total) / response.pre_reforma.pension_total) > 0 ? '+' : ''}
                  </span>
                  {formatPercentage((response.post_reforma.pension_total - response.pre_reforma.pension_total) / response.pre_reforma.pension_total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brecha Previsional */}
        <div className="md:col-span-2">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">Brecha Previsional</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-purple-700 mb-2">Pensión Ideal</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative">
                    <p className="text-xs text-purple-600 flex items-center">
                      Hoy
                      <span className="invisible group-hover:visible absolute left-0 -top-12 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg z-10">
                        Monto de pensión ideal declarada al día de hoy
                        <span className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></span>
                      </span>
                    </p>
                    <p className="text-base sm:text-lg font-bold text-purple-900">
                      {formatCurrency(response.pension_objetivo.valor_presente)}
                    </p>
                  </div>
                  <div className="group relative">
                    <p className="text-xs text-purple-600 flex items-center">
                      Al Jubilar
                      <span className="invisible group-hover:visible absolute left-0 -top-12 w-80 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg z-10">
                        Monto equivalente de la pensión ideal ajustada a inflación al momento de jubilación
                        <span className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></span>
                      </span>
                    </p>
                    <p className="text-base sm:text-lg font-bold text-purple-900">
                      {formatCurrency(response.pension_objetivo.valor_futuro)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="group relative">
                  <p className="text-sm text-purple-700 flex items-center">
                    Brecha mensual
                    <span className="invisible group-hover:visible absolute left-0 -top-12 w-80 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg z-10">
                      Diferencia entre el monto de pensión ideal futuro y jubilación estimada con reforma
                      <span className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></span>
                    </span>
                  </p>
                  <p className="text-base sm:text-lg font-bold text-purple-900">
                    {formatCurrency(response.pension_objetivo.brecha_mensual_post_reforma)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-700">Expectativa de Vida</p>
                  <p className="text-base sm:text-lg font-bold text-purple-900">
                    {Math.floor(response.metadata.expectativa_vida)} años{' '}
                    {Math.round((response.metadata.expectativa_vida % 1) * 12)} meses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="md:col-span-2">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="group relative inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <FileText className="w-4 h-4 mr-2" />
              <span className="relative">
                Obtener Informe Detallado
              </span>
            </button>

            <button
              onClick={handleRecalculate}
              className="inline-flex items-center justify-center px-4 py-2 border-2 border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-4 h-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Recalcular
            </button>
          </div>
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
          genero: response.metadata?.genero === 'F' ? 'Femenino' : 'Masculino',
          edadRetiro: response.metadata?.edad_jubilacion || 65,
          capitalIndividual: response.metadata?.balance_actual || 0,
          salarioBruto: response.metadata?.salario_mensual || 0,
          pensionIdeal: response.pension_objetivo?.valor_presente || 0,
          nivelEstudios: response.metadata?.estudios || ''
        }}
        apiResponse={response}
        resultsLoaded={resultsLoaded}
      />
    </div>
  );
}; 