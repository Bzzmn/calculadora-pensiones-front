import { RefreshCcw } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="text-center">
      <RefreshCcw className="w-12 h-12 text-indigo-600 animate-[spin_1.5s_linear_infinite] mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Calculando tu pensión</h2>
      <p className="text-gray-600">Por favor espera mientras procesamos tu información...</p>
    </div>
  );
}; 