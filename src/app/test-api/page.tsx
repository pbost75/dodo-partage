'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/utils/apiUtils';
import { isProxiedContext, useSmartRouter } from '@/utils/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  response?: any;
  error?: string;
  duration?: number;
}

export default function TestApiPage() {
  const router = useRouter();
  const smartRouter = useSmartRouter();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Détection du contexte
  const isProxied = isProxiedContext();
  const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';

  // APIs à tester
  const apiTests = [
    { endpoint: '/api/test-backend', method: 'GET', description: 'Test connexion backend' },
    { endpoint: '/api/get-announcements', method: 'GET', description: 'Récupération des annonces' },
    { endpoint: '/api/test-email-alerts', method: 'GET', description: 'Test système d\'alertes' },
  ];

  const runSingleTest = async (endpoint: string, method: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Test API: ${method} ${endpoint}`);
      
      const response = await apiFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const duration = Date.now() - startTime;
      const data = await response.json();

      return {
        endpoint,
        method,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        response: data,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        endpoint,
        method,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        duration
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    for (const test of apiTests) {
      // Ajouter le test en statut pending
      setTests(prev => [...prev, {
        endpoint: test.endpoint,
        method: test.method,
        status: 'pending'
      }]);

      // Exécuter le test
      const result = await runSingleTest(test.endpoint, test.method);
      
      // Mettre à jour le résultat
      setTests(prev => prev.map(t => 
        t.endpoint === test.endpoint && t.method === test.method ? result : t
      ));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => smartRouter.push('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux annonces</span>
          </button>
          <div className="flex items-center gap-3">
            <Play className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Test des APIs cross-domain</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Détection du contexte */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔍 Contexte de test
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Contexte proxifié :</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isProxied 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isProxied ? '✅ www.dodomove.fr/partage' : '🔗 partage.dodomove.fr'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Domaine actuel :</span>
              <span className="text-gray-700 font-mono text-sm">{currentDomain}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Méthode d'appel API :</span>
              <span className="text-gray-700 text-sm">
                {isProxied ? 'Proxy vers partage.dodomove.fr' : 'Appels directs'}
              </span>
            </div>
          </div>
        </div>

        {/* Contrôles de test */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              🧪 Tests des endpoints API
            </h2>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              icon={<Play className="w-4 h-4" />}
              iconPosition="left"
            >
              {isRunning ? 'Tests en cours...' : 'Lancer tous les tests'}
            </Button>
          </div>

          {/* Liste des APIs à tester */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-medium text-gray-800">Endpoints testés :</h3>
            {apiTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-mono text-sm text-blue-600">{test.method}</span>
                  <span className="ml-2 text-gray-700">{test.endpoint}</span>
                </div>
                <span className="text-sm text-gray-500">{test.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Résultats des tests */}
        {tests.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              📊 Résultats des tests
            </h2>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <span className="font-mono text-sm">{test.method} {test.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {test.statusCode && (
                        <span className={`px-2 py-1 rounded ${
                          test.statusCode < 400 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {test.statusCode}
                        </span>
                      )}
                      {test.duration && <span>{test.duration}ms</span>}
                    </div>
                  </div>

                  {test.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                      <strong>Erreur :</strong> {test.error}
                    </div>
                  )}

                  {test.response && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        Voir la réponse
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(test.response, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Instructions de test
          </h3>
          <div className="space-y-2 text-blue-800">
            <p><strong>1.</strong> Testez depuis <code>www.dodomove.fr/partage</code> pour vérifier le proxy Cloudflare</p>
            <p><strong>2.</strong> Testez depuis <code>partage.dodomove.fr</code> pour vérifier les appels directs</p>
            <p><strong>3.</strong> Tous les tests doivent réussir dans les deux contextes</p>
            <p><strong>4.</strong> Vérifiez que les temps de réponse sont similaires</p>
          </div>
        </div>
      </div>
    </div>
  );
} 