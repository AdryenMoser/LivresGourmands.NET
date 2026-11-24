import { useEffect, useState } from 'react';
import { api, messageOf } from '../api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { money } from '../format';

const empty = { titre: '', auteur: '', isbn: '', description: '', prix: '', stock: '', categorieId: '' };
const statuts = ['en_attente_paiement', 'payee', 'en_preparation', 'expediee', 'livree', 'annulee'];

export default function Dashboard() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const admin = user.role === 'administrateur';
  const ordersOk = user.role === 'gestionnaire' || admin;

  function loadBooks() {
    return api.get('/ouvrages', { params: { limite: 48, inclureRupture: 1 } })
      .then(({ data }) => setBooks(data.ouvrages));
  }

  useEffect(() => {
    loadBooks().catch((err) => setError(messageOf(err)));
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
    if (ordersOk) api.get('/commandes').then(({ data }) => setOrders(data.commandes)).catch((err) => setError(messageOf(err)));
    if (admin) api.get('/users').then(({ data }) => setUsers(data.utilisateurs)).catch((err) => setError(messageOf(err)));
  }, [admin, ordersOk]);

  function setField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    setInfo('');
    const body = {
      ...form,
      prix: Number(form.prix),
      stock: Number(form.stock),
      categorieId: Number(form.categorieId),
    };
    try {
      if (editing) await api.put(`/ouvrages/${editing}`, body);
      else await api.post('/ouvrages', body);
      setForm(empty);
      setEditing(null);
      setInfo(editing ? 'Ouvrage modifié.' : 'Ouvrage ajouté.');
      await loadBooks();
    } catch (err) {
      setError(messageOf(err));
    }
  }

  function edit(book) {
    setEditing(book.id);
    setForm({
      titre: book.titre,
      auteur: book.auteur,
      isbn: book.isbn,
      description: book.description || '',
      prix: book.prix,
      stock: book.stock,
      categorieId: book.categorie.id,
    });
  }

  async function destroy(book) {
    setError('');
    try {
      await api.delete(`/ouvrages/${book.id}`);
      setInfo(`${book.titre} a été retiré du catalogue.`);
      await loadBooks();
    } catch (err) {
      setError(messageOf(err));
    }
  }

  async function status(order, statut) {
    try {
      await api.put(`/commandes/${order.id}/status`, { statut });
      const { data } = await api.get('/commandes');
      setOrders(data.commandes);
    } catch (err) {
      setError(messageOf(err));
    }
  }

  async function suspend(account) {
    try {
      await api.put(`/users/${account.id}`, { actif: !account.actif });
      const { data } = await api.get('/users');
      setUsers(data.utilisateurs);
    } catch (err) {
      setError(messageOf(err));
    }
  }

  return (
    <Layout>
      <div className="container">
        <div className="row">
          <aside className="col-lg-3 mb-4">
            <nav className="nav flex-column border p-3 bg-white" aria-label="Atelier">
              <span className="fw-semibold mb-2">Atelier</span>
              <a className="nav-link" href="#ouvrages">Ouvrages</a>
              {ordersOk && <a className="nav-link" href="#commandes">Commandes</a>}
              {admin && <a className="nav-link" href="#comptes">Comptes</a>}
            </nav>
          </aside>
          <div className="col-lg-9">
            <h1>Tableau de bord</h1>
            <p>Connecté comme {user.prenom} ({user.role}).</p>
            {error && <p className="alert alert-danger" role="alert">{error}</p>}
            {info && <p className="alert alert-secondary" role="status">{info}</p>}

            <section id="ouvrages" className="mb-5">
              <h2>{editing ? 'Modifier un ouvrage' : 'Ajouter un ouvrage'}</h2>
              <form className="row g-2" onSubmit={save}>
                <div className="col-md-6"><label htmlFor="titre">Titre</label><input id="titre" className="form-control" required value={form.titre} onChange={setField('titre')} /></div>
                <div className="col-md-6"><label htmlFor="auteur">Auteur</label><input id="auteur" className="form-control" required value={form.auteur} onChange={setField('auteur')} /></div>
                <div className="col-md-4"><label htmlFor="isbn">ISBN</label><input id="isbn" className="form-control" required value={form.isbn} onChange={setField('isbn')} /></div>
                <div className="col-md-4"><label htmlFor="prix">Prix (€)</label><input id="prix" className="form-control" type="number" min="0" step="0.01" required value={form.prix} onChange={setField('prix')} /></div>
                <div className="col-md-4"><label htmlFor="stock">Stock</label><input id="stock" className="form-control" type="number" min="0" required value={form.stock} onChange={setField('stock')} /></div>
                <div className="col-12">
                  <label htmlFor="cat">Catégorie</label>
                  <select id="cat" className="form-select" required value={form.categorieId} onChange={setField('categorieId')}>
                    <option value="">Choisir</option>
                    {categories.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}
                  </select>
                </div>
                <div className="col-12"><label htmlFor="desc">Description</label><textarea id="desc" className="form-control" value={form.description} onChange={setField('description')} /></div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-gold" type="submit">{editing ? 'Enregistrer' : 'Ajouter'}</button>
                  {editing && <button className="btn btn-outline-dark" type="button" onClick={() => { setEditing(null); setForm(empty); }}>Annuler</button>}
                </div>
              </form>
              <ul className="list-group mt-3">
                {books.map((book) => (
                  <li className="list-group-item d-flex justify-content-between gap-2 flex-wrap" key={book.id}>
                    <span>{book.titre} — {money(book.prix)} — stock {book.stock}</span>
                    <span>
                      <button className="btn btn-sm btn-outline-dark me-2" type="button" onClick={() => edit(book)}>Modifier</button>
                      <button className="btn btn-sm btn-navy" type="button" onClick={() => destroy(book)}>Supprimer</button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {ordersOk && (
              <section id="commandes" className="mb-5">
                <h2>Commandes</h2>
                {orders.length === 0 && <p>Aucune commande.</p>}
                <ul className="list-unstyled">
                  {orders.map((order) => (
                    <li className="border bg-white p-2 mb-2" key={order.id}>
                      <span>n° {order.id} — {order.acheteurNom} — {money(order.total)}</span>
                      <label className="visually-hidden" htmlFor={`st-${order.id}`}>Statut de la commande {order.id}</label>
                      <select id={`st-${order.id}`} className="form-select mt-2" value={order.statut} onChange={(event) => status(order, event.target.value)}>
                        {statuts.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {admin && (
              <section id="comptes">
                <h2>Comptes</h2>
                <ul className="list-group">
                  {users.map((account) => (
                    <li className="list-group-item d-flex justify-content-between flex-wrap gap-2" key={account.id}>
                      <span>{account.prenom} {account.nom} — {account.email} — {account.role} — {account.actif ? 'actif' : 'suspendu'}</span>
                      <button className="btn btn-sm btn-outline-dark" type="button" onClick={() => suspend(account)}>{account.actif ? 'Suspendre' : 'Réactiver'}</button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
