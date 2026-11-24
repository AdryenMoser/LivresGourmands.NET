import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, messageOf } from '../api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { money } from '../format';

export default function Account() {
  const { user } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [listes, setListes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'client') return;
    api.get('/commandes').then(({ data }) => setCommandes(data.commandes)).catch((err) => setError(messageOf(err)));
    api.get('/listes').then(({ data }) => setListes(data.listes)).catch(() => {});
  }, [user]);

  return (
    <Layout>
      <div className="container">
        <h1>Bonjour {user.prenom}</h1>
        <p>Rôle : {user.role}</p>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {user.role === 'client' ? (
          <>
            <h2>Commandes</h2>
            {commandes.length === 0 && <p>Aucune commande pour le moment.</p>}
            <ul>
              {commandes.map((commande) => (
                <li key={commande.id}>
                  n° {commande.id} — {money(commande.total)} — {commande.statut}
                  {commande.paiement?.reference && (
                    <> · <Link to={`/paiement/${commande.paiement.reference}`}>suivi</Link></>
                  )}
                </li>
              ))}
            </ul>
            <h2>Listes</h2>
            {listes.length === 0 && <p>Aucune liste créée.</p>}
            <ul>{listes.map((liste) => <li key={liste.id}>{liste.nom} — code {liste.codePartage}</li>)}</ul>
          </>
        ) : (
          <p><Link to="/admin">Ouvrir l’atelier</Link></p>
        )}
      </div>
    </Layout>
  );
}
