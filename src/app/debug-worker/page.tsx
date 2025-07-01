'use client';

import React, { useState, useEffect } from 'react';
import { buildUrl } from '@/utils/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, RefreshCw, Globe } from 'lucide-react';

export default function DebugWorkerPage() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    runDiagnostics();
  }, []);
  
  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: any = {};
    
    // 1. Informations de base
    results.current = {
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    // 2. Test des headers de réponse
    try {
      const response = await fetch(window.location.href, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      results.headers = {
        status: response.status,
        statusText: response.statusText,
        proxiedVia: response.headers.get('X-Proxied-Via'),
        funnelProxied: response.headers.get('X-Funnel-Proxied'),
        cacheControl: response.headers.get('Cache-Control'),
        server: response.headers.get('Server'),
        cfRay: response.headers.get('CF-Ray')
      };
    } catch (error) {
      results.headers = { error: 'Impossible de récupérer les headers' };
    }
    
    // 3. Test spécifique funnel search
    try {
      const funnelUrl = buildUrl('/funnel/search/locations');
      console.log('🧪 Test funnel URL:', funnelUrl);
      
      const funnelResponse = await fetch(funnelUrl, { 
        method: 'HEAD',
        cache: 'no-cache',
        redirect: 'manual' // Important : ne pas suivre les redirections
      });
      
      results.funnelTest = {
        requestedUrl: funnelUrl,
        status: funnelResponse.status,
        statusText: funnelResponse.statusText,
        isRedirect: funnelResponse.status >= 300 && funnelResponse.status < 400,
        location: funnelResponse.headers.get('Location'),
        proxiedVia: funnelResponse.headers.get('X-Proxied-Via'),
        funnelProxied: funnelResponse.headers.get('X-Funnel-Proxied')
      };
    } catch (error) {
      results.funnelTest = { error: 'Erreur lors du test funnel' };
    }
    
    // 4. Test de cache
    const cacheTests = [];
    for (let i = 0; i < 3; i++) {
      try {
        const start = Date.now();
        const cacheResponse = await fetch(buildUrl('/'), { 
          cache: 'no-cache',
          headers: { 'Cache-Buster': Date.now().toString() }
        });
        const duration = Date.now() - start;
        
        cacheTests.push({
          attempt: i + 1,
          duration,
          status: cacheResponse.status,
          proxiedVia: cacheResponse.headers.get('X-Proxied-Via')
        });
      } catch (error) {
        cacheTests.push({ attempt: i + 1, error: 'Erreur' });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    results.cacheTests = cacheTests;
    
    setDiagnostics(results);
    setIsLoading(false);
  };
  
  const testDirectFunnelAccess = () => {
    const testUrl = buildUrl('/funnel/search/locations');
    console.log('🧪 Test accès direct funnel:', testUrl);
    
    // Ouvrir dans un nouvel onglet pour voir le comportement
    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.location.href = testUrl;
    }
  };
  
  const clearAllCaches = async () => {
    // Purger le cache navigateur
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('🗑️ Cache service worker supprimé');
      } catch (error) {
        console.warn('⚠️ Impossible de supprimer le cache SW:', error);
      }
    }
    
    // Forcer le rechargement sans cache
    window.location.reload();
  };
  
  const getDiagnosticIcon = (condition: boolean) => {
    return condition ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => window.location.href = buildUrl('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux annonces</span>
          </button>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Diagnostic Worker Cloudflare</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Alerte problème */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-3">
            🚨 Problème Identifié
          </h2>
          <p className="text-red-700 mb-4">
            Vous êtes encore redirigé vers <code>partage.dodomove.fr</code> pour le funnel search 
            malgré le déploiement du Worker v4. Cette page va diagnostiquer la cause.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={runDiagnostics}
              disabled={isLoading}
              icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              iconPosition="left"
            >
              {isLoading ? 'Diagnostic en cours...' : 'Relancer diagnostic'}
            </Button>
            <Button
              onClick={testDirectFunnelAccess}
              variant="outline"
              icon={<Globe className="w-4 h-4" />}
              iconPosition="left"
            >
              Test accès direct funnel
            </Button>
          </div>
        </div>

        {/* Informations actuelles */}
        {diagnostics.current && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📍 Environnement Actuel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Hostname:</span>
                  <code className="text-blue-600">{diagnostics.current.hostname}</code>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pathname:</span>
                  <code className="text-blue-600">{diagnostics.current.pathname}</code>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Timestamp:</span>
                  <span className="text-gray-600">{new Date(diagnostics.current.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contexte:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    diagnostics.current.hostname === 'www.dodomove.fr' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {diagnostics.current.hostname === 'www.dodomove.fr' ? 'Proxifié' : 'Direct'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test des headers */}
        {diagnostics.headers && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔍 Headers de Réponse
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Worker v4 actif:</span>
                <div className="flex items-center gap-2">
                  {getDiagnosticIcon(diagnostics.headers.proxiedVia === 'cloudflare-worker-v4')}
                  <code className="text-sm">{diagnostics.headers.proxiedVia || 'Non détecté'}</code>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Funnel proxifié:</span>
                <div className="flex items-center gap-2">
                  {getDiagnosticIcon(diagnostics.headers.funnelProxied === 'true')}
                  <code className="text-sm">{diagnostics.headers.funnelProxied || 'Non'}</code>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Status HTTP:</span>
                <code className={`text-sm px-2 py-1 rounded ${
                  diagnostics.headers.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {diagnostics.headers.status} {diagnostics.headers.statusText}
                </code>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Cloudflare Ray:</span>
                <code className="text-sm text-gray-600">{diagnostics.headers.cfRay || 'Non détecté'}</code>
              </div>
            </div>
          </div>
        )}

        {/* Test spécifique funnel */}
        {diagnostics.funnelTest && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🎯 Test Funnel Search
            </h2>
            
            {diagnostics.funnelTest.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                Erreur: {diagnostics.funnelTest.error}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">URL testée:</span>
                  <code className="text-sm text-blue-600">{diagnostics.funnelTest.requestedUrl}</code>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">🚨 Redirection détectée:</span>
                  <div className="flex items-center gap-2">
                    {diagnostics.funnelTest.isRedirect ? 
                      <XCircle className="w-5 h-5 text-red-500" /> : 
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    }
                    <code className={`text-sm px-2 py-1 rounded ${
                      diagnostics.funnelTest.isRedirect ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {diagnostics.funnelTest.status} {diagnostics.funnelTest.statusText}
                    </code>
                  </div>
                </div>

                {diagnostics.funnelTest.isRedirect && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">🔍 Cause de la redirection:</h3>
                    <p className="text-red-700 text-sm mb-2">
                      Redirection vers: <code>{diagnostics.funnelTest.location}</code>
                    </p>
                    <p className="text-red-600 text-sm">
                      Le Worker v4 n'est pas encore actif ou il y a un cache persistant.
                    </p>
                  </div>
                )}

                {diagnostics.funnelTest.proxiedVia && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Worker version:</span>
                    <code className="text-sm text-blue-700">{diagnostics.funnelTest.proxiedVia}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions de résolution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🛠️ Actions de Résolution
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 Étapes à suivre :</h3>
              <ol className="text-yellow-700 text-sm space-y-1">
                <li><strong>1.</strong> Vérifiez que le Worker v4 est bien déployé sur Cloudflare</li>
                <li><strong>2.</strong> Purgez le cache Cloudflare depuis le dashboard</li>
                <li><strong>3.</strong> Videz le cache du navigateur avec Ctrl+Shift+R</li>
                <li><strong>4.</strong> Testez en navigation privée</li>
              </ol>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={clearAllCaches}
                icon={<RefreshCw className="w-4 h-4" />}
                iconPosition="left"
                className="bg-red-500 hover:bg-red-600"
              >
                Purger cache & recharger
              </Button>
              
              <Button
                onClick={() => window.open('https://dash.cloudflare.com/', '_blank')}
                variant="outline"
                icon={<Globe className="w-4 h-4" />}
                iconPosition="left"
              >
                Ouvrir Cloudflare Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Données brutes */}
        {Object.keys(diagnostics).length > 0 && (
          <details className="bg-white rounded-xl border border-gray-200 p-6">
            <summary className="cursor-pointer text-lg font-semibold text-gray-900 mb-4">
              🔬 Données de diagnostic brutes (cliquer pour voir)
            </summary>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
} 