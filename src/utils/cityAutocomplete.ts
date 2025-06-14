// Service d'autocomplétion des villes adapté au pays
export interface CitySuggestion {
  name: string;
  country: string;
  region?: string;
  postalCode?: string;
}

// Base de données simplifiée des villes principales par pays
const citiesDatabase: Record<string, CitySuggestion[]> = {
  'France': [
    { name: 'Paris', country: 'France', region: 'Île-de-France', postalCode: '75000' },
    { name: 'Marseille', country: 'France', region: 'Provence-Alpes-Côte d\'Azur', postalCode: '13000' },
    { name: 'Lyon', country: 'France', region: 'Auvergne-Rhône-Alpes', postalCode: '69000' },
    { name: 'Toulouse', country: 'France', region: 'Occitanie', postalCode: '31000' },
    { name: 'Nice', country: 'France', region: 'Provence-Alpes-Côte d\'Azur', postalCode: '06000' },
    { name: 'Nantes', country: 'France', region: 'Pays de la Loire', postalCode: '44000' },
    { name: 'Strasbourg', country: 'France', region: 'Grand Est', postalCode: '67000' },
    { name: 'Montpellier', country: 'France', region: 'Occitanie', postalCode: '34000' },
    { name: 'Bordeaux', country: 'France', region: 'Nouvelle-Aquitaine', postalCode: '33000' },
    { name: 'Lille', country: 'France', region: 'Hauts-de-France', postalCode: '59000' },
    { name: 'Rennes', country: 'France', region: 'Bretagne', postalCode: '35000' },
    { name: 'Reims', country: 'France', region: 'Grand Est', postalCode: '51100' },
    { name: 'Le Havre', country: 'France', region: 'Normandie', postalCode: '76600' },
    { name: 'Saint-Étienne', country: 'France', region: 'Auvergne-Rhône-Alpes', postalCode: '42000' },
    { name: 'Toulon', country: 'France', region: 'Provence-Alpes-Côte d\'Azur', postalCode: '83000' },
    { name: 'Grenoble', country: 'France', region: 'Auvergne-Rhône-Alpes', postalCode: '38000' },
    { name: 'Dijon', country: 'France', region: 'Bourgogne-Franche-Comté', postalCode: '21000' },
    { name: 'Angers', country: 'France', region: 'Pays de la Loire', postalCode: '49000' },
    { name: 'Nîmes', country: 'France', region: 'Occitanie', postalCode: '30000' },
    { name: 'Villeurbanne', country: 'France', region: 'Auvergne-Rhône-Alpes', postalCode: '69100' },
  ],
  'Réunion': [
    { name: 'Saint-Denis', country: 'Réunion', region: 'Nord', postalCode: '97400' },
    { name: 'Saint-Paul', country: 'Réunion', region: 'Ouest', postalCode: '97460' },
    { name: 'Saint-Pierre', country: 'Réunion', region: 'Sud', postalCode: '97410' },
    { name: 'Le Tampon', country: 'Réunion', region: 'Sud', postalCode: '97430' },
    { name: 'Saint-André', country: 'Réunion', region: 'Est', postalCode: '97440' },
    { name: 'Saint-Louis', country: 'Réunion', region: 'Sud', postalCode: '97450' },
    { name: 'Le Port', country: 'Réunion', region: 'Ouest', postalCode: '97420' },
    { name: 'Saint-Leu', country: 'Réunion', region: 'Ouest', postalCode: '97436' },
    { name: 'Sainte-Marie', country: 'Réunion', region: 'Nord', postalCode: '97438' },
    { name: 'Saint-Benoît', country: 'Réunion', region: 'Est', postalCode: '97470' },
  ],
  'Martinique': [
    { name: 'Fort-de-France', country: 'Martinique', region: 'Centre', postalCode: '97200' },
    { name: 'Le Lamentin', country: 'Martinique', region: 'Centre', postalCode: '97232' },
    { name: 'Le Robert', country: 'Martinique', region: 'Nord Atlantique', postalCode: '97231' },
    { name: 'Schoelcher', country: 'Martinique', region: 'Centre', postalCode: '97233' },
    { name: 'Sainte-Marie', country: 'Martinique', region: 'Nord Atlantique', postalCode: '97230' },
    { name: 'Le François', country: 'Martinique', region: 'Nord Atlantique', postalCode: '97240' },
    { name: 'Ducos', country: 'Martinique', region: 'Sud', postalCode: '97224' },
    { name: 'Rivière-Pilote', country: 'Martinique', region: 'Sud', postalCode: '97211' },
    { name: 'Saint-Joseph', country: 'Martinique', region: 'Sud', postalCode: '97212' },
    { name: 'Trinité', country: 'Martinique', region: 'Nord Atlantique', postalCode: '97220' },
  ],
  'Guadeloupe': [
    { name: 'Pointe-à-Pitre', country: 'Guadeloupe', region: 'Grande-Terre', postalCode: '97110' },
    { name: 'Les Abymes', country: 'Guadeloupe', region: 'Grande-Terre', postalCode: '97139' },
    { name: 'Baie-Mahault', country: 'Guadeloupe', region: 'Basse-Terre', postalCode: '97122' },
    { name: 'Le Gosier', country: 'Guadeloupe', region: 'Grande-Terre', postalCode: '97190' },
    { name: 'Petit-Bourg', country: 'Guadeloupe', region: 'Basse-Terre', postalCode: '97170' },
    { name: 'Sainte-Anne', country: 'Guadeloupe', region: 'Grande-Terre', postalCode: '97180' },
    { name: 'Basse-Terre', country: 'Guadeloupe', region: 'Basse-Terre', postalCode: '97100' },
    { name: 'Morne-à-l\'Eau', country: 'Guadeloupe', region: 'Grande-Terre', postalCode: '97111' },
    { name: 'Capesterre-Belle-Eau', country: 'Guadeloupe', region: 'Basse-Terre', postalCode: '97130' },
    { name: 'Lamentin', country: 'Guadeloupe', region: 'Basse-Terre', postalCode: '97129' },
  ],
  'Guyane': [
    { name: 'Cayenne', country: 'Guyane', region: 'Centre-Littoral', postalCode: '97300' },
    { name: 'Saint-Laurent-du-Maroni', country: 'Guyane', region: 'Ouest', postalCode: '97320' },
    { name: 'Kourou', country: 'Guyane', region: 'Centre-Littoral', postalCode: '97310' },
    { name: 'Matoury', country: 'Guyane', region: 'Centre-Littoral', postalCode: '97351' },
    { name: 'Rémire-Montjoly', country: 'Guyane', region: 'Centre-Littoral', postalCode: '97354' },
    { name: 'Mana', country: 'Guyane', region: 'Ouest', postalCode: '97318' },
    { name: 'Macouria', country: 'Guyane', region: 'Centre-Littoral', postalCode: '97355' },
    { name: 'Sinnamary', country: 'Guyane', region: 'Centre-Littoral', postalCode: '97315' },
    { name: 'Iracoubo', country: 'Guyane', region: 'Centre-Littoral', postalCode: '97350' },
    { name: 'Saint-Georges', country: 'Guyane', region: 'Est', postalCode: '97313' },
  ],
  'Mayotte': [
    { name: 'Mamoudzou', country: 'Mayotte', region: 'Grande-Terre', postalCode: '97600' },
    { name: 'Koungou', country: 'Mayotte', region: 'Grande-Terre', postalCode: '97600' },
    { name: 'Dzaoudzi', country: 'Mayotte', region: 'Petite-Terre', postalCode: '97615' },
    { name: 'Dembéni', country: 'Mayotte', region: 'Grande-Terre', postalCode: '97600' },
    { name: 'Tsingoni', country: 'Mayotte', region: 'Grande-Terre', postalCode: '97600' },
    { name: 'Sada', country: 'Mayotte', region: 'Grande-Terre', postalCode: '97640' },
    { name: 'Pamandzi', country: 'Mayotte', region: 'Petite-Terre', postalCode: '97615' },
    { name: 'Chiconi', country: 'Mayotte', region: 'Grande-Terre', postalCode: '97670' },
    { name: 'Bandrélé', country: 'Mayotte', region: 'Grande-Terre', postalCode: '97660' },
    { name: 'Bouéni', country: 'Mayotte', region: 'Grande-Terre', postalCode: '97620' },
  ],
  'Nouvelle-Calédonie': [
    { name: 'Nouméa', country: 'Nouvelle-Calédonie', region: 'Province Sud', postalCode: '98800' },
    { name: 'Mont-Dore', country: 'Nouvelle-Calédonie', region: 'Province Sud', postalCode: '98809' },
    { name: 'Dumbéa', country: 'Nouvelle-Calédonie', region: 'Province Sud', postalCode: '98835' },
    { name: 'Païta', country: 'Nouvelle-Calédonie', region: 'Province Sud', postalCode: '98890' },
    { name: 'Koné', country: 'Nouvelle-Calédonie', region: 'Province Nord', postalCode: '98860' },
    { name: 'Poindimié', country: 'Nouvelle-Calédonie', region: 'Province Nord', postalCode: '98822' },
    { name: 'Voh', country: 'Nouvelle-Calédonie', region: 'Province Nord', postalCode: '98833' },
    { name: 'Thio', country: 'Nouvelle-Calédonie', region: 'Province Sud', postalCode: '98829' },
    { name: 'Bourail', country: 'Nouvelle-Calédonie', region: 'Province Sud', postalCode: '98870' },
    { name: 'La Foa', country: 'Nouvelle-Calédonie', region: 'Province Sud', postalCode: '98880' },
  ],
  'Polynésie française': [
    { name: 'Papeete', country: 'Polynésie française', region: 'Îles du Vent', postalCode: '98714' },
    { name: 'Faaa', country: 'Polynésie française', region: 'Îles du Vent', postalCode: '98704' },
    { name: 'Punaauia', country: 'Polynésie française', region: 'Îles du Vent', postalCode: '98717' },
    { name: 'Pirae', country: 'Polynésie française', region: 'Îles du Vent', postalCode: '98716' },
    { name: 'Arue', country: 'Polynésie française', region: 'Îles du Vent', postalCode: '98701' },
    { name: 'Papao', country: 'Polynésie française', region: 'Îles du Vent', postalCode: '98711' },
    { name: 'Moorea-Maiao', country: 'Polynésie française', region: 'Îles du Vent', postalCode: '98728' },
    { name: 'Mahina', country: 'Polynésie française', region: 'Îles du Vent', postalCode: '98709' },
    { name: 'Paea', country: 'Polynésie française', region: 'Îles du Vent', postalCode: '98711' },
    { name: 'Taiarapu-Est', country: 'Polynésie française', region: 'Îles du Vent', postalCode: '98719' },
  ],
  'Maurice': [
    { name: 'Port-Louis', country: 'Maurice', region: 'Port-Louis', postalCode: '11328' },
    { name: 'Beau-Bassin Rose-Hill', country: 'Maurice', region: 'Plaines Wilhems', postalCode: '71259' },
    { name: 'Vacoas-Phoenix', country: 'Maurice', region: 'Plaines Wilhems', postalCode: '73468' },
    { name: 'Curepipe', country: 'Maurice', region: 'Plaines Wilhems', postalCode: '74213' },
    { name: 'Quatre Bornes', country: 'Maurice', region: 'Plaines Wilhems', postalCode: '72201' },
    { name: 'Triolet', country: 'Maurice', region: 'Pamplemousses', postalCode: '21504' },
    { name: 'Goodlands', country: 'Maurice', region: 'Rivière du Rempart', postalCode: '30701' },
    { name: 'Centre de Flacq', country: 'Maurice', region: 'Flacq', postalCode: '40101' },
    { name: 'Mahebourg', country: 'Maurice', region: 'Grand Port', postalCode: '50801' },
    { name: 'Saint Pierre', country: 'Maurice', region: 'Moka', postalCode: '81801' },
  ],
};

