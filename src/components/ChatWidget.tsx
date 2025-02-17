import { MessageCircle, X, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { PensionFormData } from '../types/pension';
import { Message } from '../types/chat';
import { chatService } from '../services/chatService';
import { useSessionStore } from '../stores/sessionStore';
import { useSpring, animated, useTransition } from '@react-spring/web';
import ReactMarkdown from 'react-markdown';

interface ChatWidgetProps {
  formData: PensionFormData;
  chatData?: {
    messages: Message[];
    initialized: boolean;
  };
  resultsLoaded?: boolean;
}

const getAgentAvatar = (gender: string) => {
  return gender === 'Femenino' 
    ? 'https://general-images-bucket.s3.sa-east-1.amazonaws.com/calculadorapension/alejandro.webp'
    : 'https://general-images-bucket.s3.sa-east-1.amazonaws.com/calculadorapension/alexandra.webp';
};

export const ChatWidget = ({ formData, resultsLoaded = false }: ChatWidgetProps) => {
  const { 
    chatInitialized, 
    setChatInitialized, 
    chatMessages,
    addChatMessage,
  } = useSessionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLargeAvatar, setShowLargeAvatar] = useState(false);
  const [showAttentionAnimation, setShowAttentionAnimation] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showGreenIcon, setShowGreenIcon] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasShownAnimation = useRef(false);
  const attentionTimerRef = useRef<NodeJS.Timeout>();

  const agentName = chatService.getAgentName(formData?.genero || 'Masculino');
  const avatarSrc = getAgentAvatar(formData?.genero || 'Masculino');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Efecto para scroll cuando cambian los mensajes o el estado de typing
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  // Efecto adicional para scroll cuando se abre el chat
  useEffect(() => {
    if (isOpen && chatMessages.length > 0) {
      // Pequeño delay para asegurar que el DOM está listo
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

  // Efecto para inicializar chat si es necesario
  useEffect(() => {
    if (isOpen && !chatInitialized && !isInitializing) {
      console.log('Inicializando chat');
      handleInitialMessages();
      setChatInitialized(true);
    }
  }, [isOpen, chatInitialized]);

  // Efecto para activar la animación después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAttentionAnimation(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('Estado actual de la animación:', {
      showAttentionAnimation,
      chatInitialized,
      isOpen
    });
  }, [showAttentionAnimation, chatInitialized, isOpen]);

  // Efecto para activar el color verde después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreenIcon(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleInitialMessages = async () => {
    console.log('Iniciando mensajes iniciales');
    setIsInitializing(true);
    try {
      const firstMessage = {
        content: "¡Hola! 👋 Soy tu asistente virtual y estoy aquí para ayudarte a entender mejor tu jubilación.",
        isUser: false,
        timestamp: new Date()
      };
      addChatMessage(firstMessage);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const secondMessage = {
        content: "Puedes obtener un informe detallado con algunas recomendaciones personalizadas para mejorar tu jubilación haciendo clic en el botón al final de la página",
        isUser: false,
        timestamp: new Date()
      };
      addChatMessage(secondMessage);
      setIsTyping(false);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const thirdMessage = {
        content: "Si tienes dudas sobre tu jubilación, el informe de pensiones o la reforma previsional, estoy aquí para orientarte 😊.",
        isUser: false,
        timestamp: new Date()
      };
      addChatMessage(thirdMessage);
  
    } catch (error) {
      console.error('Error inicializando chat:', error);
    } finally {
      setIsTyping(false);
      setIsInitializing(false);
    }

  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowAttentionAnimation(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const userMessage: Message = {
        content: newMessage.trim(),
        isUser: true,
        timestamp: new Date()
      };
      addChatMessage(userMessage);
      setNewMessage('');
      setIsTyping(true);

      const response = await chatService.sendMessageToAgent({
        messageType: 'user',
        message: userMessage.content,
        agentName: agentName
      });

      const agentMessage: Message = {
        content: response,
        isUser: false,
        timestamp: new Date()
      };
      addChatMessage(agentMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        content: "Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta nuevamente.",
        isUser: false,
        timestamp: new Date()
      };
      addChatMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  // Función para verificar si es el último mensaje del agente
  const isLastAgentMessage = (messages: Message[], index: number) => {
    const reversedIndex = messages.length - 1 - index;
    for (let i = reversedIndex - 1; i >= 0; i--) {
      if (!messages[i].isUser) {
        return false;
      }
    }
    return !messages[reversedIndex].isUser;
  };

  // Transiciones para los mensajes
  const transitions = useTransition(chatMessages, {
    keys: (_message: Message, index: number) => index,
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 20 }
  });

  // Animaciones de los halos
  const outerHaloSpring = useSpring({
    from: { scale: 1, opacity: 0.3 },
    to: { scale: 1.5, opacity: 0 },
    loop: true,
    config: { tension: 100, friction: 10 }
  });

  const middleHaloSpring = useSpring({
    from: { scale: 1, opacity: 0.2 },
    to: { scale: 1.3, opacity: 0.1 },
    loop: true,
    config: { tension: 120, friction: 14 }
  });

  const innerHaloSpring = useSpring({
    from: { scale: 1, opacity: 0.15 },
    to: { scale: 1.2, opacity: 0.05 },
    loop: true,
    config: { tension: 140, friction: 18 }
  });

  // Animación para el modal del avatar
  const avatarModalSpring = useSpring({
    opacity: showLargeAvatar ? 1 : 0,
    transform: showLargeAvatar ? 'scale(1)' : 'scale(0.95)',
    config: { tension: 300, friction: 20 }
  });

  // Asegurarnos de que no hay otros handlers para el avatar
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLargeAvatar(true);
  };

  useEffect(() => {
    console.log('Estado actual de mensajes:', chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    console.log('Estado actual de la animación:', {
      showAttentionAnimation,
      hasShownAnimation: hasShownAnimation.current,
      resultsLoaded,
      chatInitialized,
      isOpen
    });
  }, [showAttentionAnimation, resultsLoaded, chatInitialized, isOpen]);

  // Animación para el punto de notificación
  const notificationSpring = useSpring({
    from: { scale: 0.8, opacity: 0.5 },
    to: { scale: 1.2, opacity: 1 },
    config: { tension: 100, friction: 10 },
    loop: true
  });

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isOpen ? (
        <div className="relative">
          <button
            onClick={handleOpen}
            className={`${showAttentionAnimation ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} 
              relative z-10 text-white rounded-full p-4 shadow-lg transition-colors`}
          >
            <MessageCircle className="w-6 h-6" />
            {/* Punto de notificación fijo */}
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 rounded-full" />
          </button>
          {showAttentionAnimation && (
            <div className="absolute inset-0 z-0">
              <animated.div 
                style={{
                  transform: outerHaloSpring.scale.to(s => `scale(${s})`),
                  opacity: outerHaloSpring.opacity
                }}
                className="absolute inset-0 bg-green-400/30 rounded-full"
              />
              <animated.div 
                style={{
                  transform: middleHaloSpring.scale.to(s => `scale(${s})`),
                  opacity: middleHaloSpring.opacity
                }}
                className="absolute inset-0 bg-green-400/20 rounded-full"
              />
              <animated.div 
                style={{
                  transform: innerHaloSpring.scale.to(s => `scale(${s})`),
                  opacity: innerHaloSpring.opacity
                }}
                className="absolute inset-0 bg-green-400/10 rounded-full"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="fixed inset-0 sm:relative sm:inset-auto flex items-end sm:items-center justify-center sm:block">
          <div className="bg-gray-900 rounded-lg shadow-xl 
            w-[95vw] sm:w-96 md:w-[450px] 
            h-[90vh] sm:h-[90vh] md:h-[90vh] 
            min-h-[400px] 
            flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-800/50">
              <div className="flex items-center space-x-3">
                <img 
                  src={avatarSrc} 
                  alt={agentName} 
                  className="w-12 h-12 rounded-full border-2 border-indigo-500/30 cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={handleAvatarClick}
                />
                <div className="flex flex-col">
                  <span className="text-gray-100 font-medium text-base sm:text-lg">
                    {agentName}
                  </span>
                  <span className="text-gray-400 text-xs sm:text-sm">
                    Asistente Virtual
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-gray-700 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-800/50">
              {transitions((style, message, t, index) => (
                <animated.div style={style}>
                  <div className={`mb-1 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    {!message.isUser && (
                      <div className="w-8 md:w-10 flex-shrink-0 flex items-end">
                        {isLastAgentMessage(chatMessages, index) && (
                          <img 
                            src={avatarSrc}
                            alt={agentName}
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full mr-2"
                          />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3 rounded-lg text-sm ${
                        message.isUser
                          ? 'bg-indigo-600 text-white ml-auto'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </animated.div>
              ))}
              {isTyping && (
                <div className="flex justify-start ml-10">
                  <div className="bg-gray-700 p-3 rounded-lg">
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

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mensaje"
                  className="flex-1 p-2 bg-gray-700 text-gray-100 text-sm sm:text-base md:text-lg border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  className={`${
                    isTyping ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white p-2 rounded-lg transition-colors`}
                  disabled={isTyping || !newMessage.trim()}
                >
                  <Send className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLargeAvatar && (
        <animated.div 
          style={avatarModalSpring}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowLargeAvatar(false)}
        >
          <div 
            className="relative bg-gray-900 p-4 rounded-2xl shadow-xl max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLargeAvatar(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800/50 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="pt-4">
              <img 
                src={avatarSrc}
                alt={agentName}
                className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-indigo-500/30"
              />
              <div className="text-center mt-4">
                <h3 className="text-xl font-semibold text-white">{agentName}</h3>
                <p className="text-indigo-300 mt-1">Asistente Virtual</p>
              </div>
            </div>
          </div>
        </animated.div>
      )}
    </div>
  );
}; 