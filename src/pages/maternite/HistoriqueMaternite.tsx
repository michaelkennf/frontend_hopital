import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Instance axios séparée pour les routes maternité sans authentification
const maternityAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://backend-hopital-8098.onrender.com'
});

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
      const response = await maternityAxios.get('/api/maternity-history');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Construire la formule obstétricale comme une chaîne
      console.log('🔍 Valeurs formule obstétricale avant envoi:', {
        G: filters.formuleObstetricaleG,
        P: filters.formuleObstetricaleP,
        EV: filters.formuleObstetricaleEV,
        AV: filters.formuleObstetricaleAV,
        MortNe: filters.formuleObstetricaleMortNe
      });
      
      const formuleObstetricaleComplete = [
        filters.formuleObstetricaleG || '0',
        filters.formuleObstetricaleP || '0',
        filters.formuleObstetricaleEV || '0',
        filters.formuleObstetricaleAV || '0',
        filters.formuleObstetricaleMortNe || '0'
      ].join(', ');
      
      console.log('📝 Formule obstétricale construite:', formuleObstetricaleComplete);

      // Créer l'historique de maternité sans association à un patient spécifique
      const historyData = {
        // Ne pas envoyer patientId pour laisser le backend créer un patient automatiquement
        patientName: filters.nomPostNomPrenom,
        gender: 'F',
        age: filters.age ? parseInt(filters.age, 10) : 25,
        weight: null,
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
        // Envoyer les valeurs individuelles au lieu de la formule construite
        formuleObstetricaleG: filters.formuleObstetricaleG,
        formuleObstetricaleP: filters.formuleObstetricaleP,
        formuleObstetricaleEV: filters.formuleObstetricaleEV,
        formuleObstetricaleAV: filters.formuleObstetricaleAV,
        formuleObstetricaleMortNe: filters.formuleObstetricaleMortNe,
        formuleObstetricale: formuleObstetricaleComplete,
        ddr: filters.ddr || null,
        saignementVaginal: filters.saignementVaginal
      };

      console.log('Données envoyées:', historyData);

      const response = await maternityAxios.post('/api/maternity-history', historyData);
      
      console.log('Réponse du serveur:', response.data);
      
      setSuccess('Historique de maternité enregistré avec succès !');
      
      // Réinitialiser le formulaire
      setFilters(initialFilters);
      
      // Recharger les données
      await fetchMaternites();
      
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      setError(error.response?.data?.error || error.response?.data?.details || 'Erreur lors de l\'enregistrement de l\'historique');
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
                <th className="border px-4 py-3 text-sm"></th>
              </tr>
              <tr>
                <td className="border px-4 py-3">
                  <input name="numeroAnnuel" value={filters.numeroAnnuel} onChange={handleChange} className="input-field w-full text-sm p-2" placeholder="N° annuel..." type="text" />
                </td>
                <td className="border px-4 py-3">
                  <input name="numeroMensuel" value={filters.numeroMensuel} onChange={handleChange} className="input-field w-full text-sm p-2" placeholder="N° mensuel..." type="text" />
                </td>
                <td className="border px-4 py-3">
                  <input name="nomPostNomPrenom" value={filters.nomPostNomPrenom} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[200px]" placeholder="Nom, post-nom, prénom..." />
                </td>
                <td className="border px-4 py-3">
                  <input name="age" value={filters.age} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[80px]" placeholder="Age..." type="number" min="0" />
                </td>
                <td className="border px-4 py-3">
                  <input name="adresse" value={filters.adresse} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[150px]" placeholder="Adresse..." />
                </td>
                <td className="border px-4 py-3">
                  <select name="typeAccouchement" value={filters.typeAccouchement} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[150px]">
                    <option value="">Sélectionner</option>
                    <option value="Accouchement normal">Accouchement normal</option>
                    <option value="Accouchement avec césarienne">Accouchement avec césarienne</option>
                  </select>
                </td>
                <td className="border px-4 py-3">
                  <select name="jumeaux" value={filters.jumeaux} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[100px]">
                    <option value="">Sélectionner</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </td>
                <td className="border px-4 py-3">
                  <input name="dateAccouchement" value={filters.dateAccouchement} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[120px]" type="date" />
                </td>
                <td className="border px-4 py-3">
                  <input name="heureAccouchement" value={filters.heureAccouchement} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[100px]" type="time" />
                </td>
                <td className="border px-4 py-3">
                  <select name="sexeNouveauNe" value={filters.sexeNouveauNe} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[100px]">
                    <option value="">Sélectionner</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </td>
                <td className="border px-4 py-3">
                  <input name="poidsGrammes" value={filters.poidsGrammes} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[120px]" placeholder="Poids (g)..." type="number" min="0" />
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
                  <select name="reanimation" value={filters.reanimation} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[100px]">
                    <option value="">Sélectionner</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </td>
                <td className="border px-4 py-3">
                  <select name="atbq" value={filters.atbq} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[100px]">
                    <option value="">Sélectionner</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </td>
                {shouldShowCesarienneColumn() && (
                  <td className="border px-4 py-3">
                    <input name="indicationCesarienne" value={filters.indicationCesarienne} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[150px]" placeholder="Indication césarienne..." />
                  </td>
                )}
                <td className="border px-4 py-3">
                  <select name="cpn" value={filters.cpn} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[100px]">
                    <option value="">Sélectionner</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </td>
                <td className="border px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <input name="formuleObstetricaleG" value={filters.formuleObstetricaleG} onChange={handleChange} className="input-field w-12 text-sm text-center p-2" placeholder="G" type="number" min="0" />
                    <span className="text-gray-500 font-medium">,</span>
                    <input name="formuleObstetricaleP" value={filters.formuleObstetricaleP} onChange={handleChange} className="input-field w-12 text-sm text-center p-2" placeholder="P" type="number" min="0" />
                    <span className="text-gray-500 font-medium">,</span>
                    <input name="formuleObstetricaleEV" value={filters.formuleObstetricaleEV} onChange={handleChange} className="input-field w-12 text-sm text-center p-2" placeholder="EV" type="number" min="0" />
                    <span className="text-gray-500 font-medium">,</span>
                    <input name="formuleObstetricaleAV" value={filters.formuleObstetricaleAV} onChange={handleChange} className="input-field w-12 text-sm text-center p-2" placeholder="AV" type="number" min="0" />
                    <span className="text-gray-500 font-medium">,</span>
                    <input name="formuleObstetricaleMortNe" value={filters.formuleObstetricaleMortNe} onChange={handleChange} className="input-field w-12 text-sm text-center p-2" placeholder="Mort-né" type="number" min="0" />
                  </div>
                </td>
                <td className="border px-4 py-3">
                  <input name="ddr" value={filters.ddr} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[120px]" type="date" />
                </td>
                <td className="border px-4 py-3">
                  <select name="saignementVaginal" value={filters.saignementVaginal} onChange={handleChange} className="input-field w-full text-sm p-2 min-w-[120px]">
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
                      {maternite.formuleObstetricale || '-'}
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