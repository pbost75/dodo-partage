'use client';

import { useState } from 'react';
import { useGTM } from '@/hooks/useGTM';

export default function TestGTMPage() {
  const {
    trackPageView,
    trackAnnouncementCreated,
    trackAnnouncementContact,
    trackFilterUsed,
    trackSearch,
    sendGTMEvent,
    isGTMAvailable
  } = useGTM();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const testPageView = () => {
    trackPageView({
      page_title: 'Test GTM - DodoPartage',
      page_path: '/test-gtm'
    });
    addResult('✅ Page view trackée');
  };

  const runGTMDiagnostic = () => {
    addResult('🔍 === DIAGNOSTIC GTM AVANCÉ ===');
    
    // 1. Vérifier dataLayer
    if (typeof window !== 'undefined' && window.dataLayer) {
      addResult(`📊 DataLayer disponible avec ${window.dataLayer.length} éléments`);
      
      // Afficher les derniers événements dataLayer
      const recentEvents = window.dataLayer.slice(-5).map(event => {
        if (typeof event === 'object' && event.event) {
          return `Event: ${event.event}`;
        }
        return JSON.stringify(event).substring(0, 50);
      });
      recentEvents.forEach(event => addResult(`  📝 ${event}`));
    } else {
      addResult('❌ DataLayer non disponible');
    }

    // 2. Vérifier gtag
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      addResult('✅ gtag fonction disponible');
    } else {
      addResult('❌ gtag fonction non disponible');
    }

    // 3. Vérifier le chargement GTM
    const gtmScript = document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
    if (gtmScript) {
      addResult('✅ Script GTM trouvé dans le DOM');
    } else {
      addResult('❌ Script GTM non trouvé dans le DOM');
    }

    // 4. Vérifier les cookies GA
    const gaCookies = document.cookie.split(';').filter(cookie => 
      cookie.trim().startsWith('_ga')
    );
    if (gaCookies.length > 0) {
      addResult(`🍪 ${gaCookies.length} cookies GA trouvés :`);
      gaCookies.forEach(cookie => addResult(`  🍪 ${cookie.trim()}`));
    } else {
      addResult('❌ Aucun cookie GA trouvé');
    }

    // 5. Test manuel du tag GA4
    if (window.gtag) {
      try {
        window.gtag('config', 'G-VWE8386BQC', {
          page_title: 'Test Manuel GA4',
          page_location: window.location.href,
          debug_mode: true
        });
        addResult('✅ Test manuel GA4 envoyé (config direct)');
      } catch (error) {
        addResult(`❌ Erreur test manuel GA4: ${error}`);
      }
    }

    // 6. Vérifier les variables d'environnement
    addResult(`🔧 GTM_ID: ${process.env.NEXT_PUBLIC_GTM_ID || 'GTM-MRHKMB9Z'}`);
    addResult(`🔧 ENABLE_ANALYTICS: ${process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || 'undefined'}`);
  };

  const testGA4DirectEvent = () => {
    if (window.gtag) {
      window.gtag('event', 'test_direct_ga4', {
        event_category: 'test',
        event_label: 'direct_call',
        value: 1
      });
      addResult('✅ Événement GA4 direct envoyé');
    } else {
      addResult('❌ gtag non disponible pour test direct');
    }
  };

  const testAnnouncementCreated = () => {
    trackAnnouncementCreated({
      announcement_type: 'offer',
      announcement_id: 'test-123'
    });
    addResult('✅ Création d\'annonce trackée');
  };

  const testAnnouncementContact = () => {
    trackAnnouncementContact({
      announcement_type: 'offer',
      announcement_id: 'test-123',
      contact_method: 'email'
    });
    addResult('✅ Contact d\'annonce tracké');
  };

  const testFilterUsed = () => {
    trackFilterUsed({
      filter_type: 'price',
      search_query: 'gratuit'
    });
    addResult('✅ Utilisation de filtre trackée');
  };

  const testSearch = () => {
    trackSearch({
      search_query: 'Réunion à Guadeloupe'
    });
    addResult('✅ Recherche trackée');
  };

  const testCustomEvent = () => {
    sendGTMEvent({
      event: 'custom_test_event',
      test_parameter: 'test_value',
      timestamp: new Date().toISOString()
    });
    addResult('✅ Événement personnalisé envoyé');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test Google Tag Manager - DodoPartage
          </h1>

          {/* Status GTM */}
          <div className="mb-6 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Status GTM</h2>
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${isGTMAvailable() ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {isGTMAvailable() ? '✅ GTM est disponible et fonctionnel' : '❌ GTM non disponible'}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <p>ID GTM: {process.env.NEXT_PUBLIC_GTM_ID || 'GTM-MRHKMB9Z'}</p>
              <p>Analytics activées: {process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || 'non défini'}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold mb-2 text-blue-900">Instructions de test</h2>
            <div className="text-sm text-blue-800">
              <p className="mb-2">1. Ouvrez les outils de développement (F12)</p>
              <p className="mb-2">2. Allez dans l'onglet Console</p>
              <p className="mb-2">3. Cliquez sur les boutons ci-dessous pour tester les événements</p>
              <p>4. Vérifiez que les événements GTM apparaissent dans la console</p>
            </div>
          </div>

          {/* Boutons de test */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testPageView}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              📄 Test Page View
            </button>
            
            <button
              onClick={runGTMDiagnostic}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              🔍 Diagnostic GTM
            </button>

            <button
              onClick={testGA4DirectEvent}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              🎯 Test GA4 Direct
            </button>

            <button
              onClick={testAnnouncementCreated}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              📝 Test Création Annonce
            </button>

            <button
              onClick={testAnnouncementContact}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            >
              📧 Test Contact
            </button>

            <button
              onClick={testFilterUsed}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              🔍 Test Filtre
            </button>

            <button
              onClick={testSearch}
              className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
            >
              🔎 Test Recherche
            </button>

            <button
              onClick={testCustomEvent}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              ⚡ Test Custom Event
            </button>
          </div>

          {/* Résultats des tests */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Résultats des tests</h2>
              <button
                onClick={clearResults}
                className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded transition-colors"
              >
                Effacer
              </button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">Aucun test effectué</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vérification console */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Comment vérifier dans la console</h3>
            <div className="text-sm text-yellow-800">
              <p className="mb-1">• Les événements GTM apparaissent avec le préfixe "📊 GTM Event"</p>
              <p className="mb-1">• En mode développement: "📊 GTM Event (dev mode)"</p>
              <p>• En production: "📊 GTM Event sent"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 