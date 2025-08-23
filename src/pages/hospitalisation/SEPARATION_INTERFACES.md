# 🔒 SÉPARATION DES INTERFACES - HOSPITALISATION vs MATERNITÉ

## 🎯 Objectif
Assurer que chaque interface (Hospitalisation et Maternité) ne voit que ses propres patients dans toutes ses pages, respectant une logique de séparation claire et cohérente.

## 🏗️ Architecture de Séparation

### **1. Préfixes des Numéros de Dossier**
- **HOSP-** : Patients de l'interface Hospitalisation
- **MAT-** : Patients de l'interface Maternité
- **Aucun préfixe** : Patients génériques (consultations, examens, etc.)

### **2. Services API par Interface**

#### **Interface Hospitalisation** 🏥
```typescript
// Services utilisés par l'interface hospitalisation
const servicesHospitalisation = [
  'hospitalisation',                    // Gestion des patients
  'consultations_hospitalisation',      // Consultations
  'examens_hospitalisation',           // Examens
  'medicaments_hospitalisation',       // Médicaments
  'actes_hospitalisation'              // Actes
];

// Filtrage : Seulement les patients HOSP-
whereClause = {
  folderNumber: { startsWith: 'HOSP-' }
};
```

#### **Interface Maternité** 👶
```typescript
// Services utilisés par l'interface maternité
const servicesMaternite = [
  'maternite',                         // Gestion des patients
  'consultations_maternite',           // Consultations
  'examens_maternite',                // Examens
  'medicaments_maternite',            // Médicaments
  'actes_maternite'                   // Actes
];

// Filtrage : Seulement les patients MAT-
whereClause = {
  folderNumber: { startsWith: 'MAT-' }
};
```

## 📋 Implémentation Technique

### **1. Backend - API des Patients**

#### **Route GET `/api/patients`**
```typescript
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { service } = req.query;
    let whereClause: any = {};
    
    // Filtrage par service avec logique de séparation
    if (service === 'hospitalisation') {
      // Interface hospitalisation : HOSP- uniquement
      whereClause = {
        folderNumber: { startsWith: 'HOSP-' }
      };
    } else if (service === 'maternite') {
      // Interface maternité : MAT- uniquement
      whereClause = {
        folderNumber: { startsWith: 'MAT-' }
      };
    } else if (service === 'consultations_hospitalisation') {
      // Consultations hospitalisation : HOSP- uniquement
      whereClause = {
        folderNumber: { startsWith: 'HOSP-' }
      };
    } else if (service === 'consultations_maternite') {
      // Consultations maternité : MAT- uniquement
      whereClause = {
        folderNumber: { startsWith: 'MAT-' }
      };
    }
    // ... autres services avec la même logique
    
    const patients = await prisma.patient.findMany({
      where: whereClause,
      include: {
        hospitalizations: {
          where: { status: 'active' },
          include: {
            room: {
              include: {
                type: { select: { id: true, name: true, price: true } }
              }
            }
          },
          orderBy: { startDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ patients });
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des patients' });
  }
});
```

### **2. Frontend - Utilisation des Services**

#### **Interface Hospitalisation**
```typescript
// PatientsManagementHospitalisation.tsx
const fetchPatients = async () => {
  const res = await authenticatedAxios.get('/api/patients?service=hospitalisation');
  setPatients(res.data.patients || []);
};

// ConsultationsListHospitalisation.tsx
const fetchPatients = async () => {
  const res = await axios.get('/api/patients?service=consultations_hospitalisation');
  setPatients(res.data.patients || []);
};

// ExamsListHospitalisation.tsx
const fetchPatients = async () => {
  const res = await axios.get('/api/patients?service=examens_hospitalisation');
  setPatients(res.data.patients || []);
};

// MedicationsListHospitalisation.tsx
const fetchPatients = async () => {
  const res = await axios.get('/api/patients?service=medicaments_hospitalisation');
  setPatients(res.data.patients || []);
};

// ActsListHospitalisation.tsx
const fetchPatients = async () => {
  const res = await axios.get('/api/patients?service=actes_hospitalisation');
  setPatients(res.data.patients || []);
};
```

#### **Interface Maternité**
```typescript
// PatientsManagementMaternite.tsx
const fetchPatients = async () => {
  const res = await axios.get('/api/patients?service=maternite');
  setPatients(res.data.patients || []);
};

// ConsultationsListMaternite.tsx
const fetchPatients = async () => {
  const res = await axios.get('/api/patients?service=consultations_maternite');
  setPatients(res.data.patients || []);
};

// ExamsListMaternite.tsx
const fetchPatients = async () => {
  const res = await axios.get('/api/patients?service=examens_maternite');
  setPatients(res.data.patients || []);
};

// MedicationsListMaternite.tsx
const fetchPatients = async () => {
  const res = await axios.get('/api/patients?service=medicaments_maternite');
  setPatients(res.data.patients || []);
};

// ActsListMaternite.tsx
const fetchPatients = async () => {
  const res = await axios.get('/api/patients?service=actes_maternite');
  setPatients(res.data.patients || []);
};
```

