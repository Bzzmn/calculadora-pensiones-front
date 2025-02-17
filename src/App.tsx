import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PensionFormData } from './types/pension';
import { Results } from './components/Results';
import { Summary } from './components/Summary';
import { initialFormData } from './config/initialData';
import { questions } from './config/questions';
import { useSessionStore } from './stores/sessionStore';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Footer } from './components/Footer';

ChartJS.register(ArcElement, Tooltip, Legend);

export const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [formData, setFormData] = useState<PensionFormData>(initialFormData);
  
  const {  
    sessionData, 
    isLoading,
    error,
    calculateAndSave,
    initializeSession 
  } = useSessionStore();

  useEffect(() => {
    const loadSession = async () => {
      try {
        await initializeSession();
      } catch (err) {
        console.error('Error al cargar la sesión:', err);
        setCurrentStep(0);
        setShowSummary(false);
        setFormData(initialFormData);
      }
    };

    loadSession();
  }, [initializeSession]);

  useEffect(() => {
    if (sessionData) {
      setShowSummary(false);
      setCurrentStep(0);
    }
  }, [sessionData]);

  const handleCalculatePension = async () => {
    try {
      await calculateAndSave(formData);
    } catch (err) {
      console.error('Error al calcular pensión:', err);
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
      setCurrentStep(questions.length - 1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRecalculate = () => {
    setCurrentStep(0);
    setShowSummary(false);
    setFormData(initialFormData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Calculadora de Pensiones
            </h1>
            <p className="mt-6 text-lg text-gray-600 px-4 sm:px-6">
              Conoce cómo la reforma previsional afectará tu pensión
            </p>
          </div>

          {!sessionData && !showSummary && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Paso {currentStep + 1} de {questions.length}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(((currentStep + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8">
            {isLoading ? (
              <LoadingSpinner isLoading={true} disabled={false} />
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            ) : sessionData ? (
              <Results response={sessionData} onRecalculate={handleRecalculate} />
            ) : showSummary ? (
              <Summary formData={formData} onPrevious={handlePrevious} onCalculate={handleCalculatePension} />
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {questions[currentStep]?.title}
                </h2>
                {questions[currentStep]?.component(formData, setFormData)}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePrevious}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </button>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    disabled={!questions[currentStep]?.isValid(formData)}
                  >
                    {currentStep === questions.length - 1 ? 'Revisar' : 'Siguiente'}
                    {currentStep < questions.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-grow">
        <Footer />
      </div>
    </div>
  );
};

export default App;