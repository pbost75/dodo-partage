'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DeleteAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<any>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        setLoading(true);
        
        // TODO: Appeler l'API backend pour valider le token de suppression
        // et récupérer les données de l'annonce
        
        // Simulation pour l'instant
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simuler une erreur de token invalide pour l'instant
        throw new Error('Fonctionnalité de suppression en cours de développement');
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Token invalide';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      validateToken();
    }
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Trash2 className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Supprimer l'annonce</h1>
            </div>
          </div>
        </div>

        {/* Loading */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#243163] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <Trash2 className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Supprimer l'annonce</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Fonctionnalité en développement
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'La suppression d\'annonces sera bientôt disponible.'}
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => router.push('/')}
            >
              Retour aux annonces
            </Button>
            <p className="text-sm text-gray-500">
              En attendant, veuillez nous contacter si vous souhaitez supprimer votre annonce.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 