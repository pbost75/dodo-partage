# ✅ Checklist de Déploiement - DodoPartage Cross-Domain

## 🎯 Étapes à suivre pour optimiser votre configuration

### 1. **Cloudflare Worker** (PRIORITÉ HAUTE ⚡)

#### Action requise :
```javascript
// Dans Cloudflare Dashboard → Workers & Pages → cloudflare-proxy-fix-v2
// Remplacer le code actuel par celui du fichier cloudflare-proxy-fix-v2.js
```

#### Changement principal :
- ❌ **Suppression** de la redirection automatique des funnels
- ✅ **Résultat** : Tout reste sur `www.dodomove.fr/partage`

#### Comment procéder :
1. Aller dans **Cloudflare Dashboard**
2. **Workers & Pages** → Votre worker
3. **Éditer le code** → Coller le nouveau contenu
4. **Save & Deploy**

---

### 2. **Backend Railway** (PRIORITÉ MOYENNE 🟡)

#### Vérifier la variable :
```bash
PARTAGE_APP_URL=https://www.dodomove.fr/partage
```

#### Comment vérifier :
1. Aller sur **Railway Dashboard**
2. **Projet dodomove-backend** → Variables
3. Confirmer que `PARTAGE_APP_URL` = `https://www.dodomove.fr/partage`
4. Si différent → Modifier et redéployer

---

### 3. **Frontend Vercel** (PRIORITÉ BASSE 🟢)

#### Action requise :
```bash
# Commit et push des modifications
git add .
git commit -m "feat: optimisation cross-domain et pages de test"
git push origin main
```

#### Nouveautés ajoutées :
- ✅ Page `/test-api` pour tester les APIs
- ✅ Variables d'environnement clarifiées
- ✅ Documentation mise à jour

---

## 🧪 Tests Obligatoires Après Déploiement

### Test 1 : Navigation (2 minutes)
1. **Aller sur** `www.dodomove.fr/partage/test-links`
2. **Vérifier** : Contexte "www.dodomove.fr/partage" ✅
3. **Cliquer** sur tous les boutons de test
4. **Résultat attendu** : Toutes les URLs gardent `/partage`

### Test 2 : APIs (2 minutes)
1. **Aller sur** `www.dodomove.fr/partage/test-api`
2. **Cliquer** "Lancer tous les tests"
3. **Résultat attendu** : Tous les tests verts ✅

### Test 3 : Workflow complet (5 minutes)
1. **Créer une annonce** depuis `www.dodomove.fr/partage/funnel/propose`
2. **Vérifier l'email** reçu → liens vers `www.dodomove.fr/partage`
3. **Valider l'annonce** → email confirmation
4. **Modifier l'annonce** → tous les liens corrects

---

## 🚨 Que faire en cas de problème ?

### Problème : Tests API échouent
**Solution :**
1. Vérifier que le Worker Cloudflare est actif
2. Regarder les logs Cloudflare pour les erreurs
3. Tester directement `partage.dodomove.fr/test-api`

### Problème : Navigation cassée
**Solution :**
1. Vérifier que les variables `NEXT_PUBLIC_*_URL` sont bonnes
2. Redéployer Frontend si nécessaire
3. Vider le cache Cloudflare

### Problème : Emails avec mauvais liens
**Solution :**
1. Vérifier `PARTAGE_APP_URL` sur Railway
2. Redéployer le backend
3. Tester avec une nouvelle annonce

---

## 📞 Support

Si vous avez des difficultés :
1. 📋 **Consulter** `AUDIT-CROSSDOMAIN-2024.md` pour les détails
2. 🧪 **Utiliser** les pages `/test-api` et `/test-links` pour diagnostiquer
3. 📝 **Noter** les erreurs exactes dans la console du navigateur

---

## 🎉 Résultat Final Attendu

Après ces déploiements :
- ✅ **UX cohérente** : Tout sur `www.dodomove.fr/partage`
- ✅ **APIs fonctionnelles** : Cross-domain transparent
- ✅ **Emails corrects** : Liens vers l'URL SEO-friendly
- ✅ **Tests automatisés** : Pages de debug intégrées
- ✅ **Performance optimale** : Monitoring possible

**Temps estimé total : 15-20 minutes** ⏱️

---

*Checklist créée le 24 décembre 2024* 