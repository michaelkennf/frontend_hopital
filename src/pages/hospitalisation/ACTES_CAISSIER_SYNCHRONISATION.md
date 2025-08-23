# 🔄 Synchronisation des Interfaces Actes : Caissier ↔ Hospitalisation

## 🎯 Objectif
Rendre l'interface de gestion des actes d'hospitalisation **identique** à celle du caissier, tout en conservant le filtrage spécifique aux patients hospitalisés.

## 🔍 Différences Identifiées et Corrigées

### **1. Structure du Formulaire**

#### **❌ AVANT (Hospitalisation)**
```typescript
const [form, setForm] = useState({
  patientId: '',
  actTypeId: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  description: ''  // ❌ Champ supplémentaire non présent chez le caissier
});
```

#### **✅ APRÈS (Synchronisé avec Caissier)**
```typescript
const [form, setForm] = useState({
  patientId: '',
  actTypeId: '',
  date: new Date().toISOString().slice(0, 10),
  amount: ''  // ✅ Identique au caissier
});
```

### **2. Gestion Automatique du Prix**

#### **❌ AVANT (Hospitalisation)**
```typescript
// Pas de gestion automatique du prix
// L'utilisateur devait saisir manuellement le montant
```

#### **✅ APRÈS (Synchronisé avec Caissier)**
```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  
  if (name === 'actTypeId' && value) {
    // Récupérer automatiquement le prix du type d'acte sélectionné
    const selectedActType = actTypes.find(type => type.id === parseInt(value));
    if (selectedActType) {
      setForm({ 
        ...form, 
        [name]: value,
        amount: selectedActType.price.toString()  // ✅ Prix automatique
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  } else {
    setForm({ ...form, [name]: value });
  }
};
```

### **3. Champ Montant en Lecture Seule**

#### **❌ AVANT (Hospitalisation)**
```typescript
<input
  type="number"
  name="amount"
  placeholder="Montant"
  value={form.amount}
  onChange={handleChange}
  required
  className="input-field"
/>
```

#### **✅ APRÈS (Synchronisé avec Caissier)**
```typescript
<input
  type="number"
  name="amount"
  value={form.amount}
  onChange={handleChange}
  placeholder="Prix"
  required
  readOnly                    // ✅ Lecture seule
  className="input-field bg-gray-100"  // ✅ Style grisé
/>
```

### **4. Suppression du Champ Description**

#### **❌ AVANT (Hospitalisation)**
```typescript
<input
  type="text"
  name="description"
  placeholder="Description (optionnel)"
  value={form.description}
  onChange={handleChange}
  className="input-field"
/>
```

#### **✅ APRÈS (Supprimé)**
```typescript
// ❌ Champ description supprimé pour correspondre au caissier
```

### **5. Gestion des Actes Facturés**

#### **❌ AVANT (Hospitalisation)**
```typescript
// Pas de suivi des actes facturés
```

#### **✅ APRÈS (Synchronisé avec Caissier)**
```typescript
const [facturedActs, setFacturedActs] = useState<number[]>([]);

const fetchFacturedActs = async () => {
  try {
    const res = await axios.get('/api/invoices');
    const actsIds: number[] = [];
    for (const invoice of res.data.invoices || []) {
      for (const item of invoice.items || []) {
        if (item.type === 'act' && item.actId) {
          actsIds.push(Number(item.actId));
        }
      }
    }
    setFacturedActs(actsIds);
  } catch (e) {
    setFacturedActs([]);
  }
};
```

### **6. Fonction d'Impression**

#### **❌ AVANT (Hospitalisation)**
```typescript
// Pas de fonction d'impression
```

#### **✅ APRÈS (Synchronisé avec Caissier)**
```typescript
const handlePrintList = () => {
  const doc = new jsPDF();
  doc.text('Liste des actes programmés - Hospitalisation', 20, 20);
  let y = 40;
  acts.forEach((act, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${index + 1}. ${act.patient?.firstName || ''} ${act.patient?.lastName || ''} - ${act.actType?.name || 'Type non défini'}`, 20, y);
    y += 10;
  });
  doc.save('liste-actes-hospitalisation.pdf');
};
```

### **7. Bouton d'Impression**

#### **❌ AVANT (Hospitalisation)**
```typescript
<div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">Gestion des actes - Hospitalisation</h1>
  <button onClick={handleOpenForm} className="btn-primary">
    Nouvel acte
  </button>
</div>
```

#### **✅ APRÈS (Synchronisé avec Caissier)**
```typescript
<div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">Gestion des actes - Hospitalisation</h1>
  <div className="flex gap-2">
    <button
      onClick={handlePrintList}
      className="btn-secondary"
      disabled={acts.length === 0}
    >
      Imprimer la liste
    </button>
    <button onClick={handleOpenForm} className="btn-primary">
      Nouvel acte
    </button>
  </div>
