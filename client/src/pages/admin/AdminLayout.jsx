import { NavLink, Outlet } from 'react-router-dom';
import './admin.css';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/expos', label: 'Expos' },
  { to: '/admin/applications', label: 'Applications' },
  { to: '/admin/booths', label: 'Booths' },
  { to: '/admin/schedule', label: 'Schedule' }
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <h3>Admin panel</h3>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => 'admin-link' + (isActive ? ' active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
      </aside>
      {/* Yahan child page (Dashboard, Expos...) dikhta hai */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
