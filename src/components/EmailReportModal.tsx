import { X } from 'lucide-react';
import { useState } from 'react';
import { sendEmailReport } from '../services/emailService';
import { LoadingButton } from './LoadingButton';

interface EmailFormData {
  email: string;
  optIn: boolean;
}

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmailFormData) => void;
}

export const EmailReportModal = ({ isOpen, onClose, onSubmit }: EmailReportModalProps) => {
  const [emailForm, setEmailForm] = useState<EmailFormData>({
    email: '',
    optIn: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailAlreadySent, setEmailAlreadySent] = useState(false);
  const [status, setStatus] = useState<{
    type: 'error' | 'success' | null;
    message: string;
  }>({ type: null, message: '' });

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const isFormValid = emailForm.optIn && isValidEmail(emailForm.email) && !emailAlreadySent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setIsLoading(true);
      setStatus({ type: null, message: '' });
      
      try {
        const response = await sendEmailReport(emailForm);
        
        // Esperamos a que termine la animación antes de mostrar el mensaje
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (response.message === "Email already sent") {
          setEmailAlreadySent(true);
          setStatus({
            type: 'success',
            message: 'Ya te enviamos el informe anteriormente. Revisa tu bandeja de entrada.'
          });
        } else if (response.message === "Email sent successfully") {
          setStatus({
            type: 'success',
            message: '¡Listo! Hemos enviado el informe a tu correo electrónico.'
          });
          onSubmit(emailForm);
          setTimeout(() => {
            setEmailForm({ email: '', optIn: false });
            onClose();
          }, 3000);
        }
      } catch (err) {
        setStatus({
          type: 'error',
          message: err instanceof Error ? err.message : 'Error al enviar el informe'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Obtener Informe Detallado</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Te enviaremos un PDF detallado con el análisis completo de tu situación previsional, incluyendo todos los montos estimados de tus aportes y consejos personalizados para ayudarte a alcanzar tu pensión ideal. A cambio te pido que te suscribas a mi newsletter mensual donde te enviaré noticias relevantes del mundo de la tecnología y finanzas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                required
                disabled={emailAlreadySent}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-2 border
                  ${emailAlreadySent 
                    ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                value={emailForm.email}
                onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                placeholder="tu@email.com"
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="opt-in"
                  type="checkbox"
                  checked={emailAlreadySent ? true : emailForm.optIn}
                  disabled={emailAlreadySent}
                  onChange={(e) => setEmailForm({ ...emailForm, optIn: e.target.checked })}
                  className={`h-4 w-4 rounded border-gray-300 
                    ${emailAlreadySent
                      ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                      : 'text-indigo-600 focus:ring-indigo-500'}`}
                />
              </div>
              <label 
                htmlFor="opt-in" 
                className={`ml-3 text-sm ${emailAlreadySent ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Acepto suscribirme al newsletter de The_FullStack
              </label>
            </div>

            <div className="mt-6">
              <LoadingButton 
                isLoading={isLoading}
                disabled={!isFormValid || emailAlreadySent}
              />
              
              {status.type && (
                <p className={`text-sm mt-2 text-center ${
                  status.type === 'success' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {status.message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 