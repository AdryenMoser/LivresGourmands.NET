import { Link } from 'react-router-dom';
import { money } from '../format';

const tones = ['#c69c6d', '#17102c', '#8d6a45', '#3d4a2a', '#5c4a6e'];

export default function BookCard({ book }) {
  const tone = tones[book.id % tones.length];
  return (
    <article className="book-card h-100 d-flex flex-column">
      <div className="cover" style={{ backgroundColor: tone }}>
        <strong>{book.titre}</strong>
      </div>
      <div className="p-3 d-flex flex-column flex-grow-1">
        <p className="text-secondary mb-1">{book.auteur}</p>
        <p className="small text-uppercase mb-2" style={{ letterSpacing: '0.08em' }}>{book.categorie?.nom}</p>
        <p className="mt-auto mb-2 fw-semibold">{money(book.prix)}</p>
        <Link className="btn btn-gold" to={`/ouvrage/${book.id}`}>Voir l’ouvrage</Link>
      </div>
    </article>
  );
}
