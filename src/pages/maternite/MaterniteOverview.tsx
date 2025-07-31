import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface MaternityStats {
  totalPatients: number;
  todayPatients: number;
  lastMonthPatients: number;
  totalHospitalizations: number;
  todayHospitalizations: number;
  lastMonthHospitalizations: number;
  totalHistory: number;
  todayHistory: number;
  lastMonthHistory: number;
  loading: boolean;
}

const MaterniteOverview: React.FC = () => {
  const [stats, setStats] = useState<MaternityStats>({
    totalPatients: 0,
    todayPatients: 0,
    lastMonthPatients: 0,
    totalHospitalizations: 0,
    todayHospitalizations: 0,
    lastMonthHospitalizations: 0,
    totalHistory: 0,
    todayHistory: 0,
    lastMonthHistory: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      setStats(prev => ({ ...prev, loading: true }));
      try {
        // Récupérer les patients maternité
        const patientsRes = await axios.get('/api/patients?service=maternite');
        const patients = patientsRes.data.patients || [];

        // Récupérer les hospitalisations maternité
        const hospRes = await axios.get('/api/hospitalizations');
        const hospitalizations = hospRes.data.hospitalizations.filter((h: any) => 
          h.roomType && h.roomType.toLowerCase().includes('maternité')
        );

        // Récupérer l'historique maternité
        const historyRes = await axios.get('/api/maternity-history');
        const history = historyRes.data.histories || [];

        // Calculer les dates
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthStr = lastMonth.toISOString().slice(0, 7); // YYYY-MM

        // Filtrer par date
        const todayPatients = patients.filter((p: any) => {
          if (!p.createdAt) return false;
          return p.createdAt.slice(0, 10) === todayStr;
        });

        const lastMonthPatients = patients.filter((p: any) => {
          if (!p.createdAt) return false;
          return p.createdAt.slice(0, 7) === lastMonthStr;
        });

        const todayHospitalizations = hospitalizations.filter((h: any) => {
          if (!h.startDate) return false;
          return h.startDate.slice(0, 10) === todayStr;
        });

        const lastMonthHospitalizations = hospitalizations.filter((h: any) => {
          if (!h.startDate) return false;
          return h.startDate.slice(0, 7) === lastMonthStr;
        });

        const todayHistory = history.filter((h: any) => {
          if (!h.entryDate) return false;
          return h.entryDate.slice(0, 10) === todayStr;
        });

        const lastMonthHistory = history.filter((h: any) => {
          if (!h.entryDate) return false;
          return h.entryDate.slice(0, 7) === lastMonthStr;
        });

        setStats({
          totalPatients: patients.length,
          todayPatients: todayPatients.length,
          lastMonthPatients: lastMonthPatients.length,
          totalHospitalizations: hospitalizations.length,
          todayHospitalizations: todayHospitalizations.length,
          lastMonthHospitalizations: lastMonthHospitalizations.length,
          totalHistory: history.length,
          todayHistory: todayHistory.length,
          lastMonthHistory: lastMonthHistory.length,
          loading: false
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble Maternité</h1>
        <p className="mt-2 text-sm text-gray-600">
          Statistiques complètes de la maternité - {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Statistiques des patients */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">📊 Patients Maternité</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">{stats.totalPatients}</div>
            <div className="text-sm text-gray-500 mt-1">Total patients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.todayPatients}</div>
            <div className="text-sm text-gray-500 mt-1">Aujourd'hui</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.lastMonthPatients}</div>
            <div className="text-sm text-gray-500 mt-1">Mois passé</div>
          </div>
        </div>
      </div>

      {/* Statistiques des hospitalisations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">🏥 Hospitalisations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.totalHospitalizations}</div>
            <div className="text-sm text-gray-500 mt-1">Total hospitalisations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.todayHospitalizations}</div>
            <div className="text-sm text-gray-500 mt-1">Aujourd'hui</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.lastMonthHospitalizations}</div>
            <div className="text-sm text-gray-500 mt-1">Mois passé</div>
          </div>
        </div>
      </div>

      {/* Statistiques de l'historique */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">📋 Historique Maternité</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.totalHistory}</div>
            <div className="text-sm text-gray-500 mt-1">Total entrées</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.todayHistory}</div>
            <div className="text-sm text-gray-500 mt-1">Aujourd'hui</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.lastMonthHistory}</div>
            <div className="text-sm text-gray-500 mt-1">Mois passé</div>
          </div>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Résumé du jour</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Nouveaux patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayPatients}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Nouvelles hospitalisations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayHospitalizations}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterniteOverview; 