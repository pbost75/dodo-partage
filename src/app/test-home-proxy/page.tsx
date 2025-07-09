'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSmartRouter } from '@/utils/navigation';
import Button from '@/components/ui/Button';
import { AlertCircle, CheckCircle, RefreshCw, Home, Search, Filter, ToggleLeft } from 'lucide-react';

function TestHomeProxyContent() {
  const router = useSmartRouter();
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isTestRunning, setIsTestRunning] = useState(false);

  // États pour simuler la page d'accueil
  const [searchDeparture, setSearchDeparture] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [announcementType, setAnnouncementType] = useState<'offer' | 'request'>('offer');
  const [filters, setFilters] = useState({ priceType: 'all', minVolume: 'all' });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[TEST HOME PROXY] ${message}`);
  };

  const updateTestResult = (testName: string, success: boolean) => {
    setTestResults(prev => ({ ...prev, [testName]: success }));
  };

  // Test 1: Vérification de l'hydratation React
  const testReactHydration = () => {
    addLog('🔍 Test hydratation React...');
    
    try {
      // Vérifier si React est chargé
      const isReactLoaded = typeof window !== 'undefined' && 
                           document.querySelector('[data-reactroot]') !== null;
      
      addLog(`React chargé: ${isReactLoaded ? '✅' : '❌'}`);
      
      // Vérifier si les composants Next.js sont actifs
      const hasNextData = document.querySelector('#__NEXT_DATA__') !== null;
      addLog(`Next.js data: ${hasNextData ? '✅' : '❌'}`);
      
      // Vérifier les event listeners
      const hasEventListeners = document.querySelectorAll('button[onClick]').length > 0;
      addLog(`Event listeners: ${hasEventListeners ? '✅' : '❌'}`);
      
      const success = isReactLoaded && hasNextData;
      updateTestResult('hydration', success);
      
      return success;
    } catch (error) {
      addLog(`❌ Erreur test hydratation: ${error}`);
      updateTestResult('hydration', false);
      return false;
    }
  };

  // Test 2: Simulation barre de recherche
  const testSearchBar = () => {
    addLog('🔍 Test barre de recherche...');
    
    try {
      // Simuler un changement de recherche
      const testDeparture = 'France';
      const testDestination = 'Martinique';
      
      setSearchDeparture(testDeparture);
      setSearchDestination(testDestination);
      
      addLog(`Départ défini: ${testDeparture}`);
      addLog(`Destination définie: ${testDestination}`);
      
      // Vérifier que les états se mettent à jour
      setTimeout(() => {
        const isStateUpdated = searchDeparture === testDeparture && 
                              searchDestination === testDestination;
        
        addLog(`État mis à jour: ${isStateUpdated ? '✅' : '❌'}`);
        updateTestResult('searchBar', isStateUpdated);
      }, 100);
      
      return true;
    } catch (error) {
      addLog(`❌ Erreur test barre recherche: ${error}`);
      updateTestResult('searchBar', false);
      return false;
    }
  };

  // Test 3: Simulation toggle propose/cherche
  const testToggleSwitch = () => {
    addLog('🔄 Test toggle Propose/Cherche...');
    
    try {
      const originalType = announcementType;
      const newType = originalType === 'offer' ? 'request' : 'offer';
      
      addLog(`Type actuel: ${originalType}`);
      addLog(`Changement vers: ${newType}`);
      
      setAnnouncementType(newType);
      
      // Vérifier le changement après un délai
      setTimeout(() => {
        const isToggleWorking = announcementType !== originalType;
        addLog(`Toggle fonctionnel: ${isToggleWorking ? '✅' : '❌'}`);
        updateTestResult('toggle', isToggleWorking);
      }, 100);
      
      return true;
    } catch (error) {
      addLog(`❌ Erreur test toggle: ${error}`);
      updateTestResult('toggle', false);
      return false;
    }
  };

  // Test 4: Simulation changement de filtres
  const testFilters = () => {
    addLog('🔧 Test filtres...');
    
    try {
      const newFilters = { priceType: 'free', minVolume: '1' };
      
      addLog(`Filtres actuels: ${JSON.stringify(filters)}`);
      addLog(`Nouveaux filtres: ${JSON.stringify(newFilters)}`);
      
      setFilters(newFilters);
      
      // Vérifier le changement
      setTimeout(() => {
        const isFiltersWorking = filters.priceType === newFilters.priceType;
        addLog(`Filtres fonctionnels: ${isFiltersWorking ? '✅' : '❌'}`);
        updateTestResult('filters', isFiltersWorking);
      }, 100);
      
      return true;
    } catch (error) {
      addLog(`❌ Erreur test filtres: ${error}`);
      updateTestResult('filters', false);
      return false;
    }
  };

  // Test 5: Navigation avec router
  const testNavigation = () => {
    addLog('🧭 Test navigation...');
    
    try {
      const testParams = new URLSearchParams();
      testParams.set('departure', 'France');
      testParams.set('destination', 'Martinique');
      testParams.set('type', 'offer');
      
      const testUrl = `/?${testParams.toString()}`;
      
      addLog(`Test navigation vers: ${testUrl}`);
      
      // Simuler la navigation (sans réellement naviguer)
      const canNavigate = typeof router.push === 'function';
      addLog(`Router disponible: ${canNavigate ? '✅' : '❌'}`);
      
      updateTestResult('navigation', canNavigate);
      return canNavigate;
    } catch (error) {
      addLog(`❌ Erreur test navigation: ${error}`);
      updateTestResult('navigation', false);
      return false;
    }
  };

  // Test 6: Vérification headers proxy
  const testProxyHeaders = async () => {
    addLog('📡 Test headers proxy...');
    
    try {
      const response = await fetch('/', { method: 'HEAD' });
      
      const proxyHeader = response.headers.get('X-Proxied-Via');
      const homeHeader = response.headers.get('X-Home-Page-Proxied');
      
      addLog(`Header proxy: ${proxyHeader || 'Non trouvé'}`);
      addLog(`Header home page: ${homeHeader || 'Non trouvé'}`);
      
      const isProxied = proxyHeader?.includes('cloudflare-worker');
      addLog(`Page proxifiée: ${isProxied ? '✅' : '❌'}`);
      
      updateTestResult('proxyHeaders', !!isProxied);
      return !!isProxied;
    } catch (error) {
      addLog(`❌ Erreur test headers: ${error}`);
      updateTestResult('proxyHeaders', false);
      return false;
    }
  };

  // Fonction pour exécuter tous les tests
  const runAllTests = async () => {
    setIsTestRunning(true);
    setLogs([]);
    setTestResults({});
    
    addLog('🚀 Début des tests de la page d\'accueil...');
    
    // Tests synchrones
    testReactHydration();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    testSearchBar();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    testToggleSwitch();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    testFilters();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    testNavigation();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Test asynchrone
    await testProxyHeaders();
    
    addLog('✅ Tous les tests terminés !');
    setIsTestRunning(false);
  };

  // Test automatique au chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      runAllTests();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getTestIcon = (testName: string) => {
    if (!(testName in testResults)) return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    return testResults[testName] 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getTestColor = (testName: string) => {
    if (!(testName in testResults)) return 'border-blue-200 bg-blue-50';
    return testResults[testName] 
      ? 'border-green-200 bg-green-50'
      : 'border-red-200 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Test Proxy Page d'Accueil
            </h1>
          </div>
          <p className="text-gray-600 mb-4">
            Page de diagnostic pour tester les fonctionnalités de la page d'accueil via le proxy Cloudflare.
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={runAllTests}
              disabled={isTestRunning}
              icon={isTestRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            >
              {isTestRunning ? 'Tests en cours...' : 'Relancer les tests'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              icon={<Home className="w-4 h-4" />}
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>

        {/* Résultats des tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg border-2 ${getTestColor('hydration')}`}>
            <div className="flex items-center gap-2 mb-2">
              {getTestIcon('hydration')}
              <h3 className="font-semibold">Hydratation React</h3>
            </div>
            <p className="text-sm text-gray-600">
              Vérification que React s'hydrate correctement côté client
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${getTestColor('searchBar')}`}>
            <div className="flex items-center gap-2 mb-2">
              {getTestIcon('searchBar')}
              <h3 className="font-semibold">Barre de recherche</h3>
            </div>
            <p className="text-sm text-gray-600">
              Test des changements d'état de la barre de recherche
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${getTestColor('toggle')}`}>
            <div className="flex items-center gap-2 mb-2">
              {getTestIcon('toggle')}
              <h3 className="font-semibold">Toggle Propose/Cherche</h3>
            </div>
            <p className="text-sm text-gray-600">
              Test du basculement entre les types d'annonces
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${getTestColor('filters')}`}>
            <div className="flex items-center gap-2 mb-2">
              {getTestIcon('filters')}
              <h3 className="font-semibold">Filtres</h3>
            </div>
            <p className="text-sm text-gray-600">
              Test des changements de filtres (prix, volume)
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${getTestColor('navigation')}`}>
            <div className="flex items-center gap-2 mb-2">
              {getTestIcon('navigation')}
              <h3 className="font-semibold">Navigation</h3>
            </div>
            <p className="text-sm text-gray-600">
              Test du router et de la navigation programmatique
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${getTestColor('proxyHeaders')}`}>
            <div className="flex items-center gap-2 mb-2">
              {getTestIcon('proxyHeaders')}
              <h3 className="font-semibold">Headers Proxy</h3>
            </div>
            <p className="text-sm text-gray-600">
              Vérification des headers de proxy Cloudflare
            </p>
          </div>
        </div>

        {/* Simulation des composants de la page d'accueil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Simulation Page d'Accueil</h2>
          
          <div className="space-y-4">
            {/* Barre de recherche simulée */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Barre de recherche
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Départ"
                  value={searchDeparture}
                  onChange={(e) => setSearchDeparture(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Destination"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button variant="primary" size="sm">
                  Rechercher
                </Button>
              </div>
            </div>

            {/* Toggle simulé */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <ToggleLeft className="w-4 h-4" />
                Toggle Propose/Cherche
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={announcementType === 'offer' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setAnnouncementType('offer')}
                >
                  Propose ({announcementType === 'offer' ? 'actif' : 'inactif'})
                </Button>
                <Button
                  variant={announcementType === 'request' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setAnnouncementType('request')}
                >
                  Cherche ({announcementType === 'request' ? 'actif' : 'inactif'})
                </Button>
              </div>
            </div>

            {/* Filtres simulés */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={filters.priceType}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les prix</option>
                  <option value="free">Gratuit</option>
                  <option value="paid">Payant</option>
                </select>
                <select
                  value={filters.minVolume}
                  onChange={(e) => setFilters(prev => ({ ...prev, minVolume: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les volumes</option>
                  <option value="1">Min 1 m³</option>
                  <option value="3">Min 3 m³</option>
                  <option value="5">Min 5 m³</option>
                  <option value="10">Min 10 m³</option>
                  <option value="20">Min 20 m³</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-900 rounded-xl text-green-400 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium">Logs de test</span>
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">En attente des logs...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestHomeProxy() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement des tests...</div>}>
      <TestHomeProxyContent />
    </Suspense>
  );
} 