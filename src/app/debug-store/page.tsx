'use client';

import React, { useEffect, useState } from 'react';
import { useProposeStore } from '@/store/proposeStore';
import { useSearchStore } from '@/store/searchStore';

export default function DebugStorePage() {
  const proposeStore = useProposeStore();
  const searchStore = useSearchStore();
  const [localStorage, setLocalStorage] = useState<any>(null);

  useEffect(() => {
    // Récupérer le localStorage côté client
    if (typeof window !== 'undefined') {
      const proposeData = window.localStorage.getItem('propose-funnel-storage');
      const searchData = window.localStorage.getItem('search-funnel-storage');
      
      setLocalStorage({
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        proposeStorage: proposeData ? JSON.parse(proposeData) : null,
        searchStorage: searchData ? JSON.parse(searchData) : null
      });
    }
  }, []);

  const clearProposeStore = () => {
    proposeStore.reset();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('propose-funnel-storage');
    }
    window.location.reload();
  };

  const clearSearchStore = () => {
    searchStore.reset();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('search-funnel-storage');
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🐛 Debug Store Zustand</h1>
        
        {/* Informations contexte */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🌐 Contexte</h2>
          {localStorage && (
            <div className="space-y-2 text-sm">
              <p><strong>Hostname:</strong> {localStorage.hostname}</p>
              <p><strong>Pathname:</strong> {localStorage.pathname}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
          )}
        </div>

        {/* Store Propose */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📦 Store Propose</h2>
            <button 
              onClick={clearProposeStore}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Reset Store
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Current Step:</h3>
              <p className="text-gray-700">{proposeStore.formData.currentStep}</p>
            </div>
            
            <div>
              <h3 className="font-medium">Departure:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(proposeStore.formData.departure, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium">Arrival:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(proposeStore.formData.arrival, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-medium">Container:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(proposeStore.formData.container, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-medium">LocalStorage Propose:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {localStorage ? JSON.stringify(localStorage.proposeStorage, null, 2) : 'Loading...'}
              </pre>
            </div>
          </div>
        </div>

        {/* Store Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🔍 Store Search</h2>
            <button 
              onClick={clearSearchStore}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Reset Store
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Current Step:</h3>
              <p className="text-gray-700">{searchStore.formData.currentStep}</p>
            </div>

            <div>
              <h3 className="font-medium">LocalStorage Search:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {localStorage ? JSON.stringify(localStorage.searchStorage, null, 2) : 'Loading...'}
              </pre>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🛠️ Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <button 
              onClick={() => window.location.href = '/funnel/propose/locations'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Aller au Funnel Propose
            </button>
            <button 
              onClick={() => window.location.href = '/funnel/search/locations'}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Aller au Funnel Search
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Retour Accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 