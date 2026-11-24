import { useState } from 'react';
import { api, messageOf } from '../api';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { money } from '../format';

export default function Gift() {
  const [code, setCode] = useState('TABLE-HIVER');
  const [liste, setListe] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const cart = useCart();

  async function load(event) {
    event.preventDefault();
    setError('');
    setListe(null);
    try {
      const { data } = await api.get(`/listes/${encodeURIComponent(code.trim())}`);
      setListe(data.liste);
    } catch (err) {
      setError(messageOf(err));
    }
  }

  async function take(item) {
    setInfo('');
    await cart.add({
      id: item.ouvrageId,
      titre: item.titre,
      auteur: item.auteur,
      prix: item.prix,
      stock: item.stock,
    }, 1);
    setInfo(cart.error || `${item.titre} a été ajouté au panier.`);
  }

  return (
    <Layout>
      <div className="container">
        <h1>Liste de cadeaux</h1>
        <p>L’accès se fait avec le code reçu. La liste de démonstration est TABLE-HIVER.</p>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {info && <p className="alert alert-secondary" role="status">{info}</p>}
        <form className="row g-2 col-lg-6 mb-4" onSubmit={load}>
          <div className="col-8">
            <label htmlFor="code">Code personnel</label>
            <input id="code" className="form-control" value={code} onChange={(event) => setCode(event.target.value)} required />
          </div>
          <div className="col-4 d-flex align-items-end">
            <button className="btn btn-gold w-100" type="submit">Ouvrir</button>
          </div>
        </form>
        {liste && (
          <>
            <h2>{liste.nom}</h2>
            <p>Liste de {liste.proprietaire}</p>
            {liste.items.length === 0 && <p>Cette liste ne contient aucun ouvrage.</p>}
            <ul className="list-group">
              {liste.items.map((item) => (
                <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2" key={item.id}>
                  <span>{item.titre} — {money(item.prix)} — reste {item.reste}</span>
                  <button className="btn btn-navy" type="button" disabled={item.reste <= 0 || item.stock <= 0} onClick={() => take(item)}>Mettre au panier</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Layout>
  );
}
