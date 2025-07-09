# 📊 Documentation des Événements GTM - DodoPartage

## 🎯 Vue d'ensemble

Cette documentation détaille tous les événements Google Tag Manager (GTM) implémentés dans DodoPartage et comment les exploiter pour l'analyse et le marketing.

### 📋 Configuration GTM
- **Conteneur GTM** : `GTM-MRHKMB9Z`
- **Propriété GA4** : `G-VWE8386BQC`
- **Domaines trackés** : `www.dodomove.fr/partage/*` et `partage.dodomove.fr`

---

## 📝 Événements Implémentés

### 1. **Page Views** 📄
**Événement automatique** : Tracké automatiquement par GTM via le tag GA4 "All Pages"
```javascript
// Événement personnalisé supplémentaire si besoin
{
  event: 'page_view',
  page_title: 'Titre de la page',
  page_location: 'https://www.dodomove.fr/partage/',
  page_path: '/partage/'
}
```
**📊 Usage GA4** : Rapports > Engagement > Pages et écrans

---

### 2. **Création d'Annonce** 📝
**Déclencheur** : Quand un utilisateur soumet une nouvelle annonce via le funnel

```javascript
{
  event: 'announcement_created',
  announcement_type: 'offer' | 'request',
  announcement_id: 'unique-id'
}
```

**📍 Où c'est tracké** : Funnel de création d'annonce (étape confirmation)
**📊 Usage GA4** : 
- Rapports > Conversions > Événements
- Objectif : Mesurer le taux de conversion du funnel

---

### 3. **Contact d'Annonce** 📧
**Déclencheur** : Quand un utilisateur clique pour contacter une annonce

```javascript
{
  event: 'announcement_contact',
  announcement_type: 'offer' | 'request',
  announcement_id: 'unique-id',
  contact_method: 'email' | 'whatsapp'
}
```

**📍 Où c'est tracké** : Boutons de contact sur les cartes d'annonces
**📊 Usage GA4** : 
- Analyser l'engagement utilisateur
- Optimiser les méthodes de contact

---

### 4. **Modification d'Annonce** ✏️
**Déclencheur** : Quand un utilisateur modifie son annonce via le lien email

```javascript
{
  event: 'announcement_updated',
  announcement_type: 'offer' | 'request',
  announcement_id: 'unique-id'
}
```

**📍 Où c'est tracké** : Page de modification d'annonce
**📊 Usage GA4** : Mesurer l'engagement post-publication

---

### 5. **Suppression d'Annonce** 🗑️
**Déclencheur** : Quand un utilisateur supprime son annonce

```javascript
{
  event: 'announcement_deleted',
  announcement_type: 'offer' | 'request',
  announcement_id: 'unique-id'
}
```

**📍 Où c'est tracké** : Page de suppression d'annonce
**📊 Usage GA4** : Analyser les raisons d'abandon

---

### 6. **Création d'Alerte Email** 🔔
**Déclencheur** : Quand un utilisateur crée une alerte email

```javascript
{
  event: 'alert_created',
  announcement_type: 'offer' | 'request'
}
```

**📍 Où c'est tracké** : Modal de création d'alerte (après soumission réussie)
**📊 Usage GA4** : 
- Mesurer l'intérêt pour les alertes
- Optimiser le système de notifications

---

### 7. **Utilisation des Filtres** 🔍
**Déclencheur** : Quand un utilisateur applique des filtres de recherche

```javascript
{
  event: 'filter_used',
  filter_type: 'price' | 'volume' | 'location',
  search_query: 'valeur du filtre'
}
```

**📍 Où c'est tracké** : Composant FilterSection
**📊 Usage GA4** : 
- Comprendre les préférences utilisateur
- Optimiser les options de filtrage

---

### 8. **Recherche** 🔎
**Déclencheur** : Quand un utilisateur effectue une recherche

```javascript
{
  event: 'search_performed',
  search_query: 'terme de recherche'
}
```

**📍 Où c'est tracké** : Barre de recherche principale
**📊 Usage GA4** : 
- Analyser les termes de recherche populaires
- Améliorer la pertinence des résultats

---

### 9. **Navigation Funnel** 🚀
**Déclencheur** : Progression dans le funnel de création d'annonce

```javascript
{
  event: 'funnel_step',
  step_name: 'nom-de-l-etape',
  step_number: 1,
  // données additionnelles spécifiques à l'étape
}
```

**📍 Où c'est tracké** : Chaque étape du funnel propose/cherche
**📊 Usage GA4** : 
- Analyser le taux d'abandon par étape
- Optimiser l'UX du funnel

---

## 🛠️ Configuration GTM

### 1. **Déclencheurs à Créer**

#### Déclencheur "Événement Personnalisé"
```
Type : Événement personnalisé
Nom de l'événement : announcement_created
Se déclenche sur : Tous les événements personnalisés
```

