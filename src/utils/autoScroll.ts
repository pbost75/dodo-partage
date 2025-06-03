import { useCallback } from 'react';

/**
 * Hook utilitaire pour gérer le scroll automatique
 * Version simplifiée pour DodoPartage
 */
export const useAutoScroll = () => {
  const scrollToRevealContent = useCallback(() => {
    // Délai pour permettre au contenu de se rendre
    setTimeout(() => {
      // Vérifier si nous sommes sur mobile
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // Sur mobile, scroll vers le bas de la page pour révéler le contenu
        const currentScrollY = window.scrollY;
        const bodyHeight = document.body.scrollHeight;
        const windowHeight = window.innerHeight;
        
        // Si on n'est pas déjà en bas de page, scroll vers le bas
        if (currentScrollY + windowHeight < bodyHeight - 100) {
          window.scrollBy({
            top: 200,
            behavior: 'smooth'
          });
        }
      }
    }, 100);
  }, []);

  const scrollToElement = useCallback((element: HTMLElement) => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }, []);

  return {
    scrollToRevealContent,
    scrollToElement
  };
}; 