// Fonction de recherche d'autocomplétion pour les villes
export const getCitySuggestions = async (
  query: string, 
  country: string = 'France'
): Promise<CitySuggestion[]> => {
  // Simulation d'une petite latence pour l'API
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const cities = citiesDatabase[country] || [];
  
  if (query.length < 2) {
    return [];
  }
  
  // Recherche insensible à la casse avec normalisation des accents
  const normalizeString = (str: string) => 
    str.toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '');
  
  const normalizedQuery = normalizeString(query);
  
  return cities
    .filter(city => 
      normalizeString(city.name).includes(normalizedQuery)
    )
    .sort((a, b) => {
      // Prioriser les correspondances qui commencent par la requête
      const aStartsWith = normalizeString(a.name).startsWith(normalizedQuery);
      const bStartsWith = normalizeString(b.name).startsWith(normalizedQuery);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Puis par ordre alphabétique
      return a.name.localeCompare(b.name);
    })
    .slice(0, 8); // Limiter à 8 résultats
};

// Fonction de recherche d'autocomplétion pour les codes postaux
export const getPostalCodeSuggestions = async (
  query: string, 
  country: string = 'France'
): Promise<CitySuggestion[]> => {
  // Simulation d'une petite latence pour l'API
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const cities = citiesDatabase[country] || [];
  
  if (query.length < 2) {
    return [];
  }
  
  return cities
    .filter(city => 
      city.postalCode && city.postalCode.includes(query)
    )
    .sort((a, b) => {
      // Prioriser les correspondances qui commencent par la requête
      const aStartsWith = a.postalCode?.startsWith(query);
      const bStartsWith = b.postalCode?.startsWith(query);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Puis par ordre alphabétique du nom de ville
      return a.name.localeCompare(b.name);
    })
    .slice(0, 8); // Limiter à 8 résultats
};

// Fonction pour trouver une ville par code postal exact
export const getCityByPostalCode = (postalCode: string, country: string = 'France'): CitySuggestion | null => {
  const cities = citiesDatabase[country] || [];
  return cities.find(city => city.postalCode === postalCode) || null;
};

// Fonction pour trouver le code postal d'une ville
export const getPostalCodeByCity = (cityName: string, country: string = 'France'): string | null => {
  const cities = citiesDatabase[country] || [];
  const city = cities.find(city => city.name.toLowerCase() === cityName.toLowerCase());
  return city?.postalCode || null;
}; 