import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, messageOf } from '../api';
import { money } from '../format';
import { useState } from 'react';

export default function Cart() {
  const cart = useCart();
  const { user } = useAuth();
  const [nom, setNom] = useState('Table de fête');
  const [info, setInfo] = useState('');

  async function makeList(event) {
    event.preventDefault();
    setInfo('');
    try {
      const { data } = await api.post('/listes', {
        nom,
        items: cart.items.map((line) => ({ ouvrageId: line.ouvrageId, quantiteSouhaitee: line.quantite })),
      });
      await cart.clear();
      setInfo(`Liste créée. Le code à partager est ${data.liste.codePartage}.`);
    } catch (err) {
      setInfo(messageOf(err));
    }
  }

  return (
    <Layout>
      <div className="container">
        <h1>Panier</h1>
        {cart.busy && <p role="status">Synchronisation du panier…</p>}
        {(cart.error || info) && <p className="alert alert-secondary" role="status">{cart.error || info}</p>}
        {cart.items.length === 0 && <p className="notice p-3">Le panier est vide. Le catalogue a de quoi le remplir.</p>}
        {cart.items.length > 0 && (
          <div className="table-responsive">
            <table className="table align-middle">
              <caption className="visually-hidden">Contenu du panier</caption>
              <thead>
                <tr><th>Ouvrage</th><th>Prix</th><th>Quantité</th><th>Sous-total</th><th></th></tr>
              </thead>
              <tbody>
                {cart.items.map((line) => (
                  <tr key={line.ouvrageId}>
                    <td>{line.titre}<br /><span className="text-secondary">{line.auteur}</span></td>
                    <td>{money(line.prix)}</td>
                    <td>
                      <label className="visually-hidden" htmlFor={`q-${line.ouvrageId}`}>Quantité de {line.titre}</label>
                      <input id={`q-${line.ouvrageId}`} className="form-control" style={{ width: '5rem' }} type="number" min="1" max="20" value={line.quantite} onChange={(event) => cart.update(line, event.target.value)} />
                    </td>
                    <td>{money(line.prix * line.quantite)}</td>
                    <td><button className="btn btn-outline-dark" type="button" onClick={() => cart.remove(line)}>Retirer</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="fs-4">Total {money(cart.total)}</p>
            {user?.role === 'client' ? (
              <Link className="btn btn-gold" to="/commande">Choisir la livraison</Link>
            ) : (
              <Link className="btn btn-gold" to="/connexion">Se connecter pour commander</Link>
            )}
          </div>
        )}
        {user?.role === 'client' && cart.items.length > 0 && (
          <form className="mt-4 col-lg-6" onSubmit={makeList}>
            <h2>En faire une liste cadeau</h2>
            <p>Le panier est vidé au moment où la liste est créée.</p>
            <label htmlFor="nom-liste">Nom de la liste</label>
            <input id="nom-liste" className="form-control mb-2" value={nom} onChange={(event) => setNom(event.target.value)} required minLength={2} />
            <button className="btn btn-navy" type="submit">Créer la liste</button>
          </form>
        )}
      </div>
    </Layout>
  );
}
