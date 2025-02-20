import { ArrowLeft } from 'lucide-react';
import { PensionFormData } from '../types/pension';
import { formatCurrency } from '../utils/formatters';

interface SummaryProps {
  formData: PensionFormData;
  onPrevious: () => void;
  onCalculate: () => void;
}

export const Summary = ({ formData, onPrevious, onCalculate }: SummaryProps) => {
  const formatEdad = (anos: number, meses: number) => {
    if (meses === 0) return `${anos} años`;
    return `${anos} años y ${meses} meses`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 lg:text-lg">Resumen de tus respuestas</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Nombre</p>
          <p className="text-base sm:text-xl lg:text-lg font-semibold">{formData.nombre}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Edad</p>
          <p className="text-base sm:text-xl lg:text-lg font-semibold">
            {formatEdad(formData.edad.anos, formData.edad.meses)}
          </p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Género</p>
          <p className="text-base sm:text-xl font-semibold">{formData.genero}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Edad de retiro</p>
          <p className="text-base sm:text-xl font-semibold">{formData.edadRetiro} años</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Capital individual</p>
          <p className="text-base sm:text-xl font-semibold">{formatCurrency(formData.capitalIndividual)}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Salario bruto</p>
          <p className="text-base sm:text-xl font-semibold">{formatCurrency(formData.salarioBruto)}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Pensión ideal</p>
          <p className="text-base sm:text-xl font-semibold">{formatCurrency(formData.pensionIdeal)}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600">Nivel de estudios</p>
          <p className="text-base sm:text-xl font-semibold">{formData.nivelEstudios}</p>
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrevious}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Modificar datos
        </button>
        <button
          onClick={onCalculate}
          className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm 
            text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Calcular mi pensión
        </button>
      </div>
    </div>
  );
}; 