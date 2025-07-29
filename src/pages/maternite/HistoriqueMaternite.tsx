import React, { useState, useEffect } from 'react';
import axios from 'axios';

const initialFilters = {
  // Champs spécifiques à la maternité seulement
  numeroAnnuel: '',
  numeroMensuel: '',
  nomPostNomPrenom: '',
  age: '',
  adresse: '',
  typeAccouchement: '',
  jumeaux: '',
  dateAccouchement: '',
  heureAccouchement: '',
  sexeNouveauNe: '',
  poidsGrammes: '',
  apgar1: '',
  apgar2: '',
  apgar3: '',
  reanimation: '',
  atbq: '',
  indicationCesarienne: '',
  cpn: '',
  formuleObstetricale: '',
  ddr: '',
  saignementVaginal: '',
  formuleObstetricaleG: '',
  formuleObstetricaleP: '',
  formuleObstetricaleEV: '',
  formuleObstetricaleAV: '',
  formuleObstetricaleMortNe: ''
};

const HistoriqueMaternite: React.FC = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [maternites, setMaternites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fonction pour vérifier si la colonne césarienne doit être affichée
  const shouldShowCesarienneColumn = () => {
    return filters.typeAccouchement?.toLowerCase().includes('césarienne') || 
           filters.typeAccouchement?.toLowerCase().includes('cesarienne') ||
           filters.typeAccouchement?.toLowerCase().includes('cesar');
  };

  // Charger les historiques de maternité
  const fetchMaternites = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/maternity-history');
      setMaternites(response.data.histories);
    } catch (error: any) {
      setError('Erreur lors du chargement des historiques de maternité');
      console.error('Erreur fetch maternités:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    fetchMaternites();
  }, []);

  // Récupérer le dernier patient maternité pour pré-remplir
  const fetchLastMaternityPatient = async () => {
    try {
      const response = await axios.get('/api/patients');
      const patients = response.data.patients;
      
      // Chercher le dernier patient maternité (avec des champs maternité)
      const maternityPatients = patients.filter((p: any) => p.numeroAnnuel || p.numeroMensuel);
      
      if (maternityPatients.length > 0) {
        const lastPatient = maternityPatients[0]; // Le plus récent
        
        setFilters(f => ({
          ...f,
          // Champs spécifiques à la maternité seulement
          numeroAnnuel: lastPatient.numeroAnnuel || '',
          numeroMensuel: lastPatient.numeroMensuel || '',
          nomPostNomPrenom: `${lastPatient.lastName} ${lastPatient.firstName}` || '',
          age: lastPatient.age?.toString() || '',
          adresse: lastPatient.address || '',
          typeAccouchement: lastPatient.typeAccouchement || '',
          jumeaux: lastPatient.jumeaux || '',
          dateAccouchement: lastPatient.dateAccouchement ? new Date(lastPatient.dateAccouchement).toISOString().slice(0, 10) : '',
          heureAccouchement: lastPatient.heureAccouchement || '',
          sexeNouveauNe: lastPatient.sexeNouveauNe || '',
          poidsGrammes: lastPatient.poidsGrammes?.toString() || '',
          apgar1: lastPatient.apgar1 || '',
          apgar2: lastPatient.apgar2 || '',
          apgar3: lastPatient.apgar3 || '',
          reanimation: lastPatient.reanimation || '',
          atbq: lastPatient.atbq || '',
          indicationCesarienne: lastPatient.indicationCesarienne || '',
          cpn: lastPatient.cpn || '',
          formuleObstetricale: lastPatient.formuleObstetricale || '',
          ddr: lastPatient.ddr ? new Date(lastPatient.ddr).toISOString().slice(0, 10) : '',
          saignementVaginal: lastPatient.saignementVaginal || '',
          formuleObstetricaleG: lastPatient.formuleObstetricaleG || '',
          formuleObstetricaleP: lastPatient.formuleObstetricaleP || '',
          formuleObstetricaleEV: lastPatient.formuleObstetricaleEV || '',
          formuleObstetricaleAV: lastPatient.formuleObstetricaleAV || '',
          formuleObstetricaleMortNe: lastPatient.formuleObstetricaleMortNe || ''
        }));
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération du dernier patient maternité:', error);
    }
  };

  // Pré-remplir avec le dernier patient maternité
  useEffect(() => {
    fetchLastMaternityPatient();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Récupérer le dernier patient maternité pour l'associer
      const patientsResponse = await axios.get('/api/patients');
      const patients = patientsResponse.data.patients;
      const maternityPatients = patients.filter((p: any) => p.numeroAnnuel || p.numeroMensuel);
      
      if (maternityPatients.length === 0) {
        setError('Aucune patiente maternité trouvée pour associer l\'historique');
        setSaving(false);
        return;
      }

      const lastPatient = maternityPatients[0];

      // Créer l'historique de maternité avec les données de base du patient
      const historyData = {
        patientId: lastPatient.id,
        patientName: filters.nomPostNomPrenom,
        gender: 'F',
        age: filters.age ? parseInt(filters.age, 10) : 25,
        weight: lastPatient.weight || null,
        address: filters.adresse,
        profession: '',
        maritalStatus: '',
        service: 'Maternité',
        entryDate: new Date().toISOString().slice(0, 10),
        entryTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        exitDate: null,
        treatment: '',
        notes: '',
        // Champs spécifiques à la maternité
        numeroAnnuel: filters.numeroAnnuel,
        numeroMensuel: filters.numeroMensuel,
        postNom: filters.nomPostNomPrenom.split(' ').slice(-1)[0] || '',
        typeAccouchement: filters.typeAccouchement,
        jumeaux: filters.jumeaux,
        dateAccouchement: filters.dateAccouchement || null,
        heureAccouchement: filters.heureAccouchement,
        sexeNouveauNe: filters.sexeNouveauNe,
        poidsGrammes: filters.poidsGrammes ? parseInt(filters.poidsGrammes, 10) : null,
        apgar1: filters.apgar1,
        apgar2: filters.apgar2,
        apgar3: filters.apgar3,
        reanimation: filters.reanimation,
        atbq: filters.atbq,
        indicationCesarienne: filters.indicationCesarienne,
        cpn: filters.cpn,
        formuleObstetricale: filters.formuleObstetricale,
        ddr: filters.ddr || null,
        saignementVaginal: filters.saignementVaginal,
        formuleObstetricaleG: filters.formuleObstetricaleG ? parseInt(filters.formuleObstetricaleG, 10) : null,
        formuleObstetricaleP: filters.formuleObstetricaleP ? parseInt(filters.formuleObstetricaleP, 10) : null,
        formuleObstetricaleEV: filters.formuleObstetricaleEV ? parseInt(filters.formuleObstetricaleEV, 10) : null,
        formuleObstetricaleAV: filters.formuleObstetricaleAV ? parseInt(filters.formuleObstetricaleAV, 10) : null,
        formuleObstetricaleMortNe: filters.formuleObstetricaleMortNe ? parseInt(filters.formuleObstetricaleMortNe, 10) : null
      };

      await axios.post('/api/maternity-history', historyData);
      
      setSuccess('Historique de maternité enregistré avec succès !');
      
      // Réinitialiser le formulaire
      setFilters(initialFilters);
      
      // Recharger les données
      await fetchMaternites();
      
      // Re-pré-remplir avec le dernier patient
      await fetchLastMaternityPatient();
      
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setError(error.response?.data?.error || 'Erreur lors de l\'enregistrement de l\'historique');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historique des maternités</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <form onSubmit={handleSave}>
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-3 text-sm font-medium">N° ANN</th>
                <th className="border px-4 py-3 text-sm font-medium">N° MENS</th>
                <th className="border px-4 py-3 text-sm font-medium">NOM, POST-NOM, PRÉNOM</th>
                <th className="border px-4 py-3 text-sm font-medium">AGE</th>
                <th className="border px-4 py-3 text-sm font-medium">ADRESSE</th>
                <th className="border px-4 py-3 text-sm font-medium">TYPE ACC</th>
                <th className="border px-4 py-3 text-sm font-medium">JUMEAUX</th>
                <th className="border px-4 py-3 text-sm font-medium">DATE</th>
                <th className="border px-4 py-3 text-sm font-medium">HEURE</th>
                <th className="border px-4 py-3 text-sm font-medium">SEXE N-NÉ</th>
                <th className="border px-4 py-3 text-sm font-medium">POIDS EN GRAMME</th>
                <th className="border px-4 py-3 text-sm font-medium">APGAR</th>
                <th className="border px-4 py-3 text-sm font-medium">RÉANIMATION</th>
                <th className="border px-4 py-3 text-sm font-medium">ATBQ</th>
                {shouldShowCesarienneColumn() && (
                  <th className="border px-4 py-3 text-sm font-medium">INDIC SI CÉSAR</th>
                )}
                <th className="border px-4 py-3 text-sm font-medium">CPN</th>
                <th className="border px-4 py-3 text-sm font-medium">FORMULE OBSTÉTRICALE</th>
                <th className="border px-4 py-3 text-sm font-medium">DDR</th>
                <th className="border px-4 py-3 text-sm font-medium">SAIGNEMENT VAGINAL</th>
                <th className="border px-4 py-3 text-sm font-medium"></th>
              </tr>
              <tr>
                <td className="border px-4 py-3">
                  <input name="numeroAnnuel" value={filters.numeroAnnuel} onChange={handleChange} className="input-field w-full text-sm p-2" placeholder="N° annuel..." />
                </td>
                <td className="border px-4 py-3">
                  <input name="numeroMensuel" value={filters.numeroMensuel} onChange={handleChange} className="input-field w-full text-sm p-2" placeholder="N° mensuel..." />
                </td>
                <td className="border px-4 py-3">
                  <input name="nomPostNomPrenom" value={filters.nomPostNomPrenom} onChange={handleChange} className="input-field w-full text-sm p-2" placeholder="Nom, post-nom, prénom..." />
                </td>
                <td className="border px-4 py-3">
                  <input name="age" value={filters.age} onChange={handleChange} className="input-field w-full text-sm p-2" placeholder="Age..." type="number" min="0" />
                </td>
                <td className="border px-4 py-3">
                  <input name="adresse" value={filters.adresse} onChange={handleChange} className="input-field w-full text-sm p-2" placeholder="Adresse..." />
                </td>
                <td className="border px-4 py-3">
                  <select name="typeAccouchement" value={filters.typeAccouchement} onChange={handleChange} className="input-field w-full text-sm p-2">
                    <option value="">Sélectionner</option>
                    <option value="Accouchement normal">Accouchement normal</option>
                    <option value="Accouchement avec césarienne">Accouchement avec césarienne</option>
                  </select>
                </td>
                <td className="border px-4 py-3">
                  <select name="jumeaux" value={filters.jumeaux} onChange={handleChange} className="input-field w-full text-sm p-2">
                    <option value="">Sélectionner</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </td>
                <td className="border px-4 py-3">
                  <input name="dateAccouchement" value={filters.dateAccouchement} onChange={handleChange} className="input-field w-full text-sm p-2" type="date" />
                </td>
                <td className="border px-4 py-3">
                  <input name="heureAccouchement" value={filters.heureAccouchement} onChange={handleChange} className="input-field w-full text-sm p-2" type="time" />
                </td>
                <td className="border px-4 py-3">
                  <select name="sexeNouveauNe" value={filters.sexeNouveauNe} onChange={handleChange} className="input-field w-full text-sm p-2">
                    <option value="">Sélectionner</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </td>
                <td className="border px-4 py-3">
                  <input name="poidsGrammes" value={filters.poidsGrammes} onChange={handleChange} className="input-field w-full text-sm p-2" placeholder="Poids (g)..." type="number" min="0" />
                </td>
                <td className="border px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <input name="apgar1" value={filters.apgar1} onChange={handleChange} className="input-field w-12 text-sm text-center p-2" placeholder="1" type="number" min="0" max="10" />
                    <span className="text-gray-500 font-medium">/</span>
                    <input name="apgar2" value={filters.apgar2} onChange={handleChange} className="input-field w-12 text-sm text-center p-2" placeholder="2" type="number" min="0" max="10" />
                    <span className="text-gray-500 font-medium">/</span>
                    <input name="apgar3" value={filters.apgar3} onChange={handleChange} className="input-field w-12 text-sm text-center p-2" placeholder="3" type="number" min="0" max="10" />
                  </div>
                </td>
                <td className="border px-4 py-3">
                  <select name="reanimation" value={filters.reanimation} onChange={handleChange} className="input-field w-full text-sm p-2">
                    <option value="">Sélectionner</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </td>
                <td className="border px-4 py-3">
                  <select name="atbq" value={filters.atbq} onChange={handleChange} className="input-field w-full text-sm p-2">
                    <option value="">Sélectionner</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </td>
                {shouldShowCesarienneColumn() && (
                  <td className="border px-4 py-3">
                    <input name="indicationCesarienne" value={filters.indicationCesarienne} onChange={handleChange} className="input-field w-full text-sm p-2" placeholder="Indication césarienne..." />
                  </td>
                )}
                <td className="border px-4 py-3">
                  <select name="cpn" value={filters.cpn} onChange={handleChange} className="input-field w-full text-sm p-2">
                    <option value="">Sélectionner</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </td>
                <td className="border px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <input name="formuleObstetricaleG" value={filters.formuleObstetricaleG} onChange={handleChange} className="input-field w-10 text-sm text-center p-2" placeholder="G" type="number" min="0" />
                    <span className="text-gray-500 font-medium">,</span>
                    <input name="formuleObstetricaleP" value={filters.formuleObstetricaleP} onChange={handleChange} className="input-field w-10 text-sm text-center p-2" placeholder="P" type="number" min="0" />
                    <span className="text-gray-500 font-medium">,</span>
                    <input name="formuleObstetricaleEV" value={filters.formuleObstetricaleEV} onChange={handleChange} className="input-field w-10 text-sm text-center p-2" placeholder="EV" type="number" min="0" />
                    <span className="text-gray-500 font-medium">,</span>
                    <input name="formuleObstetricaleAV" value={filters.formuleObstetricaleAV} onChange={handleChange} className="input-field w-10 text-sm text-center p-2" placeholder="AV" type="number" min="0" />
                    <span className="text-gray-500 font-medium">,</span>
                    <input name="formuleObstetricaleMortNe" value={filters.formuleObstetricaleMortNe} onChange={handleChange} className="input-field w-10 text-sm text-center p-2" placeholder="Mort-né" type="number" min="0" />
                  </div>
                </td>
                <td className="border px-4 py-3">
                  <input name="ddr" value={filters.ddr} onChange={handleChange} className="input-field w-full text-sm p-2" type="date" />
                </td>
                <td className="border px-4 py-3">
                  <select name="saignementVaginal" value={filters.saignementVaginal} onChange={handleChange} className="input-field w-full text-sm p-2">
                    <option value="">Sélectionner</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </td>
                <td className="border px-4 py-3 text-center">
                  <button type="submit" className="btn-primary text-sm px-4 py-2" disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </td>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={shouldShowCesarienneColumn() ? 20 : 19} className="text-center text-gray-500 py-4">Chargement...</td>
                </tr>
              ) : maternites.length === 0 ? (
                <tr>
                  <td colSpan={shouldShowCesarienneColumn() ? 20 : 19} className="text-center text-gray-500 py-4">Aucune maternité trouvée</td>
                </tr>
              ) : (
                maternites.map((maternite) => (
                  <tr key={maternite.id}>
                    <td className="border px-4 py-3 text-sm">{maternite.numeroAnnuel || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.numeroMensuel || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.patientName || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.age || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.address || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.typeAccouchement || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.jumeaux || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.dateAccouchement ? new Date(maternite.dateAccouchement).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.heureAccouchement || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.sexeNouveauNe || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.poidsGrammes || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.apgar1 || '-'} / {maternite.apgar2 || '-'} / {maternite.apgar3 || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.reanimation || '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.atbq || '-'}</td>
                    {shouldShowCesarienneColumn() && (
                      <td className="border px-4 py-3 text-sm">{maternite.indicationCesarienne || '-'}</td>
                    )}
                    <td className="border px-4 py-3 text-sm">{maternite.cpn || '-'}</td>
                    <td className="border px-4 py-3 text-sm">
                      {maternite.formuleObstetricaleG || '-'}, {maternite.formuleObstetricaleP || '-'}, {maternite.formuleObstetricaleEV || '-'}, {maternite.formuleObstetricaleAV || '-'}, {maternite.formuleObstetricaleMortNe || '-'}
                    </td>
                    <td className="border px-4 py-3 text-sm">{maternite.ddr ? new Date(maternite.ddr).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="border px-4 py-3 text-sm">{maternite.saignementVaginal || '-'}</td>
                    <td className="border px-4 py-3 text-sm"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
};

export default HistoriqueMaternite; 