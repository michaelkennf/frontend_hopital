import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GlobalErrorBoundary } from '../../components/GlobalErrorBoundary';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import Settings from '../admin/Settings';
import PatientsManagementMaternite from './PatientsManagementMaternite';
import ExamsListMaternite from './ExamsListMaternite';
import MedicationsListMaternite from './MedicationsListMaternite';

const ROOM_TYPES = [
  'Maternité - Chambre simple',
  'Maternité - Chambre double',
  'Maternité - Salle commune'
];

const navigationItems = [
  { name: 'Vue d\'ensemble', href: '/maternite', icon: (
    <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" /></svg>
  ) },
  { name: 'Patients', href: '/maternite/patients', icon: (
    <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  ) },
  { name: 'Examens', href: '/maternite/exams', icon: (
    <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
  ) },
  { name: 'Médicaments', href: '/maternite/medications', icon: (
    <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
  ) },
  { name: 'Hospitalisations', href: '/maternite/hospitalisations', icon: (
    <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  ) },
];

function MaterniteOverview() {
  const [stats, setStats] = useState({ total: 0, today: 0, lastMonth: 0, loading: true });
  useEffect(() => {
    const fetchStats = async () => {
      setStats(s => ({ ...s, loading: true }));
      try {
        const res = await axios.get('/api/hospitalizations');
        const all = res.data.hospitalizations.filter((h: any) => h.roomType && h.roomType.toLowerCase().includes('matern'));
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
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Maternité</h1>
        <p className="mt-1 text-sm text-gray-500">Vue d'ensemble dynamique de la maternité</p>
      </div>
      {stats.loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total patientes hospitalisées</dt>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Hospitalisées aujourd'hui</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.today}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Hospitalisées mois passé</dt>
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
  const [hospitalizations, setHospitalizations] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoomModal, setShowRoomModal] = useState<{ open: boolean, hosp: any | null }>({ open: false, hosp: null });
  const [showExitModal, setShowExitModal] = useState<{ open: boolean, hosp: any | null }>({ open: false, hosp: null });
  const [roomType, setRoomType] = useState('');
  const [exitDays, setExitDays] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitalizations();
  }, []);

  const fetchHospitalizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const hospRes = await axios.get('/api/hospitalizations');
      // Filtrer hospitalisations maternité
      const matHosp = hospRes.data.hospitalizations.filter((h: any) => h.roomType && h.roomType.toLowerCase().includes('matern'));
      setHospitalizations(matHosp);
      // Charger les patientes associées
      const patRes = await axios.get('/api/patients');
      setPatients(patRes.data.patients || []);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur lors du chargement des hospitalisations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoomModal = (hosp: any) => {
    setRoomType(hosp.roomType || '');
    setShowRoomModal({ open: true, hosp });
    setModalError(null);
  };
  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRoomModal.hosp) return;
    setModalLoading(true);
    setModalError(null);
    try {
      await axios.patch(`/api/hospitalizations/${showRoomModal.hosp.id}`, { roomType });
      setShowRoomModal({ open: false, hosp: null });
      fetchHospitalizations();
    } catch (e: any) {
      setModalError(e.response?.data?.error || 'Erreur lors de la modification de la chambre');
    } finally {
      setModalLoading(false);
    }
  };

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
      fetchHospitalizations();
    } catch (e: any) {
      setModalError(e.response?.data?.error || 'Erreur lors de la sortie');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hospitalisations à la maternité</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patiente</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chambre</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jours</th>
              {/* Prix masqué pour l'interface maternité */}
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hospitalizations.map((h: any) => {
              const p = patients.find((pat: any) => pat.id === h.patientId || (h.patient && pat.id === h.patient.id));
              return (
                <tr key={h.id}>
                  <td className="px-4 py-2">{p ? `${p.lastName} ${p.firstName}` : ''}</td>
                  <td className="px-4 py-2">{h.roomType}</td>
                  <td className="px-4 py-2">{h.days || ''}</td>
                  {/* Prix masqué pour l'interface maternité */}
                  <td className="px-4 py-2 flex gap-2">
                    {h.endDate ? (
                      <span className="text-green-600 font-semibold">Sorti</span>
                    ) : (
                      <button className="btn-primary btn-xs" onClick={() => handleOpenExitModal(h)}>
                        Sortie
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Modal chambre */}
      {showRoomModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Choix de la chambre</h2>
            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type de chambre</label>
                <select value={roomType} onChange={e => setRoomType(e.target.value)} required className="input-field">
                  <option value="">Sélectionner</option>
                  <option value="Maternité - Chambre commune">Chambre commune</option>
                  <option value="Maternité - Chambre privée">Chambre privée</option>
                </select>
              </div>
              {modalError && <div className="text-red-600 text-sm mt-2">{modalError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowRoomModal({ open: false, hosp: null })}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={modalLoading}>{modalLoading ? 'Enregistrement...' : 'Valider'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal sortie */}
      {showExitModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Sortie de la maternité</h2>
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

function calculateAge(dateNaissance: string) {
  if (!dateNaissance) return '';
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const MaterniteDashboard: React.FC = () => {
  return (
    <Layout title="Agent Maternité" navigationItems={navigationItems} settingsPath="/maternite/settings">
      <GlobalErrorBoundary>
        <Routes>
          <Route path="/" element={<MaterniteOverview />} />
          <Route path="/patients" element={<PatientsManagementMaternite />} />
          <Route path="/exams" element={<ExamsListMaternite />} />
          <Route path="/medications" element={<MedicationsListMaternite />} />
          <Route path="/hospitalisations" element={<Hospitalisations />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </GlobalErrorBoundary>
    </Layout>
  );
};

export default MaterniteDashboard; 