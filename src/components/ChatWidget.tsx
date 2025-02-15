import { MessageCircle, X, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FormData } from '../types/pension';
import { sendMessageToAgent } from '../services/chatService';
import { ApiResponse } from '../types/pension';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatWidgetProps {
  formData: FormData;
  showInitialMessage?: boolean;
  apiResponse: ApiResponse;
}

export const ChatWidget = ({ formData, showInitialMessage = false, apiResponse }: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasSecondMessageBeenSent, setHasSecondMessageBeenSent] = useState(false);

  const agentName = formData?.genero === 'Masculino' ? 'Alexandra' : 'Alejandro';
  const avatarSrc = `https://ui-avatars.com/api/?name=${agentName}&background=6366f1&color=fff&size=128`;

  const buildPensionData = () => {
    const generoFormatted = formData.genero === 'Masculino' ? 'M' : 'F';
    
    return {
      pre_reforma: apiResponse.pre_reforma,
      post_reforma: apiResponse.post_reforma,
      pension_objetivo: {
        valor_presente: formData.pensionIdeal,
        valor_futuro: formData.pensionIdeal * Math.pow(1.03, formData.edadRetiro - formData.edad.anos),
        tasa_inflacion_anual: 0.03,
        brecha_mensual_post_reforma: formData.pensionIdeal - apiResponse.post_reforma.pension_total
      },
      metadata: {
        nombre: formData.nombre,
        edad: formData.edad.anos + (formData.edad.meses / 12),
        genero: generoFormatted,
        edad_jubilacion: formData.edadRetiro,
        balance_actual: formData.capitalIndividual,
        salario_mensual: formData.salarioBruto,
        estudios: formData.nivelEstudios,
        expectativa_vida: formData.genero === 'Masculino' ? 85.5 : 90.8
      }
    };
  };

  useEffect(() => {
    const initializeChat = async () => {
      if (showInitialMessage && formData && apiResponse) {
        try {
          setIsTyping(true);
          const pensionData = buildPensionData();
          
          console.log('Enviando datos al agente:', pensionData); // Debug log

          const message = await sendMessageToAgent({
            messageType: 'initial',
            message: "initial_contact",
            pensionData: pensionData
          });

          console.log('Respuesta recibida:', message); // Debug log

          setMessages([{
            content: message,
            isUser: false,
            timestamp: new Date()
          }]);
          setHasNewMessage(true);
        } catch (error) {
          console.error('Error en mensaje inicial:', error);
          setMessages([{
            content: `Hola ${formData.nombre}, mucho gusto, soy ${agentName}, tu agente de Planificacion de Jubilacion.`,
            isUser: false,
            timestamp: new Date()
          }]);
        } finally {
          setIsTyping(false);
        }
      }
    };

    initializeChat();
  }, [showInitialMessage, formData, apiResponse]);

  const sendFollowUpMessage = async () => {
    if (hasSecondMessageBeenSent) return;
    
    setIsTyping(true);
    try {
      const message = await sendMessageToAgent({
        userName: formData.nombre,
        userGender: formData.genero,
        message: "request_advice",
        messageType: 'followup'
      });

      setMessages(prev => [...prev, {
        content: message,
        isUser: false,
        timestamp: new Date()
      }]);
      setHasSecondMessageBeenSent(true);
    } catch (error) {
      console.error('Error sending followup message:', error);
      // Fallback message en caso de error
      setMessages(prev => [...prev, {
        content: "Hay varias cosas que podemos hacer para reducir la brecha, por ejemplo podemos invertir en bienes raices.",
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        content: newMessage,
        isUser: true,
        timestamp: new Date()
      }]);

      const userMessage = newMessage;
      setNewMessage('');
      setIsTyping(true);

      try {
        const pensionData = buildPensionData();
        const response = await sendMessageToAgent({
          messageType: 'followup',
          message: userMessage,
          pensionData: pensionData
        });

        setMessages(prev => [...prev, {
          content: response,
          isUser: false,
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prev => [...prev, {
          content: "Lo siento, estoy teniendo problemas para procesar tu mensaje. ¿Podrías intentarlo de nuevo?",
          isUser: false,
          timestamp: new Date()
        }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
    if (!hasSecondMessageBeenSent) {
      sendFollowUpMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isOpen ? (
        <div className="relative">
          <button
            onClick={handleOpen}
            className={`
              relative
              ${hasNewMessage ? 'bg-green-500 animate-bounce' : 'bg-indigo-600'}
              text-white rounded-full p-4 shadow-lg 
              hover:bg-indigo-700 transition-colors
              group
            `}
          >
            <MessageCircle className="w-6 h-6" />
            {hasNewMessage && (
              <>
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full" />
                <span className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-white text-sm text-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  ¡Tienes un mensaje de tu asesor!
                </span>
                <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-75" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 max-h-[600px] flex flex-col">
          <div className="bg-indigo-600 p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src={avatarSrc} 
                alt={agentName}
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
              />
              <span className="text-white font-medium">
                Chat con {agentName}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-indigo-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto max-h-[400px] space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <img 
                    src={avatarSrc}
                    alt={agentName}
                    className="w-8 h-8 rounded-full mr-2 self-end"
                  />
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <img 
                  src={avatarSrc}
                  alt={agentName}
                  className="w-8 h-8 rounded-full mr-2 self-end"
                />
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}; 