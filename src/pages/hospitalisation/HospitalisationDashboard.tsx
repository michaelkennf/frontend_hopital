import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GlobalErrorBoundary } from '../../components/GlobalErrorBoundary';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import Settings from '../admin/Settings';
import PatientsManagementHospitalisation from './PatientsManagementHospitalisation';
import ExamsListHospitalisation from './ExamsListHospitalisation';
import MedicationsListHospitalisation from './MedicationsListHospitalisation';

const ROOM_TYPES = [
  'Chambre simple',
  'Chambre double',
  'Chambre VIP',
  'Salle commune'
];

const HospitalisationDashboard: React.FC = () => {
  const [hospitalizations, setHospitalizations] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulaire ajout hospitalisation
  const [form, setForm] = useState({ patientId: '', roomType: '', days: '', price: '' });
  const [adding, setAdding] = useState(false);
  const [roomTypeSearch, setRoomTypeSearch] = useState('');

  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [examForms, setExamForms] = useState<{ [hospId: number]: { examTypeId: string; result: string; loading: boolean } }>({});

  const [medications, setMedications] = useState<any[]>([]);
  const [medForms, setMedForms] = useState<{ [hospId: number]: { medicationId: string; quantity: string; date: string; loading: boolean } }>({});

  // Charger la liste des hospitalisations et des patients
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/hospitalizations'),
      axios.get('/api/patients')
    ])
      .then(([hospRes, patRes]) => {
        setHospitalizations(hospRes.data.hospitalizations);
        setPatients(patRes.data.patients);
      })
      .catch(() => setError('Erreur lors du chargement des données'))
      .finally(() => setLoading(false));
  }, []);

  // Charger la liste des types d'examen au montage
  useEffect(() => {
    axios.get('/api/exams')
      .then(res => setExamTypes(res.data.examTypes))
      .catch(() => setError('Erreur lors du chargement des types d\'examen'));
  }, []);

  // Charger la liste des médicaments au montage
  useEffect(() => {
    axios.get('/api/medications')
      .then(res => setMedications(res.data.medications))
      .catch(() => setError('Erreur lors du chargement des médicaments'));
  }, []);

  // Ajouter une hospitalisation
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      await axios.post('/api/hospitalizations', {
        patientId: form.patientId,
        roomType: form.roomType,
        days: form.days,
        price: form.price
      });
      // Rafraîchir la liste
      const hospRes = await axios.get('/api/hospitalizations');
      setHospitalizations(hospRes.data.hospitalizations);
      setForm({ patientId: '', roomType: '', days: '', price: '' });
    } catch {
      setError("Erreur lors de l'enregistrement de l'hospitalisation");
    } finally {
      setAdding(false);
    }
  };

  // Gérer la saisie du formulaire d'examen pour chaque hospitalisation
  const handleExamFormChange = (hospId: number, field: string, value: string) => {
    setExamForms(forms => ({
      ...forms,
      [hospId]: {
        ...forms[hospId],
        [field]: value
      }
    }));
  };

  // Ajouter un examen à une hospitalisation
  const handleAddExam = async (hospId: number, patientId: number, e: React.FormEvent) => {
    e.preventDefault();
    const form = examForms[hospId];
    if (!form || !form.examTypeId) return;
    setExamForms(forms => ({ ...forms, [hospId]: { ...form, loading: true } }));
    setError(null);
    try {
      await axios.post('/api/exams', {
        patientId,
        examTypeId: form.examTypeId,
        date: new Date().toISOString(),
        results: form.result
      });
      // Pas de rafraîchissement automatique ici, à faire si besoin
      setExamForms(forms => ({ ...forms, [hospId]: { examTypeId: '', result: '', loading: false } }));
    } catch {
      setError("Erreur lors de l'ajout de l'examen");
      setExamForms(forms => ({ ...forms, [hospId]: { ...form, loading: false } }));
    }
  };

  // Gérer la saisie du formulaire de médicament pour chaque hospitalisation
  const handleMedFormChange = (hospId: number, field: string, value: string) => {
    setMedForms(forms => ({
      ...forms,
      [hospId]: {
        ...forms[hospId],
        [field]: value
      }
    }));
  };

  // Ajouter une consommation de médicament à une hospitalisation
  const handleAddMed = async (hospId: number, patientId: number, e: React.FormEvent) => {
    e.preventDefault();
    const form = medForms[hospId];
    if (!form || !form.medicationId || !form.quantity) return;
    setMedForms(forms => ({ ...forms, [hospId]: { ...form, loading: true } }));
    setError(null);
    try {
      await axios.post('/api/medications/sales', {
        patientId,
        medicationId: form.medicationId,
        quantity: form.quantity,
        date: form.date || new Date().toISOString()
      });
      setMedForms(forms => ({ ...forms, [hospId]: { medicationId: '', quantity: '', date: '', loading: false } }));
    } catch {
      setError("Erreur lors de l'ajout de la consommation de médicament");
      setMedForms(forms => ({ ...forms, [hospId]: { ...form, loading: false } }));
    }
  };

  const navigationItems = [
    { name: 'Vue d\'ensemble', href: '/hospitalisation', icon: (
      <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" /></svg>
    ) },
    { name: 'Patients', href: '/hospitalisation/patients', icon: (
      <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    ) },
    { name: 'Examens', href: '/hospitalisation/exams', icon: (
      <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
    ) },
    { name: 'Médicaments', href: '/hospitalisation/medications', icon: (
      <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
    ) },
    { name: 'Hospitalisations', href: '/hospitalisation/hospitalisations', icon: (
      <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    ) },
  ];

  function HospitalisationOverview() {
    const [stats, setStats] = useState({ total: 0, today: 0, lastMonth: 0, loading: true });
    useEffect(() => {
      const fetchStats = async () => {
        setStats(s => ({ ...s, loading: true }));
        try {
          const res = await axios.get('/api/hospitalizations');
          const all = res.data.hospitalizations.filter((h: any) => h.roomType && h.roomType.toLowerCase().includes('hospitalisation'));
          const today = new Date();
          const todayStr = today.toISOString().slice(0, 10);
          const thisMonth = today.getMonth();
          const thisYear = today.getFullYear();
          // Mois passé
          const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonth = lastMonthDate.getMonth();
          const lastMonthYear = lastMonthDate.getFullYear();
          setStats({
            total: all.length,
            today: all.filter((h: any) => h.startDate && h.startDate.slice(0, 10) === todayStr).length,
            lastMonth: all.filter((h: any) => {
              if (!h.startDate) return false;
              const d = new Date(h.startDate);
              return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
            }).length,
            loading: false
          });
        } catch {
          setStats({ total: 0, today: 0, lastMonth: 0, loading: false });
        }
      };
      fetchStats();
    }, []);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Hospitalisation</h1>
          <p className="mt-1 text-sm text-gray-500">Vue d'ensemble dynamique de l'hospitalisation</p>
        </div>
        {stats.loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total patients hospitalisés</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /></svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Hospitalisés aujourd'hui</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.today}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Hospitalisés mois passé</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.lastMonth}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function Hospitalisations() {
    const [exitLoading, setExitLoading] = useState<number | null>(null);
    const [exitError, setExitError] = useState<string | null>(null);
    const handleExit = async (hospId: number) => {
      setExitLoading(hospId);
      setExitError(null);
      try {
        await axios.patch(`/api/hospitalizations/${hospId}/exit`);
        // Rafraîchir la liste
        const hospRes = await axios.get('/api/hospitalizations');
        setHospitalizations(hospRes.data.hospitalizations);
      } catch (e: any) {
        setExitError(e.response?.data?.error || 'Erreur lors de la sortie du patient');
      } finally {
        setExitLoading(null);
      }
    };

    const [showExitModal, setShowExitModal] = useState<{ open: boolean, hosp: any | null }>({ open: false, hosp: null });
    const [exitDays, setExitDays] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const handleOpenExitModal = (hosp: any) => {
      setExitDays(hosp.days?.toString() || '');
      setShowExitModal({ open: true, hosp });
      setModalError(null);
    };
    const handleExitSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!showExitModal.hosp) return;
      setModalLoading(true);
      setModalError(null);
      try {
        await axios.patch(`/api/hospitalizations/${showExitModal.hosp.id}/exit`, { days: exitDays });
        setShowExitModal({ open: false, hosp: null });
        const hospRes = await axios.get('/api/hospitalizations');
        setHospitalizations(hospRes.data.hospitalizations);
      } catch (e: any) {
        setModalError(e.response?.data?.error || 'Erreur lors de la sortie');
      } finally {
        setModalLoading(false);
      }
    };

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Espace Agent Hospitalisation</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {exitError && <div className="mb-4 text-red-600">{exitError}</div>}
        <div className="flex gap-8">
          {/* Liste des hospitalisations */}
          <div className="w-full">
            <h2 className="font-semibold mb-2">Patients hospitalisés</h2>
            {loading && <div>Chargement...</div>}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Dossier</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chambre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jours</th>
                  {/* Prix masqué pour l'interface hospitalisation */}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hospitalizations.filter((h: any) => h.roomType && h.roomType.toLowerCase().includes('hospitalisation')).map((h) => (
                  <tr key={h.id}>
                    <td className="px-4 py-2 font-medium">{h.patient.lastName}</td>
                    <td className="px-4 py-2">{h.patient.firstName}</td>
                    <td className="px-4 py-2 font-mono text-sm">{h.patient.folderNumber}</td>
                    <td className="px-4 py-2">{h.roomType}</td>
                    <td className="px-4 py-2">{h.days}</td>
                    {/* Prix masqué pour l'interface hospitalisation */}
                    <td className="px-4 py-2">
                      {h.endDate ? (
                        <span className="text-green-600 font-semibold">Sorti</span>
                      ) : (
                        <button className="btn-primary btn-xs" onClick={() => handleOpenExitModal(h)}>
                          Sortie
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showExitModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Sortie de l'hospitalisation</h2>
              <form onSubmit={handleExitSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de jours passés</label>
                  <input type="number" min="1" value={exitDays} onChange={e => setExitDays(e.target.value)} required className="input-field" />
                </div>
                {modalError && <div className="text-red-600 text-sm mt-2">{modalError}</div>}
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-secondary" onClick={() => setShowExitModal({ open: false, hosp: null })}>Annuler</button>
                  <button type="submit" className="btn-primary" disabled={modalLoading}>{modalLoading ? 'Enregistrement...' : 'Valider'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Layout title="Agent Hospitalisation" navigationItems={navigationItems} settingsPath="/hospitalisation/settings">
      <GlobalErrorBoundary>
        <Routes>
          <Route path="/" element={<HospitalisationOverview />} />
          <Route path="/patients" element={<PatientsManagementHospitalisation />} />
          <Route path="/exams" element={<ExamsListHospitalisation />} />
          <Route path="/medications" element={<MedicationsListHospitalisation />} />
          <Route path="/hospitalisations" element={<Hospitalisations />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </GlobalErrorBoundary>
    </Layout>
  );
};

export default HospitalisationDashboard; 