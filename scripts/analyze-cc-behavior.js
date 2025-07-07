#!/usr/bin/env node

console.log('🔍 ANALYSE DU COMPORTEMENT CC AUTOMATIQUE');
console.log('==========================================');
console.log('\n📋 DIAGNOSTIC:');
console.log('✅ FRONTEND: Envoie recipientEmail et senderEmail correctement');
console.log('❌ BACKEND: Ajoute automatiquement senderEmail en cc');
console.log('\n🎯 PROBLÈME IDENTIFIÉ:');
console.log('L\'expéditeur reçoit une copie (cc) de son propre message');
console.log('\n�� SOLUTION IMMÉDIATE:');
console.log('Ajouter skipSenderCc: true dans la requête pour désactiver le cc');
