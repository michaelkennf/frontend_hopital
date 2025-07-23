import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  maritalStatus: string;
  salary: number;
  function: string;
  createdAt: string;
  sexe: string;
  contact: string;
}

const emptyEmployee: Partial<Employee> = {
  firstName: '',
  lastName: '',
  address: '',
  dateOfBirth: '',
  maritalStatus: '',
  salary: 0,
  function: '',
  sexe: '',
  contact: '',
};



const EmployeesManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Partial<Employee> | null>(null);
  const [form, setForm] = useState<any>({ ...emptyEmployee });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [payslipModal, setPayslipModal] = useState<{ emp: Employee; month: number; year: number } | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/employees');
      setEmployees(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const openAdd = () => {
    setEditEmployee(null);
    setForm({ ...emptyEmployee });
    setShowModal(true);
  };
  const openEdit = (emp: Employee) => {
    setEditEmployee(emp);
    setForm({ ...emp });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditEmployee(null);
    setForm({ ...emptyEmployee });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form };
      if (editEmployee) {
        await axios.put(`/api/employees/${editEmployee.id}`, payload);
      } else {
        await axios.post('/api/employees', payload);
      }
      closeModal();
      fetchEmployees();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    setError(null);
    try {
      await axios.delete(`/api/employees/${deleteId}`);
      setDeleteId(null);
      setConfirmDelete(false);
      fetchEmployees();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setSaving(false);
    }
  };

  const handlePrintPayslip = async (emp: Employee, month: number, year: number) => {
    // Enregistrer la fiche de paie côté backend
    try {
      await axios.post('/api/employees/payslips', {
        employeeId: emp.id,
        month: month + 1, // mois humain (1-12)
        year,
        amount: emp.salary
      });
    } catch (e: any) {
      // Optionnel : afficher une notification si déjà enregistrée ou erreur
    }
    // Génération PDF comme avant
    const doc = new jsPDF();
    // Entête institutionnelle (identique)
    doc.addImage('/logo_polycliniques.jpg', 'JPEG', 10, 8, 28, 28);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('REPUBLIQUE DEMOCRATIQUE DU CONGO', 45, 13);
    doc.text('PROVINCE DU SUD-KIVU', 45, 18);
    doc.text('VILLE DE BUKAVU', 45, 23);
    doc.text('ZONE DE SANTE URBAINE DE KADUTU', 45, 28);
    doc.setTextColor(230,0,0);
    doc.text('FONDATION UMOJA', 45, 33);
    doc.setTextColor(0,153,0);
    doc.text('"F.U" asbl', 45, 38);
    doc.setTextColor(0,0,0);
    doc.text('DEPARTEMENT DES OEUVRES MEDICALES', 45, 43);
    doc.setFontSize(12);
    doc.setTextColor(0,153,0);
    doc.text('POLYCLINIQUE DES APOTRES', 45, 48);
    doc.setTextColor(0,0,0);
    doc.setDrawColor(0,0,0); // Bordures en noir
    doc.setLineWidth(1.2);
    doc.line(10, 52, 200, 52);

    // Titre
    doc.setFontSize(16);
    doc.setTextColor(0,0,0);
    doc.setFont('helvetica', 'bold');
    doc.text('FICHE DE PAIE année ' + year, 70, 65);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Infos employé (haut de page)
    let y = 75;
    doc.text(`NOM : ${emp.firstName || ''}`, 20, y);
    y += 7;
    doc.text(`POST NOM : ${emp.lastName || ''}`, 20, y);
    y += 7;
    doc.text(`SEXE : ${emp.sexe || ''}   Adresse : ${emp.address || ''}`, 20, y);
    y += 7;
    doc.text(`FONCTION : ${emp.function || ''}`, 20, y);
    y += 7;
    doc.text(`CONTACT : ${emp.contact || ''}`, 20, y);
    y += 10;

    // Tableau
    const startX = 20;
    const tableY = y;
    const colWidths = [12, 32, 32, 32, 50]; // N, MOIS, MONTANT, DATE, SIGNATURE
    const headers = ['N', 'MOIS', 'MONTANT', 'DATE', 'SIGNATURE'];
    // En-tête du tableau
    let x = startX;
    doc.setFontSize(10); // Police plus petite pour l'en-tête du tableau
    headers.forEach((h, i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(h, x + 2, tableY);
      x += colWidths[i];
    });
    // Lignes du tableau (12 mois)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8); // Police plus petite pour le tableau
    let rowY = tableY + 7;
    for (let i = 1; i <= 12; i++) {
      x = startX;
      doc.text(i.toString().padStart(2, '0'), x + 2, rowY);
      x += colWidths[0];
      doc.text(i.toString().padStart(2, '0'), x + 2, rowY); // MOIS (numéro)
      x += colWidths[1];
      // MONTANT, DATE, SIGNATURE vides
      x += colWidths[2];
      x += colWidths[3];
      x += colWidths[4];
      rowY += 8;
    }
    // Ligne TOTAL
    x = startX;
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', x + 2, rowY);
    // Bordures du tableau
    doc.setDrawColor(0,0,0); // Bordures en noir
    doc.setLineWidth(0.3); // Bordures fines
    let tableHeight = 7 + 8 * 12 + 8; // header + 12 rows + total
    let tableBottom = tableY + tableHeight;
    // Colonnes
    x = startX;
    for (let i = 0; i <= colWidths.length; i++) {
      let colX = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.line(colX, tableY - 5, colX, tableBottom);
    }
    // Lignes
    for (let i = 0; i <= 13; i++) {
      let lineY = tableY - 5 + 7 + i * 8;
      doc.line(startX, lineY, startX + colWidths.reduce((a, b) => a + b, 0), lineY);
    }
    // Ligne sous header
    doc.line(startX, tableY - 5 + 7, startX + colWidths.reduce((a, b) => a + b, 0), tableY - 5 + 7);

    // Footer institutionnel
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('DR ROLAND MUHUBAO', 20, tableBottom + 20);
    doc.setFont('helvetica', 'italic');
    doc.text('Médecin Directeur', 20, tableBottom + 27);

    // Footer centré
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0,0,0);
    doc.text('Adresse : DRCONGO/SK/BKV/Av. BUHOZI/KAJANGU/CIRIRI', 105, 280, { align: 'center' });
    doc.text('Tél : (+243) 975 822 376, 843 066 779', 105, 285, { align: 'center' });
    doc.text('Email : polycliniquedesapotres1121@gmail.com', 105, 290, { align: 'center' });
    doc.save(`fiche_paie_${emp.lastName}_${year}.pdf`);
  };

  // Liste des fonctions possibles dans l'hôpital
  const hospitalFunctions = [
    'Médecin',
    'Infirmier(ère)',
    'Sentinelle',
    'Fille de salle',
    'Caissier(e)',
    'Pharmacien(ne)',
    'P.P',
    'Laborantin(e)',
    'Biologiste Médical',
    'Administrateur Gestionnaire',
    'Directeur de Nursing',
    'Médecin Directeur',
    'Médecin chef de Staff',
    'Logisticien(ne)',
    'Réceptionniste',
    'Sage femme/Accoucheuse'
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestion du personnel</h1>
      <p className="text-gray-600 mb-6">Ajoutez, modifiez ou supprimez les membres du personnel de l'hôpital.</p>
      <div className="mb-4 flex justify-between items-center">
        <button className="btn-primary" onClick={openAdd}>+ Ajouter un employé</button>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>}
      <div className="card overflow-x-auto">
        {loading ? (
          <div>Chargement...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Prénom</th>
                <th className="p-2">Nom</th>
                <th className="p-2">Adresse</th>
                <th className="p-2">Date de naissance</th>
                <th className="p-2">Statut matrimonial</th>
                <th className="p-2">Sexe</th>
                <th className="p-2">Contact</th>
                <th className="p-2">Fonction</th>
                <th className="p-2">Salaire ($)</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-b">
                  <td className="p-2">{emp.firstName}</td>
                  <td className="p-2">{emp.lastName}</td>
                  <td className="p-2">{emp.address}</td>
                  <td className="p-2">{emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString('fr-FR') : ''}</td>
                  <td className="p-2">{emp.maritalStatus}</td>
                  <td className="p-2">{emp.sexe}</td>
                  <td className="p-2">{emp.contact}</td>
                  <td className="p-2">{emp.function}</td>
                  <td className="p-2">{emp.salary}</td>
                  <td className="p-2 flex gap-2">
                    <button className="btn-secondary" onClick={() => openEdit(emp)}>Modifier</button>
                    <button className="btn-secondary text-red-600 border-red-300 hover:bg-red-50" onClick={() => { setDeleteId(emp.id); setConfirmDelete(true); }}>Supprimer</button>
                    <button className="btn-secondary text-green-700 border-green-300 hover:bg-green-50" onClick={() => setPayslipModal({ emp, month: new Date().getMonth(), year: new Date().getFullYear() })}>Imprimer fiche de paie</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal ajout/modif */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div
            className="bg-white rounded shadow-lg p-6 w-full max-w-md relative"
            style={{ maxHeight: '90vh', overflowY: 'auto', paddingBottom: 32 }}
          >
            <button
              className="absolute top-2 right-2 text-gray-500"
              style={{ zIndex: 10000, background: '#fff' }}
              onClick={closeModal}
            >✕</button>
            <h2 className="text-lg font-bold mb-4">{editEmployee ? 'Modifier' : 'Ajouter'} un membre du personnel</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input name="firstName" className="input-field" placeholder="Prénom" value={form.firstName || ''} onChange={handleChange} required />
              <input name="lastName" className="input-field" placeholder="Nom" value={form.lastName || ''} onChange={handleChange} required />
              <input name="address" className="input-field" placeholder="Adresse" value={form.address || ''} onChange={handleChange} required />
              <input name="dateOfBirth" className="input-field" type="date" value={form.dateOfBirth ? form.dateOfBirth.slice(0,10) : ''} onChange={handleChange} required />
              <select name="maritalStatus" className="input-field" value={form.maritalStatus || ''} onChange={handleChange} required>
                <option value="">Statut matrimonial</option>
                <option value="célibataire">Célibataire</option>
                <option value="marié(e)">Marié(e)</option>
                <option value="divorcé(e)">Divorcé(e)</option>
                <option value="veuf(ve)">Veuf(ve)</option>
              </select>
              {/* Champ sexe */}
              <select name="sexe" className="input-field" value={form.sexe || ''} onChange={handleChange} required>
                <option value="">Sexe</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              {/* Champ contact */}
              <input name="contact" className="input-field" placeholder="Contact (téléphone/email)" value={form.contact || ''} onChange={handleChange} required />
              {/* Champ fonction : liste déroulante imposée */}
              <select name="function" className="input-field" value={form.function || ''} onChange={handleChange} required>
                <option value="">Sélectionner la fonction</option>
                {hospitalFunctions.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <input name="salary" className="input-field" placeholder="Salaire ($)" value={form.salary || ''} onChange={handleChange} required type="number" min={0} />
              <div className="flex gap-2 mt-2" style={{ zIndex: 9999, background: '#fff' }}>
                <button className="btn-primary" type="submit" disabled={saving} style={{ minWidth: 120 }}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button className="btn-secondary" type="button" onClick={closeModal} style={{ minWidth: 120 }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
            <h2 className="text-lg font-bold mb-4 text-red-700">Confirmer la suppression</h2>
            <p>Voulez-vous vraiment supprimer ce membre du personnel ? Cette action est irréversible.</p>
            <div className="flex gap-2 mt-4">
              <button className="btn-primary bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={saving}>{saving ? 'Suppression...' : 'Supprimer'}</button>
              <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal fiche de paie */}
      {payslipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setPayslipModal(null)}>✕</button>
            <h2 className="text-lg font-bold mb-4">Imprimer la fiche de paie</h2>
            <div className="flex flex-col gap-3">
              <label>Mois
                <select className="input-field" value={payslipModal.month} onChange={e => setPayslipModal({ ...payslipModal, month: Number(e.target.value) })}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>{new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}</option>
                  ))}
                </select>
              </label>
              <label>Année
                <input className="input-field" type="number" min={2000} max={2100} value={payslipModal.year} onChange={e => setPayslipModal({ ...payslipModal, year: Number(e.target.value) })} />
              </label>
              <button className="btn-primary mt-2" onClick={() => { handlePrintPayslip(payslipModal.emp, payslipModal.month, payslipModal.year); setPayslipModal(null); }}>Imprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesManagement; 