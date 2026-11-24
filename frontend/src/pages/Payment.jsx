import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, messageOf } from '../api';
import Layout from '../components/Layout';
import { money } from '../format';

export default function Payment() {
  const { reference } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  function load() {
    return api.get(`/paiements/${reference}`)
      .then(({ data: body }) => { setData(body); setError(''); })
      .catch((err) => setError(messageOf(err)));
  }

  useEffect(() => { load(); }, [reference]);

  async function simulate(resultat) {
    setInfo('');
    try {
      const { data: body } = await api.post(`/paiements/${reference}/simuler`, { resultat });
      setData(body);
      setInfo(resultat === 'reussi' ? 'Paiement accepté. Le stock a été mis à jour.' : 'Paiement refusé. Aucune carte n’a été enregistrée.');
    } catch (err) {
      setInfo(messageOf(err));
    }
  }

  return (
    <Layout>
      <div className="container col-lg-8">
        <h1>Confirmation</h1>
        <p>Page de règlement simulée. La référence du prestataire est {reference}.</p>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {info && <p className="alert alert-secondary" role="status">{info}</p>}
        {data && (
          <>
            <p>Commande n° {data.commande.id} — {money(data.commande.total)} — {data.commande.statut}</p>
            <ul>
              {data.commande.lignes?.map((ligne) => (
                <li key={ligne.titre}>{ligne.quantite} × {ligne.titre}</li>
              ))}
            </ul>
            <p>Statut du paiement : {data.paiement.statut}</p>
            {data.paiement.statut !== 'reussi' && data.paiement.statut !== 'annule' && (
              <div className="d-flex gap-2">
                <button className="btn btn-gold" type="button" onClick={() => simulate('reussi')}>Simuler un paiement réussi</button>
                <button className="btn btn-outline-dark" type="button" onClick={() => simulate('echoue')}>Simuler un échec</button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
