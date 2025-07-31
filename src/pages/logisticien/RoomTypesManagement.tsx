import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RoomType {
  id: number;
  name: string;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const RoomTypesManagement: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/room-types');
      setRoomTypes(response.data.roomTypes || []);
    } catch (error: any) {
      setError('Erreur lors du chargement des types de chambres');
      console.error('Erreur fetch room types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (roomType?: RoomType) => {
    if (roomType) {
      setForm({
        name: roomType.name,
        price: roomType.price.toString(),
        description: roomType.description || ''
      });
      setEditingId(roomType.id);
    } else {
      setForm({
        name: '',
        price: '',
        description: ''
      });
      setEditingId(null);
    }
    setShowForm(true);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        // Modifier
        await axios.put(`/api/room-types/${editingId}`, {
          name: form.name,
          price: parseFloat(form.price),
          description: form.description
        });
      } else {
        // Créer
        await axios.post('/api/room-types', {
          name: form.name,
          price: parseFloat(form.price),
          description: form.description
        });
      }

      await fetchRoomTypes();
      setShowForm(false);
      setForm({ name: '', price: '', description: '' });
      setEditingId(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce type de chambre ?')) {
      return;
    }

    try {
      await axios.delete(`/api/room-types/${id}`);
      await fetchRoomTypes();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des types de chambres</h1>
        <button className="btn-primary" onClick={() => handleOpenForm()}>
          + Nouveau type de chambre
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-24">Chargement...</div>
        ) : roomTypes.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Aucun type de chambre enregistré</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roomTypes.map((roomType) => (
                  <tr key={roomType.id}>
                    <td className="px-4 py-2 font-medium">{roomType.name}</td>
                    <td className="px-4 py-2">{roomType.price.toLocaleString()} FC</td>
                    <td className="px-4 py-2">{roomType.description || '-'}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          className="btn-secondary btn-xs"
                          onClick={() => handleOpenForm(roomType)}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn-danger btn-xs"
                          onClick={() => handleDelete(roomType.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold">
                {editingId ? 'Modifier le type de chambre' : 'Nouveau type de chambre'}
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowForm(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du type de chambre</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Ex: Chambre simple, Chambre double..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix par jour (FC)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="input-field"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description (optionnel)</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="input-field"
                    placeholder="Description du type de chambre..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : (editingId ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypesManagement; 