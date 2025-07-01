'use client';

import { useState, useEffect } from 'react';
import { apiFetch, getApiUrl } from '@/utils/apiUtils';

export default function DebugApiPage() {
  const [isProxied, setIsProxied] = useState<boolean | null>(null);
  const [hostname, setHostname] = useState<string>('');
  const [testApiUrl, setTestApiUrl] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostnameValue = window.location.hostname;
      const isProxiedValue = hostnameValue === 'www.dodomove.fr';
      
      setHostname(hostnameValue);
      setIsProxied(isProxiedValue);
      setTestApiUrl(getApiUrl('/api/get-announcements'));
    }
  }, []);

  const testApiCall = async () => {
    setIsLoading(true);
    setApiError(null);
    setApiResponse(null);

    try {
      console.log('🧪 Test API call with apiFetch...');
      const response = await apiFetch('/api/get-announcements?status=published');
      const data = await response.json();
      setApiResponse(data);
      console.log('✅ Success:', data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(errorMessage);
      console.error('❌ Error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectUrl = async () => {
    setIsLoading(true);
    setApiError(null);
    setApiResponse(null);

    try {
      console.log('🧪 Test direct URL call...');
      const response = await fetch('/partage/api/get-announcements?status=published');
      const data = await response.json();
      setApiResponse(data);
      console.log('✅ Success:', data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(errorMessage);
      console.error('❌ Error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Debug API Cross-Domain</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📍 Détection du contexte</h2>
          <div className="space-y-2">
            <p><strong>Hostname:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{hostname}</code></p>
            <p><strong>Est proxifié:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{isProxied?.toString()}</code></p>
            <p><strong>URL API générée:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{testApiUrl}</code></p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Tests d'API</h2>
          <div className="space-y-4">
            <button 
              onClick={testApiCall}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Test en cours...' : 'Test avec apiFetch()'}
            </button>
            
            <button 
              onClick={testDirectUrl}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
            >
              {isLoading ? 'Test en cours...' : 'Test URL directe /partage/api/'}
            </button>
          </div>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Erreur</h3>
            <pre className="text-red-700 whitespace-pre-wrap">{apiError}</pre>
          </div>
        )}

        {apiResponse && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Réponse API</h3>
            <p className="mb-2"><strong>Nombre d'annonces:</strong> {apiResponse.data?.length || 0}</p>
            <p className="mb-2"><strong>Message:</strong> {apiResponse.message}</p>
            <details>
              <summary className="cursor-pointer font-medium">Voir la réponse complète</summary>
              <pre className="mt-2 text-sm bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-700">
            <li>Vérifiez que "Est proxifié" = true si vous êtes sur www.dodomove.fr</li>
            <li>Vérifiez que "URL API générée" commence par /partage/ si proxifié</li>
            <li>Testez les deux boutons pour voir lequel fonctionne</li>
            <li>Ouvrez la console (F12) pour voir les logs détaillés</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 