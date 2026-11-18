import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--text)' : 'var(--muted)',
    fontWeight: isActive ? 600 : 400,
    fontSize: '.92rem',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
    borderBottom: isActive ? '2px solid var(--red)' : '2px solid transparent',
    transition: 'all 0.2s ease'
  });

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(9, 9, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div
        className="wrap"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 70
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.45rem',
            fontWeight: 700,
            color: 'var(--text)',
            textDecoration: 'none',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--red)',
              boxShadow: '0 0 10px var(--red)'
            }}
          />
          Event<b style={{ color: 'var(--red)' }}>Sphere</b>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <NavLink to="/expos" style={navLinkStyle}>
            Expos
          </NavLink>
{user?.role === 'admin' && (
  <NavLink to="/admin" style={navLinkStyle}>Admin Panel</NavLink>
)}
          {user?.role === 'exhibitor' && (
            <>
              <NavLink to="/my-applications" style={navLinkStyle}>
                My Applications
              </NavLink>
              <NavLink to="/profile" style={navLinkStyle}>
                Profile
              </NavLink>
            </>
          )}
        </div>
        <NavLink to="/exhibitors" style={navLinkStyle}>
  Exhibitors
</NavLink>

{user?.role === 'attendee' && (
  <NavLink to="/my-schedule" style={navLinkStyle}>
    My Schedule
  </NavLink>
)}

        {/* User Info & Auth Actions */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {user ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--line)',
                  fontSize: '.85rem'
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--red)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '.75rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {user.name?.charAt(0) || 'U'}
                </span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{user.name}</span>
                <span
                  style={{
                    fontSize: '.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '2px 7px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--muted)'
                  }}
                >
                  {user.role}
                </span>
              </div>

              <button
                className="btn"
                onClick={handleLogout}
                style={{
                  padding: '7px 16px',
                  fontSize: '.85rem',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontSize: '.9rem',
                  padding: '7px 14px'
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn"
                style={{
                  padding: '8px 18px',
                  fontSize: '.9rem',
                  borderRadius: 6
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}