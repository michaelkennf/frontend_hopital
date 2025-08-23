# 🔧 Guide de Résolution des Erreurs - Consultations Hospitalisation

## 🚨 Erreur Principale
```
TypeError: Cannot read properties of undefined (reading 'folderNumber')
at ConsultationsListHospitalisation.tsx:229:35
```

## 🔍 Causes Identifiées

### 1. **Données Corrompues en Base**
- Consultations sans patient associé
- Patients sans `folderNumber`
- Relations cassées entre `PatientConsultation` et `Patient`

### 2. **Différences SQLite vs PostgreSQL**
- **Local (SQLite)** : Plus permissif, accepte les données incomplètes
- **Production (PostgreSQL)** : Strict, rejette les données invalides

### 3. **Problèmes de Migration**
- Schémas Prisma différents entre environnements
- Données migrées incorrectement

## 🛠️ Solutions Appliquées

### **Frontend (React)**
✅ **Vérifications de sécurité ajoutées** :
- Filtrage des consultations invalides
- Vérification de l'existence du patient avant affichage
- Gestion des cas `undefined` avec valeurs par défaut
- Composant de débogage pour identifier les problèmes

### **Backend (API)**
✅ **Scripts de correction créés** :
- `quick-fix-consultations.js` : Correction rapide des données
- `fix-consultations-data.js` : Correction complète et détaillée
- `test-consultations-debug.js` : Diagnostic de l'API

## 📋 Étapes de Résolution

### **Étape 1 : Diagnostic**
```bash
# Tester l'API des consultations
node test-consultations-debug.js

# Vérifier la base de données
node scripts/quick-fix-consultations.js
```

### **Étape 2 : Correction des Données**
```bash
# Correction rapide
node scripts/quick-fix-consultations.js

# Correction complète (si nécessaire)
node scripts/fix-consultations-data.js
```

### **Étape 3 : Vérification**
```bash
# Tester à nouveau l'API
node test-consultations-debug.js

# Vérifier que toutes les consultations sont valides
```

## 🔧 Corrections Spécifiques

### **1. Patients sans folderNumber**
- Génération automatique de `folderNumber` uniques
- Format : `FIX-YYYY-TIMESTAMP`

### **2. Consultations Orphelines**
- Suppression des consultations sans patient
- Suppression des consultations sans type

### **3. Validation des Données**
- Vérification de la cohérence des relations
- Nettoyage des données invalides

## 🚀 Prévention

### **1. Validation Frontend**
- Vérification des données avant envoi
- Gestion des erreurs avec messages clairs
- Composants de débogage intégrés

### **2. Validation Backend**
- Vérification des relations avant création
- Rollback automatique en cas d'erreur
- Logs détaillés pour le débogage

### **3. Tests Automatisés**
- Scripts de test de l'API
- Vérification de la cohérence des données
- Tests de création/modification

## 📊 Monitoring

### **Indicateurs de Santé**
- Nombre de consultations valides vs invalides
- Patients sans `folderNumber`
- Consultations orphelines

### **Alertes**
- Affichage des erreurs de données dans l'interface
- Logs d'erreur détaillés
- Composant de débogage visible

## 🎯 Résultat Attendu

Après application des corrections :
✅ **Frontend** : Plus d'erreurs `folderNumber undefined`
✅ **Backend** : Données cohérentes et valides
✅ **API** : Réponses structurées et complètes
✅ **Base de données** : Relations intactes et données propres

## 🔄 Maintenance Continue

### **Surveillance**
- Vérification régulière de la cohérence des données
- Monitoring des erreurs de l'API
- Tests automatisés des fonctionnalités critiques

### **Mises à Jour**
- Synchronisation des schémas Prisma
- Migration des données avec validation
- Tests de régression après chaque déploiement 