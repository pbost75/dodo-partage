'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ModifyAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<any>(null);

  useEffect(() => {
    const loadAnnouncementForEdit = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Appeler l'API backend pour récupérer les données de l'annonce
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
        const response = await fetch(`${backendUrl}/api/partage/edit-form/${params.token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Token de modification invalide ou expiré');
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
      loadAnnouncementForEdit();
    }
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Edit className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Modifier l'annonce</h1>
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
            <Edit className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Modifier l'annonce</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Impossible de modifier l'annonce
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
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Modifier l'annonce {announcement.reference}
            </h1>
            
            {/* Aperçu des données actuelles */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Données actuelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Contact:</span> {announcement.contact.firstName} ({announcement.contact.email})
                </div>
                <div>
                  <span className="font-medium text-gray-700">Téléphone:</span> {announcement.contact.phone || 'Non renseigné'}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Départ:</span> {announcement.departure.city}, {announcement.departure.country}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Arrivée:</span> {announcement.arrival.city}, {announcement.arrival.country}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date transport:</span> {announcement.shippingDate}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Volume:</span> {announcement.container.availableVolume}m³ ({announcement.container.type}ft)
                </div>
              </div>
              <div className="mt-4">
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-gray-600 mt-1">{announcement.announcementText}</p>
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                onClick={() => {
                  // Rediriger vers un formulaire de modification
                  // Pour l'instant, on affiche un message
                  alert('Le formulaire de modification sera intégré prochainement. Toutes les données sont déjà disponibles côté backend !');
                }}
                className="flex-1"
              >
                ✏️ Modifier les informations
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push(`/annonce/${announcement.reference}`)}
                className="flex-1"
              >
                👁️ Voir l'annonce
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> Le système de modification est opérationnel côté backend. 
                L'interface de formulaire sera intégrée prochainement.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 