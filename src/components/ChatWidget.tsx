import { MessageCircle, X, Send } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTransition, animated, useSpring } from "@react-spring/web";
import { Message } from "../types/chat";
import { chatService } from "../services/chatService";
import { useSessionStore } from "../stores/sessionStore";
import { PensionFormData, ApiResponse } from "../types/pension";
import ReactMarkdown from 'react-markdown';

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
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLargeAvatar, setShowLargeAvatar] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNotification, setShowNotification] = useState(false);

  const agentName = chatService.getAgentName(formData?.genero || "Masculino");
  const avatarSrc = getAgentAvatar(formData?.genero || "Masculino");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-gray-900 rounded-lg shadow-xl 
            w-[calc(100vw-2rem)] sm:w-[360px] md:w-[400px] lg:w-[450px] 
            h-[calc(100dvh-4rem)] sm:h-[500px] md:h-[600px] lg:h-[650px] 
            max-h-[calc(95dvh)] sm:max-h-[95dvh] md:max-h-[95dvh] lg:max-h-[95dvh]
            flex flex-col
            absolute bottom-4 right-4 sm:right-4 sm:bottom-4
            mx-4 sm:mx-0 mb-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 bg-gray-800/50 shrink-0">
              <div className="flex items-center space-x-3">
                <img
                  src={avatarSrc}
                  alt={agentName}
                  className="w-12 h-12 rounded-full border-2 border-indigo-500/30 cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={() => setShowLargeAvatar(true)}
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

            <div className="flex-1 p-4 overflow-y-auto bg-gray-800/50 space-y-4 min-h-0
              [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-gray-800/40
              [&::-webkit-scrollbar-thumb]:bg-gray-600
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-gray-500"
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
                      className={`max-w-[85%] p-3 rounded-lg text-sm ${
                        item.isUser
                          ? "bg-indigo-600 text-white ml-auto"
                          : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({...props}) => <p className="mb-1 last:mb-0" {...props} />,
                          a: ({...props}) => (
                            <a 
                              className="text-blue-300 hover:text-blue-200" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              {...props} 
                            />
                          ),
                          ul: ({...props}) => <ul className="ml-4 space-y-0.5" {...props} />,
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
                            <h2 className="text-base font-semibold mb-1" {...props} />
                          ),
                          h3: ({...props}) => (
                            <h3 className="text-base font-medium mb-1" {...props} />
                          )
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
              className="p-4 border-t border-gray-700 bg-gray-800 shrink-0"
            >
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
                    isTyping
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
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
    </div>
  );
};
