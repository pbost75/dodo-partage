/**
 * Utilitaires pour la gestion des dates et périodes d'expédition
 */

// Mapping des mois en français vers leur numéro
const MONTHS_MAP: Record<string, number> = {
  'Janvier': 0,
  'Février': 1,
  'Mars': 2,
  'Avril': 3,
  'Mai': 4,
  'Juin': 5,
  'Juillet': 6,
  'Août': 7,
  'Septembre': 8,
  'Octobre': 9,
  'Novembre': 10,
  'Décembre': 11
};

// Mapping inverse pour convertir les numéros en noms
const MONTHS_NAMES: string[] = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Convertit une liste de mois sélectionnés en dates de début et fin
 * @param selectedMonths Liste des mois sélectionnés (ex: ['Janvier 2025', 'Février 2025'])
 * @returns Objet avec les dates de début et fin
 */
export function convertSelectedMonthsToDates(selectedMonths: string[]): {
  startDate: string | null;
  endDate: string | null;
  formattedPeriod: string;
} {
  if (!selectedMonths || selectedMonths.length === 0) {
    return {
      startDate: null,
      endDate: null,
      formattedPeriod: 'Période flexible'
    };
  }

  // Parser et trier les mois
  const parsedMonths = selectedMonths
    .map(monthStr => {
      const [monthName, yearStr] = monthStr.split(' ');
      const year = parseInt(yearStr);
      const monthIndex = MONTHS_MAP[monthName];
      
      if (monthIndex === undefined || isNaN(year)) {
        return null;
      }
      
      return {
        year,
        month: monthIndex,
        monthName,
        date: new Date(year, monthIndex, 1)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.date.getTime() - b!.date.getTime());

  if (parsedMonths.length === 0) {
    return {
      startDate: null,
      endDate: null,
      formattedPeriod: 'Période flexible'
    };
  }

  // Premier mois = début de période (1er du mois)
  const firstMonth = parsedMonths[0]!;
  const startDate = new Date(Date.UTC(firstMonth.year, firstMonth.month, 1));

  // Dernier mois = fin de période (dernier jour du mois)
  const lastMonth = parsedMonths[parsedMonths.length - 1]!;
  const endDate = new Date(Date.UTC(lastMonth.year, lastMonth.month + 1, 0)); // 0 = dernier jour du mois précédent

  // Formatage pour l'affichage
  let formattedPeriod = '';
  if (parsedMonths.length === 1) {
    formattedPeriod = `${firstMonth.monthName} ${firstMonth.year}`;
  } else {
    formattedPeriod = `${firstMonth.monthName} ${firstMonth.year} - ${lastMonth.monthName} ${lastMonth.year}`;
  }

  return {
    startDate: startDate.toISOString().split('T')[0], // Format YYYY-MM-DD
    endDate: endDate.toISOString().split('T')[0],
    formattedPeriod
  };
}

/**
 * Convertit des dates de début/fin en liste de mois sélectionnés
 * @param startDate Date de début (format YYYY-MM-DD)
 * @param endDate Date de fin (format YYYY-MM-DD)
 * @returns Liste des mois sélectionnés
 */
export function convertDatesToSelectedMonths(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate) {
    return [];
  }

  const start = new Date(startDate + 'T00:00:00Z'); // Force UTC
  const end = new Date(endDate + 'T00:00:00Z'); // Force UTC
  const selectedMonths: string[] = [];

  let current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const endMonth = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));

  while (current <= endMonth) {
    const monthName = MONTHS_NAMES[current.getUTCMonth()];
    const year = current.getUTCFullYear();
    selectedMonths.push(`${monthName} ${year}`);
    
    // Passer au mois suivant
    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return selectedMonths;
}

/**
 * Convertit une date unique en format pour les annonces "offer"
 * @param shippingDate Date d'expédition
 * @returns Objet avec les dates de début et fin (même jour)
 */
export function convertSingleDateToPeriod(shippingDate: string): {
  startDate: string;
  endDate: string;
  formattedPeriod: string;
} {
  const date = new Date(shippingDate);
  const dateStr = date.toISOString().split('T')[0];
  
  const formattedPeriod = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    startDate: dateStr,
    endDate: dateStr,
    formattedPeriod
  };
} 