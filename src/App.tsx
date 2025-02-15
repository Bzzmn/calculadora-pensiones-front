import { useState, useEffect } from 'react';
import { Calculator, ArrowRight, ArrowLeft, RefreshCcw } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FormData, ApiResponse } from './types/pension';
import { Results } from './components/Results';
import { Summary } from './components/Summary';
import { calculatePension } from './services/api';
import { sessionService } from './services/sessionService';
import { initialFormData } from './data/initialData';
import { questions } from './data/questions';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await sessionService.getSessionData();
        if (sessionData) {
          setApiResponse(sessionData);
          setShowSummary(true);
          setCurrentStep(questions.length);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const totalSteps = questions.length;

  const handleCalculatePension = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await calculatePension(formData);
      setApiResponse(response);
      setShowSummary(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular la pensión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRecalculate = () => {
    sessionService.clearSession();
    setApiResponse(null);
    setFormData(initialFormData);
    setCurrentStep(0);
    setShowSummary(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <RefreshCcw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Calculando tu pensión</h2>
          <p className="text-gray-600">Por favor espera mientras procesamos tu información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-sm p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Calculator className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Planificador de Jubilación</h1>
          </div>

          {!showSummary && currentStep < totalSteps && (
            <>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out transform origin-left"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 text-center mb-8">
                Paso {currentStep + 1} de {totalSteps}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-xl shadow-lg p-8">
          {apiResponse ? (
            <Results 
              response={{
                ...apiResponse,
                genero: formData.genero,
                pensionIdeal: formData.pensionIdeal,
                pensionIdealFutura: formData.pensionIdeal
              }}
              onRecalculate={handleRecalculate}
            />
          ) : (
            showSummary ? (
              <Summary 
                formData={formData}
                onPrevious={handlePrevious}
                onCalculate={handleCalculatePension}
              />
            ) : (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {questions[currentStep].title}
                </h2>

                {questions[currentStep].component(formData, setFormData)}

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                      currentStep === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-indigo-600 hover:text-indigo-700'
                    }`}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!questions[currentStep].isValid(formData)}
                    className={`inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      questions[currentStep].isValid(formData)
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {currentStep === totalSteps - 1 ? 'Revisar' : 'Siguiente'}
                    {currentStep < totalSteps - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}

export default App;