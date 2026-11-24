import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, messageOf } from '../api';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { money } from '../format';

export default function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const [adresse, setAdresse] = useState('');
  const [modeLivraison, setModeLivraison] = useState('standard');
  const [modePaiement, setModePaiement] = useState('carte_simulee');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/commandes', { adresseLivraison: adresse, modeLivraison, modePaiement });
      const reference = data.commande.paiement?.reference;
      navigate(reference ? `/paiement/${reference}` : '/compte');
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="container col-lg-8">
        <h1>Livraison et règlement</h1>
        <p>Total à régler : {money(cart.total)}. Aucune donnée de carte n’est saisie ici.</p>
        {cart.items.length === 0 && <p className="notice p-3">Le panier est vide. Revenez au catalogue avant de commander.</p>}
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        <form onSubmit={submit}>
          <fieldset className="mb-3">
            <legend>Mode de livraison</legend>
            {[['standard', 'Standard'], ['express', 'Express'], ['relais', 'Point relais']].map(([value, label]) => (
              <div className="form-check" key={value}>
                <input className="form-check-input" type="radio" name="livraison" id={`liv-${value}`} value={value} checked={modeLivraison === value} onChange={() => setModeLivraison(value)} />
                <label className="form-check-label" htmlFor={`liv-${value}`}>{label}</label>
              </div>
            ))}
          </fieldset>
          <fieldset className="mb-3">
            <legend>Mode de règlement simulé</legend>
            <div className="form-check">
              <input className="form-check-input" type="radio" name="paiement" id="carte" value="carte_simulee" checked={modePaiement === 'carte_simulee'} onChange={() => setModePaiement('carte_simulee')} />
              <label className="form-check-label" htmlFor="carte">Carte simulée</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" name="paiement" id="paypal" value="paypal_simule" checked={modePaiement === 'paypal_simule'} onChange={() => setModePaiement('paypal_simule')} />
              <label className="form-check-label" htmlFor="paypal">PayPal simulé</label>
            </div>
          </fieldset>
          <label htmlFor="adresse">Adresse de livraison</label>
          <textarea id="adresse" className="form-control mb-3" required minLength={10} value={adresse} onChange={(event) => setAdresse(event.target.value)} />
          <button className="btn btn-gold" type="submit" disabled={busy || cart.items.length === 0}>{busy ? 'Envoi…' : 'Confirmer la commande'}</button>
        </form>
      </div>
    </Layout>
  );
}
