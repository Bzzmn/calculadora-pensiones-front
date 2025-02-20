import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { X, Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { sendEmailReport } from '../services/emailService';
import { useSessionStore } from '../stores/sessionStore';

interface EmailFormData {
  email: string;
  optIn: boolean;
}

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmailFormData) => void;
}

export const EmailReportModal = ({ isOpen, onClose }: EmailReportModalProps) => {
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(false);
  const { emailSent, setEmailSent } = useSessionStore();
  const [status, setStatus] = useState<{
    type: 'error' | 'success' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (emailSent) {
      setStatus({
        type: 'info',
        message: 'Ya te enviamos el informe. Revisa tu bandeja de entrada o spam.'
      });
    }
  }, [emailSent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailSent) {
      setStatus({
        type: 'info',
        message: 'Ya te enviamos el informe. Revisa tu bandeja de entrada o spam.'
      });
      return;
    }

    setIsSending(true);

    // Animación de envío
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsSending(false);
    setIsSent(true);

    // Enviar email en background sin esperar respuesta
    sendEmailReport({ email, optIn }).catch(console.error);
    
    setTimeout(() => {
      onClose();
      setIsSent(false);
      setEmail('');
      setOptIn(false);
      setEmailSent(true);
    }, 4000);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
                  Informe Detallado
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start">
                    <Mail className="h-6 w-6 text-indigo-600 mt-1" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-indigo-800">
                        ¿Qué incluye el informe?
                      </h4>
                      <ul className="mt-2 text-sm text-indigo-700 space-y-1">
                        <li>• Análisis detallado de tu situación previsional</li>
                        <li>• Comparativa con y sin reforma</li>
                        <li>• Recomendaciones personalizadas realizadas con IA</li>
                      </ul>
                      <p className="mt-6 text-sm text-indigo-700 mr-3">
                        <span className="font-bold">A cambio te pedimos que te suscribas a nuestro newsletter. Tenemos mucho que contarte de tecnologia, IA, y mucho más! 🤩.</span>
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="tu@email.com"
                      required
                      disabled={emailSent}
                    />
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="optIn"
                        type="checkbox"
                        checked={optIn || emailSent}
                        onChange={(e) => setOptIn(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                        disabled={emailSent}
                      />
                    </div>
                    <label htmlFor="optIn" className="ml-3 text-sm text-gray-600">
                      Me gustaría recibir el newletter de The_FullStack.
                    </label>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={!isValidEmail(email) || !optIn || isSending || isSent || emailSent}
                      className="relative w-full overflow-hidden inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending && (
                        <div 
                          className="absolute inset-0 bg-green-500/50"
                          style={{
                            transform: 'translateX(-100%)',
                            animation: 'fill 3s ease-out forwards'
                          }}
                        />
                      )}
                      <span className="relative flex items-center z-10">
                        {emailSent ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Informe Enviado
                          </>
                        ) : isSent ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            ¡Enviado!
                          </>
                        ) : isSending ? (
                          <>
                            <Loader2 className="animate-spin w-4 h-4 mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Recibir Informe
                          </>
                        )}
                      </span>
                      <style>
                        {`
                          @keyframes fill {
                            0% {
                              transform: translateX(-100%);
                            }
                            100% {
                              transform: translateX(0);
                            }
                          }
                        `}
                      </style>
                    </button>
                  </div>
                </form>

                {isSent && (
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    <p>Hemos enviado el informe a tu correo electrónico.</p>
                    <p className="mt-1">
                      Si no lo encuentras, recuerda revisar tu carpeta de spam o correo no deseado.
                    </p>
                  </div>
                )}

                {status.type && (
                  <p className={`text-sm mt-2 text-center ${status.type === 'success' ? 'text-green-600' : status.type === 'error' ? 'text-red-500' : 'text-blue-600'
                    }`}>
                    {status.message}
                  </p>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 