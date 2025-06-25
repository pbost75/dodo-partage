'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import MonthPicker from '@/components/ui/MonthPicker';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import VolumeSelector from '@/components/ui/VolumeSelector';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// Interfaces pour les différents types d'annonces
interface BaseAnnouncementData {
  id: string;
  reference: string;
  contact: {
    firstName: string;
    lastName: string;
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
  announcementText: string;
  requestType: 'search' | 'offer';
}

interface SearchAnnouncementData extends BaseAnnouncementData {
  requestType: 'search';
  shippingPeriod: string; // String simple depuis le backend
  container: {
    volumeNeeded: number; // Volume recherché
  };
  acceptsCostSharing: boolean; // Participation aux frais
  offerType: 'paid' | 'free';
}

interface OfferAnnouncementData extends BaseAnnouncementData {
  requestType: 'offer';
  shippingDate: string; // Pour les offres : date précise
  container: {
    type: string;
    availableVolume: number;
    minimumVolume: number;
  };
  offerType: 'free' | 'paid';
}

type AnnouncementData = SearchAnnouncementData | OfferAnnouncementData;

interface FormData {
  // Données communes
  announcementText: string;
  
  // Pour les demandes de place (search)
  shippingPeriod: string[];
  volumeNeeded: number;
  acceptsCostSharing: boolean;
  
  // Pour les offres de place (offer)
  shippingDate: string;
  containerType: string;
  availableVolume: number;
  minimumVolume: number;
  offerType: 'free' | 'paid';
}

// Composant LoadingSpinner simple
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Chargement...</span>
  </div>
);

