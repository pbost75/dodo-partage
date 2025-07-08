'use client';

import { useState, useEffect } from 'react';
import { 
  isEmbeddedBrowser, 
  isProxiedContext, 
  getEmbeddedBrowserCapabilities,
  useSmartRouter,
  buildUrl
} from '@/utils/navigation-embedded-browsers';
import { 
  diagnoseApiIssues, 
  checkApiConnectivity, 
  apiFetch 
} from '@/utils/apiUtils-embedded-browsers';

interface DiagnosticResult {
  connectivity: boolean;
  corsSupport: boolean;
  cookieSupport: boolean;
  localStorageSupport: boolean;
  userAgent: string;
  currentUrl: string;
}

export default function TestEmbeddedBrowsersPage() {
  const [browserInfo, setBrowserInfo] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [apiTestResults, setApiTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useSmartRouter();

  // Détecter les informations du navigateur au chargement
  useEffect(() => {
    const info = {
      isEmbedded: isEmbeddedBrowser(),
      isProxied: isProxiedContext(),
      capabilities: getEmbeddedBrowserCapabilities(),
      userAgent: navigator.userAgent,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString(),
    };
    
    setBrowserInfo(info);
    console.log('📱 Informations navigateur détectées:', info);
  }, []);

  // Exécuter le diagnostic complet
  const runDiagnostics = async () => {
    setIsLoading(true);
    
    try {
      console.log('📱 Début diagnostic navigateur embarqué...');
      
      const result = await diagnoseApiIssues();
      setDiagnostics(result);
      
      console.log('📱 Diagnostic terminé:', result);
    } catch (error) {
      console.error('📱 Erreur pendant le diagnostic:', error);
      setDiagnostics({
        connectivity: false,
        corsSupport: false,
        cookieSupport: false,
        localStorageSupport: false,
        userAgent: navigator.userAgent,
        currentUrl: window.location.href,
      });
    }
    
    setIsLoading(false);
  };

  // Tester différents appels API
  const testApiCalls = async () => {
    setIsLoading(true);
    setApiTestResults([]);
    
    const apiTests = [
      { name: 'Backend Connection', path: '/api/test-backend' },
      { name: 'Get Announcements', path: '/api/get-announcements' },
      { name: 'Test Email Alerts', path: '/api/test-email-alerts' },
      { 
        name: 'Create Alert (test)', 
        path: '/api/create-alert', 
        method: 'POST', 
        data: {
          type: 'request',
          departure: 'Paris, France',
          arrival: 'Fort-de-France, Martinique',
          volume_min: 2,
          email: 'test-embedded-browser@dodomove.fr'
        }
      },
      { name: 'Create Alert Info (GET)', path: '/api/create-alert', method: 'GET' },
    ];

    const results = [];

    for (const test of apiTests) {
      try {
        console.log(`📱 Test API: ${test.name}`);
        
        const startTime = Date.now();
        let response;
        
        if (test.method === 'POST') {
          response = await apiFetch(test.path, {
            method: 'POST',
            body: JSON.stringify(test.data),
          });
        } else {
          response = await apiFetch(test.path);
        }
        
        const duration = Date.now() - startTime;
        
        // Essayer de récupérer le contenu de la réponse pour le debug
        let responseData = null;
        try {
          const responseText = await response.text();
          if (responseText) {
            try {
              responseData = JSON.parse(responseText);
            } catch (parseError) {
              // Si on ne peut pas parser en JSON, garder le texte brut
              responseData = responseText;
            }
          }
        } catch (textError) {
          responseData = 'Erreur lors de la lecture de la réponse';
        }
        
        const result = {
          name: test.name,
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          headers: Object.fromEntries(response.headers.entries()),
          responseData,
        };
        
        results.push(result);
        console.log(`📱 Résultat ${test.name}:`, result);
        
      } catch (error) {
        const result = {
          name: test.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: 'Failed',
        };
        
        results.push(result);
        console.error(`📱 Erreur ${test.name}:`, error);
      }
    }

    setApiTestResults(results);
    setIsLoading(false);
  };

  // Test de navigation
  const testNavigation = () => {
    console.log('📱 Test navigation...');
    
    // Test de navigation vers une autre page
    router.push('/annonce/test');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔬 Test Navigateurs Embarqués
            </h1>
            <p className="text-gray-600">
              Diagnostic et tests pour Facebook, Instagram, WhatsApp, etc.
            </p>
          </div>

          {/* Détection du navigateur */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              📱 Détection du Navigateur
            </h2>
            
            {browserInfo && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className={`p-3 rounded ${browserInfo.isEmbedded ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                      <span className="font-medium">
                        {browserInfo.isEmbedded ? '📱 Navigateur Embarqué Détecté' : '🖥️ Navigateur Standard'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className={`p-3 rounded ${browserInfo.isProxied ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      <span className="font-medium">
                        {browserInfo.isProxied ? '🌐 Mode Proxy (www.dodomove.fr)' : '🔗 Mode Direct (partage.dodomove.fr)'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {browserInfo.capabilities && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Détails du navigateur embarqué :</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {browserInfo.capabilities.isFacebook && <span className="bg-blue-500 text-white px-2 py-1 rounded">Facebook</span>}
                      {browserInfo.capabilities.isInstagram && <span className="bg-pink-500 text-white px-2 py-1 rounded">Instagram</span>}
                      {browserInfo.capabilities.isWhatsApp && <span className="bg-green-500 text-white px-2 py-1 rounded">WhatsApp</span>}
                      {browserInfo.capabilities.isLinkedIn && <span className="bg-blue-700 text-white px-2 py-1 rounded">LinkedIn</span>}
                      {browserInfo.capabilities.isTelegram && <span className="bg-blue-400 text-white px-2 py-1 rounded">Telegram</span>}
                      {browserInfo.capabilities.isTikTok && <span className="bg-black text-white px-2 py-1 rounded">TikTok</span>}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>User-Agent:</strong> {browserInfo.userAgent.substring(0, 100)}...</p>
                  <p><strong>URL:</strong> {browserInfo.currentUrl}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tests de diagnostic */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🔧 Diagnostic des Capacités
            </h2>
            
            <button
              onClick={runDiagnostics}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {isLoading ? '⏳ Test en cours...' : '🚀 Lancer le Diagnostic'}
            </button>

            {diagnostics && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded text-center ${diagnostics.connectivity ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="text-2xl mb-1">{diagnostics.connectivity ? '✅' : '❌'}</div>
                    <div className="text-sm font-medium">Connectivité API</div>
                  </div>
                  
                  <div className={`p-3 rounded text-center ${diagnostics.corsSupport ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="text-2xl mb-1">{diagnostics.corsSupport ? '✅' : '❌'}</div>
                    <div className="text-sm font-medium">Support CORS</div>
                  </div>
                  
                  <div className={`p-3 rounded text-center ${diagnostics.cookieSupport ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="text-2xl mb-1">{diagnostics.cookieSupport ? '✅' : '❌'}</div>
                    <div className="text-sm font-medium">Cookies</div>
                  </div>
                  
                  <div className={`p-3 rounded text-center ${diagnostics.localStorageSupport ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="text-2xl mb-1">{diagnostics.localStorageSupport ? '✅' : '❌'}</div>
                    <div className="text-sm font-medium">LocalStorage</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tests API */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🌐 Tests API
            </h2>
            
            <button
              onClick={testApiCalls}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 mb-4"
            >
              {isLoading ? '⏳ Tests en cours...' : '🧪 Tester les APIs'}
            </button>

            {apiTestResults.length > 0 && (
              <div className="space-y-3">
                {apiTestResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{result.name}</h3>
                      <span className={`px-2 py-1 rounded text-sm ${result.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {result.success ? 'Succès' : 'Échec'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {result.status && <p>Status: {result.status} {result.statusText}</p>}
                      {result.duration && <p>Durée: {result.duration}</p>}
                      {result.error && <p className="text-red-600">Erreur: {result.error}</p>}
                      {result.responseData && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600">Voir détails de la réponse</summary>
                          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.responseData, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tests de navigation */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🧭 Tests de Navigation
            </h2>
            
            <div className="space-y-2">
              <button
                onClick={testNavigation}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 mr-4"
              >
                🔗 Tester Navigation Interne
              </button>
              
              <button
                onClick={() => window.location.href = window.location.origin + buildUrl('/funnel/propose/locations')}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
              >
                🎯 Tester Funnel Complet
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">📝 Instructions de Test</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>1. <strong>Partage cette page</strong> sur Facebook, Instagram, WhatsApp, etc.</p>
              <p>2. <strong>Ouvre le lien</strong> depuis l'app mobile (pas le navigateur)</p>
              <p>3. <strong>Lance tous les tests</strong> pour identifier les problèmes</p>
              <p>4. <strong>Vérifie les logs</strong> dans la console (F12 sur desktop)</p>
              <p>5. <strong>Compare les résultats</strong> entre navigateurs normaux et embarqués</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
} 