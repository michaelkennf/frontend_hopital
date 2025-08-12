import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ActsListMaternite: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [actTypes, setActTypes] = useState<any[]>([]);
  const [acts, setActs] = useState<any[]>([]);
  const [form, setForm] = useState({
    patientId: '',
    actTypeId: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [actTypeSearch, setActTypeSearch] = useState('');

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPatients();
    fetchActTypes();
    fetchActs();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/patients?service=maternite');
      setPatients(res.data.patients || []);
    } catch (e) {
      setPatients([]);
    }
  };

  const fetchActTypes = async () => {
    try {
      const res = await axios.get('/api/acts');
      setActTypes(res.data.actTypes || []);
    } catch (e) {
      setActTypes([]);
    }
  };

  const fetchActs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/acts/completed');
      // On ne garde que les actes des patients maternité
      const hospRes = await axios.get('/api/hospitalizations');
      const hospMaternite = hospRes.data.hospitalizations.filter((h: any) => h.patient && h.patient.folderNumber && h.patient.folderNumber.startsWith('MAT-'));
      const hospPatientIds = hospMaternite.map((h: any) => h.patientId);
      setActs((res.data.acts || []).filter((a: any) => hospPatientIds.includes(a.patient.id)));
    } catch (e) {
      setActs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = () => {
    setForm({ patientId: '', actTypeId: '', date: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post('/api/acts', {
        patientId: form.patientId,
        actTypeId: form.actTypeId,
        date: form.date,
      });
      setSuccess('Acte enregistré avec succès !');
      setShowForm(false);
      fetchActs();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur lors de l\'enregistrement de l\'acte');
    } finally {
      setLoading(false);
    }
  };





  const filteredActs = acts.filter(act => {
    const searchLower = search.toLowerCase();
    const patientSearchLower = patientSearch.toLowerCase();
    const actTypeSearchLower = actTypeSearch.toLowerCase();
    
    return (
      (search === '' || 
       act.patient.firstName?.toLowerCase().includes(searchLower) ||
       act.patient.lastName?.toLowerCase().includes(searchLower) ||
       act.actType.name.toLowerCase().includes(searchLower)) &&
      (patientSearch === '' ||
       act.patient.firstName?.toLowerCase().includes(patientSearchLower) ||
       act.patient.lastName?.toLowerCase().includes(patientSearchLower)) &&
      (actTypeSearch === '' ||
       act.actType.name.toLowerCase().includes(actTypeSearchLower))
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des actes - Maternité</h1>
        <button
          onClick={handleOpenForm}
          className="btn-primary"
        >
          Nouvel acte
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Recherche générale..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Recherche par patient..."
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Recherche par type d'acte..."
          value={actTypeSearch}
          onChange={(e) => setActTypeSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Nouvel acte</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName} - {patient.folderNumber}
                </option>
              ))}
            </select>
            <select
              name="actTypeId"
              value={form.actTypeId}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Sélectionner un type d'acte</option>
              {actTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} - ${type.price}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="input-field"
            />
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des actes */}
      <div ref={tableRef} className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 print-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredActs.map(act => (
              <tr key={act.id}>
                <td className="px-4 py-2 font-mono text-sm">
                  {act.patient.folderNumber} - {act.patient.lastName?.toUpperCase() || ''} {act.patient.firstName || ''}
                </td>
                <td className="px-4 py-2">{act.actType.name}</td>
                <td className="px-4 py-2">{new Date(act.date).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-2">${act.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default ActsListMaternite; 