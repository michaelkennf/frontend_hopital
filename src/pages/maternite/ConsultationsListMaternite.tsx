import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Patient {
  id: number;
  folderNumber: string;
  gender: string;
  firstName?: string;
  lastName?: string;
}

interface ConsultationType {
  id: number;
  name: string;
}

interface Consultation {
  id: number;
  patient: Patient;
  consultationType: ConsultationType;
  date: string;
}

const ConsultationsListMaternite: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [form, setForm] = useState({
    patientId: '',
    consultationTypeId: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [editForm, setEditForm] = useState({
    patientId: '',
    consultationTypeId: '',
    date: '',
  });
  const [search, setSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchConsultationTypes();
    fetchConsultations();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/patients?service=maternite');
      setPatients(res.data.patients || []);
    } catch (e) {
      setPatients([]);
    }
  };

  const fetchConsultationTypes = async () => {
    try {
      const res = await axios.get('/api/consultations/types');
      setConsultationTypes(res.data.consultationTypes || []);
    } catch (e) {
      setConsultationTypes([]);
    }
  };

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/consultations');
      setConsultations(res.data.consultations || []);
    } catch (e) {
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = () => {
    setShowForm(true);
    setForm({
      patientId: '',
      consultationTypeId: '',
      date: new Date().toISOString().slice(0, 10),
    });
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.post('/api/consultations', {
        patientId: parseInt(form.patientId),
        consultationTypeId: parseInt(form.consultationTypeId),
        date: form.date,
      });

      setConsultations([res.data, ...consultations]);
      setShowForm(false);
      setForm({
        patientId: '',
        consultationTypeId: '',
        date: '',
      });
      setSuccess('Consultation ajoutée avec succès');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur lors de l\'ajout de la consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (consultation: Consultation) => {
    setEditingConsultation(consultation);
    setEditForm({
      patientId: consultation.patient.id.toString(),
      consultationTypeId: consultation.consultationType.id.toString(),
      date: consultation.date,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConsultation) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.put(`/api/consultations/${editingConsultation.id}`, {
        patientId: parseInt(editForm.patientId),
        consultationTypeId: parseInt(editForm.consultationTypeId),
        date: editForm.date,
      });

      setConsultations(consultations.map(c => 
        c.id === editingConsultation.id ? res.data : c
      ));
      setEditingConsultation(null);
      setEditForm({
        patientId: '',
        consultationTypeId: '',
        date: '',
      });
      setSuccess('Consultation modifiée avec succès');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur lors de la modification de la consultation');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const consultationsToPrint = consultations.filter(c => 
      c.patient.folderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (c.patient.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.patient.lastName || '').toLowerCase().includes(search.toLowerCase())
    );

    printWindow.document.write(`
      <html>
        <head>
          <title>Liste des Consultations - Maternité</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Liste des Consultations - Maternité</h1>
            <p>Date d'impression: ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>N° Dossier</th>
                <th>Patient</th>
                <th>Type de Consultation</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${consultationsToPrint.map(c => `
                <tr>
                  <td>${c.patient.folderNumber}</td>
                  <td>${c.patient.firstName || ''} ${c.patient.lastName || ''}</td>
                  <td>${c.consultationType.name}</td>
                  <td>${new Date(c.date).toLocaleDateString('fr-FR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredConsultations = consultations.filter(c => 
    c.patient.folderNumber.toLowerCase().includes(search.toLowerCase()) ||
    (c.patient.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.patient.lastName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultations - Maternité</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des consultations pour les patientes maternité
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePrintList}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Imprimer la liste
          </button>
          <button
            onClick={handleOpenForm}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
          >
            Nouvelle consultation
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-700">
          {success}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Nouvelle consultation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher une patiente
              </label>
              <input
                type="text"
                className="input-field mb-1"
                placeholder="Rechercher une patiente..."
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
              />
              <select
                name="patientId"
                value={form.patientId}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Sélectionner une patiente</option>
                {patients.filter((p) => {
                  const txt = `${p.folderNumber} ${p.lastName || ''} ${p.firstName || ''}`.toLowerCase();
                  return txt.includes(patientSearch.toLowerCase());
                }).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.folderNumber} - {p.lastName?.toUpperCase() || ''} {p.firstName || ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de consultation
              </label>
              <select
                name="consultationTypeId"
                value={form.consultationTypeId}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Sélectionner un type</option>
                {consultationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Ajout en cours...' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulaire d'édition */}
      {editingConsultation && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Modifier la consultation</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patiente
              </label>
              <select
                name="patientId"
                value={editForm.patientId}
                onChange={handleEditChange}
                required
                className="input-field"
              >
                <option value="">Sélectionner une patiente</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.folderNumber} - {p.lastName?.toUpperCase() || ''} {p.firstName || ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de consultation
              </label>
              <select
                name="consultationTypeId"
                value={editForm.consultationTypeId}
                onChange={handleEditChange}
                required
                className="input-field"
              >
                <option value="">Sélectionner un type</option>
                {consultationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={editForm.date}
                onChange={handleEditChange}
                required
                className="input-field"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Modification en cours...' : 'Modifier'}
              </button>
              <button
                type="button"
                onClick={() => setEditingConsultation(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par numéro de dossier, nom ou prénom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>
      </div>

      {/* Liste des consultations */}
      <div className="bg-white rounded-lg shadow overflow-hidden" ref={tableRef}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Consultations ({filteredConsultations.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Dossier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patiente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type de Consultation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConsultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {consultation.patient.folderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {consultation.patient.firstName || ''} {consultation.patient.lastName || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {consultation.consultationType.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(consultation.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(consultation)}
                      className="text-pink-600 hover:text-pink-900 mr-3"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredConsultations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune consultation trouvée
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationsListMaternite; 