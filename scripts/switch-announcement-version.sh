#!/bin/bash

# Script pour tester différentes versions de l'étape "Rédaction d'annonce"
# Usage: ./scripts/switch-announcement-version.sh [1|2|original] [type]

VERSION=${1:-"help"}
TYPE=${2:-"both"}  # "propose", "search", ou "both"

PROPOSE_FILE="src/app/funnel/propose/announcement-text/page.tsx"
SEARCH_FILE="src/app/funnel/search/announcement-text/page.tsx"
BACKUP_DIR_PROPOSE="src/app/funnel/propose/announcement-text"
BACKUP_DIR_SEARCH="src/app/funnel/search/announcement-text"

activate_version() {
  local version=$1
  local target_type=$2
  
  echo "🔄 Activation VERSION $version pour type: $target_type"
  echo ""
  
  case $version in
    "1")
      echo "✅ VERSION 1 : Champ vide + encouragements + Français corrigé"
      echo ""
      echo "Caractéristiques :"
      echo "- Champ vide au départ"
      echo "- Placeholder intelligent avec conseils"
      echo "- Messages encourageants"
      echo "- Français corrigé (de France → la Réunion)"
      echo "- Option 'exemple' sur demande"
      
      if [[ "$target_type" == "propose" || "$target_type" == "both" ]]; then
        echo "✅ Funnel PROPOSE déjà à jour"
      fi
      
      if [[ "$target_type" == "search" || "$target_type" == "both" ]]; then
        echo "✅ Funnel SEARCH déjà à jour"
      fi
      ;;
      
    "2")
      echo "VERSION 2 : Questions guidées + Français corrigé"
      echo ""
      echo "Caractéristiques :"
      echo "- 4 questions guidées"
      echo "- Construction automatique du message"
      echo "- Barre de progression"
      echo "- Français corrigé"
      echo "- Édition libre optionnelle"
      
      if [[ "$target_type" == "propose" || "$target_type" == "both" ]]; then
        if [ -f "${BACKUP_DIR_PROPOSE}/page-version-2-questions.tsx" ]; then
          cp "$PROPOSE_FILE" "${PROPOSE_FILE}.backup-v1"
          cp "${BACKUP_DIR_PROPOSE}/page-version-2-questions.tsx" "$PROPOSE_FILE"
          echo "✅ Funnel PROPOSE Version 2 activée !"
        else
          echo "⚠️  Version 2 pour PROPOSE pas encore créée"
        fi
      fi
      
      if [[ "$target_type" == "search" || "$target_type" == "both" ]]; then
        echo "⚠️  Version 2 pour SEARCH pas encore créée"
        echo "    (TODO: créer page-version-2-questions.tsx pour search)"
      fi
      ;;
      
    "original")
      echo "VERSION ORIGINALE : Auto-génération + Ancien français"
      echo ""
      echo "Caractéristiques :"
      echo "- Génération automatique au chargement"
      echo "- Texte pré-rempli"
      echo "- Ancien format français (vers Réunion)"
      echo "- Utilisateurs ne modifient pas"
      
      if [[ "$target_type" == "propose" || "$target_type" == "both" ]]; then
        if [ -f "${PROPOSE_FILE}.backup-original" ]; then
          cp "${PROPOSE_FILE}.backup-original" "$PROPOSE_FILE"
          echo "✅ Funnel PROPOSE version originale restaurée !"
        else
          echo "⚠️  Backup original PROPOSE non trouvé."
          echo "    Récupérez depuis Git : git checkout HEAD~X -- $PROPOSE_FILE"
        fi
      fi
      
      if [[ "$target_type" == "search" || "$target_type" == "both" ]]; then
        if [ -f "${SEARCH_FILE}.backup-original" ]; then
          cp "${SEARCH_FILE}.backup-original" "$SEARCH_FILE"
          echo "✅ Funnel SEARCH version originale restaurée !"
        else
          echo "⚠️  Backup original SEARCH non trouvé."
          echo "    Récupérez depuis Git : git checkout HEAD~X -- $SEARCH_FILE"
        fi
      fi
      ;;
  esac
}

case $VERSION in
  "1"|"2"|"original")
    activate_version $VERSION $TYPE
    ;;
    
  "help"|*)
    echo "🧪 Script de test des versions d'annonce"
    echo ""
    echo "Usage: $0 [version] [type]"
    echo ""
    echo "Versions disponibles :"
    echo "  1         Version 1 : Champ vide + encouragements (ACTUELLE)"
    echo "  2         Version 2 : Questions guidées"
    echo "  original  Version originale : Auto-génération"
    echo ""
    echo "Types :"
    echo "  propose   Funnel 'Je propose de la place' seulement"
    echo "  search    Funnel 'Je cherche une place' seulement"  
    echo "  both      Les deux funnels (défaut)"
    echo ""
    echo "Exemples :"
    echo "  $0 2              # Active version 2 pour les deux types"
    echo "  $0 1 propose      # Active version 1 pour les offres seulement"
    echo "  $0 original search # Restaure version originale pour les demandes"
    echo ""
    echo "🇫🇷 Améliorations françaises :"
    echo "  ✅ 'de France vers la Réunion' (au lieu de 'vers Réunion')"
    echo "  ✅ 'la Martinique', 'la Guadeloupe', etc."
    echo ""
    echo "📊 Types d'annonces gérés :"
    echo "  📦 PROPOSE : 'Je propose de la place dans mon conteneur'"
    echo "  🔍 SEARCH  : 'Je cherche une place dans un conteneur'"
    echo ""
    echo "⚠️  Pensez à redémarrer le serveur dev après le changement !"
    echo "   cd dodo-partage && npm run dev"
    ;;
esac

echo ""
echo "📊 Métriques à suivre pour évaluer l'efficacité :"
echo "- Taux de personnalisation des annonces (propose vs search)"
echo "- Longueur moyenne des messages par type"
echo "- Nombre de contacts/réponses par annonce" 
echo "- Temps passé sur l'étape"
echo ""
echo "🔄 Redémarrez le serveur dev pour voir les changements :"
echo "   cd dodo-partage && npm run dev" 