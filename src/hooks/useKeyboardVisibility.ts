import { useState, useEffect } from 'react';

export const useKeyboardVisibility = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    
    if (visualViewport) {
      const handleResize = () => {
        const heightDiff = window.innerHeight - visualViewport.height;
        
        if (heightDiff > 150) { // umbral típico para teclados
          setIsKeyboardVisible(true);
          setKeyboardHeight(heightDiff);
          // Scroll instantáneo al final
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'instant'
          });
        } else {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      };

      visualViewport.addEventListener('resize', handleResize);
      visualViewport.addEventListener('scroll', handleResize);

      return () => {
        visualViewport.removeEventListener('resize', handleResize);
        visualViewport.removeEventListener('scroll', handleResize);
      };
    }

    // Fallback para navegadores que no soportan visualViewport
    const handleFocus = () => {
      const heightDiff = window.screen.height - window.innerHeight;
      if (heightDiff > 150) {
        setIsKeyboardVisible(true);
        setKeyboardHeight(heightDiff);
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'instant'
        });
      }
    };

    window.addEventListener('resize', handleFocus);
    return () => window.removeEventListener('resize', handleFocus);
  }, []);

  return { isKeyboardVisible, keyboardHeight };
}; 