'use client';

import React, { useState, useEffect } from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { getCanonicalUrl, shouldIndexPage } from '@/utils/seo';
import { usePathname } from 'next/navigation';

export default function TestSEOPage() {
  const pathname = usePathname();
  const [hostname, setHostname] = useState<string>('');
  const [canonicalUrl, setCanonicalUrl] = useState<string>('');
  const [shouldIndex, setShouldIndex] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
      const cleanPathname = pathname.replace(/^\/partage/, '') || '/test-seo';
      setCanonicalUrl(getCanonicalUrl(cleanPathname));
      setShouldIndex(shouldIndexPage());
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEOHead 
        title="Test SEO - DodoPartage"
        description="Page de test pour vérifier le fonctionnement des balises canonical et robots."
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔍 Test des balises SEO - DodoPartage
          </h1>
          
          <div className="space-y-6">
            {/* Informations actuelles */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                📍 Informations actuelles
              </h2>
              <div className="space-y-2 text-sm">
                <p><strong>Hostname:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{hostname}</code></p>
                <p><strong>Pathname:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{pathname}</code></p>
                <p><strong>URL actuelle:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</code></p>
              </div>
            </div>

            {/* URL Canonical */}
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">
                🔗 URL Canonical générée
              </h2>
              <div className="space-y-2">
                <p><strong>URL canonical:</strong></p>
                <code className="block bg-green-100 px-4 py-2 rounded text-sm break-all">
                  {canonicalUrl}
                </code>
                <p className="text-sm text-green-700">
                  ✅ Cette URL pointe toujours vers www.dodomove.fr/partage, peu importe le domaine actuel.
                </p>
              </div>
            </div>

            {/* Directives Robots */}
            <div className={`${shouldIndex ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-6`}>
              <h2 className={`text-xl font-semibold ${shouldIndex ? 'text-green-900' : 'text-red-900'} mb-4`}>
                🤖 Directives Robots
              </h2>
              <div className="space-y-2">
                <p><strong>Doit être indexé:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${shouldIndex ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {shouldIndex ? '✅ OUI (index, follow)' : '❌ NON (noindex, nofollow)'}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  {shouldIndex 
                    ? '✅ Cette page sera indexée par Google car vous êtes sur www.dodomove.fr'
                    : '❌ Cette page ne sera PAS indexée car vous êtes sur partage.dodomove.fr'
                  }
                </p>
              </div>
            </div>

            {/* Balises HTML générées */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📄 Balises HTML générées
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-700 mb-2">Balise Canonical:</p>
                  <code className="block bg-gray-100 px-4 py-2 rounded text-sm overflow-x-auto">
                    &lt;link rel="canonical" href="{canonicalUrl}" /&gt;
                  </code>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-2">Balise Robots:</p>
                  <code className="block bg-gray-100 px-4 py-2 rounded text-sm">
                    &lt;meta name="robots" content="{shouldIndex ? 'index, follow' : 'noindex, nofollow'}" /&gt;
                  </code>
                </div>
              </div>
            </div>

            {/* Explication */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-900 mb-4">
                💡 Comment ça fonctionne
              </h2>
              <div className="space-y-3 text-sm text-yellow-800">
                <p><strong>1. Détection automatique:</strong> Le système détecte automatiquement si vous êtes sur www.dodomove.fr ou partage.dodomove.fr</p>
                <p><strong>2. URL Canonical:</strong> Quelle que soit l'URL actuelle, la balise canonical pointe TOUJOURS vers www.dodomove.fr/partage + le chemin</p>
                <p><strong>3. Robots directives:</strong></p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Sur <strong>www.dodomove.fr</strong> → <code>index, follow</code> (Google indexe)</li>
                  <li>Sur <strong>partage.dodomove.fr</strong> → <code>noindex, nofollow</code> (Google n'indexe pas)</li>
                </ul>
                <p><strong>4. Résultat:</strong> Google verra seulement www.dodomove.fr/partage dans ses résultats de recherche ✅</p>
              </div>
            </div>

            {/* Tests */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                🧪 Tests à effectuer
              </h2>
              <div className="space-y-2 text-sm text-blue-800">
                <p>1. <strong>Teste sur www.dodomove.fr/partage/test-seo</strong> → Doit afficher "index, follow"</p>
                <p>2. <strong>Teste sur partage.dodomove.fr/test-seo</strong> → Doit afficher "noindex, nofollow"</p>
                <p>3. <strong>Vérifie dans les DevTools</strong> → Regarde l'onglet Elements pour voir les balises &lt;link&gt; et &lt;meta&gt;</p>
                <p>4. <strong>Google Search Console</strong> → Ajoute seulement www.dodomove.fr (pas partage.dodomove.fr)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 