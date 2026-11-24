import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Missing() {
  return (
    <Layout>
      <div className="container">
        <h1>Page introuvable</h1>
        <p>Cette adresse ne correspond à aucune page du site.</p>
        <Link className="btn btn-gold" to="/">Retour au catalogue</Link>
      </div>
    </Layout>
  );
}
