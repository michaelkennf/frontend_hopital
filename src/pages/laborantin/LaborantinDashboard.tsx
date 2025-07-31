import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GlobalErrorBoundary } from '../../components/GlobalErrorBoundary';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';

const SERVICES = [
  {
    label: "Parasitologie",
    value: "PARASITOLOGIE",
    exams: ["GE/TDR", "GEF", "CU", "FCV", "EDS"]
  },
  {
    label: "Immuno-hématologie",
    value: "IMMUNO_HEMATOLOGIE",
    exams: [
      "Widal", "CRP", "H Pylori", "Determine", "HCV", "HBS", "RPR", "VS en mm/h", "FR", "ASLO", "Rubéole", "GB x10⁹/L", "Toxo : IGG/IGM", "FL", "HGB en g/dl", "Hct en %", "GS et Rhésus", "TC", "TS"
    ]
  },
  {
    label: "Biologie",
    value: "BIOLOGIE",
    exams: ["Test de grossesse", "Spermogramme"]
  },
  {
    label: "Biochimie",
    value: "BIOCHIMIE",
    exams: ["PH gastrique", "Glycémie en mg/dl"]
  },
  {
    label: "Autres",
    value: "AUTRES",
    exams: []
  }
];

const navigationItems = [
  { name: 'Vue d\'ensemble', href: '/laborantin', icon: (
    <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" /></svg>
  ) },
  { name: 'Patients & Examens', href: '/laborantin/patients', icon: (
    <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  ) },
];

function LaborantinOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/exams/stats');
        setStats(response.data);
      } catch (err: any) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(err.response?.data?.error || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord Laborantin</h1>
      <p className="text-gray-600 mb-6">Bienvenue sur votre espace laborantin. Consultez les patients, saisissez et visualisez les examens.</p>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          <p className="font-medium">Erreur de chargement :</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Chargement des statistiques...</p>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Statistiques aujourd'hui */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Aujourd'hui</h3>
                <p className="text-sm text-gray-600">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Examens réalisés</span>
                <span className="text-2xl font-bold text-blue-600">{stats.today.exams}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Patients consultés</span>
                <span className="text-2xl font-bold text-green-600">{stats.today.patients}</span>
              </div>
            </div>
          </div>

          {/* Statistiques ce mois */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Ce mois</h3>
                <p className="text-sm text-gray-600">{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Examens réalisés</span>
                <span className="text-2xl font-bold text-green-600">{stats.thisMonth.exams}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Patients consultés</span>
                <span className="text-2xl font-bold text-blue-600">{stats.thisMonth.patients}</span>
              </div>
            </div>
          </div>

          {/* Statistiques mois passé */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Mois passé</h3>
                <p className="text-sm text-gray-600">
                  {new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Examens réalisés</span>
                <span className="text-2xl font-bold text-purple-600">{stats.lastMonth.exams}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Patients consultés</span>
                <span className="text-2xl font-bold text-purple-600">{stats.lastMonth.patients}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Aucune donnée disponible
        </div>
      )}
    </div>
  );
}

function PatientsExamens() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Formulaire ajout examen
  const [service, setService] = useState('');
  const [exam, setExam] = useState('');
  const [result, setResult] = useState('');
  const [addingExam, setAddingExam] = useState(false);
  const [autoSelectedExam, setAutoSelectedExam] = useState<any>(null);

  // Charger la liste des patients
  useEffect(() => {
    setLoading(true);
    axios.get('/api/patients')
      .then(res => setPatients(res.data.patients))
      .catch(() => setError('Erreur lors du chargement des patients'))
      .finally(() => setLoading(false));
  }, []);

  // Filtrer les patients selon le terme de recherche
  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.lastName?.toLowerCase().includes(searchLower) ||
      patient.firstName?.toLowerCase().includes(searchLower) ||
      patient.folderNumber?.toLowerCase().includes(searchLower)
    );
  });

  // Charger les examens du patient sélectionné
  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setLoading(true);
    
    // Charger l'historique complet des examens
    axios.get(`/api/exams/history/${patient.id}`)
    .then(res => {
      const allExams = res.data.exams;
      setExams(allExams);
      
      // Chercher l'examen le plus récent programmé (aujourd'hui ou le plus récent)
      const today = new Date().toISOString().slice(0, 10);
      let selectedExam = null;
      
      // Filtrer les examens programmés
      const scheduledExams = allExams.filter((e: any) => e.status === 'scheduled');
      
      if (scheduledExams.length > 0) {
        // D'abord chercher un examen d'aujourd'hui
        selectedExam = scheduledExams.find((e: any) => 
          e.date?.slice(0, 10) === today
        );
        
        // Si pas d'examen aujourd'hui, prendre le plus récent
        if (!selectedExam) {
          selectedExam = scheduledExams[0]; // Le plus récent (trié par date desc)
        }
      }
      
      if (selectedExam) {
        console.log('Examen programmé trouvé:', selectedExam);
        // Auto-sélectionner le service et l'examen
        const examName = selectedExam.examType?.name;
        if (examName) {
          // Trouver le service correspondant
          const foundService = SERVICES.find(s => 
            s.exams.includes(examName)
          );
          if (foundService) {
            setService(foundService.value);
            setExam(examName);
            setAutoSelectedExam(selectedExam); // Set the auto-selected exam
          } else {
            // Si pas trouvé dans les services prédéfinis, mettre dans "Autres"
            setService('AUTRES');
            setExam(examName);
            setAutoSelectedExam(selectedExam); // Set the auto-selected exam
          }
        }
      } else {
        // Si pas d'examen programmé, réinitialiser
        setService('');
        setExam('');
        setAutoSelectedExam(null); // Clear auto-selected exam
      }
    })
      .catch(() => setError('Erreur lors du chargement des examens'))
      .finally(() => setLoading(false));
  };

  // Ajouter un examen
  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setAddingExam(true);
    setError(null);
    try {
      // Si un examen est auto-sélectionné, le marquer comme réalisé
      if (autoSelectedExam) {
        console.log('🔍 Marquage de l\'examen comme réalisé:', autoSelectedExam);
        console.log('🔍 ID de l\'examen:', autoSelectedExam.id);
        console.log('🔍 Résultat à ajouter:', result);
        
        const response = await axios.patch(`/api/exams/${autoSelectedExam.id}/complete`, {
          results: result
        });
        
        console.log('✅ Réponse du serveur:', response.data);
        
        // Rafraîchir l'historique complet des examens
        const historyRes = await axios.get(`/api/exams/history/${selectedPatient.id}`);
        setExams(historyRes.data.exams);
        
        // Réinitialiser seulement le formulaire, pas l'autoSelectedExam
        setService('');
        setExam('');
        setResult('');
        // Ne pas réinitialiser setAutoSelectedExam(null) pour garder l'historique
      } else {
        // Logique pour les examens manuels (hospitalisés/maternité)
      let examName = exam;
        let examTypeId = null;
        
      if (service === 'AUTRES' && !examName) {
        setError('Veuillez saisir le nom de l\'examen');
        setAddingExam(false);
        return;
      }
        
      // Créer le type d'examen à la volée si "Autres"
      if (service === 'AUTRES') {
        // Créer le type d'examen dans la base
        const res = await axios.post('/api/exams/types', { name: examName, price: 0 });
        examTypeId = res.data.examType.id;
      } else {
        // Chercher l'id du type d'examen existant
        const allTypes = await axios.get('/api/exams');
        const found = allTypes.data.examTypes.find((et: any) => et.name === examName);
        if (!found) {
          setError('Type d\'examen non trouvé');
          setAddingExam(false);
          return;
        }
        examTypeId = found.id;
      }
        
        // Créer l'examen directement comme réalisé (pour les hospitalisés/maternité)
        const examResponse = await axios.post('/api/exams', {
        patientId: selectedPatient.id,
        examTypeId,
        date: new Date().toISOString(),
        results: result
      });
        
        // Marquer immédiatement comme réalisé
        if (examResponse.data.exam) {
          await axios.patch(`/api/exams/${examResponse.data.exam.id}/complete`, {
            results: result
          });
        }
        
        // Rafraîchir l'historique complet des examens
        const historyRes = await axios.get(`/api/exams/history/${selectedPatient.id}`);
        setExams(historyRes.data.exams);
      setService('');
      setExam('');
      setResult('');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'examen:', error);
      setError(error.response?.data?.error || 'Erreur lors de l\'ajout de l\'examen');
    } finally {
      setAddingExam(false);
    }
  };

  const selectedService = SERVICES.find(s => s.value === service);

  const [resultInputs, setResultInputs] = useState<{ [examId: number]: string }>({});
  const [markingExamId, setMarkingExamId] = useState<number | null>(null);

  // Quand on charge les examens, on réinitialise les champs résultat
  useEffect(() => {
    if (exams.length > 0) {
      const initial: { [examId: number]: string } = {};
      exams.forEach(e => {
        if (e.status === 'scheduled') initial[e.id] = '';
      });
      setResultInputs(initial);
    }
  }, [exams]);

  // Fonction pour marquer un examen comme réalisé
  const handleMarkAsCompleted = async (exam: any) => {
    setMarkingExamId(exam.id);
    try {
      await axios.patch(`/api/exams/${exam.id}/complete`, {
        results: resultInputs[exam.id]
      });
      // Rafraîchir l'historique complet
      const historyRes = await axios.get(`/api/exams/history/${selectedPatient.id}`);
      setExams(historyRes.data.exams);
      // Réinitialiser le champ résultat de cet examen
      setResultInputs(prev => ({ ...prev, [exam.id]: '' }));
      
      // Vérifier s'il reste des examens programmés
      const remainingScheduled = historyRes.data.exams.filter((e: any) => e.status === 'scheduled');
      if (remainingScheduled.length === 0) {
        // Plus d'examens programmés, réactiver le formulaire
        setAutoSelectedExam(null);
        setService('');
        setExam('');
        setResult('');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors de la validation de l\'examen');
    } finally {
      setMarkingExamId(null);
    }
  };

  // Fonction pour vérifier s'il y a des examens programmés
  const hasScheduledExams = exams.some((e: any) => e.status === 'scheduled');
  
  // Le formulaire est activé si : pas d'examen auto-sélectionné OU pas d'examens programmés
  const isFormEnabled = !autoSelectedExam || !hasScheduledExams;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Espace Laborantin</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="flex gap-8">
        {/* Liste des patients */}
        <div className="w-1/3">
          <h2 className="font-semibold mb-2">Liste des patients</h2>
          
          {/* Barre de recherche et filtres */}
          <div className="mb-4 space-y-3">
            {/* Recherche */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou dossier..."
                className="input-field flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <button
                onClick={() => setSearchTerm('')}
                className="btn-secondary px-3"
                title="Réinitialiser la recherche"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            {/* Indicateur de résultats */}
            {searchTerm && (
              <div className="text-sm text-gray-600">
                {filteredPatients.length} patient(s) trouvé(s)
                {patients.length !== filteredPatients.length && ` sur ${patients.length} total`}
              </div>
            )}
          </div>

          {loading && <div>Chargement...</div>}
          <div className="max-h-96 overflow-y-auto border rounded">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Chargement...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
              </div>
            ) : (
              filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedPatient?.id === patient.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                      <div className="text-sm text-gray-600">
                        Dossier: {patient.folderNumber}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full ${
                        patient.gender === 'M' || patient.gender === 'Masculin' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {patient.gender === 'M' || patient.gender === 'Masculin' ? 'Homme' : 
                         patient.gender === 'F' || patient.gender === 'Féminin' ? 'Femme' : 
                         patient.gender || 'Non spécifié'}
                      </span>
                      {patient.weight && (
                        <span className="text-gray-400">
                          {patient.weight} kg
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Examens du patient sélectionné + formulaire */}
        <div className="flex-1">
          {selectedPatient ? (
            <div>
              <h2 className="font-semibold text-lg mb-2">Examens de {selectedPatient.lastName} {selectedPatient.firstName}</h2>
              <div className="mb-4">
                <span className="text-sm text-gray-600">Sexe : {selectedPatient.gender} | Date de naissance : {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</span>
              </div>
              {/* Formulaire ajout examen */}
              <form className="mb-6 p-4 bg-blue-50 rounded" onSubmit={handleAddExam}>
                <h3 className="font-semibold mb-2">
                  {autoSelectedExam ? 'Examen programmé à la caisse' : 'Ajouter un examen labo'}
                </h3>
                
                {/* Affichage de l'examen auto-sélectionné */}
                {autoSelectedExam && (
                  <div className="mb-3 p-3 bg-green-100 rounded border-l-4 border-green-400">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="text-sm font-medium text-green-800">Examen sélectionné à la caisse :</span>
                        <div className="text-sm text-green-700 mt-1">
                          {autoSelectedExam.examType?.name || 'Examen inconnu'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Message informatif quand tous les examens programmés sont réalisés */}
                {!hasScheduledExams && exams.length > 0 && (
                  <div className="mb-3 p-3 bg-blue-100 rounded border-l-4 border-blue-400">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-blue-800">
                        <strong>Tous les examens programmés sont réalisés.</strong> Vous pouvez ajouter d'autres examens si nécessaire.
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Sélection du service (activée si pas d'auto-sélection ou tous les examens programmés sont réalisés) */}
                <div className="mb-2">
                  <label className="block text-sm mb-1">Service</label>
                  <select
                    className="input-field"
                    value={service}
                    onChange={e => { setService(e.target.value); setExam(''); setAutoSelectedExam(null); }}
                    required
                    disabled={!isFormEnabled}
                  >
                    <option value="">Sélectionner un service...</option>
                    {SERVICES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                
                {/* Sélection de l'examen (activée si pas d'auto-sélection ou tous les examens programmés sont réalisés) */}
                {service && service !== 'AUTRES' && (
                  <div className="mb-2">
                    <label className="block text-sm mb-1">Examen</label>
                    <select
                      className="input-field"
                      value={exam}
                      onChange={e => { setExam(e.target.value); setAutoSelectedExam(null); }}
                      required
                      disabled={!isFormEnabled}
                    >
                      <option value="">Sélectionner un examen...</option>
                      {selectedService?.exams.map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Saisie manuelle pour "Autres" (activée si pas d'auto-sélection ou tous les examens programmés sont réalisés) */}
                {service === 'AUTRES' && (
                  <div className="mb-2">
                    <label className="block text-sm mb-1">Nom de l'examen</label>
                    <input
                      type="text"
                      className="input-field"
                      value={exam}
                      onChange={e => { setExam(e.target.value); setAutoSelectedExam(null); }}
                      placeholder="Saisir le nom de l'examen"
                      required
                      disabled={!isFormEnabled}
                    />
                  </div>
                )}
                
                {/* Champ résultat */}
                {service && (
                  <div className="mb-2">
                    <label className="block text-sm mb-1">Résultat</label>
                    <textarea
                      className="input-field"
                      value={result}
                      onChange={e => setResult(e.target.value)}
                      placeholder="Rédiger le résultat de l'examen"
                      required
                    />
                  </div>
                )}
                
                <button type="submit" className="btn-primary mt-2" disabled={addingExam || (!autoSelectedExam && !service)}>
                  {addingExam ? 'Traitement...' : autoSelectedExam ? 'Marquer comme réalisé' : 'Ajouter l\'examen'}
                </button>
                
                {/* Message informatif */}
                {autoSelectedExam && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-blue-800">
                        <strong>Examen programmé détecté :</strong> {autoSelectedExam.examType?.name}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1 ml-6">
                      Ajoutez le résultat et cliquez sur "Marquer comme réalisé" pour finaliser l'examen.
                    </p>
                  </div>
                )}
              </form>
              <div className="mb-4">
                <h3 className="font-semibold mb-3">Historique des examens</h3>
                {exams.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">Aucun examen pour ce patient.</div>
                ) : (
                  <div className="space-y-3">
                    {exams.map((e: any) => {
                      const isCompleted = e.status === 'completed';
                      const isScheduled = e.status === 'scheduled';
                      
                      return (
                        <div key={e.id} className={`bg-white p-4 rounded-lg border shadow-sm ${isCompleted ? 'border-green-200' : 'border-yellow-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {isCompleted ? (
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              <span className="font-medium text-gray-900">{e.examType?.name || 'Examen'}</span>
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isCompleted ? 'Réalisé' : 'Programmé'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              <div>le {new Date(e.date).toLocaleDateString('fr-FR')}</div>
                              <div>à {new Date(e.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>
                          {/* Si programmé, afficher champ résultat + bouton */}
                          {isScheduled && (
                            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center mt-2">
                              <textarea
                                className="input-field flex-1"
                                placeholder="Résultat de l'examen"
                                value={resultInputs[e.id] || ''}
                                onChange={ev => setResultInputs(prev => ({ ...prev, [e.id]: ev.target.value }))}
                              />
                              <button
                                className="btn-primary"
                                disabled={markingExamId === e.id || !resultInputs[e.id]}
                                onClick={() => handleMarkAsCompleted(e)}
                              >
                                {markingExamId === e.id ? 'Traitement...' : 'Marquer comme réalisé'}
                              </button>
                            </div>
                          )}
                          {/* Affichage du résultat si existant */}
                          {e.results && (
                            <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-400">
                              <div className="flex items-center mb-1">
                                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <strong className="text-blue-800 text-sm">Résultat :</strong>
                              </div>
                              <div className="text-sm text-gray-700 ml-6 whitespace-pre-wrap">{e.results}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                      </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Sélectionnez un patient pour voir ses examens.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const LaborantinDashboard: React.FC = () => {
  return (
    <Layout title="Laborantin" navigationItems={navigationItems}>
      <GlobalErrorBoundary>
        <Routes>
          <Route path="/" element={<LaborantinOverview />} />
          <Route path="/patients" element={<PatientsExamens />} />
        </Routes>
      </GlobalErrorBoundary>
    </Layout>
  );
};

export default LaborantinDashboard; 