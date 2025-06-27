'use client';

import React from 'react';
import { useSmartRouter } from '@/utils/navigation';
import { isProxiedContext, buildUrl } from '@/utils/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft, ExternalLink, Home, Edit3, Trash2 } from 'lucide-react';

export default function TestLinksPage() {
  const router = useSmartRouter();
  
  // Détection du contexte
  const isProxied = isProxiedContext();
  const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';
  
  // URLs de test
  const testUrls = [
    { path: '/', label: 'Accueil' },
    { path: '/annonce/TEST-123', label: 'Détail annonce' },
    { path: '/modifier/test-token', label: 'Modifier annonce' },
    { path: '/supprimer/test-token', label: 'Supprimer annonce' },
    { path: '/funnel/propose', label: 'Créer annonce (offer)' },
    { path: '/funnel/search', label: 'Créer demande (search)' }
  ];
  
  // Variables d'environnement
  const envUrls = {
    NEXT_PUBLIC_SEO_URL: process.env.NEXT_PUBLIC_SEO_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    currentOrigin: currentDomain
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux annonces</span>
          </button>
          <div className="flex items-center gap-3">
            <ExternalLink className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Test des liens cross-domain</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Détection du contexte */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔍 Détection du contexte
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
          </div>
        </div>

        {/* Variables d'environnement */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⚙️ Variables d'environnement
          </h2>
          <div className="space-y-3">
            {Object.entries(envUrls).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{key} :</span>
                <span className="text-gray-700 font-mono text-sm">
                  {value || '<non définie>'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Test des URLs générées */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔗 URLs générées par buildUrl()
          </h2>
          <div className="space-y-3">
            {testUrls.map(({ path, label }) => {
              const builtUrl = buildUrl(path);
              return (
                <div key={path} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{label}</span>
                    <span className="text-sm text-gray-500">Path: {path}</span>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-600 mb-1">URL générée :</div>
                    <div className="font-mono text-blue-600 break-all">{builtUrl}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Test des navigations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🧪 Test de navigation (useSmartRouter)
          </h2>
          <p className="text-gray-600 mb-6">
            Cliquez sur ces boutons pour tester la navigation cross-domain. 
            Les URLs doivent rester cohérentes avec le contexte actuel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testUrls.map(({ path, label }) => (
              <Button
                key={path}
                variant="outline"
                onClick={() => router.push(path)}
                className="justify-start"
                icon={
                  path === '/' ? <Home className="w-4 h-4" /> :
                  path.includes('/modifier') ? <Edit3 className="w-4 h-4" /> :
                  path.includes('/supprimer') ? <Trash2 className="w-4 h-4" /> :
                  <ExternalLink className="w-4 h-4" />
                }
                iconPosition="left"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Informations de débogage */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">
            🐛 Instructions de test
          </h2>
          <div className="space-y-3 text-sm text-yellow-800">
            <div>
              <strong>1. Test depuis www.dodomove.fr/partage :</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Tous les liens doivent garder le préfixe /partage</li>
                <li>isProxiedContext() doit retourner true</li>
                <li>Les URLs buildUrl() doivent commencer par /partage</li>
              </ul>
            </div>
            
            <div>
              <strong>2. Test depuis partage.dodomove.fr :</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Les liens doivent être directs (sans préfixe)</li>
                <li>isProxiedContext() doit retourner false</li>
                <li>Les URLs buildUrl() doivent commencer par /</li>
              </ul>
            </div>
            
            <div>
              <strong>3. Test du bouton modification :</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>La popup de succès doit utiliser l'URL cohérente</li>
                <li>Le bouton "Retour aux annonces" doit pointer vers la bonne URL</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 