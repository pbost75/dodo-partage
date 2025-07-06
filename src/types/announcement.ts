/**
 * Types TypeScript pour DodoPartage
 * Définition des structures de données pour les annonces et la mise en relation
 */

export type AnnouncementType = 'offer' | 'request';
export type AnnouncementStatus = 'pending' | 'active' | 'expired' | 'deleted';
export type VolumeUnit = 'm3' | 'cartons';

/**
 * Interface principale pour une annonce
 */
export interface Announcement {
  id: string;                     // UUID unique
  type: AnnouncementType;         // Type d'annonce
  
  // Informations de contact
  contactName: string;            // Prénom/pseudo
  contactEmail: string;           // Email (non affiché publiquement)
  
  // Destinations
  departureCountry: string;       // Pays de départ
  arrivalCountry: string;         // Pays d'arrivée
  
  // Détails du transport
  volume: number;                 // Volume en m³ ou nombre de cartons
  volumeUnit: VolumeUnit;         // Unité de mesure
  date: Date;                     // Date de départ/disponibilité
  isFlexibleDate: boolean;        // Date flexible ou fixe
  
  // Description
  objectTypes: string;            // Types d'objets acceptés/recherchés
  description?: string;           // Message complémentaire (optionnel)
  price?: number;                 // Tarif indicatif en euros (optionnel)
  
  // Gestion et sécurité
  status: AnnouncementStatus;     // Statut de l'annonce
  adminToken: string;             // Token pour gestion par propriétaire
  validationToken?: string;       // Token pour validation email (temporaire)
  
  // Métadonnées
  createdAt: Date;                // Date de création
  expiresAt: Date;                // Date d'expiration
  lastContactedAt?: Date;         // Dernière mise en relation
}

/**
 * Données pour créer une nouvelle annonce
 */
export interface CreateAnnouncementData {
  type: AnnouncementType;
  contactName: string;
  contactEmail: string;
  departureCountry: string;
  arrivalCountry: string;
  volume: number;
  volumeUnit: VolumeUnit;
  date: string; // Format ISO string pour le formulaire
  isFlexibleDate: boolean;
  objectTypes: string;
  description?: string;
  price?: number;
}

/**
 * Filtres pour la recherche d'annonces
 */
export interface AnnouncementFilters {
  type?: AnnouncementType;
  departureCountry?: string;
  arrivalCountry?: string;
  minVolume?: number;
  maxVolume?: number;
  volumeUnit?: VolumeUnit;
  dateFrom?: Date;
  dateTo?: Date;
  objectTypes?: string;
  hasPrice?: boolean;
}

/**
 * Contact d'un annonceur
 */
export interface ContactRequest {
  announcementId: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  message: string;
}

/**
 * Log de contact pour traçabilité
 */
export interface ContactLog {
  id: string;
  announcementId: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  message: string;
  contactedAt: Date;
  ipAddress: string;
}

/**
 * Données pour la mise à jour d'une annonce
 */
export interface UpdateAnnouncementData {
  objectTypes?: string;
  description?: string;
  price?: number;
  date?: string;
  isFlexibleDate?: boolean;
  volume?: number;
  volumeUnit?: VolumeUnit;
}

/**
 * Signalement d'annonce
 */
export interface ReportAnnouncement {
  announcementId: string;
  reason: 'inappropriate_content' | 'contact_info' | 'illegal_items' | 'spam' | 'scam' | 'duplicate' | 'other';
  details?: string;
  reporterIp: string;
}

/**
 * Statistiques d'annonce
 */
export interface AnnouncementStats {
  totalViews: number;
  contactsReceived: number;
  lastViewedAt?: Date;
}

/**
 * Réponse API pour la liste des annonces
 */
export interface AnnouncementsResponse {
  success: boolean;
  announcements: Announcement[];
  total: number;
  page?: number;
  limit?: number;
}

/**
 * Réponse API générique
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 