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
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadAnnouncementForDelete = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Appeler l'API backend pour récupérer les données de l'annonce
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
        const response = await fetch(`${backendUrl}/api/partage/delete-form/${params.token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Token de suppression invalide, expiré, ou cette annonce a été créée avant l\'implémentation des fonctionnalités de gestion. Veuillez contacter support@dodomove.fr pour supprimer votre annonce.');
          } else {
            throw new Error('Erreur lors du chargement de l\'annonce');
          }
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Annonce non trouvée');
        }
        
        setAnnouncement(result.data);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Token invalide';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      loadAnnouncementForDelete();
    }
  }, [params.token]);

  const handleDelete = async () => {
    if (!selectedReason) {
      alert('Veuillez sélectionner une raison');
      return;
    }

    try {
      setIsDeleting(true);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
      const response = await fetch(`${backendUrl}/api/partage/confirm-deletion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deleteToken: params.token,
          reason: selectedReason
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      // Redirection vers page de succès
      router.push('/?deleted=true');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de suppression';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

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
        {error ? (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Impossible de supprimer l'annonce
            </h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/')}
            >
              Retour aux annonces
            </Button>
          </div>
        ) : announcement ? (
          <div className="bg-white rounded-xl border border-red-200 p-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Supprimer l'annonce {announcement.reference}
            </h1>
            
            {/* Aperçu de l'annonce */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Annonce à supprimer
              </h2>
              <div className="text-sm text-gray-600">
                <p><strong>Référence:</strong> {announcement.reference}</p>
                <p><strong>Trajet:</strong> {announcement.departure} → {announcement.arrival}</p>
                <p><strong>Contact:</strong> {announcement.contact_name}</p>
              </div>
            </div>
            
            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Attention : Action irréversible
                  </h3>
                  <p className="text-red-700 text-sm">
                    Une fois supprimée, votre annonce ne sera plus visible sur la plateforme 
                    et ne pourra pas être récupérée.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Raison de suppression */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pourquoi souhaitez-vous supprimer cette annonce ?
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="found_solution"
                    checked={selectedReason === 'found_solution'}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mr-3"
                  />
                  <span>J'ai trouvé une solution / Mes affaires sont transportées</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="plans_changed"
                    checked={selectedReason === 'plans_changed'}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mr-3"
                  />
                  <span>Mes plans ont changé / Je n'ai plus besoin de transport</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="other"
                    checked={selectedReason === 'other'}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mr-3"
                  />
                  <span>Autre raison</span>
                </label>
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/')}
                className="flex-1"
                disabled={isDeleting}
              >
                🔙 Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={!selectedReason || isDeleting}
              >
                {isDeleting ? 'Suppression...' : '🗑️ Supprimer définitivement'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 