import { MessageCircle, X, Send, Maximize2, Minimize2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTransition, animated, useSpring } from "@react-spring/web";
import { Message } from "../types/chat";
import { chatService } from "../services/chatService";
import { useSessionStore } from "../stores/sessionStore";
import { PensionFormData, ApiResponse } from "../types/pension";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface ChatWidgetProps {
  formData: PensionFormData;
  resultsLoaded?: boolean;
  apiResponse: ApiResponse;
}

const getAgentAvatar = (gender: string) => {
  return gender === "Femenino"
    ? "https://general-images-bucket.s3.sa-east-1.amazonaws.com/calculadorapension/alejandro.webp"
    : "https://general-images-bucket.s3.sa-east-1.amazonaws.com/calculadorapension/alexandra.webp";
};

export const ChatWidget = ({ formData, resultsLoaded }: ChatWidgetProps) => {
  const { chatInitialized, setChatInitialized, chatMessages, addChatMessage } =
    useSessionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLargeAvatar, setShowLargeAvatar] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const agentName = chatService.getAgentName(formData?.genero || "Masculino");
  const avatarSrc = getAgentAvatar(formData?.genero || "Masculino");

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && chatMessages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, chatMessages.length]);

  const handleInitialMessages = useCallback(async () => {
    setIsInitializing(true);
    try {
      const firstMessage = {
        content:
          "¡Hola! 👋 Soy tu asistente virtual y estoy aquí para ayudarte a entender mejor tu jubilación.",
        isUser: false,
        timestamp: new Date(),
      };
      addChatMessage(firstMessage);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const secondMessage = {
        content:
          "Puedes obtener un informe detallado con algunas recomendaciones personalizadas para mejorar tu jubilación haciendo clic en el botón al final de la página",
        isUser: false,
        timestamp: new Date(),
      };
      addChatMessage(secondMessage);
      setIsTyping(false);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const thirdMessage = {
        content:
          "Si tienes dudas sobre tu jubilación, el informe de pensiones o la reforma previsional, estoy aquí para orientarte 😊.",
        isUser: false,
        timestamp: new Date(),
      };
      addChatMessage(thirdMessage);
    } catch (error) {
      console.error("Error inicializando chat:", error);
    } finally {
      setIsTyping(false);
      setIsInitializing(false);
    }
  }, [addChatMessage]);

  useEffect(() => {
    if (isOpen && !chatInitialized && !isInitializing) {
      handleInitialMessages();
      setChatInitialized(true);
    }
  }, [
    isOpen,
    chatInitialized,
    isInitializing,
    handleInitialMessages,
    setChatInitialized,
  ]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const userMessage: Message = {
        content: newMessage.trim(),
        isUser: true,
        timestamp: new Date(),
      };
      addChatMessage(userMessage);
      setNewMessage("");
      setIsTyping(true);

      const response = await chatService.sendMessageToAgent({
        messageType: "user",
        message: userMessage.content,
        agentName: agentName,
      });

      const agentMessage: Message = {
        content: response,
        isUser: false,
        timestamp: new Date(),
      };
      addChatMessage(agentMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        content:
          "Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta nuevamente.",
        isUser: false,
        timestamp: new Date(),
      };
      addChatMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const isLastAgentMessage = (messages: Message[], currentIndex: number) => {
    for (let i = currentIndex + 1; i < messages.length; i++) {
      if (!messages[i].isUser) {
        return false;
      }
    }
    return !messages[currentIndex].isUser;
  };

  const transitions = useTransition(chatMessages, {
    from: { opacity: 0, transform: "translateY(20px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 280, friction: 20 },
  });

  // Animación combinada para el botón (escala y color)
  const buttonAnimation = useSpring({
    transform: showNotification 
      ? 'scale(1.1) translateY(-2px)' 
      : 'scale(1) translateY(0px)',
    backgroundColor: showNotification 
      ? '#059669' // tailwind green-600
      : '#4F46E5', // tailwind indigo-600
    config: {
      tension: 300,
      friction: 10,
    },
  });

  // Animación para el indicador de notificación
  const notificationAnimation = useSpring({
    opacity: showNotification ? 1 : 0,
    transform: showNotification ? 'scale(1)' : 'scale(0)',
    config: {
      tension: 200,
      friction: 20,
    },
  });

  useEffect(() => {
    if (resultsLoaded && !chatInitialized) {
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 12000);
      return () => clearTimeout(timer);
    } else {
      setShowNotification(false);
    }
  }, [resultsLoaded, chatInitialized]);

  // Efecto para controlar el scroll del body
  useEffect(() => {
    if (isOpen) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restaurar la posición del scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isOpen ? (
        <div className="relative">
          <span className={`absolute inset-0 rounded-full ${showNotification && !chatInitialized ? 'animate-ping' : ''} ${showNotification ? 'bg-green-400' : 'bg-indigo-400'} opacity-75`}></span>
          <animated.button
            onClick={handleOpen}
            style={buttonAnimation}
            className="hover:brightness-110 relative z-10 text-white rounded-full p-4 shadow-lg transition-all"
          >
            <MessageCircle className="w-6 h-6" />
          </animated.button>
          <animated.div 
            style={notificationAnimation}
            className="absolute -top-1 right-2 z-10"
          >
            <span className="absolute inline-flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </animated.div>
        </div>
      ) : (
        <div 
          className={`fixed inset-0 z-50 flex 
          ${isMaximized ? 'items-center justify-center p-0 sm:p-8 md:p-12 lg:p-16 xl:p-20' : 'sm:items-end sm:justify-end'}`}
          onClick={() => setIsOpen(false)}
        >
          {/* Capa de fondo */}
          <div className={`absolute inset-0 transition-opacity duration-300
            ${isMaximized ? 'bg-gray-900' : 'bg-black/20'}`}
          />

          <div
            className={`bg-gray-900 rounded-none sm:rounded-lg shadow-xl 
            ${isMaximized ? 
              'w-full h-full sm:max-w-[1200px] md:max-w-600px] lg:max-w-[700px] xl:max-w-[850px] 2xl:max-w-[1000px]' : 
              'w-full sm:w-[400px] md:w-[450px] lg:w-[500px]'
            }
            ${isMaximized ? 
              'h-full' : 
              'h-[100dvh] sm:h-auto md:h-auto lg:h-auto'
            }
            ${isMaximized ? 
              'max-h-full' : 
              'max-h-[100dvh] sm:max-h-[75vh] md:max-h-[80vh] lg:max-h-[85vh]'
            }
            min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[550px]
            flex flex-col
            ${isMaximized ? 'm-0' : 'm-0 sm:m-4'}
            transition-all duration-300 ease-in-out
            relative z-10`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 bg-gray-800/50 shrink-0">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAvatarModal(true);
                    }}
                    className="group relative rounded-full overflow-hidden transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
                    p-0.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
                  >
                    <div className="relative rounded-full overflow-hidden">
                      <img
                        src={avatarSrc}
                        alt={agentName}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-100 font-medium text-sm sm:text-base md:text-lg">
                    {agentName}
                  </span>
                  <span className="text-xs text-gray-400">Agente Virtual</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="hidden sm:flex items-center justify-center p-2 text-gray-400 hover:text-gray-100 transition-colors"
                >
                  {isMaximized ? 
                    <Minimize2 className="w-5 h-5 md:w-6 md:h-6" /> : 
                    <Maximize2 className="w-5 h-5 md:w-6 md:h-6" />
                  }
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            <div className={`flex-1 p-4 md:p-6 overflow-y-auto bg-gray-800/50 space-y-4
              min-h-[200px]
              max-h-[calc(85vh-120px)] sm:max-h-[400px]
              [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-gray-800/40
              [&::-webkit-scrollbar-thumb]:bg-gray-600
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-gray-500
              ${isMaximized ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}
            >
              {transitions((styles, item, _, index) => (
                <animated.div style={styles}>
                  <div
                    className={`flex ${
                      item.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!item.isUser && (
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
                      className={`rounded-lg px-4 py-2 max-w-[85%] ${
                        item.isUser
                          ? 'bg-cyan-800 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        className={`prose prose-invert max-w-none break-words
                          ${item.isUser ? 'text-white' : 'text-gray-100'}`}
                        components={{
                          p: ({...props}) => <p className="mb-1 last:mb-0" {...props} />,
                          a: ({children, href, ...props}) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 underline"
                              {...props}
                            >
                              {children}
                            </a>
                          ),
                          ul: ({...props}) => (
                            <ul className="list-disc pl-4 space-y-2 my-4" {...props} />
                          ),
                          ol: ({...props}) => <ol className="ml-4 space-y-0.5" {...props} />,
                          strong: ({...props}) => <strong className="font-semibold" {...props} />,
                          em: ({...props}) => <em className="italic" {...props} />,
                          code: ({...props}) => (
                            <code className="bg-gray-800/50 px-1 rounded" {...props} />
                          ),
                          hr: () => <div className="h-4" />,
                          h1: ({...props}) => (
                            <h1 className="text-lg font-bold mb-1" {...props} />
                          ),
                          h2: ({...props}) => (
                            <h2 className="text-xl font-bold my-4 text-gray-100" {...props} />
                          ),
                          h3: ({...props}) => (
                            <h3 className="text-base font-medium mb-1" {...props} />
                          ),
                          blockquote: ({...props}) => (
                            <blockquote 
                              className="border-l-4 border-gray-600 pl-4 my-4 italic text-gray-300"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {item.content}
                      </ReactMarkdown>
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

            <form
              onSubmit={handleSendMessage}
              className="p-4 pb-6 sm:pb-4 md:p-6 border-t border-gray-700 bg-gray-800 shrink-0"
            >
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 min-h-[48px] md:min-h-[52px] px-4 py-3 bg-gray-700 
                    text-gray-100 rounded-lg placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500
                    text-sm sm:text-base md:text-lg"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                    hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed 
                    transition-colors"
                >
                  <Send className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </form>

            {/* Créditos */}
            <div className="text-center text-xs text-gray-400  pb-2 bg-gray-800 rounded-lg">
              Desarrollado por{' '}
              <a 
                href="https://thefullstack.digital?utm_source=calculadora_pensiones&utm_medium=chat&utm_campaign=previsional" 
                target="_blank" 
                rel="noopener"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                The_FullStack
              </a>
            </div>
          </div>
        </div>
      )}

      {showLargeAvatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowLargeAvatar(false)}
        >
          <div
            className="relative bg-gray-900 p-4 rounded-2xl shadow-xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
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
                <h3 className="text-xl font-semibold text-white">
                  {agentName}
                </h3>
                <p className="text-indigo-300 mt-1">Asistente Virtual</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver la imagen del agente */}
      {showAvatarModal && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setShowAvatarModal(false)}
        >
          <div 
            className="relative max-w-md max-h-[90vh] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={avatarSrc}
              alt={agentName}
              className="w-64 h-64 sm:w-72 sm:h-72 object-cover rounded-full mx-auto"
            />
            <div className="text-center mt-4">
              <h3 className="text-white text-xl font-medium">{agentName}</h3>
              <p className="text-gray-300 mt-1">Agente Virtual</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
