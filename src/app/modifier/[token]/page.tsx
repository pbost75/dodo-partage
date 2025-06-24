'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Save, AlertTriangle, Calendar, Volume2, FileText, DollarSign } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

interface AnnouncementData {
  reference: string;
  contact: {
    firstName: string;
    email: string;
    phone: string;
  };
  departure: {
    country: string;
    city: string;
    postalCode: string;
    displayName: string;
  };
  arrival: {
    country: string;
    city: string;
    postalCode: string;
    displayName: string;
  };
  shippingDate: string;
  container: {
    type: '20' | '40';
    availableVolume: number;
    minimumVolume: number;
  };
  offerType: 'free' | 'paid';
  announcementText: string;
  status: string;
  createdAt: string;
}

export default function ModifierAnnoncePage() {
  const params = useParams();
  const router = useRouter();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const token = params.token as string;
  
  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Données du formulaire
  const [formData, setFormData] = useState({
    shippingDate: '',
    availableVolume: 0,
    minimumVolume: 0,
    offerType: 'free' as 'free' | 'paid',
    announcementText: ''
  });

  // Charger les données de l'annonce
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const backendUrl = 'https://web-production-7b738.up.railway.app';
        const response = await fetch(`${backendUrl}/api/partage/edit-form/${token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Token de modification invalide ou expiré. Cette annonce n\'existe peut-être plus.');
          } else {
            throw new Error('Erreur lors du chargement de l\'annonce');
          }
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Format de réponse invalide');
        }
        
        const announcementData = result.data;
        setAnnouncement(announcementData);
        
        // Initialiser les données du formulaire
        const initialFormData = {
          shippingDate: announcementData.shippingDate || '',
          availableVolume: announcementData.container?.availableVolume || 0,
          minimumVolume: announcementData.container?.minimumVolume || 0,
          offerType: announcementData.offerType || 'free',
          announcementText: announcementData.announcementText || ''
        };
        
        setFormData(initialFormData);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [token]);

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!announcement) return;
    
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/update-announcement/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announcement,
          shippingDate: formData.shippingDate,
          container: {
            ...announcement.container,
            availableVolume: formData.availableVolume,
            minimumVolume: formData.minimumVolume
          },
          offerType: formData.offerType,
          announcementText: formData.announcementText,
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        showSuccessToast('✅ Modifications sauvegardées avec succès !');
        // Redirection vers la page d'accueil après succès
        setTimeout(() => {
          router.push('/?updated=true');
        }, 1500);
      } else {
        throw new Error('Erreur de sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showErrorToast('❌ Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#243163] to-[#1e2951] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Edit3 className="w-6 h-6" />
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

  // Error state
  if (error) {
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
              <Edit3 className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Modifier l'annonce</h1>
            </div>
          </div>
        </div>

        {/* Error */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
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
        </div>
      </div>
    );
  }

  // Main render
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
            <Edit3 className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Modifier l'annonce {announcement?.reference}</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          
          {/* Informations non modifiables */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📍</span> Informations de l'annonce
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><strong>Référence:</strong> {announcement?.reference}</p>
                <p><strong>Contact:</strong> {announcement?.contact?.firstName}</p>
                <p><strong>Email:</strong> {announcement?.contact?.email}</p>
              </div>
              <div>
                <p><strong>Trajet:</strong> {announcement?.departure?.displayName} → {announcement?.arrival?.displayName}</p>
                <p><strong>Conteneur:</strong> {announcement?.container?.type} pieds</p>
              </div>
            </div>
          </div>

          {/* Formulaire de modification */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informations modifiables
            </h2>

            {/* Date de transport */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Calendar className="w-4 h-4" />
                Date de transport souhaitée
              </label>
              <input
                type="date"
                value={formData.shippingDate}
                onChange={(e) => setFormData(prev => ({ ...prev, shippingDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243163] focus:border-transparent text-lg"
              />
            </div>

            {/* Volumes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Volume2 className="w-4 h-4" />
                  Volume disponible (m³)
                </label>
                <input
                  type="number"
                  value={formData.availableVolume}
                  onChange={(e) => setFormData(prev => ({ ...prev, availableVolume: Number(e.target.value) }))}
                  min="0.5"
                  max={announcement?.container?.type === '20' ? '25' : '50'}
                  step="0.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243163] focus:border-transparent text-lg"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Volume2 className="w-4 h-4" />
                  Volume minimum accepté (m³)
                </label>
                <input
                  type="number"
                  value={formData.minimumVolume}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumVolume: Number(e.target.value) }))}
                  min="0.1"
                  max={formData.availableVolume}
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243163] focus:border-transparent text-lg"
                />
              </div>
            </div>

            {/* Type d'offre */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <DollarSign className="w-4 h-4" />
                Type d'offre
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="offerType"
                    value="free"
                    checked={formData.offerType === 'free'}
                    onChange={(e) => setFormData(prev => ({ ...prev, offerType: e.target.value as 'free' | 'paid' }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Gratuit</div>
                    <div className="text-sm text-gray-500">Partage solidaire</div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="offerType"
                    value="paid"
                    checked={formData.offerType === 'paid'}
                    onChange={(e) => setFormData(prev => ({ ...prev, offerType: e.target.value as 'free' | 'paid' }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Participation</div>
                    <div className="text-sm text-gray-500">Avec participation aux frais</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <FileText className="w-4 h-4" />
                Description de votre offre
              </label>
              <textarea
                value={formData.announcementText}
                onChange={(e) => setFormData(prev => ({ ...prev, announcementText: e.target.value }))}
                placeholder="Décrivez votre offre de partage..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243163] focus:border-transparent resize-none text-lg"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.announcementText.length}/1000 caractères
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => router.push('/')}
              className="flex-1"
              disabled={isSaving}
            >
              🔙 Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex-1 bg-[#243163] hover:bg-[#1e2951]"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sauvegarde...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Sauvegarder les modifications
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}