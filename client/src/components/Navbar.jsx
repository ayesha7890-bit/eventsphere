import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Har role ko kaun se links nazar aayenge (doc ke hisaab se)
function getLinks(user) {
  const common = [
    { to: '/expos', label: 'Expos' },
    { to: '/exhibitors', label: 'Exhibitors' }
  ];

  if (!user) return common;

  if (user.role === 'admin') {
    return [{ to: '/expos', label: 'Expos' }, { to: '/admin', label: 'Admin Panel' }];
  }
  if (user.role === 'exhibitor') {
    return [
      ...common,
      { to: '/my-applications', label: 'My Applications' },
      { to: '/messages', label: 'Inquiries' },
      { to: '/profile', label: 'Profile' }
    ];
  }
  // attendee
  return [
    ...common,
    { to: '/my-schedule', label: 'My Schedule' },
    { to: '/messages', label: 'Messages' }
  ];
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = getLinks(user);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <span className="nav-dot" />
          Event<b>Sphere</b>
        </Link>

        {/* Saare links ek hi jagah, logo ke saath */}
        <div className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right side: login ya user ki maloomat */}
        <div className="nav-right">
          {user ? (
            <>
              <div className="nav-user">
                <span className="nav-avatar">{user.name?.charAt(0) || 'U'}</span>
                <span className="nav-name">{user.name}</span>
                <span className="nav-role">{user.role}</span>
              </div>
              <button className="btn nav-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">Login</Link>
              <Link to="/register" className="btn nav-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}