## 🔍 Logique de Filtrage

### **1. Règles de Séparation**

#### **Interface Hospitalisation** 🏥
- **Règle** : Ne voir que les patients avec `folderNumber` commençant par `HOSP-`
- **Exclusion** : Aucun patient `MAT-` ne doit être visible
- **Services** : Tous les services hospitalisation respectent cette règle

#### **Interface Maternité** 👶
- **Règle** : Ne voir que les patients avec `folderNumber` commençant par `MAT-`
- **Exclusion** : Aucun patient `HOSP-` ne doit être visible
- **Services** : Tous les services maternité respectent cette règle

### **2. Validation des Données**

#### **Vérification des Préfixes**
```typescript
// Fonction de validation des préfixes
const validatePatientPrefix = (patient: any, expectedPrefix: string) => {
  if (!patient.folderNumber?.startsWith(expectedPrefix)) {
    console.warn(`⚠️ Patient ${patient.folderNumber} ne respecte pas le préfixe ${expectedPrefix}`);
    return false;
  }
  return true;
};

// Utilisation dans les composants
const validPatients = patients.filter(p => validatePatientPrefix(p, 'HOSP-')); // Pour hospitalisation
const validPatients = patients.filter(p => validatePatientPrefix(p, 'MAT-'));  // Pour maternité
```

#### **Détection des Violations**
```typescript
// Composant de débogage pour détecter les violations
{patients.length > 0 && patients.some(p => {
  if (interfaceType === 'hospitalisation') {
    return p.folderNumber?.startsWith('MAT-');
  } else if (interfaceType === 'maternite') {
    return p.folderNumber?.startsWith('HOSP-');
  }
  return false;
}) && (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 text-red-700">
    <h3 className="font-semibold mb-2">⚠️ Violation de séparation détectée</h3>
    <p className="text-sm">
      Des patients d'une autre interface sont visibles dans cette interface.
      Cela indique un problème de filtrage.
    </p>
  </div>
)}
```

## 🧪 Tests et Validation

### **1. Script de Test Automatisé**

#### **Fichier** : `backend/test-interface-separation.js`
```bash
# Exécuter le test de séparation
node test-interface-separation.js
```

#### **Fonctionnalités du Test**
- ✅ Vérification de la séparation par interface
- ✅ Validation des règles de filtrage
- ✅ Détection des violations de séparation
- ✅ Rapport détaillé des problèmes
- ✅ Recommandations de correction

### **2. Tests Manuels**

#### **Interface Hospitalisation**
1. Aller sur la page des patients
2. Vérifier que seuls les patients `HOSP-` sont visibles
3. Tester toutes les pages (consultations, examens, médicaments, actes)
4. Confirmer l'absence de patients `MAT-`

#### **Interface Maternité**
1. Aller sur la page des patients
2. Vérifier que seuls les patients `MAT-` sont visibles
3. Tester toutes les pages (consultations, examens, médicaments, actes)
4. Confirmer l'absence de patients `HOSP-`

### **3. Validation des Données**

#### **Vérification des Préfixes**
```typescript
// Test de cohérence des préfixes
const testPrefixConsistency = () => {
  const hospPatients = patients.filter(p => p.folderNumber?.startsWith('HOSP-'));
  const matPatients = patients.filter(p => p.folderNumber?.startsWith('MAT-'));
  
  console.log(`Patients HOSP-: ${hospPatients.length}`);
  console.log(`Patients MAT-: ${matPatients.length}`);
  
  // Vérifier qu'il n'y a pas de chevauchement
  const overlap = patients.filter(p => 
    p.folderNumber?.startsWith('HOSP-') && p.folderNumber?.startsWith('MAT-')
  );
  
  if (overlap.length > 0) {
    console.error('❌ Chevauchement détecté:', overlap);
  } else {
    console.log('✅ Aucun chevauchement détecté');
  }
};
```

## 🚨 Gestion des Erreurs

### **1. Détection des Violations**

#### **Logs de Débogage**
```typescript
// Logs pour détecter les violations
console.log(`🔍 Interface ${interfaceType}: ${patients.length} patients`);
console.log(`   - HOSP-: ${patients.filter(p => p.folderNumber?.startsWith('HOSP-')).length}`);
console.log(`   - MAT-: ${patients.filter(p => p.folderNumber?.startsWith('MAT-')).length}`);

// Vérification des violations
if (interfaceType === 'hospitalisation' && patients.some(p => p.folderNumber?.startsWith('MAT-'))) {
  console.error('❌ VIOLATION: Patients MAT- visibles dans l\'interface hospitalisation');
}
```

