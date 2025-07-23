import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GlobalErrorBoundary } from '../../components/GlobalErrorBoundary';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import Settings from '../admin/Settings';

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
  { name: 'Paramètres', href: '/laborantin/settings', icon: (
    <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
  ) },
];

function LaborantinOverview() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord Laborantin</h1>
      <p className="text-gray-600 mb-6">Bienvenue sur votre espace laborantin. Consultez les patients, saisissez et visualisez les examens.</p>
    </div>
  );
}

function PatientsExamens() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulaire ajout examen
  const [service, setService] = useState('');
  const [exam, setExam] = useState('');
  const [result, setResult] = useState('');
  const [addingExam, setAddingExam] = useState(false);

  // Charger la liste des patients
  useEffect(() => {
    setLoading(true);
    axios.get('/api/patients')
      .then(res => setPatients(res.data.patients))
      .catch(() => setError('Erreur lors du chargement des patients'))
      .finally(() => setLoading(false));
  }, []);

  // Charger les examens du patient sélectionné
  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setLoading(true);
    axios.get(`/api/exams/realized?patientId=${patient.id}`)
      .then(res => setExams(res.data.exams))
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
      let examName = exam;
      // Si "Autres", l'utilisateur doit saisir le nom de l'examen
      if (service === 'AUTRES' && !examName) {
        setError('Veuillez saisir le nom de l\'examen');
        setAddingExam(false);
        return;
      }
      // Créer le type d'examen à la volée si "Autres"
      let examTypeId = null;
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
      await axios.post('/api/exams', {
        patientId: selectedPatient.id,
        examTypeId,
        date: new Date().toISOString(),
        results: result
      });
      // Rafraîchir la liste des examens
      const examsRes = await axios.get(`/api/exams/realized?patientId=${selectedPatient.id}`);
      setExams(examsRes.data.exams);
      setService('');
      setExam('');
      setResult('');
    } catch {
      setError('Erreur lors de l\'ajout de l\'examen');
    } finally {
      setAddingExam(false);
    }
  };

  const selectedService = SERVICES.find(s => s.value === service);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Espace Laborantin</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="flex gap-8">
        {/* Liste des patients */}
        <div className="w-1/3">
          <h2 className="font-semibold mb-2">Liste des patients</h2>
          {loading && <div>Chargement...</div>}
          <ul className="divide-y border rounded bg-white">
            {patients.map((p) => (
              <li key={p.id} className={`p-2 cursor-pointer hover:bg-blue-50 ${selectedPatient?.id === p.id ? 'bg-blue-100' : ''}`}
                  onClick={() => handleSelectPatient(p)}>
                <span className="font-medium">{p.lastName} {p.firstName}</span> <span className="text-xs text-gray-500">({p.folderNumber})</span>
              </li>
            ))}
          </ul>
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
                <h3 className="font-semibold mb-2">Ajouter un examen labo</h3>
                <div className="mb-2">
                  <label className="block text-sm mb-1">Service</label>
                  <select
                    className="input-field"
                    value={service}
                    onChange={e => { setService(e.target.value); setExam(''); }}
                    required
                  >
                    <option value="">Sélectionner un service...</option>
                    {SERVICES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                {service && service !== 'AUTRES' && (
                  <div className="mb-2">
                    <label className="block text-sm mb-1">Examen</label>
                    <select
                      className="input-field"
                      value={exam}
                      onChange={e => setExam(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un examen...</option>
                      {selectedService?.exams.map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>
                )}
                {service === 'AUTRES' && (
                  <div className="mb-2">
                    <label className="block text-sm mb-1">Nom de l'examen</label>
                    <input
                      type="text"
                      className="input-field"
                      value={exam}
                      onChange={e => setExam(e.target.value)}
                      placeholder="Saisir le nom de l'examen"
                      required
                    />
                  </div>
                )}
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
                <button type="submit" className="btn-primary mt-2" disabled={addingExam}>
                  {addingExam ? 'Ajout...' : 'Ajouter l\'examen'}
                </button>
              </form>
              <div className="mb-4">
                <h3 className="font-semibold">Examens réalisés</h3>
                <ul className="list-disc ml-6">
                  {exams.map((e: any) => (
                    <li key={e.id} className="mb-2">
                      <div>
                        <span className="font-medium">{e.examType?.name || ''}</span> le {new Date(e.date).toLocaleDateString()}
                      </div>
                      {/* Prix masqué pour l'interface laborantin */}
                      {e.results && <div className="text-sm text-gray-700">Résultat : {e.results}</div>}
                    </li>
                  ))}
                </ul>
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
    <Layout title="Laborantin" navigationItems={navigationItems} settingsPath="/laborantin/settings">
      <GlobalErrorBoundary>
        <Routes>
          <Route path="/" element={<LaborantinOverview />} />
          <Route path="/patients" element={<PatientsExamens />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </GlobalErrorBoundary>
    </Layout>
  );
};

export default LaborantinDashboard; 