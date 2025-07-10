# 🧪 Versions de test pour l'étape "Annonce"

## Problème identifié
Les utilisateurs ne personnalisent pas le texte généré automatiquement, ce qui donne des annonces génériques type "bot" alors que sur Facebook ils sont plus personnels.

## 3 versions à tester

### ✅ VERSION 1 : ACTUELLE (Champ vide + encouragements)
**Fichier :** `announcement-text/page.tsx` (actuellement actif)

**Caractéristiques :**
- Champ vide au départ
- Placeholder intelligent avec conseils
- Messages encourageants
- Option "exemple" sur demande seulement

**Hypothèse :** Forcer à écrire = plus de personnalisation

---

### 🔄 VERSION 2 : Questions guidées (à créer)
**Principe :** Poser 3-4 questions simples qui construisent le message

```
1. "Présentez-vous en quelques mots :" ___________
2. "Pourquoi proposez-vous cette place ?" ___________  
3. "Quels objets refusez-vous ?" ___________
4. "Conditions particulières ?" ___________

→ Génère automatiquement un texte naturel avec leurs réponses
```

**Hypothèse :** Structure guidée = plus facile + plus personnel

---

### 🎯 VERSION 3 : Système mixte (à créer)
**Principe :** Commence avec prompts, puis permet édition libre

```
"Complétez ces phrases pour créer votre annonce :

🏠 Je suis [qui êtes-vous ?] et je [pourquoi ce voyage ?]
📦 J'ai [volume] m³ libre que je propose [gratuitement/avec participation]
✅ J'accepte : [types d'objets]
❌ Je refuse : [restrictions]
📞 Pour organiser : [vos disponibilités]"
```

**Hypothèse :** Prompts simples = meilleur équilibre facilité/personnalisation

## 🚀 Comment tester

### Métriques à suivre :
1. **Taux de personnalisation** : % d'annonces modifiées vs texte par défaut
2. **Longueur moyenne** des annonces
3. **Taux de contact** par annonce
4. **Temps passé** sur l'étape
5. **Feedback utilisateur** (optionnel)

### Plan de test A/B :
1. **Semaine 1** : Version 1 (actuelle)
2. **Semaine 2** : Version 2 (questions)  
3. **Semaine 3** : Version 3 (prompts)
4. **Analyse** des résultats

## 🔧 Commandes pour switcher

### Revenir à l'ancienne version (avec auto-génération) :
```bash
# Décommenter les lignes 82-88 dans announcement-text/page.tsx
```

### Activer Version 2 (questions guidées) :
```bash
# Remplacer le contenu par version-2.tsx (à créer)
```

### Activer Version 3 (prompts) :
```bash
# Remplacer le contenu par version-3.tsx (à créer)
```

## 📊 Exemples de résultats attendus

### ❌ Avant (générique) :
"🚢 Bonjour ! Transport France (Le Havre) → Réunion (Le Port) 15 mars en conteneur 20 pieds. Il me reste 16 m³. Je propose gratuitement cet espace pour transporter vos affaires personnelles. N'hésitez pas à me contacter pour qu'on organise ça ensemble !"

### ✅ Après (personnel) :
"Salut ! Je suis Sophie, fonctionnaire en mutation vers La Réunion. Mon conteneur part mi-mars du Havre, il me reste pas mal de place (16m³). Je partage gratuitement par solidarité entre expatriés ! J'accepte tout sauf produits dangereux. Disponible weekends pour organiser. Au plaisir d'aider !"

## 🎯 Objectif final
**Transformer des annonces "bot" en vraies conversations humaines qui génèrent plus de contacts qualifiés.** 