/**
 * Liste des destinations supportées par DodoPartage
 * Basée sur l'écosystème Dodomove existant
 */

export interface Country {
  value: string;
  label: string;
  type: 'mainland' | 'dom-tom' | 'international';
}

export const COUNTRIES: Country[] = [
  // France métropolitaine
  {
    value: 'france',
    label: 'France métropolitaine',
    type: 'mainland'
  },
  
  // DOM-TOM
  {
    value: 'reunion',
    label: 'Réunion',
    type: 'dom-tom'
  },
  {
    value: 'martinique',
    label: 'Martinique',
    type: 'dom-tom'
  },
  {
    value: 'guadeloupe',
    label: 'Guadeloupe',
    type: 'dom-tom'
  },
  {
    value: 'guyane',
    label: 'Guyane française',
    type: 'dom-tom'
  },
  {
    value: 'mayotte',
    label: 'Mayotte',
    type: 'dom-tom'
  },
  {
    value: 'nouvelle-caledonie',
    label: 'Nouvelle-Calédonie',
    type: 'dom-tom'
  },
  {
    value: 'polynesie',
    label: 'Polynésie française',
    type: 'dom-tom'
  },
  
  // International
  {
    value: 'maurice',
    label: 'Maurice',
    type: 'international'
  }
];

/**
 * Options formatées pour les composants Select
 */
export const COUNTRY_OPTIONS = COUNTRIES.map(country => ({
  value: country.value,
  label: country.label
}));

/**
 * Groupes de pays par type
 */
export const COUNTRY_GROUPS = {
  mainland: COUNTRIES.filter(c => c.type === 'mainland'),
  domTom: COUNTRIES.filter(c => c.type === 'dom-tom'),
  international: COUNTRIES.filter(c => c.type === 'international')
};

/**
 * Récupérer un pays par sa valeur
 */
export const getCountryByValue = (value: string): Country | undefined => {
  return COUNTRIES.find(country => country.value === value);
};

/**
 * Vérifier si une destination est un DOM-TOM
 */
export const isDomTom = (countryValue: string): boolean => {
  const country = getCountryByValue(countryValue);
  return country?.type === 'dom-tom' || false;
};

/**
 * Vérifier si une route est métropole ↔ DOM-TOM
 */
export const isMainlandToDomTom = (departure: string, arrival: string): boolean => {
  const dep = getCountryByValue(departure);
  const arr = getCountryByValue(arrival);
  
  if (!dep || !arr) return false;
  
  return (dep.type === 'mainland' && arr.type === 'dom-tom') ||
         (dep.type === 'dom-tom' && arr.type === 'mainland');
};

/**
 * Vérifier si une route est DOM-TOM ↔ DOM-TOM
 */
export const isDomTomToDomTom = (departure: string, arrival: string): boolean => {
  const dep = getCountryByValue(departure);
  const arr = getCountryByValue(arrival);
  
  if (!dep || !arr) return false;
  
  return dep.type === 'dom-tom' && arr.type === 'dom-tom';
}; 