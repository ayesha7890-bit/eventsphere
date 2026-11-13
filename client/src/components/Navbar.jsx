import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={{ background: '#09090F', borderBottom: '1px solid var(--line)' }}>
      <div
        className="wrap"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}
      >
        <Link
          to="/"
          style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}
        >
          Event<b style={{ color: 'var(--red)' }}>Sphere</b>
        </Link>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          

          {user ? (
            <>
              <span style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
                {user.name} ({user.role})
              </span>
              <button className="btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}