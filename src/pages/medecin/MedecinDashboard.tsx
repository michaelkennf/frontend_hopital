import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GlobalErrorBoundary } from '../../components/GlobalErrorBoundary';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import Settings from '../admin/Settings';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  folderNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  phone: string;
}

interface Consultation {
  id: number;
  date: string;
  consultation: { id: number; name: string; price: number };
  medications: Treatment[];
  notes?: string; // Added notes to the interface
}

interface Treatment {
  id: number;
  medicationName: string;
  dosage?: string;
  quantity: number;
  notes?: string;
}

interface Exam {
  id: number;
  date: string;
  exam: { id: number; name: string; price: number };
}

const navigationItems = [
  { name: 'Vue d\'ensemble', href: '/medecin', icon: (
    <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" /></svg>
  ) },
  { name: 'Patients & Dossiers', href: '/medecin/patients', icon: (
    <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  ) },
];

function MedecinOverview() {
  const [stats, setStats] = React.useState({
    total: 0,
    today: 0,
    month: 0,
    loading: true,
    error: null as string | null
  });

  React.useEffect(() => {
    setStats(s => ({ ...s, loading: true, error: null }));
    import('axios').then(({ default: axios }) => {
      axios.get('/api/patients')
        .then(res => {
          const patients = res.data.patients || [];
          const now = new Date();
          const todayStr = now.toISOString().slice(0, 10);
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          const total = patients.length;
          const today = patients.filter((p: any) => (p.createdAt || '').slice(0, 10) === todayStr).length;
          const month = patients.filter((p: any) => {
            const created = new Date(p.createdAt);
            return created >= lastMonth && created <= now;
          }).length;
          setStats({ total, today, month, loading: false, error: null });
        })
        .catch(() => setStats(s => ({ ...s, loading: false, error: 'Erreur lors du chargement des statistiques' })));
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble - Médecin</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tableau de bord du médecin de la Polyclinique des Apôtres
        </p>
      </div>
      {stats.error && <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 text-red-700">{stats.error}</div>}
      {stats.loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Patients total */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Patients total</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          {/* Patients du jour */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Patients du jour</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.today}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          {/* Patients du dernier mois */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Patients du dernier mois</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.month}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PatientsDossiers() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultationTypes, setConsultationTypes] = useState<any[]>([]);
  const [newConsultation, setNewConsultation] = useState({ typeId: '', notes: '' });
  const [addingConsultation, setAddingConsultation] = useState(false);
  const [treatmentForms, setTreatmentForms] = useState<{ [consultationId: number]: { medicationName: string; dosage: string; quantity: string; notes: string; loading: boolean } }>({});

  // Charger la liste des patients au montage
  useEffect(() => {
    setLoading(true);
    axios.get('/api/patients')
      .then(res => setPatients(res.data.patients))
      .catch(() => setError('Erreur lors du chargement des patients'))
      .finally(() => setLoading(false));
  }, []);

  // Charger le dossier du patient sélectionné
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setLoading(true);
    axios.get(`/api/patients/${patient.id}/dossier`)
      .then(res => setDossier(res.data))
      .catch(() => setError('Erreur lors du chargement du dossier patient'))
      .finally(() => setLoading(false));
  };

  // Charger les types de consultation quand un patient est sélectionné
  useEffect(() => {
    if (selectedPatient) {
      axios.get('/api/consultations/types')
        .then(res => setConsultationTypes(res.data.consultationTypes))
        .catch(() => setError('Erreur lors du chargement des types de consultation'));
    }
  }, [selectedPatient]);

  // Ajouter une nouvelle consultation
  const handleAddConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setAddingConsultation(true);
    setError(null);
    try {
      const res = await axios.post('/api/consultations', {
        patientId: selectedPatient.id,
        consultationTypeId: newConsultation.typeId,
        date: new Date().toISOString(),
        notes: newConsultation.notes
      });
      // Rafraîchir le dossier
      const dossierRes = await axios.get(`/api/patients/${selectedPatient.id}/dossier`);
      setDossier(dossierRes.data);
      setNewConsultation({ typeId: '', notes: '' });
    } catch {
      setError('Erreur lors de l\'ajout de la consultation');
    } finally {
      setAddingConsultation(false);
    }
  };

  // Gérer la saisie du formulaire de traitement pour chaque consultation
  const handleTreatmentChange = (consultationId: number, field: string, value: string) => {
    setTreatmentForms(forms => ({
      ...forms,
      [consultationId]: {
        ...forms[consultationId],
        [field]: value
      }
    }));
  };

  // Ajouter un traitement à une consultation
  const handleAddTreatment = async (consultationId: number, e: React.FormEvent) => {
    e.preventDefault();
    const form = treatmentForms[consultationId];
    if (!form || !form.medicationName || !form.quantity) return;
    setTreatmentForms(forms => ({ ...forms, [consultationId]: { ...form, loading: true } }));
    setError(null);
    try {
      await axios.post(`/api/consultations/${consultationId}/treatments`, {
        medicationName: form.medicationName,
        dosage: form.dosage,
        quantity: form.quantity,
        notes: form.notes
      });
      // Rafraîchir le dossier
      if (selectedPatient) {
        const dossierRes = await axios.get(`/api/patients/${selectedPatient.id}/dossier`);
        setDossier(dossierRes.data);
      }
      setTreatmentForms(forms => ({ ...forms, [consultationId]: { medicationName: '', dosage: '', quantity: '', notes: '', loading: false } }));
    } catch {
      setError("Erreur lors de l'ajout du traitement");
      setTreatmentForms(forms => ({ ...forms, [consultationId]: { ...form, loading: false } }));
    }
  };

  // DEBUG : log structure du dossier
  console.log('dossier', dossier);
  console.log('dossier.consultations', dossier?.consultations);
  console.log('dossier.exams', dossier?.exams);

  return (
    <div className="p-6">
      <h2 className="font-semibold text-lg mb-2">Liste des patients</h2>
      {loading && <div>Chargement...</div>}
      <ul className="divide-y border rounded bg-white">
        {(patients ?? []).map((p) => (
          <li key={p.id} className={`p-2 cursor-pointer hover:bg-blue-50 ${selectedPatient?.id === p.id ? 'bg-blue-100' : ''}`}
              onClick={() => handleSelectPatient(p)}>
            <span className="font-medium">{p.lastName} {p.firstName}</span> <span className="text-xs text-gray-500">({p.folderNumber})</span>
          </li>
        ))}
      </ul>
      {selectedPatient && dossier ? (
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">Dossier de {selectedPatient.lastName} {selectedPatient.firstName}</h2>
          <div className="mb-4">
            <span className="text-sm text-gray-600">Sexe : {selectedPatient.gender} | Date de naissance : {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</span>
          </div>
          {/* Formulaire ajout consultation */}
          <form className="mb-6 p-4 bg-blue-50 rounded" onSubmit={handleAddConsultation}>
            <h3 className="font-semibold mb-2">Ajouter une consultation</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">Type de consultation</label>
              <select
                className="input-field"
                value={newConsultation.typeId}
                onChange={e => setNewConsultation(c => ({ ...c, typeId: e.target.value }))}
                required
              >
                <option value="">Sélectionner...</option>
                {(consultationTypes ?? []).map((ct: any) => (
                  <option key={ct.id} value={ct.id}>{ct.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Signes / maladie</label>
              <textarea
                className="input-field"
                value={newConsultation.notes}
                onChange={e => setNewConsultation(c => ({ ...c, notes: e.target.value }))}
                placeholder="Décrire les signes ou la maladie du patient"
                required
              />
            </div>
            <button type="submit" className="btn-primary mt-2" disabled={addingConsultation}>
              {addingConsultation ? 'Ajout...' : 'Ajouter la consultation'}
            </button>
          </form>
          <div className="mb-4">
            <h3 className="font-semibold">Consultations & traitements</h3>
            <ul className="list-disc ml-6">
              {(dossier?.consultations ?? []).map((c: Consultation) => (
                <li key={c.id} className="mb-2">
                  <div>
                    <span className="font-medium">{c.consultation.name}</span> le {new Date(c.date).toLocaleDateString()}
                    {c.notes && (
                      <div className="text-sm text-gray-600">Signes : {c.notes}</div>
                    )}
                  </div>
                  {c.medications && c.medications.length > 0 && (
                    <ul className="ml-4 text-sm text-gray-700">
                      {(c.medications ?? []).map((m: Treatment) => (
                        <li key={m.id}>Traitement : {m.medicationName} {m.dosage && `- ${m.dosage}`} (x{m.quantity}) {m.notes && `- ${m.notes}`}</li>
                      ))}
                    </ul>
                  )}
                  {/* Formulaire ajout traitement */}
                  <form className="mt-2 ml-4 p-2 bg-gray-50 rounded" onSubmit={e => handleAddTreatment(c.id, e)}>
                    <div className="flex gap-2 mb-1">
                      <input
                        type="text"
                        className="input-field flex-1"
                        placeholder="Médicament prescrit"
                        value={treatmentForms[c.id]?.medicationName || ''}
                        onChange={e => handleTreatmentChange(c.id, 'medicationName', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="input-field w-24"
                        placeholder="Dosage"
                        value={treatmentForms[c.id]?.dosage || ''}
                        onChange={e => handleTreatmentChange(c.id, 'dosage', e.target.value)}
                      />
                      <input
                        type="number"
                        className="input-field w-20"
                        placeholder="Qté"
                        min="1"
                        value={treatmentForms[c.id]?.quantity || ''}
                        onChange={e => handleTreatmentChange(c.id, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <input
                      type="text"
                      className="input-field mb-1"
                      placeholder="Notes (optionnel)"
                      value={treatmentForms[c.id]?.notes || ''}
                      onChange={e => handleTreatmentChange(c.id, 'notes', e.target.value)}
                    />
                    <button type="submit" className="btn-primary btn-xs" disabled={treatmentForms[c.id]?.loading}>
                      {treatmentForms[c.id]?.loading ? 'Ajout...' : 'Ajouter traitement'}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold">Examens réalisés</h3>
            <ul className="list-disc ml-6">
              {(dossier?.exams ?? []).map((e: Exam) => (
                <li key={e.id}>{e.exam.name} le {new Date(e.date).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Sélectionnez un patient pour voir son dossier.</div>
      )}
    </div>
  );
}

const MedecinDashboard: React.FC = () => {
  return (
    <Layout title="Médecin" navigationItems={navigationItems} settingsPath="/medecin/settings">
      <GlobalErrorBoundary>
        <Routes>
          <Route path="/" element={<MedecinOverview />} />
          <Route path="/patients" element={<PatientsDossiers />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </GlobalErrorBoundary>
    </Layout>
  );
};

export default MedecinDashboard; 