import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [texte, setTexte] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const staff = user && ['editeur', 'gestionnaire', 'administrateur'].includes(user.role);

  function search(event) {
    event.preventDefault();
    setOpen(false);
    navigate(texte.trim() ? `/?texte=${encodeURIComponent(texte.trim())}` : '/');
  }

  return (
    <>
      <a className="skip" href="#contenu">Aller au contenu</a>
      <nav className="navbar navbar-expand-lg navbar-dark site-nav sticky-top">
        <div className="container">
          <Link className="navbar-brand brand-name" to="/">Livres Gourmands</Link>
          <button className="navbar-toggler" type="button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((value) => !value)}>
            <span className="navbar-toggler-icon" />
            <span className="visually-hidden">Menu</span>
          </button>
          <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="menu">
            <div className="navbar-nav me-auto">
              <NavLink className="nav-link" to="/" end onClick={() => setOpen(false)}>Catalogue</NavLink>
              <NavLink className="nav-link" to="/liste" onClick={() => setOpen(false)}>Liste cadeau</NavLink>
              <NavLink className="nav-link" to="/panier" onClick={() => setOpen(false)}>Panier ({count})</NavLink>
              {staff && <NavLink className="nav-link" to="/admin" onClick={() => setOpen(false)}>Atelier</NavLink>}
            </div>
            <form className="d-flex my-2 my-lg-0" role="search" onSubmit={search}>
              <label className="visually-hidden" htmlFor="q">Rechercher un livre</label>
              <input id="q" className="form-control me-2" value={texte} onChange={(event) => setTexte(event.target.value)} placeholder="Titre, auteur, ISBN" />
              <button className="btn btn-gold" type="submit">Chercher</button>
            </form>
            <div className="navbar-nav ms-lg-3">
              {user ? (
                <>
                  <NavLink className="nav-link" to="/compte" onClick={() => setOpen(false)}>{user.prenom}</NavLink>
                  <button className="btn btn-link nav-link" type="button" onClick={() => { logout(); setOpen(false); navigate('/'); }}>Sortir</button>
                </>
              ) : (
                <NavLink className="nav-link" to="/connexion" onClick={() => setOpen(false)}>Connexion</NavLink>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main id="contenu" className="page" tabIndex={-1}>{children}</main>
      <footer className="site-foot">
        <div className="container">
          <p className="mb-1">Livres Gourmands — livres de cuisine pour débutants, amateurs et chefs.</p>
          <p className="mb-0 small">Le paiement est simulé. Aucun numéro de carte n’est demandé ni enregistré.</p>
        </div>
      </footer>
    </>
  );
}
