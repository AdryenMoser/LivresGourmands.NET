import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { messageOf } from '../api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', motDePasse: '' });
  const [error, setError] = useState('');

  function set(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(messageOf(err));
    }
  }

  return (
    <Layout>
      <div className="container col-lg-6">
        <h1>Créer un compte</h1>
        <p>Le mot de passe est hashé avec bcrypt côté serveur. Il n’est pas enregistré en clair.</p>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        <form onSubmit={submit}>
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" className="form-control mb-3" required value={form.prenom} onChange={set('prenom')} />
          <label htmlFor="nom">Nom</label>
          <input id="nom" className="form-control mb-3" required value={form.nom} onChange={set('nom')} />
          <label htmlFor="email">Courriel</label>
          <input id="email" className="form-control mb-3" type="email" required value={form.email} onChange={set('email')} />
          <label htmlFor="pass">Mot de passe</label>
          <input id="pass" className="form-control mb-3" type="password" required minLength={8} value={form.motDePasse} onChange={set('motDePasse')} />
          <p className="small text-secondary">Au moins 8 caractères, une lettre et un chiffre.</p>
          <button className="btn btn-gold" type="submit">Enregistrer</button>
        </form>
        <p className="mt-3"><Link to="/connexion">J’ai déjà un compte</Link></p>
      </div>
    </Layout>
  );
}
