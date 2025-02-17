import { MessageCircle, X, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { FormData } from '../types/pension';
import { Message } from '../types/chat';
import { chatService } from '../services/chatService';
import { ApiResponse } from '../types/pension';
import { sessionService } from '../services/sessionService';
import { useSessionStore } from '../stores/sessionStore';

interface ChatWidgetProps {
  formData: FormData;
  apiResponse: ApiResponse;
  chatData?: {
    messages: Message[];
    initialized: boolean;
  };
}

const getAgentAvatar = (gender: string) => {
  return gender === 'Femenino' 
    ? 'https://general-images-bucket.s3.sa-east-1.amazonaws.com/calculadorapension/alejandro.webp'
    : 'https://general-images-bucket.s3.sa-east-1.amazonaws.com/calculadorapension/alexandra.webp';
};

export const ChatWidget = ({ formData, apiResponse, chatData }: ChatWidgetProps) => {
  const { sessionData } = useSessionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(sessionData?.chatData?.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatInitialized, setChatInitialized] = useState(sessionData?.chatData?.initialized || false);
  const [showLargeAvatar, setShowLargeAvatar] = useState(false);
  const [showAttentionAnimation, setShowAttentionAnimation] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasShownAnimation = useRef(false);
  const attentionTimerRef = useRef<NodeJS.Timeout>();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const isFirstLoad = useRef(true);

  const agentName = chatService.getAgentName(formData?.genero || 'Masculino');
  const avatarSrc = getAgentAvatar(formData?.genero || 'Masculino');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Efecto para scroll cuando cambian los mensajes o el estado de typing
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Efecto adicional para scroll cuando se abre el chat
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      // Pequeño delay para asegurar que el DOM está listo
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

  // Nuevo efecto para inicializar chat si es necesario
  useEffect(() => {
    if (isOpen && !chatInitialized && !isInitializing) {
      initializeChat(agentName);
    }
  }, [isOpen, chatInitialized]);

  const initializeChat = async (agentName: string) => {
    setIsInitializing(true);
    try {
      // Primer mensaje
      const initialMessages = [{
        content: `Hola 👋 soy ${agentName}, tu agente de Planificación de Jubilación.`,
        isUser: false,
        timestamp: new Date()
      }];
      setMessages(initialMessages);
      
      // Guardar el estado inicial
      await sessionService.saveSessionData({
        ...apiResponse,
        chatData: {
          messages: initialMessages,
          initialized: true
        }
      });

      // Esperar antes del segundo mensaje
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedMessages = [...initialMessages, {
        content: "Si quieres obtener un informe completo de tu jubilación, puedes hacerlo presionando el botón de abajo.",
        isUser: false,
        timestamp: new Date()
      }];
      setMessages(updatedMessages);
      
      // Guardar segundo mensaje
      await sessionService.saveSessionData({
        ...apiResponse,
        chatData: {
          messages: updatedMessages,
          initialized: true
        }
      });
      setIsTyping(false);

      // Esperar antes del tercer mensaje
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const finalMessages = [...updatedMessages, {
        content: "Si tienes dudas respecto de tus montos, conceptos o temas relacionados con la reforma de pensiones, con gusto te puedo ayudar.",
        isUser: false,
        timestamp: new Date()
      }];
      setMessages(finalMessages);
      
      // Guardar estado final
      await sessionService.saveSessionData({
        ...apiResponse,
        chatData: {
          messages: finalMessages,
          initialized: true
        }
      });

      setChatInitialized(true);
    } catch (error) {
      console.error('Error inicializando chat:', error);
      // En caso de error, aseguramos que el estado sea consistente
      setMessages([]);
      setChatInitialized(false);
      await sessionService.saveSessionData({
        ...apiResponse,
        chatData: {
          messages: [],
          initialized: false
        }
      });
    } finally {
      setIsTyping(false);
      setIsInitializing(false);
    }
  };

  const handleOpen = () => {
    // Cancelar el timer si existe
    if (attentionTimerRef.current) {
      clearTimeout(attentionTimerRef.current);
    }
    setIsOpen(true);
    setShowAttentionAnimation(false);
    hasShownAnimation.current = true;
    // Scroll al abrir con mensajes existentes
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Agregar mensaje del usuario
      const userMessage: Message = {
        content: newMessage.trim(),
        isUser: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsTyping(true);

      // Preparar datos de la pensión
      const pensionData = chatService.buildPensionData(formData, apiResponse);

      // Enviar mensaje al agente
      const response = await chatService.sendMessageToAgent({
        messageType: 'user',
        message: userMessage.content,
        pensionData: pensionData
      });

      // Agregar respuesta del agente
      const agentMessage: Message = {
        content: response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);

      // Guardar la conversación actualizada
      const sessionData = await sessionService.getSessionData() || {};
      await sessionService.saveSessionData({
        ...sessionData,
        chatData: {
          messages: [...messages, userMessage, agentMessage],
          initialized: true
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      // Agregar mensaje de error al chat
      const errorMessage: Message = {
        content: "Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta nuevamente.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const isLastAgentMessage = (index: number) => {
    // Buscar desde el índice actual hacia adelante
    for (let i = index + 1; i < messages.length; i++) {
      if (!messages[i].isUser) {
        return false;
      }
    }
    return !messages[index].isUser;
  };

  const handleRecalculate = () => {
    setMessages([]);
    setChatInitialized(false);
    sessionService.clearSession();
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isOpen ? (
        <div className="relative">
          <button
            onClick={handleOpen}
            className={`
              relative
              bg-indigo-600
              text-white rounded-full p-4 shadow-lg 
              hover:bg-indigo-700 transition-colors
              group
              ${showAttentionAnimation ? 'animate-attention' : ''}
            `}
          >
            <MessageCircle className="w-6 h-6" />
            {showAttentionAnimation && (
              <>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-300 animate-ping" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 max-h-[600px] flex flex-col">
          <div className="bg-indigo-600 p-6 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src={avatarSrc} 
                alt={agentName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowLargeAvatar(true)}
              />
              <span className="text-white font-medium text-lg">
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

          {showLargeAvatar && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                 onClick={() => setShowLargeAvatar(false)}>
              <div className="relative">
                <img 
                  src={avatarSrc} 
                  alt={agentName}
                  className="w-80 h-80 rounded-full object-cover border-4 border-white shadow-2xl"
                />
                <button
                  onClick={() => setShowLargeAvatar(false)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 p-4 overflow-y-auto max-h-[400px] space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && isLastAgentMessage(index) && (
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
                  } ${!message.isUser && !isLastAgentMessage(index) ? 'ml-10' : ''}`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start ml-10">
                <div className="bg-gray-100 p-3 rounded-lg max-w-[70%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isTyping}
              />
              <button
                type="submit"
                className={`${
                  isTyping ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white p-2 rounded-lg transition-colors`}
                disabled={isTyping || !newMessage.trim()}
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