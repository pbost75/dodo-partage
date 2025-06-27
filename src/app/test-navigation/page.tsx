'use client';

import React from 'react';
import Link from 'next/link';
import { createHref, navigateTo, isProxiedContext } from '@/utils/navigation';

export default function TestNavigationPage() {
  const handleNavigation = (path: string) => {
    console.log(`🧪 Test navigation vers: ${path}`);
    console.log(`🔍 URL générée: ${createHref(path)}`);
    navigateTo(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Test de Navigation
        </h1>

        {/* Diagnostic */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📊 Diagnostic</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</p>
              <p><strong>Pathname:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
              <p><strong>Contexte proxifié:</strong> {isProxiedContext() ? '✅ Oui (www.dodomove.fr)' : '❌ Non'}</p>
            </div>
            <div>
              <p><strong>URL complète:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>Préfixe utilisé:</strong> {isProxiedContext() ? '/partage' : 'aucun'}</p>
            </div>
          </div>
        </div>

        {/* Test des liens */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🔗 Test des liens (Link Next.js)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={createHref('/')} className="bg-blue-500 text-white p-3 rounded text-center hover:bg-blue-600">
              Page d'accueil
            </Link>
            <Link href={createHref('/annonce/TEST-123')} className="bg-green-500 text-white p-3 rounded text-center hover:bg-green-600">
              Détail annonce
            </Link>
            <Link href={createHref('/funnel/propose/locations')} className="bg-purple-500 text-white p-3 rounded text-center hover:bg-purple-600">
              Funnel Propose
            </Link>
          </div>
        </div>

        {/* Test de navigation programmatique */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">⚡ Test navigation programmatique</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => handleNavigation('/')}
              className="bg-red-500 text-white p-3 rounded hover:bg-red-600"
            >
              navigateTo('/')
            </button>
            <button 
              onClick={() => handleNavigation('/funnel/search/locations')}
              className="bg-orange-500 text-white p-3 rounded hover:bg-orange-600"
            >
              Funnel Search
            </button>
            <button 
              onClick={() => handleNavigation('/modifier/test-token')}
              className="bg-yellow-500 text-white p-3 rounded hover:bg-yellow-600"
            >
              Modifier annonce
            </button>
          </div>
        </div>

        {/* Test des URLs générées */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔍 URLs générées</h2>
          <div className="space-y-2 text-sm font-mono">
            <p><strong>createHref('/'):</strong> {createHref('/')}</p>
            <p><strong>createHref('/annonce/123'):</strong> {createHref('/annonce/123')}</p>
            <p><strong>createHref('/funnel/propose/locations'):</strong> {createHref('/funnel/propose/locations')}</p>
            <p><strong>createHref('/modifier/token'):</strong> {createHref('/modifier/token')}</p>
            <p><strong>createHref('/supprimer/token'):</strong> {createHref('/supprimer/token')}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 