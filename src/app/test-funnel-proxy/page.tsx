'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/store/searchStore';
import { isProxiedContext } from '@/utils/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft, Play, Bug, Eye, RefreshCw } from 'lucide-react';

export default function TestFunnelProxyPage() {
  const router = useRouter();
  const searchStore = useSearchStore();
  
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Détection du contexte
  const isProxied = isProxiedContext();
  const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';

  // État pour surveiller le store
  const [storeSnapshots, setStoreSnapshots] = useState<any[]>([]);

  // Surveillance continue du store
  useEffect(() => {
    const interval = setInterval(() => {
      setStoreSnapshots(prev => [
        ...prev.slice(-10), // Garder seulement les 10 derniers
        {
          timestamp: new Date().toISOString(),
          currentStep: searchStore.formData.currentStep,
          departureComplete: searchStore.formData.departure.isComplete,
          arrivalComplete: searchStore.formData.arrival.isComplete,
          pathname: window.location.pathname
        }
      ]);
    }, 500);

    return () => clearInterval(interval);
  }, [searchStore.formData]);

  // Fonction pour simuler le workflow problématique
  const runFunnelTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Réinitialiser le store
      addTestResult('🔄 Réinitialisation du store search');
      searchStore.reset();
      await wait(500);

      // Test 2: Remplir l'étape 1 (locations)
      addTestResult('📍 Remplissage étape 1 (locations)');
      searchStore.setDeparture({
        country: 'France',
        city: 'Paris',
        postalCode: '75001',
        displayName: 'Paris, France',
        isComplete: true
      });

      searchStore.setArrival({
        country: 'Réunion',
        city: 'Saint-Denis',
        postalCode: '97400',
        displayName: 'Saint-Denis, Réunion',
        isComplete: true
      });

      await wait(500);

      // Test 3: Vérifier l'état du store
      const isStep1Complete = searchStore.isStepComplete(1);
      addTestResult(`✅ Étape 1 complète: ${isStep1Complete ? 'OUI' : 'NON'}`);

      if (!isStep1Complete) {
        addTestResult('❌ Échec: Étape 1 non complète après remplissage');
        setIsRunning(false);
        return;
      }

      // Test 4: Navigation vers étape 2
      addTestResult('🧭 Navigation vers étape 2...');
      const beforeNavigation = {
        step: searchStore.formData.currentStep,
        departure: searchStore.formData.departure.isComplete,
        arrival: searchStore.formData.arrival.isComplete
      };

      router.push('/funnel/search/shipping-period');
      await wait(2000); // Attendre la navigation

      // Test 5: Vérifier l'état après navigation
      const afterNavigation = {
        step: searchStore.formData.currentStep,
        departure: searchStore.formData.departure.isComplete,
        arrival: searchStore.formData.arrival.isComplete
      };

      addTestResult(`📊 État avant navigation: ${JSON.stringify(beforeNavigation)}`);
      addTestResult(`📊 État après navigation: ${JSON.stringify(afterNavigation)}`);

      // Test 6: Détecter le problème
      if (!afterNavigation.departure || !afterNavigation.arrival) {
        addTestResult('🚨 BUG DÉTECTÉ: Store réinitialisé après navigation!');
        addTestResult('🔍 Cause probable: Conflit proxy Cloudflare avec Zustand');
      } else {
        addTestResult('✅ Navigation réussie: Store préservé');
      }

    } catch (error) {
      addTestResult(`❌ Erreur: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message
    }]);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const clearResults = () => {
    setTestResults([]);
    setStoreSnapshots([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux annonces</span>
          </button>
          <div className="flex items-center gap-3">
            <Bug className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Test Problème Funnel Proxy</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Contexte et diagnostic */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔍 Diagnostic de l'environnement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Contexte proxifié :</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isProxied 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {isProxied ? '⚠️ www.dodomove.fr/partage' : '✅ partage.dodomove.fr'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Domaine actuel :</span>
                <span className="text-gray-700 font-mono text-sm">{currentDomain}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Étape actuelle :</span>
                <span className="text-blue-600 font-semibold">{searchStore.formData.currentStep}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Store valide :</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  searchStore.formData.departure.isComplete 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {searchStore.formData.departure.isComplete ? 'OUI' : 'NON'}
                </span>
              </div>
            </div>
          </div>

          {/* Problème connu */}
          {isProxied && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">🚨 Environnement à risque détecté</h3>
              <p className="text-red-700 text-sm">
                Vous êtes sur le domaine proxifié où le bug de réinitialisation du store a été observé.
                Ce test va reproduire le problème pour le diagnostiquer.
              </p>
            </div>
          )}
        </div>

        {/* Contrôles de test */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              🧪 Test de reproduction du bug
            </h2>
            <div className="flex gap-3">
              <Button
                onClick={clearResults}
                variant="outline"
                icon={<RefreshCw className="w-4 h-4" />}
                iconPosition="left"
              >
                Effacer
              </Button>
              <Button
                onClick={runFunnelTest}
                disabled={isRunning}
                icon={<Play className="w-4 h-4" />}
                iconPosition="left"
              >
                {isRunning ? 'Test en cours...' : 'Reproduire le bug'}
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">🎯 Ce que ce test fait :</h3>
            <ol className="text-yellow-700 text-sm space-y-1">
              <li>1. Réinitialise le store search</li>
              <li>2. Remplit l'étape 1 (locations) complètement</li>
              <li>3. Navigue vers l'étape 2 (shipping-period)</li>
              <li>4. Vérifie si le store a été réinitialisé pendant la navigation</li>
              <li>5. Affiche le diagnostic du problème</li>
            </ol>
          </div>
        </div>

        {/* Résultats du test */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              📊 Résultats du test
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg font-mono text-sm"
                >
                  <span className="text-gray-500 text-xs">{result.timestamp}</span>
                  <span className="flex-1">{result.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Surveillance du store */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              👀 Surveillance du store en temps réel
            </h2>
            <span className="text-sm text-gray-500">
              Mise à jour toutes les 500ms
            </span>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {storeSnapshots.slice(-10).map((snapshot, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm font-mono"
              >
                <span className="text-xs text-gray-500">
                  {new Date(snapshot.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-blue-600">
                  Étape: {snapshot.currentStep}
                </span>
                <span className={snapshot.departureComplete ? 'text-green-600' : 'text-red-600'}>
                  Départ: {snapshot.departureComplete ? '✅' : '❌'}
                </span>
                <span className={snapshot.arrivalComplete ? 'text-green-600' : 'text-red-600'}>
                  Arrivée: {snapshot.arrivalComplete ? '✅' : '❌'}
                </span>
                <span className="text-gray-600 text-xs truncate">
                  {snapshot.pathname}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🛠️ Actions rapides
          </h2>
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => router.push('/funnel/search/locations')}
              variant="outline"
              icon={<Eye className="w-4 h-4" />}
              iconPosition="left"
            >
              Aller au Funnel Search
            </Button>
            <Button
              onClick={() => window.open('https://partage.dodomove.fr' + window.location.pathname, '_blank')}
              variant="outline"
              icon={<Eye className="w-4 h-4" />}
              iconPosition="left"
            >
              Tester sur domaine direct
            </Button>
            <Button
              onClick={() => searchStore.reset()}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Reset Store
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 