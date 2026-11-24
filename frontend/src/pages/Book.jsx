import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, messageOf } from '../api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { money, stars } from '../format';

export default function Book() {
  const { id } = useParams();
  const { user } = useAuth();
  const cart = useCart();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantite, setQuantite] = useState(1);
  const [note, setNote] = useState(5);
  const [contenu, setContenu] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api.get(`/ouvrages/${id}`)
      .then(({ data: body }) => { if (!cancel) { setData(body); setError(''); } })
      .catch((err) => { if (!cancel) setError(messageOf(err)); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [id]);

  async function add(event) {
    event.preventDefault();
    setInfo('');
    await cart.add(data.ouvrage, quantite);
    if (!cart.error) setInfo('Ajouté au panier.');
  }

  async function review(event) {
    event.preventDefault();
    setInfo('');
    try {
      await api.post(`/ouvrages/${id}/avis`, { note: Number(note) });
      setInfo('Avis enregistré.');
      const { data: body } = await api.get(`/ouvrages/${id}`);
      setData(body);
    } catch (err) {
      setInfo(messageOf(err));
    }
  }

  async function comment(event) {
    event.preventDefault();
    setInfo('');
    try {
      await api.post(`/ouvrages/${id}/commentaires`, { contenu });
      setContenu('');
      setInfo('Commentaire envoyé. Il sera visible après validation d’un éditeur.');
    } catch (err) {
      setInfo(messageOf(err));
    }
  }

  const book = data?.ouvrage;

  return (
    <Layout>
      <div className="container">
        {loading && <p role="status">Chargement de la fiche…</p>}
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {book && (
          <div className="row g-4">
            <div className="col-md-4">
              <div className="cover" style={{ minHeight: 320 }}><strong>{book.titre}</strong></div>
            </div>
            <div className="col-md-8">
              <p className="text-uppercase small mb-1" style={{ letterSpacing: '0.12em' }}>{book.categorie?.nom}</p>
              <h1>{book.titre}</h1>
              <p>{book.auteur} · ISBN {book.isbn}</p>
              <p className="fs-4">{money(book.prix)}</p>
              <p>{book.stock > 0 ? `${book.stock} en stock` : 'Épuisé'}</p>
              <p>{book.description || 'Pas de résumé pour cet ouvrage.'}</p>
              {data.noteMoyenne != null && <p aria-label={`Note moyenne ${data.noteMoyenne} sur 5`}>{stars(data.noteMoyenne)} · {data.nombreAvis} avis</p>}
              {(cart.error || info) && <p className="alert alert-secondary" role="status">{cart.error || info}</p>}
              <form className="d-flex gap-2 align-items-end" onSubmit={add}>
                <div>
                  <label htmlFor="qte">Quantité</label>
                  <input id="qte" className="form-control" type="number" min="1" max="20" value={quantite} onChange={(event) => setQuantite(event.target.value)} />
                </div>
                <button className="btn btn-gold" type="submit" disabled={book.stock <= 0}>Ajouter au panier</button>
              </form>
            </div>
            <div className="col-lg-6">
              <h2>Avis</h2>
              {data.avis.length === 0 && <p>Pas encore d’avis.</p>}
              <ul className="list-unstyled">
                {data.avis.map((item) => (
                  <li key={`${item.auteur}-${item.date}`} className="mb-2"><strong>{stars(item.note)}</strong> {item.auteur}</li>
                ))}
              </ul>
              {user?.role === 'client' && (
                <form onSubmit={review} className="mb-3">
                  <label htmlFor="note">Votre note</label>
                  <select id="note" className="form-select mb-2" value={note} onChange={(event) => setNote(event.target.value)}>
                    {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
                  </select>
                  <button className="btn btn-navy" type="submit">Publier l’avis</button>
                </form>
              )}
            </div>
            <div className="col-lg-6">
              <h2>Commentaires</h2>
              {data.commentaires.length === 0 && <p>Aucun commentaire validé.</p>}
              <ul className="list-unstyled">
                {data.commentaires.map((item) => (
                  <li key={`${item.auteur}-${item.date}`} className="mb-3"><strong>{item.auteur}</strong><br />{item.contenu}</li>
                ))}
              </ul>
              {user?.role === 'client' && (
                <form onSubmit={comment}>
                  <label htmlFor="contenu">Votre commentaire</label>
                  <textarea id="contenu" className="form-control mb-2" required minLength={4} value={contenu} onChange={(event) => setContenu(event.target.value)} />
                  <button className="btn btn-navy" type="submit">Envoyer</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