Répéter pour chaque événement :
- `announcement_contact`
- `announcement_updated` 
- `announcement_deleted`
- `alert_created`
- `filter_used`
- `search_performed`
- `funnel_step`

### 2. **Tags GA4 à Créer**

#### Tag "GA4 - Création Annonce"
```
Type : Événement GA4
Configuration : [Votre ID GA4]
Nom de l'événement : announcement_created
Déclencheur : announcement_created

Paramètres d'événement :
- announcement_type : {{Event - announcement_type}}
- announcement_id : {{Event - announcement_id}}
```

### 3. **Variables GTM Recommandées**

Créer des variables GTM pour capturer les paramètres :
```
Nom : Event - announcement_type
Type : Variable de couche de données
Nom de la variable : announcement_type

Nom : Event - announcement_id  
Type : Variable de couche de données
Nom de la variable : announcement_id
```

---

## 📊 Exploiter les Données dans GA4

### 1. **Rapports Personnalisés**

#### Rapport "Performance Annonces"
**Dimensions** : 
- Type d'événement (announcement_created, announcement_contact)
- Type d'annonce (offer/request)

**Métriques** :
- Nombre d'événements
- Utilisateurs uniques
- Taux de conversion

#### Rapport "Efficacité des Alertes"
**Dimensions** :
- Source/Medium
- Type d'alerte

**Métriques** :
- Alertes créées
- Taux de création d'alerte

### 2. **Audiences Ciblées**

#### Audience "Créateurs d'Annonces"
**Conditions** :
- A déclenché : announcement_created
- Dans les 30 derniers jours

#### Audience "Utilisateurs Engagés"
**Conditions** :
- A déclenché : announcement_contact OU alert_created
- Dans les 7 derniers jours

### 3. **Objectifs & Conversions**

#### Objectif Principal : "Annonce Créée"
```
Type : Événement
Nom de l'événement : announcement_created
Valeur : Marquer comme conversion
```

#### Objectif Secondaire : "Contact d'Annonce"
```
Type : Événement  
Nom de l'événement : announcement_contact
Valeur : Marquer comme conversion
```

---

## 🧪 Tests et Debugging

### 1. **Page de Test**
**URL** : `https://www.dodomove.fr/partage/test-gtm`

**Fonctionnalités** :
- ✅ Diagnostic GTM complet
- ✅ Test de tous les événements
- ✅ Vérification dataLayer
- ✅ Debug console

### 2. **Validation des Événements**

#### Dans la Console Navigateur :
```javascript
// Vérifier que GTM est chargé
console.log(window.dataLayer);

// Vérifier un événement spécifique
window.dataLayer.filter(item => item.event === 'alert_created');
```

#### Dans GTM Preview Mode :
1. Activer le mode Aperçu GTM
2. Naviguer sur le site  
3. Vérifier que les événements se déclenchent
4. Valider les variables passées

---

## 🚀 Recommandations d'Usage

### 1. **Marketing**
- **Retargeting** : Créer des audiences basées sur les événements
- **Optimisation Ads** : Utiliser les conversions pour optimiser les campagnes
- **Attribution** : Analyser les parcours utilisateur avec les événements funnel

### 2. **Produit**
- **A/B Testing** : Comparer les taux de conversion par version
- **UX Optimization** : Identifier les points de friction dans le funnel
- **Feature Usage** : Mesurer l'adoption des nouvelles fonctionnalités

### 3. **Analytics**
- **Dashboards** : Créer des tableaux de bord temps réel
- **Alerts** : Configurer des alertes sur les métriques clés
- **Reporting** : Automatiser les rapports hebdomadaires/mensuels

---

## 📋 Checklist de Validation

### ✅ Configuration GTM
- [ ] Conteneur GTM publié en production
- [ ] Tag GA4 "All Pages" configuré
- [ ] Déclencheurs créés pour tous les événements
- [ ] Variables GTM configurées
- [ ] Mode Aperçu testé

### ✅ Implémentation Code
- [ ] Hook useGTM.ts fonctionnel
- [ ] Tous les événements appelés aux bons endroits
- [ ] Console logs visibles en développement
- [ ] Tests automatisés passants

### ✅ Analytics GA4
- [ ] Événements visibles dans Temps Réel
- [ ] Conversions configurées
- [ ] Rapports personnalisés créés
- [ ] Audiences définies

---

## 🔗 Ressources Utiles

- **GTM Container** : [https://tagmanager.google.com/](https://tagmanager.google.com/)
- **GA4 Property** : [https://analytics.google.com/](https://analytics.google.com/)
- **Debug Tool** : Extension Google Tag Assistant
- **Documentation** : [Mesure GA4](https://developers.google.com/analytics/devguides/collection/ga4)

---

## 📞 Support

Pour toute question sur l'implémentation GTM :
1. Consulter la page de test : `/test-gtm`
2. Vérifier les logs console navigateur
3. Utiliser le mode Aperçu GTM pour debugging

---

**Dernière mise à jour** : 2025-01-09
**Version** : 1.0.0 