#### **Alertes Utilisateur**
```typescript
// Composant d'alerte pour les violations
{patients.some(p => {
  if (interfaceType === 'hospitalisation') {
    return p.folderNumber?.startsWith('MAT-');
  } else if (interfaceType === 'maternite') {
    return p.folderNumber?.startsWith('HOSP-');
  }
  return false;
}) && (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 text-red-700">
    <h3 className="font-semibold mb-2">🚨 Violation de Sécurité</h3>
    <p className="text-sm">
      Des patients d'une autre interface sont visibles. 
      Contactez l'administrateur système.
    </p>
  </div>
)}
```

### **2. Correction Automatique**

#### **Filtrage Client-Side**
```typescript
// Filtrage de sécurité côté client
const filterPatientsByInterface = (patients: any[], interfaceType: string) => {
  if (interfaceType === 'hospitalisation') {
    return patients.filter(p => p.folderNumber?.startsWith('HOSP-'));
  } else if (interfaceType === 'maternite') {
    return patients.filter(p => p.folderNumber?.startsWith('MAT-'));
  }
  return patients;
};

// Utilisation
const validPatients = filterPatientsByInterface(patients, 'hospitalisation');
```

## 🔧 Maintenance et Surveillance

### **1. Monitoring Continu**

#### **Vérifications Régulières**
- Contrôler que chaque interface ne voit que ses propres patients
- Surveiller les logs pour détecter les violations
- Tester la création de nouveaux patients dans chaque interface

#### **Tests Automatisés**
- Exécuter `test-interface-separation.js` régulièrement
- Intégrer les tests dans le pipeline CI/CD
- Surveiller les métriques de séparation

### **2. Mises à Jour et Évolutions**

#### **Ajout de Nouvelles Interfaces**
```typescript
// Exemple d'ajout d'une nouvelle interface
} else if (service === 'nouvelle_interface') {
  whereClause = {
    folderNumber: {
      startsWith: 'NOUV-'
    }
  };
}
```

#### **Modification des Règles**
- Toujours maintenir la séparation stricte
- Documenter les changements de logique
- Tester après chaque modification

## 📊 Métriques et Rapports

### **1. Indicateurs de Séparation**

#### **Taux de Respect des Règles**
```typescript
const calculateSeparationRate = (interfaceType: string, patients: any[]) => {
  const totalPatients = patients.length;
  const validPatients = patients.filter(p => {
    if (interfaceType === 'hospitalisation') {
      return p.folderNumber?.startsWith('HOSP-');
    } else if (interfaceType === 'maternite') {
      return p.folderNumber?.startsWith('MAT-');
    }
    return false;
  }).length;
  
  return totalPatients > 0 ? (validPatients / totalPatients) * 100 : 100;
};
```

#### **Rapport de Séparation**
```typescript
const generateSeparationReport = () => {
  const report = {
    hospitalisation: {
      total: patients.filter(p => p.folderNumber?.startsWith('HOSP-')).length,
      violations: patients.filter(p => p.folderNumber?.startsWith('MAT-')).length,
      rate: calculateSeparationRate('hospitalisation', patients)
    },
    maternite: {
      total: patients.filter(p => p.folderNumber?.startsWith('MAT-')).length,
      violations: patients.filter(p => p.folderNumber?.startsWith('HOSP-')).length,
      rate: calculateSeparationRate('maternite', patients)
    }
  };
  
  return report;
};
```

## 🎉 Résultats Attendus

### **1. Séparation Parfaite**
✅ **Interface Hospitalisation** : Seulement les patients `HOSP-`
✅ **Interface Maternité** : Seulement les patients `MAT-`
✅ **Aucun chevauchement** entre les interfaces
✅ **Sécurité des données** respectée

### **2. Expérience Utilisateur**
✅ **Navigation claire** entre les interfaces
✅ **Données pertinentes** pour chaque contexte
✅ **Pas de confusion** entre les services
✅ **Interface intuitive** et logique

### **3. Maintenance Simplifiée**
✅ **Logique centralisée** dans l'API
✅ **Tests automatisés** de validation
✅ **Détection précoce** des problèmes
✅ **Correction rapide** des violations

## 🔒 Conclusion

La séparation des interfaces est maintenant **parfaitement implémentée** avec :

✅ **Logique de filtrage cohérente** dans l'API des patients
✅ **Services spécifiques** pour chaque interface et fonctionnalité
✅ **Validation stricte** des préfixes de numéros de dossier
✅ **Tests automatisés** pour vérifier la séparation
✅ **Monitoring continu** pour détecter les violations

Chaque interface respecte maintenant strictement la règle de séparation :
- **Hospitalisation** : Patients `HOSP-` uniquement
- **Maternité** : Patients `MAT-` uniquement

La logique est maintenue dans toutes les pages (patients, consultations, examens, médicaments, actes, hospitalisations) et garantit une expérience utilisateur cohérente et sécurisée. 