import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { messageOf } from '../api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const account = await login(email, motDePasse);
      navigate(account.role === 'client' ? '/' : '/admin');
    } catch (err) {
      setError(messageOf(err));
    }
  }

  return (
    <Layout>
      <div className="container col-lg-6">
        <h1>Connexion</h1>
        {user && <p>Vous êtes déjà connecté en tant que {user.prenom}.</p>}
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        <form onSubmit={submit}>
          <label htmlFor="email">Courriel</label>
          <input id="email" className="form-control mb-3" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="pass">Mot de passe</label>
          <input id="pass" className="form-control mb-3" type="password" autoComplete="current-password" required value={motDePasse} onChange={(event) => setMotDePasse(event.target.value)} />
          <button className="btn btn-gold" type="submit">Entrer</button>
        </form>
        <p className="mt-3"><Link to="/inscription">Créer un compte</Link></p>
        <p className="text-secondary">Le mot de passe oublié n’envoie pas de courriel : cette fonction n’est pas dans l’API. Utilisez un compte de démonstration, par exemple camille.client@livresgourmands.test.</p>
      </div>
    </Layout>
  );
}