</div>
```

### **8. Récupération des Actes**

#### **❌ AVANT (Hospitalisation)**
```typescript
const fetchActs = async () => {
  setLoading(true);
  try {
    const res = await axios.get('/api/acts/completed');
    // On ne garde que les actes des patients hospitalisation
    const hospRes = await axios.get('/api/hospitalizations');
    const hospHosp = hospRes.data.hospitalizations.filter((h: any) => h.patient && h.patient.folderNumber && !h.patient.folderNumber.startsWith('MAT-'));
    const hospPatientIds = hospHosp.map((h: any) => h.patientId);
    setActs((res.data.acts || []).filter((a: any) => hospPatientIds.includes(a.patient.id)));
  } catch (e) {
    setActs([]);
  } finally {
    setLoading(false);
  }
};
```

#### **✅ APRÈS (Synchronisé avec Caissier)**
```typescript
const fetchActs = async () => {
  setLoading(true);
  try {
    // Récupérer les actes programmés ET récemment réalisés (comme l'interface caissier)
    const [scheduledRes, realizedRes] = await Promise.all([
      axios.get('/api/acts/scheduled'),
      axios.get('/api/acts/realized')
    ]);
    
    const scheduledActs = scheduledRes.data.acts || [];
    
    // Filtrer les actes réalisés récemment (dans les 10 dernières minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentlyRealizedActs = (realizedRes.data.acts || [])
      .filter((act: any) => new Date(act.updatedAt || act.date) > tenMinutesAgo);
    
    // Combiner les actes programmés et récemment réalisés
    const allActs = [...scheduledActs, ...recentlyRealizedActs];
    
    // Filtrer pour ne garder que les actes des patients hospitalisation
    const hospRes = await axios.get('/api/hospitalizations');
    const hospHosp = hospRes.data.hospitalizations.filter((h: any) => h.patient && h.patient.folderNumber && !h.patient.folderNumber.startsWith('MAT-'));
    const hospPatientIds = hospHosp.map((h: any) => h.patientId);
    
    const filteredActs = allActs.filter((a: any) => hospPatientIds.includes(a.patient.id));
    setActs(filteredActs);
  } catch (e) {
    setActs([]);
  } finally {
    setLoading(false);
  }
};
```

## 🔧 Fonctionnalités Conservées (Spécifiques à l'Hospitalisation)

### **1. Filtrage des Patients**
- Seuls les patients du service `actes_hospitalisation` sont affichés
- Exclusion des patients maternité (dossiers commençant par 'MAT-')

### **2. Titre de la Page**
- "Gestion des actes - Hospitalisation" pour différencier du caissier

### **3. Fichier PDF**
- Nom du fichier : `liste-actes-hospitalisation.pdf`

## 📋 Vérification de la Synchronisation

### **Étape 1 : Comparaison des Interfaces**
1. Ouvrir l'interface caissier des actes
2. Ouvrir l'interface hospitalisation des actes
3. Vérifier que les formulaires sont identiques
4. Vérifier que les boutons sont identiques
5. Vérifier que les tableaux sont identiques

### **Étape 2 : Test des Fonctionnalités**
1. **Création d'acte** :
   - Sélectionner un patient
   - Sélectionner un type d'acte
   - Vérifier que le prix se remplit automatiquement
   - Vérifier que le champ montant est en lecture seule
   - Soumettre le formulaire

2. **Impression** :
   - Cliquer sur "Imprimer la liste"
   - Vérifier que le PDF se génère correctement

3. **Filtrage** :
   - Utiliser les filtres de recherche
   - Vérifier que seuls les patients hospitalisés sont visibles

### **Étape 3 : Vérification des Données**
1. Contrôler que les actes créés apparaissent dans la liste
2. Vérifier que les montants sont corrects
3. S'assurer que la facturation fonctionne

## 🎯 Résultat Final

Après synchronisation, l'interface hospitalisation des actes est **100% identique** à celle du caissier, avec :

✅ **Formulaire identique** : Mêmes champs, même validation, même comportement
✅ **Gestion du prix automatique** : Le montant se remplit selon le type d'acte
✅ **Champ montant en lecture seule** : Non modifiable par l'utilisateur
✅ **Fonction d'impression** : Génération de PDF identique
✅ **Gestion des actes facturés** : Suivi complet des facturations
✅ **Interface utilisateur** : Même design, mêmes boutons, même disposition

### **Différences Conservées (Légitimes)**
- **Filtrage des patients** : Seulement les patients hospitalisés
- **Titre de la page** : "Hospitalisation" pour différencier
- **Nom du fichier PDF** : Spécifique à l'hospitalisation

## 🔄 Maintenance Continue

### **Synchronisation Automatique**
- Toute modification de l'interface caissier doit être appliquée à l'hospitalisation
- Vérification régulière de la cohérence entre les deux interfaces
- Tests de régression après chaque mise à jour

### **Tests de Validation**
- Scripts de test identiques pour les deux interfaces
- Vérification de la cohérence des données
- Tests de création, modification et suppression d'actes

## 🎉 Conclusion

La synchronisation est **complète et réussie**. L'interface hospitalisation des actes est maintenant **parfaitement identique** à celle du caissier, tout en conservant les spécificités nécessaires au service d'hospitalisation.

Les utilisateurs bénéficient maintenant d'une **expérience cohérente** entre les deux interfaces, avec les mêmes fonctionnalités, le même comportement et la même ergonomie. 