// Composant CardContent simple
const CardContent = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export default function ModifierAnnoncePage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    announcementText: '',
    shippingPeriod: [],
    volumeNeeded: 0,
    acceptsCostSharing: false,
    shippingDate: '',
    containerType: 'pieds',
    availableVolume: 0,
    minimumVolume: 0,
    offerType: 'free'
  });

  // Fonction pour convertir string en array pour MonthPicker
  const formatShippingPeriodArray = (periodString: string): string[] => {
    if (!periodString || periodString === 'Flexible') return [];
    
    // Si c'est une période formatée "Mois Année - Mois Année"
    if (periodString.includes(' - ')) {
      const [start, end] = periodString.split(' - ');
      return [start.trim(), end.trim()];
    }
    
    // Si c'est un seul mois
    return [periodString.trim()];
  };

  // Chargement des données de l'annonce
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(`https://web-production-7b738.up.railway.app/api/partage/edit-form/${token}`);
        const result = await response.json();
        
        if (result.success) {
          setAnnouncement(result.data);
          
          // Initialiser le formulaire selon le type d'annonce
          if (result.data.requestType === 'search') {
            const searchData = result.data as SearchAnnouncementData;
            setFormData({
              announcementText: searchData.announcementText || '',
              shippingPeriod: formatShippingPeriodArray(searchData.shippingPeriod || ''),
              volumeNeeded: searchData.container.volumeNeeded || 0,
              acceptsCostSharing: searchData.acceptsCostSharing || false,
              shippingDate: '',
              containerType: 'pieds',
              availableVolume: 0,
              minimumVolume: 0,
              offerType: searchData.offerType || 'free'
            });
          } else {
            const offerData = result.data as OfferAnnouncementData;
            setFormData({
              announcementText: offerData.announcementText || '',
              shippingPeriod: [],
              volumeNeeded: 0,
              acceptsCostSharing: false,
              shippingDate: offerData.shippingDate || '',
              containerType: offerData.container.type || 'pieds',
              availableVolume: offerData.container.availableVolume || 0,
              minimumVolume: offerData.container.minimumVolume || 0,
              offerType: offerData.offerType || 'free'
            });
          }
        } else {
          error('Erreur lors du chargement de l\'annonce');
          router.push('/');
        }
      } catch (err) {
        console.error('Erreur:', err);
        error('Erreur technique lors du chargement');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnnouncement();
    }
  }, [token, router, error]);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Préparer les données selon le type d'annonce
      let updateData: any = {
        token,
        announcementText: formData.announcementText,
        requestType: announcement?.requestType
      };

      if (announcement?.requestType === 'search') {
        updateData = {
          ...updateData,
          shippingPeriod: formData.shippingPeriod.join(', ') || 'Flexible',
          volumeNeeded: formData.volumeNeeded,
          acceptsCostSharing: formData.acceptsCostSharing
        };
      } else {
        updateData = {
          ...updateData,
          shippingDate: formData.shippingDate,
          containerType: formData.containerType,
          availableVolume: formData.availableVolume,
          minimumVolume: formData.minimumVolume,
          offerType: formData.offerType
        };
      }

      const response = await fetch('https://web-production-7b738.up.railway.app/api/partage/update-announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (result.success) {
        success('Annonce mise à jour avec succès !');
        // Rediriger vers la page d'accueil ou vers la liste des annonces
        router.push('/');
      } else {
        error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error('Erreur:', err);
      error('Erreur technique lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Annonce non trouvée</p>
        </div>
      </div>
    );
  }

  const isSearchRequest = announcement.requestType === 'search';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux annonces
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            ✏️ Modifier l'annonce {announcement.reference}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations de l'annonce (non modifiables) */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📍 Informations de l'annonce
                </h2>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Référence:</span>
                    <p className="text-gray-900">{announcement.reference}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Contact:</span>
                    <p className="text-gray-900">{announcement.contact.firstName} {announcement.contact.lastName}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900">{announcement.contact.email}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Trajet:</span>
                    <p className="text-gray-900">
                      {announcement.departure.displayName} → {announcement.arrival.displayName}
                    </p>
                  </div>
                  
                  {/* Affichage conditionnel selon le type */}
                  {isSearchRequest ? (
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <p className="text-blue-600">🔍 Cherche de la place</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-medium text-gray-600">Conteneur:</span>
                        <p className="text-gray-900">{(announcement as OfferAnnouncementData).container.type}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Type:</span>
                        <p className="text-green-600">📦 Propose de la place</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations modifiables */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  Informations modifiables
                </h2>
                
                <div className="space-y-6">
                  {/* Date ou Période selon le type */}
                  {isSearchRequest ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Période d'expédition souhaitée
                      </label>
                      <MonthPicker
                        selectedMonths={formData.shippingPeriod}
                        onMonthsChange={(months) => setFormData(prev => ({ ...prev, shippingPeriod: months }))}
                        placeholder="Période flexible"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Date de transport souhaitée
                      </label>
                      <CustomDatePicker
                        label="Date de transport"
                        value={formData.shippingDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}

                  {/* Volume selon le type */}
                  {isSearchRequest ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📦 Volume recherché (m³)
                      </label>
                      <VolumeSelector
                        label="Volume recherché"
                        value={formData.volumeNeeded}
                        onChange={(value: number) => setFormData({...formData, volumeNeeded: value})}
                        min={0.5}
                        max={50}
                        step={0.5}
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📦 Volume disponible (m³)
                        </label>
                        <VolumeSelector
                          label="Volume disponible"
                          value={formData.availableVolume}
                          onChange={(value) => setFormData(prev => ({ ...prev, availableVolume: value }))}
                          min={0.5}
                          max={50}
                          step={0.5}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📦 Volume minimum (m³)
                        </label>
                        <VolumeSelector
                          label="Volume minimum"
                          value={formData.minimumVolume}
                          onChange={(value) => setFormData(prev => ({ ...prev, minimumVolume: value }))}
                          min={0}
                          max={5}
                          step={1}
                        />
                      </div>
                    </>
                  )}

                  {/* Participation aux frais */}
                  {isSearchRequest ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        💰 Participation aux frais
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="acceptsCostSharing"
                            checked={formData.acceptsCostSharing === true}
                            onChange={() => setFormData(prev => ({ ...prev, acceptsCostSharing: true }))}
                            className="mr-2"
                          />
                          <span>Oui - J'accepte de participer aux frais</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="acceptsCostSharing"
                            checked={formData.acceptsCostSharing === false}
                            onChange={() => setFormData(prev => ({ ...prev, acceptsCostSharing: false }))}
                            className="mr-2"
                          />
                          <span>Non - Je cherche un transport gratuit</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        💰 Type d'offre
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="offerType"
                            value="free"
                            checked={formData.offerType === 'free'}
                            onChange={(e) => setFormData(prev => ({ ...prev, offerType: e.target.value as 'free' | 'paid' }))}
                            className="mr-2"
                          />
                          <span>Gratuit</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="offerType"
                            value="paid"
                            checked={formData.offerType === 'paid'}
                            onChange={(e) => setFormData(prev => ({ ...prev, offerType: e.target.value as 'free' | 'paid' }))}
                            className="mr-2"
                          />
                          <span>Participation aux frais demandée</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📝 Description de votre {isSearchRequest ? 'demande' : 'offre'}
                    </label>
                    <Textarea
                      value={formData.announcementText}
                      onChange={(e) => setFormData(prev => ({ ...prev, announcementText: e.target.value }))}
                      placeholder={`Décrivez votre ${isSearchRequest ? 'demande' : 'offre'}...`}
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.announcementText.length}/500 caractères
                    </p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    variant="primary"
                    className="flex-1 bg-[#F47D6C] hover:bg-[#e66b5a]"
                  >
                    {saving ? '💾 Sauvegarde...' : '💾 Mettre à jour l\'annonce'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}