import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  role: {
    name: string;
    description?: string;
  };
  employee?: {
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    password: '',
    role: 'admin',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Effacer le message de succès après 5 secondes
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Token envoyé:', localStorage.getItem('auth-token'));
      const response = await axios.get('/api/users');
      setUsers(response.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      await axios.post('/api/users', addForm);
      setShowAddModal(false);
      setAddForm({ email: '', password: '', role: 'admin', firstName: '', lastName: '', phone: '' });
      fetchUsers();
      setSuccess('Utilisateur créé avec succès !');
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setAddLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setResetLoading(true);
    setResetError(null);
    try {
      await axios.patch(`/api/users/${selectedUser.id}/reset-password`, {
        newPassword: resetPassword
      });
      setShowResetModal(false);
      setSelectedUser(null);
      setResetPassword('');
      setSuccess('Mot de passe réinitialisé avec succès !');
    } catch (err: any) {
      setResetError(err.response?.data?.error || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email} ?\n\nCette action est irréversible.`)) {
      return;
    }

    try {
      await axios.delete(`/api/users/${user.id}`);
      fetchUsers();
      setSuccess('Utilisateur supprimé avec succès !');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les comptes utilisateurs et leurs permissions
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter un utilisateur
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-800">
                          {user.employee?.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.employee?.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.employee?.isActive !== false ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-sm text-gray-500">Rôle: {typeof user.role === 'string' ? user.role : user.role?.name}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-primary-600 hover:text-primary-900 text-sm font-medium" 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowResetModal(true);
                        setResetPassword('');
                        setResetError(null);
                      }}
                    >
                      Modifier
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 text-sm font-medium" 
                      onClick={() => handleDeleteUser(user)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Modale d'ajout d'utilisateur */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg md:max-w-xl relative mx-2">
            {/* Header modale : titre + bouton fermer alignés */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Nouvel utilisateur</h2>
              <button
                className="text-gray-400 hover:text-gray-600 ml-2"
                onClick={() => setShowAddModal(false)}
                aria-label="Fermer"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddUser} className="w-full">
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required placeholder="Email" className="input-field" value={addForm.email} onChange={handleAddChange} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="password">Mot de passe</label>
                <input type="password" id="password" name="password" required placeholder="Mot de passe" className="input-field" value={addForm.password} onChange={handleAddChange} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="role">Rôle</label>
                <select id="role" name="role" required className="input-field" value={addForm.role} onChange={handleAddChange}>
                  <option value="ADMIN">Admin</option>
                  <option value="PDG">PDG</option>
                  <option value="RH">RH</option>
                  <option value="CAISSIER">Caissier</option>
                  <option value="LOGISTICIEN">Logisticien</option>
                  <option value="MEDECIN">Médecin</option>
                  <option value="AGENT_HOSPITALISATION">Agent Hospitalisation</option>
                  <option value="LABORANTIN">Laborantin</option>
                  <option value="AGENT_MATERNITE">Agent Maternité</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="firstName">Prénom</label>
                <input type="text" id="firstName" name="firstName" required placeholder="Prénom" className="input-field" value={addForm.firstName} onChange={handleAddChange} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="lastName">Nom</label>
                <input type="text" id="lastName" name="lastName" required placeholder="Nom" className="input-field" value={addForm.lastName} onChange={handleAddChange} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="phone">Téléphone</label>
                <input type="text" id="phone" name="phone" required placeholder="Téléphone" className="input-field" value={addForm.phone} onChange={handleAddChange} />
              </div>
              {addError && <div className="text-red-600 text-sm mb-2">{addError}</div>}
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
                <button type="button" className="w-full sm:w-1/2 btn" onClick={() => setShowAddModal(false)} disabled={addLoading}>Annuler</button>
                <button type="submit" className="w-full sm:w-1/2 btn-primary py-2" disabled={addLoading}>{addLoading ? 'Création...' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale de réinitialisation de mot de passe */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md relative mx-2">
            {/* Header modale : titre + bouton fermer alignés */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Réinitialiser le mot de passe</h2>
              <button
                className="text-gray-400 hover:text-gray-600 ml-2"
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedUser(null);
                  setResetPassword('');
                  setResetError(null);
                }}
                aria-label="Fermer"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Réinitialiser le mot de passe pour : <strong>{selectedUser.employee ? `${selectedUser.employee.firstName} ${selectedUser.employee.lastName}` : selectedUser.email}</strong>
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="w-full">
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="newPassword">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  required 
                  placeholder="Nouveau mot de passe" 
                  className="input-field" 
                  value={resetPassword} 
                  onChange={(e) => setResetPassword(e.target.value)} 
                />
              </div>
              
              {resetError && <div className="text-red-600 text-sm mb-2">{resetError}</div>}
              
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
                <button 
                  type="button" 
                  className="w-full sm:w-1/2 btn" 
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedUser(null);
                    setResetPassword('');
                    setResetError(null);
                  }} 
                  disabled={resetLoading}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="w-full sm:w-1/2 btn-primary py-2" 
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Réinitialisation...' : 'Réinitialiser'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement; 