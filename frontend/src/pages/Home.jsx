import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, messageOf } from '../api';
import BookCard from '../components/BookCard';
import Layout from '../components/Layout';
import { coverFor } from '../covers';

export default function Home() {
  const [params, setParams] = useSearchParams();
  const texte = params.get('texte') || '';
  const categorie = params.get('categorie') || '';
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api.get('/ouvrages', { params: { texte: texte || undefined, categorie: categorie || undefined, limite: 12 } })
      .then(({ data }) => {
        if (!cancel) {
          setBooks(data.ouvrages);
          setError('');
        }
      })
      .catch((err) => { if (!cancel) setError(messageOf(err)); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [texte, categorie]);

  const spotlight = books.slice(0, 3);

  function chooseCategory(id) {
    const next = new URLSearchParams(params);
    if (id) next.set('categorie', id);
    else next.delete('categorie');
    setParams(next);
  }

  return (
    <Layout>
      <section className="hero mb-4">
        <div className="container py-4">
          <p className="text-uppercase small mb-2" style={{ letterSpacing: '0.16em', color: '#d7db2f' }}>Librairie de cuisine</p>
          <h1 className="display-5">Du premier couteau au dernier service</h1>
          <p className="col-lg-8">Des livres pour débuter, pour recevoir, et pour les services qui n’admettent pas l’à-peu-près.</p>
        </div>
        {spotlight.length > 0 && (
          <div className="container pb-4" aria-roledescription="carrousel">
            <div className="bg-white text-dark">
              <div className="row g-0">
                <div className="col-md-4">
                  <img className="cover-photo" src={coverFor(spotlight[slide].titre)} alt={`Couverture de ${spotlight[slide].titre}`} />
                </div>
                <div className="col-md-8 p-4">
                  <h2 className="h3 text-uppercase">{spotlight[slide].titre}</h2>
                  <p className="mb-1">{spotlight[slide].auteur}</p>
                  <p>{spotlight[slide].categorie?.nom}</p>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-navy" onClick={() => setSlide((value) => (value + spotlight.length - 1) % spotlight.length)}>Précédent</button>
                    <button type="button" className="btn btn-gold" onClick={() => setSlide((value) => (value + 1) % spotlight.length)}>Suivant</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
      <div className="container">
        <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtrer par catégorie">
          <button type="button" className={`btn ${categorie ? 'btn-outline-dark' : 'btn-navy'}`} onClick={() => chooseCategory('')}>Tout</button>
          {categories.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`btn ${String(item.id) === categorie ? 'btn-navy' : 'btn-outline-dark'}`}
              onClick={() => chooseCategory(String(item.id))}
            >
              {item.nom}
            </button>
          ))}
        </div>
        {loading && <p role="status">Chargement du catalogue…</p>}
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {!loading && !error && books.length === 0 && (
          <p className="notice p-3">Aucun ouvrage ne correspond à cette recherche. Essayez un autre mot, ou enlevez le filtre de catégorie.</p>
        )}
        <div className="row g-4">
          {books.map((book) => (
            <div className="col-12 col-sm-6 col-lg-4" key={book.id}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
