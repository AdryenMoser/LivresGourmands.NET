import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Book from './pages/Book';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Login from './pages/Login';
import Register from './pages/Register';
import Gift from './pages/Gift';
import Account from './pages/Account';
import Dashboard from './pages/Dashboard';
import Missing from './pages/Missing';

function Guard({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <Layout>
        <div className="container">
          <p className="alert alert-warning" role="alert">Cette page est réservée à un autre rôle.</p>
        </div>
      </Layout>
    );
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/ouvrage/:id" element={<Book />} />
      <Route path="/panier" element={<Cart />} />
      <Route path="/commande" element={<Guard roles={['client']}><Checkout /></Guard>} />
      <Route path="/paiement/:reference" element={<Payment />} />
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />
      <Route path="/liste" element={<Gift />} />
      <Route path="/compte" element={<Guard><Account /></Guard>} />
      <Route path="/admin" element={<Guard roles={['editeur', 'gestionnaire', 'administrateur']}><Dashboard /></Guard>} />
      <Route path="*" element={<Missing />} />
    </Routes>
  );
}
