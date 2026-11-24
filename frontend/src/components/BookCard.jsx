import { Link } from 'react-router-dom';
import { coverFor } from '../covers';
import { money } from '../format';

export default function BookCard({ book }) {
  return (
    <article className="book-card h-100 d-flex flex-column">
      <img className="cover-photo" src={coverFor(book.titre)} alt={`Couverture de ${book.titre}`} />
      <div className="p-3 d-flex flex-column flex-grow-1">
        <p className="text-secondary mb-1">{book.auteur}</p>
        <p className="small text-uppercase mb-2" style={{ letterSpacing: '0.08em' }}>{book.categorie?.nom}</p>
        <p className="mt-auto mb-2 fw-semibold">{money(book.prix)}</p>
        <Link className="btn btn-gold" to={`/ouvrage/${book.id}`}>Voir l’ouvrage</Link>
      </div>
    </article>
  );
}
