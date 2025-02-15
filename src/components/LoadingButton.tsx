import { Loader2 } from 'lucide-react';

interface LoadingButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const LoadingButton = ({ 
  isLoading, 
  disabled, 
  onClick, 
  type = 'submit' 
}: LoadingButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className="relative w-full h-10 rounded-md overflow-hidden"
    >
      <div className={`absolute inset-0 transition-all duration-300 ease-out
        ${disabled ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
        {isLoading && (
          <div 
            className={`absolute inset-0 transition-all duration-1000 ease-out
              ${disabled ? 'bg-gray-400' : 'bg-indigo-500'}`}
            style={{
              transform: 'translateX(-100%)',
              animation: isLoading ? 'fill 1s ease-out forwards' : 'none'
            }}
          />
        )}
      </div>
      <div className={`relative flex items-center justify-center font-medium
        ${disabled ? 'text-gray-500' : 'text-white'}`}>
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            <span>Enviando...</span>
          </div>
        ) : (
          'Recibir informe'
        )}
      </div>
      <style jsx>{`
        @keyframes fill {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </button>
  );
}; 