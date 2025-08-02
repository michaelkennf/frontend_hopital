import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  folderNumber: string;
}

interface InvoiceItem {
  id: number;
  description: string;
  amount: number;
  type: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  consultationId?: number;
  examId?: number;
  medicationSaleId?: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  printed: boolean;
  createdAt: string;
  patient: Patient;
  items: InvoiceItem[];
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [editItems, setEditItems] = useState<InvoiceItem[]>([]);
  const [editTotal, setEditTotal] = useState<number>(0);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [patientConsultations, setPatientConsultations] = useState<any[]>([]);
  const [patientExams, setPatientExams] = useState<any[]>([]);
  const [patientSales, setPatientSales] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('/api/patients');
        setPatients(res.data.patients || []);
      } catch (e) {
        setPatients([]);
      }
    };
    fetchPatients();
  }, []);

  const fetchInvoices = async (patientId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth-token');
      console.log('[INVOICES] Token présent:', !!token);
      console.log('[INVOICES] URL de base:', axios.defaults.baseURL);
      
      let url = '/api/invoices';
      if (patientId) url += `?patientId=${patientId}`;
      console.log('[INVOICES] URL complète:', url);
      
      let res;
      if (token) {
        res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        res = await fetch(url);
      }
      
      console.log('[INVOICES] Statut de la réponse:', res.status);
      console.log('[INVOICES] Headers de la réponse:', res.headers);
      
      // Sécuriser le parsing JSON
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('[INVOICES] Erreur parsing JSON:', e);
        console.error('[INVOICES] Réponse brute:', text);
        data = {};
      }
      
      console.log('[INVOICES] Données reçues:', data);
      
      if (res.ok) {
        setInvoices((data as any).invoices || []);
      } else {
        // Affichage détaillé de l'erreur
        setError(`Erreur ${res.status} : ${(data as any).error || res.statusText}`);
      }
    } catch (e: any) {
      // Affichage détaillé de l'erreur réseau
      console.error('[INVOICES] Erreur complète:', e);
      setError(`Erreur réseau : ${e.message || e.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientActs = async (patientId: number) => {
    try {
      const [consultationsRes, examsRes, salesRes] = await Promise.all([
        axios.get(`/api/consultations?patientId=${patientId}`),
        axios.get(`/api/exams/realized?patientId=${patientId}`),
        axios.get(`/api/medications/sales?patientId=${patientId}`),
      ]);
      setPatientConsultations(consultationsRes.data.consultations || []);
      setPatientExams(examsRes.data.exams || []);
      setPatientSales(salesRes.data.sales || []);
    } catch (e) {
      setPatientConsultations([]);
      setPatientExams([]);
      setPatientSales([]);
    }
  };

  useEffect(() => {
    fetchInvoices(selectedPatientId);
  }, [selectedPatientId]);

  const handlePrint = async (invoice: Invoice) => {
    setPrintingId(invoice.id);
    
    // Logs de débogage
    console.log('🖨️ Impression facture:', invoice);
    console.log('📋 Items de la facture:', invoice.items);
    console.log('💰 Montant total:', invoice.totalAmount);
    console.log('👤 Patient:', invoice.patient);
    
    // Vérifier si la facture a des items
    if (!invoice.items || invoice.items.length === 0) {
      console.error('❌ Facture sans items - impossible d\'imprimer');
      alert('Cette facture n\'a pas d\'éléments à imprimer.');
      setPrintingId(null);
      return;
    }
    
    // Générer le HTML de la facture optimisé pour l'impression
    const win = window.open('', '', 'width=400,height=800');
    if (win) {
      win.document.write('<html><head><title>Facture</title>');
      win.document.write(`
        <style>
          @media print {
            body { 
              width: 100% !important; 
              margin: 0 !important; 
              padding: 10px !important;
              font-size: 16px !important; font-weight: bold !important;
              color: black !important;
              background: white !important;
            }
            .facture { 
              width: 100% !important; 
              max-width: 80mm !important;
              margin: 0 auto !important;
            }
            .facture-header { 
              text-align: center !important; 
              font-size: 16px !important; 
              font-weight: bold !important; 
              margin-bottom: 8px !important;
              color: black !important;
            }
            .facture-table { 
              width: 100% !important; 
              border-collapse: collapse !important; 
              font-size: 15px !important; font-weight: bold !important;
              margin: 8px 0 !important;
            }
            .facture-table th, .facture-table td { 
              border-bottom: 1px solid black !important; 
              padding: 4px 2px !important; 
              text-align: left !important;
              color: black !important;
            }
            .footer { 
              font-size: 12px !important; font-weight: bold !important; 
              text-align: center !important; 
              margin-top: 15px !important; 
              color: black !important;
              border-top: 1px solid black !important;
              padding-top: 8px !important;
            }
            .entete-logo { 
              height: 40px !important; 
              margin-bottom: 5px !important;
              display: block !important;
              margin-left: auto !important;
              margin-right: auto !important;
            }
            .entete-title { 
              color: black !important; 
              font-weight: bold !important; 
              font-size: 15px !important;
              margin: 5px 0 !important;
            }
            .entete-sub { 
              color: black !important; 
              font-weight: bold !important; 
              font-size: 15px !important; font-weight: bold !important;
              margin: 3px 0 !important;
            }
            .patient-info {
              margin: 8px 0 !important;
              font-size: 15px !important; font-weight: bold !important;
              color: black !important;
            }
            .total-section {
              margin-top: 10px !important;
              text-align: right !important;
              font-size: 16px !important; font-weight: bold !important;
              font-weight: bold !important;
              color: black !important;
              border-top: 2px solid black !important;
              padding-top: 5px !important;
            }
          }
          
          body { 
            font-family: 'Courier New', monospace, Arial, sans-serif; 
            font-size: 16px; font-weight: bold; 
            width: 100%; 
            margin: 0; 
            padding: 10px;
            color: black;
            background: white;
          }
          .facture { 
            width: 100%; 
            max-width: 80mm; 
            margin: 0 auto; 
            padding: 5px;
          }
          .facture-header { 
            text-align: center; 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 8px;
            color: black;
          }
          .facture-table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 15px; font-weight: bold;
            margin: 8px 0;
          }
          .facture-table th, .facture-table td { 
            border-bottom: 1px solid black; 
            padding: 4px 2px; 
            text-align: left;
            color: black;
          }
          .facture-table th {
            font-weight: bold;
            background: #f0f0f0;
          }
          .footer { 
            font-size: 12px; font-weight: bold; 
            text-align: center; 
            margin-top: 15px; 
            color: black;
            border-top: 1px solid black;
            padding-top: 8px;
          }
          .entete-logo { 
            height: 40px; 
            margin-bottom: 5px;
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          .entete-title { 
            color: black; 
            font-weight: bold; 
            font-size: 15px;
            margin: 5px 0;
          }
          .entete-sub { 
            color: black; 
            font-weight: bold; 
            font-size: 15px; font-weight: bold;
            margin: 3px 0;
          }
          .patient-info {
            margin: 8px 0;
            font-size: 15px; font-weight: bold;
            color: black;
          }
          .total-section {
            margin-top: 10px;
            text-align: right;
            font-size: 16px; font-weight: bold;
            font-weight: bold;
            color: black;
            border-top: 2px solid black;
            padding-top: 5px;
          }
        </style>
      `);
      win.document.write('</head><body>');
      
      // Entête institutionnelle
      win.document.write('<div style="text-align:center;margin-bottom:10px;">');
      win.document.write('<img src="/logo_polycliniques.jpg" class="entete-logo" alt="Logo" />');
      
      
      
      
      
      
      
      win.document.write('<div class="entete-title">POLYCLINIQUE DES APOTRES</div>');
      win.document.write('</div>');
      
      // Informations de la facture
      win.document.write('<div class="facture">');
      win.document.write('<div class="facture-header">FACTURE</div>');
      win.document.write(`<div class="patient-info"><strong>N°:</strong> ${invoice.invoiceNumber}</div>`);
      win.document.write(`<div class="patient-info"><strong>Patient:</strong> ${invoice.patient.folderNumber} - ${invoice.patient.lastName.toUpperCase()} ${invoice.patient.firstName}</div>`);
      win.document.write(`<div class="patient-info"><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')} ${new Date(invoice.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>`);
      
      // Tableau des items
      win.document.write('<table class="facture-table">');
      win.document.write('<thead><tr><th>Désignation</th><th>Qté</th><th>PU</th><th>Total</th></tr></thead>');
      win.document.write('<tbody>');
      
      // Log chaque item avant de l'écrire
      invoice.items.forEach((item, index) => {
        console.log(`📝 Item ${index}:`, item);
        win.document.write(`<tr>
          <td>${item.description || 'N/A'}</td>
          <td>${item.quantity || 0}</td>
          <td>${item.unitPrice || 0} $</td>
          <td>${item.totalPrice || 0} $</td>
        </tr>`);
      });
      
      win.document.write('</tbody></table>');
      
      // Total
      win.document.write(`<div class="total-section"><strong>TOTAL: ${invoice.totalAmount.toFixed(2)} $</strong></div>`);
      win.document.write('</div>');
      
      // Bas de page institutionnel
      win.document.write('<div class="footer">');
      win.document.write('<strong>Adresse:</strong> DRCONGO/SK/BKV/Av. BUHOZI/KAJANGU/CIRIRI<br/>');
      win.document.write('<strong>Tél:</strong> (+243) 975 822 376, 843 066 779<br/>');
      win.document.write('<strong>Email:</strong> polycliniquedesapotres1121@gmail.com');
      win.document.write('</div>');
      
      win.document.write('</body></html>');
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
    
    // Marquer la facture comme imprimée côté backend
    try {
      await axios.patch(`/api/invoices/${invoice.id}`, { printed: true });
      // Rafraîchir la liste
      const token = localStorage.getItem('auth-token');
      let res;
      if (token) {
        res = await fetch('/api/invoices', { headers: { Authorization: `Bearer ${token}` } });
      } else {
        res = await fetch('/api/invoices');
      }
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.invoices);
      }
    } catch (e) {
      // ignore
    } finally {
      setPrintingId(null);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditInvoice(invoice);
    setEditItems(invoice.items.map(item => ({ ...item })));
    setEditTotal(invoice.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0));
    setEditError(null);
    fetchPatientActs(invoice.patient.id);
  };

  const handleEditItemChange = (idx: number, field: string, value: any) => {
    setEditItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value, totalPrice: field === 'quantity' || field === 'unitPrice' ? value * (field === 'quantity' ? item.unitPrice : item.quantity) : item.totalPrice } : item));
    setEditTotal(editItems.reduce((sum, item, i) => sum + (i === idx ? (field === 'quantity' || field === 'unitPrice' ? value * (field === 'quantity' ? item.unitPrice : item.quantity) : item.totalPrice) : item.totalPrice), 0));
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      await axios.patch(`/api/invoices/${editInvoice!.id}`, {
        items: editItems.map(({ id, ...rest }) => rest),
        totalAmount: editTotal
      });
      setEditInvoice(null);
      setEditItems([]);
      setEditTotal(0);
      fetchInvoices(selectedPatientId);
    } catch (e: any) {
      setEditError(e.response?.data?.error || 'Erreur lors de la modification de la facture');
    } finally {
      setEditLoading(false);
    }
  };

  // Filtrage et séparation des factures (à placer avant le return)
  const filteredInvoices = invoices.filter(inv => {
    const text = `${inv.invoiceNumber} ${inv.patient.folderNumber} ${inv.patient.lastName} ${inv.patient.firstName}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });
  const unprintedInvoices = filteredInvoices.filter(inv => !inv.printed);
  const printedInvoices = filteredInvoices.filter(inv => inv.printed);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Factures</h1>
      <p className="text-gray-600 mb-6">Imprimez les factures pour les consultations, médicaments et examens.</p>
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <label htmlFor="patient-select" className="font-medium">Filtrer par patient :</label>
        <select
          id="patient-select"
          className="input-field"
          value={selectedPatientId}
          onChange={e => setSelectedPatientId(e.target.value)}
        >
          <option value="">Tous les patients</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>
              {p.folderNumber} - {p.lastName.toUpperCase()} {p.firstName}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="input-field ml-2"
          placeholder="Rechercher une facture (numéro, nom, dossier...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: 200 }}
        />
      </div>
      {loading ? (
        <div className="text-center">Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2">N°</th>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Dossier</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Imprimée</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">
                  {invoices.length === 0 ? 'Aucune facture trouvée' : 'Aucune facture correspondant à votre recherche'}
                </td></tr>
              ) : (
                <>
                  {unprintedInvoices.length > 0 && (
                    <tr className="bg-yellow-50">
                      <td colSpan={7} className="px-4 py-2 font-bold text-yellow-800 text-lg">Factures non imprimées</td>
                    </tr>
                  )}
                  {unprintedInvoices.map((inv) => (
                    <React.Fragment key={inv.id}>
                      <tr className="border-t">
                        <td className="px-4 py-2 font-mono">{inv.invoiceNumber}</td>
                        <td className="px-4 py-2">{inv.patient.firstName} {inv.patient.lastName}</td>
                        <td className="px-4 py-2">{inv.patient.folderNumber}</td>
                        <td className="px-4 py-2">{inv.totalAmount.toFixed(2)} $</td>
                        <td className="px-4 py-2">
                          <span className={
                            inv.status === 'pending' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded' :
                            inv.status === 'paid' ? 'bg-green-100 text-green-800 px-2 py-1 rounded' :
                            'bg-gray-100 text-gray-800 px-2 py-1 rounded'
                          }>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {inv.printed ? <span className="text-green-600 font-bold">Oui</span> : <span className="text-gray-400">Non</span>}
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          {!inv.printed && (
                            <>
                              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" title="Modifier" onClick={() => handleEdit(inv)}>
                                Modifier
                              </button>
                              <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" title="Imprimer" onClick={() => handlePrint(inv)} disabled={printingId === inv.id}>
                                {printingId === inv.id ? 'Impression...' : 'Imprimer'}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                      {/* Détail de tous les items de la facture */}
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-4 py-2">
                          <div className="font-semibold text-blue-700 mb-1">Détails de la facture :</div>
                          <table className="w-full text-sm mb-2">
                            <thead>
                              <tr>
                                <th className="text-left">Type</th>
                                <th className="text-left">Description</th>
                                <th className="text-left">Quantité</th>
                                <th className="text-left">Prix unitaire</th>
                                <th className="text-left">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.items.map(item => (
                                <tr key={item.id}>
                                  <td>{item.type}</td>
                                  <td>{item.description}</td>
                                  <td>{item.quantity}</td>
                                  <td>{item.unitPrice} $</td>
                                  <td>{item.totalPrice} $</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                  {printedInvoices.length > 0 && (
                    <tr className="bg-gray-100">
                      <td colSpan={7} className="px-4 py-2 font-bold text-gray-700 text-lg">Factures imprimées</td>
                    </tr>
                  )}
                  {printedInvoices.map((inv) => (
                    <React.Fragment key={inv.id}>
                      <tr className="border-t">
                        <td className="px-4 py-2 font-mono">{inv.invoiceNumber}</td>
                        <td className="px-4 py-2">{inv.patient.firstName} {inv.patient.lastName}</td>
                        <td className="px-4 py-2">{inv.patient.folderNumber}</td>
                        <td className="px-4 py-2">{inv.totalAmount.toFixed(2)} $</td>
                        <td className="px-4 py-2">
                          <span className={
                            inv.status === 'pending' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded' :
                            inv.status === 'paid' ? 'bg-green-100 text-green-800 px-2 py-1 rounded' :
                            'bg-gray-100 text-gray-800 px-2 py-1 rounded'
                          }>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {inv.printed ? <span className="text-green-600 font-bold">Oui</span> : <span className="text-gray-400">Non</span>}
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          {!inv.printed && (
                            <>
                              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" title="Modifier" onClick={() => handleEdit(inv)}>
                                Modifier
                              </button>
                              <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" title="Imprimer" onClick={() => handlePrint(inv)} disabled={printingId === inv.id}>
                                {printingId === inv.id ? 'Impression...' : 'Imprimer'}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                      {/* Détail de tous les items de la facture */}
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-4 py-2">
                          <div className="font-semibold text-blue-700 mb-1">Détails de la facture :</div>
                          <table className="w-full text-sm mb-2">
                            <thead>
                              <tr>
                                <th className="text-left">Type</th>
                                <th className="text-left">Description</th>
                                <th className="text-left">Quantité</th>
                                <th className="text-left">Prix unitaire</th>
                                <th className="text-left">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.items.map(item => (
                                <tr key={item.id}>
                                  <td>{item.type}</td>
                                  <td>{item.description}</td>
                                  <td>{item.quantity}</td>
                                  <td>{item.unitPrice} $</td>
                                  <td>{item.totalPrice} $</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal d'édition de facture */}
      {editInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Modifier la facture {editInvoice.invoiceNumber}</h2>
            {editError && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{editError}</div>}
            <table className="w-full mb-4">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {editItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td>
                      {/* Sélecteur d'acte selon le type */}
                      {item.type === 'consultation' && (
                        <select
                          className="input-field"
                          value={item.consultationId || ''}
                          onChange={e => {
                            const selected = patientConsultations.find(c => c.id === Number(e.target.value));
                            if (selected) {
                              handleEditItemChange(idx, 'consultationId', selected.id);
                              handleEditItemChange(idx, 'description', selected.consultationType.name);
                              handleEditItemChange(idx, 'quantity', 1);
                              handleEditItemChange(idx, 'unitPrice', selected.consultationType.price);
                              handleEditItemChange(idx, 'totalPrice', selected.consultationType.price);
                            }
                          }}
                        >
                          <option value="">Sélectionner une consultation</option>
                          {patientConsultations.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.consultationType.name} - {new Date(c.date).toLocaleDateString('fr-FR')} ({c.consultationType.price} $)
                            </option>
                          ))}
                        </select>
                      )}
                      {item.type === 'exam' && (
                        <select
                          className="input-field"
                          value={item.examId || ''}
                          onChange={e => {
                            const selected = patientExams.find(ex => ex.id === Number(e.target.value));
                            if (selected) {
                              handleEditItemChange(idx, 'examId', selected.id);
                              handleEditItemChange(idx, 'description', selected.examType.name);
                              handleEditItemChange(idx, 'quantity', 1);
                              handleEditItemChange(idx, 'unitPrice', selected.examType.price);
                              handleEditItemChange(idx, 'totalPrice', selected.examType.price);
                            }
                          }}
                        >
                          <option value="">Sélectionner un examen</option>
                          {patientExams.map(ex => (
                            <option key={ex.id} value={ex.id}>
                              {ex.examType.name} - {new Date(ex.date).toLocaleDateString('fr-FR')} ({ex.examType.price} $)
                            </option>
                          ))}
                        </select>
                      )}
                      {item.type === 'medication' && (
                        <select
                          className="input-field"
                          value={item.medicationSaleId || ''}
                          onChange={e => {
                            const selected = patientSales.find(s => s.id === Number(e.target.value));
                            if (selected) {
                              handleEditItemChange(idx, 'medicationSaleId', selected.id);
                              handleEditItemChange(idx, 'description', selected.medication.name);
                              handleEditItemChange(idx, 'quantity', selected.quantity);
                              handleEditItemChange(idx, 'unitPrice', selected.medication.price);
                              handleEditItemChange(idx, 'totalPrice', selected.medication.price * selected.quantity);
                            }
                          }}
                        >
                          <option value="">Sélectionner une vente</option>
                          {patientSales.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.medication.name} x{s.quantity} - {new Date(s.date).toLocaleDateString('fr-FR')} ({s.medication.price * s.quantity} $)
                            </option>
                          ))}
                        </select>
                      )}
                      {/* Sinon, champ texte classique */}
                      {item.type !== 'consultation' && item.type !== 'exam' && item.type !== 'medication' && (
                        <input className="input-field" value={item.description} onChange={e => handleEditItemChange(idx, 'description', e.target.value)} />
                      )}
                    </td>
                    <td><input className="input-field" value={item.type} onChange={e => handleEditItemChange(idx, 'type', e.target.value)} /></td>
                    <td><input className="input-field" type="number" min="1" value={item.quantity} onChange={e => handleEditItemChange(idx, 'quantity', Number(e.target.value))} /></td>
                    <td><input className="input-field" type="number" min="0" value={item.unitPrice} onChange={e => handleEditItemChange(idx, 'unitPrice', Number(e.target.value))} /></td>
                    <td>{item.totalPrice} $</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">Total : {editTotal} $</span>
              <button className="btn-secondary" onClick={() => setEditInvoice(null)}>Annuler</button>
            </div>
            <button className="btn-primary" onClick={handleEditSave} disabled={editLoading}>{editLoading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices; 
