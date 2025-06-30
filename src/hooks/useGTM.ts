'use client';

import { useCallback } from 'react';

// Types pour les événements GTM
interface GTMEvent {
  event: string;
  [key: string]: any;
}

interface GTMPageView {
  page_title: string;
  page_location: string;
  page_path: string;
}

interface GTMAnnouncementEvent {
  announcement_type?: 'offer' | 'request';
  announcement_id?: string;
  contact_method?: string;
  filter_type?: string;
  search_query?: string;
}

export const useGTM = () => {
  // Vérifier si GTM est disponible et fonctionnel
  const isGTMAvailable = useCallback(() => {
    return typeof window !== 'undefined' && 
           typeof window.gtag === 'function' && 
           Array.isArray(window.dataLayer);
  }, []);

  // Fonction générique pour envoyer des événements
  const sendGTMEvent = useCallback((eventData: GTMEvent) => {
    if (!isGTMAvailable()) {
      console.log('📊 GTM Event (dev mode):', eventData);
      return;
    }

    try {
      window.gtag('event', eventData.event, eventData);
      console.log('📊 GTM Event sent:', eventData);
    } catch (error) {
      console.error('❌ Erreur GTM:', error);
    }
  }, [isGTMAvailable]);

  // Tracking des pages vues
  const trackPageView = useCallback((pageData: Partial<GTMPageView>) => {
    if (!isGTMAvailable()) return;

    const defaultPageData = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...pageData
    };

    window.gtag('config', 'GTM-MRHKMB9Z', defaultPageData);
  }, [isGTMAvailable]);

  // Tracking création d'annonce
  const trackAnnouncementCreated = useCallback((data: GTMAnnouncementEvent) => {
    sendGTMEvent({
      event: 'announcement_created',
      ...data
    });
  }, [sendGTMEvent]);

  // Tracking contact annonce
  const trackAnnouncementContact = useCallback((data: GTMAnnouncementEvent) => {
    sendGTMEvent({
      event: 'announcement_contact',
      ...data
    });
  }, [sendGTMEvent]);

  // Tracking modification d'annonce
  const trackAnnouncementUpdated = useCallback((data: GTMAnnouncementEvent) => {
    sendGTMEvent({
      event: 'announcement_updated',
      ...data
    });
  }, [sendGTMEvent]);

  // Tracking suppression d'annonce
  const trackAnnouncementDeleted = useCallback((data: GTMAnnouncementEvent) => {
    sendGTMEvent({
      event: 'announcement_deleted',
      ...data
    });
  }, [sendGTMEvent]);

  // Tracking création d'alerte
  const trackAlertCreated = useCallback((data: GTMAnnouncementEvent) => {
    sendGTMEvent({
      event: 'alert_created',
      ...data
    });
  }, [sendGTMEvent]);

  // Tracking utilisation des filtres
  const trackFilterUsed = useCallback((data: GTMAnnouncementEvent) => {
    sendGTMEvent({
      event: 'filter_used',
      ...data
    });
  }, [sendGTMEvent]);

  // Tracking recherche
  const trackSearch = useCallback((data: GTMAnnouncementEvent) => {
    sendGTMEvent({
      event: 'search_performed',
      ...data
    });
  }, [sendGTMEvent]);

  // Tracking navigation funnel
  const trackFunnelStep = useCallback((stepName: string, stepNumber: number, additionalData?: any) => {
    sendGTMEvent({
      event: 'funnel_step',
      step_name: stepName,
      step_number: stepNumber,
      ...additionalData
    });
  }, [sendGTMEvent]);

  return {
    trackPageView,
    trackAnnouncementCreated,
    trackAnnouncementContact,
    trackAnnouncementUpdated,
    trackAnnouncementDeleted,
    trackAlertCreated,
    trackFilterUsed,
    trackSearch,
    trackFunnelStep,
    sendGTMEvent,
    isGTMAvailable
  };
}; 