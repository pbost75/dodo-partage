# 🔍 Guide de Nettoyage Google Search Console

## 📊 Situation actuelle

**Problème identifié :** 4 URLs d'annonces déjà indexées par Google qui sont maintenant en 404 ou expirées.

**Audit terminé :** Les fichiers `urls-to-remove-from-google.txt` et `indexed-announcements-audit.json` ont été générés.

## 🎯 Actions à réaliser dans Google Search Console

### **🔧 ÉTAPE 1 : Vérification technique (IMMÉDIAT)**

1. **Déployer les corrections :**
   ```bash
   # Déployer le nouveau code avec middleware et noindex
   git add .
   git commit -m "feat: Add middleware redirect for expired announcements + noindex"
   git push
   ```

2. **Vérifier le middleware :**
   - Tester en local : `npm run dev`
   - Accéder à une URL d'annonce expirée → doit rediriger vers la page destination
   - Vérifier les logs middleware dans la console

### **🗑️ ÉTAPE 2 : Suppression Google Search Console (PRIORITÉ HAUTE)**

1. **Aller dans Google Search Console :**
   - URL : https://search.google.com/search-console
   - Sélectionner votre propriété `www.dodomove.fr`

2. **Accéder aux suppressions :**
   - Menu latéral : **"Index" > "Suppressions"**
   - Cliquer sur **"Suppression temporaire"**

3. **Supprimer les URLs problématiques :**
   
   **Option A - Supprimer individuellement :**
   - Cliquer sur "Nouvelle demande"
   - Sélectionner "Supprimer temporairement l'URL"
   - Coller chaque URL du fichier `urls-to-remove-from-google.txt`
   - Répéter pour les 4 URLs

   **Option B - Supprimer par préfixe (RECOMMANDÉ) :**
   - Cliquer sur "Nouvelle demande"
   - Sélectionner "Supprimer temporairement l'URL"
   - URL à supprimer : `https://www.dodomove.fr/partage/annonce/`
   - **Ceci supprimera TOUTES les pages d'annonces en une fois**

4. **Valider la demande :**
   - Google traitera la demande sous 24-48h
   - Les URLs disparaîtront temporairement de l'index (6 mois)

### **📊 ÉTAPE 3 : Monitoring et vérification (PRIORITÉ MOYENNE)**

1. **Vérifier dans 1 semaine :**
   - Rechercher `site:www.dodomove.fr/partage/annonce/` dans Google
   - Il ne devrait plus y avoir de résultats

2. **Surveiller les nouvelles indexations :**
   - Les nouvelles annonces ne devraient plus s'indexer (grâce au noindex)
   - Vérifier dans "Index" > "Pages" que seules les pages destinations sont indexées

3. **Audit de suivi dans 1 mois :**
   ```bash
   # Relancer l'audit pour vérifier les améliorations
   node scripts/audit-indexed-announcements.js
   ```

## ✅ Résultats attendus

### **Immédiat (24-48h) :**
- ✅ Plus d'annonces expirées indexées par Google
- ✅ Redirections automatiques des anciennes URLs vers pages destinations
- ✅ Nouvelles annonces en noindex (pas d'indexation future)

### **Moyen terme (2-4 semaines) :**
- ✅ Amélioration du crawl budget Google
- ✅ Fin des 404 toxiques dans Search Console
- ✅ SEO concentré sur les 73 pages importantes (homepage + 72 destinations)

### **Long terme (3-6 mois) :**
- ✅ Amélioration des positions SEO sur les pages destinations
- ✅ Meilleure autorité de domaine (pas de 404 toxiques)
- ✅ Trafic organique optimisé

## 🚨 Points d'attention

1. **Ne pas supprimer les pages destinations** (www.dodomove.fr/partage/france-reunion/ etc.)
2. **Laisser indexée la homepage** (www.dodomove.fr/partage/)
3. **Surveiller qu'aucune nouvelle annonce ne s'indexe** grâce au noindex

## 📞 Support

Si vous avez des questions ou rencontrez des problèmes :
- Logs middleware visibles dans la console de développement
- Fichier d'audit : `scripts/indexed-announcements-audit.json`
- Support technique : Vérifier les redirections en mode développement
