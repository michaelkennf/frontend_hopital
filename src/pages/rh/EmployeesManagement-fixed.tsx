import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interface pour définir le type Employee
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  postNom: string;
  dateOfBirth: string;
  sexe: string;
  maritalStatus: string;
  contact: string;
  address: string;
  function: string;
  salary: number;
}

const EmployeesManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    postNom: '',
    dateOfBirth: '',
    sexe: '',
    maritalStatus: '',
    contact: '',
    address: '',
    function: '',
    salary: ''
  });

  const functions = [
    'Médecin',
    'Infirmier',
    'Laborantin',
    'Caissier',
    'Logisticien',
    'RH',
    'PDG',
    'Administrateur'
  ];

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const employeeData = {
        ...formData,
        salary: parseFloat(formData.salary)
      };

      if (editingId) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/api/employees/${editingId}`, employeeData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/employees`, employeeData);
      }

      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      postNom: employee.postNom,
      dateOfBirth: employee.dateOfBirth,
      sexe: employee.sexe,
      maritalStatus: employee.maritalStatus,
      contact: employee.contact,
      address: employee.address,
      function: employee.function,
      salary: employee.salary.toString()
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      setLoading(true);
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/employees/${id}`);
        fetchEmployees();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      postNom: '',
      dateOfBirth: '',
      sexe: '',
      maritalStatus: '',
      contact: '',
      address: '',
      function: '',
      salary: ''
    });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Employés</h1>
        <button
          onClick={resetForm}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          {editingId ? 'Annuler' : 'Nouvel Employé'}
        </button>
      </div>

      {(editingId || !employees.length) && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Modifier l\'employé' : 'Ajouter un nouvel employé'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post-nom</label>
                <input
                  type="text"
                  name="postNom"
                  value={formData.postNom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">État civil</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf/Veuve">Veuf/Veuve</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
                <select
                  name="function"
                  value={formData.function}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner</option>
                  {functions.map(func => (
                    <option key={func} value={func}>{func}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire (USD)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : (editingId ? 'Modifier' : 'Enregistrer')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className='bg-white rounded-lg shadow-md'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-800'>Liste des Employés</h2>
        </div>
        {loading ? (
          <div className='p-6 text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-2 text-gray-600'>Chargement des employés...</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Informations complètes</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Contact & Adresse</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Fonction & Salaire</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {employees.map((employee: Employee) => (
                  <tr key={employee.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <div className='space-y-2'>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            <strong>Nom complet:</strong> {employee.firstName} {employee.lastName} {employee.postNom}
                          </div>
                        </div>
                        <div className='text-sm text-gray-600'>
                          <strong>Date de naissance:</strong> {new Date(employee.dateOfBirth).toLocaleDateString('fr-FR')}
                        </div>
                        <div className='text-sm text-gray-600'>
                          <strong>Sexe:</strong> {employee.sexe === 'M' ? 'Masculin' : 'Féminin'}
                        </div>
                        <div className='text-sm text-gray-600'>
                          <strong>État civil:</strong> {employee.maritalStatus}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='space-y-2'>
                        <div className='text-sm text-gray-900'>
                          <strong>Contact:</strong> {employee.contact}
                        </div>
                        <div className='text-sm text-gray-600'>
                          <strong>Adresse:</strong> {employee.address}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='space-y-2'>
                        <div className='text-sm text-gray-900'>
                          <strong>Fonction:</strong> {employee.function}
                        </div>
                        <div className='text-sm text-gray-600'>
                          <strong>Salaire:</strong> ${employee.salary.toLocaleString()} USD
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleEdit(employee)}
                          className='text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded'
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className='text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded'
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {employees.length === 0 && (
              <div className='p-6 text-center text-gray-500'>
                Aucun employé enregistré
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesManagement; 